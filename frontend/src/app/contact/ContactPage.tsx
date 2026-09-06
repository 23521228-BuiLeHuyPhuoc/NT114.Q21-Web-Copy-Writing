import { useEffect, useState } from 'react';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { PublicRichText } from '@/app/components/public/PublicRichText';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import toast from 'react-hot-toast';
import { getPublicText } from '@/lib/publicSiteDefaults';
import { PUBLIC_SUPPORT_EMAIL } from '@/lib/publicEnv';
import { publicSiteService, type PublicPageContent } from '@/services/publicSiteService';
import { contactSubmissionService, type ContactTopic } from '@/services/contactSubmissionService';
import {
  Mail, Phone, MapPin, MessageSquare,
  Send, Headphones, BookOpen, Zap, CheckCircle2,
} from 'lucide-react';

const CONTACT_TYPES = [
  { icon: MessageSquare, label: 'Tư vấn sản phẩm', desc: 'Hỏi về tính năng, phù hợp với nhu cầu', color: 'bg-primary/10 text-primary' },
  { icon: Headphones, label: 'Hỗ trợ kỹ thuật', desc: 'Lỗi, API, tích hợp hệ thống', color: 'bg-primary/10 text-primary' },
  { icon: BookOpen, label: 'Đối tác & Hợp tác', desc: 'Agency, reseller, co-marketing', color: 'bg-primary/10 text-primary' },
  { icon: Zap, label: 'Tư vấn Business', desc: 'Tư vấn quota, team và triển khai gói Business', color: 'bg-warning/15 text-amber-800' },
];

const FAQ = [
  { q: 'Tạo nội dung mới ở đâu?', a: 'Sau khi đăng nhập, mở Generator, hoàn tất brief, chọn model và nhấn tạo phiên bản.' },
  { q: 'Kết quả có tự động vào thư viện không?', a: 'Bạn chọn phiên bản phù hợp rồi dùng thao tác Lưu. Bản đã lưu sẽ xuất hiện trong trang Nội dung.' },
  { q: 'Có thể gom nội dung theo chiến dịch không?', a: 'Có. Chọn dự án ngay trong Generator hoặc thêm nội dung có sẵn từ trang chi tiết dự án.' },
  { q: 'Khi nào dùng được fine-tuning?', a: 'Khả năng tạo và dùng model fine-tuned phụ thuộc quyền truy cập, provider và cấu hình gói hiện tại.' },
];

function getContactErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }; message?: string };
  const firstValidationMessage = err.response?.data?.errors?.find(item => item.message)?.message;
  return firstValidationMessage || err.response?.data?.message || err.message || 'Không gửi được tin nhắn';
}

