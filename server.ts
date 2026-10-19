import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoreData {
  products: any[];
  sales: any[];
  purchases: any[];
  scrapInventory: any[];
  khataRecords: any[];
  activityLogs: any[];
  lastUpdated: string;
  updatedBy: string;
  actionDescription: string;
}

const DATA_DIR = path.resolve(__dirname, 'data_store');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store initialized from disk or clean empty slate
let currentStore: StoreData = {
  products: [],
  sales: [],
  purchases: [],
  scrapInventory: [],
  khataRecords: [],
  activityLogs: [],
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System',
  actionDescription: 'Clean Slate Initialized',
};

// Try loading existing stored data
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      currentStore = {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        sales: Array.isArray(parsed.sales) ? parsed.sales : [],
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
        scrapInventory: Array.isArray(parsed.scrapInventory) ? parsed.scrapInventory : [],
        khataRecords: Array.isArray(parsed.khataRecords) ? parsed.khataRecords : [],
        activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        updatedBy: parsed.updatedBy || 'Disk Storage',
        actionDescription: parsed.actionDescription || 'Loaded from disk',
      };
      console.log(`[Store] Loaded existing store data from disk (${currentStore.products.length} products, ${currentStore.sales.length} sales).`);
    }
  } else {
    // Write clean slate
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentStore, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('[Store] Could not load stored data, starting clean:', err);
}

