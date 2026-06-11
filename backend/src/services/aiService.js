const { GoogleAuth } = require('google-auth-library');
const createError = require('../utils/createError');

const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const DEFAULT_VERTEX_LOCATION = 'us-central1';
let googleAuth;

const TYPE_LABELS = {
  headline: 'tiêu đề quảng cáo',
  description: 'mô tả sản phẩm',
  social: 'bài đăng mạng xã hội',
  email: 'email marketing',
  cta: 'lời kêu gọi hành động',
  landing: 'landing page',
  seo: 'nội dung SEO',
  review: 'review/testimonial',
};

const TONE_LABELS = {
  urgent: 'khẩn cấp',
  professional: 'chuyên nghiệp',
  friendly: 'thân thiện',
  luxury: 'sang trọng',
  humorous: 'hài hước',
  emotional: 'cảm xúc',
};

const INDUSTRY_LABELS = {
  ecommerce: 'thương mại điện tử',
  realestate: 'bất động sản',
  technology: 'công nghệ',
  fnb: 'ẩm thực F&B',
  healthcare: 'y tế và sức khỏe',
  education: 'giáo dục',
  finance: 'tài chính',
  fashion: 'thời trang',
  business: 'doanh nghiệp',
  travel: 'du lịch',
};

const LENGTH_INSTRUCTIONS = {
  headline: {
    short: 'Mỗi phiên bản là 1 headline ngắn, khoảng 8-12 từ.',
    medium: 'Mỗi phiên bản gồm 1 headline và 1 câu phụ, khoảng 20-35 từ.',
    long: 'Mỗi phiên bản gồm headline, subheadline, 2 lợi ích chính và lời kêu gọi hành động, khoảng 60-90 từ.',
  },
  description: {
    short: 'Mỗi phiên bản khoảng 50-80 từ, tập trung vào lợi ích chính.',
    medium: 'Mỗi phiên bản khoảng 120-180 từ, có lợi ích, đặc điểm và lời kêu gọi hành động.',
    long: 'Mỗi phiên bản khoảng 250-350 từ, có mở bài, lợi ích, bằng chứng thuyết phục và lời kêu gọi hành động.',
  },
  social: {
    short: 'Mỗi phiên bản khoảng 40-70 từ, dễ đọc trên mạng xã hội.',
    medium: 'Mỗi phiên bản khoảng 100-150 từ, có hook, lợi ích, lời kêu gọi hành động và hashtag nếu phù hợp.',
    long: 'Mỗi phiên bản khoảng 180-260 từ, có hook, storytelling ngắn, lợi ích, lời kêu gọi hành động và hashtag.',
  },
  email: {
    short: 'Mỗi phiên bản khoảng 80-120 từ, gồm subject và nội dung email ngắn.',
    medium: 'Mỗi phiên bản khoảng 180-260 từ, gồm subject, mở bài, thân bài và lời kêu gọi hành động.',
    long: 'Mỗi phiên bản khoảng 320-450 từ, gồm subject, preview text, nội dung thuyết phục và lời kêu gọi hành động rõ.',
  },
  cta: {
    short: 'Mỗi phiên bản là 1 lời kêu gọi hành động rất ngắn, khoảng 3-8 từ.',
    medium: 'Mỗi phiên bản gồm lời kêu gọi hành động chính và 1 câu hỗ trợ, khoảng 15-25 từ.',
    long: 'Mỗi phiên bản gồm lời kêu gọi hành động chính, microcopy hỗ trợ và lý do hành động, khoảng 35-60 từ.',
  },
  landing: {
    short: 'Mỗi phiên bản khoảng 120-180 từ, gồm headline, subheadline, lợi ích và lời kêu gọi hành động.',
    medium: 'Mỗi phiên bản khoảng 300-450 từ, gồm hero, lợi ích, bằng chứng và lời kêu gọi hành động.',
    long: 'Mỗi phiên bản khoảng 600-850 từ, gồm hero, pain point, benefits, proof, offer và lời kêu gọi hành động.',
  },
  seo: {
    short: 'Mỗi phiên bản gồm SEO title và meta description ngắn.',
    medium: 'Mỗi phiên bản gồm SEO title, meta description và 3 gợi ý heading.',
    long: 'Mỗi phiên bản gồm SEO title, meta description, outline H2/H3 và đoạn mở bài khoảng 120 từ.',
  },
  review: {
    short: 'Mỗi phiên bản khoảng 40-70 từ, tự nhiên như phản hồi thật.',
    medium: 'Mỗi phiên bản khoảng 100-150 từ, có bối cảnh, trải nghiệm và kết luận.',
    long: 'Mỗi phiên bản khoảng 200-280 từ, có vấn đề ban đầu, trải nghiệm, kết quả và khuyến nghị.',
  },
  default: {
    short: 'Mỗi phiên bản khoảng 40-80 từ.',
    medium: 'Mỗi phiên bản khoảng 120-180 từ.',
    long: 'Mỗi phiên bản khoảng 250-400 từ, có cấu trúc rõ và đủ luận điểm.',
  },
};

