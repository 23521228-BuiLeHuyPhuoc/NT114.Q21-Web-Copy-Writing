import {
  Wand2, CreditCard, FileText, Brain, Key, FolderOpen, Zap,
} from 'lucide-react';

export const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':        'Bảng điều khiển',
  '/generate':         'Tạo nội dung AI',
  '/contents':         'Nội dung của tôi',
  '/history':          'Lịch sử',
  '/projects':         'Dự án',
  '/templates':        'Mẫu copy',
  '/fine-tune':        'Fine-tuning',
  '/plagiarism-check': 'Kiểm tra đạo văn',
  '/profile':          'Hồ sơ',
  '/billing':          'Gói & thanh toán',
  '/notifications':    'Thông báo',
  '/subscription':     'Gói dịch vụ',
  '/api-keys':         'Khóa API',
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Copy của bạn đã sẵn sàng!', desc: 'Facebook Ad – Flash Sale Hè đã tạo xong.', time: '2 phút', read: false, icon: Wand2, color: 'bg-green-100 text-green-600' },
  { id: 2, title: 'Fine-tune hoàn thành', desc: 'Model "Thời Trang Brand" đã sẵn sàng sử dụng.', time: '1 giờ', read: false, icon: Brain, color: 'bg-emerald-100 text-emerald-600' },
  { id: 3, title: 'Hóa đơn tháng 3/2026', desc: 'Gói Pro – 299.000₫ đã được thanh toán thành công.', time: '2 ngày', read: true, icon: CreditCard, color: 'bg-green-100 text-green-600' },
  { id: 4, title: 'Quota cảnh báo', desc: 'Bạn đã dùng 80% quota tháng này (400/500 copy).', time: '3 ngày', read: true, icon: Zap, color: 'bg-amber-100 text-amber-600' },
];

export const QUICK_ACTIONS = [
  { label: 'Tạo nội dung', icon: Wand2,     path: '/generate',         color: 'bg-green-500' },
  { label: 'Nội dung',     icon: FileText,   path: '/contents',         color: 'bg-green-500' },
  { label: 'Dự án',        icon: FolderOpen, path: '/projects',         color: 'bg-emerald-500' },
  { label: 'Fine-tuning',  icon: Brain,      path: '/fine-tune',        color: 'bg-teal-500' },
  { label: 'Khóa API',     icon: Key,        path: '/api-keys',         color: 'bg-orange-500' },
];
