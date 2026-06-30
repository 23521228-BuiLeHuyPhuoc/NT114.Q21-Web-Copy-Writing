const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const app = require('../src/app');
const { connectDB } = require('../src/config/database');

let dbPromise;

function ensureDb() {
  if (!dbPromise) {
    dbPromise = connectDB().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

module.exports = async function handler(req, res) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (error) {
    console.error('Vercel API handler failed:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'API server failed to initialize',
      });
    }
  }
};