function getTypeFormatInstruction(payload) {
  const length = getLengthLevel(payload.length);

  switch (payload.type) {
    case 'headline':
      return [
        'Format bắt buộc cho từng phiên bản headline:',
        'Headline: một câu chính sắc, dễ đọc, có lợi ích hoặc điểm khác biệt.',
        length !== 'short' ? 'Subheadline: một câu phụ làm rõ lời hứa của headline.' : '',
        length === 'long' ? 'Lợi ích chính:\n- Lợi ích 1\n- Lợi ích 2' : '',
        length !== 'short' ? 'Lời kêu gọi hành động: một câu ngắn thúc đẩy người đọc hành động.' : '',
        'Không viết thành email, bài social, mô tả sản phẩm hoặc landing page đầy đủ.',
      ].filter(Boolean).join('\n');
    case 'description':
      return [
        'Format bắt buộc cho từng phiên bản mô tả sản phẩm:',
        'Mô tả ngắn: đoạn mở đầu giới thiệu sản phẩm/dịch vụ.',
        'Lợi ích chính:\n- Lợi ích 1\n- Lợi ích 2',
        'Đặc điểm nổi bật:\n- Đặc điểm 1\n- Đặc điểm 2',
        'Lời kêu gọi hành động: lời kêu gọi mua, đăng ký hoặc liên hệ.',
        'Không dùng format email, SEO metadata hoặc caption mạng xã hội.',
      ].join('\n');
    case 'social':
      return [
        'Format bắt buộc cho từng phiên bản social post:',
        'Hook: câu mở đầu kéo chú ý.',
        'Caption: nội dung chính dễ đọc trên mạng xã hội, có thể xuống dòng.',
        'Lời kêu gọi hành động: hành động mong muốn.',
        'Hashtags: 3-6 hashtag liên quan.',
        'Không thêm Subject, Preview text, SEO title hoặc Meta description.',
      ].join('\n');
    case 'email':
      return [
        'Format bắt buộc cho từng phiên bản email:',
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
        'Format bắt buộc cho từng phiên bản lời kêu gọi hành động:',
        'Lời kêu gọi hành động chính: câu/nút kêu gọi hành động.',
        length !== 'short' ? 'Microcopy: một câu hỗ trợ ngay dưới lời kêu gọi hành động.' : '',
        length === 'long' ? 'Ngữ cảnh dùng: vị trí nên đặt lời kêu gọi hành động hoặc tình huống sử dụng.' : '',
        'Chỉ viết lời kêu gọi hành động, không thêm bài quảng cáo dài.',
      ].filter(Boolean).join('\n');
    case 'landing':
      return [
        'Format bắt buộc cho từng phiên bản landing page:',
        'Hero headline: tiêu đề chính của hero section.',
        'Subheadline: câu phụ làm rõ giá trị.',
        length === 'long' ? 'Pain point: vấn đề khách hàng đang gặp.' : '',
        'Lợi ích chính:\n- Lợi ích 1\n- Lợi ích 2\n- Lợi ích 3',
        'Bằng chứng: review, số liệu, cam kết hoặc social proof.',
        length !== 'short' ? 'Offer: ưu đãi hoặc lý do hành động ngay.' : '',
        'Lời kêu gọi hành động: nút hoặc lời kêu gọi hành động chính.',
        'Không viết thành email, SEO metadata hoặc một caption social ngắn.',
      ].filter(Boolean).join('\n');
    case 'seo':
      return [
        'Format bắt buộc cho từng phiên bản SEO:',
        'SEO title: tối đa khoảng 60 ký tự, có từ khóa chính.',
        'Meta description: tối đa khoảng 155 ký tự, có lợi ích và lời kêu gọi hành động nhẹ.',
        'Slug: URL slug ngắn, không dấu, dùng dấu gạch ngang.',
        'Heading gợi ý:\n- H2: ...\n- H2: ...\n- H3: ...',
        length === 'long' ? 'Mở bài: đoạn mở đầu khoảng 100-140 từ, tự nhiên và có từ khóa.' : '',
        'Không thêm lời chào email, hashtag social hoặc testimonial.',
      ].filter(Boolean).join('\n');
    case 'review':
      return [
        'Format bắt buộc cho từng phiên bản review/testimonial:',
        'Quote: lời nhận xét tự nhiên ở ngôi thứ nhất.',
        'Người đánh giá: chân dung khách hàng phù hợp, có thể dùng placeholder.',
        'Bối cảnh: tình huống trước khi dùng sản phẩm/dịch vụ.',
        'Kết quả: thay đổi hoặc lợi ích sau khi sử dụng.',
        'Lời kêu gọi hành động mềm: lời khuyến nghị tự nhiên, không bán hàng quá đà.',
        'Không viết thành mô tả sản phẩm, email hoặc SEO metadata.',
      ].join('\n');
    default:
      return 'Format bắt buộc: chia thành các đoạn ngắn, có nhãn rõ, có lời kêu gọi hành động phù hợp và không trộn format của loại nội dung khác.';
  }
}

