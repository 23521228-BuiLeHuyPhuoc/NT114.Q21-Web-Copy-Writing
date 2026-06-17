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
import { MODELS, COPY_TYPES as FALLBACK_COPY_TYPES, TONES as FALLBACK_TONES, INDUSTRIES as FALLBACK_INDUSTRIES } from '@/mocks/generator';
import { IndustryPicker, type IndustryPickerOption } from '@/app/components/generator/IndustryPicker';
import { CopyTypePicker, type CopyTypePickerOption } from '@/app/components/generator/CopyTypePicker';
import { TonePicker, type TonePickerOption } from '@/app/components/generator/TonePicker';
import { ModelPicker, type GeneratorModelOption } from '@/app/components/generator/ModelPicker';
import { ProductInfoForm } from '@/app/components/generator/ProductInfoForm';
import { AdvancedSettings, type ContentLength } from '@/app/components/generator/AdvancedSettings';
import { GeneratorResults } from '@/app/components/generator/GeneratorResults';
import { useCreateContent, useGenerateContent } from '@/hooks/queries/useContents';
import { useProjects } from '@/hooks/queries/useProjects';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { useGenerateOptions } from '@/hooks/queries/useGenerateOptions';
import { useFineTuningModels } from '@/hooks/queries/useFineTuning';
import { useMyBilling } from '@/hooks/queries/useBilling';
import { scoreGeneratedContent } from '@/lib/contentQuality';
import { resolveGeneratorIcon, resolveToneIcon } from '@/lib/generatorOptionIcons';
import { formatGeneratedCopyForTinyMce, htmlToPlainText } from '@/lib/richText';

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
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
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
      setResults(splitResults);
      setQualityScores(splitResults.map((text) => scoreGeneratedContent({
        text,
        prompt,
        keywords: qualityKeywords,
        type: copyType,
        tone,
        industry,
        length: contentLength,
      })));
      setSelectedResult(0);
      setTokensUsed(result.usage?.totalTokens || result.content.tokens || 0);
      setLatency(Math.round((Date.now() - startTime) / 100) / 10);
      setSavedContentId(result.content.id || null);
      toast.success(result.fallback ? 'Đã tạo nội dung bằng fallback MVP!' : 'Tạo copy thành công!');
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
      })
      : score)));
  };

  const IndustryIcon = resolveGeneratorIcon(selectedIndustry?.icon, ShoppingBag);

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-1">AI Copywriting Engine</h1>
          <p className="text-foreground/70">Tạo nhiều phiên bản copy và chỉ lưu phiên bản bạn chọn vào thư viện nội dung.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <IndustryPicker value={industry} onChange={setIndustry} options={industryOptions} />
            <CopyTypePicker value={copyType} onChange={setCopyType} options={copyTypeOptions} />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground/80">Template prompt</p>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                disabled={templatesLoading}
                className="w-full h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">{templatesLoading ? 'Đang tải templates...' : 'Không dùng template'}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {TEMPLATE_TYPE_LABELS[template.type] || template.type}
                  </option>
                ))}
              </select>
              {selectedTemplate ? (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{TEMPLATE_CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}</Badge>
                    <Badge variant="outline">{TEMPLATE_TYPE_LABELS[selectedTemplate.type] || selectedTemplate.type}</Badge>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {selectedTemplate.isSystem ? 'System' : 'Cá nhân'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{selectedTemplate.description}</p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Backend sẽ generate bằng prompt thủ công nếu không chọn template.</p>
              )}
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground/80">Dự án</p>
              </div>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                disabled={projectsLoading}
                className="w-full h-10 rounded border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">{projectsLoading ? 'Dang tai du an...' : 'Khong gan du an'}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {selectedProject ? (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{selectedProject.desc || 'No description'}</p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Nội dung sinh ra sẽ được gắn vào dự án đã chọn.</p>
              )}
            </Card>
            <TonePicker value={tone} onChange={setTone} options={toneOptions} />
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={modelMode === 'base' ? 'default' : 'outline'} onClick={() => handleModelModeChange('base')}>
                  <Cpu className="w-4 h-4 mr-2" /> Model gốc
                </Button>
                <Button type="button" variant={modelMode === 'fine-tuned' ? 'default' : 'outline'} disabled={!isFineTunedAllowed} onClick={() => handleModelModeChange('fine-tuned')}>
                  <Brain className="w-4 h-4 mr-2" /> Fine-tuned
                </Button>
              </div>
            </Card>
            {modelMode === 'base' ? (
              baseGeneratorModels.length > 0 ? (
                <ModelPicker value={model} onChange={setModel} models={baseGeneratorModels} />
              ) : (
                <Card className="p-4 border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground/80">Gói hiện tại chưa có model generate</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Admin cần mở ít nhất một model trong cấu hình gói dịch vụ.</p>
                </Card>
              )
            ) : hasFineTunedModels ? (
              <ModelPicker value={fineTunedModelPickerValue} onChange={handleFineTunedModelChange} models={fineTunedGeneratorModels} />
            ) : (
              <Card className="p-4 border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground/80">Chưa có model fine-tuned khả dụng</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Promote job fine-tuning và bật active để dùng model tại generator.</p>
                {fineTunedUnavailableMessage && (
                  <p className="text-xs text-amber-700 mb-3">{fineTunedUnavailableMessage}</p>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate('/fine-tune')}>Mở fine-tuning</Button>
              </Card>
            )}
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
              contentLength={contentLength}
              onContentLengthChange={handleContentLengthChange}
              maxOutputTokens={maxOutputTokens}
              onMaxOutputTokensChange={setMaxOutputTokens}
              open={showAdvanced}
              onOpenChange={setShowAdvanced}
            />

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12"
                onClick={handleGenerate}
                disabled={isGenerating || !effectiveModel}
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
                {selectedModel && <Badge className="bg-primary/10 text-primary border-0">{selectedModel.name}</Badge>}
                {selectedTemplate && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-0">{selectedTemplate.name}</Badge>
                )}
                {selectedProject && (
                  <Badge className="bg-teal-50 text-teal-700 border-0">{selectedProject.name}</Badge>
                )}
                {results.length > 0 && (
                  <>
                    <Badge className="bg-primary/10 text-primary border-0">{tokensUsed} tokens</Badge>
                    <Badge className="bg-muted text-foreground/70 border-0">{latency}s</Badge>
                  </>
                )}
              </div>

              {selectedTemplate && (
                <Card className="p-4 bg-surface-muted">
                  <p className="text-xs font-semibold text-foreground/70 mb-2">Template system prompt sẽ được backend ghép vào:</p>
                  <p className="text-xs text-foreground/80 font-mono bg-card rounded border p-3 whitespace-pre-wrap">
                    {selectedTemplate.systemPrompt}
                  </p>
                </Card>
              )}

              <Card className="p-4 bg-surface-muted">
                <p className="text-xs font-semibold text-foreground/70 mb-2">Prompt user gửi đến API {selectedModel?.name || 'model đã chọn'}:</p>
                <p className="text-xs text-foreground/80 font-mono bg-card rounded border p-3 whitespace-pre-wrap">
                  {buildPrompt()}
                </p>
              </Card>

              <GeneratorResults
                isGenerating={isGenerating}
                isSaving={createContent.isPending}
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

              {savedContentId && !isGenerating && (
                <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Nội dung đã được lưu</p>
                    <p className="text-xs text-muted-foreground">Bạn có thể xem lại trong thư viện nội dung.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/contents/${savedContentId}`)}>
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
