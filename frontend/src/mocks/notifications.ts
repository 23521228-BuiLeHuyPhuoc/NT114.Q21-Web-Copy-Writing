import {
  CheckCircle2, AlertCircle, Gift, Sparkles, CreditCard, Brain, Zap,
} from 'lucide-react';

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'success', icon: CheckCircle2, title: 'Fine-tuning hoàn tất', desc: 'Model "Brand Voice - E-commerce" đã sẵn sàng sử dụng.', time: '5 phút trước', read: false },
  { id: 2, type: 'info', icon: Sparkles, title: 'Tính năng mới: Kiểm tra đạo văn', desc: 'Giờ đây bạn có thể kiểm tra tính độc đáo của nội dung AI trực tiếp trên CopyPro.', time: '2 giờ trước', read: false },
  { id: 3, type: 'warning', icon: AlertCircle, title: 'Quota sắp hết', desc: 'Bạn đã sử dụng 85% quota copy tháng này (425/500). Nâng cấp để có thêm.', time: '1 ngày trước', read: false },
  { id: 4, type: 'info', icon: CreditCard, title: 'Thanh toán thành công', desc: 'Hóa đơn INV-2026-003 — 299,000₫ đã được thanh toán thành công.', time: '2 ngày trước', read: true },
  { id: 5, type: 'success', icon: Brain, title: 'API Key mới đã tạo', desc: 'Production Key "cpk_live_sk_aBc..." đã được tạo và sẵn sàng sử dụng.', time: '3 ngày trước', read: true },
  { id: 6, type: 'info', icon: Gift, title: 'Ưu đãi đặc biệt', desc: 'Nâng cấp lên gói Business trước 31/03 để nhận giảm 30% tháng đầu tiên.', time: '5 ngày trước', read: true },
  { id: 7, type: 'info', icon: Zap, title: 'Cập nhật model GPT-4o', desc: 'GPT-4o đã được cập nhật phiên bản mới với tốc độ nhanh hơn 20%.', time: '1 tuần trước', read: true },
];

export const TYPE_COLORS: Record<string, string> = {
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  info: 'text-green-600 bg-green-50',
  error: 'text-red-600 bg-red-50',
};
