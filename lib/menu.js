const config = require('../config');
const { randomMenuImage, timeNow, dateNow } = require('./utils');

// ─── Animated Loading Frames ──────────────────────────────────────────────────
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// ─── Dark Royal Menu Builder ──────────────────────────────────────────────────
function buildMenu(ownerName, botName, totalCmds) {
  const time = timeNow();
  const date = dateNow();

  return `
╔══════════════════════════╗
║  🔱 *MARCO MALIK MD BOT* 🔱  ║
╚══════════════════════════╝

┌─────────────────────────
│ 👑 *Owner:* ${ownerName}
│ 🤖 *Bot:* ${botName}
│ ⚡ *Prefix:* ${config.prefix}
│ 🕐 *Time:* ${time}
│ 📅 *Date:* ${date}
│ 🗂️ *Commands:* ${totalCmds}+
│ 🌐 *Version:* ${config.botVersion}
└─────────────────────────

╔══════════════════════════╗
║  📋 *COMMAND CATEGORIES*  ║
╚══════════════════════════╝

┌ 👑 *OWNER COMMANDS*
├ 👥 *GROUP COMMANDS*
├ 🤖 *AI COMMANDS*
├ 🎉 *FUN COMMANDS*
├ ⬇️ *DOWNLOADER*
├ 🔍 *SEARCH COMMANDS*
├ 📽️ *MEDIA COMMANDS*
├ 🎭 *STICKER COMMANDS*
├ 🎮 *GAME COMMANDS*
├ 🛠️ *TOOLS COMMANDS*
├ ⚙️ *UTILITY COMMANDS*
├ 🔄 *CONVERTER*
├ 💻 *TECH COMMANDS*
└ 💬 *GENERAL COMMANDS*

*Type ${config.prefix}menu <category> for commands*
*Example: ${config.prefix}menu owner*

${config.footer()}`.trim();
}

