import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';

export type ContentLength = 'short' | 'medium' | 'long';

const LENGTH_OPTIONS: { id: ContentLength; label: string; desc: string }[] = [
  { id: 'short', label: 'Ngắn', desc: 'Gọn, dễ quét' },
  { id: 'medium', label: 'Vừa', desc: 'Cân bằng' },
  { id: 'long', label: 'Dài', desc: 'Chi tiết hơn' },
];

interface Props {
  variations: number;
  onVariationsChange: (v: number) => void;
  temperature: number[];
  onTemperatureChange: (v: number[]) => void;
  contentLength: ContentLength;
  onContentLengthChange: (v: ContentLength) => void;
  maxOutputTokens: number;
  onMaxOutputTokensChange: (v: number) => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AdvancedSettings({
  variations,
  onVariationsChange,
  temperature,
  onTemperatureChange,
  contentLength,
  onContentLengthChange,
  maxOutputTokens,
  onMaxOutputTokensChange,
  open,
  onOpenChange,
}: Props) {
  return (
    <Card className="p-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-foreground/80"
        onClick={() => onOpenChange(!open)}
      >
        <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Cài đặt nâng cao</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs text-foreground/70">Độ dài nội dung</Label>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-1">
              {LENGTH_OPTIONS.map(option => {
                const active = contentLength === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onContentLengthChange(option.id)}
                    className={`min-h-16 rounded-md px-2 py-2 text-center transition-all ${active ? 'bg-card text-primary shadow-sm ring-1 ring-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <span className="block text-sm font-semibold leading-5">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-4">{option.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs text-foreground/70">Giới hạn output ({maxOutputTokens} tokens)</Label>
            </div>
            <Slider value={[maxOutputTokens]} onValueChange={v => onMaxOutputTokensChange(v[0])} min={500} max={6000} step={250} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground/80 mt-1"><span>500</span><span>6000</span></div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs text-foreground/70">Số phiên bản ({variations})</Label>
            </div>
            <Slider value={[variations]} onValueChange={v => onVariationsChange(v[0])} min={1} max={5} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground/80 mt-1"><span>1</span><span>5</span></div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-xs text-foreground/70">Temperature: {temperature[0]} (sáng tạo)</Label>
            </div>
            <Slider value={temperature} onValueChange={onTemperatureChange} min={0} max={1} step={0.1} />
            <div className="flex justify-between text-xs text-muted-foreground/80 mt-1"><span>Chính xác</span><span>Sáng tạo</span></div>
          </div>
        </div>
      )}
    </Card>
  );
}
