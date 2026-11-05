const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  COC_API_TOKEN: process.env.COC_API_TOKEN || '',
  COC_API_BASE: 'https://api.clashofclans.com/v1',
  DEFAULT_POLL_INTERVAL_MINUTES: parseInt(process.env.POLL_INTERVAL_MINUTES, 10) || 15,
  DATA_DIR,
  DB_FILE,
  PUBLIC_DIR: path.join(__dirname, 'public'),
};