// ─── Category Menus ───────────────────────────────────────────────────────────
const categoryMenus = {
  owner: (botName) => `
╔══════════════════════════╗
║  👑 *OWNER COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Bot Control*
├ ${config.prefix}shutdown — Shut down bot
├ ${config.prefix}restart — Restart bot
├ ${config.prefix}update — Update bot
├ ${config.prefix}setname — Set bot name
├ ${config.prefix}setbio — Set bot bio
├ ${config.prefix}setpp — Set bot profile pic
├ ${config.prefix}getpp — Get profile pic
│
│ *User Management*
├ ${config.prefix}ban — Ban a user
├ ${config.prefix}unban — Unban a user
├ ${config.prefix}banlist — List banned users
├ ${config.prefix}addpremium — Add premium user
├ ${config.prefix}delpremium — Remove premium
├ ${config.prefix}premiumlist — List premium users
│
│ *Broadcast*
├ ${config.prefix}broadcast — Broadcast message
├ ${config.prefix}bcall — Broadcast to all groups
├ ${config.prefix}bcprivate — Broadcast to DMs
│
│ *Group Management (Owner)*
├ ${config.prefix}gjoin — Join a group via link
├ ${config.prefix}gleave — Leave a group
├ ${config.prefix}gcreate — Create a group
├ ${config.prefix}glist — List all groups
│
│ *System*
├ ${config.prefix}stats — Bot statistics
├ ${config.prefix}eval — Eval code
├ ${config.prefix}exec — Execute shell command
├ ${config.prefix}setmode — Set bot mode
├ ${config.prefix}cleardb — Clear database
├ ${config.prefix}cleartmp — Clear temp files
├ ${config.prefix}memory — Check bot memory
├ ${config.prefix}speed — Check bot speed
└─────────────────────────
${config.footer()}`.trim(),

  group: () => `
╔══════════════════════════╗
║  👥 *GROUP COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Admin Commands*
├ ${config.prefix}kick — Kick a member
├ ${config.prefix}add — Add a member
├ ${config.prefix}promote — Promote to admin
├ ${config.prefix}demote — Demote from admin
├ ${config.prefix}mute — Mute group
├ ${config.prefix}unmute — Unmute group
├ ${config.prefix}lock — Lock group
├ ${config.prefix}unlock — Unlock group
│
│ *Group Info*
├ ${config.prefix}groupinfo — Group information
├ ${config.prefix}memberlist — List members
├ ${config.prefix}adminlist — List admins
├ ${config.prefix}invitelink — Get invite link
├ ${config.prefix}revoke — Revoke invite link
│
│ *Group Settings*
├ ${config.prefix}antilink — Toggle anti-link
├ ${config.prefix}antispam — Toggle anti-spam
├ ${config.prefix}antinsfw — Toggle anti-NSFW
├ ${config.prefix}welcome — Toggle welcome msg
├ ${config.prefix}goodbye — Toggle goodbye msg
├ ${config.prefix}setwelcome — Set welcome message
├ ${config.prefix}setgoodbye — Set goodbye message
│
│ *Group Utilities*
├ ${config.prefix}tagall — Tag all members
├ ${config.prefix}hidetag — Hidden tag all
├ ${config.prefix}poll — Create a poll
├ ${config.prefix}setdesc — Set group description
├ ${config.prefix}seticon — Set group icon
├ ${config.prefix}setname — Set group name
├ ${config.prefix}warn — Warn a member
├ ${config.prefix}warnlist — List warns
├ ${config.prefix}clearwarn — Clear all warns
└─────────────────────────
${config.footer()}`.trim(),

  ai: () => `
╔══════════════════════════╗
║  🤖 *AI COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Chat AI*
├ ${config.prefix}ai — Chat with AI (GPT-4)
├ ${config.prefix}gpt — GPT-4 Turbo
├ ${config.prefix}gemini — Google Gemini AI
├ ${config.prefix}claude — Claude AI
├ ${config.prefix}llama — Llama AI
├ ${config.prefix}mistral — Mistral AI
│
│ *Image AI*
├ ${config.prefix}imagine — Generate AI image
├ ${config.prefix}dalle — DALL-E 3 Image
├ ${config.prefix}sd — Stable Diffusion
├ ${config.prefix}aipfp — AI Profile Picture
├ ${config.prefix}enhance — Enhance image quality
├ ${config.prefix}upscale — Upscale image
├ ${config.prefix}colorize — Colorize old image
│
│ *Voice & Audio AI*
├ ${config.prefix}tts — Text to Speech
├ ${config.prefix}stt — Speech to Text
├ ${config.prefix}voiceclone — Clone a voice
│
│ *Analysis AI*
├ ${config.prefix}ocr — Read text from image
├ ${config.prefix}imgdesc — Describe an image
├ ${config.prefix}translate — AI translation
├ ${config.prefix}sentiment — Analyze sentiment
├ ${config.prefix}summary — Summarize text
│
│ *Code AI*
├ ${config.prefix}codegen — Generate code
├ ${config.prefix}codefix — Fix code bugs
├ ${config.prefix}codeexplain — Explain code
├ ${config.prefix}codetranslate — Translate code
│
│ *Writing AI*
├ ${config.prefix}essay — Write an essay
├ ${config.prefix}blog — Write a blog post
├ ${config.prefix}story — Write a story
├ ${config.prefix}poem — Write a poem
├ ${config.prefix}letter — Write a letter
├ ${config.prefix}email — Write an email
└─────────────────────────
${config.footer()}`.trim(),

  fun: () => `
╔══════════════════════════╗
║  🎉 *FUN COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Random Fun*
├ ${config.prefix}joke — Random joke
├ ${config.prefix}dare — Truth or Dare (dare)
├ ${config.prefix}truth — Truth or Dare (truth)
├ ${config.prefix}roast — Roast someone
├ ${config.prefix}compliment — Compliment someone
├ ${config.prefix}pickup — Pickup line
├ ${config.prefix}quote — Random quote
├ ${config.prefix}fact — Random fact
├ ${config.prefix}riddle — Random riddle
├ ${config.prefix}trivia — Random trivia
├ ${config.prefix}funfact — Fun fact
│
│ *Personality*
├ ${config.prefix}ship — Ship two people
├ ${config.prefix}rate — Rate anything
├ ${config.prefix}iq — Check IQ (fun)
├ ${config.prefix}love — Love percentage
├ ${config.prefix}gay — Gay percentage
├ ${config.prefix}smart — Smart percentage
├ ${config.prefix}lucky — Lucky percentage
│
│ *Random Media*
├ ${config.prefix}meme — Random meme
├ ${config.prefix}neko — Anime neko image
├ ${config.prefix}waifu — Random waifu
├ ${config.prefix}dog — Random dog image
├ ${config.prefix}cat — Random cat image
├ ${config.prefix}fox — Random fox image
├ ${config.prefix}panda — Random panda
│
│ *Text Fun*
├ ${config.prefix}mock — Mock text
├ ${config.prefix}reverse — Reverse text
├ ${config.prefix}clap — 👏Clap👏text
├ ${config.prefix}aesthetic — Ａｅｓｔｈｅｔｉｃ text
├ ${config.prefix}zalgo — Z̴̡a̷͝l̶̓g̴͝o̷ text
├ ${config.prefix}small — ˢᵐᵃˡˡ text
├ ${config.prefix}bold — 𝐁𝐨𝐥𝐝 text
├ ${config.prefix}italic — 𝘐𝘵𝘢𝘭𝘪𝘤 text
└─────────────────────────
${config.footer()}`.trim(),

  downloader: () => `
╔══════════════════════════╗
║  ⬇️ *DOWNLOADER*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Video Downloaders*
├ ${config.prefix}yt — YouTube video/audio
├ ${config.prefix}ytmp4 — YouTube to MP4
├ ${config.prefix}ytmp3 — YouTube to MP3
├ ${config.prefix}tiktok — TikTok video
├ ${config.prefix}ttaudio — TikTok audio only
├ ${config.prefix}instagram — Instagram post
├ ${config.prefix}igreel — Instagram reel
├ ${config.prefix}igstory — Instagram story
├ ${config.prefix}fb — Facebook video
├ ${config.prefix}fbhd — Facebook HD video
├ ${config.prefix}twitter — Twitter video
├ ${config.prefix}twgif — Twitter GIF
├ ${config.prefix}pinterest — Pinterest video/img
├ ${config.prefix}likee — Likee video
├ ${config.prefix}capcut — CapCut video
├ ${config.prefix}snackvideo — SnackVideo
│
│ *Music Downloaders*
├ ${config.prefix}play — Search & download song
├ ${config.prefix}song — Download song by name
├ ${config.prefix}spotify — Spotify track
├ ${config.prefix}soundcloud — SoundCloud track
├ ${config.prefix}apple — Apple Music track
├ ${config.prefix}joox — JOOX music
│
│ *Movie Downloaders*
├ ${config.prefix}movie — Search & download movie
├ ${config.prefix}netflix — Netflix content info
├ ${config.prefix}anime — Anime downloader
│
│ *APK Downloaders*
├ ${config.prefix}apk — Download APK from store
├ ${config.prefix}modapk — Download mod APK
├ ${config.prefix}gapk — Google Play APK
│
│ *Other Downloaders*
├ ${config.prefix}imgdl — Download image
├ ${config.prefix}gifdl — Download GIF
├ ${config.prefix}docdl — Download document
├ ${config.prefix}drive — Download from Google Drive
└─────────────────────────
${config.footer()}`.trim(),

  search: () => `
╔══════════════════════════╗
║  🔍 *SEARCH COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Web Search*
├ ${config.prefix}google — Google search
├ ${config.prefix}bing — Bing search
├ ${config.prefix}ddg — DuckDuckGo search
│
│ *Media Search*
├ ${config.prefix}ytsearch — YouTube search
├ ${config.prefix}imgsearch — Image search
├ ${config.prefix}gifsearch — GIF search
├ ${config.prefix}spotifysearch — Spotify search
│
│ *Info Search*
├ ${config.prefix}wiki — Wikipedia search
├ ${config.prefix}weather — Weather info
├ ${config.prefix}news — Latest news
├ ${config.prefix}trending — Trending topics
│
│ *Social Search*
├ ${config.prefix}iguser — Instagram user info
├ ${config.prefix}ghuser — GitHub user info
├ ${config.prefix}ttuser — TikTok user info
├ ${config.prefix}twuser — Twitter user info
│
│ *Product Search*
├ ${config.prefix}amazon — Amazon search
├ ${config.prefix}ebay — eBay search
├ ${config.prefix}shopee — Shopee search
│
│ *Other Search*
├ ${config.prefix}lyrics — Song lyrics
├ ${config.prefix}define — Dictionary definition
├ ${config.prefix}urban — Urban Dictionary
├ ${config.prefix}anime — Anime search (MAL)
├ ${config.prefix}manga — Manga search
├ ${config.prefix}movie — Movie search (IMDB)
├ ${config.prefix}book — Book search
├ ${config.prefix}npm — NPM package search
└─────────────────────────
${config.footer()}`.trim(),

  tools: () => `
╔══════════════════════════╗
║  🛠️ *TOOLS COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Web Tools*
├ ${config.prefix}html2web — HTML to live website
├ ${config.prefix}srcview — View website source code
├ ${config.prefix}linkinfo — Expand/analyze URL
├ ${config.prefix}screenshot — Capture website screenshot
├ ${config.prefix}whois — WHOIS domain lookup
├ ${config.prefix}dns — DNS lookup
├ ${config.prefix}ping — Ping a website
├ ${config.prefix}headers — View HTTP headers
│
│ *Security Tools*
├ ${config.prefix}iplookup — IP address lookup
├ ${config.prefix}traceroute — Traceroute IP
├ ${config.prefix}portcheck — Check open port
├ ${config.prefix}virustotal — Scan URL/file
│
│ *Developer Tools*
├ ${config.prefix}encode — Encode text (Base64)
├ ${config.prefix}decode — Decode text (Base64)
├ ${config.prefix}hash — Hash text (MD5/SHA)
├ ${config.prefix}json — Format JSON
├ ${config.prefix}xml — Format XML
├ ${config.prefix}minify — Minify code
├ ${config.prefix}prettify — Prettify code
├ ${config.prefix}regex — Test Regex pattern
│
│ *Text Tools*
├ ${config.prefix}wordcount — Count words
├ ${config.prefix}charcount — Count characters
├ ${config.prefix}findreplace — Find and replace text
├ ${config.prefix}extractlink — Extract links from text
├ ${config.prefix}extractemail — Extract emails
├ ${config.prefix}extractphone — Extract phone numbers
└─────────────────────────
${config.footer()}`.trim(),

  sticker: () => `
╔══════════════════════════╗
║  🎭 *STICKER COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
├ ${config.prefix}sticker — Create sticker from image
├ ${config.prefix}stickerv — Create sticker from video
├ ${config.prefix}take — Change sticker pack/author
├ ${config.prefix}toimg — Sticker to image
├ ${config.prefix}tovideo — Sticker to video
├ ${config.prefix}crop — Crop image/sticker
├ ${config.prefix}circle — Circle crop sticker
├ ${config.prefix}blur — Blur image
├ ${config.prefix}sharpen — Sharpen image
├ ${config.prefix}grayscale — Grayscale image
├ ${config.prefix}invert — Invert image colors
├ ${config.prefix}flip — Flip image
├ ${config.prefix}rotate — Rotate image
├ ${config.prefix}emoji — Text emoji sticker
├ ${config.prefix}animsticker — Animated sticker
├ ${config.prefix}gensticker — Generate custom sticker
└─────────────────────────
${config.footer()}`.trim(),

  game: () => `
╔══════════════════════════╗
║  🎮 *GAME COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Classic Games*
├ ${config.prefix}ttt — Tic-Tac-Toe
├ ${config.prefix}rps — Rock Paper Scissors
├ ${config.prefix}quiz — Trivia quiz
├ ${config.prefix}wordgame — Word chain game
├ ${config.prefix}hangman — Hangman game
├ ${config.prefix}guess — Number guessing game
├ ${config.prefix}slots — Slot machine
├ ${config.prefix}blackjack — Blackjack card game
├ ${config.prefix}flip — Coin flip
├ ${config.prefix}dice — Roll dice
├ ${config.prefix}roulette — Roulette game
│
│ *RPG/Economy*
├ ${config.prefix}profile — View your profile
├ ${config.prefix}leaderboard — Top XP players
├ ${config.prefix}daily — Daily rewards
├ ${config.prefix}weekly — Weekly rewards
├ ${config.prefix}work — Work for coins
├ ${config.prefix}rob — Rob coins from user
├ ${config.prefix}gift — Gift coins to user
├ ${config.prefix}shop — Item shop
├ ${config.prefix}buy — Buy an item
├ ${config.prefix}inventory — Your inventory
├ ${config.prefix}use — Use an item
└─────────────────────────
${config.footer()}`.trim(),

  utility: () => `
╔══════════════════════════╗
║  ⚙️ *UTILITY COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Calculator*
├ ${config.prefix}calc — Calculator
├ ${config.prefix}math — Complex math
├ ${config.prefix}currency — Currency convert
├ ${config.prefix}bmi — BMI calculator
├ ${config.prefix}percentage — Percentage calc
│
│ *Time & Date*
├ ${config.prefix}time — Current time
├ ${config.prefix}date — Current date
├ ${config.prefix}worldtime — Time in any city
├ ${config.prefix}countdown — Countdown timer
├ ${config.prefix}calendar — Calendar view
├ ${config.prefix}age — Calculate age
│
│ *Personal Utilities*
├ ${config.prefix}reminder — Set reminder
├ ${config.prefix}todo — To-do list
├ ${config.prefix}note — Save a note
├ ${config.prefix}notes — View all notes
├ ${config.prefix}delnote — Delete note
├ ${config.prefix}password — Generate password
├ ${config.prefix}qr — Generate QR code
├ ${config.prefix}readqr — Read QR code
│
│ *Bot Settings*
├ ${config.prefix}prefix — Change prefix (owner)
├ ${config.prefix}ping — Bot ping
├ ${config.prefix}uptime — Bot uptime
├ ${config.prefix}info — Bot info
└─────────────────────────
${config.footer()}`.trim(),

  converter: () => `
╔══════════════════════════╗
║  🔄 *CONVERTER*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Media Converters*
├ ${config.prefix}mp4tomp3 — Convert MP4 to MP3
├ ${config.prefix}mp3tomp4 — Convert MP3 to MP4
├ ${config.prefix}webptomp4 — WebP to MP4
├ ${config.prefix}mp4towebp — MP4 to WebP sticker
├ ${config.prefix}imgtopdf — Image to PDF
├ ${config.prefix}pdftoimag — PDF to image
├ ${config.prefix}imgtowebp — Image to WebP
│
│ *Text Converters*
├ ${config.prefix}text2img — Text to image
├ ${config.prefix}text2pdf — Text to PDF
├ ${config.prefix}text2speech — Text to speech
├ ${config.prefix}speech2text — Speech to text
│
│ *Unit Converters*
├ ${config.prefix}kgtolbs — KG to LBS
├ ${config.prefix}lbstokg — LBS to KG
├ ${config.prefix}kmtomile — KM to Miles
├ ${config.prefix}miletokm — Miles to KM
├ ${config.prefix}ctof — Celsius to Fahrenheit
├ ${config.prefix}ftoc — Fahrenheit to Celsius
│
│ *Number Converters*
├ ${config.prefix}bin — Decimal to Binary
├ ${config.prefix}hex — Decimal to Hex
├ ${config.prefix}oct — Decimal to Octal
├ ${config.prefix}roman — Number to Roman numerals
└─────────────────────────
${config.footer()}`.trim(),

  tech: () => `
╔══════════════════════════╗
║  💻 *TECH COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Web Tools*
├ ${config.prefix}html2web — Host HTML as website
├ ${config.prefix}srcview — View page source code
├ ${config.prefix}htmlrender — Render HTML snippet
├ ${config.prefix}cssrender — Render CSS style
├ ${config.prefix}jsrun — Run JavaScript code
├ ${config.prefix}pyrun — Run Python code
├ ${config.prefix}crun — Run C code
│
│ *Network*
├ ${config.prefix}myip — Show your IP info
├ ${config.prefix}geoip — Geolocate IP address
├ ${config.prefix}isup — Check if site is up
├ ${config.prefix}speedtest — Internet speed test
├ ${config.prefix}curl — cURL a URL
│
│ *Security*
├ ${config.prefix}passcheck — Check password strength
├ ${config.prefix}leak — Check email data breach
├ ${config.prefix}md5 — MD5 hash text
├ ${config.prefix}sha256 — SHA256 hash
├ ${config.prefix}base64enc — Base64 encode
├ ${config.prefix}base64dec — Base64 decode
├ ${config.prefix}urlencode — URL encode
├ ${config.prefix}urldecode — URL decode
│
│ *Devtools*
├ ${config.prefix}uuid — Generate UUID
├ ${config.prefix}lorem — Generate Lorem Ipsum
├ ${config.prefix}color — Color code info
├ ${config.prefix}fonttest — Font style test
└─────────────────────────
${config.footer()}`.trim(),

  media: () => `
╔══════════════════════════╗
║  📽️ *MEDIA COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
│ *Image Effects*
├ ${config.prefix}blur — Blur an image
├ ${config.prefix}sharpen — Sharpen image
├ ${config.prefix}grayscale — Convert to B&W
├ ${config.prefix}invert — Invert colors
├ ${config.prefix}sepia — Sepia filter
├ ${config.prefix}vintage — Vintage look
├ ${config.prefix}cartoon — Cartoonify image
├ ${config.prefix}sketch — Sketch effect
├ ${config.prefix}neon — Neon glow effect
├ ${config.prefix}oil — Oil painting effect
│
│ *Video*
├ ${config.prefix}trimvideo — Trim video
├ ${config.prefix}mergev — Merge audio+video
├ ${config.prefix}gifmaker — Image sequence to GIF
├ ${config.prefix}slowmo — Slow motion video
├ ${config.prefix}speed — Speed up video
├ ${config.prefix}reverse — Reverse video
│
│ *Audio*
├ ${config.prefix}pitch — Change audio pitch
├ ${config.prefix}bass — Boost bass
├ ${config.prefix}echo — Add echo effect
├ ${config.prefix}nightcore — Nightcore effect
├ ${config.prefix}8d — 8D audio effect
│
│ *Image Editing*
├ ${config.prefix}resize — Resize image
├ ${config.prefix}crop — Crop image
├ ${config.prefix}watermark — Add watermark
├ ${config.prefix}caption — Add caption to image
├ ${config.prefix}frame — Add frame to image
├ ${config.prefix}banner — Create banner
└─────────────────────────
${config.footer()}`.trim(),

  general: () => `
╔══════════════════════════╗
║  💬 *GENERAL COMMANDS*  ║
╚══════════════════════════╝

┌─────────────────────────
├ ${config.prefix}menu — Show main menu
├ ${config.prefix}help — Show help
├ ${config.prefix}ping — Bot ping
├ ${config.prefix}info — Bot information
├ ${config.prefix}uptime — Bot uptime
├ ${config.prefix}speed — Speed test
├ ${config.prefix}donate — Donation info
├ ${config.prefix}owner — Contact owner
├ ${config.prefix}channel — Bot channel link
├ ${config.prefix}privacy — Privacy policy
├ ${config.prefix}rules — Bot usage rules
├ ${config.prefix}about — About this bot
└─────────────────────────
${config.footer()}`.trim(),
};

module.exports = { buildMenu, categoryMenus, randomMenuImage };
