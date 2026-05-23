const TYPE_LABELS = {
  headline: 'tiêu đề quảng cáo',
  description: 'mô tả sản phẩm',
  social: 'bài đăng mạng xã hội',
  email: 'email marketing',
  cta: 'call-to-action',
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
    long: 'Mỗi phiên bản gồm headline, subheadline, 2 lợi ích chính và CTA, khoảng 60-90 từ.',
  },
  description: {
    short: 'Mỗi phiên bản khoảng 50-80 từ, tập trung vào lợi ích chính.',
    medium: 'Mỗi phiên bản khoảng 120-180 từ, có lợi ích, đặc điểm và CTA.',
    long: 'Mỗi phiên bản khoảng 250-350 từ, có mở bài, lợi ích, bằng chứng thuyết phục và CTA.',
  },
  social: {
    short: 'Mỗi phiên bản khoảng 40-70 từ, dễ đọc trên mạng xã hội.',
    medium: 'Mỗi phiên bản khoảng 100-150 từ, có hook, lợi ích, CTA và hashtag nếu phù hợp.',
    long: 'Mỗi phiên bản khoảng 180-260 từ, có hook, storytelling ngắn, lợi ích, CTA và hashtag.',
  },
  email: {
    short: 'Mỗi phiên bản khoảng 80-120 từ, gồm subject và nội dung email ngắn.',
    medium: 'Mỗi phiên bản khoảng 180-260 từ, gồm subject, mở bài, thân bài và CTA.',
    long: 'Mỗi phiên bản khoảng 320-450 từ, gồm subject, preview text, nội dung thuyết phục và CTA rõ.',
  },
  cta: {
    short: 'Mỗi phiên bản là 1 CTA rất ngắn, khoảng 3-8 từ.',
    medium: 'Mỗi phiên bản gồm CTA chính và 1 câu hỗ trợ, khoảng 15-25 từ.',
    long: 'Mỗi phiên bản gồm CTA chính, microcopy hỗ trợ và lý do hành động, khoảng 35-60 từ.',
  },
  landing: {
    short: 'Mỗi phiên bản khoảng 120-180 từ, gồm headline, subheadline, lợi ích và CTA.',
    medium: 'Mỗi phiên bản khoảng 300-450 từ, gồm hero, lợi ích, bằng chứng và CTA.',
    long: 'Mỗi phiên bản khoảng 600-850 từ, gồm hero, pain point, benefits, proof, offer và CTA.',
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

const FORMAT_BOUNDARY_LABELS = [
  'Chủ đề',
  'Subject',
  'Preview text',
  'CTA',
  'P.S.',
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

function compactPrompt(prompt) {
  return String(prompt || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
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

function normalizeCopyFormatting(outputText) {
  const labelPattern = FORMAT_BOUNDARY_LABELS
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return cleanupMarkdownAsterisks(outputText)
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
    'Không gộp toàn bộ nội dung thành một đoạn dài. Với email, tách riêng Chủ đề, lời chào, từng đoạn thân bài, danh sách ưu đãi và CTA.',
    'Không dùng dấu gạch ngang "-" trong dòng Chủ đề/Subject để tách vế; nếu cần hãy dùng dấu hai chấm hoặc dấu chấm phẩy để tránh bị hiểu nhầm là bullet list.',
    'Chỉ trả về nội dung copy cuối cùng, không giải thích quy trình, không lặp lại role/task, không phân tích bằng tiếng Anh.',
    'Không tự đổi sản phẩm/dịch vụ trong yêu cầu gốc sang sản phẩm khác.',
    'Nếu tạo nhiều phương án, tách rõ bằng nhãn "Phiên bản 1:", "Phiên bản 2:", "Phiên bản 3:".',
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

function buildFallbackOutput(payload) {
  const type = labelFromMap(TYPE_LABELS, payload.type, 'nội dung marketing');
  const tone = labelFromMap(TONE_LABELS, payload.tone, 'rõ ràng');
  const industry = labelFromMap(INDUSTRY_LABELS, payload.industry, '');
  const prompt = compactPrompt(payload.prompt);
  const language = payload.language === 'en' ? 'English' : 'Tiếng Việt';

  return [
    `# Bản nháp ${type}`,
    '',
    `**Ngôn ngữ:** ${language}`,
    industry ? `**Ngành nghề:** ${industry}` : '',
    `**Tone:** ${tone}`,
    '',
    '## Phiên bản đề xuất',
    `Khám phá giải pháp nổi bật dành cho nhu cầu của bạn. Nội dung được viết theo phong cách ${tone}, tập trung vào lợi ích rõ ràng, tạo niềm tin nhanh và thúc đẩy người đọc hành động.`,
    '',
    '## Điểm nhấn',
    '- Lợi ích chính được trình bày ngắn gọn, dễ hiểu.',
    '- Thông điệp có thể dùng cho quảng cáo, landing page hoặc social post.',
    '- CTA rõ ràng để tăng tỷ lệ chuyển đổi.',
    '',
    '## CTA',
    'Bắt đầu ngay hôm nay để nhận tư vấn và ưu đãi phù hợp nhất.',
    '',
    prompt ? `> Gợi ý đã dùng: ${prompt}` : '',
  ].filter(Boolean).join('\n');
}

function getGeminiModel(model) {
  return GEMINI_MODEL_MAP[model] || process.env.GEMINI_MODEL || model || 'gemini-2.5-flash';
}

function getOpenAIModel(model) {
  const modelMap = {
    gpt4o: 'gpt-4o-mini',
    gpt35: 'gpt-4o-mini',
  };

  return process.env.OPENAI_MODEL || modelMap[model] || model || 'gpt-4o-mini';
}

function getOpenRouterModel(model) {
  return process.env.OPENROUTER_MODEL || OPENROUTER_MODEL_MAP[model] || model || 'openrouter/free';
}

function getGroqModel(model) {
  return process.env.GROQ_MODEL || GROQ_MODEL_MAP[model] || model || 'llama-3.3-70b-versatile';
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

async function callOpenAI(payload) {
  if (!process.env.OPENAI_API_KEY || typeof fetch !== 'function') {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const model = getOpenAIModel(payload.model);
    const providerPrompt = buildProviderPrompt(payload);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) return null;

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
  } catch {
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

async function generateCopy(payload) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const selectedModel = payload.model || '';
  const isGroqModel = selectedModel.startsWith('groq-')
    || selectedModel.startsWith('llama-')
    || selectedModel === 'llama3'
    || selectedModel === 'llama3-8b';
  const providersBySelectedModel = isGroqModel
    ? [callGroq]
    : selectedModel.startsWith('openrouter-')
    ? [callOpenRouter]
    : selectedModel.startsWith('gemma-') || selectedModel.includes('pro')
      ? [callGemini, callGeminiFlashBackup]
      : selectedModel.startsWith('gemini-')
        ? [callGemini]
        : null;
  const providersByEnv = {
    gemini: [callGemini],
    openrouter: [callOpenRouter],
    openai: [callOpenAI],
    groq: [callGroq],
    auto: [callGemini, callGroq, callOpenRouter, callOpenAI],
  }[provider] || [callGemini];
  const providers = providersBySelectedModel || providersByEnv;

  for (const callProvider of providers) {
    const result = await callProvider(payload);
    if (result) return result;
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
