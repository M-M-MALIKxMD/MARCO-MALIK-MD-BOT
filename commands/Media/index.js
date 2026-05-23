const config = require('../../config');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');

const tmpDir = path.join(__dirname, '../../tmp');

const requireImage = async (msg) => {
  const target = msg.quoted || msg;
  if (!['imageMessage', 'stickerMessage'].includes(target.type)) return null;
  await fs.ensureDir(tmpDir);
  return msg.quoted ? await msg.quoted.download() : await msg.download();
};

const requireVideo = async (msg) => {
  const target = msg.quoted || msg;
  if (!['videoMessage'].includes(target.type)) return null;
  await fs.ensureDir(tmpDir);
  return msg.quoted ? await msg.quoted.download() : await msg.download();
};

// ─── SEPIA ────────────────────────────────────────────────────────────────────
const sepia = async (sock, msg) => {
  const dl = await requireImage(msg);
  if (!dl) return msg.reply(`❗ Reply to an image.\n\n${config.footer()}`);
  await msg.reply('✨ Applying sepia effect...');
  try {
    const { filePath } = dl;
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharp(filePath)
      .recomb([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131],
      ])
      .jpeg()
      .toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `🎞️ *Sepia Effect*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Effect failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── RESIZE ───────────────────────────────────────────────────────────────────
const resize = async (sock, msg) => {
  const dl = await requireImage(msg);
  if (!dl) return msg.reply(`❗ Reply to an image.\n\nUsage: Reply to image then .resize <width> <height>\n\n${config.footer()}`);
  const w = parseInt(msg.args[0]) || 512;
  const h = parseInt(msg.args[1]) || 512;
  await msg.reply(`🔄 Resizing image to ${w}x${h}...`);
  try {
    const { filePath } = dl;
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharp(filePath).resize(w, h, { fit: 'fill' }).jpeg().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `📐 *Resized to ${w}x${h}*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Resize failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── WATERMARK ────────────────────────────────────────────────────────────────
const watermark = async (sock, msg) => {
  const dl = await requireImage(msg);
  if (!dl) return msg.reply(`❗ Reply to an image.\n\n${config.footer()}`);
  const text = msg.body || config.botName;
  await msg.reply('💧 Adding watermark...');
  try {
    const { filePath } = dl;
    const meta = await sharp(filePath).metadata();
    const w = meta.width || 512;
    const h = meta.height || 512;
    const svg = `<svg width="${w}" height="${h}">
      <text x="${w/2}" y="${h - 30}" text-anchor="middle" font-size="28" fill="rgba(255,255,255,0.7)" font-family="sans-serif" font-weight="bold">
        ${text.replace(/</g, '&lt;')}
      </text>
    </svg>`;
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharp(filePath).composite([{ input: Buffer.from(svg), gravity: 'south' }]).jpeg().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `💧 *Watermark: ${text}*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Watermark failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── CAPTION COMMAND ─────────────────────────────────────────────────────────
const caption = async (sock, msg) => {
  const dl = await requireImage(msg);
  if (!dl) return msg.reply(`❗ Reply to an image with caption text.\n\n${config.footer()}`);
  const text = msg.body || 'Caption';
  await msg.reply('✍️ Adding caption...');
  try {
    const { filePath } = dl;
    const meta = await sharp(filePath).metadata();
    const w = meta.width || 512;
    const captionH = 80;
    const svg = `<svg width="${w}" height="${captionH}">
      <rect width="${w}" height="${captionH}" fill="#1a1a2e"/>
      <text x="${w/2}" y="${captionH/2 + 8}" text-anchor="middle" font-size="24" fill="white" font-family="sans-serif">
        ${text.slice(0, 60).replace(/</g, '&lt;')}
      </text>
    </svg>`;
    const captionBuf = await sharp(Buffer.from(svg)).png().toBuffer();
    const imgBuf = await sharp(filePath).resize({ width: w }).toBuffer();
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharp({ create: { width: w, height: (meta.height || 512) + captionH, channels: 3, background: '#000' } })
      .composite([
        { input: imgBuf, top: 0, left: 0 },
        { input: captionBuf, top: meta.height || 512, left: 0 },
      ])
      .jpeg()
      .toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `✍️ *Caption Added*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Caption failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── REVERSE VIDEO ────────────────────────────────────────────────────────────
const reversevideo = async (sock, msg) => {
  const dl = await requireVideo(msg);
  if (!dl) return msg.reply(`❗ Reply to a video to reverse it.\n\n${config.footer()}`);
  await msg.reply('🔄 Reversing video...');
  try {
    const { filePath } = dl;
    const outPath = path.join(tmpDir, `${uuidv4()}.mp4`);
    execSync(`ffmpeg -i "${filePath}" -vf reverse -af areverse "${outPath}"`, { timeout: 60000 });
    await msg.sendVideo(outPath, `🔄 *Reversed Video*\n\n${config.footer()}`);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Reverse failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── TRIM VIDEO ───────────────────────────────────────────────────────────────
const trimvideo = async (sock, msg) => {
  const dl = await requireVideo(msg);
  if (!dl) return msg.reply(`❗ Reply to a video.\nUsage: .trimvideo <start> <end> (in seconds)\nExample: .trimvideo 0 10\n\n${config.footer()}`);
  const start = msg.args[0] || '0';
  const end = msg.args[1] || '10';
  await msg.reply(`✂️ Trimming video from ${start}s to ${end}s...`);
  try {
    const { filePath } = dl;
    const outPath = path.join(tmpDir, `${uuidv4()}.mp4`);
    execSync(`ffmpeg -i "${filePath}" -ss ${start} -to ${end} -c copy "${outPath}"`, { timeout: 60000 });
    await msg.sendVideo(outPath, `✂️ *Trimmed Video (${start}s - ${end}s)*\n\n${config.footer()}`);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Trim failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── PITCH AUDIO ─────────────────────────────────────────────────────────────
const pitch = async (sock, msg) => {
  const dl = msg.quoted
    ? { filePath: (await msg.quoted.download()).filePath }
    : null;
  if (!dl || !['audioMessage'].includes((msg.quoted || msg).type))
    return msg.reply(`❗ Reply to an audio. Usage: .pitch <semitones>\n\n${config.footer()}`);
  const sem = parseInt(msg.args[0]) || 4;
  const factor = Math.pow(2, sem / 12).toFixed(4);
  await msg.reply(`🎵 Changing pitch by ${sem > 0 ? '+' : ''}${sem} semitones...`);
  try {
    const outPath = path.join(tmpDir, `${uuidv4()}.mp3`);
    execSync(`ffmpeg -i "${dl.filePath}" -filter:a "asetrate=44100*${factor},aresample=44100" "${outPath}"`, { timeout: 60000 });
    await msg.sendAudio(outPath);
    await fs.remove(dl.filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Pitch change failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── 8D AUDIO ─────────────────────────────────────────────────────────────────
const eightd = async (sock, msg) => {
  const target = msg.quoted;
  if (!target || !['audioMessage'].includes(target.type))
    return msg.reply(`❗ Reply to an audio for 8D effect.\n\n${config.footer()}`);
  await msg.reply('🎧 Applying 8D effect...');
  try {
    const { filePath } = await msg.quoted.download();
    const outPath = path.join(tmpDir, `${uuidv4()}.mp3`);
    execSync(`ffmpeg -i "${filePath}" -filter_complex "apulsator=hz=0.08" "${outPath}"`, { timeout: 60000 });
    await msg.sendAudio(outPath);
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ 8D effect failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

module.exports = {
  sepia, resize, watermark, caption, reversevideo, trimvideo, pitch,
  '8d': eightd,
};
