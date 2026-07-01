import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Sparkles, Wand2, Mail, FileText, BellRing,
  ShoppingCart, Search, Megaphone, RotateCcw,
  CheckCircle2, Copy, ThumbsUp, Zap,
} from 'lucide-react';
import { PUBLIC_SITE_HOST } from '@/lib/publicEnv';

/* ─── Content types ─────────────────────────────────────── */

interface ContentType {
  id: string;
  icon: React.ElementType;
  label: string;
  hint: string;
  inputLabel: string;
  placeholder: string;
  model: string;
  badge: string;
  badgeColor: string;
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'fb_ad', icon: Megaphone,    label: 'Facebook Ad',
    hint: 'Quảng cáo Facebook siêu chuyển đổi',
    inputLabel: 'Tên sản phẩm / dịch vụ',
    placeholder: 'Ví dụ: Khóa học tiếng Anh online',
    model: 'GPT-4', badge: 'Phổ biến nhất', badgeColor: 'bg-warning/15 text-amber-800',
  },
  {
    id: 'email', icon: Mail,          label: 'Email Marketing',
    hint: 'Subject line & body email tỷ lệ mở cao',
    inputLabel: 'Chủ đề email',
    placeholder: 'Ví dụ: Flash sale cuối tháng',
    model: 'GPT-4', badge: 'Email', badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'product', icon: ShoppingCart, label: 'Mô tả sản phẩm',
    hint: 'Mô tả chi tiết sản phẩm thuyết phục',
    inputLabel: 'Tên & tính năng sản phẩm',
    placeholder: 'Ví dụ: Máy lọc không khí thông minh',
    model: 'Llama 3.1', badge: 'E-commerce', badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'landing', icon: FileText,    label: 'Landing Page',
    hint: 'Headline & subheadline tối ưu chuyển đổi',
    inputLabel: 'Sản phẩm / dịch vụ',
    placeholder: 'Ví dụ: Phần mềm kế toán doanh nghiệp',
    model: 'GPT-4', badge: 'Conversion', badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'push', icon: BellRing,      label: 'Push Notification',
    hint: 'Thông báo ngắn gọn, kích thích click',
    inputLabel: 'Sự kiện / chương trình',
    placeholder: 'Ví dụ: Nhận thưởng cho đơn hàng đầu tiên',
    model: 'Llama 3.1', badge: 'Mobile', badgeColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'google', icon: Search,       label: 'Google Search Ad',
    hint: 'Headline + description theo chuẩn Google Ads',
    inputLabel: 'Từ khóa / dịch vụ',
    placeholder: 'Ví dụ: Dịch vụ sửa điện lạnh tại nhà',
    model: 'GPT-4', badge: 'SEM', badgeColor: 'bg-warning/15 text-amber-800',
  },
];

/* ─── AI Response templates ─────────────────────────────── */

