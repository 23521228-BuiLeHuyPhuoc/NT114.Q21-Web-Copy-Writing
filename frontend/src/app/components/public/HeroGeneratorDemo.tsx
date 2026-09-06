import { useEffect, useState } from 'react';
import { Check, FileText, Sparkles, Wand2 } from 'lucide-react';

type Phase = 'waiting' | 'typing' | 'thinking' | 'writing' | 'complete' | 'changing';

type DemoScene = {
  format: string;
  prompt: string;
  tone: string;
  result: string;
};

const DEMO_SCENES: DemoScene[] = [
  {
    format: 'Bài đăng mạng xã hội',
    prompt: 'Viết caption ra mắt bộ sổ tay làm từ giấy tái chế, dành cho người thích ghi chép mỗi ngày.',
    tone: 'Ấm áp · gần gũi',
    result: 'Một cuốn sổ mới, một nhịp viết chậm hơn.\n\nBộ sổ tay Mộc được làm từ giấy tái chế, đủ nhẹ để mang theo và đủ bền cho mọi ý tưởng bất chợt.\n\nMở trang đầu tiên — câu chuyện tiếp theo là của bạn.',
  },
  {
    format: 'Email giới thiệu',
    prompt: 'Soạn email giới thiệu workshop viết nội dung cho chủ doanh nghiệp nhỏ, nhấn mạnh tính thực hành.',
    tone: 'Rõ ràng · thuyết phục',
    result: 'Tiêu đề: Biến ý tưởng thành nội dung bán hàng trong một buổi sáng\n\nChào bạn,\n\nWorkshop này không bắt đầu bằng lý thuyết dài. Bạn sẽ mang một sản phẩm thật đến lớp, xây brief và hoàn thiện bộ nội dung đầu tiên ngay tại chỗ.\n\nĐăng ký để giữ chỗ cho buổi thực hành gần nhất.',
  },
  {
    format: 'Mô tả sản phẩm',
    prompt: 'Viết mô tả cho đèn bàn làm việc có ánh sáng dịu, thiết kế tối giản và điều chỉnh được độ sáng.',
    tone: 'Tinh tế · súc tích',
    result: 'Ánh sáng vừa đủ cho những giờ tập trung.\n\nĐèn bàn Nét có ba mức sáng, thân đèn mảnh và góc chiếu linh hoạt. Thiết kế gọn giúp bàn làm việc thoáng hơn, trong khi ánh sáng dịu giữ đôi mắt dễ chịu từ bản nháp đầu tiên đến dòng cuối ngày.',
  },
];

const PHASE_LABELS: Record<Phase, string> = {
  waiting: 'Sẵn sàng nhận brief',
  typing: 'Đang nhập prompt',
  thinking: 'AI đang lên dàn ý',
  writing: 'Đang viết bản nháp',
  complete: 'Bản nháp đã sẵn sàng',
  changing: 'Chuyển brief tiếp theo',
};

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener?.('change', updatePreference);
    return () => media.removeEventListener?.('change', updatePreference);
  }, []);

  return reducedMotion;
}

