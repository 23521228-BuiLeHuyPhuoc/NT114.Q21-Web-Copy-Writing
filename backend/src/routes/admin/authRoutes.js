const express = require('express');

const authController = require('../../controllers/admin/authController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const { loginLimiter, otpLimiter } = require('../../middlewares/rateLimit/authRateLimiter');
const validate = require('../../middlewares/validation/validate');
const {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  sessionPreferenceSchema,
  verifyOtpSchema,
} = require('../../validations/authValidation');

const router = express.Router();

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', protect('admin'), authController.me);
router.patch('/session', protect('admin'), validate(sessionPreferenceSchema), authController.refreshSession);
router.post('/logout', authController.logout);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
