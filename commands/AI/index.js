const config = require('../../config');
const axios = require('axios');

// ─── GPT / GENERAL AI CHAT ────────────────────────────────────────────────────
const ai = async (sock, msg) => {
  const prompt = msg.body || msg.quoted?.text;
  if (!prompt) return msg.reply(`Usage: ${config.prefix}ai <your question>\n\n${config.footer()}`);
  await msg.reply('🤖 Thinking...');
  try {
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}`,
      { timeout: 30000 }
    );
    const answer = data?.data || data?.result || data?.response || 'No response received.';
    await msg.reply(`🤖 *AI Response*\n\n${answer}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ AI failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const gpt = ai;

// ─── GEMINI AI ────────────────────────────────────────────────────────────────
const gemini = async (sock, msg) => {
  const prompt = msg.body || msg.quoted?.text;
  if (!prompt) return msg.reply(`Usage: ${config.prefix}gemini <your question>\n\n${config.footer()}`);
  await msg.reply('✨ Gemini is thinking...');
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.geminiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }
    );
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    await msg.reply(`✨ *Gemini AI*\n\n${answer}\n\n${config.footer()}`);
  } catch (err) {
    // Fallback to free API
    try {
      const { data: fd } = await axios.get(
        `https://api.siputzx.my.id/api/ai/gemini-pro?prompt=${encodeURIComponent(prompt)}`,
        { timeout: 30000 }
      );
      const ans = fd?.data || fd?.result || 'No response.';
      await msg.reply(`✨ *Gemini AI*\n\n${ans}\n\n${config.footer()}`);
    } catch (e) {
      await msg.reply(`❌ Gemini failed.\n\`${e.message}\`\n\n${config.footer()}`);
    }
  }
};

