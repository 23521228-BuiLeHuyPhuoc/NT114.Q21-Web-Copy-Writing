import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  History,
  RefreshCw,
  ShoppingBag,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { MODELS, COPY_TYPES, TONES, INDUSTRIES } from '@/mocks/generator';
import { IndustryPicker } from '@/app/components/generator/IndustryPicker';
import { CopyTypePicker } from '@/app/components/generator/CopyTypePicker';
import { TonePicker } from '@/app/components/generator/TonePicker';
import { ModelPicker } from '@/app/components/generator/ModelPicker';
import { ProductInfoForm } from '@/app/components/generator/ProductInfoForm';
import { AdvancedSettings } from '@/app/components/generator/AdvancedSettings';
import { GeneratorResults } from '@/app/components/generator/GeneratorResults';
import { useGenerateContent } from '@/hooks/queries/useContents';

function splitGeneratedVariations(text: string, expectedCount: number) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (expectedCount <= 1) return [trimmed];

  const patterns = [
    /(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*\*)?(?:Phiên bản|Version)\s*\d+\s*[:.\-]\s*(?:\*\*)?([\s\S]*?)(?=(?:\n\s*(?:#{1,4}\s*)?(?:\*\*)?(?:Phiên bản|Version)\s*\d+\s*[:.\-])|$)/gi,
    /(?:^|\n)\s*(?:\*\*)?\d+[\).\:-]\s*(?:\*\*)?([\s\S]*?)(?=(?:\n\s*(?:\*\*)?\d+[\).\:-]\s*)|$)/g,
  ];

  for (const pattern of patterns) {
    const chunks = Array.from(trimmed.matchAll(pattern))
      .map(match => match[1]?.trim())
      .filter((chunk): chunk is string => Boolean(chunk && chunk.length > 8))
      .slice(0, expectedCount);

    if (chunks.length > 1) return chunks;
  }

  return [trimmed];
}

export function CustomerGenerator() {
  const navigate = useNavigate();
  const generateContent = useGenerateContent();
  const [industry, setIndustry] = useState('ecommerce');
  const [copyType, setCopyType] = useState('headline');
  const [model, setModel] = useState('gemini-flash');
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
  const [generatedContentId, setGeneratedContentId] = useState<string | null>(null);

  const selectedModel = MODELS.find(m => m.id === model) ?? MODELS[0];
  const selectedIndustry = INDUSTRIES.find(i => i.id === industry) ?? INDUSTRIES[0];
  const selectedType = COPY_TYPES.find(t => t.id === copyType) ?? COPY_TYPES[0];
  const selectedTone = TONES.find(t => t.id === tone);

  const buildPrompt = () => [
    `Bạn là chuyên gia copywriting cho ngành ${selectedIndustry?.name || industry}.`,
    `Hãy viết ${selectedType?.name || copyType} với tone ${selectedTone?.name || tone}.`,
    productName ? `Sản phẩm/dịch vụ: ${productName}.` : 'Sản phẩm/dịch vụ: chưa được cung cấp, hãy tự giả định hợp lý theo ngành đã chọn.',
    keywords ? `Từ khóa chính: ${keywords}.` : 'Từ khóa chính: chưa được cung cấp, ưu tiên lợi ích rõ ràng và CTA mạnh.',
    targetAudience ? `Đối tượng mục tiêu: ${targetAudience}.` : 'Đối tượng mục tiêu: khách hàng tiềm năng phổ thông.',
    additionalContext ? `Thông tin bổ sung: ${additionalContext}.` : '',
    `Tạo đúng ${variations} phiên bản riêng biệt.`,
    'Định dạng bắt buộc:',
    'Phiên bản 1: ...',
    'Phiên bản 2: ...',
    variations >= 3 ? 'Phiên bản 3: ...' : '',
    'Mỗi phiên bản phải tự đứng độc lập, không gom chung thành một đoạn lớn.',
    'Dùng tiếng Việt tự nhiên, đầy đủ dấu, có CTA rõ ràng.',
    `Temperature tham khảo: ${temperature[0]}.`,
  ].filter(Boolean).join('\n');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);
    setStreamText('');
    setGeneratedContentId(null);

    const startTime = Date.now();

    try {
      const result = await generateContent.mutateAsync({
        prompt: buildPrompt(),
        type: copyType,
        tone,
        language: 'vi',
        model,
      });

      const splitResults = splitGeneratedVariations(result.content.content, variations);
      setResults(splitResults);
      setQualityScores(splitResults.map((_, index) => Math.max(86, result.content.quality - index)));
      setSelectedResult(0);
      setTokensUsed(result.usage?.totalTokens || result.content.tokens || 0);
      setLatency(Math.round((Date.now() - startTime) / 100) / 10);
      setGeneratedContentId(result.content.id);
      toast.success(result.fallback ? 'Đã tạo nội dung bằng fallback MVP!' : 'Tạo copy thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo nội dung';
      toast.error(message);
    } finally {
      setStreamText('');
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép!');
  };

  const handleSave = (text: string) => {
    setSavedItems(prev => [...prev, text]);
    toast.success('Nội dung đã được lưu trong DB!');
    if (generatedContentId) navigate(`/contents/${generatedContentId}`);
  };

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'copy.txt';
    a.click();
    toast.success('Đã tải xuống!');
  };

  const handleProductInfoChange = (field: 'productName' | 'keywords' | 'targetAudience' | 'additionalContext', value: string) => {
    if (field === 'productName') setProductName(value);
    else if (field === 'keywords') setKeywords(value);
    else if (field === 'targetAudience') setTargetAudience(value);
    else setAdditionalContext(value);
  };

  const handleResultChange = (i: number, value: string) => {
    setResults(prev => prev.map((item, index) => (index === i ? value : item)));
  };

  const IndustryIcon = selectedIndustry?.icon ?? ShoppingBag;

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">AI Copywriting Engine</h1>
          <p className="text-foreground/70">Tạo copy marketing chuyên nghiệp và lưu trực tiếp vào thư viện nội dung.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
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

          <div className="lg:col-span-3">
            <div className="generator-sticky-panel space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2 lg:pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className={`${selectedIndustry?.color} p-1.5 rounded flex-shrink-0`}>
                  <IndustryIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground/80">{selectedIndustry?.name}</span>
                <span className="text-muted-foreground/60">·</span>
                <Badge className="bg-muted text-foreground/80 border-0">{selectedType?.name}</Badge>
                <Badge className="bg-primary/10 text-primary border-0">{selectedModel?.name}</Badge>
                {results.length > 0 && (
                  <>
                    <Badge className="bg-primary/10 text-primary border-0">{tokensUsed} tokens</Badge>
                    <Badge className="bg-muted text-foreground/70 border-0">{latency}s</Badge>
                  </>
                )}
              </div>

              <Card className="p-4 bg-surface-muted">
                <p className="text-xs font-semibold text-foreground/70 mb-2">Prompt gửi đến {selectedModel?.name}:</p>
                <p className="text-xs text-foreground/80 font-mono bg-card rounded border p-3 whitespace-pre-wrap">
                  {buildPrompt()}
                </p>
              </Card>

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

              {generatedContentId && !isGenerating && (
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Nội dung đã được lưu</p>
                    <p className="text-xs text-muted-foreground">Bạn có thể xem lại trong thư viện nội dung.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/contents/${generatedContentId}`)}>
                    Xem chi tiết
                  </Button>
                </Card>
              )}

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
      </div>
    </Layout>
  );
}
