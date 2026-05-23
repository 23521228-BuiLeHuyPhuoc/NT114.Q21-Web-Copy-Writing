const asyncHandler = require('../../utils/asyncHandler');
const authService = require('../../services/authService');
const { clearAuthCookie, setAuthCookie } = require('../../utils/authCookie');

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body.email, req.body.password);
  setAuthCookie(res, data.token);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      user: authService.serializeAccount(req.auth.account, 'user'),
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: 'Logged out',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword('user', req.body.email);

  return res.status(200).json({
    success: true,
    message: data.exists ? 'OTP has been sent' : 'If the email exists, an OTP has been sent',
    data: data.expiresInSeconds
      ? { expiresInSeconds: data.expiresInSeconds }
      : undefined,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  await authService.verifyOtp('user', req.body.email, req.body.otp);

  return res.status(200).json({
    success: true,
    message: 'OTP verified',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword('user', req.body.email, req.body.otp, req.body.newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

module.exports = {
  register,
  login,
  me,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
