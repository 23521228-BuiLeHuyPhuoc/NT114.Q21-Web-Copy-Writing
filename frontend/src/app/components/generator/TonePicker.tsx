import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
export interface TonePickerOption {
  id: string;
  name: string;
  desc: string;
  icon?: string;
  emoji?: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  options: TonePickerOption[];
}

export function TonePicker({ value, onChange, options }: Props) {
  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-foreground/80 mb-3 block">Tone giọng văn</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all overflow-hidden ${value === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
          >
            <span className="text-base flex-shrink-0">{t.emoji}</span>
            <div className="min-w-0 overflow-hidden">
              <p className={`text-xs font-medium truncate ${value === t.id ? 'text-primary' : 'text-foreground/80'}`}>{t.name}</p>
              <p className="text-xs text-muted-foreground/80 hidden sm:block truncate">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
