const express = require('express');

const authController = require('../../controllers/user/authController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const { loginLimiter, otpLimiter } = require('../../middlewares/rateLimit/authRateLimiter');
const { uploadAvatar } = require('../../middlewares/upload/avatarUpload');
const validate = require('../../middlewares/validation/validate');
const {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  userRegisterSchema,
  verifyOtpSchema,
} = require('../../validations/authValidation');

const router = express.Router();

router.post('/register', validate(userRegisterSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.get('/me', protect('user'), authController.me);
router.patch('/me/avatar', protect('user'), uploadAvatar, authController.updateAvatar);
router.post('/logout', authController.logout);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