export function HeroGeneratorDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [promptLength, setPromptLength] = useState(0);
  const [resultLength, setResultLength] = useState(0);

  const scene = DEMO_SCENES[sceneIndex];

  useEffect(() => {
    if (reducedMotion) {
      setPhase('complete');
      setPromptLength(scene.prompt.length);
      setResultLength(scene.result.length);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'waiting') {
      timer = setTimeout(() => setPhase('typing'), 650);
    } else if (phase === 'typing') {
      if (promptLength < scene.prompt.length) {
        timer = setTimeout(() => setPromptLength((value) => Math.min(value + 1, scene.prompt.length)), 32);
      } else {
        timer = setTimeout(() => setPhase('thinking'), 450);
      }
    } else if (phase === 'thinking') {
      timer = setTimeout(() => setPhase('writing'), 1050);
    } else if (phase === 'writing') {
      if (resultLength < scene.result.length) {
        timer = setTimeout(() => setResultLength((value) => Math.min(value + 3, scene.result.length)), 18);
      } else {
        timer = setTimeout(() => setPhase('complete'), 180);
      }
    } else if (phase === 'complete') {
      timer = setTimeout(() => setPhase('changing'), 3400);
    } else {
      timer = setTimeout(() => {
        setSceneIndex((value) => (value + 1) % DEMO_SCENES.length);
        setPromptLength(0);
        setResultLength(0);
        setPhase('waiting');
      }, 420);
    }

    return () => clearTimeout(timer);
  }, [phase, promptLength, reducedMotion, resultLength, scene.prompt.length, scene.result.length]);

  const promptText = scene.prompt.slice(0, promptLength);
  const resultText = scene.result.slice(0, resultLength);
  const isWorking = phase === 'thinking' || phase === 'writing';
  const isComplete = phase === 'complete';
  const activeStep = phase === 'waiting' || phase === 'typing' ? 0 : phase === 'thinking' ? 1 : 2;

  return (
    <div
      aria-hidden="true"
      className={`relative select-none transition-all duration-500 ${phase === 'changing' ? 'translate-y-1 opacity-30' : 'translate-y-0 opacity-100'}`}
    >
      <div className="pointer-events-none absolute -right-3 -top-5 z-10 hidden rotate-2 border-2 border-foreground bg-accent px-4 py-2 font-mono-editorial text-[11px] font-bold uppercase tracking-[.12em] text-foreground shadow-[3px_3px_0_#172033] sm:block">
        Demo tự chạy
      </div>

      <div className="overflow-hidden border-2 border-foreground bg-card shadow-[8px_8px_0_#172033] sm:shadow-[11px_11px_0_#172033]">
        <div className="flex min-w-0 items-center gap-3 border-b-2 border-foreground bg-foreground px-3 py-2.5 text-background sm:px-4">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-background/65" />
          </div>
          <p className="min-w-0 truncate font-mono-editorial text-[11px] font-bold uppercase tracking-[.1em] text-background/80">
            CopyPro / Bàn soạn trực tiếp
          </p>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-background/65">
            <span className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-accent' : 'bg-primary editorial-demo-pulse'}`} />
            {PHASE_LABELS[phase]}
          </span>
        </div>

        <div className="grid min-w-0 sm:grid-cols-[.88fr_1.12fr]">
          <div className="min-w-0 border-b-2 border-foreground bg-surface-muted/70 p-4 sm:border-b-0 sm:border-r-2 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-mono-editorial text-xs font-bold uppercase tracking-[.08em] text-primary">01 / Brief</p>
              <span className="border border-foreground/35 bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                {scene.format}
              </span>
            </div>

            <div className="border border-foreground bg-card p-3 shadow-[3px_3px_0_rgba(23,32,51,.12)] sm:min-h-[132px] sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">Prompt</span>
                <span className="font-mono-editorial text-[10px] font-semibold uppercase tracking-[.08em] text-muted-foreground">Tiếng Việt</span>
              </div>
              <p className="min-h-[72px] break-words text-[13px] leading-6 text-foreground sm:text-sm">
                {promptText || <span className="text-muted-foreground/60">Nhập mục tiêu nội dung tại đây...</span>}
                {phase === 'typing' && <span className="editorial-demo-caret ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-0.5 bg-primary" />}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground">Giọng viết</span>
              <span className="border border-foreground/30 bg-accent/35 px-2.5 py-1 text-[11px] font-semibold text-foreground">{scene.tone}</span>
            </div>

            <div
              className={`mt-4 flex h-10 items-center justify-center gap-2 border-2 border-foreground px-4 text-xs font-bold transition-all duration-200 ${
                isWorking
                  ? 'translate-x-[2px] translate-y-[2px] bg-primary/85 text-primary-foreground shadow-none'
                  : isComplete
                    ? 'bg-accent text-foreground shadow-[3px_3px_0_#172033]'
                    : 'bg-primary text-primary-foreground shadow-[3px_3px_0_#172033]'
              }`}
            >
              {isComplete ? <Check className="h-4 w-4" /> : <Sparkles className={`h-4 w-4 ${isWorking ? 'editorial-demo-spin' : ''}`} />}
              {isWorking ? 'AI đang soạn...' : isComplete ? 'Đã tạo bản nháp' : 'Tạo bản nháp'}
            </div>
          </div>

          <div className="min-w-0 bg-card p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono-editorial text-xs font-bold uppercase tracking-[.08em] text-primary">02 / Bản thảo</p>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${isComplete ? 'bg-success' : isWorking ? 'bg-warning editorial-demo-pulse' : 'bg-muted-foreground/35'}`} />
                {PHASE_LABELS[phase]}
              </span>
            </div>

            <div className="paper-noise relative min-h-[238px] overflow-hidden border border-foreground bg-background p-4 sm:min-h-[292px] sm:p-5">
              <div className="absolute right-0 top-0 h-7 w-7 border-b border-l border-foreground bg-accent/65 [clip-path:polygon(100%_0,100%_100%,0_0)]" />

              {phase === 'thinking' ? (
                <div className="space-y-3 pt-2">
                  <div className="mb-5 flex items-center gap-2 text-xs font-bold text-primary">
                    <Wand2 className="h-4 w-4" /> Đang sắp xếp ý chính
                  </div>
                  {[92, 76, 86, 64, 82, 55].map((width, index) => (
                    <div
                      key={width}
                      className="editorial-demo-shimmer h-2.5"
                      style={{ width: `${width}%`, animationDelay: `${index * 90}ms` }}
                    />
                  ))}
                </div>
              ) : resultText ? (
                <div className="relative">
                  <div className="mb-4 h-1.5 w-20 -rotate-1 bg-accent" />
                  <p className="whitespace-pre-line break-words text-[13px] leading-[1.72] text-foreground sm:text-sm">
                    {resultText}
                    {phase === 'writing' && <span className="editorial-demo-caret ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-0.5 bg-primary" />}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[198px] flex-col items-center justify-center text-center sm:min-h-[250px]">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center border border-foreground bg-accent/30">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>
                  <p className="font-display text-lg font-bold text-foreground">Trang giấy đang chờ</p>
                  <p className="mt-1 max-w-44 text-xs leading-5 text-muted-foreground">Bản nháp xuất hiện ngay khi brief hoàn tất.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t-2 border-foreground bg-background">
          {['Nhập brief', 'AI biên soạn', 'Duyệt bản nháp'].map((label, index) => (
            <div
              key={label}
              className={`flex min-w-0 items-center gap-2 border-r border-foreground px-3 py-2.5 last:border-r-0 ${index <= activeStep ? 'text-foreground' : 'text-muted-foreground/60'}`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold ${index < activeStep || isComplete ? 'bg-foreground text-background' : index === activeStep ? 'bg-primary text-primary-foreground' : 'border border-foreground/35'}`}>
                {index < activeStep || (isComplete && index === 2) ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="truncate text-[11px] font-bold sm:text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {DEMO_SCENES.map((item, index) => (
          <span
            key={item.format}
            className={`h-1.5 transition-all duration-300 ${index === sceneIndex ? 'w-8 bg-primary' : 'w-3 bg-foreground/25'}`}
          />
        ))}
      </div>
    </div>
  );
}
