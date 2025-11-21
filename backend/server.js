require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventManager = require('./event-manager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../frontend');

// Middleware
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Initialize Event Manager
const eventManager = new EventManager();

// WebSocket connection handling
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'state',
    state: eventManager.getCurrentState()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Process event through event manager
      const result = eventManager.processEvent(data);

      // Broadcast to all clients
      broadcastToClients(result);
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// REST API Routes

// Get current state
app.get('/api/state', (req, res) => {
  res.json({
    state: eventManager.getCurrentState(),
    uptime: process.uptime()
  });
});

// Trigger an event
app.post('/api/event', (req, res) => {
  try {
    const event = req.body;

    if (!event.type) {
      return res.status(400).json({
        error: 'Event type is required'
      });
    }

    const result = eventManager.processEvent(event);

    // Broadcast to all WebSocket clients
    broadcastToClients(result);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Get available animations
app.get('/api/animations', (req, res) => {
  res.json(eventManager.getAvailableAnimations());
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    clients: clients.size,
    currentState: eventManager.getCurrentState()
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Handle event manager state changes
eventManager.on('stateChange', (newState) => {
  console.log('State changed to:', newState);
  broadcastToClients({
    type: 'stateChange',
    state: newState,
    timestamp: Date.now()
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🤖 Robo-Face server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Character: ${process.env.CHARACTER || 'robo-face'}`);
  console.log(`   Target FPS: ${process.env.TARGET_FPS || 30}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
