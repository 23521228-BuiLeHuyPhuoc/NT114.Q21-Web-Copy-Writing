const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const createError = require('./utils/createError');
const errorHandler = require('./middlewares/error/errorHandler');
const notFound = require('./middlewares/error/notFound');
const adminAuthRoutes = require('./routes/admin/authRoutes');
const adminAuditLogRoutes = require('./routes/admin/auditLogRoutes');
const adminCategoryRoutes = require('./routes/admin/categoryRoutes');
const adminContentRoutes = require('./routes/admin/contentRoutes');
const adminGenerateOptionRoutes = require('./routes/admin/generateOptionRoutes');
const adminPaymentRoutes = require('./routes/admin/paymentRoutes');
const adminPlanRoutes = require('./routes/admin/planRoutes');
const adminStatsRoutes = require('./routes/admin/statsRoutes');
const adminTemplateRoutes = require('./routes/admin/templateRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const billingRoutes = require('./routes/user/billingRoutes');
const contentRoutes = require('./routes/user/contentRoutes');
const fineTuneRoutes = require('./routes/user/fineTuneRoutes');
const generateOptionRoutes = require('./routes/user/generateOptionRoutes');
const notificationRoutes = require('./routes/user/notificationRoutes');
const plagiarismRoutes = require('./routes/user/plagiarismRoutes');
const projectRoutes = require('./routes/user/projectRoutes');
const userAuthRoutes = require('./routes/user/authRoutes');
const templateRoutes = require('./routes/user/templateRoutes');

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
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/contents', adminContentRoutes);
app.use('/api/admin/generate-options', adminGenerateOptionRoutes);
app.use('/api/admin/audit-logs', adminAuditLogRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/templates', adminTemplateRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/fine-tune', fineTuneRoutes);
app.use('/api/generate-options', generateOptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
