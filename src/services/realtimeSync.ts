import { Product, CustomerSale, StockPurchase, ScrapInventoryItem, MerchantKhataRecord, ActivityLog } from '../types';

export interface StoreState {
  products: Product[];
  sales: CustomerSale[];
  purchases: StockPurchase[];
  scrapInventory: ScrapInventoryItem[];
  khataRecords: MerchantKhataRecord[];
  activityLogs: ActivityLog[];
  lastUpdated?: string;
  updatedBy?: string;
  actionDescription?: string;
}

export interface SyncNotification {
  id: string;
  timestamp: string;
  senderRole: string;
  description: string;
  type: 'sale' | 'product' | 'khata' | 'stock' | 'reset' | 'general';
}

type SyncCallback = (data: StoreState, notification?: SyncNotification) => void;
type StatusCallback = (status: 'connected' | 'connecting' | 'offline', clientCount: number) => void;

class RealtimeSyncManager {
  private socket: WebSocket | null = null;
  private sse: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private clientId: string;
  private callbacks: Set<SyncCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private status: 'connected' | 'connecting' | 'offline' = 'connecting';
  private clientCount: number = 1;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;

  constructor() {
    // Unique ID for this client/device tab
    try {
      let storedId = sessionStorage.getItem('osr_client_id');
      if (!storedId) {
        storedId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem('osr_client_id', storedId);
      }
      this.clientId = storedId;
    } catch {
      this.clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    // Initialize cross-tab BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('osr_realtime_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.senderId !== this.clientId) {
            this.handleIncomingData(event.data.data, event.data.notification);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public getClientId(): string {
    return this.clientId;
  }

  public getStatus(): { status: 'connected' | 'connecting' | 'offline'; clientCount: number } {
    return { status: this.status, clientCount: this.clientCount };
  }

  public subscribe(callback: SyncCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  public subscribeStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    callback(this.status, this.clientCount);
    return () => this.statusCallbacks.delete(callback);
  }

  private setStatus(status: 'connected' | 'connecting' | 'offline', count = this.clientCount) {
    this.status = status;
    this.clientCount = count;
    this.statusCallbacks.forEach((cb) => cb(status, count));
  }

  public connect() {
    if (this.isDestroyed || typeof window === 'undefined') return;

    // Clear any pending reconnect
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        // Register client
        this.sendWsMessage({
          type: 'CLIENT_REGISTER',
          clientId: this.clientId,
          role: sessionStorage.getItem('osr_owner_auth') === 'true' ? 'Owner' : 'Staff'
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'INIT_STATE') {
            if (message.data) {
              this.handleIncomingData(message.data);
            }
            if (typeof message.clientCount === 'number') {
              this.clientCount = Math.max(1, message.clientCount);
              this.setStatus('connected', this.clientCount);
            }
          } else if (message.type === 'REMOTE_UPDATE') {
            if (message.senderId !== this.clientId) {
              const notification: SyncNotification | undefined = message.notification || (message.actionDescription ? {
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                senderRole: message.senderRole || 'Remote User',
                description: message.actionDescription,
                type: message.updateType || 'general',
              } : undefined);

              this.handleIncomingData(message.data, notification);
            }
          } else if (message.type === 'PRESENCE_UPDATE') {
            if (typeof message.clientCount === 'number') {
              this.clientCount = Math.max(1, message.clientCount);
              this.setStatus(this.status, this.clientCount);
            }
          }
        } catch (err) {
          console.warn('Error parsing WS message:', err);
        }
      };

      this.socket.onerror = () => {
        // Fall back to SSE or HTTP polling
        this.setupSSEFallback();
      };

      this.socket.onclose = () => {
        this.socket = null;
        if (!this.isDestroyed) {
          this.setStatus('offline');
          this.scheduleReconnect();
          this.setupSSEFallback();
        }
      };
    } catch {
      this.setupSSEFallback();
    }
  }