const GEMINI_MODEL_MAP = {
  'gemini-flash': 'gemini-2.5-flash',
  'gemini-flash-lite': 'gemini-2.5-flash-lite',
  'gemini-2-5-pro': 'gemini-2.5-pro',
  'gemini-2-0-flash': 'gemini-2.0-flash',
  'gemini-2-0-flash-lite': 'gemini-2.0-flash-lite',
  'gemini-pro-latest': 'gemini-pro-latest',
  'gemini-flash-latest': 'gemini-flash-latest',
  'gemini-flash-lite-latest': 'gemini-flash-lite-latest',
  'gemini-3-pro-preview': 'gemini-3-pro-preview',
  'gemini-3-1-pro-preview': 'gemini-3.1-pro-preview',
  'gemini-3-flash-preview': 'gemini-3-flash-preview',
  'gemini-3-1-flash-lite': 'gemini-3.1-flash-lite',
  'gemini-3-5-flash': 'gemini-3.5-flash',
  'gemma-4-26b': 'gemma-4-26b-a4b-it',
  'gemma-4-31b': 'gemma-4-31b-it',
  gpt4o: 'gemini-2.5-flash',
  gpt35: 'gemini-2.5-flash-lite',
  llama3: 'gemini-2.5-flash',
  'llama3-8b': 'gemini-2.5-flash-lite',
  'finetuned-ec': 'gemini-2.5-flash',
};

const OPENROUTER_MODEL_MAP = {
  'openrouter-free': 'openrouter/free',
  'openrouter-deepseek-free': 'deepseek/deepseek-v4-flash:free',
  'openrouter-qwen-free': 'qwen/qwen3-next-80b-a3b-instruct:free',
  'openrouter-gemma-free': 'google/gemma-4-31b-it:free',
  'openrouter-nemotron-free': 'nvidia/nemotron-3-super-120b-a12b:free',
};

const GROQ_MODEL_MAP = {
  'groq-llama-3-3-70b': 'llama-3.3-70b-versatile',
  'groq-llama-3-1-8b': 'llama-3.1-8b-instant',
  llama3: 'llama-3.3-70b-versatile',
  'llama3-8b': 'llama-3.1-8b-instant',
};

const FREEGPT4_MODEL_MAP = {
  'freegpt4-gpt-4': 'gpt-4',
  'freegpt4-gpt-4o': 'gpt-4o',
  'freegpt4-gpt-4o-mini': 'gpt-4o-mini',
};

const FORMAT_BOUNDARY_LABELS = [
  'Headline',
  'Subheadline',
  'Mô tả ngắn',
  'Lợi ích chính',
  'Đặc điểm nổi bật',
  'Hook',
  'Caption',
  'Hashtags',
  'Chủ đề',
  'Subject',
  'Preview text',
  'Lời chào',
  'Nội dung chính',
  'Lời kêu gọi hành động',
  'Lời kêu gọi hành động chính',
  'Microcopy',
  'Ngữ cảnh dùng',
  'P.S.',
  'Hero headline',
  'Pain point',
  'Bằng chứng',
  'Offer',
  'SEO title',
  'Meta description',
  'Slug',
  'Heading gợi ý',
  'Outline',
  'Mở bài',
  'Quote',
  'Người đánh giá',
  'Bối cảnh',
  'Kết quả',
  'Lời kêu gọi hành động mềm',
  'Lưu ý',
  'Ưu đãi',
  'Mã giảm giá',
  'Hạn chót',
];

const LIST_CONTEXT_PATTERN = /\b(?:bao gồm|gồm|ưu đãi|danh sách|sản phẩm|các mục|như sau)\s*:/i;
const INLINE_BULLET_PATTERN = /\s[-*]\s+(?=[A-ZÀ-ỴĐ0-9])/g;

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function labelFromMap(map, value, fallback) {
  return map[value] || value || fallback;
}

function getLengthLevel(length) {
  return ['short', 'medium', 'long'].includes(length) ? length : 'medium';
}

function getLengthInstruction(payload) {
  const length = getLengthLevel(payload.length);
  const rules = LENGTH_INSTRUCTIONS[payload.type] || LENGTH_INSTRUCTIONS.default;
  return rules[length] || LENGTH_INSTRUCTIONS.default.medium;
}

function getMaxOutputTokens(payload) {
  const requestedLimit = Number(payload.maxOutputTokens);
  if (Number.isFinite(requestedLimit)) {
    return Math.min(6000, Math.max(500, Math.round(requestedLimit)));
  }

  const length = getLengthLevel(payload.length);
  const tokenMap = {
    short: 900,
    medium: 1800,
    long: 3200,
  };

  return tokenMap[length];
}

function getVariationCount(payload) {
  const requested = Number(payload.variations);
  const fromPrompt = Number(String(payload.prompt || '').match(/Tạo đúng\s*(\d+)\s*phiên bản/i)?.[1]);
  const count = Number.isFinite(requested) ? requested : fromPrompt;

  if (!Number.isFinite(count)) return 1;
  return Math.min(5, Math.max(1, Math.round(count)));
}

function getVariationInstruction(payload) {
  const count = getVariationCount(payload);
  if (count <= 1) {
    return 'Tạo đúng 1 phiên bản hoàn chỉnh.';
  }

  const labels = Array.from({ length: count }, (_, index) => `"Phiên bản ${index + 1}:"`).join(', ');
  return `Tạo đúng ${count} phiên bản riêng biệt, tách rõ bằng nhãn ${labels}. Mỗi phiên bản phải tự đứng độc lập và dùng đúng format của loại nội dung đã chọn.`;
}

