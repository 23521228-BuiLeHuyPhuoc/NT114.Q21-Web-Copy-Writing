import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  variations: number;
  onVariationsChange: (v: number) => void;
  temperature: number[];
  onTemperatureChange: (v: number[]) => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function AdvancedSettings({ variations, onVariationsChange, temperature, onTemperatureChange, open, onOpenChange }: Props) {
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
