import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Cpu } from 'lucide-react';
import { MODELS } from '@/mocks/generator';

export type GeneratorModelOption = {
  id: string;
  name: string;
  badge: string;
  color: string;
  desc: string;
  latency: string;
  tokens: string;
};

interface Props {
  value: string;
  onChange: (id: string) => void;
  models?: GeneratorModelOption[];
}

export function ModelPicker({ value, onChange, models = MODELS }: Props) {
  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-foreground/80 mb-3 block flex items-center gap-2">
        <Cpu className="w-4 h-4 text-primary" /> Model AI
      </Label>
      <div className="space-y-2">
        {models.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${value === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${value === m.id ? 'bg-primary/50' : 'bg-gray-300'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${m.color}`}>{m.name}</span>
                <Badge className="text-xs border-0 bg-muted text-foreground/70">{m.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{m.desc}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{m.latency} · {m.tokens} context</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
