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

function buildProviderPrompt(payload) {
  const language = payload.language === 'en' ? 'English' : 'Tiếng Việt có dấu';
  const type = labelFromMap(TYPE_LABELS, payload.type, 'nội dung marketing');
  const tone = labelFromMap(TONE_LABELS, payload.tone, 'rõ ràng');

  return [
    `Ngôn ngữ bắt buộc: ${language}.`,
    `Loại nội dung: ${type}.`,
    `Giọng văn: ${tone}.`,
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

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function buildFallbackOutput(payload) {
  const type = labelFromMap(TYPE_LABELS, payload.type, 'nội dung marketing');
  const tone = labelFromMap(TONE_LABELS, payload.tone, 'rõ ràng');
  const prompt = compactPrompt(payload.prompt);
  const language = payload.language === 'en' ? 'English' : 'Tiếng Việt';

  return [
    `# Bản nháp ${type}`,
    '',
    `**Ngôn ngữ:** ${language}`,
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
              text: 'Bạn là chuyên gia copywriting. Trả lời ngắn gọn, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
            }],
          },
          contents: [{
            role: 'user',
            parts: [{ text: providerPrompt }],
          }],
          generationConfig: {
            temperature: 0.75,
            topP: 0.9,
            maxOutputTokens: 1400,
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
            content: 'Bạn là chuyên gia copywriting. Trả lời ngắn gọn, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
          },
          {
            role: 'user',
            content: providerPrompt,
          },
        ],
        temperature: 0.7,
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
            content: 'Bạn là chuyên gia copywriting. Trả lời ngắn gọn, có cấu trúc, ưu tiên tiếng Việt tự nhiên và luôn dùng đầy đủ dấu tiếng Việt.',
          },
          {
            role: 'user',
            content: providerPrompt,
          },
        ],
        temperature: 0.75,
        top_p: 0.9,
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

async function generateCopy(payload) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const selectedModel = payload.model || '';
  const providersBySelectedModel = selectedModel.startsWith('openrouter-')
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
    auto: [callGemini, callOpenRouter, callOpenAI],
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
