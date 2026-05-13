import { useState } from 'react';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import toast from 'react-hot-toast';
import {
  Mail, Phone, MapPin, Clock, MessageSquare,
  Send, Headphones, BookOpen, Zap, CheckCircle2,
} from 'lucide-react';

const CONTACT_TYPES = [
  { icon: MessageSquare, label: 'Tư vấn sản phẩm', desc: 'Hỏi về tính năng, phù hợp với nhu cầu', color: 'bg-green-100 text-green-700' },
  { icon: Headphones, label: 'Hỗ trợ kỹ thuật', desc: 'Lỗi, API, tích hợp hệ thống', color: 'bg-blue-100 text-blue-700' },
  { icon: BookOpen, label: 'Đối tác & Hợp tác', desc: 'Agency, reseller, co-marketing', color: 'bg-purple-100 text-purple-700' },
  { icon: Zap, label: 'Demo Enterprise', desc: 'Demo và báo giá cho doanh nghiệp lớn', color: 'bg-orange-100 text-orange-700' },
];

const FAQ = [
  { q: 'CopyPro có hỗ trợ tiếng Anh không?', a: 'Có, CopyPro hỗ trợ tạo copy bằng tiếng Việt và tiếng Anh. Bạn có thể chọn ngôn ngữ đầu ra trước khi tạo.' },
  { q: 'Tôi có thể hủy gói bất kỳ lúc nào không?', a: 'Hoàn toàn có thể. Không có hợp đồng ràng buộc. Hủy trong vài giây từ trang Cài đặt tài khoản.' },
  { q: 'Dữ liệu của tôi có được bảo mật không?', a: 'Chúng tôi không dùng nội dung của bạn để huấn luyện model. Dữ liệu được mã hóa AES-256 và lưu trữ tại datacenter tại Việt Nam.' },
  { q: 'Fine-tuning có khó không, tôi cần biết code không?', a: 'Không cần code. Fine-tuning Studio được thiết kế cho người dùng không kỹ thuật. Chỉ cần cung cấp ví dụ input/output là xong.' },
  { q: 'Copy được tạo có bị phát hiện là AI không?', a: 'Model của chúng tôi được tối ưu để tạo văn phong tự nhiên. Fine-tuning với giọng văn riêng của bạn sẽ giúp copy nghe hoàn toàn như con người viết.' },
];

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    toast.success('Đã gửi tin nhắn! Chúng tôi sẽ phản hồi trong 24 giờ.');
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-950 via-green-950 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(34,197,94,0.12),transparent)]" />
        <div className="max-w-3xl mx-auto px-5 text-center relative">
          <Badge className="mb-5 bg-green-900/50 text-green-300 border border-green-700/40 px-4 py-1.5">
            💬 Liên hệ với chúng tôi
          </Badge>
          <h1 className="text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Chúng tôi luôn sẵn sàng lắng nghe
          </h1>
          <p className="text-gray-400 text-base">
            Dù bạn có câu hỏi về sản phẩm, cần hỗ trợ kỹ thuật hay muốn thảo luận về hợp tác — đội ngũ của chúng tôi sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>
      </section>

      {/* Contact types */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_TYPES.map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all text-center cursor-pointer">
                  <div className={`inline-flex p-3 rounded-xl ${c.color} mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-gray-900 text-sm mb-1">{c.label}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-gray-900 mb-2" style={{ fontSize: '1.5rem' }}>Gửi tin nhắn</h2>
              <p className="text-gray-500 text-sm mb-8">Điền form bên dưới và chúng tôi sẽ liên lạc lại trong vòng 24 giờ làm việc.</p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-gray-900 mb-2">Đã nhận được tin nhắn!</h3>
                  <p className="text-gray-600 text-sm">Cảm ơn <strong>{form.name}</strong>! Chúng tôi sẽ phản hồi đến <strong>{form.email}</strong> sớm nhất có thể.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', topic: '', message: '' }); }}
                    className="mt-6 text-green-600 text-sm font-semibold hover:underline"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label>Họ và tên *</Label>
                      <Input
                        placeholder="Nguyễn Văn A"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-green-400"
                        required
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-gray-200 focus:border-green-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label>Công ty</Label>
                      <Input
                        placeholder="Tên doanh nghiệp (tuỳ chọn)"
                        value={form.company}
                        onChange={e => setForm({ ...form, company: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-gray-200"
                      />
                    </div>
                    <div>
                      <Label>Chủ đề *</Label>
                      <Select value={form.topic} onValueChange={v => setForm({ ...form, topic: v })}>
                        <SelectTrigger className="mt-2 h-12 rounded-xl border-gray-200"><SelectValue placeholder="Chọn chủ đề" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Tư vấn sản phẩm</SelectItem>
                          <SelectItem value="support">Hỗ trợ kỹ thuật</SelectItem>
                          <SelectItem value="partner">Đối tác & Hợp tác</SelectItem>
                          <SelectItem value="enterprise">Demo Enterprise</SelectItem>
                          <SelectItem value="billing">Thanh toán & Hoá đơn</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Nội dung *</Label>
                    <Textarea
                      placeholder="Mô tả chi tiết yêu cầu hoặc câu hỏi của bạn..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="mt-2 min-h-36 rounded-xl border-gray-200 focus:border-green-400 resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-13 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 py-4"
                  >
                    <Send className="w-4 h-4" /> Gửi tin nhắn
                  </button>
                </form>
              )}
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact info */}
              <div className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                <h3 className="text-gray-900 mb-6" style={{ fontSize: '1.1rem' }}>Thông tin liên hệ</h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: 'Email', value: 'hello@copypro.vn', sub: 'Phản hồi trong 24h' },
                    { icon: Phone, label: 'Hotline', value: '+84 901 234 567', sub: 'T2-T6, 8:00 - 18:00' },
                    { icon: MapPin, label: 'Văn phòng', value: 'Innovation Hub, Q.1, TP.HCM', sub: 'Hẹn gặp trực tiếp' },
                    { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 6', sub: '8:00 – 18:00 GMT+7' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex gap-4">
                        <div className="bg-green-100 p-2.5 rounded-xl flex-shrink-0 h-fit">
                          <Icon className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                          <p className="text-xs text-gray-400">{item.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SLA */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                <h3 className="text-white mb-4" style={{ fontSize: '1rem' }}>Cam kết phản hồi</h3>
                {[
                  { plan: 'Gói Free', time: '< 72 giờ' },
                  { plan: 'Gói Pro', time: '< 24 giờ' },
                  { plan: 'Gói Business', time: '< 4 giờ' },
                  { plan: 'Enterprise', time: 'Dedicated CSM' },
                ].map(s => (
                  <div key={s.plan} className="flex justify-between py-2.5 border-b border-white/20 last:border-0">
                    <span className="text-green-100 text-sm">{s.plan}</span>
                    <span className="text-white font-bold text-sm">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">FAQ</Badge>
            <h2 className="text-gray-900" style={{ fontSize: '1.8rem' }}>Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${faqOpen === i ? 'border-green-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                  <span className={`text-green-600 font-bold text-lg flex-shrink-0 ml-4 transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
