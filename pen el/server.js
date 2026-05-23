const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('../config');
const { logger } = require('../lib/logger');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/status', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'online',
    bot: config.botName,
    version: config.botVersion,
    owner: config.ownerName,
    mode: config.botMode,
    uptime: Math.floor(process.uptime()),
    memory: {
      used: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      total: (mem.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
    },
    node: process.version,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    botName: config.botName,
    ownerName: config.ownerName,
    channelLink: config.channelLink,
    prefix: config.prefix,
    poweredBy: config.poweredBy,
    version: config.botVersion,
  });
});

// ─── Socket.IO Live Updates ────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.emit('bot-info', {
    botName: config.botName,
    ownerName: config.ownerName,
    version: config.botVersion,
    mode: config.botMode,
    prefix: config.prefix,
    channelLink: config.channelLink,
    poweredBy: config.poweredBy,
  });

  const interval = setInterval(() => {
    socket.emit('stats', {
      uptime: Math.floor(process.uptime()),
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      timestamp: new Date().toLocaleTimeString(),
    });
  }, 3000);

  socket.on('disconnect', () => clearInterval(interval));
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = config.port || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  logger.success(`🌐 Web Panel running at: http://localhost:${PORT}`);
});

module.exports = app;
