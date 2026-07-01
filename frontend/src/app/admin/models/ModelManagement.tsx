import { useMemo } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BarChart3, CheckCircle2, Cpu, Database, ExternalLink, Globe, Route, Server } from 'lucide-react';
import { BarChart } from '@/app/components/charts';
import { StatTile } from '@/app/components/admin/StatTile';
import { useFineTuningModels } from '@/hooks/queries/useFineTuning';
import { formatBaseModelDisplayName } from '@/lib/modelDisplayName';

type BenchmarkInfo = {
  primaryMetric: string;
  primaryScore: number | null;
  math: string;
  code: string;
  general: string;
  note: string;
  source: string;
  url: string;
};

type AiModelInfo = {
  id: string;
  apiModel: string;
  name: string;
  provider: string;
  kind: string;
  status: string;
  context: string;
  output: string;
  price: string;
  route: string;
  env: string;
  source: string;
  url?: string;
  features: string[];
  note: string;
  benchmark: BenchmarkInfo;
};

const AI_MODELS: AiModelInfo[] = [
  {
    id: 'gemini-flash',
    apiModel: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google Gemini API',
    kind: 'Cloud API',
    status: 'GA',
    context: '1,048,576 tokens',
    output: '65,536 tokens',
    price: '$0.30 input / $2.50 output per 1M tokens',
    route: 'callGemini -> GEMINI_MODEL_MAP',
    env: 'GEMINI_API_KEY hoặc GOOGLE_API_KEY',
    source: 'Google AI model docs',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash',
    features: ['Multimodal input', 'Function calling', 'Structured output', 'Search grounding', 'Thinking'],
    note: 'Model cân bằng chất lượng và chi phí, đang là lựa chọn tốt cho copy dài và brief phức tạp.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 82.8,
      math: 'AIME 2025: 72.0%',
      code: 'LiveCodeBench v5: 63.9%',
      general: 'Global MMLU Lite: 88.4%',
      note: 'Số liệu từ model card Gemini 2.5 Flash.',
      source: 'Google DeepMind model card',
      url: 'https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-2-5-Flash-Model-Card.pdf',
    },
  },
  {
    id: 'gemini-flash-lite',
    apiModel: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'Google Gemini API',
    kind: 'Cloud API',
    status: 'GA',
    context: '1,048,576 tokens',
    output: '65,536 tokens',
    price: '$0.10 input / $0.40 output per 1M tokens',
    route: 'callGemini -> GEMINI_MODEL_MAP',
    env: 'GEMINI_API_KEY hoặc GOOGLE_API_KEY',
    source: 'Google AI model docs',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite',
    features: ['Multimodal input', 'Function calling', 'Structured output', 'Low latency', 'Low cost'],
    note: 'Model nhẹ cho request số lượng lớn, phân loại, trích xuất dữ liệu và nội dung ngắn.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 64.6,
      math: 'AIME 2025: 49.8%',
      code: 'LiveCodeBench v5: 33.7%',
      general: 'Global MMLU Lite: 81.1%',
      note: 'Số liệu từ model card Gemini 2.5 Flash-Lite.',
      source: 'Google DeepMind model card',
      url: 'https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-2-5-Flash-Lite-Model-Card.pdf',
    },
  },
  {
    id: 'groq-llama-3-3-70b',
    apiModel: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Groq / Meta Llama',
    kind: 'Open-weight API',
    status: 'Production',
    context: '131,072 tokens',
    output: '32,768 tokens',
    price: '$0.59 input / $0.79 output per 1M tokens',
    route: 'callGroq -> GROQ_MODEL_MAP',
    env: 'GROQ_API_KEY',
    source: 'Groq supported models',
    url: 'https://console.groq.com/docs/models',
    features: ['Open weights', 'Large context', 'Tool-use capable', '280 tokens/s theo Groq'],
    note: 'Open-weight mạnh, hợp khi muốn cân bằng chất lượng, chi phí và tốc độ qua Groq.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 50.5,
      math: 'MATH CoT: 77.0%',
      code: 'HumanEval: 88.4%',
      general: 'MMLU: 86.0% / MMLU Pro: 68.9%',
      note: 'Benchmark của model nền Meta Llama 3.3 70B Instruct.',
      source: 'Meta model card',
      url: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
    },
  },
  {
    id: 'groq-llama-3-1-8b',
    apiModel: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'Groq / Meta Llama',
    kind: 'Open-weight API',
    status: 'Production',
    context: '131,072 tokens',
    output: '131,072 tokens',
    price: '$0.05 input / $0.08 output per 1M tokens',
    route: 'callGroq -> GROQ_MODEL_MAP',
    env: 'GROQ_API_KEY',
    source: 'Groq supported models',
    url: 'https://console.groq.com/docs/models',
    features: ['Open weights', 'Very fast', 'Large context', '560 tokens/s theo Groq'],
    note: 'Ưu tiên tốc độ và chi phí thấp cho tác vụ đơn giản, demo nhanh hoặc copy ngắn.',
    benchmark: {
      primaryMetric: 'GPQA',
      primaryScore: 30.4,
      math: 'MATH CoT: 51.9% / GSM-8K: 84.5%',
      code: 'HumanEval: 72.6%',
      general: 'MMLU: 73.0% / MMLU Pro: 48.3%',
      note: 'Benchmark của model nền Meta Llama 3.1 8B Instruct.',
      source: 'Meta model card',
      url: 'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct',
    },
  },
  {
    id: 'gemini-3-flash-preview',
    apiModel: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'Google Gemini API',
    kind: 'Preview cloud API',
    status: 'Preview',
    context: '1M tokens',
    output: 'Phụ thuộc API preview',
    price: '$0.50 input / $3.00 output per 1M tokens',
    route: 'callGemini -> GEMINI_MODEL_MAP',
    env: 'GEMINI_API_KEY hoặc GOOGLE_API_KEY',
    source: 'Google AI model docs',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview',
    features: ['Frontier reasoning', 'Multimodal', 'Agentic coding', 'Preview availability'],
    note: 'Model preview chất lượng cao hơn 2.5 Flash; cần lưu ý SLA/rate limit preview có thể thay đổi.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 90.4,
      math: 'HLE no tools: 33.7%',
      code: 'SWE-bench Verified: 78.0%',
      general: 'MMMU Pro: 81.2%',
      note: 'Google công bố benchmark trong bài ra mắt Gemini 3 Flash.',
      source: 'Google Blog',
      url: 'https://blog.google/products-and-platforms/products/gemini/gemini-3-flash/',
    },
  },
  {
    id: 'gemini-3-1-flash-lite',
    apiModel: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'Google Gemini API',
    kind: 'Cloud API',
    status: 'GA/Preview transition',
    context: '1,048,576 tokens',
    output: '65,536 tokens',
    price: '$0.25 input / $1.50 output per 1M tokens',
    route: 'callGemini -> GEMINI_MODEL_MAP',
    env: 'GEMINI_API_KEY hoặc GOOGLE_API_KEY',
    source: 'Google AI model docs',
    url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview',
    features: ['High-volume workloads', 'Thinking levels', 'Multimodal', 'Low latency'],
    note: 'Model Flash-Lite mới cho workload lớn, rẻ hơn nhóm model lớn nhưng vẫn có thinking.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 86.9,
      math: 'Speed: 2.5x faster TTFT vs 2.5 Flash',
      code: 'Output speed: +45% vs 2.5 Flash',
      general: 'MMMU Pro: 76.8% / Arena Elo: 1432',
      note: 'Google công bố GPQA/MMMU và chỉ số tốc độ trong bài ra mắt 3.1 Flash-Lite.',
      source: 'Google Blog',
      url: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/',
    },
  },
  {
    id: 'gemma-4-26b',
    apiModel: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B A4B IT',
    provider: 'Google Gemma / Gemini API',
    kind: 'Open-weight model via API',
    status: 'Model card',
    context: '256K tokens',
    output: 'Phụ thuộc serving backend',
    price: 'Phụ thuộc Gemini/Gemma provider',
    route: 'callGemini -> GEMINI_MODEL_MAP',
    env: 'GEMINI_API_KEY hoặc GOOGLE_API_KEY',
    source: 'Google Gemma docs',
    url: 'https://ai.google.dev/gemma/docs/core',
    features: ['Open weights', 'MoE 26B A4B', 'Text + image', 'Function calling', 'Long context'],
    note: 'Gemma open-weight mới, hữu ích khi cần model có trọng số mở và context dài.',
    benchmark: {
      primaryMetric: 'GPQA Diamond',
      primaryScore: 82.3,
      math: 'AIME 2026 no tools: 88.3%',
      code: 'LiveCodeBench v6: 77.1%',
      general: 'MMLU Pro: 82.6% / MMMLU: 86.3%',
      note: 'Benchmark của model card Gemma 4 26B A4B IT.',
      source: 'Google/Hugging Face model card',
      url: 'https://huggingface.co/google/gemma-4-26B-A4B-it',
    },
  },
  {
    id: 'openrouter-free',
    apiModel: 'openrouter/free',
    name: 'OpenRouter Free Router',
    provider: 'OpenRouter',
    kind: 'Router',
    status: 'Dynamic',
    context: 'Khoảng 200K theo OpenRouter',
    output: 'Phụ thuộc model được route',
    price: 'Free tier',
    route: 'callOpenRouter -> OPENROUTER_MODEL_MAP',
    env: 'OPENROUTER_API_KEY',
    source: 'OpenRouter Free Models Router',
    url: 'https://openrouter.ai/openrouter/free',
    features: ['Free router', 'Chọn model free theo request', 'Model thay đổi theo availability'],
    note: 'Đây là router, không phải một model cố định; app vẫn liệt kê vì người dùng có thể chọn trong Model AI.',
    benchmark: {
      primaryMetric: 'N/A',
      primaryScore: null,
      math: 'Không cố định',
      code: 'Không cố định',
      general: 'Không cố định',
      note: 'OpenRouter/free chọn model free khả dụng nên không có benchmark cố định. Benchmark thực tế phải đọc model trả về trong response/activity.',
      source: 'OpenRouter docs',
      url: 'https://openrouter.ai/openrouter/free',
    },
  },
  {
    id: 'freegpt4-gpt-4',
    apiModel: 'gpt-4',
    name: 'GPT-4 Free API',
    provider: 'FreeGPT4 online endpoint',
    kind: 'Online API',
    status: 'Online',
    context: 'Phụ thuộc provider phía sau',
    output: 'Phụ thuộc provider phía sau',
    price: 'Miễn phí trong app; phụ thuộc upstream',
    route: 'callFreeGPT4 -> FREEGPT4_MODEL_MAP',
    env: 'FREEGPT4_BASE_URL',
    source: 'Configured FreeGPT4 endpoint',
    features: ['Online FreeGPT4 endpoint', 'model=gpt-4', 'No direct OpenAI key required in app'],
    note: 'Đây là model đại diện qua endpoint FreeGPT4 online. Benchmark hiển thị theo GPT-4 gốc, còn chất lượng thực tế phụ thuộc upstream provider.',
    benchmark: {
      primaryMetric: 'MMLU',
      primaryScore: 86.4,
      math: 'GSM-8K: 92.0%',
      code: 'HumanEval: 67.0%',
      general: 'HellaSwag: 95.3% / ARC: 96.3%',
      note: 'Benchmark đại diện theo GPT-4 Technical Report, không phải đo trực tiếp FreeGPT4 wrapper.',
      source: 'OpenAI GPT-4 Technical Report',
      url: 'https://cdn.openai.com/papers/gpt-4.pdf',
    },
  },
];

