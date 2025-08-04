import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws' // Use a specific path to avoid conflicts with Vite's WebSocket
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    // Send initial connection message
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to live updates' }));

    // Handle client messages (if needed)
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received from client:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    // Clean up on disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  console.log('WebSocket server initialized');
}

// Broadcast update to all connected clients
export function broadcastUpdate(eventType: string, data?: any) {
  const message = JSON.stringify({
    type: 'update',
    eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`Broadcasted ${eventType} to ${clients.size} clients`);
}

// Notify clients to refetch specific queries
export function notifyRefetch(queryKeys: string[]) {
  const message = JSON.stringify({
    type: 'refetch',
    queryKeys,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}