// ─── TEXT TO SPEECH ──────────────────────────────────────────────────────────
const tts = async (sock, msg) => {
  const parts = msg.body.split('|');
  const lang = parts[1]?.trim() || 'en';
  const text = parts[0]?.trim();
  if (!text) return msg.reply(`Usage: ${config.prefix}tts <text> | <lang>\nExample: .tts Hello World | en\n\n${config.footer()}`);
  await msg.reply('🔊 Generating speech...');
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    await msg.sendAudio(url, true);
  } catch (err) {
    await msg.reply(`❌ TTS failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── OCR ─────────────────────────────────────────────────────────────────────
const ocr = async (sock, msg) => {
  if (!msg.quoted?.message) return msg.reply(`❗ Quote an image to read text from it.`);
  await msg.reply('🔍 Reading text from image...');
  try {
    const { filePath } = await msg.quoted.download();
    const imgBuffer = require('fs').readFileSync(filePath);
    const b64 = imgBuffer.toString('base64');
    const { data } = await axios.post(
      'https://api.ocr.space/parse/image',
      { base64Image: `data:image/jpeg;base64,${b64}`, language: 'eng' },
      { headers: { apikey: 'helloworld' }, timeout: 30000 }
    );
    const text = data?.ParsedResults?.[0]?.ParsedText || 'No text found.';
    await msg.reply(`📝 *OCR Result*\n\n${text}\n\n${config.footer()}`);
    require('fs-extra').remove(filePath);
  } catch (err) {
    await msg.reply(`❌ OCR failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── TRANSLATE ───────────────────────────────────────────────────────────────
const translate = async (sock, msg) => {
  const parts = msg.body.split('|');
  const text = parts[0]?.trim();
  const lang = parts[1]?.trim() || 'en';
  if (!text) return msg.reply(`Usage: ${config.prefix}translate <text> | <target lang>\nExample: .translate Hello | es\n\n${config.footer()}`);
  await msg.reply('🌐 Translating...');
  try {
    const { data } = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`,
      { timeout: 15000 }
    );
    const result = data?.responseData?.translatedText || 'Translation failed.';
    await msg.reply(`🌐 *Translation* (→ ${lang.toUpperCase()})\n\n📝 Original: ${text}\n✅ Translated: ${result}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Translation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── AI IMAGE GENERATION ──────────────────────────────────────────────────────
const imagine = async (sock, msg) => {
  const prompt = msg.body;
  if (!prompt) return msg.reply(`Usage: ${config.prefix}imagine <description>\n\n${config.footer()}`);
  await msg.reply(`🎨 Generating image: *"${prompt}"*...\nThis may take 10-30 seconds...`);
  try {
    const { data } = await axios.get(
      `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=1024&height=1024`,
      { responseType: 'arraybuffer', timeout: 60000 }
    );
    const imgBuffer = Buffer.from(data);
    await sock.sendMessage(msg.jid, {
      image: imgBuffer,
      caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${prompt}\n\n${config.footer()}`,
    }, { quoted: msg });
  } catch (err) {
    await msg.reply(`❌ Image generation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const dalle = imagine;
const sd = imagine;

// ─── TEXT SUMMARY ─────────────────────────────────────────────────────────────
const summary = async (sock, msg) => {
  const text = msg.body || msg.quoted?.text;
  if (!text) return msg.reply(`Usage: ${config.prefix}summary <long text>\n\n${config.footer()}`);
  await msg.reply('📝 Summarizing...');
  try {
    const prompt = `Summarize the following text in 3-5 bullet points:\n\n${text}`;
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}`,
      { timeout: 30000 }
    );
    const result = data?.data || data?.result || 'Could not summarize.';
    await msg.reply(`📋 *Summary*\n\n${result}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Summary failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── CODE GENERATION ─────────────────────────────────────────────────────────
const codegen = async (sock, msg) => {
  const prompt = msg.body;
  if (!prompt) return msg.reply(`Usage: ${config.prefix}codegen <describe what code you need>\n\n${config.footer()}`);
  await msg.reply('💻 Generating code...');
  try {
    const fullPrompt = `Write code for: ${prompt}. Provide the code only with comments.`;
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(fullPrompt)}`,
      { timeout: 30000 }
    );
    const result = data?.data || data?.result || 'Code generation failed.';
    await msg.reply(`💻 *Generated Code*\n\n\`\`\`\n${result}\n\`\`\`\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Code generation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const codefix = async (sock, msg) => {
  const code = msg.body || msg.quoted?.text;
  if (!code) return msg.reply(`Usage: ${config.prefix}codefix <broken code>\n\n${config.footer()}`);
  await msg.reply('🔧 Fixing code...');
  try {
    const prompt = `Fix the following code and explain the bugs you found:\n\n${code}`;
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}`,
      { timeout: 30000 }
    );
    const result = data?.data || data?.result || 'Could not fix code.';
    await msg.reply(`🔧 *Fixed Code*\n\n${result}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Code fix failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

const codeexplain = async (sock, msg) => {
  const code = msg.body || msg.quoted?.text;
  if (!code) return msg.reply(`Usage: ${config.prefix}codeexplain <code>\n\n${config.footer()}`);
  await msg.reply('📖 Explaining code...');
  try {
    const prompt = `Explain this code in simple terms:\n\n${code}`;
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}`,
      { timeout: 30000 }
    );
    const result = data?.data || data?.result || 'Could not explain.';
    await msg.reply(`📖 *Code Explanation*\n\n${result}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Code explanation failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

// ─── WRITING COMMANDS ─────────────────────────────────────────────────────────
const makeWriter = (type) => async (sock, msg) => {
  const topic = msg.body;
  if (!topic) return msg.reply(`Usage: ${config.prefix}${type} <topic>\n\n${config.footer()}`);
  await msg.reply(`✍️ Writing ${type}...`);
  try {
    const prompts = {
      essay: `Write a short essay about: ${topic}`,
      blog: `Write a blog post about: ${topic}`,
      story: `Write a creative short story about: ${topic}`,
      poem: `Write a beautiful poem about: ${topic}`,
      letter: `Write a formal letter about: ${topic}`,
      email: `Write a professional email about: ${topic}`,
    };
    const { data } = await axios.get(
      `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompts[type] || topic)}`,
      { timeout: 30000 }
    );
    const result = data?.data || data?.result || 'Could not generate content.';
    await msg.reply(`✍️ *${type.charAt(0).toUpperCase() + type.slice(1)}*\n\n${result}\n\n${config.footer()}`);
  } catch (err) {
    await msg.reply(`❌ Writing failed.\n\`${err.message}\`\n\n${config.footer()}`);
  }
};

module.exports = {
  ai, gpt, gemini, tts, ocr, translate, imagine, dalle, sd, summary,
  codegen, codefix, codeexplain,
  essay: makeWriter('essay'),
  blog: makeWriter('blog'),
  story: makeWriter('story'),
  poem: makeWriter('poem'),
  letter: makeWriter('letter'),
  email: makeWriter('email'),
};
