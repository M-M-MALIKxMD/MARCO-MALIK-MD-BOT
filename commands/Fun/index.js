const config = require('../../config');
const axios = require('axios');
const { random } = require('../../lib/utils');

// ─── JOKES ────────────────────────────────────────────────────────────────────
const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "I told my wife she was drawing her eyebrows too high. She looked surprised. 😂",
  "Why do cows wear bells? Because their horns don't work! 🐄",
  "What do you call fake spaghetti? An impasta! 🍝",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
  "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them! 🔢",
  "What do you call a fish without eyes? A fsh! 🐟",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "I asked my dog what two minus two is. He said nothing. 🐕",
];

const joke = async (sock, msg) => {
  await msg.reply(`😂 *Random Joke*\n\n${random(jokes)}\n\n${config.footer()}`);
};

// ─── DARE / TRUTH ─────────────────────────────────────────────────────────────
const dares = [
  "Sing a song for 30 seconds!", "Do 20 push-ups right now!", "Send a voice note saying 'I love you' to the last person you texted!",
  "Eat a spoonful of something spicy!", "Change your profile picture for 24 hours!", "Do your best dance for 1 minute!",
  "Send your most embarrassing photo!", "Call someone and speak in an accent for the whole call!", "Write a love poem right now!",
  "Do 10 jumping jacks in public!", "Post an embarrassing status for 30 minutes!", "Speak in rhymes for the next 5 minutes!",
];

const truths = [
  "What is your biggest fear?", "What is the most embarrassing thing that has ever happened to you?",
  "Do you have a crush right now? Who?", "What is the worst thing you have ever done?",
  "Have you ever lied to your best friend?", "What is your most embarrassing nickname?",
  "What is your guilty pleasure?", "Have you ever cheated on a test?",
  "What is something you have never told anyone?", "Who do you like most in this group?",
  "What is the most childish thing you still do?", "What is your biggest secret?",
];

const dare = async (sock, msg) => {
  await msg.reply(`🔥 *DARE*\n\n${random(dares)}\n\n${config.footer()}`);
};

const truth = async (sock, msg) => {
  await msg.reply(`💭 *TRUTH*\n\n${random(truths)}\n\n${config.footer()}`);
};

// ─── ROAST ────────────────────────────────────────────────────────────────────
const roasts = [
  "You're not stupid, you just have bad luck thinking.", "I'd agree with you, but then we'd both be wrong.",
  "You bring everyone so much joy — when you leave the room!", "You're proof that even mistakes can walk around.",
  "If laughter is the best medicine, your face must be curing the world.", "You're like a cloud — when you disappear, it's a beautiful day!",
  "I'd call you an idiot, but that would be an insult to idiots.", "You're not completely useless — you can serve as a bad example!",
];

const roast = async (sock, msg) => {
  const target = msg.quoted?.sender || msg.sender;
  const name = `@${target.split('@')[0]}`;
  await msg.reply(`🔥 *Roast for ${name}*\n\n${random(roasts)}\n\n${config.footer()}`, { mentions: [target] });
};

// ─── COMPLIMENT ───────────────────────────────────────────────────────────────
const compliments = [
  "You have a heart of gold! 💛", "You make the world a better place just by being in it! 🌟",
  "Your smile could light up any room! 😊", "You are incredibly talented! 🎯",
  "You inspire everyone around you! ✨", "You are one of the most amazing people I know! 🌺",
  "Your kindness is unmatched! 💫", "You are brilliant and wonderful! 🌈",
];

const compliment = async (sock, msg) => {
  const target = msg.quoted?.sender || msg.sender;
  const name = `@${target.split('@')[0]}`;
  await msg.reply(`💝 *Compliment for ${name}*\n\n${random(compliments)}\n\n${config.footer()}`, { mentions: [target] });
};

// ─── PICKUP LINES ─────────────────────────────────────────────────────────────
const pickupLines = [
  "Are you a magician? Because whenever I look at you, everyone else disappears! ✨",
  "Do you have a map? I keep getting lost in your eyes! 👀",
  "Are you a bank loan? Because you have my interest! 💰",
  "Is your name Google? Because you have everything I've been searching for! 🔍",
  "Are you a parking ticket? Because you've got 'fine' written all over you! 😏",
];

const pickup = async (sock, msg) => {
  await msg.reply(`💌 *Pickup Line*\n\n${random(pickupLines)}\n\n${config.footer()}`);
};

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const quotes = [
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"In the middle of every difficulty lies opportunity." — Albert Einstein',
  '"Life is what happens when you\'re busy making other plans." — John Lennon',
  '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
  '"It is during our darkest moments that we must focus to see the light." — Aristotle',
];

const quote = async (sock, msg) => {
  await msg.reply(`💭 *Quote of the Moment*\n\n${random(quotes)}\n\n${config.footer()}`);
};

// ─── FACTS ────────────────────────────────────────────────────────────────────
const facts = [
  "🧠 A group of flamingos is called a 'flamboyance'.",
  "🌊 The ocean produces over 50% of the world's oxygen.",
  "🐝 Honey never expires. Archaeologists have found 3000-year-old honey in Egyptian tombs.",
  "🦁 A lion's roar can be heard from 8 kilometers away.",
  "🌍 The Earth is 4.5 billion years old.",
  "💧 97% of the water on Earth is saltwater.",
  "🔭 The Milky Way galaxy has over 200 billion stars.",
  "🎵 Music can change your mood and reduce stress levels significantly.",
];

