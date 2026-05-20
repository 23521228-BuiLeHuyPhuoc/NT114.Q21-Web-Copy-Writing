import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Cpu } from 'lucide-react';
import { MODELS } from '@/mocks/generator';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function ModelPicker({ value, onChange }: Props) {
  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
        <Cpu className="w-4 h-4 text-stone-600" /> Model AI
      </Label>
      <div className="space-y-2">
        {MODELS.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${value === m.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${value === m.id ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${m.color}`}>{m.name}</span>
                <Badge className="text-xs border-0 bg-gray-100 text-gray-600">{m.badge}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{m.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.latency} · {m.tokens} context</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
