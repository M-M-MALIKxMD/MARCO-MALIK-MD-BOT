require('dotenv').config();

const config = {
  // ==========================================
  //   MARCO MALIK BOT - MAIN CONFIGURATION
  // ==========================================

  // Bot Identity
  botName: process.env.BOT_NAME || 'MARCO MALIK MD BOT',
  botVersion: process.env.BOT_VERSION || '12.0.0',
  prefix: process.env.PREFIX || '.',

  // Owner Settings
  ownerName: process.env.OWNER_NAME || 'MARCO MALIK',
  ownerNumber: process.env.OWNER_NUMBER || '923706328012',
  ownerNumber2: process.env.OWNER_NUMBER_2 || '923377857866',
  ownerJid: (process.env.OWNER_NUMBER || '923706328012') + '@s.whatsapp.net',

  // Branding
  poweredBy: process.env.POWERED_BY || 'Marco Malik',
  channelLink: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029Vb2RnBlHgZWeOydeRV1H',
  channelName: process.env.CHANNEL_NAME || 'Marco Malik Channel',

  // Newsletter / Token
  newsletterId: process.env.NEWSLETTER_ID || '120363369769257255@newsletter',
  botToken: process.env.BOT_TOKEN || 'MarcoMalikBot',

  // Session
  sessionId: process.env.SESSION_ID || 'MARCO_MALIK_&_SYED-MD~',

  // AI Keys
  openaiKey: process.env.OPENAI_API_KEY || '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',
  geminiKey: process.env.GEMINI_API_KEY || 'AIzaSyA4gBy38IXKU1cd75x3DFzGxsliMdFD_xM',

  // Bot Mode
  botMode: process.env.BOT_MODE || 'public', // public / private

  // Auto Features
  autoRead: process.env.AUTO_READ === 'true',
  autoTyping: process.env.AUTO_TYPING !== 'false',
  autoRecording: process.env.AUTO_RECORDING === 'true',
  autoStatusView: process.env.AUTO_STATUS_VIEW === 'true',

  // Anti Features
  antiSpam: process.env.ANTI_SPAM !== 'false',
  antiLink: process.env.ANTI_LINK === 'true',
  antiNsfw: process.env.ANTI_NSFW === 'false',

  // Port
  port: parseInt(process.env.PORT) || 3000,

  // Timezone
  timezone: process.env.TZ || 'Asia/Karachi',

  // Database
  mongoUri: process.env.MONGODB_URI || '',

  // ==========================================
  //   MENU CONFIGURATION
  // ==========================================
  menuImages: [
    'https://i.ibb.co/W4zLyRMV/file-00000000a3847207b1166e2db04833ef.png',
    'https://i.ibb.co/W4zLyRMV/file-00000000a3847207b1166e2db04833ef.png',
    'https://i.ibb.co/W4zLyRMV/file-00000000a3847207b1166e2db04833ef.png',
    'https://i.ibb.co/W4zLyRMV/file-00000000a3847207b1166e2db04833ef.png',
    'https://i.ibb.co/W4zLyRMV/file-00000000a3847207b1166e2db04833ef.png',
  ],

  menuStyle: 'dark', // dark / light / royal

  // ==========================================
  //   FOOTER TEXT
  // ==========================================
  footer: (custom = '') =>
    `\n╚══════════════════╝\n🔱 *Powered By ${process.env.POWERED_BY || 'Marco Malik'}*\n📢 Channel: ${process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/your_link'}\n${custom}`,

  // ==========================================
  //   COMMAND CATEGORIES
  // ==========================================
  categories: {
    owner: '👑 Owner',
    group: '👥 Group',
    fun: '🎉 Fun',
    media: '📽️ Media',
    downloader: '⬇️ Downloader',
    ai: '🤖 AI',
    search: '🔍 Search',
    tools: '🛠️ Tools',
    sticker: '🎭 Sticker',
    game: '🎮 Game',
    utility: '⚙️ Utility',
    converter: '🔄 Converter',
    tech: '💻 Tech',
    general: '💬 General',
  },

  // ==========================================
  //   ANTI-SPAM SETTINGS
  // ==========================================
  spamLimit: 5,
  spamInterval: 10000,

  // ==========================================
  //   REACTION EMOJIS
  // ==========================================
  reactions: {
    wait: '⏳',
    success: '✅',
    error: '❌',
    loading: '🔄',
  },
};

module.exports = config;
