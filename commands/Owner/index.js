const config = require('../../config');
const { banUser, unbanUser, addPremium, removePremium, db, saveDB } = require('../../lib/db');
const { logger } = require('../../lib/logger');
const fs = require('fs-extra');
const os = require('os');

const ownerOnly = (fn) => async (sock, msg) => {
  if (!msg.isOwner) return msg.reply(`❌ This command is for *Owner Only*.\n\n${config.footer()}`);
  return fn(sock, msg);
};

// ─── BOT CONTROL ─────────────────────────────────────────────────────────────

const shutdown = ownerOnly(async (sock, msg) => {
  await msg.reply(`🔴 *${config.botName}* is shutting down...\n\n${config.footer()}`);
  process.exit(0);
});

const restart = ownerOnly(async (sock, msg) => {
  await msg.reply(`🔄 *${config.botName}* is restarting...\n\n${config.footer()}`);
  process.exit(1);
});

const setname = ownerOnly(async (sock, msg) => {
  const name = msg.body;
  if (!name) return msg.reply(`Usage: ${config.prefix}setname <name>`);
  await sock.updateProfileName(name);
  await msg.reply(`✅ Bot name updated to: *${name}*\n\n${config.footer()}`);
});

const setbio = ownerOnly(async (sock, msg) => {
  const bio = msg.body;
  if (!bio) return msg.reply(`Usage: ${config.prefix}setbio <bio>`);
  await sock.updateProfileStatus(bio);
  await msg.reply(`✅ Bot bio updated!\n\n${config.footer()}`);
});

const setpp = ownerOnly(async (sock, msg) => {
  if (!msg.quoted?.message) return msg.reply(`❗ Quote an image to set as bot profile picture.`);
  const { filePath } = await msg.quoted.download();
  const img = await fs.readFile(filePath);
  await sock.updateProfilePicture(sock.user.id, img);
  await msg.reply(`✅ Bot profile picture updated!\n\n${config.footer()}`);
  await fs.remove(filePath);
});

const getpp = ownerOnly(async (sock, msg) => {
  const target = msg.args[0]
    ? msg.args[0].replace(/\D/g, '') + '@s.whatsapp.net'
    : msg.sender;
  const ppUrl = await sock.profilePictureUrl(target, 'image').catch(() => null);
  if (!ppUrl) return msg.reply(`❌ No profile picture found.`);
  await msg.sendImage(ppUrl, `👤 Profile picture of @${target.split('@')[0]}\n\n${config.footer()}`);
});

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

const ban = ownerOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}ban @user`);
  banUser(target);
  await msg.reply(`✅ User @${target.split('@')[0]} has been *banned*.\n\n${config.footer()}`, { mentions: [target] });
});

const unban = ownerOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}unban @user`);
  unbanUser(target);
  await msg.reply(`✅ User @${target.split('@')[0]} has been *unbanned*.\n\n${config.footer()}`, { mentions: [target] });
});

const banlist = ownerOnly(async (sock, msg) => {
  const list = db.banned;
  if (!list.length) return msg.reply(`✅ No banned users.\n\n${config.footer()}`);
  const text = list.map((j, i) => `${i + 1}. @${j.split('@')[0]}`).join('\n');
  await msg.reply(`📋 *Banned Users (${list.length}):*\n\n${text}\n\n${config.footer()}`, { mentions: list });
});

const addpremium = ownerOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}addpremium @user`);
  addPremium(target);
  await msg.reply(`⭐ User @${target.split('@')[0]} is now *Premium*!\n\n${config.footer()}`, { mentions: [target] });
});

const delpremium = ownerOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}delpremium @user`);
  removePremium(target);
  await msg.reply(`✅ Premium removed from @${target.split('@')[0]}.\n\n${config.footer()}`, { mentions: [target] });
});

const premiumlist = ownerOnly(async (sock, msg) => {
  const list = db.premium;
  if (!list.length) return msg.reply(`❌ No premium users.\n\n${config.footer()}`);
  const text = list.map((j, i) => `${i + 1}. @${j.split('@')[0]}`).join('\n');
  await msg.reply(`⭐ *Premium Users (${list.length}):*\n\n${text}\n\n${config.footer()}`, { mentions: list });
});

// ─── BROADCAST ────────────────────────────────────────────────────────────────

