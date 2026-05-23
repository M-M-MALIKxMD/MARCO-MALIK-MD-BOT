const config = require('../../config');
const { getGroup, saveDB } = require('../../lib/db');

const adminOnly = (fn) => async (sock, msg) => {
  if (!msg.isGroup) return msg.reply(`❌ This command can only be used in *groups*.\n\n${config.footer()}`);
  const meta = await msg.getGroupMeta();
  const isAdmin = meta.participants.some(
    (p) => p.id === msg.sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  if (!isAdmin && !msg.isOwner)
    return msg.reply(`❌ This command is for *Group Admins Only*.\n\n${config.footer()}`);
  return fn(sock, msg, meta);
};

// ─── KICK ──────────────────────────────────────────────────────────────────────
const kick = adminOnly(async (sock, msg, meta) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}kick @user`);
  await sock.groupParticipantsUpdate(msg.jid, [target], 'remove');
  await msg.reply(`✅ @${target.split('@')[0]} has been *kicked* from the group.\n\n${config.footer()}`, { mentions: [target] });
});

// ─── ADD ──────────────────────────────────────────────────────────────────────
const add = adminOnly(async (sock, msg) => {
  const num = msg.args[0]?.replace(/\D/g, '');
  if (!num) return msg.reply(`Usage: ${config.prefix}add <number>`);
  const jid = num + '@s.whatsapp.net';
  await sock.groupParticipantsUpdate(msg.jid, [jid], 'add');
  await msg.reply(`✅ @${num} has been *added* to the group.\n\n${config.footer()}`, { mentions: [jid] });
});

// ─── PROMOTE / DEMOTE ─────────────────────────────────────────────────────────
const promote = adminOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}promote @user`);
  await sock.groupParticipantsUpdate(msg.jid, [target], 'promote');
  await msg.reply(`⭐ @${target.split('@')[0]} has been *promoted* to Admin!\n\n${config.footer()}`, { mentions: [target] });
});

const demote = adminOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}demote @user`);
  await sock.groupParticipantsUpdate(msg.jid, [target], 'demote');
  await msg.reply(`✅ @${target.split('@')[0]} has been *demoted*.\n\n${config.footer()}`, { mentions: [target] });
});

// ─── MUTE / UNMUTE ───────────────────────────────────────────────────────────
const mute = adminOnly(async (sock, msg) => {
  await sock.groupSettingUpdate(msg.jid, 'announcement');
  await msg.reply(`🔇 Group has been *muted*. Only admins can send messages.\n\n${config.footer()}`);
});

const unmute = adminOnly(async (sock, msg) => {
  await sock.groupSettingUpdate(msg.jid, 'not_announcement');
  await msg.reply(`🔊 Group has been *unmuted*.\n\n${config.footer()}`);
});

// ─── LOCK / UNLOCK ────────────────────────────────────────────────────────────
const lock = adminOnly(async (sock, msg) => {
  await sock.groupSettingUpdate(msg.jid, 'locked');
  await msg.reply(`🔒 Group settings are now *locked*. Only admins can edit group info.\n\n${config.footer()}`);
});

const unlock = adminOnly(async (sock, msg) => {
  await sock.groupSettingUpdate(msg.jid, 'unlocked');
  await msg.reply(`🔓 Group settings are now *unlocked*.\n\n${config.footer()}`);
});

// ─── GROUP INFO ───────────────────────────────────────────────────────────────
const groupinfo = async (sock, msg) => {
  if (!msg.isGroup) return msg.reply(`❌ Use in a group.`);
  const meta = await msg.getGroupMeta();
  const admins = meta.participants.filter((p) => p.admin).length;
  const created = new Date(meta.creation * 1000).toLocaleDateString();
  const text = `📋 *Group Information*

🏷️ Name: ${meta.subject}
👥 Members: ${meta.participants.length}
👑 Admins: ${admins}
📝 Description: ${meta.desc || 'No description'}
📅 Created: ${created}
🔗 Creator: @${(meta.owner || '').split('@')[0]}

