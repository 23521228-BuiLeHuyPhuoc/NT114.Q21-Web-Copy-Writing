import { useState, useRef } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Wand2, Copy, RefreshCw, History, ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { MODELS, COPY_TYPES, TONES, INDUSTRIES, MOCK_OUTPUTS, DEFAULT_OUTPUTS } from '@/mocks/generator';
import { IndustryPicker } from '@/app/components/generator/IndustryPicker';
import { CopyTypePicker } from '@/app/components/generator/CopyTypePicker';
import { TonePicker } from '@/app/components/generator/TonePicker';
import { ModelPicker } from '@/app/components/generator/ModelPicker';
import { ProductInfoForm } from '@/app/components/generator/ProductInfoForm';
import { AdvancedSettings } from '@/app/components/generator/AdvancedSettings';
import { GeneratorResults } from '@/app/components/generator/GeneratorResults';


function getOutputs(industry: string, type: string): string[] {
  const industryData = MOCK_OUTPUTS[industry] ?? DEFAULT_OUTPUTS;
  return (industryData as any)[type] ?? DEFAULT_OUTPUTS[type as keyof typeof DEFAULT_OUTPUTS] ?? ['Nội dung đang được tạo...'];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerGenerator() {
  const [industry, setIndustry] = useState('ecommerce');
  const [copyType, setCopyType] = useState('headline');
  const [model, setModel] = useState('gpt4o');
  const [tone, setTone] = useState('urgent');
  const [variations, setVariations] = useState(3);
  const [temperature, setTemperature] = useState([0.7]);
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const [qualityScores, setQualityScores] = useState<number[]>([]);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [latency, setLatency] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const abortRef = useRef(false);

  const selectedModel = MODELS.find(m => m.id === model)!;
  const selectedIndustry = INDUSTRIES.find(i => i.id === industry)!;
  const selectedType = COPY_TYPES.find(t => t.id === copyType)!;

  const simulateStream = async (text: string) => {
    setStreamText('');
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) break;
      await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
      setStreamText(prev => prev + (i > 0 ? ' ' : '') + words[i]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setStreamText('');
    abortRef.current = false;

    const startTime = Date.now();
    const outputList = getOutputs(industry, copyType);
    const variationCount = Math.min(variations, outputList.length);

    const generated: string[] = [];
    const scores: number[] = [];

    for (let v = 0; v < variationCount; v++) {
      if (abortRef.current) break;
      let text = outputList[v] ?? outputList[0];
      if (productName) text = text.replace(/\[Sản phẩm\]|\[sản phẩm\]|Sản phẩm/g, productName);
      if (v === 0) await simulateStream(text);
      generated.push(text);
      scores.push(88 + Math.floor(Math.random() * 10));
    }

    setResults(generated);
    setQualityScores(scores);
    setSelectedResult(0);
    setTokensUsed(320 + Math.floor(Math.random() * 200));
    setLatency(Math.round((Date.now() - startTime) / 100) / 10);
    setStreamText('');
    setIsGenerating(false);
    toast.success('Tạo copy thành công!');
  };

  const handleStop = () => { abortRef.current = true; setIsGenerating(false); };

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Đã sao chép!'); };
  const handleSave = (text: string) => { setSavedItems(prev => [...prev, text]); toast.success('Đã lưu vào lịch sử!'); };
  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'copy.txt'; a.click();
    toast.success('Đã tải xuống!');
  };

  const handleProductInfoChange = (field: 'productName' | 'keywords' | 'targetAudience' | 'additionalContext', value: string) => {
    if (field === 'productName') setProductName(value);
    else if (field === 'keywords') setKeywords(value);
    else if (field === 'targetAudience') setTargetAudience(value);
    else setAdditionalContext(value);
  };

  const handleResultChange = (i: number, value: string) => {
    const newResults = [...results];
    newResults[i] = value;
    setResults(newResults);
  };

  const IndustryIcon = selectedIndustry?.icon ?? ShoppingBag;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">AI Copywriting Engine</h1>
          <p className="text-foreground/70">Tạo copy marketing chuyên nghiệp với GPT-4o, Llama 3.1 và model fine-tuned</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ─── LEFT PANEL: Config ─── */}
          <div className="lg:col-span-2 space-y-4">
            <IndustryPicker value={industry} onChange={setIndustry} />
            <CopyTypePicker value={copyType} onChange={setCopyType} />
            <TonePicker value={tone} onChange={setTone} />
            <ModelPicker value={model} onChange={setModel} />
            <ProductInfoForm
              productName={productName}
              keywords={keywords}
              targetAudience={targetAudience}
              additionalContext={additionalContext}
              onChange={handleProductInfoChange}
            />
            <AdvancedSettings
              variations={variations}
              onVariationsChange={setVariations}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              open={showAdvanced}
              onOpenChange={setShowAdvanced}
            />

            {/* Generate button */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Wand2 className="w-5 h-5 mr-2" />}
                {isGenerating ? 'Đang tạo...' : 'Tạo Copy Ngay'}
              </Button>
              {isGenerating && (
                <Button variant="outline" onClick={handleStop} className="h-12">Stop</Button>
              )}
            </div>
          </div>

          {/* ─── RIGHT PANEL: Output ─── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Meta info bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`${selectedIndustry?.color} p-1.5 rounded flex-shrink-0`}>
                <IndustryIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground/80">{selectedIndustry?.name}</span>
              <span className="text-muted-foreground/60">·</span>
              <Badge className="bg-muted text-foreground/80 border-0">{selectedType?.name}</Badge>
              <Badge className={`border-0 ${MODELS.find(m => m.id === model)?.color === 'text-primary' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                {selectedModel?.name}
              </Badge>
              {results.length > 0 && (
                <>
                  <Badge className="bg-primary/10 text-primary border-0">{tokensUsed} tokens</Badge>
                  <Badge className="bg-muted text-foreground/70 border-0">{latency}s</Badge>
                </>
              )}
            </div>

            <GeneratorResults
              isGenerating={isGenerating}
              streamText={streamText}
              results={results}
              selectedResult={selectedResult}
              qualityScores={qualityScores}
              variations={variations}
              onSelectResult={setSelectedResult}
              onResultChange={handleResultChange}
              onCopy={handleCopy}
              onSave={handleSave}
              onDownload={handleDownload}
              onRegenerate={handleGenerate}
            />

            {/* Prompt preview */}
            {(productName || keywords || targetAudience) && (
              <Card className="p-4 bg-surface-muted">
                <p className="text-xs font-semibold text-foreground/70 mb-2">Prompt sẽ gửi đến {selectedModel?.name}:</p>
                <p className="text-xs text-foreground/80 font-mono bg-card rounded border p-3">
                  Bạn là chuyên gia copywriting cho ngành <strong>{selectedIndustry?.name}</strong>.
                  Viết <strong>{selectedType?.name}</strong> với tone <strong>{TONES.find(t => t.id === tone)?.name}</strong>.
                  {productName && ` Sản phẩm: "${productName}".`}
                  {keywords && ` Từ khóa: ${keywords}.`}
                  {targetAudience && ` Đối tượng: ${targetAudience}.`}
                  {additionalContext && ` Context: ${additionalContext}.`}
                  {' '}Tạo {variations} phiên bản, temperature={temperature[0]}.
                </p>
              </Card>
            )}

            {/* Saved items */}
            {savedItems.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Đã lưu trong phiên này ({savedItems.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-surface-muted rounded text-xs text-foreground/80">
                      <span className="flex-1 line-clamp-2">{item}</span>
                      <button onClick={() => handleCopy(item)} className="text-primary hover:text-primary flex-shrink-0">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
