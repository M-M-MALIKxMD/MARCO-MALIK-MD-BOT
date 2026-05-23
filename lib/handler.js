const { serialize } = require('./serialize');
const { logger } = require('./logger');
const { isBanned, getUser, addXP } = require('./db');
const config = require('../config');
const chalk = require('chalk');

// ─── Load All Commands ────────────────────────────────────────────────────────
const commandFiles = [
  '../commands/owner',
  '../commands/group',
  '../commands/fun',
  '../commands/media',
  '../commands/downloader',
  '../commands/ai',
  '../commands/search',
  '../commands/tools',
  '../commands/sticker',
  '../commands/game',
  '../commands/utility',
  '../commands/converter',
  '../commands/tech',
  '../commands/general',
];

const commands = {};

for (const file of commandFiles) {
  try {
    const mod = require(file);
    for (const [cmd, fn] of Object.entries(mod)) {
      commands[cmd.toLowerCase()] = fn;
    }
  } catch (err) {
    logger.error(`[Loader Error] ${file}: ${err.message}`);
  }
}

logger.success(`✅ Loaded ${Object.keys(commands).length} commands`);

// ─── Anti Spam Map ────────────────────────────────────────────────────────────
const spamMap = new Map();

function checkSpam(jid) {
  const now = Date.now();
  if (!spamMap.has(jid)) {
    spamMap.set(jid, { count: 1, first: now });
    return false;
  }
  const data = spamMap.get(jid);
  if (now - data.first > config.spamInterval) {
    spamMap.set(jid, { count: 1, first: now });
    return false;
  }
  data.count++;
  if (data.count > config.spamLimit) return true;
  return false;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
async function handler(sock, rawMsg, store) {
  const msg = serialize(sock, rawMsg, store);

  if (!msg.isCmd) return;

  const { cmd, jid, sender, senderNumber, isOwner, reply, react } = msg;

  // ─── Auto Typing ───────────────────────────────────────────────────────────
  if (config.autoTyping) {
    await sock.sendPresenceUpdate('composing', jid).catch(() => {});
  }

  // ─── Banned Check ──────────────────────────────────────────────────────────
  if (isBanned(sender) && !isOwner) {
    return await reply(`❌ You are banned from using *${config.botName}*.\nContact the owner for help.`);
  }

  // ─── Anti Spam ─────────────────────────────────────────────────────────────
  if (config.antiSpam && !isOwner && checkSpam(sender)) {
    return await reply('⚠️ You are sending commands too fast! Please slow down.');
  }

  // ─── Bot Mode Check ────────────────────────────────────────────────────────
  if (config.botMode === 'private' && !isOwner) {
    return await reply(`🔒 *${config.botName}* is in private mode.\nOnly the owner can use commands.`);
  }

  // ─── Command Lookup ────────────────────────────────────────────────────────
  const fn = commands[cmd];

  if (!fn) {
    return await reply(
      `❌ Command *${config.prefix}${cmd}* not found.\nType *${config.prefix}menu* to see all commands.\n\n${config.footer()}`
    );
  }

  // ─── Logging ───────────────────────────────────────────────────────────────
  logger.cmd(
    chalk.magenta(`[CMD] `) +
    chalk.white(`${config.prefix}${cmd}`) +
    chalk.gray(` | from: ${senderNumber} | chat: ${jid.split('@')[0]}`)
  );

  // ─── Execute ───────────────────────────────────────────────────────────────
  try {
    await react('⏳');
    await fn(sock, msg);
    await react('✅');

    // ─── XP System ─────────────────────────────────────────────────────────
    const { leveledUp, level } = addXP(sender, 5);
    if (leveledUp) {
      await reply(`🎉 Congratulations! You reached *Level ${level}*!\n\n${config.footer()}`);
    }
  } catch (err) {
    logger.error(`[CMD Error] ${config.prefix}${cmd}: ${err.message}`);
    await react('❌');
    await reply(`❌ Error executing command *${config.prefix}${cmd}*\n\`${err.message}\`\n\n${config.footer()}`);
  }

  // ─── Stop Typing ───────────────────────────────────────────────────────────
  if (config.autoTyping) {
    await sock.sendPresenceUpdate('paused', jid).catch(() => {});
  }
}

module.exports = handler;
