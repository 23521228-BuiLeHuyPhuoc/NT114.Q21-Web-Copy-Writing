export const AUTH_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_PASSWORD_RULES = [
  { label: 'Ít nhất 8 ký tự', test: (password: string) => password.length >= 8 },
  { label: 'Có chữ hoa', test: (password: string) => /[A-Z]/.test(password) },
  { label: 'Có chữ thường', test: (password: string) => /[a-z]/.test(password) },
  { label: 'Có số', test: (password: string) => /\d/.test(password) },
];

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return 'Email là bắt buộc';
  if (email.length > 254) return 'Email tối đa 254 ký tự';
  if (!AUTH_EMAIL_PATTERN.test(email)) return 'Email không hợp lệ';
  return true;
}

export function validateName(value: string) {
  const name = value.trim();
  if (!name) return 'Họ và tên là bắt buộc';
  if (name.length < 2) return 'Họ và tên tối thiểu 2 ký tự';
  if (name.length > 120) return 'Họ và tên tối đa 120 ký tự';
  return true;
}

export function validateLoginPassword(value: string) {
  if (!value) return 'Mật khẩu là bắt buộc';
  if (value.length > 128) return 'Mật khẩu tối đa 128 ký tự';
  return true;
}

export function validateStrongPassword(value: string) {
  if (!value) return 'Mật khẩu là bắt buộc';
  if (value.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
  if (value.length > 128) return 'Mật khẩu tối đa 128 ký tự';
  if (!/[A-Z]/.test(value)) return 'Mật khẩu cần có chữ hoa';
  if (!/[a-z]/.test(value)) return 'Mật khẩu cần có chữ thường';
  if (!/\d/.test(value)) return 'Mật khẩu cần có số';
  return true;
}

export function validateConfirmPassword(value: string, password: string) {
  if (!value) return 'Xác nhận mật khẩu là bắt buộc';
  if (value !== password) return 'Mật khẩu không khớp';
  return true;
}