  private setupSSEFallback() {
    if (this.sse || this.isDestroyed || typeof window === 'undefined') return;

    try {
      this.sse = new EventSource('/api/events');
      this.sse.onopen = () => {
        this.setStatus('connected');
      };
      this.sse.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'REMOTE_UPDATE' && message.senderId !== this.clientId) {
            this.handleIncomingData(message.data, message.notification);
          } else if (message.type === 'INIT_STATE' && message.data) {
            this.handleIncomingData(message.data);
          }
        } catch (e) {
          console.warn('SSE parse error', e);
        }
      };
      this.sse.onerror = () => {
        if (this.sse) {
          this.sse.close();
          this.sse = null;
        }
      };
    } catch {
      // SSE not available
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimer) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private sendWsMessage(msg: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(msg));
        return true;
      } catch (err) {
        console.warn('Failed to send WS message:', err);
      }
    }
    return false;
  }

  private handleIncomingData(data: StoreState, notification?: SyncNotification) {
    if (!data) return;
    this.callbacks.forEach((cb) => {
      try {
        cb(data, notification);
      } catch (err) {
        console.error('Error in sync callback:', err);
      }
    });
  }

  /**
   * Broadcast state changes to other devices (Staff -> Owner or Owner -> Staff)
   */
  public broadcastChange(
    state: StoreState,
    actionDescription: string,
    senderRole: string,
    updateType: SyncNotification['type'] = 'general'
  ) {
    const notification: SyncNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      senderRole,
      description: actionDescription,
      type: updateType,
    };

    const payload = {
      ...state,
      lastUpdated: new Date().toISOString(),
      updatedBy: senderRole,
      actionDescription,
    };

    // 1. Broadcast locally across tabs via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.clientId,
          data: payload,
          notification,
        });
      } catch (e) {
        console.warn('BroadcastChannel postMessage error:', e);
      }
    }

    // 2. Broadcast across devices via WebSocket
    const wsSent = this.sendWsMessage({
      type: 'BROADCAST_STATE',
      senderId: this.clientId,
      senderRole,
      actionDescription,
      updateType,
      data: payload,
      notification,
    });

    // 3. In parallel, persist to backend HTTP endpoint
    fetch('/api/store/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: this.clientId,
        senderRole,
        actionDescription,
        updateType,
        data: payload,
        notification,
      }),
    }).catch((err) => {
      console.warn('HTTP store sync fallback notice:', err);
    });
  }

  /**
   * Fetch full state from server on app startup
   */
  public async fetchServerState(): Promise<StoreState | null> {
    try {
      const res = await fetch('/api/store', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (err) {
      console.warn('Could not fetch server state:', err);
    }
    return null;
  }

  /**
   * Request full store reset across all connected staff and owner devices
   */
  public async resetAllDevices(performedBy: string) {
    const resetNotification: SyncNotification = {
      id: `notif-reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      senderRole: performedBy,
      description: 'Store was completely reset to a clean slate (0 products, 0 dues).',
      type: 'reset',
    };

    const emptyData: StoreState = {
      products: [],
      sales: [],
      purchases: [],
      scrapInventory: [],
      khataRecords: [],
      activityLogs: [
        {
          id: `log-reset-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'stock_adjusted',
          title: 'Store Reset: Clean Slate Initiated',
          details: 'All products, sales records, customer dues, and purchases cleared across all devices.',
          performedBy,
        },
      ],
      lastUpdated: new Date().toISOString(),
      updatedBy: performedBy,
      actionDescription: 'Complete Store Reset',
    };

    // Broadcast via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.clientId,
          data: emptyData,
          notification: resetNotification,
        });
      } catch (e) {
        console.warn(e);
      }
    }

    // Broadcast via WS
    this.sendWsMessage({
      type: 'RESET_STORE',
      senderId: this.clientId,
      senderRole: performedBy,
      data: emptyData,
      notification: resetNotification,
    });

    // Send HTTP reset
    try {
      await fetch('/api/store/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: this.clientId,
          performedBy,
          data: emptyData,
          notification: resetNotification,
        }),
      });
    } catch (e) {
      console.warn(e);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}

// Global Singleton
export const realtimeSync = new RealtimeSyncManager();
