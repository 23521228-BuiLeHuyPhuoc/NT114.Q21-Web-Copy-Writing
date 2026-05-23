const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const createError = require('./utils/createError');
const errorHandler = require('./middlewares/error/errorHandler');
const notFound = require('./middlewares/error/notFound');
const adminAuthRoutes = require('./routes/admin/authRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const contentRoutes = require('./routes/user/contentRoutes');
const userAuthRoutes = require('./routes/user/authRoutes');

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
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    data: {
      service: 'ai-copywriter-api',
    },
  });
});

app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/contents', contentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
