const config = require('../../config');
const { getUser, addCoins, addXP, getLeaderboard, saveDB, db } = require('../../lib/db');
const { random } = require('../../lib/utils');

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const profile = async (sock, msg) => {
  const target = msg.quoted?.sender || msg.sender;
  const user = getUser(target);
  const name = `@${target.split('@')[0]}`;
  const levelBar = '█'.repeat(Math.min(user.level, 20)) + '░'.repeat(Math.max(20 - user.level, 0));
  const text = `👤 *Player Profile*\n\n👑 Name: ${name}\n⭐ Level: ${user.level}\n📊 XP: ${user.xp}\n[${levelBar}]\n💰 Coins: ${user.coins}\n💎 Gems: ${user.gems}\n⚠️ Warns: ${user.warns}\n👑 Premium: ${user.premium ? '✅' : '❌'}\n📅 Joined: ${new Date(user.joinedAt).toLocaleDateString()}\n\n${config.footer()}`;
  await msg.reply(text, { mentions: [target] });
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
const leaderboard = async (sock, msg) => {
  const top = getLeaderboard();
  if (!top.length) return msg.reply(`❌ No data yet.\n\n${config.footer()}`);
  const text = `🏆 *XP Leaderboard*\n\n` +
    top.map((u, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      return `${medal} @${u.jid.split('@')[0]} — Lv.${u.level} (${u.xp} XP)`;
    }).join('\n') +
    `\n\n${config.footer()}`;
  await msg.reply(text, { mentions: top.map((u) => u.jid) });
};

// ─── DAILY REWARD ─────────────────────────────────────────────────────────────
const daily = async (sock, msg) => {
  const user = getUser(msg.sender);
  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;
  if (user.lastDaily && now - user.lastDaily < cooldown) {
    const remaining = cooldown - (now - user.lastDaily);
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    return msg.reply(`⏳ Daily already claimed!\nCome back in *${h}h ${m}m*.\n\n${config.footer()}`);
  }
  const coins = Math.floor(Math.random() * 500) + 200;
  const xp = Math.floor(Math.random() * 50) + 20;
  user.lastDaily = now;
  user.coins += coins;
  user.xp += xp;
  saveDB();
  await msg.reply(`🎁 *Daily Reward Claimed!*\n\n💰 Coins: +${coins}\n⭐ XP: +${xp}\n💰 Total Coins: ${user.coins}\n\n${config.footer()}`);
};

// ─── WEEKLY REWARD ────────────────────────────────────────────────────────────
const weekly = async (sock, msg) => {
  const user = getUser(msg.sender);
  const now = Date.now();
  const cooldown = 7 * 24 * 60 * 60 * 1000;
  if (user.lastWeekly && now - user.lastWeekly < cooldown) {
    const remaining = cooldown - (now - user.lastWeekly);
    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    return msg.reply(`⏳ Weekly already claimed!\nCome back in *${d}d ${h}h*.\n\n${config.footer()}`);
  }
  const coins = Math.floor(Math.random() * 2000) + 1000;
  const xp = Math.floor(Math.random() * 200) + 100;
  user.lastWeekly = now;
  user.coins += coins;
  user.xp += xp;
  saveDB();
  await msg.reply(`🎁 *Weekly Reward Claimed!*\n\n💰 Coins: +${coins}\n⭐ XP: +${xp}\n💰 Total Coins: ${user.coins}\n\n${config.footer()}`);
};

// ─── WORK ─────────────────────────────────────────────────────────────────────
const jobs = ['delivered packages', 'coded a website', 'designed a logo', 'fixed a car', 'cooked meals', 'cleaned houses', 'drove a taxi', 'taught students', 'sold products', 'wrote articles'];
const work = async (sock, msg) => {
  const user = getUser(msg.sender);
  const now = Date.now();
  const cooldown = 30 * 60 * 1000;
  if (user.lastWork && now - user.lastWork < cooldown) {
    const remaining = cooldown - (now - user.lastWork);
    const m = Math.floor(remaining / 60000);
    return msg.reply(`⏳ You need to rest!\nWork again in *${m}m*.\n\n${config.footer()}`);
  }
  const job = random(jobs);
  const coins = Math.floor(Math.random() * 200) + 50;
  user.lastWork = now;
  user.coins += coins;
  saveDB();
  await msg.reply(`💼 *Work Result*\n\nYou ${job} and earned *${coins} coins*!\n💰 Total: ${user.coins} coins\n\n${config.footer()}`);
};

// ─── GIFT ─────────────────────────────────────────────────────────────────────
const gift = async (sock, msg) => {
  const target = msg.quoted?.sender || (msg.args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  const amount = parseInt(msg.args[0]) || parseInt(msg.args[1]) || 100;
  if (!target) return msg.reply(`Usage: ${config.prefix}gift @user <amount>\n\n${config.footer()}`);
  if (target === msg.sender) return msg.reply(`❌ You can't gift yourself!\n\n${config.footer()}`);
  const sender = getUser(msg.sender);
  if (sender.coins < amount) return msg.reply(`❌ Not enough coins! You have *${sender.coins}* coins.\n\n${config.footer()}`);
  const receiver = getUser(target);
  sender.coins -= amount;
  receiver.coins += amount;
  saveDB();
  await msg.reply(`🎁 *Gift Sent!*\n\nYou gifted *${amount} coins* to @${target.split('@')[0]}\n\n💰 Your balance: ${sender.coins}\n\n${config.footer()}`, { mentions: [target] });
};

// ─── FLIP COIN ────────────────────────────────────────────────────────────────
const flip = async (sock, msg) => {
  const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🔄';
  await msg.reply(`🪙 *Coin Flip*\n\nResult: *${result}*\n\n${config.footer()}`);
};

// ─── DICE ─────────────────────────────────────────────────────────────────────
const dice = async (sock, msg) => {
  const sides = parseInt(msg.args[0]) || 6;
  const result = Math.floor(Math.random() * sides) + 1;
  await msg.reply(`🎲 *Dice Roll (d${sides})*\n\nResult: *${result}*\n\n${config.footer()}`);
};

// ─── SLOTS ────────────────────────────────────────────────────────────────────
const slotEmojis = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];
const slots = async (sock, msg) => {
  const bet = parseInt(msg.args[0]) || 50;
  const user = getUser(msg.sender);
  if (user.coins < bet) return msg.reply(`❌ Not enough coins! You have *${user.coins}* coins.\n\n${config.footer()}`);
  user.coins -= bet;
  const s1 = random(slotEmojis), s2 = random(slotEmojis), s3 = random(slotEmojis);
  let result, prize = 0;
  if (s1 === s2 && s2 === s3) {
    prize = bet * (s1 === '💎' ? 10 : s1 === '7️⃣' ? 7 : 3);
    result = `🎰 *JACKPOT!* You won *${prize} coins*!`;
    user.coins += prize;
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    prize = bet;
    result = `🎰 *Two of a kind!* You get your bet back!`;
    user.coins += prize;
  } else {
    result = `🎰 *No match!* You lost *${bet} coins*.`;
  }
  saveDB();
  await msg.reply(`🎰 *Slot Machine*\n\n[ ${s1} | ${s2} | ${s3} ]\n\n${result}\n💰 Balance: ${user.coins} coins\n\n${config.footer()}`);
};

// ─── BLACKJACK ────────────────────────────────────────────────────────────────
const cardValues = { 'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10 };
const suits = ['♠️', '♥️', '♦️', '♣️'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const randCard = () => ({ rank: random(ranks), suit: random(suits) });
const handVal = (hand) => {
  let val = hand.reduce((s, c) => s + cardValues[c.rank], 0);
  let aces = hand.filter((c) => c.rank === 'A').length;
  while (val > 21 && aces) { val -= 10; aces--; }
  return val;
};

const blackjack = async (sock, msg) => {
  const bet = parseInt(msg.args[0]) || 50;
  const user = getUser(msg.sender);
  if (user.coins < bet) return msg.reply(`❌ Not enough coins!\n\n${config.footer()}`);
  user.coins -= bet;
  const playerHand = [randCard(), randCard()];
  const dealerHand = [randCard(), randCard()];
  const pv = handVal(playerHand);
  let result;
  if (pv === 21) {
    const prize = Math.floor(bet * 2.5);
    user.coins += prize;
    result = `🃏 *BLACKJACK!* You won *${prize} coins*!`;
  } else {
    let dv = handVal(dealerHand);
    while (dv < 17) { dealerHand.push(randCard()); dv = handVal(dealerHand); }
    if (dv > 21 || pv > dv) {
      const prize = bet * 2;
      user.coins += prize;
      result = `✅ *You Win!* Dealer busted/lower. +${prize} coins!`;
    } else if (pv === dv) {
      user.coins += bet;
      result = `🤝 *Tie!* Your bet returned.`;
    } else {
      result = `❌ *You Lose!* Dealer wins.`;
    }
  }
  saveDB();
  const ph = playerHand.map((c) => `${c.rank}${c.suit}`).join(' ');
  const dh = dealerHand.map((c) => `${c.rank}${c.suit}`).join(' ');
  await msg.reply(`🃏 *Blackjack*\n\n🧑 Your Hand: ${ph} (${handVal(playerHand)})\n🤖 Dealer: ${dh} (${handVal(dealerHand)})\n\n${result}\n💰 Balance: ${user.coins} coins\n\n${config.footer()}`);
};

// ─── ROCK PAPER SCISSORS ──────────────────────────────────────────────────────
const rps = async (sock, msg) => {
  const choices = ['rock', 'paper', 'scissors'];
  const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
  const userChoice = msg.args[0]?.toLowerCase();
  if (!choices.includes(userChoice)) return msg.reply(`Usage: ${config.prefix}rps <rock|paper|scissors>\n\n${config.footer()}`);
  const botChoice = random(choices);
  let result;
  if (userChoice === botChoice) result = '🤝 *Tie!*';
  else if ((userChoice === 'rock' && botChoice === 'scissors') || (userChoice === 'paper' && botChoice === 'rock') || (userChoice === 'scissors' && botChoice === 'paper')) result = '🏆 *You Win!*';
  else result = '❌ *Bot Wins!*';
  await msg.reply(`🎮 *Rock Paper Scissors*\n\nYou: ${emojis[userChoice]} ${userChoice}\nBot: ${emojis[botChoice]} ${botChoice}\n\n${result}\n\n${config.footer()}`);
};

// ─── NUMBER GUESS ─────────────────────────────────────────────────────────────
const numberGame = new Map();
const guess = async (sock, msg) => {
  const jid = msg.jid;
  const num = parseInt(msg.args[0]);
  if (!numberGame.has(jid)) {
    const target = Math.floor(Math.random() * 100) + 1;
    numberGame.set(jid, { target, attempts: 0 });
    return msg.reply(`🎮 *Number Guessing Game*\n\nI'm thinking of a number between 1-100!\nType ${config.prefix}guess <number> to guess!\n\n${config.footer()}`);
  }
  const game = numberGame.get(jid);
  game.attempts++;
  if (isNaN(num)) return msg.reply(`❌ Enter a valid number!\n\n${config.footer()}`);
  if (num === game.target) {
    numberGame.delete(jid);
    return msg.reply(`🎉 *Correct!* The number was *${game.target}*!\nYou guessed it in *${game.attempts}* attempts!\n\n${config.footer()}`);
  }
  const hint = num < game.target ? '⬆️ Too low!' : '⬇️ Too high!';
  await msg.reply(`${hint} Attempt ${game.attempts}. Try again!\n\n${config.footer()}`);
};

module.exports = {
  profile, leaderboard, daily, weekly, work, gift, flip, dice, slots, blackjack, rps, guess,
};
