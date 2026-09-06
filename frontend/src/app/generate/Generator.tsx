import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@/lib/next-router-compat';
import {
  Brain,
  Copy,
  Cpu,
  FileText,
  FolderOpen,
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
import { MODELS, COPY_TYPES as FALLBACK_COPY_TYPES, TONES as FALLBACK_TONES, INDUSTRIES as FALLBACK_INDUSTRIES } from '@/lib/generatorConfig';
import { IndustryPicker, type IndustryPickerOption } from '@/app/components/generator/IndustryPicker';
import { CopyTypePicker, type CopyTypePickerOption } from '@/app/components/generator/CopyTypePicker';
import { TonePicker, type TonePickerOption } from '@/app/components/generator/TonePicker';
import { ModelPicker, type GeneratorModelOption } from '@/app/components/generator/ModelPicker';
import { ProductInfoForm } from '@/app/components/generator/ProductInfoForm';
import { AdvancedSettings, type ContentLength } from '@/app/components/generator/AdvancedSettings';
import { GeneratorResults } from '@/app/components/generator/GeneratorResults';
import { EditorialGlyph } from '@/app/components/EditorialArtwork';
import { useCreateContent, useGenerateContent } from '@/hooks/queries/useContents';
import { useProjects } from '@/hooks/queries/useProjects';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { useGenerateOptions } from '@/hooks/queries/useGenerateOptions';
import { useFineTuningModels } from '@/hooks/queries/useFineTuning';
import { useMyBilling } from '@/hooks/queries/useBilling';
import { scoreGeneratedContent } from '@/lib/contentQuality';
import { resolveGeneratorIcon, resolveToneIcon } from '@/lib/generatorOptionIcons';
import { formatGeneratedCopyForTinyMce, htmlToPlainText } from '@/lib/richText';
import type { GeneratedPlagiarism } from '@/services/contentService';

const VERSION_ICON_PREFIX = String.raw`(?:[\u2600-\u27BF\u{1F300}-\u{1FAFF}]\uFE0F?\s*)*`;
const VERSION_HEADER_PREFIX = String.raw`(?:#{1,4}\s*)?(?:[-*]\s*)?(?:\*\*)?\s*${VERSION_ICON_PREFIX}`;
const VERSION_LABEL = String.raw`(?:Phiên\s*bản|Phien\s*ban|Version)`;
const VERSION_BOUNDARY = String.raw`${VERSION_HEADER_PREFIX}${VERSION_LABEL}\s*\d+\s*[:.\-]\s*(?:\*\*)?`;

function normalizeVariationBoundaries(text: string) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(new RegExp(String.raw`([^\n])\s+(${VERSION_BOUNDARY})`, 'giu'), '$1\n$2')
    .trim();
}

function splitGeneratedVariations(text: string, expectedCount: number) {
  const trimmed = normalizeVariationBoundaries(text);
  if (!trimmed) return [];
  if (expectedCount <= 1) return [trimmed];

  const patterns = [
    new RegExp(String.raw`(?:^|\n)\s*${VERSION_HEADER_PREFIX}${VERSION_LABEL}\s*\d+\s*[:.\-]\s*(?:\*\*)?([\s\S]*?)(?=(?:\n\s*${VERSION_BOUNDARY})|$)`, 'giu'),
    /(?:^|\n)\s*(?:\*\*)?\d+[\).\:-]\s*(?:\*\*)?([\s\S]*?)(?=(?:\n\s*(?:\*\*)?\d+[\).\:-]\s*)|$)/g,
  ];

  for (const pattern of patterns) {
    const matchedChunks = Array.from(trimmed.matchAll(pattern))
      .map(match => match[1]?.trim())
      .filter((chunk): chunk is string => Boolean(chunk && chunk.length > 8));
    const chunks = matchedChunks.length > expectedCount
      ? matchedChunks.slice(-expectedCount)
      : matchedChunks;

    if (chunks.length > 1) return chunks;
  }

  return [trimmed];
}

const CONTENT_LENGTH_LABELS: Record<ContentLength, string> = {
  short: 'ngắn gọn',
  medium: 'vừa đủ chi tiết',
  long: 'dài và giàu chi tiết',
};

const LENGTH_TOKEN_LIMITS: Record<ContentLength, number> = {
  short: 900,
  medium: 1800,
  long: 3200,
};

type ModelMode = 'base' | 'fine-tuned';

const FINE_TUNED_MODEL_PREFIX = 'fine-tuned:';
const FINE_TUNED_MODEL_ACCESS = 'fine-tuned';

