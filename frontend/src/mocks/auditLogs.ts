import {
  Settings, FileText, Key, CreditCard, AlertTriangle, CheckCircle2,
  LogIn, LogOut, Trash2, Edit2, Plus,
} from 'lucide-react';

export const MOCK_LOGS = [
  { id: 1, action: 'user.login', user: 'admin@copypro.vn', role: 'admin', ip: '103.15.xx.xx', details: 'Đăng nhập thành công', level: 'info', timestamp: '24/03/2026 08:30:15' },
  { id: 2, action: 'content.generate', user: 'customer@copypro.vn', role: 'customer', ip: '42.115.xx.xx', details: 'Tạo headline với GPT-4o, ngành E-commerce', level: 'info', timestamp: '24/03/2026 08:25:42' },
  { id: 3, action: 'admin.user.update', user: 'admin@copypro.vn', role: 'admin', ip: '103.15.xx.xx', details: 'Cập nhật role user ID:5 từ free → pro', level: 'warning', timestamp: '24/03/2026 08:20:10' },
  { id: 4, action: 'api.rate_limit', user: 'lec@email.com', role: 'customer', ip: '113.22.xx.xx', details: 'Rate limit exceeded — 429 Too Many Requests', level: 'error', timestamp: '23/03/2026 18:45:33' },
  { id: 5, action: 'payment.success', user: 'tranb@email.com', role: 'customer', ip: '171.25.xx.xx', details: 'Thanh toán gói Business — 799,000₫ via MoMo', level: 'info', timestamp: '23/03/2026 14:30:22' },
  { id: 6, action: 'model.finetune.start', user: 'customer@copypro.vn', role: 'customer', ip: '42.115.xx.xx', details: 'Bắt đầu fine-tuning model "Luxury Real Estate"', level: 'info', timestamp: '23/03/2026 11:20:05' },
  { id: 7, action: 'admin.template.delete', user: 'admin@copypro.vn', role: 'admin', ip: '103.15.xx.xx', details: 'Xóa template ID:42 "Old Email Template"', level: 'warning', timestamp: '22/03/2026 16:10:00' },
  { id: 8, action: 'user.password.reset', user: 'phamd@email.com', role: 'customer', ip: '14.169.xx.xx', details: 'Yêu cầu đặt lại mật khẩu', level: 'info', timestamp: '22/03/2026 09:12:00' },
  { id: 9, action: 'api.key.create', user: 'lec@email.com', role: 'customer', ip: '113.22.xx.xx', details: 'Tạo API key mới "Production Key v2"', level: 'info', timestamp: '21/03/2026 14:00:00' },
  { id: 10, action: 'admin.settings.update', user: 'admin@copypro.vn', role: 'admin', ip: '103.15.xx.xx', details: 'Cập nhật cấu hình rate limiting: 100 → 150 req/min', level: 'warning', timestamp: '21/03/2026 10:30:00' },
];

export const LEVEL_MAP: Record<string, { color: string; icon: any }> = {
  info: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  warning: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  error: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export const ACTION_ICONS: Record<string, any> = {
  'user.login': LogIn, 'user.logout': LogOut, 'user.password.reset': Key,
  'content.generate': FileText, 'payment.success': CreditCard,
  'admin.user.update': Edit2, 'admin.template.delete': Trash2,
  'admin.settings.update': Settings, 'model.finetune.start': Settings,
  'api.rate_limit': AlertTriangle, 'api.key.create': Plus,
};
