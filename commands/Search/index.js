const config = require('../../config');
const axios = require('axios');
const ytSearch = require('yt-search');

// ─── YOUTUBE SEARCH ───────────────────────────────────────────────────────────
const ytsearch = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}ytsearch <query>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching YouTube: *${query}*...`);
  try {
    const res = await ytSearch(query);
    const videos = res.videos.slice(0, 5);
    if (!videos.length) return msg.reply('❌ No results found.');
    const text = `🎬 *YouTube Results for:* _${query}_\n\n` +
      videos.map((v, i) =>
        `${i + 1}. *${v.title}*\n   👤 ${v.author.name} | ⏱️ ${v.timestamp} | 👁️ ${v.views?.toLocaleString?.() ?? '?'} views\n   🔗 ${v.url}`
      ).join('\n\n') + `\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Search failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── WIKIPEDIA ────────────────────────────────────────────────────────────────
const wiki = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}wiki <search term>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching Wikipedia: *${query}*...`);
  try {
    const { data } = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const text = `📖 *Wikipedia: ${data.title}*\n\n${data.extract}\n\n🔗 Read more: ${data.content_urls?.desktop?.page}\n\n${config.footer()}`;
    if (data.thumbnail?.source) {
      await msg.sendImage(data.thumbnail.source, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ Wikipedia search failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── WEATHER ─────────────────────────────────────────────────────────────────
const weather = async (sock, msg) => {
  const city = msg.body;
  if (!city) return msg.reply(`Usage: ${config.prefix}weather <city>\n\n${config.footer()}`);
  await msg.reply(`🌤️ Fetching weather for *${city}*...`);
  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=439d4b804bc8187953eb36d2a8c26a02&units=metric`,
      { timeout: 15000 }
    );
    const text = `🌤️ *Weather in ${data.name}, ${data.sys.country}*\n\n🌡️ Temperature: ${data.main.temp}°C (Feels: ${data.main.feels_like}°C)\n💧 Humidity: ${data.main.humidity}%\n🌬️ Wind: ${data.wind.speed} m/s\n☁️ Condition: ${data.weather[0].description}\n👁️ Visibility: ${(data.visibility / 1000).toFixed(1)} km\n⬆️ Max: ${data.main.temp_max}°C | ⬇️ Min: ${data.main.temp_min}°C\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Could not get weather.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── LYRICS ───────────────────────────────────────────────────────────────────
const lyrics = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}lyrics <song name>\n\n${config.footer()}`);
  await msg.reply(`🎵 Searching lyrics: *${query}*...`);
  try {
    const { data } = await axios.get(
      `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const text = `🎵 *${data.title}*\n👤 *${data.author}*\n\n${data.lyrics?.slice(0, 3000)}\n\n${config.footer()}`;
    if (data.thumbnail?.genius) {
      await msg.sendImage(data.thumbnail.genius, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ Lyrics not found.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── DEFINE (DICTIONARY) ──────────────────────────────────────────────────────
const define = async (sock, msg) => {
  const word = msg.body;
  if (!word) return msg.reply(`Usage: ${config.prefix}define <word>\n\n${config.footer()}`);
  await msg.reply(`📖 Looking up: *${word}*...`);
  try {
    const { data } = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { timeout: 15000 }
    );
    const entry = data[0];
    const meanings = entry.meanings.slice(0, 3).map((m) =>
      `*${m.partOfSpeech}*:\n${m.definitions.slice(0, 2).map((d, i) => `  ${i + 1}. ${d.definition}`).join('\n')}`
    ).join('\n\n');
    const text = `📖 *Dictionary: ${entry.word}*\n🔊 Phonetic: ${entry.phonetic || 'N/A'}\n\n${meanings}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Word not found.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── URBAN DICTIONARY ─────────────────────────────────────────────────────────
const urban = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}urban <word>\n\n${config.footer()}`);
  await msg.reply(`📖 Searching Urban Dictionary: *${query}*...`);
  try {
    const { data } = await axios.get(
      `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    );
    const entry = data.list?.[0];
    if (!entry) return msg.reply('❌ Not found in Urban Dictionary.');
    const text = `📖 *Urban Dictionary: ${entry.word}*\n\n📝 Definition:\n${entry.definition?.slice(0, 500)}\n\n💬 Example:\n${entry.example?.slice(0, 300)}\n\n👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Search failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── GITHUB USER ─────────────────────────────────────────────────────────────
const ghuser = async (sock, msg) => {
  const username = msg.args[0];
  if (!username) return msg.reply(`Usage: ${config.prefix}ghuser <username>\n\n${config.footer()}`);
  await msg.reply(`🔍 Fetching GitHub user: *${username}*...`);
  try {
    const { data } = await axios.get(`https://api.github.com/users/${username}`, { timeout: 15000 });
    const text = `👨‍💻 *GitHub User: ${data.name || data.login}*\n\n📛 Username: ${data.login}\n📝 Bio: ${data.bio || 'N/A'}\n📍 Location: ${data.location || 'N/A'}\n👥 Followers: ${data.followers.toLocaleString()}\n➡️ Following: ${data.following.toLocaleString()}\n📦 Public Repos: ${data.public_repos}\n⭐ Stars: ${data.public_gists} gists\n🔗 Profile: ${data.html_url}\n\n${config.footer()}`;
    if (data.avatar_url) {
      await msg.sendImage(data.avatar_url, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ User not found.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── NPM PACKAGE SEARCH ───────────────────────────────────────────────────────
const npm = async (sock, msg) => {
  const pkg = msg.body;
  if (!pkg) return msg.reply(`Usage: ${config.prefix}npm <package name>\n\n${config.footer()}`);
  await msg.reply(`📦 Searching npm: *${pkg}*...`);
  try {
    const { data } = await axios.get(`https://registry.npmjs.org/${pkg}`, { timeout: 15000 });
    const latest = data['dist-tags']?.latest;
    const version = data.versions[latest];
    const text = `📦 *npm: ${data.name}*\n\n📌 Version: ${latest}\n📝 Description: ${data.description || 'N/A'}\n👤 Author: ${JSON.stringify(data.author?.name || data.author || 'N/A')}\n📜 License: ${version.license || 'N/A'}\n📅 Published: ${new Date(data.time.created).toLocaleDateString()}\n🔗 npm: https://npmjs.com/package/${data.name}\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Package not found.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── NEWS ─────────────────────────────────────────────────────────────────────
const news = async (sock, msg) => {
  await msg.reply('📰 Fetching latest news...');
  try {
    const { data } = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=demo`,
      { timeout: 15000 }
    );
    const articles = data.articles?.slice(0, 5) || [];
    if (!articles.length) return msg.reply('❌ No news found.');
    const text = `📰 *Latest News*\n\n` +
      articles.map((a, i) => `${i + 1}. *${a.title}*\n   ${a.description || ''}\n   🔗 ${a.url}`).join('\n\n') +
      `\n\n${config.footer()}`;
    await msg.reply(text);
  } catch (err) {
    await msg.reply(`❌ Could not fetch news.\n\n${config.footer()}`);
  }
};

// ─── ANIME SEARCH (MAL) ───────────────────────────────────────────────────────
const anime = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}anime <name>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching anime: *${query}*...`);
  try {
    const { data } = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`,
      { timeout: 15000 }
    );
    const a = data.data?.[0];
    if (!a) return msg.reply('❌ Anime not found.');
    const text = `🎌 *${a.title}* (${a.title_japanese || ''})\n\n📊 Type: ${a.type}\n⭐ Score: ${a.score || 'N/A'}/10\n📅 Year: ${a.year || 'N/A'}\n📺 Episodes: ${a.episodes || 'N/A'}\n📝 Synopsis: ${a.synopsis?.slice(0, 400)}...\n🔗 MAL: ${a.url}\n\n${config.footer()}`;
    if (a.images?.jpg?.image_url) {
      await msg.sendImage(a.images.jpg.image_url, text);
    } else {
      await msg.reply(text);
    }
  } catch (err) {
    await msg.reply(`❌ Anime search failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── IMAGE SEARCH ─────────────────────────────────────────────────────────────
const imgsearch = async (sock, msg) => {
  const query = msg.body;
  if (!query) return msg.reply(`Usage: ${config.prefix}imgsearch <query>\n\n${config.footer()}`);
  await msg.reply(`🔍 Searching images: *${query}*...`);
  try {
    const { data } = await axios.get(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=LfKN826YRSN-hGOjOQCYMWONdNAVoNNzLZVm6aBbF7A`,
      { timeout: 15000 }
    );
    const photo = data.results?.[0];
    if (!photo) return msg.reply('❌ No images found.');
    await msg.sendImage(photo.urls.regular, `🖼️ *${query}*\n📸 By: ${photo.user.name}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Image search failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

module.exports = {
  ytsearch, wiki, weather, lyrics, define, urban, ghuser, npm, news, anime, imgsearch,
};