const broadcast = ownerOnly(async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}broadcast <message>`);
  const groups = Object.keys(db.groups);
  let sent = 0;
  for (const jid of groups) {
    await sock.sendMessage(jid, { text: `📢 *Broadcast from ${config.ownerName}:*\n\n${text}\n\n${config.footer()}` })
      .then(() => sent++)
      .catch(() => {});
  }
  await msg.reply(`✅ Broadcast sent to *${sent}* groups.\n\n${config.footer()}`);
});

// ─── GROUP MANAGEMENT (OWNER) ─────────────────────────────────────────────────

const gjoin = ownerOnly(async (sock, msg) => {
  const link = msg.args[0];
  if (!link) return msg.reply(`Usage: ${config.prefix}gjoin <invite_link>`);
  const code = link.split('https://chat.whatsapp.com/')[1];
  if (!code) return msg.reply(`❌ Invalid WhatsApp group link.`);
  await sock.groupAcceptInvite(code);
  await msg.reply(`✅ Successfully joined the group!\n\n${config.footer()}`);
});

const gleave = ownerOnly(async (sock, msg) => {
  const jid = msg.args[0] || msg.jid;
  await sock.groupLeave(jid);
  await msg.reply(`✅ Left the group.\n\n${config.footer()}`);
});

const glist = ownerOnly(async (sock, msg) => {
  const groups = await sock.groupFetchAllParticipating();
  const list = Object.values(groups).map((g, i) => `${i + 1}. ${g.subject} (${g.participants.length} members)`).join('\n');
  await msg.reply(`📋 *Groups (${Object.keys(groups).length}):*\n\n${list}\n\n${config.footer()}`);
});

// ─── SYSTEM ───────────────────────────────────────────────────────────────────

const stats = ownerOnly(async (sock, msg) => {
  const totalUsers = Object.keys(db.users).length;
  const totalGroups = Object.keys(db.groups).length;
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const mem = process.memoryUsage();
  const text = `📊 *${config.botName} Statistics*

👥 Total Users: ${totalUsers}
🏘️ Total Groups: ${totalGroups}
⛔ Banned Users: ${db.banned.length}
⭐ Premium Users: ${db.premium.length}
⏱️ Uptime: ${h}h ${m}m ${s}s
💾 RAM Usage: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB
🖥️ OS: ${os.type()} ${os.arch()}
🟢 Node: ${process.version}

${config.footer()}`;
  await msg.reply(text);
});

const setmode = ownerOnly(async (sock, msg) => {
  const mode = msg.args[0];
  if (!['public', 'private', 'self'].includes(mode)) {
    return msg.reply(`Usage: ${config.prefix}setmode <public|private|self>`);
  }
  config.botMode = mode;
  await msg.reply(`✅ Bot mode set to: *${mode.toUpperCase()}*\n\n${config.footer()}`);
});

const cleardb = ownerOnly(async (sock, msg) => {
  db.users = {};
  db.groups = {};
  db.banned = [];
  db.premium = [];
  db.antispam = {};
  db.economy = {};
  db.warns = {};
  await saveDB();
  await msg.reply(`✅ Database cleared successfully!\n\n${config.footer()}`);
});

const cleartmp = ownerOnly(async (sock, msg) => {
  const tmpDir = require('path').join(__dirname, '../../tmp');
  await fs.emptyDir(tmpDir);
  await msg.reply(`✅ Temp files cleared!\n\n${config.footer()}`);
});

const memory = ownerOnly(async (sock, msg) => {
  const mem = process.memoryUsage();
  const text = `💾 *Memory Usage*

  Heap Used:  ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB
  Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB
  RSS:        ${(mem.rss / 1024 / 1024).toFixed(2)} MB
  External:   ${(mem.external / 1024 / 1024).toFixed(2)} MB
  OS Free:    ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
  OS Total:   ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB

${config.footer()}`;
  await msg.reply(text);
});

const speed = ownerOnly(async (sock, msg) => {
  const start = Date.now();
  await msg.reply('⚡ Testing...');
  const end = Date.now();
  await msg.reply(`⚡ *Speed Test*\n\n🕐 Response Time: *${end - start}ms*\n\n${config.footer()}`);
});

const evalcmd = ownerOnly(async (sock, msg) => {
  const code = msg.body;
  if (!code) return msg.reply(`Usage: ${config.prefix}eval <code>`);
  try {
    let result = eval(`(async () => { ${code} })()`);
    if (result instanceof Promise) result = await result;
    await msg.reply(`✅ Result:\n\`\`\`${JSON.stringify(result, null, 2)}\`\`\`\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Error:\n\`\`\`${err.message}\`\`\`\n\n${config.footer()}`);
  }
});

const exec = ownerOnly(async (sock, msg) => {
  const cmd = msg.body;
  if (!cmd) return msg.reply(`Usage: ${config.prefix}exec <command>`);
  const { execSync } = require('child_process');
  try {
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 10000 });
    await msg.reply(`✅ Output:\n\`\`\`${result}\`\`\`\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Error:\n\`\`\`${err.message}\`\`\`\n\n${config.footer()}`);
  }
});

module.exports = {
  shutdown,
  restart,
  setname,
  setbio,
  setpp,
  getpp,
  ban,
  unban,
  banlist,
  addpremium,
  delpremium,
  premiumlist,
  broadcast,
  gjoin,
  gleave,
  glist,
  stats,
  setmode,
  cleardb,
  cleartmp,
  memory,
  speed,
  eval: evalcmd,
  exec,
};
