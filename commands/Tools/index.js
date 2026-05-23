const config = require('../../config');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { isUrl } = require('../../lib/utils');

// ─── WEBSITE SCREENSHOT ───────────────────────────────────────────────────────
const screenshot = async (sock, msg) => {
  const url = msg.args[0];
  if (!url || !isUrl(url)) return msg.reply(`Usage: ${config.prefix}screenshot <URL>\n\n${config.footer()}`);
  await msg.reply(`📸 Taking screenshot of: *${url}*...`);
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const imgBuffer = await page.screenshot({ fullPage: false });
    await browser.close();
    await sock.sendMessage(msg.jid, {
      image: imgBuffer,
      caption: `📸 *Screenshot*\n🔗 URL: ${url}\n\n${config.footer()}`,
    }, { quoted: msg });
  } catch (err) {
    await msg.reply(`❌ Screenshot failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── HTML TO WEBSITE ──────────────────────────────────────────────────────────
const html2web = async (sock, msg) => {
  const html = msg.body || msg.quoted?.text;
  if (!html) return msg.reply(`Usage: ${config.prefix}html2web <html code>\n\n${config.footer()}`);
  await msg.reply('🌐 Hosting HTML...');
  try {
    const { data } = await axios.post(
      'https://api.github.com/gists',
      {
        files: { 'index.html': { content: html } },
        public: true,
        description: `${config.botName} - HTML Preview`,
      },
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    const rawUrl = data.files['index.html'].raw_url;
    const previewUrl = `https://htmlpreview.github.io/?${rawUrl}`;
    await msg.reply(`✅ *HTML Preview Ready!*\n\n🔗 Live URL:\n${previewUrl}\n\n${config.footer()}`);
  } catch {
    // Fallback: use htmledit.squarefree.com style
    const b64 = Buffer.from(html).toString('base64');
    await msg.reply(`✅ *Your HTML is ready*\n\nCopy & paste the HTML into:\n🔗 https://codepen.io/pen\nor\n🔗 https://jsfiddle.net\n\n${config.footer()}`);
  }
};

// ─── VIEW SOURCE CODE ─────────────────────────────────────────────────────────
const srcview = async (sock, msg) => {
  const url = msg.args[0];
  if (!url || !isUrl(url)) return msg.reply(`Usage: ${config.prefix}srcview <URL>\n\n${config.footer()}`);
  await msg.reply(`📄 Fetching source code of: *${url}*...`);
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    });
    const src = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const preview = src.slice(0, 2000);
    await msg.reply(`📄 *Source Code of ${url}*\n\n\`\`\`html\n${preview}\n\`\`\`\n\n_(Showing first 2000 chars)_\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Could not fetch source.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── LINK INFO ────────────────────────────────────────────────────────────────
const linkinfo = async (sock, msg) => {
  const url = msg.args[0];
  if (!url || !isUrl(url)) return msg.reply(`Usage: ${config.prefix}linkinfo <URL>\n\n${config.footer()}`);
  await msg.reply('🔍 Analyzing URL...');
  try {
    const { data, headers, request } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxRedirects: 10,
      timeout: 15000,
    });
    const $ = cheerio.load(typeof data === 'string' ? data : '');
    const title = $('title').text() || 'N/A';
    const desc = $('meta[name="description"]').attr('content') || 'N/A';
    const finalUrl = request?.res?.responseUrl || url;
    const text = `🔗 *Link Info*\n\n📌 Original: ${url}\n📍 Final URL: ${finalUrl}\n🏷️ Title: ${title}\n📝 Description: ${desc.slice(0, 200)}\n📏 Content-Type: ${headers['content-type'] || 'N/A'}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Could not analyze link.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── WHOIS ────────────────────────────────────────────────────────────────────
const whois = async (sock, msg) => {
  const domain = msg.args[0]?.replace(/https?:\/\//, '').split('/')[0];
  if (!domain) return msg.reply(`Usage: ${config.prefix}whois <domain>\n\n${config.footer()}`);
  await msg.reply(`🔍 WHOIS lookup: *${domain}*...`);
  try {
    const { data } = await axios.get(`https://api.whoapi.com/?domain=${domain}&r=whois&apikey=demokey`, { timeout: 15000 });
    await msg.reply(`🌐 *WHOIS: ${domain}*\n\n${JSON.stringify(data, null, 2).slice(0, 1500)}\n\n${config.footer()}`);
  } catch {
    await msg.reply(`🌐 *WHOIS: ${domain}*\n\n🔗 Check at: https://who.is/whois/${domain}\n\n${config.footer()}`);
  }
};

// ─── IP LOOKUP ────────────────────────────────────────────────────────────────
const iplookup = async (sock, msg) => {
  const ip = msg.args[0];
  if (!ip) return msg.reply(`Usage: ${config.prefix}iplookup <IP address>\n\n${config.footer()}`);
  await msg.reply(`🔍 Looking up IP: *${ip}*...`);
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, { timeout: 15000 });
    if (data.status !== 'success') return msg.reply(`❌ IP lookup failed: ${data.message}`);
    const text = `🌐 *IP Lookup: ${ip}*\n\n🗺️ Country: ${data.country}\n🏙️ Region: ${data.regionName}\n🏘️ City: ${data.city}\n📮 ZIP: ${data.zip}\n📍 Lat/Lon: ${data.lat}, ${data.lon}\n🕐 Timezone: ${data.timezone}\n🌐 ISP: ${data.isp}\n🏢 Org: ${data.org}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ IP lookup failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── IS UP ────────────────────────────────────────────────────────────────────
const isup = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}isup <URL>\n\n${config.footer()}`);
  await msg.reply(`🔍 Checking: *${url}*...`);
  try {
    const start = Date.now();
    const { status } = await axios.get(url, { timeout: 10000, maxRedirects: 5 });
    const time = Date.now() - start;
    await msg.reply(`✅ *${url}*\n\n🟢 Status: *ONLINE* (${status})\n⚡ Response Time: *${time}ms*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ *${url}*\n\n🔴 Status: *OFFLINE or unreachable*\n\n${config.footer()}`);
  }
};

