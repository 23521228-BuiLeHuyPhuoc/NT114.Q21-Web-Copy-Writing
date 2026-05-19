const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const createError = require('./utils/createError');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === allowedOrigin) {
      return callback(null, true);
    }
    return callback(createError(403, 'CORS policy does not allow this origin'));
  },
  credentials: true,
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    data: {
      service: 'ai-copywriter-api',
    },
  });
});

app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});

app.use(errorHandler);

module.exports = app;