// Helper to write store safely to disk
let saveTimeout: NodeJS.Timeout | null = null;
function persistStoreDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(currentStore, null, 2), 'utf-8');
      console.log(`[Store] Persisted to ${DATA_FILE}`);
    } catch (err) {
      console.error('[Store] Failed to write store to disk:', err);
    }
  }, 300);
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrades exclusively for /ws, cleanly terminating any Vite HMR attempts
  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch {
      socket.destroy();
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '25mb' }));

  // Track connected SSE clients
  const sseClients: express.Response[] = [];

  function broadcastSSE(data: any) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch {
        // Handled in client close
      }
    });
  }

  // Broadcast WebSocket message to all or other clients
  function broadcastWS(msg: any, excludeClientId?: string) {
    const raw = JSON.stringify(msg);
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        if (!excludeClientId || client.__clientId !== excludeClientId) {
          try {
            client.send(raw);
          } catch (e) {
            console.warn('[WS] Send error:', e);
          }
        }
      }
    });
  }

  function getOnlineCount(): number {
    return Math.max(1, wss.clients.size);
  }

  // WebSocket connection handler
  wss.on('connection', (ws: any, req) => {
    ws.__clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[WS] Client connected: ${ws.__clientId} from ${req.socket.remoteAddress}. Total: ${wss.clients.size}`);

    // Send initial state to newly connected client
    try {
      ws.send(
        JSON.stringify({
          type: 'INIT_STATE',
          data: currentStore,
          clientCount: getOnlineCount(),
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('[WS] Error sending init:', e);
    }

    // Broadcast updated presence to all clients
    broadcastWS({
      type: 'PRESENCE_UPDATE',
      clientCount: getOnlineCount(),
    });

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());

        if (parsed.type === 'CLIENT_REGISTER') {
          if (parsed.clientId) {
            ws.__clientId = parsed.clientId;
          }
          ws.__role = parsed.role || 'Staff';
          console.log(`[WS] Registered client ${ws.__clientId} as ${ws.__role}`);
        } else if (parsed.type === 'BROADCAST_STATE') {
          const { senderId, senderRole, actionDescription, updateType, data, notification } = parsed;
          if (data && typeof data === 'object') {
            currentStore = {
              products: Array.isArray(data.products) ? data.products : currentStore.products,
              sales: Array.isArray(data.sales) ? data.sales : currentStore.sales,
              purchases: Array.isArray(data.purchases) ? data.purchases : currentStore.purchases,
              scrapInventory: Array.isArray(data.scrapInventory) ? data.scrapInventory : currentStore.scrapInventory,
              khataRecords: Array.isArray(data.khataRecords) ? data.khataRecords : currentStore.khataRecords,
              activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs : currentStore.activityLogs,
              lastUpdated: new Date().toISOString(),
              updatedBy: senderRole || ws.__role || 'Staff',
              actionDescription: actionDescription || 'Live Update',
            };
            persistStoreDebounced();

            // Broadcast to all other devices in real-time
            broadcastWS(
              {
                type: 'REMOTE_UPDATE',
                senderId: senderId || ws.__clientId,
                senderRole: senderRole || ws.__role,
                actionDescription,
                updateType,
                data: currentStore,
                notification,
                timestamp: new Date().toISOString(),
              },
              senderId || ws.__clientId
            );

            // Also send to SSE clients
            broadcastSSE({
              type: 'REMOTE_UPDATE',
              senderId: senderId || ws.__clientId,
              senderRole: senderRole || ws.__role,
              actionDescription,
              data: currentStore,
              notification,
            });
          }
        } else if (parsed.type === 'RESET_STORE') {
          const { senderId, senderRole, notification } = parsed;
          currentStore = {
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
                details: 'All products, sales records, customer dues, and purchases cleared.',
                performedBy: senderRole || 'Store Manager',
              },
            ],
            lastUpdated: new Date().toISOString(),
            updatedBy: senderRole || 'Store Manager',
            actionDescription: 'Complete Store Reset',
          };
          persistStoreDebounced();

          broadcastWS(
            {
              type: 'REMOTE_UPDATE',
              senderId: senderId || ws.__clientId,
              senderRole: senderRole || ws.__role,
              actionDescription: 'Complete Store Reset',
              updateType: 'reset',
              data: currentStore,
              notification,
              timestamp: new Date().toISOString(),
            },
            senderId || ws.__clientId
          );

          broadcastSSE({
            type: 'REMOTE_UPDATE',
            senderId: senderId || ws.__clientId,
            senderRole: senderRole || ws.__role,
            actionDescription: 'Complete Store Reset',
            data: currentStore,
            notification,
          });
        }
      } catch (err) {
        console.error('[WS] Message handling error:', err);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected: ${ws.__clientId}. Remaining: ${wss.clients.size}`);
      broadcastWS({
        type: 'PRESENCE_UPDATE',
        clientCount: getOnlineCount(),
      });
    });
  });

  // REST API Routes

  // 1. Get current shared store
  app.get('/api/store', (_req, res) => {
    res.json({
      success: true,
      data: currentStore,
      onlineClients: getOnlineCount(),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. HTTP sync fallback (Staff or Owner pushes an update)
  app.post('/api/store/sync', (req, res) => {
    const { senderId, senderRole, actionDescription, updateType, data, notification } = req.body;

    if (data && typeof data === 'object') {
      currentStore = {
        products: Array.isArray(data.products) ? data.products : currentStore.products,
        sales: Array.isArray(data.sales) ? data.sales : currentStore.sales,
        purchases: Array.isArray(data.purchases) ? data.purchases : currentStore.purchases,
        scrapInventory: Array.isArray(data.scrapInventory) ? data.scrapInventory : currentStore.scrapInventory,
        khataRecords: Array.isArray(data.khataRecords) ? data.khataRecords : currentStore.khataRecords,
        activityLogs: Array.isArray(data.activityLogs) ? data.activityLogs : currentStore.activityLogs,
        lastUpdated: new Date().toISOString(),
        updatedBy: senderRole || 'App Client',
        actionDescription: actionDescription || 'HTTP Live Update',
      };
      persistStoreDebounced();

      // Broadcast to all WebSocket clients (except sender)
      broadcastWS(
        {
          type: 'REMOTE_UPDATE',
          senderId,
          senderRole,
          actionDescription,
          updateType,
          data: currentStore,
          notification,
          timestamp: new Date().toISOString(),
        },
        senderId
      );

      // Broadcast to SSE clients
      broadcastSSE({
        type: 'REMOTE_UPDATE',
        senderId,
        senderRole,
        actionDescription,
        data: currentStore,
        notification,
      });
    }

    res.json({ success: true, timestamp: new Date().toISOString() });
  });

  // 3. HTTP store reset endpoint
  app.post('/api/store/reset', (req, res) => {
    const { senderId, performedBy, notification } = req.body;
    currentStore = {
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
          performedBy: performedBy || 'Store Manager',
        },
      ],
      lastUpdated: new Date().toISOString(),
      updatedBy: performedBy || 'Store Manager',
      actionDescription: 'Complete Store Reset',
    };
    persistStoreDebounced();

    broadcastWS(
      {
        type: 'REMOTE_UPDATE',
        senderId,
        senderRole: performedBy,
        actionDescription: 'Complete Store Reset',
        updateType: 'reset',
        data: currentStore,
        notification,
        timestamp: new Date().toISOString(),
      },
      senderId
    );

    broadcastSSE({
      type: 'REMOTE_UPDATE',
      senderId,
      senderRole: performedBy,
      actionDescription: 'Complete Store Reset',
      data: currentStore,
      notification,
    });

    res.json({ success: true, message: 'Store reset successfully across all devices.' });
  });

  // 4. Server-Sent Events stream fallback
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Initial event
    res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', data: currentStore })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // 5. Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      onlineDevices: getOnlineCount(),
      productsCount: currentStore.products.length,
      salesCount: currentStore.sales.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Vite or static build
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted for development mode (HMR disabled)');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production static files from ${distPath}`);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Om Sai Ram Server running on http://0.0.0.0:${port} (WebSocket at /ws)`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
