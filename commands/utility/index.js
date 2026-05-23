const config = require('../../config');
const { timeNow, dateNow, formatDuration } = require('../../lib/utils');

// ─── PING ─────────────────────────────────────────────────────────────────────
const ping = async (sock, msg) => {
  const start = Date.now();
  const sent = await msg.reply('🏓 Pinging...');
  const end = Date.now();
  await msg.reply(`🏓 *Pong!*\n\n⚡ Response: *${end - start}ms*\n🤖 Bot: ${config.botName}\n📌 Prefix: ${config.prefix}\n\n${config.footer()}`);
};

// ─── UPTIME ───────────────────────────────────────────────────────────────────
const uptime = async (sock, msg) => {
  const up = process.uptime() * 1000;
  await msg.reply(`⏱️ *Bot Uptime*\n\n${formatDuration(up)}\n\n${config.footer()}`);
};

// ─── INFO ─────────────────────────────────────────────────────────────────────
const info = async (sock, msg) => {
  const text = `ℹ️ *Bot Information*

🤖 Name: ${config.botName}
📌 Version: ${config.botVersion}
⚡ Prefix: ${config.prefix}
👑 Owner: ${config.ownerName}
🌐 Mode: ${config.botMode.toUpperCase()}
📢 Channel: ${config.channelLink}
🔱 Powered By: ${config.poweredBy}
🟢 Node.js: ${process.version}
💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

${config.footer()}`;
  await msg.reply(text);
};

// ─── TIME ─────────────────────────────────────────────────────────────────────
const time = async (sock, msg) => {
  await msg.reply(`🕐 *Current Time*\n\n⏰ ${timeNow()}\n📅 ${dateNow()}\n🌍 Timezone: ${config.timezone}\n\n${config.footer()}`);
};

const date = time;

// ─── WORLD TIME ───────────────────────────────────────────────────────────────
const worldtime = async (sock, msg) => {
  const city = msg.body || 'Karachi';
  try {
    const axios = require('axios');
    const { data } = await axios.get(`http://worldtimeapi.org/api/timezone`, { timeout: 10000 });
    const tzList = data.filter((tz) => tz.toLowerCase().includes(city.toLowerCase())).slice(0, 5);
    if (!tzList.length) return msg.reply(`❌ Timezone for *${city}* not found.\n\n${config.footer()}`);
    const results = await Promise.all(tzList.map(async (tz) => {
      const r = await axios.get(`http://worldtimeapi.org/api/timezone/${tz}`, { timeout: 10000 });
      return `📍 ${tz}:\n   🕐 ${new Date(r.data.datetime).toLocaleTimeString()}`;
    }));
    await msg.reply(`🌍 *World Time: ${city}*\n\n${results.join('\n\n')}\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Could not fetch time.\n\n${config.footer()}`);
  }
};

// ─── CALCULATOR ───────────────────────────────────────────────────────────────
const calc = async (sock, msg) => {
  const expr = msg.body;
  if (!expr) return msg.reply(`Usage: ${config.prefix}calc <expression>\nExample: .calc 2+2*5\n\n${config.footer()}`);
  try {
    const math = require('mathjs');
    const result = math.evaluate(expr);
    await msg.reply(`🧮 *Calculator*\n\n📝 Expression: ${expr}\n✅ Result: *${result}*\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Invalid expression.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const math = calc;

// ─── CURRENCY CONVERTER ───────────────────────────────────────────────────────
const currency = async (sock, msg) => {
  const parts = msg.body.split(' ');
  const amount = parseFloat(parts[0]);
  const from = parts[1]?.toUpperCase();
  const to = parts[2]?.toUpperCase();
  if (!amount || !from || !to) return msg.reply(`Usage: ${config.prefix}currency <amount> <FROM> <TO>\nExample: .currency 100 USD PKR\n\n${config.footer()}`);
  await msg.reply(`💱 Converting ${amount} ${from} to ${to}...`);
  try {
    const axios = require('axios');
    const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, { timeout: 15000 });
    const rate = data.rates?.[to];
    if (!rate) return msg.reply(`❌ Invalid currency pair.\n\n${config.footer()}`);
    const result = (amount * rate).toFixed(2);
    await msg.reply(`💱 *Currency Converter*\n\n${amount} ${from} = *${result} ${to}*\n📊 Rate: 1 ${from} = ${rate} ${to}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Conversion failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── BMI CALCULATOR ──────────────────────────────────────────────────────────
const bmi = async (sock, msg) => {
  const parts = msg.body.split(' ');
  const weight = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);
  if (!weight || !height) return msg.reply(`Usage: ${config.prefix}bmi <weight kg> <height cm>\n\n${config.footer()}`);
  const bmiVal = (weight / ((height / 100) ** 2)).toFixed(2);
  const status = bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Normal' : bmiVal < 30 ? 'Overweight' : 'Obese';
  await msg.reply(`⚖️ *BMI Calculator*\n\n👤 Weight: ${weight} kg\n📏 Height: ${height} cm\n📊 BMI: *${bmiVal}*\n🏥 Status: *${status}*\n\n${config.footer()}`);
};

// ─── AGE CALCULATOR ───────────────────────────────────────────────────────────
const age = async (sock, msg) => {
  const dob = msg.body;
  if (!dob) return msg.reply(`Usage: ${config.prefix}age <DD/MM/YYYY>\n\n${config.footer()}`);
  try {
    const [d, m, y] = dob.split('/').map(Number);
    const now = new Date();
    const birth = new Date(y, m - 1, d);
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }
    await msg.reply(`🎂 *Age Calculator*\n\n📅 Born: ${dob}\n🎉 Age: *${years} years, ${months} months, ${days} days*\n\n${config.footer()}`);
  } catch {
    await msg.reply(`❌ Invalid date format. Use DD/MM/YYYY\n\n${config.footer()}`);
  }
};

// ─── PASSWORD GENERATOR ───────────────────────────────────────────────────────
const password = async (sock, msg) => {
  const len = parseInt(msg.args[0]) || 16;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const pass = Array.from({ length: Math.min(len, 64) }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  await msg.reply(`🔑 *Generated Password*\n\n\`\`\`${pass}\`\`\`\n\n⚠️ _Save this in a secure place!_\n\n${config.footer()}`);
};

// ─── OWNER CONTACT ────────────────────────────────────────────────────────────
const owner = async (sock, msg) => {
  await msg.reply(`👑 *Bot Owner*\n\n👤 Name: ${config.ownerName}\n📱 Number: wa.me/${config.ownerNumber}\n📢 Channel: ${config.channelLink}\n\n${config.footer()}`);
};

module.exports = {
  ping, uptime, info, time, date, worldtime, calc, math, currency, bmi, age, password, owner,
};
