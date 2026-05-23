const config = require('../../config');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');
const sharp = require('sharp');

const tmpDir = path.join(__dirname, '../../tmp');

// ─── MP4 TO MP3 ───────────────────────────────────────────────────────────────
const mp4tomp3 = async (sock, msg) => {
  if (!msg.quoted || msg.quoted.type !== 'videoMessage') {
    return msg.reply(`❗ Reply to a video to convert to MP3.\n\n${config.footer()}`);
  }
  await msg.reply('🔄 Converting MP4 → MP3...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await msg.quoted.download();
    const outPath = path.join(tmpDir, `${uuidv4()}.mp3`);
    execSync(`ffmpeg -i "${filePath}" -vn -acodec libmp3lame -q:a 2 "${outPath}"`, { timeout: 60000 });
    await msg.sendAudio(outPath);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── MP3 TO MP4 (with static image) ──────────────────────────────────────────
const mp3tomp4 = async (sock, msg) => {
  if (!msg.quoted || !['audioMessage', 'voiceMessage'].includes(msg.quoted.type)) {
    return msg.reply(`❗ Reply to an audio to convert to MP4.\n\n${config.footer()}`);
  }
  await msg.reply('🔄 Converting MP3 → MP4...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await msg.quoted.download();
    const outPath = path.join(tmpDir, `${uuidv4()}.mp4`);
    execSync(`ffmpeg -f lavfi -i color=c=black:s=320x240 -i "${filePath}" -shortest -c:v libx264 -c:a aac "${outPath}"`, { timeout: 120000 });
    await msg.sendVideo(outPath, `🎬 *Converted Audio → Video*\n\n${config.footer()}`);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── IMAGE TO WEBP (STICKER) ──────────────────────────────────────────────────
const imgtowebp = async (sock, msg) => {
  if (!msg.quoted || msg.quoted.type !== 'imageMessage') {
    return msg.reply(`❗ Reply to an image to convert to WebP.\n\n${config.footer()}`);
  }
  await msg.reply('🔄 Converting Image → WebP...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await msg.quoted.download();
    const outPath = path.join(tmpDir, `${uuidv4()}.webp`);
    await sharp(filePath).webp().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await msg.sendSticker(buf);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── TEXT TO IMAGE ────────────────────────────────────────────────────────────
const text2img = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}text2img <text>\n\n${config.footer()}`);
  await msg.reply('🔄 Converting text to image...');
  try {
    const width = 800;
    const lines = text.match(/.{1,50}/g) || [text];
    const height = lines.length * 50 + 80;
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <text x="20" y="50" font-family="monospace" font-size="22" fill="#e0e0e0">
        ${lines.map((l, i) => `<tspan x="20" dy="${i === 0 ? 0 : 30}">${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>`).join('')}
      </text>
    </svg>`;
    const outPath = path.join(tmpDir, `${uuidv4()}.png`);
    await fs.ensureDir(tmpDir);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, {
      image: buf,
      caption: `📝 *Text → Image*\n\n${config.footer()}`,
    }, { quoted: msg });
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── UNIT CONVERTERS ─────────────────────────────────────────────────────────
const kgtolbs = async (sock, msg) => {
  const kg = parseFloat(msg.args[0]);
  if (isNaN(kg)) return msg.reply(`Usage: ${config.prefix}kgtolbs <kg>\n\n${config.footer()}`);
  await msg.reply(`⚖️ *KG → LBS*\n\n${kg} kg = *${(kg * 2.20462).toFixed(4)} lbs*\n\n${config.footer()}`);
};

const lbstokg = async (sock, msg) => {
  const lbs = parseFloat(msg.args[0]);
  if (isNaN(lbs)) return msg.reply(`Usage: ${config.prefix}lbstokg <lbs>\n\n${config.footer()}`);
  await msg.reply(`⚖️ *LBS → KG*\n\n${lbs} lbs = *${(lbs / 2.20462).toFixed(4)} kg*\n\n${config.footer()}`);
};

const kmtomile = async (sock, msg) => {
  const km = parseFloat(msg.args[0]);
  if (isNaN(km)) return msg.reply(`Usage: ${config.prefix}kmtomile <km>\n\n${config.footer()}`);
  await msg.reply(`📏 *KM → Miles*\n\n${km} km = *${(km * 0.621371).toFixed(4)} miles*\n\n${config.footer()}`);
};

const miletokm = async (sock, msg) => {
  const mi = parseFloat(msg.args[0]);
  if (isNaN(mi)) return msg.reply(`Usage: ${config.prefix}miletokm <miles>\n\n${config.footer()}`);
  await msg.reply(`📏 *Miles → KM*\n\n${mi} miles = *${(mi / 0.621371).toFixed(4)} km*\n\n${config.footer()}`);
};

const ctof = async (sock, msg) => {
  const c = parseFloat(msg.args[0]);
  if (isNaN(c)) return msg.reply(`Usage: ${config.prefix}ctof <celsius>\n\n${config.footer()}`);
  await msg.reply(`🌡️ *Celsius → Fahrenheit*\n\n${c}°C = *${(c * 9/5 + 32).toFixed(2)}°F*\n\n${config.footer()}`);
};

const ftoc = async (sock, msg) => {
  const f = parseFloat(msg.args[0]);
  if (isNaN(f)) return msg.reply(`Usage: ${config.prefix}ftoc <fahrenheit>\n\n${config.footer()}`);
  await msg.reply(`🌡️ *Fahrenheit → Celsius*\n\n${f}°F = *${((f - 32) * 5/9).toFixed(2)}°C*\n\n${config.footer()}`);
};

// ─── NUMBER CONVERTERS ────────────────────────────────────────────────────────
const bin = async (sock, msg) => {
  const n = parseInt(msg.args[0]);
  if (isNaN(n)) return msg.reply(`Usage: ${config.prefix}bin <decimal>\n\n${config.footer()}`);
  await msg.reply(`🔢 *Decimal → Binary*\n\n${n} = *${n.toString(2)}*\n\n${config.footer()}`);
};

const hex = async (sock, msg) => {
  const n = parseInt(msg.args[0]);
  if (isNaN(n)) return msg.reply(`Usage: ${config.prefix}hex <decimal>\n\n${config.footer()}`);
  await msg.reply(`🔢 *Decimal → Hex*\n\n${n} = *0x${n.toString(16).toUpperCase()}*\n\n${config.footer()}`);
};

const oct = async (sock, msg) => {
  const n = parseInt(msg.args[0]);
  if (isNaN(n)) return msg.reply(`Usage: ${config.prefix}oct <decimal>\n\n${config.footer()}`);
  await msg.reply(`🔢 *Decimal → Octal*\n\n${n} = *0o${n.toString(8)}*\n\n${config.footer()}`);
};

const roman = async (sock, msg) => {
  const n = parseInt(msg.args[0]);
  if (isNaN(n) || n < 1 || n > 3999) return msg.reply(`Usage: ${config.prefix}roman <1-3999>\n\n${config.footer()}`);
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  let num = n;
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  await msg.reply(`🏛️ *Roman Numerals*\n\n${n} = *${result}*\n\n${config.footer()}`);
};

module.exports = {
  mp4tomp3, mp3tomp4, imgtowebp, text2img,
  kgtolbs, lbstokg, kmtomile, miletokm, ctof, ftoc,
  bin, hex, oct, roman,
};
