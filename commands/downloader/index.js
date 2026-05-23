const config = require('../../config');
const axios = require('axios');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { downloadFile } = require('../../lib/utils');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const tmpDir = path.join(__dirname, '../../tmp');

// ─── YOUTUBE ──────────────────────────────────────────────────────────────────
const ytmp3 = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}ytmp3 <song name or URL>\n\n${config.footer()}`);
  await msg.reply('🔍 Searching for audio...');
  try {
    let url = query;
    if (!query.startsWith('http')) {
      const res = await ytSearch(query);
      const vid = res.videos[0];
      if (!vid) return msg.reply('❌ No results found.');
      url = vid.url;
      await msg.reply(`🎵 Found: *${vid.title}*\n⏱️ Duration: ${vid.timestamp}\n👤 Channel: ${vid.author.name}\n\n⬇️ Downloading...`);
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = info.videoDetails.lengthSeconds;
    if (parseInt(duration) > 600) return msg.reply('❌ Audio is too long (max 10 minutes).');
    const outPath = path.join(tmpDir, `${uuidv4()}.mp3`);
    await fs.ensureDir(tmpDir);
    await new Promise((resolve, reject) => {
      ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(require('fs').createWriteStream(outPath))
        .on('finish', resolve)
        .on('error', reject);
    });
    await msg.sendAudio(outPath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Failed to download audio.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const ytmp4 = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}ytmp4 <video name or URL>\n\n${config.footer()}`);
  await msg.reply('🔍 Searching for video...');
  try {
    let url = query;
    if (!query.startsWith('http')) {
      const res = await ytSearch(query);
      const vid = res.videos[0];
      if (!vid) return msg.reply('❌ No results found.');
      url = vid.url;
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = info.videoDetails.lengthSeconds;
    if (parseInt(duration) > 300) return msg.reply('❌ Video is too long (max 5 minutes).');
    const outPath = path.join(tmpDir, `${uuidv4()}.mp4`);
    await fs.ensureDir(tmpDir);
    await new Promise((resolve, reject) => {
      ytdl(url, { filter: 'videoandaudio', quality: 'highest' })
        .pipe(require('fs').createWriteStream(outPath))
        .on('finish', resolve)
        .on('error', reject);
    });
    await msg.sendVideo(outPath, `🎬 *${title}*\n\n${config.footer()}`);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Failed to download video.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const yt = ytmp4;

const play = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}play <song name>\n\n${config.footer()}`);
  await msg.reply('🔍 Searching...');
  try {
    const res = await ytSearch(query);
    const vid = res.videos[0];
    if (!vid) return msg.reply('❌ Song not found.');
    const text = `🎵 *Now Playing*\n\n📌 Title: ${vid.title}\n⏱️ Duration: ${vid.timestamp}\n👤 Channel: ${vid.author.name}\n🔗 URL: ${vid.url}\n\n⬇️ Downloading...`;
    await msg.reply(text);
    const outPath = path.join(tmpDir, `${uuidv4()}.mp3`);
    await fs.ensureDir(tmpDir);
    await new Promise((resolve, reject) => {
      ytdl(vid.url, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(require('fs').createWriteStream(outPath))
        .on('finish', resolve)
        .on('error', reject);
    });
    await msg.sendAudio(outPath);
    await fs.remove(outPath);
  } catch (err) {
    await msg.reply(`❌ Failed to download song.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const song = play;

// ─── TIKTOK ──────────────────────────────────────────────────────────────────
const tiktok = async (sock, msg) => {
  const url = msg.args[0];
  if (!url || !url.includes('tiktok')) return msg.reply(`Usage: ${config.prefix}tiktok <tiktok URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading TikTok video...');
  try {
    const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    const videoUrl = data.video?.noWatermark || data.video?.origin;
    if (!videoUrl) throw new Error('No video URL found');
    await msg.sendVideo(videoUrl, `🎵 *TikTok Video*\n\n📌 Author: ${data.author?.name || 'Unknown'}\n💬 Caption: ${data.description || ''}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download TikTok.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const ttaudio = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}ttaudio <tiktok URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading TikTok audio...');
  try {
    const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    const audioUrl = data.music;
    if (!audioUrl) throw new Error('No audio URL found');
    await msg.sendAudio(audioUrl);
  } catch (err) {
    await msg.reply(`❌ Failed to download TikTok audio.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── INSTAGRAM ────────────────────────────────────────────────────────────────
const instagram = async (sock, msg) => {
  const url = msg.args[0];
  if (!url || !url.includes('instagram')) return msg.reply(`Usage: ${config.prefix}instagram <instagram URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading Instagram post...');
  try {
    const apiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const { data } = await axios.get(`https://saveig.app/api?url=${encodeURIComponent(url)}`);
    const mediaUrl = data?.data?.[0]?.url;
    if (!mediaUrl) throw new Error('Could not extract media URL');
    await msg.sendImage(mediaUrl, `📷 *Instagram Post*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download Instagram post.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── FACEBOOK ────────────────────────────────────────────────────────────────
const fb = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}fb <facebook video URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading Facebook video...');
  try {
    const { data } = await axios.get(`https://getmyfb.com/api?url=${encodeURIComponent(url)}`);
    const videoUrl = data?.links?.sd || data?.links?.hd;
    if (!videoUrl) throw new Error('No video URL found');
    await msg.sendVideo(videoUrl, `📘 *Facebook Video*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download Facebook video.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const fbhd = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}fbhd <facebook video URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading Facebook HD video...');
  try {
    const { data } = await axios.get(`https://getmyfb.com/api?url=${encodeURIComponent(url)}`);
    const videoUrl = data?.links?.hd || data?.links?.sd;
    if (!videoUrl) throw new Error('No video URL found');
    await msg.sendVideo(videoUrl, `📘 *Facebook HD Video*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download Facebook HD video.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── TWITTER ─────────────────────────────────────────────────────────────────
const twitter = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}twitter <tweet URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading Twitter video...');
  try {
    const { data } = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`);
    const videoUrl = data?.videos?.[0]?.url;
    if (!videoUrl) throw new Error('No video URL found');
    await msg.sendVideo(videoUrl, `🐦 *Twitter Video*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download Twitter video.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── APK DOWNLOADER ───────────────────────────────────────────────────────────
const apk = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}apk <app name>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching APK: *${query}*...`);
  try {
    const searchUrl = `https://apkpure.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const cheerio = require('cheerio');
    const $ = cheerio.load(data);
    const firstApp = $('.search-dl').first();
    const appName = firstApp.find('.search-title').text().trim();
    const appLink = 'https://apkpure.com' + firstApp.find('a').attr('href');
    const appIcon = firstApp.find('img').attr('src');
    const appDev = firstApp.find('.developer').text().trim();
    const appRating = firstApp.find('.star').text().trim();

    const text = `📱 *APK Found!*\n\n📌 App: ${appName}\n👤 Developer: ${appDev}\n⭐ Rating: ${appRating}\n\n🔗 Download Link:\n${appLink}\n\n${config.footer()}`;

    if (appIcon) {
      await msg.sendImage(appIcon, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ APK not found.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── MOVIE INFO ────────────────────────────────────────────────────────────────
const movie = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}movie <movie name>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching: *${query}*...`);
  try {
    const { data } = await axios.get(
      `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=trilogy`
    );
    if (data.Response === 'False') return msg.reply('❌ Movie not found.');
    const m = data.Search[0];
    const detail = await axios.get(`http://www.omdbapi.com/?i=${m.imdbID}&apikey=trilogy`);
    const d = detail.data;
    const text = `🎬 *${d.Title}* (${d.Year})\n\n📝 Plot: ${d.Plot}\n⭐ IMDb: ${d.imdbRating}/10\n🎭 Genre: ${d.Genre}\n👤 Director: ${d.Director}\n🌍 Language: ${d.Language}\n⏱️ Runtime: ${d.Runtime}\n🏆 Awards: ${d.Awards}\n\n${config.footer()}`;
    if (m.Poster && m.Poster !== 'N/A') {
      await msg.sendImage(m.Poster, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ Failed to fetch movie info.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── IMAGE DOWNLOAD ────────────────────────────────────────────────────────────
const imgdl = async (sock, msg) => {
  const url = msg.args[0];
  if (!url) return msg.reply(`Usage: ${config.prefix}imgdl <image URL>\n\n${config.footer()}`);
  await msg.reply('⬇️ Downloading image...');
  try {
    await msg.sendImage(url, `📷 *Downloaded Image*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Failed to download image.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

module.exports = {
  ytmp3, ytmp4, yt, play, song, tiktok, ttaudio, instagram, fb, fbhd, twitter, apk, movie, imgdl,
};
