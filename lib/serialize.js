const {
  getContentType,
  downloadContentFromMessage,
  proto,
  jidNormalizedUser,
} = require('@whiskeysockets/baileys');
const config = require('../config');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

function getMessageType(msg) {
  const content = msg.message;
  if (!content) return null;
  const type = getContentType(content);
  if (type === 'ephemeralMessage') {
    return getContentType(content.ephemeralMessage?.message);
  }
  return type;
}

function extractText(msg) {
  const type = getMessageType(msg);
  const content = msg.message;
  if (!content) return '';

  if (type === 'conversation') return content.conversation;
  if (type === 'extendedTextMessage') return content.extendedTextMessage?.text;
  if (type === 'imageMessage') return content.imageMessage?.caption || '';
  if (type === 'videoMessage') return content.videoMessage?.caption || '';
  if (type === 'documentMessage') return content.documentMessage?.caption || '';
  if (type === 'buttonsResponseMessage') return content.buttonsResponseMessage?.selectedButtonId;
  if (type === 'listResponseMessage') return content.listResponseMessage?.singleSelectReply?.selectedRowId;
  if (type === 'templateButtonReplyMessage') return content.templateButtonReplyMessage?.selectedId;
  return '';
}

async function downloadMedia(msg) {
  const type = getMessageType(msg);
  const content = msg.message;
  if (!content) return null;

  const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
  if (!mediaTypes.includes(type)) return null;

  const media = content[type];
  const stream = await downloadContentFromMessage(media, type.replace('Message', ''));

  const tmpDir = path.join(__dirname, '../tmp');
  await fs.ensureDir(tmpDir);

  const ext = {
    imageMessage: 'jpg',
    videoMessage: 'mp4',
    audioMessage: 'mp3',
    documentMessage: media.fileName?.split('.').pop() || 'bin',
    stickerMessage: 'webp',
  }[type] || 'bin';

  const filePath = path.join(tmpDir, `${uuidv4()}.${ext}`);
  const buffer = [];
  for await (const chunk of stream) buffer.push(chunk);
  await fs.writeFile(filePath, Buffer.concat(buffer));

  return { filePath, ext, mimeType: media.mimetype };
}

function serialize(sock, msg, store) {
  const jid = msg.key.remoteJid || '';
  const sender = msg.key.fromMe
    ? sock.user.id
    : jid.endsWith('@g.us')
    ? msg.key.participant || msg.participant || ''
    : jid;

  const senderNumber = sender.split('@')[0].split(':')[0];
  const isGroup = jid.endsWith('@g.us');
  const isOwner =
    senderNumber === config.ownerNumber ||
    senderNumber === config.ownerNumber2;
  const isPm = !isGroup;
  const fromMe = msg.key.fromMe;

  const text = extractText(msg);
  const type = getMessageType(msg);
  const prefix = config.prefix;
  const isCmd = text.startsWith(prefix);
  const cmd = isCmd ? text.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
  const args = isCmd ? text.slice(prefix.length + cmd.length).trim().split(/\s+/) : [];
  const body = isCmd ? text.slice(prefix.length + cmd.length).trim() : text;

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ? {
        message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
        sender: msg.message.extendedTextMessage.contextInfo.participant,
        key: {
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          remoteJid: jid,
          fromMe: false,
        },
        type: getContentType(msg.message.extendedTextMessage.contextInfo.quotedMessage),
        download: () => downloadMedia({ message: msg.message.extendedTextMessage.contextInfo.quotedMessage, key: {} }),
      }
    : null;

  const reply = (text, opts = {}) =>
    sock.sendMessage(jid, { text, ...opts }, { quoted: msg });

  const react = (emoji) =>
    sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });

  const sendImage = (url, caption = '', opts = {}) =>
    sock.sendMessage(jid, { image: { url }, caption, ...opts }, { quoted: msg });

  const sendVideo = (url, caption = '', opts = {}) =>
    sock.sendMessage(jid, { video: { url }, caption, ...opts }, { quoted: msg });

  const sendAudio = (url, ptt = false) =>
    sock.sendMessage(jid, { audio: { url }, ptt, mimetype: 'audio/mp4' }, { quoted: msg });

  const sendSticker = (buffer) =>
    sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });

  const sendDoc = (url, fileName, mimetype) =>
    sock.sendMessage(jid, { document: { url }, fileName, mimetype }, { quoted: msg });

  const sendContact = (contacts) =>
    sock.sendMessage(jid, { contacts: { displayName: contacts[0].name, contacts } });

  return {
    ...msg,
    sock,
    store,
    jid,
    sender,
    senderNumber,
    isGroup,
    isOwner,
    isPm,
    fromMe,
    text,
    type,
    prefix,
    isCmd,
    cmd,
    args,
    body,
    quoted,
    reply,
    react,
    sendImage,
    sendVideo,
    sendAudio,
    sendSticker,
    sendDoc,
    sendContact,
    download: () => downloadMedia(msg),
    getGroupMeta: () => (isGroup ? sock.groupMetadata(jid) : null),
  };
}

module.exports = { serialize, downloadMedia, getMessageType, extractText };
