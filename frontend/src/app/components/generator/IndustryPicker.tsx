import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { INDUSTRIES } from '@/mocks/generator';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function IndustryPicker({ value, onChange }: Props) {
  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-foreground/80 mb-3 block">Ngành nghề</Label>
      <div className="grid grid-cols-2 gap-2">
        {INDUSTRIES.map(ind => {
          const Icon = ind.icon;
          return (
            <button
              key={ind.id}
              onClick={() => onChange(ind.id)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all text-sm ${value === ind.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30 text-foreground/80'}`}
            >
              <div className={`${ind.color} p-1.5 rounded flex-shrink-0`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="truncate text-xs">{ind.name}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