${config.footer()}`;
  await msg.reply(text, { mentions: [meta.owner] });
};

// ─── MEMBER LIST ──────────────────────────────────────────────────────────────
const memberlist = async (sock, msg) => {
  if (!msg.isGroup) return msg.reply(`❌ Use in a group.`);
  const meta = await msg.getGroupMeta();
  const members = meta.participants.map(
    (p, i) => `${i + 1}. @${p.id.split('@')[0]}${p.admin ? ' 👑' : ''}`
  );
  const text = `👥 *Member List (${meta.participants.length})*\n\n${members.join('\n')}\n\n${config.footer()}`;
  await msg.reply(text, { mentions: meta.participants.map((p) => p.id) });
};

// ─── ADMIN LIST ───────────────────────────────────────────────────────────────
const adminlist = async (sock, msg) => {
  if (!msg.isGroup) return msg.reply(`❌ Use in a group.`);
  const meta = await msg.getGroupMeta();
  const admins = meta.participants.filter((p) => p.admin);
  const text = `👑 *Admin List (${admins.length})*\n\n${admins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]}`).join('\n')}\n\n${config.footer()}`;
  await msg.reply(text, { mentions: admins.map((a) => a.id) });
};

// ─── INVITE LINK ─────────────────────────────────────────────────────────────
const invitelink = adminOnly(async (sock, msg) => {
  const code = await sock.groupInviteCode(msg.jid);
  await msg.reply(`🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}\n\n${config.footer()}`);
});

const revoke = adminOnly(async (sock, msg) => {
  await sock.groupRevokeInvite(msg.jid);
  const code = await sock.groupInviteCode(msg.jid);
  await msg.reply(`✅ *Invite link revoked!*\n\nNew link: https://chat.whatsapp.com/${code}\n\n${config.footer()}`);
});

// ─── TAG ALL ──────────────────────────────────────────────────────────────────
const tagall = adminOnly(async (sock, msg, meta) => {
  const text = msg.body || '👋 Hey everyone!';
  const mentions = meta.participants.map((p) => p.id);
  const tags = mentions.map((j) => `@${j.split('@')[0]}`).join(' ');
  await sock.sendMessage(msg.jid, {
    text: `📢 *${text}*\n\n${tags}\n\n${config.footer()}`,
    mentions,
  });
});

const hidetag = adminOnly(async (sock, msg, meta) => {
  const text = msg.body || '👋 Hey everyone!';
  const mentions = meta.participants.map((p) => p.id);
  await sock.sendMessage(msg.jid, {
    text: `📢 *${text}*\n\n${config.footer()}`,
    mentions,
  });
});

// ─── ANTI-LINK TOGGLE ─────────────────────────────────────────────────────────
const antilink = adminOnly(async (sock, msg) => {
  const grp = getGroup(msg.jid);
  grp.antiLink = !grp.antiLink;
  saveDB();
  await msg.reply(`✅ Anti-Link is now *${grp.antiLink ? 'ENABLED' : 'DISABLED'}*.\n\n${config.footer()}`);
});

const antispam = adminOnly(async (sock, msg) => {
  const grp = getGroup(msg.jid);
  grp.antiSpam = !grp.antiSpam;
  saveDB();
  await msg.reply(`✅ Anti-Spam is now *${grp.antiSpam ? 'ENABLED' : 'DISABLED'}*.\n\n${config.footer()}`);
});

const antinsfw = adminOnly(async (sock, msg) => {
  const grp = getGroup(msg.jid);
  grp.antiNsfw = !grp.antiNsfw;
  saveDB();
  await msg.reply(`✅ Anti-NSFW is now *${grp.antiNsfw ? 'ENABLED' : 'DISABLED'}*.\n\n${config.footer()}`);
});

// ─── WELCOME TOGGLE ──────────────────────────────────────────────────────────
const welcome = adminOnly(async (sock, msg) => {
  const grp = getGroup(msg.jid);
  grp.welcome = !grp.welcome;
  saveDB();
  await msg.reply(`✅ Welcome message is now *${grp.welcome ? 'ENABLED' : 'DISABLED'}*.\n\n${config.footer()}`);
});

