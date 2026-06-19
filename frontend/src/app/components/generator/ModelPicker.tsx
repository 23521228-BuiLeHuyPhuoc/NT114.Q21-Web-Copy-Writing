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
  group?: string;
  quotaCost?: string;
};

interface Props {
  value: string;
  onChange: (id: string) => void;
  models?: GeneratorModelOption[];
  estimatedQuotaUnits?: number;
}

const MODEL_GROUP_ORDER = ['Google', 'Groq', 'Local API', 'Fine-tuned', 'Other'];

function resolveModelGroup(model: GeneratorModelOption) {
  if (model.group) return model.group;
  if (model.id.startsWith('fine-tuned:') || model.badge.toLowerCase().includes('fine')) return 'Fine-tuned';
  if (model.id.startsWith('groq-') || model.name.toLowerCase().includes('groq')) return 'Groq';
  if (model.id.startsWith('freegpt4-') || model.badge.toLowerCase() === 'local') return 'Local API';
  if (model.id.startsWith('gemini-') || model.id.startsWith('gemma-')) return 'Google';
  return 'Other';
}

function groupModels(models: GeneratorModelOption[]) {
  const groups = models.reduce<Record<string, GeneratorModelOption[]>>((acc, model) => {
    const group = resolveModelGroup(model);
    acc[group] = acc[group] || [];
    acc[group].push(model);
    return acc;
  }, {});

  return Object.entries(groups).sort(([a], [b]) => {
    const orderA = MODEL_GROUP_ORDER.indexOf(a);
    const orderB = MODEL_GROUP_ORDER.indexOf(b);
    return (orderA === -1 ? MODEL_GROUP_ORDER.length : orderA) - (orderB === -1 ? MODEL_GROUP_ORDER.length : orderB);
  });
}

function getQuotaCostText(model: GeneratorModelOption, estimatedQuotaUnits?: number) {
  const baseCost = model.quotaCost || '1 quota / 1.000 tokens';
  if (!estimatedQuotaUnits) return baseCost;
  return `~${estimatedQuotaUnits} quota/request hiện tại (${baseCost})`;
}

export function ModelPicker({ value, onChange, models = MODELS, estimatedQuotaUnits }: Props) {
  const groupedModels = groupModels(models);

  return (
    <Card className="p-4">
      <Label className="text-sm font-semibold text-foreground/80 mb-3 block flex items-center gap-2">
        <Cpu className="w-4 h-4 text-primary" /> Model AI
      </Label>
      <div className="space-y-4">
        {groupedModels.map(([group, items]) => (
          <section key={group} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
              <Badge className="border-0 bg-muted text-[11px] text-foreground/60">{items.length}</Badge>
            </div>
            <div className="space-y-2">
              {items.map(model => (
                <button
                  key={model.id}
                  onClick={() => onChange(model.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${value === model.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${value === model.id ? 'bg-primary/50' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${model.color}`}>{model.name}</span>
                      <Badge className="text-xs border-0 bg-muted text-foreground/70">{model.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{model.desc}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{model.latency} - {model.tokens} context</p>
                    <p className="text-xs font-medium text-primary mt-1">Quota: {getQuotaCostText(model, estimatedQuotaUnits)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
        {groupedModels.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            Khong co model kha dung.
          </div>
        )}
      </div>
    </Card>
  );
}
