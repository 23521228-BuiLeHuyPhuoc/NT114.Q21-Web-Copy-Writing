require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 4000;

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      console.log('HTTP server and MongoDB connection closed.');
      process.exit(0);
    });
    return;
  }

  await mongoose.connection.close(false);
  process.exit(0);
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
