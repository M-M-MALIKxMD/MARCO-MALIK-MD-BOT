const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// ─── Random Item ──────────────────────────────────────────────────────────────
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Random Menu Image ────────────────────────────────────────────────────────
const randomMenuImage = () => random(config.menuImages);

// ─── Sleep ────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Download File ────────────────────────────────────────────────────────────
async function downloadFile(url, ext = 'tmp') {
  const tmpDir = path.join(__dirname, '../tmp');
  await fs.ensureDir(tmpDir);
  const filePath = path.join(tmpDir, `${uuidv4()}.${ext}`);
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.writeFile(filePath, Buffer.from(response.data));
  return filePath;
}

// ─── Fetch JSON ───────────────────────────────────────────────────────────────
async function fetchJson(url, opts = {}) {
  const { data } = await axios.get(url, { ...opts });
  return data;
}

// ─── Fetch HTML ───────────────────────────────────────────────────────────────
async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  return data;
}

// ─── Format Number ────────────────────────────────────────────────────────────
function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toString();
}

// ─── Format Duration ─────────────────────────────────────────────────────────
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Format Size ─────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' B';
}

// ─── Capital Case ─────────────────────────────────────────────────────────────
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ─── Is Valid URL ─────────────────────────────────────────────────────────────
function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// ─── Extract URL ─────────────────────────────────────────────────────────────
function extractUrl(text) {
  const matches = text.match(/https?:\/\/[^\s]+/g);
  return matches ? matches[0] : null;
}

// ─── Time String ─────────────────────────────────────────────────────────────
function timeNow() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: config.timezone,
  });
}

// ─── Date String ─────────────────────────────────────────────────────────────
function dateNow() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: config.timezone,
  });
}

// ─── Clean Tmp ────────────────────────────────────────────────────────────────
async function cleanTmp() {
  const tmpDir = path.join(__dirname, '../tmp');
  const files = await fs.readdir(tmpDir).catch(() => []);
  const now = Date.now();
  for (const file of files) {
    const filePath = path.join(tmpDir, file);
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat && now - stat.mtimeMs > 10 * 60 * 1000) {
      await fs.remove(filePath).catch(() => {});
    }
  }
}

// Clean tmp every 10 minutes
setInterval(cleanTmp, 10 * 60 * 1000);

// ─── Mention Text ─────────────────────────────────────────────────────────────
function getMentionText(jids) {
  return jids.map((j) => `@${j.split('@')[0]}`).join(' ');
}

// ─── Box Text ─────────────────────────────────────────────────────────────────
function box(title, content) {
  const lines = content.split('\n');
  const width = Math.max(title.length, ...lines.map((l) => l.length)) + 4;
  const border = '═'.repeat(width);
  const top = `╔${border}╗`;
  const bottom = `╚${border}╝`;
  const mid = `╠${border}╣`;
  const titleLine = `║  ${title.padEnd(width - 2)}║`;
  const contentLines = lines.map((l) => `║  ${l.padEnd(width - 2)}║`);
  return [top, titleLine, mid, ...contentLines, bottom].join('\n');
}

module.exports = {
  random,
  randomMenuImage,
  sleep,
  downloadFile,
  fetchJson,
  fetchHtml,
  formatNumber,
  formatDuration,
  formatSize,
  capitalize,
  isUrl,
  extractUrl,
  timeNow,
  dateNow,
  cleanTmp,
  getMentionText,
  box,
};
