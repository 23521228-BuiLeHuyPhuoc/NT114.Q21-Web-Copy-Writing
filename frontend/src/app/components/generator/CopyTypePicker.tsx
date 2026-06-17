import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { resolveGeneratorIcon } from '@/lib/generatorOptionIcons';
import type { LucideIcon } from 'lucide-react';

export interface CopyTypePickerOption {
  id: string;
  name: string;
  desc: string;
  icon?: string | LucideIcon;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  options: CopyTypePickerOption[];
}

export function CopyTypePicker({ value, onChange, options }: Props) {
  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-foreground/80 mb-3 block">Loại nội dung</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(ct => {
          const Icon = resolveGeneratorIcon(ct.icon);
          return (
            <button
              key={ct.id}
              onClick={() => onChange(ct.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${value === ct.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${value === ct.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-xs font-medium leading-tight ${value === ct.id ? 'text-primary' : 'text-foreground/80'}`}>{ct.name}</p>
                <p className="text-xs text-muted-foreground/80 leading-tight hidden sm:block">{ct.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