function buildResponse(type: string, input: string): string {
  const product = input.trim() || 'Sản phẩm của bạn';

  const templates: Record<string, string[]> = {
    fb_ad: [
      `🔥 Đừng bỏ lỡ! ${product} — Giải pháp TỐT NHẤT mà bạn chưa biết đến!\n\n✅ Tiết kiệm đến 60% so với cách làm truyền thống\n✅ Kết quả rõ ràng chỉ sau 7 ngày\n✅ Hơn 10,000 khách hàng hài lòng\n\n👉 Nhấp "Tìm hiểu thêm" để nhận ưu đãi độc quyền — chỉ còn HÔM NAY!\n\n#${product.replace(/\s/g, '')} #Ưu_đãi #Hôm_nay`,
      `💥 SỐC! ${product} giảm đến 50% — Chỉ trong 24 giờ!\n\nBạn đã thử ${product} chưa?\n→ Không cần kinh nghiệm\n→ Hỗ trợ 24/7 tận tình\n→ Hoàn tiền 100% nếu không hài lòng\n\nLiên hệ ngay để nhận báo giá tốt nhất! ⬇️`,
    ],
    email: [
      `Subject: [CHỈ HÔM NAY] ${product} — Cơ hội vàng không thể bỏ lỡ 🎁\n\nChào [Tên khách hàng],\n\nChúng tôi muốn gửi tặng bạn một ưu đãi đặc biệt cho ${product}.\n\nTrong 24 giờ tới, bạn sẽ nhận được:\n• Giảm ngay 30% tổng giá trị đơn hàng\n• Tặng kèm phần quà trị giá 500,000₫\n• Ưu tiên hỗ trợ từ chuyên gia\n\n🔗 [Nhận ưu đãi ngay — Hết hạn lúc 23:59 hôm nay]\n\nTrân trọng,\nĐội ngũ ${product}`,
      `Subject: Bạn ơi — ${product} đang chờ bạn quay lại! 👋\n\nHi [Tên],\n\nChúng tôi nhận thấy bạn chưa hoàn thành đơn hàng ${product}.\n\nĐừng để nó "bay mất" — chúng tôi đã giữ lại cho bạn và tặng thêm:\n✨ Miễn phí vận chuyển\n✨ Giảm thêm 10% khi dùng mã: COMEBACK10\n\n→ Hoàn thành đơn hàng ngay`,
    ],
    product: [
      `✨ ${product}\n\n🌟 Mô tả sản phẩm:\n${product} là giải pháp hoàn hảo dành cho những ai đang tìm kiếm hiệu quả vượt trội với chi phí tối ưu.\n\n🎯 Điểm nổi bật:\n• Thiết kế hiện đại, dễ sử dụng ngay từ lần đầu\n• Chất liệu cao cấp, bền bỉ theo thời gian\n• Tiết kiệm 70% thời gian so với phương pháp truyền thống\n• Bảo hành chính hãng 24 tháng\n\n💚 Hơn 5,000 khách hàng đã tin dùng — Bạn sẽ là người tiếp theo!`,
    ],
    landing: [
      `HEADLINE:\n"${product} — Giải pháp #1 Việt Nam cho người muốn kết quả thật, không phí thời gian"\n\nSUBHEADLINE:\nTham gia cùng 50,000+ người dùng đã thay đổi cách tiếp cận với ${product}. Bắt đầu miễn phí hôm nay — không cần thẻ tín dụng.\n\nCTA BUTTON: "Dùng thử miễn phí 14 ngày →"\n\nSOCIAL PROOF:\n⭐⭐⭐⭐⭐ "Đây là thứ tôi cần từ lâu!" — Nguyễn Minh T., TP.HCM`,
      `HEADLINE:\n"Bạn xứng đáng có được ${product} tốt hơn — và chúng tôi sẽ chứng minh điều đó"\n\nSUBHEADLINE:\nKhông rủi ro. Không ràng buộc. Chỉ kết quả thực sự trong 30 ngày đầu tiên.\n\nCTA: "Bắt đầu ngay — Miễn phí"\n\n✅ Setup trong 2 phút  ✅ Hủy bất kỳ lúc nào  ✅ Hỗ trợ tiếng Việt 24/7`,
    ],
    push: [
      `🔔 ${product}\n━━━━━━━━━━━━━━━\nTitle: "⚡ Chỉ còn 2 giờ! ${product} giảm 40%"\nBody: "Đừng bỏ lỡ — Hơn 500 người đang xem ngay lúc này"\n[Mở ngay] [Để sau]\n━━━━━━━━━━━━━━━\nTime to send: 20:00 - 21:00 (giờ cao điểm)\nPredicted CTR: 8.4%`,
      `🔔 Notification Preview\n━━━━━━━━━━━━━━━\nTitle: "🎁 Quà tặng dành riêng cho bạn từ ${product}!"\nBody: "Nhấp để nhận ngay — Chỉ hôm nay thôi"\nBadge: 1  Sound: Default\n━━━━━━━━━━━━━━━\nDự đoán open rate: 23.1%`,
    ],
    google: [
      `📢 GOOGLE ADS — ${product}\n\nHeadline 1: ${product} Uy Tín #1 VN\nHeadline 2: Giá Tốt Nhất - Đặt Ngay\nHeadline 3: Miễn Phí Tư Vấn 24/7\n\nDescription 1: ${product} chính hãng, bảo hành 24 tháng. Giao hàng toàn quốc. Đặt hàng ngay hôm nay!\nDescription 2: Hơn 10,000 khách hàng tin tưởng. Giá tốt nhất thị trường. Hỗ trợ 24/7.\n\nDisplay URL: ${PUBLIC_SITE_HOST}/${product.toLowerCase().replace(/\s/g, '-')}`,
    ],
  };

  const list = templates[type] ?? templates['fb_ad'];
  return list[Math.floor(Math.random() * list.length)];
}

/* ─── Typewriter hook ───────────────────────────────────── */

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;
    clearTimeout(timerRef.current);

    if (!text) return;

    function type() {
      if (indexRef.current < text.length) {
        // Burst a few chars at once for realism
        const burst = Math.min(3, text.length - indexRef.current);
        indexRef.current += burst;
        setDisplayed(text.slice(0, indexRef.current));
        timerRef.current = setTimeout(type, speed);
      } else {
        setDone(true);
      }
    }

    timerRef.current = setTimeout(type, 80);
    return () => clearTimeout(timerRef.current);
  }, [text, speed]);

  return { displayed, done };
}

/* ─── Main component ────────────────────────────────────── */

