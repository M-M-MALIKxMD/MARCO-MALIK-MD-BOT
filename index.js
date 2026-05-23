/**
 * ╔════════════════════════════════════════╗
 * ║       MARCO MALIK MD WHATSAPP BOT      ║
 * ║         Version 12.0.0 - Official      ║
 * ║      Powered By: Marco Malik           ║
 * ╚════════════════════════════════════════╝
 */

require('dotenv').config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecodeChild,
  proto,
  getContentType,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const config = require('./config');
const handler = require('./lib/handler');
const { logger } = require('./lib/logger');
const { connectDB } = require('./lib/db');

// ─── In-Memory Store ─────────────────────────────────────────────────────────
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }).child({ level: 'silent' }) });

// ─── Start Web Panel ──────────────────────────────────────────────────────────
require('./panel/server');

// ─── Main Bot Connect ─────────────────────────────────────────────────────────
async function startBot() {
  const sessionDir = path.join(__dirname, 'session');
  await fs.ensureDir(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(chalk.cyan(`\n╔══════════════════════════════════════╗`));
  logger.info(chalk.cyan(`║   🤖 ${config.botName} v${config.botVersion}  ║`));
  logger.info(chalk.cyan(`║      Powered By: ${config.poweredBy}         ║`));
  logger.info(chalk.cyan(`╚══════════════════════════════════════╝\n`));
  logger.info(chalk.yellow(`⚡ Using Baileys version: ${version.join('.')}`));
  logger.info(chalk.green(`🔗 Connecting to WhatsApp...\n`));

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: [config.botName, 'Chrome', '120.0.0'],
    markOnlineOnConnect: true,
    syncFullHistory: false,
    getMessage: async (key) => {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    },
  });

  store.bind(sock.ev);

  // ─── Connection Update ──────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info(chalk.yellow('📱 Scan QR code above with WhatsApp to login.'));
    }

    if (connection === 'close') {
      const shouldReconnect =
        new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;

      logger.warn(chalk.red(`❌ Connection closed. Reconnecting: ${shouldReconnect}`));

      if (shouldReconnect) {
        setTimeout(() => startBot(), 5000);
      } else {
        logger.error(chalk.red('🚨 Logged out. Please re-scan QR code.'));
        await fs.remove(path.join(__dirname, 'session'));
        startBot();
      }
    }

    if (connection === 'open') {
      logger.info(chalk.green(`\n✅ ${config.botName} is now CONNECTED!\n`));
      logger.info(chalk.cyan(`👑 Owner: ${config.ownerName}`));
      logger.info(chalk.cyan(`🤖 Bot: ${config.botName}`));
      logger.info(chalk.cyan(`🌐 Mode: ${config.botMode.toUpperCase()}`));
      logger.info(chalk.cyan(`⚡ Prefix: ${config.prefix}\n`));
    }
  });

  // ─── Credentials Update ─────────────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── Messages ───────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe && config.botMode === 'self') continue;

      try {
        await handler(sock, msg, store);
      } catch (err) {
        logger.error(chalk.red(`[Handler Error]: ${err.message}`));
      }
    }
  });

  // ─── Group Updates ──────────────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const groupMeta = await sock.groupMetadata(id).catch(() => null);
    if (!groupMeta) return;

    const groupName = groupMeta.subject;

    for (const jid of participants) {
      const user = jid.split('@')[0];

      if (action === 'add') {
        const welcomeText = `╔════════════════════╗\n║  🌟 Welcome to the Group! 🌟  ║\n╠════════════════════╣\n║ 👋 @${user}\n║ 📌 Group: ${groupName}\n║ 📅 Joined: ${new Date().toLocaleDateString()}\n╚════════════════════╝\n\n${config.footer()}`;
        await sock.sendMessage(id, { text: welcomeText, mentions: [jid] });
      }

      if (action === 'remove') {
        const byeText = `╔════════════════════╗\n║  😢 Member Left the Group  ║\n╠════════════════════╣\n║ 👋 @${user}\n║ 📌 Group: ${groupName}\n╚════════════════════╝\n\n${config.footer()}`;
        await sock.sendMessage(id, { text: byeText, mentions: [jid] });
      }
    }
  });

  // ─── Auto-Read & Auto-Typing ─────────────────────────────────────────────────
  if (config.autoRead) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        await sock.readMessages([msg.key]).catch(() => {});
      }
    });
  }

  return sock;
}

// ─── Connect DB and Start ─────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
    await startBot();
  } catch (err) {
    logger.error(chalk.red(`[Startup Error]: ${err.message}`));
    process.exit(1);
  }
})();