// ─── ENCODE / DECODE ──────────────────────────────────────────────────────────
const encode = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}encode <text>\n\n${config.footer()}`);
  const encoded = Buffer.from(text).toString('base64');
  await msg.reply(`🔒 *Base64 Encoded*\n\n${encoded}\n\n${config.footer()}`);
};

const decode = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}decode <base64>\n\n${config.footer()}`);
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
    await msg.reply(`🔓 *Base64 Decoded*\n\n${decoded}\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Invalid Base64 string.\n\n${config.footer()}`);
  }
};

// ─── HASH ─────────────────────────────────────────────────────────────────────
const hash = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}hash <text>\n\n${config.footer()}`);
  const crypto = require('crypto');
  const md5 = crypto.createHash('md5').update(text).digest('hex');
  const sha1 = crypto.createHash('sha1').update(text).digest('hex');
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  await msg.reply(`#️⃣ *Hash Values*\n\n📝 Input: ${text}\n\n🔑 MD5: ${md5}\n🔑 SHA1: ${sha1}\n🔑 SHA256: ${sha256}\n\n${config.footer()}`);
};

// ─── JSON FORMAT ──────────────────────────────────────────────────────────────
const json = async (sock, msg) => {
  const text = msg.body || msg.quoted?.text;
  if (!text) return msg.reply(`Usage: ${config.prefix}json <json string>\n\n${config.footer()}`);
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);
    await msg.reply(`✅ *Formatted JSON*\n\n\`\`\`json\n${formatted.slice(0, 2000)}\n\`\`\`\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Invalid JSON: ${err.message}\n\n${config.footer()}`);
  }
};

// ─── WORD COUNT ───────────────────────────────────────────────────────────────
const wordcount = async (sock, msg) => {
  const text = msg.body || msg.quoted?.text;
  if (!text) return msg.reply(`Usage: ${config.prefix}wordcount <text>\n\n${config.footer()}`);
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\n+/).length;
  await msg.reply(`📊 *Word Count*\n\n📝 Words: ${words}\n🔤 Characters: ${chars}\n📄 Sentences: ${sentences}\n📋 Paragraphs: ${paragraphs}\n\n${config.footer()}`);
};

// ─── QR CODE ─────────────────────────────────────────────────────────────────
const qr = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}qr <text or URL>\n\n${config.footer()}`);
  await msg.reply('📱 Generating QR code...');
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&format=png`;
    await msg.sendImage(qrUrl, `📱 *QR Code*\n\n📝 Data: ${text}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ QR generation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── EXTRACT LINKS ────────────────────────────────────────────────────────────
const extractlink = async (sock, msg) => {
  const text = msg.body || msg.quoted?.text;
  if (!text) return msg.reply(`Usage: ${config.prefix}extractlink <text>\n\n${config.footer()}`);
  const links = text.match(/https?:\/\/[^\s]+/g) || [];
  if (!links.length) return msg.reply(`❌ No links found in the text.\n\n${config.footer()}`);
  await msg.reply(`🔗 *Extracted Links (${links.length})*\n\n${links.join('\n')}\n\n${config.footer()}`);
};

module.exports = {
  screenshot, html2web, srcview, linkinfo, whois, iplookup, isup,
  encode, decode, hash, json, wordcount, qr, extractlink,
};
