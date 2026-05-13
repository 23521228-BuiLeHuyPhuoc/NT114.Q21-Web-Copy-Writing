import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Wand2, Mail, FileText, ShoppingCart,
  Megaphone, CheckCircle2, Copy, RotateCcw, ChevronDown,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Scenarios — each loops automatically
───────────────────────────────────────────── */
interface Scenario {
  type: string;
  typeIcon: React.ElementType;
  typeColor: string;
  model: string;
  modelBg: string;
  industry: string;
  inputText: string;
  tone: string;
  output: string;
  quality: number;
  seconds: string;
}

const SCENARIOS: Scenario[] = [
  {
    type: 'Facebook Ad',
    typeIcon: Megaphone,
    typeColor: 'bg-orange-100 text-orange-700',
    model: 'GPT-4o',
    modelBg: 'bg-green-100 text-green-700',
    industry: 'E-commerce',
    inputText: 'Khóa học lập trình Python',
    tone: 'Hấp dẫn, thúc đẩy hành động',
    output:
      '🚀 Học Python từ ZERO đến PRO — chỉ trong 30 ngày!\n\n' +
      'Bạn đang loay hoay không biết bắt đầu từ đâu?\n' +
      'Khóa học Python của chúng tôi sẽ dẫn bạn từng bước từ cơ bản đến thực chiến.\n\n' +
      '✅ 120+ bài học video chất lượng cao\n' +
      '✅ Dự án thực tế: xây app, phân tích dữ liệu\n' +
      '✅ Mentor 1-1 hỗ trợ 24/7\n' +
      '✅ Chứng chỉ được doanh nghiệp công nhận\n\n' +
      '🔥 Ưu đãi 50% — chỉ còn 48 giờ!\n' +
      '👉 Đăng ký ngay để nhận học bổng miễn phí!',
    quality: 94,
    seconds: '1.7',
  },
  {
    type: 'Email Marketing',
    typeIcon: Mail,
    typeColor: 'bg-blue-100 text-blue-700',
    model: 'GPT-4o',
    modelBg: 'bg-green-100 text-green-700',
    industry: 'Retail',
    inputText: 'Flash sale cuối năm giảm 70%',
    tone: 'Khẩn cấp, cá nhân hóa',
    output:
      'Subject: [CHỈ 24H] Tên bạn — Ưu đãi 70% dành riêng cho bạn! 🎁\n\n' +
      'Chào [Tên khách hàng],\n\n' +
      'Chúng tôi đã chọn riêng cho bạn những sản phẩm BÁN CHẠY NHẤT với mức giá\n' +
      'TỐT NHẤT trong năm nay — giảm đến 70%!\n\n' +
      '⏰ Ưu đãi kết thúc lúc 23:59 hôm nay\n' +
      '🛍️  Hơn 500 sản phẩm đang chờ bạn khám phá\n' +
      '🚚 Miễn phí vận chuyển cho đơn từ 299K\n\n' +
      '→ [XEM ƯU ĐÃI NGAY]\n\n' +
      'Chúc bạn mua sắm vui vẻ,\nĐội ngũ CSKH',
    quality: 92,
    seconds: '2.1',
  },
  {
    type: 'Mô tả sản phẩm',
    typeIcon: ShoppingCart,
    typeColor: 'bg-emerald-100 text-emerald-700',
    model: 'Llama 3.1',
    modelBg: 'bg-teal-100 text-teal-700',
    industry: 'Bất động sản',
    inputText: 'Căn hộ cao cấp view sông Q.7',
    tone: 'Sang trọng, thu hút nhà đầu tư',
    output:
      '✨ SUNRISE RIVERSIDE — Kiệt tác kiến trúc bên sông Sài Gòn\n\n' +
      'Nơi cuộc sống thượng lưu chạm đến từng khoảnh khắc.\n\n' +
      'Tọa lạc tại vị trí vàng Quận 7 — trái tim phồn vinh của TP.HCM,\n' +
      'Sunrise Riverside mang đến trải nghiệm sống đẳng cấp 5 sao\n' +
      'với tầm nhìn panorama 270° ôm trọn dòng sông thơ mộng.\n\n' +
      '🏙️ Diện tích: 68 – 142 m² | 2 – 4 phòng ngủ\n' +
      '🌿 Tiện ích: hồ bơi vô cực, gym, spa, sky lounge\n' +
      '📍 Kết nối: 5 phút đến Phú Mỹ Hưng, Crescent Mall\n' +
      '💎 Pháp lý: sổ hồng lâu dài, ngân hàng hỗ trợ 70%\n\n' +
      'Chỉ 20 căn cuối — Liên hệ ngay để nhận giá ưu đãi!',
    quality: 96,
    seconds: '1.9',
  },
  {
    type: 'Landing Page',
    typeIcon: FileText,
    typeColor: 'bg-violet-100 text-violet-700',
    model: 'GPT-4o',
    modelBg: 'bg-green-100 text-green-700',
    industry: 'SaaS / Công nghệ',
    inputText: 'Phần mềm quản lý nhà hàng',
    tone: 'Chuyên nghiệp, thuyết phục',
    output:
      'HEADLINE:\n' +
      '"Quản lý nhà hàng thông minh hơn — Tăng doanh thu 35% ngay tháng đầu"\n\n' +
      'SUBHEADLINE:\n' +
      'Phần mềm all-in-one giúp bạn kiểm soát order, kho hàng,\n' +
      'nhân sự và báo cáo tài chính — từ một màn hình duy nhất.\n\n' +
      'SOCIAL PROOF:\n' +
      '⭐⭐⭐⭐⭐ "Doanh thu tăng 40% sau 2 tháng dùng!"\n' +
      '— Trần Văn Minh, Chủ chuỗi 5 nhà hàng tại Hà Nội\n\n' +
      'CTA PRIMARY:   [Dùng thử miễn phí 30 ngày →]\n' +
      'CTA SECONDARY: [Xem video demo]\n\n' +
      '✅ Setup 15 phút   ✅ Không cần IT   ✅ Hỗ trợ 24/7',
    quality: 95,
    seconds: '2.3',
  },
];