const fact = async (sock, msg) => {
  await msg.reply(`📚 *Random Fact*\n\n${random(facts)}\n\n${config.footer()}`);
};

// ─── RIDDLES ─────────────────────────────────────────────────────────────────
const riddles = [
  { q: "What has hands but can't clap?", a: "A clock!" },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "The letter M!" },
  { q: "I speak without a mouth and hear without ears. I have no body but I come alive with the wind. What am I?", a: "An echo!" },
  { q: "The more you take, the more you leave behind. What am I?", a: "Footsteps!" },
];

const riddle = async (sock, msg) => {
  const r = random(riddles);
  await msg.reply(`🧩 *Riddle*\n\n*Q:* ${r.q}\n\n_Type_ ${config.prefix}answer _to get the answer._\n\n${config.footer()}`);
};

// ─── PERSONALITY COMMANDS ─────────────────────────────────────────────────────
const ship = async (sock, msg) => {
  const args = msg.body.split(' ');
  const p1 = args[0] || 'Person 1';
  const p2 = args[1] || 'Person 2';
  const pct = Math.floor(Math.random() * 101);
  const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
  const emoji = pct >= 80 ? '💘' : pct >= 50 ? '💕' : pct >= 30 ? '🤍' : '💔';
  await msg.reply(`${emoji} *Ship Meter*\n\n💑 *${p1}* ❤️ *${p2}*\n\n[${bar}] ${pct}%\n\n${config.footer()}`);
};

const rate = async (sock, msg) => {
  const thing = msg.body || 'yourself';
  const pct = Math.floor(Math.random() * 101);
  await msg.reply(`⭐ *Rate: ${thing}*\n\nRating: *${pct}/100*\n\n${config.footer()}`);
};

const iq = async (sock, msg) => {
  const target = msg.quoted?.sender || msg.sender;
  const val = Math.floor(Math.random() * 200) + 1;
  const label = val >= 140 ? 'Genius' : val >= 120 ? 'Very Smart' : val >= 100 ? 'Average' : val >= 80 ? 'Below Average' : 'LOL 😂';
  await msg.reply(`🧠 *IQ Test*\n\n@${target.split('@')[0]}'s IQ: *${val}*\nStatus: *${label}*\n\n${config.footer()}`, { mentions: [target] });
};

const love = async (sock, msg) => {
  const args = msg.body.split(' ');
  const p1 = args[0] || 'You';
  const p2 = args[1] || 'Someone';
  const pct = Math.floor(Math.random() * 101);
  await msg.reply(`❤️ *Love Meter*\n\n💕 ${p1} loves ${p2}: *${pct}%*\n\n${config.footer()}`);
};

const lucky = async (sock, msg) => {
  const target = msg.quoted?.sender || msg.sender;
  const pct = Math.floor(Math.random() * 101);
  await msg.reply(`🍀 *Lucky Meter*\n\n@${target.split('@')[0]}'s luck today: *${pct}%*\n\n${config.footer()}`, { mentions: [target] });
};

// ─── TEXT FUN ─────────────────────────────────────────────────────────────────
const mock = async (sock, msg) => {
  const text = msg.body || msg.quoted?.text;
  if (!text) return msg.reply(`Usage: ${config.prefix}mock <text>`);
  const result = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  await msg.reply(`😏 ${result}\n\n${config.footer()}`);
};

const reverse = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}reverse <text>`);
  await msg.reply(`🔄 ${text.split('').reverse().join('')}\n\n${config.footer()}`);
};

const clap = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}clap <text>`);
  await msg.reply(`👏 ${text.split(' ').join(' 👏 ')} 👏\n\n${config.footer()}`);
};

const aesthetic = async (sock, msg) => {
  const text = msg.body;
  if (!text) return msg.reply(`Usage: ${config.prefix}aesthetic <text>`);
  const map = 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ'.split(' ');
  const normal = 'abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(' ');
  const result = text.split('').map((c) => {
    const idx = normal[0].indexOf(c);
    if (idx >= 0) return map[0][idx];
    const idu = normal[1].indexOf(c);
    if (idu >= 0) return map[1][idu];
    return c;
  }).join('');
  await msg.reply(`✨ ${result}\n\n${config.footer()}`);
};

// ─── RANDOM MEDIA ─────────────────────────────────────────────────────────────
const meme = async (sock, msg) => {
  try {
    const { data } = await axios.get('https://meme-api.com/gimme');
    await msg.sendImage(data.url, `😂 *${data.title}*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Could not fetch meme. Try again!\n\n${config.footer()}`);
  }
};

const dog = async (sock, msg) => {
  try {
    const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
    await msg.sendImage(data.message, `🐕 *Random Dog*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Could not fetch dog image.\n\n${config.footer()}`);
  }
};

const cat = async (sock, msg) => {
  try {
    const { data } = await axios.get('https://api.thecatapi.com/v1/images/search');
    await msg.sendImage(data[0].url, `🐱 *Random Cat*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Could not fetch cat image.\n\n${config.footer()}`);
  }
};

const fox = async (sock, msg) => {
  try {
    const { data } = await axios.get('https://randomfox.ca/floof/');
    await msg.sendImage(data.image, `🦊 *Random Fox*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Could not fetch fox image.\n\n${config.footer()}`);
  }
};

module.exports = {
  joke, dare, truth, roast, compliment, pickup, quote, fact, riddle,
  ship, rate, iq, love, lucky, mock, reverse, clap, aesthetic,
  meme, dog, cat, fox,
};