export function AIDemoSection() {
  const [activeType, setActiveType] = useState(CONTENT_TYPES[0]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawOutput, setRawOutput] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quality] = useState(() => Math.floor(Math.random() * 6) + 90); // 90-95
  const [genTime] = useState(() => (Math.random() * 1 + 1.2).toFixed(1));   // 1.2-2.2s

  const { displayed, done } = useTypewriter(rawOutput, 14);

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setRawOutput('');
    setHasGenerated(false);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 900 + Math.random() * 400));

    const result = buildResponse(activeType.id, inputValue);
    setRawOutput(result);
    setHasGenerated(true);
    setIsGenerating(false);
  }, [activeType, inputValue, isGenerating]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawOutput).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset output when type changes
  const handleTypeChange = (t: ContentType) => {
    setActiveType(t);
    setRawOutput('');
    setHasGenerated(false);
    setInputValue('');
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background to-surface-muted relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(34,197,94,0.06),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5 text-sm">
            ✨ Demo tương tác
          </Badge>
          <h2 className="text-foreground mb-5">
            Thử tạo copy AI ngay — không cần đăng ký
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Chọn loại nội dung, nhập thông tin sản phẩm, nhấn "Tạo" và xem AI viết copy trong vài giây.
          </p>
        </div>

        {/* Demo card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg shadow-primary/20 border border-border overflow-hidden">

            {/* Window bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-surface-muted border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground/80 font-mono">{PUBLIC_SITE_HOST}/generator</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[320px_1fr] min-h-[500px]">

              {/* ── LEFT: Controls ── */}
              <div className="bg-surface-muted/80 border-r border-border p-5 flex flex-col gap-5">

                {/* Step 1: Content type */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-3">
                    1 · Chọn loại nội dung
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map(t => {
                      const Icon = t.icon;
                      const isActive = activeType.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleTypeChange(t)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all ${
                            isActive
                              ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                              : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-primary' : 'text-foreground/70'}`}>
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Input */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-3">
                    2 · {activeType.inputLabel}
                  </p>
                  <Input
                    placeholder={activeType.placeholder}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="rounded-lg border-border focus:border-primary bg-card h-11 text-sm"
                    onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                  />
                  <p className="text-xs text-muted-foreground/80 mt-2">
                    💡 {activeType.hint}
                  </p>
                </div>

                {/* Model badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/80">Model:</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">{activeType.model}</Badge>
                  <Badge className={`${activeType.badgeColor} border-0 text-xs`}>{activeType.badge}</Badge>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`relative w-full py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                    isGenerating
                      ? 'bg-primary/10 text-primary cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-primary/20 hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                      AI đang tạo copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Tạo copy AI
                      <Wand2 className="w-4 h-4 opacity-70" />
                    </>
                  )}
                  {/* Shimmer animation when generating */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/10 to-transparent animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
                  )}
                </button>
              </div>

              {/* ── RIGHT: Output ── */}
              <div className="flex flex-col">
                {/* Output header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : hasGenerated ? 'bg-primary/50' : 'bg-gray-300'}`} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {isGenerating ? 'Đang tạo...' : hasGenerated ? 'Hoàn thành' : 'Sẵn sàng'}
                    </span>
                  </div>
                  {hasGenerated && done && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        ⭐ {quality}% chất lượng
                      </Badge>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        <Zap className="w-3 h-3 inline mr-0.5" />{genTime}s
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Output body */}
                <div className="flex-1 relative">
                  {/* Empty state */}
                  {!hasGenerated && !isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-muted-foreground/60" />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Kết quả sẽ hiển thị tại đây</p>
                        <p className="text-muted-foreground/80 text-sm">Chọn loại nội dung và nhấn "Tạo copy AI" để xem demo</p>
                      </div>
                      {/* Sample chips */}
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {['Flash sale', 'Ra mắt sản phẩm', 'Khuyến mãi', 'Giới thiệu thương hiệu'].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setInputValue(tag)}
                            className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generating skeleton */}
                  {isGenerating && !rawOutput && (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="w-full space-y-3">
                        {[100, 85, 90, 70, 80].map((w, i) => (
                          <div
                            key={i}
                            className="h-3.5 bg-muted rounded-full animate-pulse"
                            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typewriter output */}
                  {(displayed || rawOutput) && (
                    <div className="absolute inset-0 overflow-y-auto p-5">
                      <pre className="whitespace-pre-wrap text-foreground text-sm leading-relaxed font-sans break-words">
                        {displayed}
                        {!done && (
                          <span className="inline-block w-0.5 h-4 bg-primary/50 ml-0.5 animate-pulse align-middle" />
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Action bar — shown after done */}
                {hasGenerated && done && (
                  <div className="border-t border-border px-5 py-4 flex items-center justify-between gap-3 bg-surface-muted/60">
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                          copied
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-card text-foreground/80 border-border hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Đã copy!' : 'Copy text'}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-card text-foreground/80 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Tạo lại
                      </button>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/50 text-white transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Tốt lắm!
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="text-center mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Demo miễn phí, không cần tài khoản
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Đăng ký để dùng đầy đủ tính năng
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> 14 ngày Pro miễn phí
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