function getFineTunedRegistryModelId(modelId: string) {
  return modelId.startsWith(FINE_TUNED_MODEL_PREFIX) ? modelId.slice(FINE_TUNED_MODEL_PREFIX.length) : '';
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { message?: string; errors?: { message?: string }[] } };
    message?: string;
  };
  return err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message || fallback;
}

function buildQualityKeywords(...values: string[]) {
  return values.map(value => value.trim()).filter(Boolean).join(' ');
}

function buildTitleFromText(type: string, text: string) {
  const firstLine = text
    .split('\n')
    .map(line => line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim())
    .find(Boolean);

  if (firstLine) return firstLine.slice(0, 120);
  return `${type || 'content'} - ${new Date().toLocaleString('vi-VN')}`;
}

const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  seo: 'Blog SEO',
  product: 'Mô tả sản phẩm',
  social: 'Mạng xã hội',
  email: 'Email marketing',
  ads: 'Quảng cáo',
  landing: 'Landing page',
  review: 'Review & proof',
  b2b: 'B2B sales',
  industry: 'Chuyên ngành',
};

const TEMPLATE_TYPE_LABELS: Record<string, string> = {
  headline: 'Headline',
  description: 'Mô tả',
  social: 'Social',
  email: 'Email',
  cta: 'CTA',
  landing: 'Landing page',
  seo: 'SEO',
  review: 'Review',
};

function getCopyTypeFormatPrompt(type: string, length: ContentLength) {
  switch (type) {
    case 'headline':
      return [
        'Headline: một câu chính sắc, dễ đọc, có lợi ích hoặc điểm khác biệt.',
        length !== 'short' ? 'Subheadline: một câu phụ làm rõ lời hứa của headline.' : '',
        length === 'long' ? 'Lợi ích chính: 2 bullet ngắn.' : '',
        length !== 'short' ? 'Lời kêu gọi hành động: một câu ngắn thúc đẩy người đọc hành động.' : '',
        'Không viết thành email, social post, mô tả sản phẩm hoặc landing page đầy đủ.',
      ].filter(Boolean).join('\n');
    case 'description':
      return [
        'Mô tả ngắn: đoạn mở đầu giới thiệu sản phẩm/dịch vụ.',
        'Lợi ích chính: 2-3 bullet.',
        'Đặc điểm nổi bật: 2-3 bullet.',
        'Lời kêu gọi hành động: lời kêu gọi mua, đăng ký hoặc liên hệ.',
        'Không dùng format email, SEO metadata hoặc caption mạng xã hội.',
      ].join('\n');
    case 'social':
      return [
        'Hook: câu mở đầu kéo chú ý.',
        'Caption: nội dung chính dễ đọc trên mạng xã hội.',
        'Lời kêu gọi hành động: hành động mong muốn.',
        'Hashtags: 3-6 hashtag liên quan.',
        'Không thêm Subject, Preview text, SEO title hoặc Meta description.',
      ].join('\n');
    case 'email':
      return [
        'Subject: dòng tiêu đề email.',
        'Preview text: đoạn xem trước ngắn.',
        'Lời chào: lời chào phù hợp người nhận.',
        'Nội dung chính: tách thành các đoạn ngắn, có thể có bullet nếu cần.',
        'Lời kêu gọi hành động: hành động chính trong email.',
        length === 'long' ? 'P.S.: lời nhắc hoặc ưu đãi cuối email nếu phù hợp.' : '',
        'Không viết như social caption, landing page hoặc SEO snippet.',
      ].filter(Boolean).join('\n');
    case 'cta':
      return [
        'Lời kêu gọi hành động chính: câu/nút kêu gọi hành động.',
        length !== 'short' ? 'Microcopy: một câu hỗ trợ ngay dưới lời kêu gọi hành động.' : '',
        length === 'long' ? 'Ngữ cảnh dùng: vị trí nên đặt lời kêu gọi hành động hoặc tình huống sử dụng.' : '',
        'Chỉ viết lời kêu gọi hành động, không thêm bài quảng cáo dài.',
      ].filter(Boolean).join('\n');
    case 'landing':
      return [
        'Hero headline: tiêu đề chính của hero section.',
        'Subheadline: câu phụ làm rõ giá trị.',
        length === 'long' ? 'Pain point: vấn đề khách hàng đang gặp.' : '',
        'Lợi ích chính: 3 bullet.',
        'Bằng chứng: review, số liệu, cam kết hoặc social proof.',
        length !== 'short' ? 'Offer: ưu đãi hoặc lý do hành động ngay.' : '',
        'Lời kêu gọi hành động: nút hoặc lời kêu gọi hành động chính.',
        'Không viết thành email, SEO metadata hoặc một caption social ngắn.',
      ].filter(Boolean).join('\n');
    case 'seo':
      return [
        'SEO title: tối đa khoảng 60 ký tự, có từ khóa chính.',
        'Meta description: tối đa khoảng 155 ký tự, có lợi ích và lời kêu gọi hành động nhẹ.',
        'Slug: URL slug ngắn, không dấu, dùng dấu gạch ngang.',
        'Heading gợi ý: 2 H2 và 1 H3.',
        length === 'long' ? 'Mở bài: đoạn mở đầu khoảng 100-140 từ, tự nhiên và có từ khóa.' : '',
        'Không thêm lời chào email, hashtag social hoặc testimonial.',
      ].filter(Boolean).join('\n');
    case 'review':
      return [
        'Quote: lời nhận xét tự nhiên ở ngôi thứ nhất.',
        'Người đánh giá: chân dung khách hàng phù hợp, có thể dùng placeholder.',
        'Bối cảnh: tình huống trước khi dùng sản phẩm/dịch vụ.',
        'Kết quả: thay đổi hoặc lợi ích sau khi sử dụng.',
        'Lời kêu gọi hành động mềm: lời khuyến nghị tự nhiên, không bán hàng quá đà.',
        'Không viết thành mô tả sản phẩm, email hoặc SEO metadata.',
      ].join('\n');
    default:
      return 'Chia thành các đoạn ngắn, có nhãn rõ, có lời kêu gọi hành động phù hợp và không trộn format của loại nội dung khác.';
  }
}