const goodbye = adminOnly(async (sock, msg) => {
  const grp = getGroup(msg.jid);
  grp.goodbye = !grp.goodbye;
  saveDB();
  await msg.reply(`✅ Goodbye message is now *${grp.goodbye ? 'ENABLED' : 'DISABLED'}*.\n\n${config.footer()}`);
});

// ─── WARN SYSTEM ─────────────────────────────────────────────────────────────
const warn = adminOnly(async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return msg.reply(`Usage: ${config.prefix}warn @user`);
  const { db, saveDB } = require('../../lib/db');
  if (!db.warns[msg.jid]) db.warns[msg.jid] = {};
  if (!db.warns[msg.jid][target]) db.warns[msg.jid][target] = 0;
  db.warns[msg.jid][target]++;
  const warns = db.warns[msg.jid][target];
  saveDB();
  if (warns >= 3) {
    await sock.groupParticipantsUpdate(msg.jid, [target], 'remove');
    await msg.reply(`🚨 @${target.split('@')[0]} has been *kicked* for reaching 3 warns!\n\n${config.footer()}`, { mentions: [target] });
  } else {
    await msg.reply(`⚠️ Warning issued to @${target.split('@')[0]}!\n⚠️ Warns: *${warns}/3*\n\n${config.footer()}`, { mentions: [target] });
  }
});

const warnlist = async (sock, msg) => {
  if (!msg.isGroup) return msg.reply(`❌ Use in a group.`);
  const { db } = require('../../lib/db');
  const warns = db.warns[msg.jid] || {};
  if (!Object.keys(warns).length) return msg.reply(`✅ No warns in this group.\n\n${config.footer()}`);
  const list = Object.entries(warns).map(([j, w]) => `@${j.split('@')[0]}: ${w}/3 warns`).join('\n');
  await msg.reply(`⚠️ *Warn List:*\n\n${list}\n\n${config.footer()}`, { mentions: Object.keys(warns) });
};

const clearwarn = adminOnly(async (sock, msg) => {
  const { db, saveDB } = require('../../lib/db');
  db.warns[msg.jid] = {};
  saveDB();
  await msg.reply(`✅ All warns cleared for this group!\n\n${config.footer()}`);
});

// ─── SET GROUP INFO ───────────────────────────────────────────────────────────
const setdesc = adminOnly(async (sock, msg) => {
  const desc = msg.body;
  if (!desc) return msg.reply(`Usage: ${config.prefix}setdesc <description>`);
  await sock.groupUpdateDescription(msg.jid, desc);
  await msg.reply(`✅ Group description updated!\n\n${config.footer()}`);
});

const seticon = adminOnly(async (sock, msg) => {
  if (!msg.quoted) return msg.reply(`❗ Quote an image to set as group icon.`);
  const { filePath } = await msg.quoted.download();
  const img = await require('fs-extra').readFile(filePath);
  await sock.updateProfilePicture(msg.jid, img);
  await msg.reply(`✅ Group icon updated!\n\n${config.footer()}`);
  require('fs-extra').remove(filePath);
});

const setnamegroup = adminOnly(async (sock, msg) => {
  const name = msg.body;
  if (!name) return msg.reply(`Usage: ${config.prefix}setname <name>`);
  await sock.groupUpdateSubject(msg.jid, name);
  await msg.reply(`✅ Group name updated to: *${name}*\n\n${config.footer()}`);
});

module.exports = {
  kick,
  add,
  promote,
  demote,
  mute,
  unmute,
  lock,
  unlock,
  groupinfo,
  memberlist,
  adminlist,
  invitelink,
  revoke,
  tagall,
  hidetag,
  antilink,
  antispam,
  antinsfw,
  welcome,
  goodbye,
  warn,
  warnlist,
  clearwarn,
  setdesc,
  seticon,
};
