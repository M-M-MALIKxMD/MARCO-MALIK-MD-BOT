# 🤖 Marco Malik MD WhatsApp Bot - Version 12

> **Professional Multi-Device WhatsApp Bot with 600+ commands**
> Powered By: Marco Malik

---

## 🔱 Features

- ✅ 600+ Fully Working Commands
- ✅ AI Commands (GPT-4, Gemini, Image Generation, OCR)
- ✅ Media Downloaders (YouTube, TikTok, Instagram, Facebook, Twitter, Spotify)
- ✅ APK Downloader
- ✅ Movie Search & Info
- ✅ Group Management Tools
- ✅ Fun & Games (Blackjack, Slots, RPG Economy)
- ✅ Sticker Maker & Image Effects
- ✅ Tech Tools (HTML to Website, Source Viewer, IP Lookup)
- ✅ Anti-Spam, Anti-Link, Anti-NSFW
- ✅ Welcome/Goodbye Messages
- ✅ XP & Level System
- ✅ Economy System (Coins, Daily/Weekly Rewards)
- ✅ Professional Dark Royal Web Panel
- ✅ Deploy Ready (Railway, Render, Heroku, VPS, Replit)

---

## 📋 Requirements

- Node.js 18+
- npm
- ffmpeg (for media conversion)
- Git

---

## ⚡ Quick Start

### 1. Clone / Download

```bash
git clone https://github.com/yourusername/marco-malik-bot.git
cd marco-malik-bot
```

### 2. Install

```bash
bash install.sh
```

### 3. Configure

Edit your `.env` file:

```env
OWNER_NAME=MARCO MALIK MD
OWNER_NUMBER=923706328012
BOT_NAME=MARCO MALIK MD BOT
PREFIX=.
CHANNEL_LINK=https://whatsapp.com/channel/0029Vb2RnBlHgZWeOydeRV1H
```

### 4. Start

```bash
bash start.sh
```

Scan the QR code with WhatsApp to connect.

---

## 🌐 Web Panel

The bot includes a live web panel at: `http://localhost:3000`

Features:
- Live bot status
- Real-time stats (uptime, memory)
- Session ID guide
- Deploy buttons
- Channel & Contact links

---

## 📁 Project Structure

```
marco-malik-bot/
├── index.js            # Main bot entry
├── config.js           # All configuration
├── .env.example        # Environment template
├── package.json
├── Dockerfile
├── Procfile            # Heroku
├── render.yaml         # Render
├── railway.json        # Railway
├── start.sh            # Start script
├── install.sh          # Install script
│
├── commands/
│   ├── owner/          # 25+ owner commands
│   ├── group/          # 25+ group commands
│   ├── fun/            # 25+ fun commands
│   ├── ai/             # 20+ AI commands
│   ├── downloader/     # 20+ download commands
│   ├── search/         # 15+ search commands
│   ├── tools/          # 15+ web tools
│   ├── sticker/        # 12+ sticker commands
│   ├── game/           # 12+ game commands
│   ├── utility/        # 15+ utility commands
│   ├── converter/      # 15+ converter commands
│   ├── tech/           # 15+ tech commands
│   ├── media/          # 10+ media commands
│   └── general/        # 8+ general commands
│
├── lib/
│   ├── handler.js      # Command handler
│   ├── serialize.js    # Message serializer
│   ├── menu.js         # Menu builder
│   ├── utils.js        # Utilities
│   ├── db.js           # Local database
│   └── logger.js       # Logger
│
├── panel/
│   ├── server.js       # Express + Socket.IO
│   ├── index.html      # Dark royal web panel
│   ├── css/style.css   # Panel styles
│   └── js/script.js    # Panel scripts
│
├── session/            # WhatsApp session (auto-created)
├── tmp/                # Temp files (auto-cleaned)
└── data/               # Bot database
```

---

## 🚀 Deployment

### Railway

1. Push to GitHub
2. Connect GitHub repo to Railway
3. Add environment variables from `.env.example`
4. Deploy!

### Render

```bash
# Uses render.yaml automatically
# Just connect your GitHub repo
```

### Heroku

```bash
heroku create your-bot-name
heroku config:set OWNER_NUMBER=923706328012
heroku config:set BOT_NAME=MarcoBot
git push heroku main
```

### Docker / VPS

```bash
docker build -t marco-malik-md-bot .
docker run -d --name bot \
  -e OWNER_NUMBER=923706328012 \
  -e BOT_NAME=MarcoBot \
  -p 3000:3000 \
  marco-malik-bot
```

### Replit

1. Import project to Replit
2. Add secrets from `.env.example` in Replit Secrets
3. Click Run

---

## ✏️ Customization

Edit `config.js` or `.env` to change:

| Setting | Variable |
|---|---|
| Bot Name | `MARCO MALIK MD BOT` |
| Owner Name | `MARCO MALIK` |
| Owner Number | `MARCO MALIK` |
| Command Prefix | `.` |
| Channel Link | `CHANNEL_LINK` |
| Powered By | `MARCO MALIK` |
| Menu Images | `config.menuImages` array in `config.js` |
| Bot Mode | `BOT_MODE` (public/private) |

---

## 📜 Commands List

| Category | Commands |
|---|---|
| 👑 Owner | shutdown, restart, ban, unban, broadcast, stats, eval, exec... |
| 👥 Group | kick, add, promote, demote, mute, tagall, warn, antilink... |
| 🤖 AI | ai, gpt, gemini, imagine, tts, ocr, translate, codegen... |
| ⬇️ Downloader | ytmp3, ytmp4, tiktok, instagram, fb, twitter, apk, movie... |
| 🔍 Search | wiki, weather, lyrics, define, urban, ghuser, anime... |
| 🛠️ Tools | screenshot, html2web, srcview, iplookup, qr, hash, json... |
| 🎉 Fun | joke, dare, truth, roast, ship, iq, meme, dog, cat... |
| 🎭 Sticker | sticker, toimg, blur, grayscale, circle, crop, invert... |
| 🎮 Game | profile, daily, weekly, slots, blackjack, rps, guess... |
| ⚙️ Utility | ping, calc, currency, bmi, age, password, worldtime... |
| 🔄 Converter | mp4tomp3, imgtowebp, text2img, kgtolbs, ctof, roman... |
| 💻 Tech | myip, geoip, md5, sha256, base64enc, urlencode, jsrun... |
| 📽️ Media | sepia, resize, watermark, trimvideo, pitch, 8d... |
| 💬 General | menu, help, about, channel, owner, privacy, rules... |

---

## 📞 Support

- 👑 Owner: [Marco Malik](https://wa.me/923706328012)
- 📢 Channel: [Join Channel](https://whatsapp.com/channel/0029Vb2RnBlHgZWeOydeRV1H)

---

## 📜 License

MIT License — Free to use and modify.

---

> 🔱 **Powered By Marco Malik** — Professional WhatsApp MD Bot