/* ─────────────────────────────────────────────
   Animation phases (ms durations):
   IDLE → TYPING_INPUT → PRE_GEN → GENERATING → STREAMING → DONE → FADE
───────────────────────────────────────────── */
type Phase =
  | 'idle'
  | 'typing_input'
  | 'pre_gen'
  | 'generating'
  | 'streaming'
  | 'done'
  | 'fade';

/* ─────────────────────────────────────────────
   Typewriter helper
───────────────────────────────────────────── */
function useTypewriter(
  active: boolean,
  fullText: string,
  onDone: () => void,
  charDelay = 16,
) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) { setDisplayed(''); indexRef.current = 0; return; }

    function tick() {
      if (indexRef.current < fullText.length) {
        const burst = Math.min(4, fullText.length - indexRef.current);
        indexRef.current += burst;
        setDisplayed(fullText.slice(0, indexRef.current));
        timerRef.current = setTimeout(tick, charDelay);
      } else {
        onDone();
      }
    }

    timerRef.current = setTimeout(tick, 60);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fullText]);

  return displayed;
}

/* ─────────────────────────────────────────────
   Typewriter for input field
───────────────────────────────────────────── */
function useInputTypewriter(
  active: boolean,
  fullText: string,
  onDone: () => void,
) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!active) { setDisplayed(''); indexRef.current = 0; return; }

    function tick() {
      if (indexRef.current < fullText.length) {
        indexRef.current += 1;
        setDisplayed(fullText.slice(0, indexRef.current));
        timerRef.current = setTimeout(tick, 55 + Math.random() * 40);
      } else {
        onDone();
      }
    }

    timerRef.current = setTimeout(tick, 300);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fullText]);

  return displayed;
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function HeroGeneratorDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [btnPressed, setBtnPressed] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenario = SCENARIOS[scenarioIdx];

  /* ── Typewriter state ── */
  const inputTyped = useInputTypewriter(
    phase === 'typing_input',
    scenario.inputText,
    () => {
      setTimeout(() => setPhase('pre_gen'), 600);
    },
  );

  const outputTyped = useTypewriter(
    phase === 'streaming',
    scenario.output,
    () => setTimeout(() => setPhase('done'), 200),
    14,
  );

  /* ── Phase machine ── */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === 'idle') {
      t = setTimeout(() => setPhase('typing_input'), 800);
    } else if (phase === 'pre_gen') {
      // Animate button click
      t = setTimeout(() => {
        setBtnPressed(true);
        setTimeout(() => {
          setBtnPressed(false);
          setPhase('generating');
        }, 300);
      }, 400);
    } else if (phase === 'generating') {
      t = setTimeout(() => setPhase('streaming'), 1100);
    } else if (phase === 'done') {
      t = setTimeout(() => setPhase('fade'), 3200);
    } else if (phase === 'fade') {
      t = setTimeout(() => {
        setScenarioIdx(i => (i + 1) % SCENARIOS.length);
        setPhase('idle');
        setCopied(false);
      }, 700);
    }

    return () => clearTimeout(t);
  }, [phase]);

  const TypeIcon = scenario.typeIcon;

  const isInputVisible = phase !== 'idle';
  const isOutputVisible = phase === 'streaming' || phase === 'done' || phase === 'fade';
  const isDone = phase === 'done' || phase === 'fade';
  const isFading = phase === 'fade';

  const progressPct =
    phase === 'idle'         ? 0
    : phase === 'typing_input' ? 15
    : phase === 'pre_gen'      ? 30
    : phase === 'generating'   ? 70
    : phase === 'streaming'    ? 85
    : phase === 'done'         ? 100
    : 100;

  return (
    <div
      className={`relative transition-opacity duration-700 ${isFading ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Outer card — browser chrome */}
      <div className="rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-[#0f1117]">

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1d27] border-b border-white/6">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[#0f1117] rounded-lg px-4 py-1 flex items-center gap-2 border border-white/8">
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-[11px] text-gray-500 font-mono truncate">app.copypro.vn/generator</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* App shell — unified height for balanced look */}
        <div className="flex h-[440px] bg-[#0f1117]">

          {/* ── Main area ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
              <h2 className="text-white text-sm font-bold truncate">AI Content Generator</h2>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${scenario.modelBg}`}>
                  {scenario.model}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-400 font-medium hidden sm:block">
                  {scenario.industry}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-gray-800 relative flex-shrink-0">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* ── Left: Controls — narrower so output gets more room ── */}
              <div className="w-[170px] sm:w-[185px] flex-shrink-0 border-r border-white/5 p-3 sm:p-3.5 flex flex-col gap-3 overflow-y-auto">

                {/* Content type */}
                <div>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Loại nội dung</p>
                  <div
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      isInputVisible
                        ? 'border-green-500/50 bg-green-500/8'
                        : 'border-white/8 bg-white/4'
                    } transition-all`}
                  >
                    <div className={`p-1.5 rounded-lg ${scenario.typeColor} transition-all`}>
                      <TypeIcon className="w-3 h-3" />
                    </div>
                    <span className="text-white text-[11px] font-semibold flex-1 truncate">{scenario.type}</span>
                    <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  </div>
                </div>

                {/* Input field */}
                <div>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Sản phẩm / Chủ đề</p>
                  <div className={`relative rounded-xl border px-3 py-2.5 bg-white/4 min-h-[38px] transition-all ${
                    phase === 'typing_input'
                      ? 'border-green-500/60 shadow-[0_0_0_2px_rgba(34,197,94,0.12)]'
                      : isInputVisible
                      ? 'border-white/15'
                      : 'border-white/6'
                  }`}>
                    <span className="text-white text-[11px] leading-snug break-words">
                      {isInputVisible ? inputTyped : ''}
                      {phase === 'typing_input' && (
                        <span className="inline-block w-0.5 h-3 bg-green-400 ml-0.5 align-middle animate-pulse" />
                      )}
                    </span>
                    {!isInputVisible && (
                      <span className="text-gray-700 text-[11px]">Nhập tên sản phẩm...</span>
                    )}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Giọng văn</p>
                  <div className={`rounded-xl border px-3 py-2 bg-white/4 transition-all ${isInputVisible ? 'border-white/12' : 'border-white/5'}`}>
                    <span className="text-gray-400 text-[11px]">{isInputVisible ? scenario.tone : '—'}</span>
                  </div>
                </div>

                {/* Versions */}
                <div>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Số phiên bản</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-default ${
                          n === 1
                            ? 'bg-green-600/20 border-green-500/40 text-green-400'
                            : 'bg-white/4 border-white/8 text-gray-600'
                        }`}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <button
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    phase === 'generating' || phase === 'streaming'
                      ? 'bg-green-600/30 text-green-400 border border-green-500/30 cursor-not-allowed'
                      : btnPressed
                      ? 'bg-green-400 text-white scale-95 shadow-none'
                      : phase === 'pre_gen'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-900/40 scale-100'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-900/30'
                  }`}
                >
                  {phase === 'generating' ? (
                    <>
                      <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Tạo copy AI
                    </>
                  )}
                </button>
              </div>

              {/* ── Right: Output ── */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Output header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0 ${
                      phase === 'generating' ? 'bg-yellow-400 animate-pulse'
                      : isDone ? 'bg-green-500'
                      : phase === 'streaming' ? 'bg-green-400 animate-pulse'
                      : 'bg-gray-700'
                    }`} />
                    <span className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider truncate">
                      {phase === 'idle' ? 'Sẵn sàng'
                        : phase === 'typing_input' ? 'Đang nhập...'
                        : phase === 'pre_gen' ? 'Chuẩn bị...'
                        : phase === 'generating' ? 'AI đang xử lý...'
                        : phase === 'streaming' ? 'Đang tạo copy...'
                        : 'Hoàn thành ✓'}
                    </span>
                  </div>
                  {isDone && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 font-medium hidden sm:block">
                        ⭐ {scenario.quality}%
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-700/30 font-medium">
                        ⚡ {scenario.seconds}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Output body */}
                <div className="flex-1 overflow-hidden relative min-h-0">

                  {/* Loading shimmer rows */}
                  {phase === 'generating' && (
                    <div className="absolute inset-0 p-4 flex flex-col gap-2.5">
                      {[95, 80, 88, 72, 85, 60, 78].map((w, i) => (
                        <div
                          key={i}
                          className="h-3 rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"
                          style={{
                            width: `${w}%`,
                            animationDelay: `${i * 120}ms`,
                            animationDuration: '1.4s',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Idle placeholder */}
                  {(phase === 'idle' || phase === 'typing_input' || phase === 'pre_gen') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <p className="text-gray-700 text-xs font-medium text-center px-6">
                        {phase === 'idle'
                          ? 'Kết quả sẽ xuất hiện tại đây...'
                          : phase === 'typing_input'
                          ? 'Điền thông tin sản phẩm...'
                          : 'Sẵn sàng tạo copy!'}
                      </p>
                    </div>
                  )}

                  {/* Streamed text */}
                  {isOutputVisible && (
                    <div className="absolute inset-0 overflow-y-auto p-3 sm:p-4">
                      <pre className="whitespace-pre-wrap text-gray-200 text-[11px] sm:text-[11.5px] leading-[1.75] font-sans break-words">
                        {outputTyped}
                        {phase === 'streaming' && (
                          <span className="inline-block w-0.5 h-3.5 bg-green-400 ml-0.5 animate-pulse align-middle" />
                        )}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                {isDone && (
                  <div className="border-t border-white/5 px-3 sm:px-4 py-2.5 flex items-center gap-2 bg-[#13161f]/60 flex-shrink-0">
                    <button
                      onClick={() => setCopied(true)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        copied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-white/6 text-gray-300 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {copied
                        ? <><CheckCircle2 className="w-3 h-3" /> Đã copy!</>
                        : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/6 text-gray-300 border border-white/10 transition-all">
                      <RotateCcw className="w-3 h-3" /> Tạo lại
                    </button>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Phiên bản 1/1
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario dots */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
        {SCENARIOS.map((s, i) => {
          const Icon = s.typeIcon;
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all ${
                i === scenarioIdx
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'bg-white/4 border-white/8 text-gray-600'
              }`}
            >
              <Icon className="w-2.5 h-2.5 flex-shrink-0" />
              {s.type}
            </div>
          );
        })}
      </div>
    </div>
  );
}