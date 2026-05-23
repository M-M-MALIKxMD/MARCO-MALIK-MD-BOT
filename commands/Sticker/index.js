const config = require('../../config');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');

const tmpDir = path.join(__dirname, '../../tmp');

// ─── IMAGE/VIDEO TO STICKER ───────────────────────────────────────────────────
const sticker = async (sock, msg) => {
  const targetMsg = msg.quoted || msg;
  const type = targetMsg.type;
  if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(type)) {
    return msg.reply(`❗ Reply to an image or video to convert to sticker.\n\n${config.footer()}`);
  }
  await msg.reply('🎭 Creating sticker...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath, ext } = await (msg.quoted ? msg.quoted.download() : msg.download());
    const packname = msg.args[0] || config.botName;
    const author = msg.args[1] || config.ownerName;

    if (type === 'imageMessage' || type === 'stickerMessage') {
      const webpPath = path.join(tmpDir, `${uuidv4()}.webp`);
      await sharp(filePath).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toFile(webpPath);
      const stickerBuffer = await fs.readFile(webpPath);
      await msg.sendSticker(stickerBuffer);
      await fs.remove(webpPath);
    } else if (type === 'videoMessage') {
      const webpPath = path.join(tmpDir, `${uuidv4()}.webp`);
      execSync(`ffmpeg -i "${filePath}" -vcodec libwebp -filter:v fps=fps=15 -lossless 0 -compression_level 3 -q:v 70 -loop 0 -preset picture -an -vsync 0 -t 6 -s 512:512 "${webpPath}"`, { timeout: 30000 });
      const stickerBuffer = await fs.readFile(webpPath);
      await msg.sendSticker(stickerBuffer);
      await fs.remove(webpPath);
    }
    await fs.remove(filePath);
  } catch (err) {
    await msg.reply(`❌ Sticker creation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── STICKER TO IMAGE ─────────────────────────────────────────────────────────
const toimg = async (sock, msg) => {
  if (!msg.quoted || msg.quoted.type !== 'stickerMessage') {
    return msg.reply(`❗ Reply to a sticker to convert to image.\n\n${config.footer()}`);
  }
  await msg.reply('🖼️ Converting sticker to image...');
  try {
    const { filePath } = await msg.quoted.download();
    const jpgPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharp(filePath).jpeg().toFile(jpgPath);
    const imgBuffer = await fs.readFile(jpgPath);
    await sock.sendMessage(msg.jid, { image: imgBuffer, caption: `🖼️ *Sticker → Image*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(jpgPath);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── IMAGE EFFECTS ─────────────────────────────────────────────────────────────
const makeEffect = (name, sharpFn) => async (sock, msg) => {
  const targetMsg = msg.quoted || msg;
  if (!['imageMessage', 'stickerMessage'].includes(targetMsg.type)) {
    return msg.reply(`❗ Reply to an image.\n\n${config.footer()}`);
  }
  await msg.reply(`✨ Applying ${name} effect...`);
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await (msg.quoted ? msg.quoted.download() : msg.download());
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    await sharpFn(sharp(filePath)).jpeg().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `✨ *${name} Effect*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Effect failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const blur = makeEffect('Blur', (s) => s.blur(10));
const sharpen = makeEffect('Sharpen', (s) => s.sharpen());
const grayscale = makeEffect('Grayscale', (s) => s.grayscale());
const invert = makeEffect('Invert', (s) => s.negate());
const flip = makeEffect('Flip', (s) => s.flip());
const rotate = async (sock, msg) => {
  const deg = parseInt(msg.args[0]) || 90;
  const fn = makeEffect(`Rotate ${deg}°`, (s) => s.rotate(deg));
  return fn(sock, msg);
};

// ─── CIRCLE CROP ─────────────────────────────────────────────────────────────
const circle = async (sock, msg) => {
  const targetMsg = msg.quoted || msg;
  if (!['imageMessage'].includes(targetMsg.type)) return msg.reply(`❗ Reply to an image.`);
  await msg.reply('⭕ Applying circle crop...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await (msg.quoted ? msg.quoted.download() : msg.download());
    const size = 512;
    const mask = Buffer.from(`<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`);
    const outPath = path.join(tmpDir, `${uuidv4()}.png`);
    await sharp(filePath).resize(size, size, { fit: 'cover' }).composite([{ input: mask, blend: 'dest-in' }]).png().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `⭕ *Circle Crop*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Circle crop failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── CROP ─────────────────────────────────────────────────────────────────────
const crop = async (sock, msg) => {
  const targetMsg = msg.quoted || msg;
  if (!['imageMessage'].includes(targetMsg.type)) return msg.reply(`❗ Reply to an image.`);
  await msg.reply('✂️ Cropping image to square...');
  try {
    await fs.ensureDir(tmpDir);
    const { filePath } = await (msg.quoted ? msg.quoted.download() : msg.download());
    const outPath = path.join(tmpDir, `${uuidv4()}.jpg`);
    const meta = await sharp(filePath).metadata();
    const size = Math.min(meta.width, meta.height);
    await sharp(filePath).extract({ left: 0, top: 0, width: size, height: size }).jpeg().toFile(outPath);
    const buf = await fs.readFile(outPath);
    await sock.sendMessage(msg.jid, { image: buf, caption: `✂️ *Cropped Image*\n\n${config.footer()}` }, { quoted: msg });
    await fs.remove(filePath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Crop failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

module.exports = {
  sticker, toimg, blur, sharpen, grayscale, invert, flip, rotate, circle, crop,
};