export function ContactPage() {
  const [form, setForm] = useState<{ name: string; email: string; company: string; topic: ContactTopic | ''; message: string }>({ name: '', email: '', company: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [contactContent, setContactContent] = useState<PublicPageContent>({});

  useEffect(() => {
    let active = true;
    publicSiteService.getPage('contact')
      .then((page) => {
        if (active && page?.content) setContactContent(page.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const contactHeroBadge = getPublicText(contactContent, 'heroBadge', '💬 Liên hệ với chúng tôi');
  const contactHeroTitle = getPublicText(contactContent, 'heroTitle', 'Chúng tôi luôn sẵn sàng lắng nghe');
  const contactHeroDescription = getPublicText(contactContent, 'heroDescription', 'Gửi câu hỏi về sản phẩm, tài khoản, thanh toán hoặc lỗi kỹ thuật qua biểu mẫu. Nội dung sẽ được chuyển vào hệ thống quản trị liên hệ.');
  const contactEmail = getPublicText(contactContent, 'email', PUBLIC_SUPPORT_EMAIL);
  const contactPhone = typeof contactContent.phone === 'string' ? contactContent.phone.trim() : '';
  const contactAddress = typeof contactContent.address === 'string' ? contactContent.address.trim() : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const company = form.company.trim();
    const message = form.message.trim();
    const topic = form.topic;

    if (!name || !email || !topic || !message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const payload = { name, email, company, topic, message };

    setSubmitting(true);
    try {
      await contactSubmissionService.create(payload);
      setSubmitted(true);
      toast.success('Đã gửi tin nhắn vào hệ thống hỗ trợ.');
    } catch (error) {
      toast.error(getContactErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page min-h-screen bg-card">
      <PublicNavbar />

      {/* Hero */}
      <section className="paper-grid relative overflow-hidden border-b-2 border-foreground bg-background pb-16 pt-28 md:pt-32">
        <div className="pointer-events-none absolute -left-14 top-24 h-36 w-36 rounded-full border-[24px] border-primary/10" />
        <div className="max-w-3xl mx-auto px-5 text-center relative">
          <Badge className="mb-5 border border-foreground/30 bg-accent/35 px-4 py-1.5 text-foreground">
            {contactHeroBadge}
          </Badge>
          <h1 className="type-hero mb-4 text-foreground">
            {contactHeroTitle}
          </h1>
          <PublicRichText
            content={contactContent}
            field="heroDescription"
            fallback={contactHeroDescription}
            className="text-base leading-7 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-foreground"
          />
        </div>
      </section>

      {/* Contact types */}
      <section className="py-12 bg-surface-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_TYPES.map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-md transition-all text-center cursor-pointer">
                  <div className={`inline-flex p-3 rounded-xl ${c.color} mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-foreground text-sm mb-1">{c.label}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
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
              <h2 className="type-section-title mb-2 text-foreground">Gửi tin nhắn</h2>
              <p className="text-muted-foreground text-sm mb-8">Điền đủ ngữ cảnh để bộ phận phụ trách có thể xử lý yêu cầu chính xác hơn.</p>

              {submitted ? (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-foreground mb-2">Đã nhận được tin nhắn!</h3>
                  <p className="text-foreground/70 text-sm">Cảm ơn <strong>{form.name}</strong>! Chúng tôi sẽ phản hồi đến <strong>{form.email}</strong> sớm nhất có thể.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', topic: '', message: '' }); }}
                    className="mt-6 text-primary text-sm font-semibold hover:underline"
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
                        className="mt-2 h-12 rounded-xl border-border focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="mt-2 h-12 rounded-xl border-border focus:border-primary"
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
                        className="mt-2 h-12 rounded-xl border-border"
                      />
                    </div>
                    <div>
                      <Label>Chủ đề *</Label>
                      <Select value={form.topic} onValueChange={v => setForm({ ...form, topic: v as ContactTopic })}>
                        <SelectTrigger className="mt-2 h-12 rounded-xl border-border"><SelectValue placeholder="Chọn chủ đề" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Tư vấn sản phẩm</SelectItem>
                          <SelectItem value="support">Hỗ trợ kỹ thuật</SelectItem>
                          <SelectItem value="partner">Đối tác & Hợp tác</SelectItem>
                          <SelectItem value="business">Tư vấn Business</SelectItem>
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
                      className="mt-2 min-h-36 rounded-xl border-border focus:border-primary resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-md bg-primary py-4 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_rgba(23,32,51,.16)] transition-colors hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" /> {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </button>
                </form>
              )}
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact info */}
              <div className="paper-noise border-2 border-foreground bg-surface-muted p-7">
                <h3 className="text-foreground mb-6" style={{ fontSize: '1.1rem' }}>Thông tin liên hệ</h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: 'Email hỗ trợ', value: contactEmail, sub: 'Kênh liên hệ trực tiếp' },
                    ...(contactPhone ? [{ icon: Phone, label: 'Điện thoại', value: contactPhone, sub: 'Thông tin do quản trị viên cấu hình' }] : []),
                    ...(contactAddress ? [{ icon: MapPin, label: 'Địa chỉ', value: contactAddress, sub: 'Thông tin do quản trị viên cấu hình' }] : []),
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex gap-4">
                        <div className="bg-primary/10 p-2.5 rounded-xl flex-shrink-0 h-fit">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-foreground">{item.value}</p>
                          <p className="text-xs text-muted-foreground/80">{item.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-2 border-foreground bg-accent p-6 text-foreground shadow-[5px_5px_0_#172033]">
                <p className="text-xs font-bold uppercase tracking-[.06em]">Trước khi gửi</p>
                <h3 className="mt-3 text-2xl text-foreground">Mô tả đủ để tái hiện vấn đề.</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/70">Nếu là lỗi kỹ thuật, hãy nêu màn hình, thao tác đã thực hiện và thông báo lỗi nhìn thấy. Không gửi mật khẩu hoặc thông tin bí mật.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface-muted border-t border-border">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">FAQ</Badge>
            <h2 className="type-public-title text-foreground">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`bg-card rounded-2xl border overflow-hidden transition-all ${faqOpen === i ? 'border-primary/20 shadow-md' : 'border-border hover:border-border'}`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-foreground">{item.q}</span>
                  <span className={`text-primary font-bold text-lg flex-shrink-0 ml-4 transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-6">
                    <p className="text-foreground/70 text-sm leading-relaxed">{item.a}</p>
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
