const config = require('../../config');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ─── MY IP ────────────────────────────────────────────────────────────────────
const myip = async (sock, msg) => {
  await msg.reply('🌐 Fetching your IP info...');
  try {
    const { data } = await axios.get('https://ipapi.co/json/', { timeout: 10000 });
    const text = `🌐 *IP Information*\n\n📍 IP: ${data.ip}\n🗺️ Country: ${data.country_name}\n🏙️ City: ${data.city}\n📮 Postal: ${data.postal}\n🌐 ISP: ${data.org}\n🕐 Timezone: ${data.timezone}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Could not fetch IP.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── GEOIP ────────────────────────────────────────────────────────────────────
const geoip = async (sock, msg) => {
  const ip = msg.args[0];
  if (!ip) return msg.reply(`Usage: ${config.prefix}geoip <IP address>\n\n${config.footer()}`);
  await msg.reply(`🌍 Geolocating: *${ip}*...`);
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 10000 });
    if (data.status !== 'success') return msg.reply(`❌ Could not geolocate IP.`);
    const text = `🌍 *GeoIP: ${ip}*\n\n🗺️ Country: ${data.country}\n🏙️ Region: ${data.regionName}\n🏘️ City: ${data.city}\n📍 Lat/Lon: ${data.lat}, ${data.lon}\n🌐 ISP: ${data.isp}\n🕐 Timezone: ${data.timezone}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ GeoIP failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── UUID GENERATOR ───────────────────────────────────────────────────────────
const uuid = async (sock, msg) => {
  const count = Math.min(parseInt(msg.args[0]) || 1, 10);
  const ids = Array.from({ length: count }, () => uuidv4());
  await msg.reply(`🔑 *Generated UUID(s)*\n\n\`\`\`\n${ids.join('\n')}\n\`\`\`\n\n${config.footer()}`);
};

// ─── HASHES ───────────────────────────────────────────────────────────────────
const md5 = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}md5 <text>\n\n${config.footer()}`);
  const h = crypto.createHash('md5').update(text).digest('hex');
  await msg.reply(`🔑 *MD5 Hash*\n\nInput: ${text}\nHash: \`${h}\`\n\n${config.footer()}`);
};

const sha256 = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}sha256 <text>\n\n${config.footer()}`);
  const h = crypto.createHash('sha256').update(text).digest('hex');
  await msg.reply(`🔑 *SHA256 Hash*\n\nInput: ${text}\nHash: \`${h}\`\n\n${config.footer()}`);
};

// ─── BASE64 ───────────────────────────────────────────────────────────────────
const base64enc = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}base64enc <text>\n\n${config.footer()}`);
  const enc = Buffer.from(text).toString('base64');
  await msg.reply(`🔒 *Base64 Encoded*\n\n\`${enc}\`\n\n${config.footer()}`);
};

const base64dec = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}base64dec <base64>\n\n${config.footer()}`);
  try {
    const dec = Buffer.from(text, 'base64').toString('utf-8');
    await msg.reply(`🔓 *Base64 Decoded*\n\n${dec}\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Invalid Base64 string.\n\n${config.footer()}`);
  }
};

// ─── URL ENCODE / DECODE ──────────────────────────────────────────────────────
const urlencode = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}urlencode <text>\n\n${config.footer()}`);
  await msg.reply(`🔗 *URL Encoded*\n\n\`${encodeURIComponent(text)}\`\n\n${config.footer()}`);
};

const urldecode = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}urldecode <encoded>\n\n${config.footer()}`);
  try {
    await msg.reply(`🔗 *URL Decoded*\n\n${decodeURIComponent(text)}\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Invalid URL encoded string.\n\n${config.footer()}`);
  }
};

// ─── LOREM IPSUM ─────────────────────────────────────────────────────────────
const lorem = async (sock, msg) => {
  const words = parseInt(msg.args[0]) || 50;
  const base = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  const arr = base.split(' ');
  const count = Math.min(words, 200);
  let result = '';
  while (result.split(' ').length < count) result += base + ' ';
  result = result.split(' ').slice(0, count).join(' ');
  await msg.reply(`📝 *Lorem Ipsum (${count} words)*\n\n${result}\n\n${config.footer()}`);
};

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────────
const passcheck = async (sock, msg) => {
  const pass = msg.body;
  if (!pass) return msg.reply(`Usage: ${config.prefix}passcheck <password>\n\n${config.footer()}`);
  let score = 0;
  const checks = {
    '✅ Length ≥ 8': pass.length >= 8,
    '✅ Length ≥ 12': pass.length >= 12,
    '✅ Has lowercase': /[a-z]/.test(pass),
    '✅ Has uppercase': /[A-Z]/.test(pass),
    '✅ Has numbers': /\d/.test(pass),
    '✅ Has symbols': /[!@#$%^&*(),.?":{}|<>]/.test(pass),
  };
  for (const v of Object.values(checks)) if (v) score++;
  const strength = score <= 2 ? '🔴 Weak' : score <= 4 ? '🟡 Medium' : '🟢 Strong';
  const report = Object.entries(checks).map(([k, v]) => `${v ? k : k.replace('✅', '❌')} `).join('\n');
  await msg.reply(`🔑 *Password Strength*\n\n${report}\n\n💪 Strength: *${strength}* (${score}/6)\n\n${config.footer()}`);
};

// ─── COLOR INFO ───────────────────────────────────────────────────────────────
const color = async (sock, msg) => {
  const hex = msg.args[0]?.replace('#', '') || 'ff5733';
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return msg.reply(`Usage: ${config.prefix}color <hex code>\nExample: .color ff5733\n\n${config.footer()}`);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const hsl = (() => {
    const nr = r / 255, ng = g / 255, nb = b / 255;
    const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case nr: h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6; break;
        case ng: h = ((nb - nr) / d + 2) / 6; break;
        case nb: h = ((nr - ng) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  })();
  const text = `🎨 *Color Info: #${hex.toUpperCase()}*\n\n🔴 R: ${r}\n🟢 G: ${g}\n🔵 B: ${b}\n\nHEX: #${hex.toUpperCase()}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${hsl})\n\n${config.footer()}`;
  await msg.reply(text);
};

// ─── JS RUNNER ────────────────────────────────────────────────────────────────
const jsrun = async (sock, msg) => {
  const code = msg.body || msg.quoted?.text;
  if (!code) return msg.reply(`Usage: ${config.prefix}jsrun <js code>\n\n${config.footer()}`);
  try {
    const result = eval(`(async () => { ${code} })()`);
    const val = result instanceof Promise ? await result : result;
    await msg.reply(`✅ *JS Output*\n\n\`\`\`\n${JSON.stringify(val, null, 2) || 'undefined'}\n\`\`\`\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ JS Error:\n\`\`\`\n${err.message}\n\`\`\`\n\n${config.footer()}`);
  }
};

module.exports = {
  myip, geoip, uuid, md5, sha256, base64enc, base64dec, urlencode, urldecode, lorem, passcheck, color, jsrun,
};
