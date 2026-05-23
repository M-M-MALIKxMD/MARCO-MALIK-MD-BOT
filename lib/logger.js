const chalk = require('chalk');
const moment = require('moment-timezone');

const tz = process.env.TZ || 'Asia/Karachi';

const logger = {
  info: (msg) => console.log(chalk.cyan(`[${moment().tz(tz).format('HH:mm:ss')}] [INFO] `) + msg),
  warn: (msg) => console.log(chalk.yellow(`[${moment().tz(tz).format('HH:mm:ss')}] [WARN] `) + msg),
  error: (msg) => console.log(chalk.red(`[${moment().tz(tz).format('HH:mm:ss')}] [ERROR] `) + msg),
  success: (msg) => console.log(chalk.green(`[${moment().tz(tz).format('HH:mm:ss')}] [SUCCESS] `) + msg),
  cmd: (msg) => console.log(chalk.magenta(`[${moment().tz(tz).format('HH:mm:ss')}] [CMD] `) + msg),
  debug: (msg) => console.log(chalk.gray(`[${moment().tz(tz).format('HH:mm:ss')}] [DEBUG] `) + msg),
};

module.exports = { logger };
