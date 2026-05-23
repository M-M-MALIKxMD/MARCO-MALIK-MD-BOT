const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./logger');

const DB_FILE = path.join(__dirname, '../data/db.json');

let db = {
  users: {},
  groups: {},
  banned: [],
  premium: [],
  antispam: {},
  economy: {},
  warns: {},
  settings: {},
};

async function connectDB() {
  try {
    await fs.ensureDir(path.dirname(DB_FILE));
    if (await fs.pathExists(DB_FILE)) {
      db = await fs.readJson(DB_FILE);
      logger.success('✅ Local database loaded successfully.');
    } else {
      await fs.writeJson(DB_FILE, db, { spaces: 2 });
      logger.success('✅ New database created.');
    }
  } catch (err) {
    logger.error(`[DB Error]: ${err.message}`);
  }
}

async function saveDB() {
  try {
    await fs.writeJson(DB_FILE, db, { spaces: 2 });
  } catch (err) {
    logger.error(`[DB Save Error]: ${err.message}`);
  }
}

function getUser(jid) {
  if (!db.users[jid]) {
    db.users[jid] = {
      jid,
      name: '',
      xp: 0,
      level: 1,
      coins: 0,
      gems: 0,
      warns: 0,
      banned: false,
      premium: false,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
    };
  }
  return db.users[jid];
}

function getGroup(jid) {
  if (!db.groups[jid]) {
    db.groups[jid] = {
      jid,
      name: '',
      antiLink: false,
      antiSpam: false,
      antiNsfw: false,
      welcome: true,
      goodbye: true,
      mute: false,
      locked: false,
      adminOnly: false,
    };
  }
  return db.groups[jid];
}

function isBanned(jid) {
  return db.banned.includes(jid);
}

function isPremium(jid) {
  return db.premium.includes(jid);
}

function banUser(jid) {
  if (!db.banned.includes(jid)) db.banned.push(jid);
  saveDB();
}

function unbanUser(jid) {
  db.banned = db.banned.filter((j) => j !== jid);
  saveDB();
}

function addPremium(jid) {
  if (!db.premium.includes(jid)) db.premium.push(jid);
  saveDB();
}

function removePremium(jid) {
  db.premium = db.premium.filter((j) => j !== jid);
  saveDB();
}

function addXP(jid, amount) {
  const user = getUser(jid);
  user.xp += amount;
  const newLevel = Math.floor(user.xp / 100) + 1;
  const leveledUp = newLevel > user.level;
  user.level = newLevel;
  saveDB();
  return { leveledUp, level: user.level };
}

function addCoins(jid, amount) {
  const user = getUser(jid);
  user.coins += amount;
  saveDB();
}

function getLeaderboard() {
  return Object.values(db.users)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}

module.exports = {
  connectDB,
  saveDB,
  getUser,
  getGroup,
  isBanned,
  isPremium,
  banUser,
  unbanUser,
  addPremium,
  removePremium,
  addXP,
  addCoins,
  getLeaderboard,
  db,
};
