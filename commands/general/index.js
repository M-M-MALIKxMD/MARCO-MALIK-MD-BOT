const config = require('../../config');
const { buildMenu, categoryMenus, randomMenuImage } = require('../../lib/menu');
const { timeNow, dateNow } = require('../../lib/utils');

// Count total commands
const getTotalCommands = () => {
  const files = [
    '../owner', '../group', '../fun', '../media', '../downloader',
    '../ai', '../search', '../tools', '../sticker', '../game',
    '../utility', '../converter', '../tech', '../general',
  ];
  let count = 0;
  for (const f of files) {
    try { count += Object.keys(require(f)).length; } catch {}
  }
  return count;
};

// ─── MAIN MENU ────────────────────────────────────────────────────────────────
const menu = async (sock, msg) => {
  const cat = msg.args[0]?.toLowerCase();
  const imgUrl = randomMenuImage();

  if (cat && categoryMenus[cat]) {
    const text = categoryMenus[cat](config.botName);
    try {
      await sock.sendMessage(msg.jid, {
        image: { url: imgUrl },
        caption: text,
      }, { quoted: msg });
    } catch {
      await msg.reply(text);
    }
    return;
  }

  const total = getTotalCommands();
  const menuText = buildMenu(config.ownerName, config.botName, total);
  try {
    await sock.sendMessage(msg.jid, {
      image: { url: imgUrl },
      caption: menuText,
    }, { quoted: msg });
  } catch {
    await msg.reply(menuText);
  }
};

// ─── HELP ────────────────────────────────────────────────────────────────────
const help = menu;

// ─── ABOUT ────────────────────────────────────────────────────────────────────
const about = async (sock, msg) => {
  const text = `🔱 *About ${config.botName}*

🤖 This is a professional WhatsApp MD Bot built with Node.js and Baileys.

📋 *Details:*
• Name: ${config.botName}
• Version: ${config.botVersion}
• Owner: ${config.ownerName}
• Prefix: ${config.prefix}
• Built with: Node.js & Baileys
• Commands: 600+

📢 *Channel:* ${config.channelLink}
👑 *Owner Contact:* wa.me/${config.ownerNumber}

${config.footer()}`;
  await msg.reply(text);
};

// ─── CHANNEL ─────────────────────────────────────────────────────────────────
const channel = async (sock, msg) => {
  await msg.reply(`📢 *${config.channelName}*\n\nJoin our official channel for bot updates, announcements & more!\n\n🔗 ${config.channelLink}\n\n${config.footer()}`);
};

// ─── OWNER ────────────────────────────────────────────────────────────────────
const owner = async (sock, msg) => {
  await msg.reply(`👑 *Bot Owner*\n\n👤 Name: ${config.ownerName}\n📱 Contact: wa.me/${config.ownerNumber}\n📢 Channel: ${config.channelLink}\n\n${config.footer()}`);
};

// ─── PRIVACY ─────────────────────────────────────────────────────────────────
const privacy = async (sock, msg) => {
  const text = `🔒 *Privacy Policy*

• This bot does not store your personal messages.
• Media downloads are cached temporarily and deleted after 10 minutes.
• User data (XP, coins, warns) is stored locally for gameplay purposes only.
• Your number is never shared with third parties.
• By using this bot, you agree to responsible usage.
• The bot owner reserves the right to ban users for misuse.

${config.footer()}`;
  await msg.reply(text);
};

// ─── RULES ────────────────────────────────────────────────────────────────────
const rules = async (sock, msg) => {
  const text = `📜 *Bot Usage Rules*

1️⃣ Do not spam commands — you will be banned.
2️⃣ Do not use the bot for illegal activities.
3️⃣ Do not share NSFW content without permission.
4️⃣ Respect other users in groups.
5️⃣ Do not attempt to hack or crash the bot.
6️⃣ Owner commands are restricted — do not attempt to exploit them.
7️⃣ Report bugs to the owner instead of exploiting them.
8️⃣ The owner can ban any user without explanation.

⚠️ *Violation of rules = Permanent Ban*

${config.footer()}`;
  await msg.reply(text);
};

// ─── DONATE ───────────────────────────────────────────────────────────────────
const donate = async (sock, msg) => {
  await msg.reply(`💝 *Support ${config.botName}*\n\nIf you love this bot and want to support its development, please consider donating!\n\nYour support helps keep the bot running 24/7.\n\n👑 Contact Owner: wa.me/${config.ownerNumber}\n📢 Join Channel: ${config.channelLink}\n\n${config.footer()}`);
};

module.exports = {
  menu, help, about, channel, owner, privacy, rules, donate,
};