export function CustomerGenerator() {
  const navigate = useNavigate();
  const generateContent = useGenerateContent();
  const createContent = useCreateContent();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const { data: projects = [], isLoading: projectsLoading } = useProjects({ limit: 50 });
  const { data: generateOptions } = useGenerateOptions();
  const { data: fineTunedModels = [] } = useFineTuningModels();
  const { data: billing } = useMyBilling();
  const [industry, setIndustry] = useState('ecommerce');
  const [copyType, setCopyType] = useState('headline');
  const [model, setModel] = useState('gemini-flash');
  const [modelMode, setModelMode] = useState<ModelMode>('base');
  const [fineTunedModelId, setFineTunedModelId] = useState('');
  const [tone, setTone] = useState('urgent');
  const [variations, setVariations] = useState(3);
  const [temperature, setTemperature] = useState([0.7]);
  const [contentLength, setContentLength] = useState<ContentLength>('medium');
  const [maxOutputTokens, setMaxOutputTokens] = useState(LENGTH_TOKEN_LIMITS.medium);
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState(0);
  const [qualityScores, setQualityScores] = useState<number[]>([]);
  const [plagiarism, setPlagiarism] = useState<GeneratedPlagiarism | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [latency, setLatency] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const planAllowedModels = billing?.plan?.allowedModels;
  const hasPlanModelRestrictions = Boolean(planAllowedModels?.length);
  const isFineTunedAllowed = !hasPlanModelRestrictions || Boolean(planAllowedModels?.includes(FINE_TUNED_MODEL_ACCESS));
  const baseGeneratorModels = useMemo(() => {
    if (!planAllowedModels?.length) return MODELS;
    const allowed = new Set(planAllowedModels);
    return MODELS.filter(item => allowed.has(item.id));
  }, [planAllowedModels]);

  const industryOptions = useMemo<IndustryPickerOption[]>(() => {
    const items = generateOptions?.industries || [];
    if (!items.length) return FALLBACK_INDUSTRIES;
    return items.map(item => ({ id: item.slug, name: item.name, icon: item.icon, color: item.color }));
  }, [generateOptions?.industries]);

  const copyTypeOptions = useMemo<CopyTypePickerOption[]>(() => {
    const items = generateOptions?.copyTypes || [];
    if (!items.length) return FALLBACK_COPY_TYPES;
    return items.map(item => ({ id: item.slug, name: item.name, desc: item.description, icon: item.icon }));
  }, [generateOptions?.copyTypes]);

  const toneOptions = useMemo<TonePickerOption[]>(() => {
    const items = generateOptions?.tones || [];
    if (!items.length) return FALLBACK_TONES;
    return items.map(item => ({ id: item.slug, name: item.name, desc: item.description, icon: item.icon, emoji: resolveToneIcon(item.icon) }));
  }, [generateOptions?.tones]);

  const registeredFineTunedModels = useMemo(() => {
    return fineTunedModels.filter(item => item.status === 'ready' && item.registryModelId);
  }, [fineTunedModels]);

  const fineTunedGeneratorModels = useMemo<GeneratorModelOption[]>(() => {
    if (!isFineTunedAllowed) return [];

    return registeredFineTunedModels
      .filter(item => item.generatorReady !== false)
      .map(item => ({
        id: `${FINE_TUNED_MODEL_PREFIX}${item.registryModelId}`,
        name: item.name,
        badge: 'Fine-tuned',
        color: 'text-primary',
        desc: `${item.industry} - ${item.trainedOn} ví dụ, base ${item.baseModel}`,
        latency: '~2-30s',
        tokens: item.fineTunedModelId ? 'custom' : 'base',
      }));
  }, [isFineTunedAllowed, registeredFineTunedModels]);

  const fineTunedUnavailableMessage = useMemo(() => {
    if (fineTunedGeneratorModels.length > 0) return '';
    if (!isFineTunedAllowed && registeredFineTunedModels.length > 0) {
      return `Gói ${billing?.plan?.name || 'hiện tại'} chưa mở quyền dùng model fine-tuned để generate.`;
    }
    const unsupported = registeredFineTunedModels.find(item => item.generatorReady === false);
    if (unsupported) return unsupported.generatorMessage || 'Model đã train xong nhưng provider này chưa có endpoint Generate trong app.';
    if (fineTunedModels.some(item => item.status === 'ready')) {
      return 'Model đã xong training, hệ thống đang đồng bộ registry. Thử tải lại sau vài giây.';
    }
    return 'Chưa có model fine-tuned khả dụng. Hãy hoàn tất training trước.';
  }, [billing?.plan?.name, fineTunedGeneratorModels.length, fineTunedModels, isFineTunedAllowed, registeredFineTunedModels]);

  const fineTunedModelPickerValue = fineTunedModelId ? `${FINE_TUNED_MODEL_PREFIX}${fineTunedModelId}` : '';
  const selectedFineTunedModel = fineTunedGeneratorModels.find(m => m.id === fineTunedModelPickerValue) ?? fineTunedGeneratorModels[0] ?? null;
  const selectedBaseModel = baseGeneratorModels.find(m => m.id === model) ?? null;
  const effectiveModel = modelMode === 'fine-tuned' ? (selectedFineTunedModel?.id || '') : (selectedBaseModel?.id || '');
  const selectedModel = modelMode === 'fine-tuned'
    ? selectedFineTunedModel
    : selectedBaseModel;
  const hasFineTunedModels = fineTunedGeneratorModels.length > 0;
  const selectedIndustry = industryOptions.find(i => i.id === industry) ?? industryOptions[0];
  const selectedType = copyTypeOptions.find(t => t.id === copyType) ?? copyTypeOptions[0];
  const selectedTone = toneOptions.find(t => t.id === tone) ?? toneOptions[0];
  const selectedTemplate = useMemo(
    () => templates.find(template => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );
  const selectedProject = useMemo(
    () => projects.find(project => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('templateId');
    const projectId = params.get('projectId');
    const modelId = params.get('model');
    if (templateId) setSelectedTemplateId(templateId);
    if (projectId) setSelectedProjectId(projectId);
    if (modelId?.startsWith(FINE_TUNED_MODEL_PREFIX)) {
      setModelMode('fine-tuned');
      setFineTunedModelId(getFineTunedRegistryModelId(modelId));
    } else if (modelId) {
      setModelMode('base');
      setModel(modelId);
    }
  }, []);

  useEffect(() => {
    if (industryOptions.length > 0 && !industryOptions.some(item => item.id === industry)) {
      setIndustry(industryOptions[0].id);
    }
  }, [industry, industryOptions]);

  useEffect(() => {
    if (copyTypeOptions.length > 0 && !copyTypeOptions.some(item => item.id === copyType)) {
      setCopyType(copyTypeOptions[0].id);
    }
  }, [copyType, copyTypeOptions]);

  useEffect(() => {
    if (toneOptions.length > 0 && !toneOptions.some(item => item.id === tone)) {
      setTone(toneOptions[0].id);
    }
  }, [tone, toneOptions]);

  useEffect(() => {
    if (modelMode !== 'base') return;
    if (baseGeneratorModels.length === 0) return;
    if (!baseGeneratorModels.some(item => item.id === model)) {
      setModel(baseGeneratorModels[0].id);
    }
  }, [baseGeneratorModels, model, modelMode]);

  useEffect(() => {
    if (modelMode === 'fine-tuned' && !isFineTunedAllowed) {
      setModelMode('base');
    }
  }, [isFineTunedAllowed, modelMode]);

  useEffect(() => {
    if (modelMode !== 'fine-tuned') return;

    if (!hasFineTunedModels) {
      if (fineTunedModelId) setFineTunedModelId('');
      return;
    }

    const hasSelectedModel = fineTunedGeneratorModels.some(item => item.id === fineTunedModelPickerValue);
    if (!hasSelectedModel) {
      setFineTunedModelId(getFineTunedRegistryModelId(fineTunedGeneratorModels[0].id));
    }
  }, [fineTunedGeneratorModels, fineTunedModelId, fineTunedModelPickerValue, hasFineTunedModels, modelMode]);

  useEffect(() => {
    if (!selectedTemplate) return;
    if (selectedTemplate.type && selectedTemplate.type !== copyType) {
      setCopyType(selectedTemplate.type);
    }
  }, [copyType, selectedTemplate]);

  const buildPrompt = () => [
    `Bạn là chuyên gia copywriting cho ngành ${selectedIndustry?.name || industry}.`,
    `Hãy viết ${selectedType?.name || copyType} với tone ${selectedTone?.name || tone}.`,
    productName ? `Sản phẩm/dịch vụ: ${productName}.` : 'Sản phẩm/dịch vụ: chưa được cung cấp, hãy tự giả định hợp lý theo ngành đã chọn.',
    keywords ? `Từ khóa chính: ${keywords}.` : 'Từ khóa chính: chưa được cung cấp, ưu tiên lợi ích rõ ràng và lời kêu gọi hành động mạnh.',
    targetAudience ? `Đối tượng mục tiêu: ${targetAudience}.` : 'Đối tượng mục tiêu: khách hàng tiềm năng phổ thông.',
    additionalContext ? `Thông tin bổ sung: ${additionalContext}.` : '',
    `Độ dài mong muốn: ${CONTENT_LENGTH_LABELS[contentLength]}.`,
    `Giới hạn output tối đa: ${maxOutputTokens} tokens.`,
    `Tạo đúng ${variations} phiên bản riêng biệt.`,
    'Định dạng bắt buộc:',
    ...Array.from({ length: variations }, (_, index) => `Phiên bản ${index + 1}: ...`),
    'Mỗi phiên bản phải tự đứng độc lập, không gom chung thành một đoạn lớn.',
    'Format riêng theo loại nội dung:',
    getCopyTypeFormatPrompt(copyType, contentLength),
    'Dùng tiếng Việt tự nhiên, đầy đủ dấu, có lời kêu gọi hành động rõ ràng.',
    `Temperature tham khảo: ${temperature[0]}.`,
  ].filter(Boolean).join('\n');

  const estimatedQuotaUnits = Math.max(1, Math.ceil(((buildPrompt().length / 4) + maxOutputTokens) / 1000));

  const handleModelModeChange = (nextMode: ModelMode) => {
    if (nextMode === 'fine-tuned' && !isFineTunedAllowed) {
      toast.error('Gói hiện tại chưa mở quyền dùng model fine-tuned để generate.');
      return;
    }

    setModelMode(nextMode);
    if (nextMode === 'fine-tuned' && !fineTunedModelId && fineTunedGeneratorModels[0]) {
      setFineTunedModelId(getFineTunedRegistryModelId(fineTunedGeneratorModels[0].id));
    }
  };

  const handleFineTunedModelChange = (nextModelId: string) => {
    setFineTunedModelId(getFineTunedRegistryModelId(nextModelId));
  };

  const handleGenerate = async () => {
    if (modelMode === 'base' && !effectiveModel) {
      toast.error('Gói hiện tại chưa có model nào được mở để generate.');
      return;
    }

    if (modelMode === 'fine-tuned' && !effectiveModel) {
      toast.error('Chưa có model fine-tuned khả dụng. Hãy promote hoặc bật active model trước.');
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setPlagiarism(null);
    setStreamText('');
    setSavedContentId(null);

    const startTime = Date.now();

    try {
      const prompt = buildPrompt();
      const qualityKeywords = buildQualityKeywords(productName, keywords, targetAudience, additionalContext);
      const result = await generateContent.mutateAsync({
        prompt,
        type: copyType,
        industry,
        tone,
        language: 'vi',
        model: effectiveModel,
        modelMode,
        fineTunedModelId: modelMode === 'fine-tuned' ? fineTunedModelId : undefined,
        length: contentLength,
        variations,
        maxOutputTokens,
        templateId: selectedTemplateId || null,
        projectId: selectedProjectId || null,
      });

      const splitResults = splitGeneratedVariations(result.content.content, variations)
        .map(formatGeneratedCopyForTinyMce);
      const plagiarismSimilarity = result.plagiarism?.similarityScore ?? result.content.plagiarismScore;
      setResults(splitResults);
      setQualityScores(splitResults.map((text) => scoreGeneratedContent({
        text,
        prompt,
        keywords: qualityKeywords,
        type: copyType,
        tone,
        industry,
        length: contentLength,
        plagiarismSimilarity,
      })));
      setPlagiarism(result.plagiarism);
      setSelectedResult(0);
      setTokensUsed(result.usage?.totalTokens || result.content.tokens || 0);
      setLatency(Math.round((Date.now() - startTime) / 100) / 10);
      setSavedContentId(result.content.id || null);
      if (plagiarismSimilarity >= 35) {
        toast.error(`Nội dung có nguy cơ đạo văn ${Math.round(plagiarismSimilarity)}%, điểm chất lượng đã bị giảm.`);
      } else {
        toast.success(result.fallback ? 'Đã tạo nội dung bằng fallback MVP!' : 'Tạo copy thành công!');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tạo nội dung'));
    } finally {
      setStreamText('');
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    setIsGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(htmlToPlainText(text));
    toast.success('Đã sao chép!');
  };

  const handleSave = async (text: string) => {
    if (savedContentId) {
      setSavedItems(prev => [...prev, htmlToPlainText(text)]);
      toast.success('Nội dung đã được lưu trong DB!');
      navigate(`/contents/${savedContentId}`);
      return;
    }

    const plainText = htmlToPlainText(text).trim();

    if (!plainText) {
      toast.error('Không có nội dung để lưu');
      return;
    }

    try {
      const saved = await createContent.mutateAsync({
        title: buildTitleFromText(copyType, plainText),
        prompt: buildPrompt(),
        outputText: plainText,
        type: copyType,
        tone,
        language: 'vi',
        modelUsed: effectiveModel || model,
        tags: [industry].filter(Boolean),
        templateId: selectedTemplateId || null,
        projectId: selectedProjectId || null,
      });

      setSavedItems(prev => [...prev, plainText]);
      setSavedContentId(saved.id || null);
      toast.success('Nội dung đã được lưu vào DB!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu nội dung';
      toast.error(message);
    }
  };

  const handleDownload = (text: string) => {
    const blob = new Blob([htmlToPlainText(text)], { type: 'text/plain' });
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

  const handleContentLengthChange = (value: ContentLength) => {
    setContentLength(value);
    setMaxOutputTokens(LENGTH_TOKEN_LIMITS[value]);
  };

  const handleResultChange = (i: number, value: string) => {
    const qualityKeywords = buildQualityKeywords(productName, keywords, targetAudience, additionalContext);
    setResults(prev => prev.map((item, index) => (index === i ? value : item)));
    setQualityScores(prev => prev.map((score, index) => (index === i
      ? scoreGeneratedContent({
        text: value,
        prompt: buildPrompt(),
        keywords: qualityKeywords,
        type: copyType,
        tone,
        industry,
        length: contentLength,
        plagiarismSimilarity: plagiarism?.similarityScore,
      })
      : score)));
  };

  const IndustryIcon = resolveGeneratorIcon(selectedIndustry?.icon, ShoppingBag);

  return (
    <Layout>
      <div className="mx-auto max-w-[1500px] p-4 md:p-7 lg:p-9">
        <header className="mb-6 grid gap-4 border-b-2 border-foreground pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="editorial-kicker mb-3 text-primary">Bàn biên tập / Generator</p>
            <h1 className="studio-page-title max-w-3xl text-foreground">Tạo bản nháp. Chọn hướng viết.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Đi theo thứ tự từ brief đến model, sau đó so sánh và biên tập kết quả ở cùng một mặt bàn.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-l-2 border-primary pl-4 text-xs font-bold uppercase tracking-[.06em] text-muted-foreground">
            <span>01 Brief</span><span>→</span><span>02 Model</span><span>→</span><span>03 Bản nháp</span>
          </div>
        </header>

        <div className="generator-workbench grid gap-6 min-[1380px]:grid-cols-[minmax(380px,.82fr)_minmax(520px,1.18fr)]">
          <section className="space-y-5">
            <div className="border-2 border-foreground bg-card shadow-[7px_7px_0_rgba(23,32,51,.1)]">
              <div className="flex items-center justify-between bg-foreground px-5 py-3 text-background">
                <div className="flex items-center gap-3"><EditorialGlyph kind="manuscript" className="h-7 w-7 text-background" /><span className="text-sm font-bold">Brief nội dung</span></div>
                <span className="text-xs font-bold uppercase tracking-[.06em] text-background/65">Step 01</span>
              </div>
              <div className="space-y-5 p-4 md:p-5">
                <IndustryPicker value={industry} onChange={setIndustry} options={industryOptions} />
                <CopyTypePicker value={copyType} onChange={setCopyType} options={copyTypeOptions} />

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="border border-border bg-background p-3">
                    <div className="mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="text-xs font-bold uppercase tracking-wide text-foreground">Template</p></div>
                    <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} disabled={templatesLoading} className="h-10 w-full border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary">
                      <option value="">{templatesLoading ? 'Đang tải...' : 'Không dùng template'}</option>
                      {templates.map((template) => <option key={template.id} value={template.id}>{template.name} - {TEMPLATE_TYPE_LABELS[template.type] || template.type}</option>)}
                    </select>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{selectedTemplate?.description || 'Dùng brief thủ công nếu không chọn mẫu.'}</p>
                  </div>
                  <div className="border border-border bg-background p-3">
                    <div className="mb-2 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /><p className="text-xs font-bold uppercase tracking-wide text-foreground">Dự án</p></div>
                    <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} disabled={projectsLoading} className="h-10 w-full border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary">
                      <option value="">{projectsLoading ? 'Đang tải...' : 'Không gắn dự án'}</option>
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{selectedProject?.desc || 'Có thể gắn bản lưu vào một dự án.'}</p>
                  </div>
                </div>

                <TonePicker value={tone} onChange={setTone} options={toneOptions} />
                <ProductInfoForm productName={productName} keywords={keywords} targetAudience={targetAudience} additionalContext={additionalContext} onChange={handleProductInfoChange} />
              </div>
            </div>

            <div className="border-2 border-foreground bg-card">
              <div className="flex items-center justify-between border-b border-foreground px-5 py-3">
                <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /><span className="text-sm font-bold">Model & tùy chọn đầu ra</span></div>
                <span className="text-xs font-bold uppercase tracking-[.06em] text-muted-foreground">Step 02</span>
              </div>
              <div className="space-y-4 p-4 md:p-5">
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={modelMode === 'base' ? 'default' : 'outline'} onClick={() => handleModelModeChange('base')}><Cpu className="h-4 w-4" /> Model gốc</Button>
                  <Button type="button" variant={modelMode === 'fine-tuned' ? 'default' : 'outline'} disabled={!isFineTunedAllowed} onClick={() => handleModelModeChange('fine-tuned')}><Brain className="h-4 w-4" /> Fine-tuned</Button>
                </div>
                {modelMode === 'base' ? (
                  baseGeneratorModels.length > 0 ? <ModelPicker value={model} onChange={setModel} models={baseGeneratorModels} estimatedQuotaUnits={estimatedQuotaUnits} /> : (
                    <Card className="border-dashed p-4"><p className="text-sm font-bold">Gói hiện tại chưa có model generate</p><p className="mt-1 text-xs text-muted-foreground">Admin cần mở ít nhất một model trong cấu hình gói.</p></Card>
                  )
                ) : hasFineTunedModels ? <ModelPicker value={fineTunedModelPickerValue} onChange={handleFineTunedModelChange} models={fineTunedGeneratorModels} estimatedQuotaUnits={estimatedQuotaUnits} /> : (
                  <Card className="border-dashed p-4"><p className="text-sm font-bold">Chưa có model fine-tuned khả dụng</p><p className="mt-1 text-xs text-muted-foreground">{fineTunedUnavailableMessage || 'Promote job fine-tuning và bật active để sử dụng.'}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/fine-tune')}>Mở fine-tuning</Button></Card>
                )}
                <AdvancedSettings variations={variations} onVariationsChange={setVariations} temperature={temperature} onTemperatureChange={setTemperature} contentLength={contentLength} onContentLengthChange={handleContentLengthChange} maxOutputTokens={maxOutputTokens} onMaxOutputTokensChange={setMaxOutputTokens} open={showAdvanced} onOpenChange={setShowAdvanced} />
              </div>
            </div>

            <div className="sticky bottom-3 z-20 flex gap-2 border-2 border-foreground bg-accent p-3 shadow-[6px_6px_0_rgba(23,32,51,.16)]">
              <Button className="h-12 flex-1 border-2 border-foreground text-base" onClick={handleGenerate} disabled={isGenerating || !effectiveModel}>
                {isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}{isGenerating ? 'Đang tạo bản nháp...' : `Tạo ${variations} phiên bản`}
              </Button>
              {isGenerating && <Button variant="outline" onClick={handleStop} className="h-12 border-2 border-foreground">Dừng</Button>}
            </div>
          </section>

          <section className="min-w-0">
            <div className="generator-sticky-panel space-y-4 min-[1380px]:sticky min-[1380px]:top-24 min-[1380px]:max-h-[calc(100vh-7rem)] min-[1380px]:overflow-y-auto min-[1380px]:overscroll-contain min-[1380px]:pb-4 min-[1380px]:pr-2">
              <div className="flex flex-wrap items-center gap-2 border-b-2 border-foreground pb-3">
                <div className={`${selectedIndustry?.color} flex h-8 w-8 items-center justify-center border border-foreground`}><IndustryIcon className="h-4 w-4 text-white" /></div>
                <span className="text-sm font-bold text-foreground">{selectedIndustry?.name}</span>
                <Badge variant="outline">{selectedType?.name}</Badge>
                {selectedModel && <Badge className="border-0 bg-primary/10 text-primary">{selectedModel.name}</Badge>}
                {selectedTemplate && <Badge className="border-0 bg-accent/55 text-foreground">{selectedTemplate.name}</Badge>}
                {selectedProject && <Badge className="border-0 bg-info/10 text-info">{selectedProject.name}</Badge>}
                {results.length > 0 && <span className="ml-auto text-xs font-semibold text-muted-foreground">{tokensUsed} tokens · {latency}s</span>}
              </div>

              <details className="group border border-border bg-card">
                <summary className="cursor-pointer list-none px-4 py-3 text-xs font-bold text-foreground marker:hidden">Chi tiết prompt gửi đến API <span className="float-right text-primary group-open:rotate-45">+</span></summary>
                <div className="space-y-3 border-t border-border bg-background p-4">
                  {selectedTemplate && <div><p className="mb-2 text-xs font-bold uppercase tracking-[.05em] text-muted-foreground">System prompt</p><pre className="max-h-40 overflow-auto whitespace-pre-wrap border-l-2 border-accent pl-3 text-xs leading-6 text-foreground/75">{selectedTemplate.systemPrompt}</pre></div>}
                  <div><p className="mb-2 text-xs font-bold uppercase tracking-[.05em] text-muted-foreground">User prompt</p><pre className="max-h-52 overflow-auto whitespace-pre-wrap border-l-2 border-primary pl-3 text-xs leading-6 text-foreground/75">{buildPrompt()}</pre></div>
                </div>
              </details>

              <GeneratorResults isGenerating={isGenerating} isSaving={createContent.isPending} streamText={streamText} results={results} selectedResult={selectedResult} qualityScores={qualityScores} plagiarism={plagiarism} variations={variations} onSelectResult={setSelectedResult} onResultChange={handleResultChange} onCopy={handleCopy} onSave={handleSave} onDownload={handleDownload} onRegenerate={handleGenerate} />

              {savedContentId && !isGenerating && (
                <Card className="flex flex-col gap-3 border-l-4 border-l-success p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-foreground">Bản đã chọn được lưu vào thư viện</p><p className="text-xs text-muted-foreground">Bạn có thể mở lại để tiếp tục chỉnh sửa.</p></div><Button variant="outline" size="sm" onClick={() => navigate(`/contents/${savedContentId}`)}>Xem chi tiết</Button></Card>
              )}

              {savedItems.length > 0 && (
                <Card className="p-4"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><History className="h-4 w-4 text-primary" /> Đã lưu trong phiên này ({savedItems.length})</h3><div className="max-h-40 space-y-2 overflow-y-auto">{savedItems.map((item, i) => <div key={i} className="flex items-start gap-2 border-l-2 border-accent bg-background p-2 text-xs text-foreground/80"><span className="line-clamp-2 flex-1">{item}</span><button onClick={() => handleCopy(item)} className="flex-shrink-0 text-primary"><Copy className="h-3.5 w-3.5" /></button></div>)}</div></Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