function splitLongParagraph(block) {
  if (!block || block.includes('\n') || block.length <= 280) return [block];
  if (/^(?:[-*]\s+|\d+[.)]\s+)/.test(block)) return [block];
  if (isFormatLabelBlock(block)) return [block];

  const sentences = block.match(/[^.!?。]+[.!?。]+(?:["'”’)]*)|.+$/g) || [block];
  const paragraphs = [];
  let current = '';

  sentences.forEach((sentence) => {
    const next = sentence.trim();
    if (!next) return;

    if (current && `${current} ${next}`.length > 260) {
      paragraphs.push(current);
      current = next;
      return;
    }

    current = current ? `${current} ${next}` : next;
  });

  if (current) paragraphs.push(current);
  return paragraphs.length ? paragraphs : [block];
}

function formatLabelRegex() {
  const labelPattern = FORMAT_BOUNDARY_LABELS
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return new RegExp(`^\\s*(?:${labelPattern})\\s*:`, 'i');
}

function isFormatLabelBlock(block) {
  return formatLabelRegex().test(block);
}

function shouldSplitInlineBullets(block) {
  if (isFormatLabelBlock(block)) return false;

  const matches = block.match(INLINE_BULLET_PATTERN) || [];
  return matches.length >= 2 || (matches.length === 1 && LIST_CONTEXT_PATTERN.test(block));
}

function splitInlineBullets(block) {
  if (!shouldSplitInlineBullets(block)) return [block];

  return block
    .replace(/\s+([-*]\s+(?=[A-ZÀ-ỴĐ0-9]))/g, '\n$1')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanupMarkdownAsterisks(text) {
  return String(text || '')
    .replace(/^\s*\*\s+/gm, '- ')
    .replace(/\*\*\*([^*\n]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/(^|[\s([{])\*([^*\n]+)\*(?=[\s)\]},.!?:;]|$)/g, '$1$2')
    .replace(/\*{2,}/g, '')
    .replace(/[ \t]+\*/g, ' ')
    .replace(/\*[ \t]+/g, ' ');
}

function expandActionAcronym(text) {
  return String(text || '')
    .replace(/(^|\n)(\s*)[Cc][Tt][Aa]\s+chính\s*:/g, '$1$2Lời kêu gọi hành động chính:')
    .replace(/(^|\n)(\s*)[Cc][Tt][Aa]\s+mềm\s*:/g, '$1$2Lời kêu gọi hành động mềm:')
    .replace(/(^|\n)(\s*)[Cc][Tt][Aa]\s*:/g, '$1$2Lời kêu gọi hành động:')
    .replace(/\b[Cc][Tt][Aa]\s+chính\b/g, 'lời kêu gọi hành động chính')
    .replace(/\b[Cc][Tt][Aa]\s+mềm\b/g, 'lời kêu gọi hành động mềm')
    .replace(/\b[Cc][Tt][Aa]\b/g, 'lời kêu gọi hành động');
}

function normalizeCopyFormatting(outputText) {
  const labelPattern = FORMAT_BOUNDARY_LABELS
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return expandActionAcronym(cleanupMarkdownAsterisks(outputText))
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*(Phiên bản\s*\d+\s*:)/gi, '\n\n$1\n')
    .replace(new RegExp(`\\s+((?:${labelPattern})\\s*:)`, 'gi'), '\n\n$1')
    .replace(/\s+(Kính gửi\b)/gi, '\n\n$1')
    .split(/\n{2,}/)
    .flatMap((block) => splitInlineBullets(block.trim()))
    .flatMap((block) => splitLongParagraph(block.trim()))
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildProviderPrompt(payload) {
  const language = payload.language === 'en' ? 'English' : 'Tiếng Việt có dấu';
  const type = labelFromMap(TYPE_LABELS, payload.type, 'nội dung marketing');
  const tone = labelFromMap(TONE_LABELS, payload.tone, 'rõ ràng');
  const industry = labelFromMap(INDUSTRY_LABELS, payload.industry, '');

  return [
    `Ngôn ngữ bắt buộc: ${language}.`,
    `Loại nội dung: ${type}.`,
    industry ? `Ngành nghề: ${industry}.` : '',
    `Giọng văn: ${tone}.`,
    `Độ dài bắt buộc: ${getLengthInstruction(payload)}`,
    `Giới hạn output tối đa: ${getMaxOutputTokens(payload)} tokens.`,
    'Định dạng cho TinyMCE: tách mỗi đoạn bằng một dòng trống, dùng "- " cho danh sách, không dùng dấu * hoặc ** để nhấn mạnh vì editor đã xử lý định dạng.',
    'Không gộp toàn bộ nội dung thành một đoạn dài; tách theo đúng các nhãn của format riêng bên dưới.',
    'Không dùng dấu gạch ngang "-" trong dòng Chủ đề/Subject để tách vế; nếu cần hãy dùng dấu hai chấm hoặc dấu chấm phẩy để tránh bị hiểu nhầm là bullet list.',
    getVariationInstruction(payload),
    'Format riêng theo loại nội dung:',
    getTypeFormatInstruction(payload),
    'Không trộn format của loại nội dung khác vào kết quả.',
    'Chỉ trả về nội dung copy cuối cùng, không giải thích quy trình, không lặp lại role/task, không phân tích bằng tiếng Anh.',
    'Không tự đổi sản phẩm/dịch vụ trong yêu cầu gốc sang sản phẩm khác.',
    'Không bọc kết quả trong markdown code block.',
    '',
    'Yêu cầu gốc:',
    payload.prompt,
  ].filter(Boolean).join('\n');
}

function cleanProviderOutput(outputText) {
  let text = String(outputText || '').trim();
  const versionMatches = [...text.matchAll(/Phiên bản\s*1\s*:/gi)];

  if (versionMatches.length > 1) {
    text = text.slice(versionMatches[versionMatches.length - 1].index).trim();
  } else if (versionMatches.length === 1 && versionMatches[0].index > 0) {
    text = text.slice(versionMatches[0].index).trim();
  }

  return normalizeCopyFormatting(text.replace(/\n{3,}/g, '\n\n').trim());
}

function extractPromptValue(prompt, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(prompt || '').match(new RegExp(`${escapedLabel}:\\s*([^\\n]+)`, 'i'));
  const value = match?.[1]?.replace(/\.$/, '').trim();

  if (!value || /chưa được cung cấp/i.test(value)) return '';
  return value;
}

function buildFallbackVersion(payload, index) {
  const tone = labelFromMap(TONE_LABELS, payload.tone, 'rõ ràng');
  const industry = labelFromMap(INDUSTRY_LABELS, payload.industry, '');
  const length = getLengthLevel(payload.length);
  const product = extractPromptValue(payload.prompt, 'Sản phẩm/dịch vụ') || 'giải pháp của bạn';
  const audience = extractPromptValue(payload.prompt, 'Đối tượng mục tiêu') || 'khách hàng mục tiêu';
  const keyword = extractPromptValue(payload.prompt, 'Từ khóa chính') || product;
  const angle = [
    'lợi ích rõ ràng',
    'niềm tin và bằng chứng',
    'ưu đãi hành động nhanh',
    'trải nghiệm khác biệt',
    'giá trị dài hạn',
  ][index % 5];

  switch (payload.type) {
    case 'headline':
      return [
        `Headline: ${product} giúp ${audience} nhận ngay ${angle}.`,
        length !== 'short' ? `Subheadline: Thông điệp ${tone} làm rõ lý do nên chọn ${product} trong ngành ${industry || 'phù hợp'}.` : '',
        length === 'long' ? `Lợi ích chính:\n- Dễ hiểu, dễ nhớ và tập trung vào nhu cầu thật.\n- Có điểm nhấn khác biệt để tăng tỷ lệ nhấp.` : '',
        length !== 'short' ? 'Lời kêu gọi hành động: Khám phá ngay hôm nay.' : '',
      ].filter(Boolean).join('\n\n');
    case 'description':
      return [
        `Mô tả ngắn: ${product} được thiết kế để giúp ${audience} giải quyết nhu cầu quan trọng với phong cách ${tone}, tập trung vào ${angle}.`,
        'Lợi ích chính:\n- Trình bày giá trị cốt lõi rõ ràng, dễ hiểu.\n- Tạo niềm tin bằng cam kết và trải nghiệm thực tế.',
        'Đặc điểm nổi bật:\n- Phù hợp với nhiều tình huống sử dụng.\n- Dễ bắt đầu, dễ ra quyết định.',
        'Lời kêu gọi hành động: Liên hệ ngay để nhận tư vấn và ưu đãi phù hợp.',
      ].join('\n\n');
    case 'social':
      return [
        `Hook: Bạn đang tìm ${product} thật sự đáng thử?`,
        `Caption: Đây là lựa chọn dành cho ${audience} muốn có ${angle} mà không mất quá nhiều thời gian so sánh. Thông điệp ${tone}, dễ đọc, dễ chia sẻ và tập trung vào điều khách hàng quan tâm nhất.`,
        'Lời kêu gọi hành động: Nhắn tin ngay để được gợi ý lựa chọn phù hợp.',
        `Hashtags: #${keyword.replace(/\s+/g, '')} #UuDai #GiaiPhapTot #TraiNghiemMoi`,
      ].join('\n\n');
    case 'email':
      return [
        `Subject: ${product}: ưu đãi mới dành cho bạn`,
        `Preview text: Khám phá ${angle} với thông điệp ${tone}, dễ hành động ngay hôm nay.`,
        'Lời chào: Chào bạn,',
        `Nội dung chính: Nếu bạn đang cân nhắc một lựa chọn phù hợp hơn cho nhu cầu hiện tại, ${product} có thể là điểm bắt đầu đáng thử.`,
        `Nội dung chính: Giải pháp này tập trung vào ${angle}, giúp ${audience} hiểu nhanh giá trị và ra quyết định tự tin hơn.`,
        'Lời kêu gọi hành động: Xem ưu đãi và nhận tư vấn ngay.',
        length === 'long' ? 'P.S.: Ưu đãi có thể thay đổi theo từng thời điểm, nên hãy kiểm tra sớm để không bỏ lỡ.' : '',
      ].filter(Boolean).join('\n\n');
    case 'cta':
      return [
        `Lời kêu gọi hành động chính: Khám phá ${product} ngay`,
        length !== 'short' ? `Microcopy: Nhận tư vấn nhanh để chọn giải pháp phù hợp với ${audience}.` : '',
        length === 'long' ? 'Ngữ cảnh dùng: Phù hợp đặt dưới hero section, cuối mô tả sản phẩm hoặc sau bảng giá.' : '',
      ].filter(Boolean).join('\n\n');
    case 'landing':
      return [
        `Hero headline: ${product} cho ${audience} muốn ${angle}`,
        `Subheadline: Một lời hứa ${tone}, dễ hiểu và tập trung vào kết quả khách hàng mong đợi.`,
        length === 'long' ? `Pain point: ${audience} thường mất thời gian so sánh, thiếu niềm tin và chưa thấy rõ giá trị trước khi hành động.` : '',
        'Lợi ích chính:\n- Nắm nhanh giá trị cốt lõi ngay từ phần đầu.\n- Có lý do tin tưởng trước khi ra quyết định.\n- Lời kêu gọi hành động rõ để chuyển từ quan tâm sang hành động.',
        'Bằng chứng: Được xây dựng dựa trên nhu cầu thực tế, cam kết minh bạch và trải nghiệm khách hàng.',
        length !== 'short' ? 'Offer: Nhận tư vấn nhanh hoặc ưu đãi dùng thử trong thời gian giới hạn.' : '',
        'Lời kêu gọi hành động: Bắt đầu ngay hôm nay.',
      ].filter(Boolean).join('\n\n');
    case 'seo':
      return [
        `SEO title: ${keyword} uy tín, dễ chọn cho ${audience}`,
        `Meta description: Tìm hiểu ${product} với lợi ích rõ ràng, thông tin dễ hiểu và lời kêu gọi hành động nhẹ để bạn chọn giải pháp phù hợp.`,
        `Slug: ${keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
        'Heading gợi ý:\n- H2: Vì sao nên chọn giải pháp này?\n- H2: Lợi ích nổi bật cho khách hàng\n- H3: Cách bắt đầu nhanh',
        length === 'long' ? `Mở bài: Khi tìm kiếm ${keyword}, khách hàng thường cần thông tin rõ ràng, đáng tin và dễ áp dụng. Nội dung này giúp bạn hiểu nhanh giá trị của ${product}, các lợi ích chính và bước tiếp theo để ra quyết định tự tin hơn.` : '',
      ].filter(Boolean).join('\n\n');
    case 'review':
      return [
        `Quote: "Tôi chọn ${product} vì thông điệp rõ ràng và đúng nhu cầu. Trải nghiệm thực tế giúp tôi thấy ${angle} chứ không chỉ là lời quảng cáo."`,
        `Người đánh giá: Khách hàng trong nhóm ${audience}`,
        `Bối cảnh: Trước đó khách hàng cần một lựa chọn đáng tin trong lĩnh vực ${industry || 'liên quan'}.`,
        'Kết quả: Quyết định nhanh hơn, hiểu rõ lợi ích hơn và sẵn sàng giới thiệu cho người khác.',
        'Lời kêu gọi hành động mềm: Rất đáng thử nếu bạn cũng đang tìm một lựa chọn rõ ràng và dễ bắt đầu.',
      ].join('\n\n');
    default:
      return [
        `Mô tả ngắn: ${product} dành cho ${audience}, tập trung vào ${angle}.`,
        'Lời kêu gọi hành động: Bắt đầu ngay hôm nay.',
      ].join('\n\n');
  }
}

function buildFallbackOutput(payload) {
  const count = getVariationCount(payload);

  return Array.from({ length: count }, (_, index) => [
    `Phiên bản ${index + 1}:`,
    buildFallbackVersion(payload, index),
  ].join('\n')).join('\n\n');
}

function getGeminiModel(model) {
  return GEMINI_MODEL_MAP[model] || process.env.GEMINI_MODEL || model || 'gemini-2.5-flash';
}

function getOpenAIModel(model) {
  const modelMap = {
    gpt4o: 'gpt-4o-mini',
    gpt35: 'gpt-4o-mini',
  };

  return modelMap[model] || model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function getOpenAIBaseUrl() {
  return (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
}

function getOpenRouterModel(model) {
  return process.env.OPENROUTER_MODEL || OPENROUTER_MODEL_MAP[model] || model || 'openrouter/free';
}

function getGroqModel(model) {
  return process.env.GROQ_MODEL || GROQ_MODEL_MAP[model] || model || 'llama-3.3-70b-versatile';
}

function getFreeGPT4BaseUrl() {
  return (process.env.FREEGPT4_BASE_URL || 'http://127.0.0.1:5500').replace(/\/+$/, '');
}

function getFreeGPT4Model(model) {
  return process.env.FREEGPT4_MODEL || FREEGPT4_MODEL_MAP[model] || model || 'gpt-4';
}

function getVertexLocation() {
  return String(process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION || DEFAULT_VERTEX_LOCATION).trim();
}

function normalizeVertexResourceName(model) {
  const value = String(model || '').trim();
  if (!value) return '';
  if (value.startsWith('projects/')) return value;
  if (value.includes('/projects/')) return value.replace(/^https?:\/\/[^/]+\/v\d+\//, '');
  return value;
}

async function getGoogleAccessToken() {
  googleAuth = googleAuth || new GoogleAuth({ scopes: [GOOGLE_CLOUD_SCOPE] });
  const client = await googleAuth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
  if (!token) throw createError(503, 'Could not read Google ADC access token. Run gcloud auth application-default login.');
  return token;
}

function cleanFreeGPT4Text(text) {
  return String(text || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

async function callGemini(payload) {
  if (!process.env.GEMINI_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const model = getGeminiModel(payload.model);
  const providerPrompt = buildProviderPrompt(payload);
  const controller = new AbortController();
  const timeoutMs = model.startsWith('gemma-') ? 90000 : 30000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Bạn là chuyên gia copywriting. Trả lời đúng độ dài được yêu cầu, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
            }],
          },
          contents: [{
            role: 'user',
            parts: [{ text: providerPrompt }],
          }],
          generationConfig: {
            temperature: 0.75,
            topP: 0.9,
            maxOutputTokens: getMaxOutputTokens(payload),
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini generateContent failed', {
        status: response.status,
        model,
        message: errorData.error?.message || response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const outputText = cleanProviderOutput(extractGeminiText(data));
    if (!outputText) return null;

    const promptTokens = Number(data.usageMetadata?.promptTokenCount || estimateTokens(providerPrompt));
    const completionTokens = Number(data.usageMetadata?.candidatesTokenCount || estimateTokens(outputText));

    return {
      outputText,
      modelUsed: model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: Number(data.usageMetadata?.totalTokenCount || promptTokens + completionTokens),
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    console.warn('Gemini generateContent failed', {
      model,
      message: error.message,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiFlashBackup(payload) {
  return callGemini({
    ...payload,
    model: 'gemini-flash-latest',
  });
}

async function callVertexGemini(payload) {
  if (typeof fetch !== 'function') {
    return null;
  }

  const resourceName = normalizeVertexResourceName(payload.model);
  if (!resourceName) return null;

  const resourceLocation = resourceName.match(/\/locations\/([^/]+)/)?.[1] || getVertexLocation();
  const providerPrompt = buildProviderPrompt(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  try {
    const token = await getGoogleAccessToken();
    const response = await fetch(
      `https://${resourceLocation}-aiplatform.googleapis.com/v1/${resourceName}:generateContent`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are a senior Vietnamese marketing copywriter. Follow the requested length, keep the copy structured, and write natural Vietnamese with full diacritics.',
            }],
          },
          contents: [{
            role: 'user',
            parts: [{ text: providerPrompt }],
          }],
          generationConfig: {
            temperature: 0.75,
            topP: 0.9,
            maxOutputTokens: getMaxOutputTokens(payload),
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || response.statusText;
      console.warn('Vertex Gemini tuned generateContent failed', { status: response.status, model: resourceName, message });
      if (payload.requireProviderSuccess) {
        throw createError(response.status, `Vertex tuned model generateContent failed: ${message}`);
      }
      return null;
    }

    const data = await response.json();
    const outputText = cleanProviderOutput(extractGeminiText(data));
    if (!outputText) return null;

    const promptTokens = Number(data.usageMetadata?.promptTokenCount || estimateTokens(providerPrompt));
    const completionTokens = Number(data.usageMetadata?.candidatesTokenCount || estimateTokens(outputText));

    return {
      outputText,
      modelUsed: resourceName,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: Number(data.usageMetadata?.totalTokenCount || promptTokens + completionTokens),
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    console.warn('Vertex Gemini tuned generateContent failed', { model: resourceName, message: error.message });
    if (payload.requireProviderSuccess) {
      if (error.statusCode) throw error;
      throw createError(502, `Vertex tuned model generateContent failed: ${error.message}`);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAI(payload) {
  if (!process.env.OPENAI_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const model = getOpenAIModel(payload.model);
    const providerPrompt = buildProviderPrompt(payload);
    const response = await fetch(`${getOpenAIBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia copywriting. Trả lời đúng độ dài được yêu cầu, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
          },
          {
            role: 'user',
            content: providerPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: getMaxOutputTokens(payload),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || response.statusText;
      console.warn('OpenAI chat completion failed', { status: response.status, model, message });
      if (payload.requireProviderSuccess) {
        throw createError(response.status, `OpenAI fine-tuned model request failed: ${message}`);
      }
      return null;
    }

    const data = await response.json();
    const outputText = cleanProviderOutput(data.choices?.[0]?.message?.content);
    if (!outputText) return null;

    const promptTokens = Number(data.usage?.prompt_tokens || estimateTokens(providerPrompt));
    const completionTokens = Number(data.usage?.completion_tokens || estimateTokens(outputText));

    return {
      outputText,
      modelUsed: data.model || model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: Number(data.usage?.total_tokens || promptTokens + completionTokens),
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    if (payload.requireProviderSuccess) {
      if (error.statusCode) throw error;
      throw createError(502, `OpenAI fine-tuned model request failed: ${error.message}`);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenRouter(payload) {
  if (!process.env.OPENROUTER_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const model = getOpenRouterModel(payload.model);
  const providerPrompt = buildProviderPrompt(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'CopyPro AI',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia copywriting. Trả lời đúng độ dài được yêu cầu, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
          },
          {
            role: 'user',
            content: providerPrompt,
          },
        ],
        temperature: 0.75,
        top_p: 0.9,
        max_tokens: getMaxOutputTokens(payload),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('OpenRouter chat completion failed', {
        status: response.status,
        model,
        message: errorData.error?.message || response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const outputText = cleanProviderOutput(data.choices?.[0]?.message?.content);
    if (!outputText) return null;

    const promptTokens = Number(data.usage?.prompt_tokens || estimateTokens(providerPrompt));
    const completionTokens = Number(data.usage?.completion_tokens || estimateTokens(outputText));

    return {
      outputText,
      modelUsed: model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: Number(data.usage?.total_tokens || promptTokens + completionTokens),
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    console.warn('OpenRouter chat completion failed', {
      model,
      message: error.message,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(payload) {
  if (!process.env.GROQ_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const model = getGroqModel(payload.model);
  const providerPrompt = buildProviderPrompt(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior marketing copywriter. Follow the requested length, keep the copy structured, and write in the requested language.',
          },
          {
            role: 'user',
            content: providerPrompt,
          },
        ],
        temperature: 0.75,
        top_p: 0.9,
        max_completion_tokens: getMaxOutputTokens(payload),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Groq chat completion failed', {
        status: response.status,
        model,
        message: errorData.error?.message || response.statusText,
      });
      return null;
    }

    const data = await response.json();
    const outputText = cleanProviderOutput(data.choices?.[0]?.message?.content);
    if (!outputText) return null;

    const promptTokens = Number(data.usage?.prompt_tokens || estimateTokens(providerPrompt));
    const completionTokens = Number(data.usage?.completion_tokens || estimateTokens(outputText));

    return {
      outputText,
      modelUsed: data.model || model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: Number(data.usage?.total_tokens || promptTokens + completionTokens),
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    console.warn('Groq chat completion failed', {
      model,
      message: error.message,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callFreeGPT4(payload) {
  if (typeof fetch !== 'function') {
    return null;
  }

  const model = getFreeGPT4Model(payload.model);
  const providerPrompt = buildProviderPrompt(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.FREEGPT4_TIMEOUT_MS || 90000));

  try {
    const url = new URL(getFreeGPT4BaseUrl());
    url.searchParams.set(process.env.FREEGPT4_KEYWORD || 'text', providerPrompt);
    if (process.env.FREEGPT4_TOKEN) url.searchParams.set('token', process.env.FREEGPT4_TOKEN);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'text/plain, text/html, */*',
      },
    });

    const rawText = await response.text().catch(() => '');
    if (!response.ok) {
      console.warn('FreeGPT4 request failed', {
        status: response.status,
        model,
        message: rawText.slice(0, 200) || response.statusText,
      });
      return null;
    }

    const outputText = cleanProviderOutput(cleanFreeGPT4Text(rawText));
    if (!outputText || /please enter a question/i.test(outputText) || /^error:/i.test(outputText)) return null;

    const promptTokens = estimateTokens(providerPrompt);
    const completionTokens = estimateTokens(outputText);

    return {
      outputText,
      modelUsed: `freegpt4:${model}`,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      status: 'success',
      fallback: false,
    };
  } catch (error) {
    console.warn('FreeGPT4 request failed', {
      model,
      message: error.message,
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateCopy(payload) {
  const forcedProvider = String(payload.forceProvider || '').toLowerCase();
  const provider = forcedProvider || (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const selectedModel = payload.model || '';
  const isGroqModel = selectedModel.startsWith('groq-')
    || selectedModel.startsWith('llama-')
    || selectedModel === 'llama3'
    || selectedModel === 'llama3-8b';
  const providersBySelectedModel = isGroqModel
    ? [callGroq]
    : selectedModel.startsWith('freegpt4-')
      ? [callFreeGPT4]
    : selectedModel.startsWith('openrouter-')
    ? [callOpenRouter]
    : selectedModel.startsWith('gemma-') || selectedModel.includes('pro')
      ? [callGemini, callGeminiFlashBackup]
      : selectedModel.startsWith('gemini-')
        ? [callGemini]
        : null;
  const providersByEnv = {
    gemini: [callGemini],
    'vertex-gemini': [callVertexGemini],
    openrouter: [callOpenRouter],
    openai: [callOpenAI],
    groq: [callGroq],
    freegpt4: [callFreeGPT4],
    auto: [callGemini, callGroq, callOpenRouter, callOpenAI, callFreeGPT4],
  }[provider] || [callGemini];
  const providers = forcedProvider ? providersByEnv : (providersBySelectedModel || providersByEnv);

  for (const callProvider of providers) {
    const result = await callProvider(payload);
    if (result) return result;
  }

  if (payload.requireProviderSuccess) {
    throw createError(502, `Selected model ${payload.model || 'unknown'} could not be reached by its provider`);
  }

  const outputText = buildFallbackOutput(payload);
  const promptTokens = estimateTokens(payload.prompt);
  const completionTokens = estimateTokens(outputText);

  return {
    outputText,
    modelUsed: payload.model || 'fallback-mvp',
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    status: 'fallback',
    fallback: true,
  };
}

module.exports = {
  generateCopy,
};