const SOURCES = [
  ['Google Gemini model docs', 'https://ai.google.dev/gemini-api/docs/models'],
  ['Google Gemini API pricing', 'https://ai.google.dev/gemini-api/docs/pricing'],
  ['Groq supported models', 'https://console.groq.com/docs/models'],
  ['Google Gemini 3 Flash launch/benchmarks', 'https://blog.google/products-and-platforms/products/gemini/gemini-3-flash/'],
  ['Google Gemini 3.1 Flash-Lite launch/benchmarks', 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/'],
  ['Gemma 4 26B A4B IT model card', 'https://huggingface.co/google/gemma-4-26B-A4B-it'],
  ['Meta Llama 3.3 70B model card', 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct'],
  ['Meta Llama 3.1 8B model card', 'https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct'],
  ['OpenRouter Free Models Router', 'https://openrouter.ai/openrouter/free'],
  ['OpenAI GPT-4 Technical Report', 'https://cdn.openai.com/papers/gpt-4.pdf'],
] as const;

function SourceLink({ label, url }: { label: string; url?: string }) {
  if (!url) return <span>{label}</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function formatScore(score: number | null) {
  return typeof score === 'number' ? score + '%' : 'N/A';
}

export function AdminModelManagement() {
  const { data: fineTunedModels = [], isLoading } = useFineTuningModels();
  const readyFineTunedModels = useMemo(
    () => fineTunedModels.filter(model => model.status === 'ready' || model.isActive),
    [fineTunedModels],
  );
  const providerCount = new Set(AI_MODELS.map(model => model.provider)).size;
  const benchmarkedModels = AI_MODELS.filter(model => typeof model.benchmark.primaryScore === 'number');

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý model AI</h1>
          <p className="text-muted-foreground text-sm">Toàn bộ model người dùng chọn được trong Model AI, kèm route backend và benchmark theo nguồn công khai.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatTile icon={Cpu} label="Model người dùng thấy" value={AI_MODELS.length} color="bg-primary/10 text-primary" iconClassName="w-5 h-5" valueClassName="text-2xl" />
          <StatTile icon={CheckCircle2} label="Có benchmark cố định" value={benchmarkedModels.length} color="bg-primary/10 text-primary" iconClassName="w-5 h-5" valueClassName="text-2xl" />
          <StatTile icon={Globe} label="Providers/wrappers" value={providerCount} color="bg-primary/10 text-primary" iconClassName="w-5 h-5" valueClassName="text-2xl" />
          <StatTile icon={Database} label="Fine-tuned ready" value={readyFineTunedModels.length} color="bg-warning/10 text-amber-800" iconClassName="w-5 h-5" valueClassName="text-2xl" />
        </div>

        <Tabs defaultValue="models">
          <TabsList className="mb-6">
            <TabsTrigger value="models"><Cpu className="w-4 h-4 mr-2" />Models</TabsTrigger>
            <TabsTrigger value="benchmark"><BarChart3 className="w-4 h-4 mr-2" />Benchmark</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            {AI_MODELS.map(model => (
              <Card key={model.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Cpu className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-foreground">{model.name}</h3>
                      <Badge className="bg-primary/10 text-primary border-0">{model.status}</Badge>
                      <Badge className="bg-muted text-foreground/75 border-0">{model.kind}</Badge>
                      <span className="text-sm text-muted-foreground">{model.provider}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                      <div className="bg-surface-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">App model ID</p><p className="font-semibold text-sm break-all">{model.id}</p></div>
                      <div className="bg-surface-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Provider model ID</p><p className="font-semibold text-sm break-all">{model.apiModel}</p></div>
                      <div className="bg-surface-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Context / output</p><p className="font-semibold text-sm">{model.context} / {model.output}</p></div>
                      <div className="bg-surface-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">Giá public</p><p className="font-semibold text-sm">{model.price}</p></div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 mb-4">
                      <div className="rounded-lg border border-border p-3"><p className="text-xs font-semibold text-foreground/70 mb-1">Backend route</p><p className="text-xs text-foreground/80 font-mono break-all">{model.route}</p></div>
                      <div className="rounded-lg border border-border p-3"><p className="text-xs font-semibold text-foreground/70 mb-1">Env cần cấu hình</p><p className="text-xs text-foreground/80 font-mono break-all">{model.env}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {model.features.map(feature => <Badge key={feature} className="bg-primary/10 text-primary border-0 text-xs">{feature}</Badge>)}
                    </div>
                    <p className="text-sm text-foreground/75 mb-3">{model.note}</p>
                    <p className="text-xs text-muted-foreground">Nguồn model: <SourceLink label={model.source} url={model.url} /></p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground lg:w-44"><Server className="h-4 w-4" /><span>{model.kind}</span></div>
                </div>
              </Card>
            ))}

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3"><Database className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Fine-tuned models từ backend</h3></div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải model fine-tuned...</p>
              ) : fineTunedModels.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có fine-tuned model nào trong registry.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-4 font-medium">Tên</th><th className="py-2 pr-4 font-medium">Provider</th><th className="py-2 pr-4 font-medium">Base model</th><th className="py-2 pr-4 font-medium">Trạng thái</th><th className="py-2 pr-4 font-medium">Generator</th></tr></thead>
                    <tbody>
                      {fineTunedModels.map(item => (
                        <tr key={item.registryModelId || item.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-semibold text-foreground">{item.name}</td>
                          <td className="py-3 pr-4 text-foreground/75">{item.provider || '-'}</td>
                          <td className="py-3 pr-4 text-foreground/75">{formatBaseModelDisplayName(item.baseModel)}</td>
                          <td className="py-3 pr-4"><Badge className={item.status === 'ready' ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-muted-foreground border-0'}>{item.status}</Badge></td>
                          <td className="py-3 pr-4 text-foreground/75">{item.generatorReady === false ? item.generatorMessage || 'Chưa sẵn sàng' : 'Sẵn sàng'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-6">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-1">Điểm benchmark chính theo từng model</h3>
              <p className="text-xs text-muted-foreground mb-4">Biểu đồ chỉ vẽ các model có điểm cố định. Router động như OpenRouter/free được giữ trong bảng nhưng không đưa vào biểu đồ.</p>
              <BarChart data={benchmarkedModels.map(model => ({ model: model.name.replace('Gemini ', '').replace(' Free API', ''), score: model.benchmark.primaryScore ?? 0 }))} xKey="model" height={300} yMin={0} yMax={100} series={[{ key: 'score', label: 'Primary benchmark score', color: '#16723a' }]} />
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Bảng benchmark có nguồn</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-4 font-medium">Model</th><th className="py-2 pr-4 font-medium">Metric chính</th><th className="py-2 pr-4 font-medium">Điểm</th><th className="py-2 pr-4 font-medium">Math/Speed</th><th className="py-2 pr-4 font-medium">Code</th><th className="py-2 pr-4 font-medium">General/khác</th><th className="py-2 pr-4 font-medium">Nguồn</th></tr></thead>
                  <tbody>
                    {AI_MODELS.map(model => (
                      <tr key={model.id} className="border-b last:border-0 align-top">
                        <td className="py-3 pr-4 font-semibold text-foreground">{model.name}<p className="text-xs font-normal text-muted-foreground mt-1">{model.id}</p></td>
                        <td className="py-3 pr-4 text-foreground/75">{model.benchmark.primaryMetric}</td>
                        <td className="py-3 pr-4 font-semibold text-primary">{formatScore(model.benchmark.primaryScore)}</td>
                        <td className="py-3 pr-4 text-foreground/75">{model.benchmark.math}</td>
                        <td className="py-3 pr-4 text-foreground/75">{model.benchmark.code}</td>
                        <td className="py-3 pr-4 text-foreground/75">{model.benchmark.general}<p className="text-xs text-muted-foreground mt-2">{model.benchmark.note}</p></td>
                        <td className="py-3 pr-4 text-xs"><SourceLink label={model.benchmark.source} url={model.benchmark.url} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3"><Route className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Ghi chú về model đại diện, router và wrapper</h3></div>
              <div className="space-y-2 text-sm text-foreground/75">
                <p><span className="font-semibold text-foreground">FreeGPT4 GPT-4:</span> app gọi endpoint FreeGPT4 online trong FREEGPT4_BASE_URL với model parameter tương ứng. Benchmark trong bảng là benchmark đại diện của GPT-4 gốc, không phải phép đo trực tiếp endpoint này.</p>
                <p><span className="font-semibold text-foreground">OpenRouter Free Router:</span> đây là router chọn model free khả dụng, nên không có benchmark cố định. Muốn đo thật phải log model thực tế mà OpenRouter trả về từng request.</p>
                <p><span className="font-semibold text-foreground">Preview/GA transition:</span> các model Gemini preview có thể thay đổi model ID, rate limit, giá hoặc benchmark theo thời gian.</p>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Nguồn đã dùng</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {SOURCES.map(([label, url]) => <div key={url} className="rounded-lg border border-border px-3 py-2 text-sm"><SourceLink label={label} url={url} /></div>)}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
