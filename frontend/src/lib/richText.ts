const BLOCK_LABELS = [
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
const MARKETING_ICON_PATTERN = String.raw`[\u2600-\u27BF\u{1F300}-\u{1FAFF}]\uFE0F?`;
const MARKETING_ICON_PREFIX = String.raw`(?:${MARKETING_ICON_PATTERN}\s*)*`;
const LINE_DECORATION_PREFIX = String.raw`(?:#{1,4}\s*)?(?:[-*]\s*)?(?:\*\*)?\s*`;

function normalizeLabel(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

const NORMALIZED_BLOCK_LABELS = new Set(BLOCK_LABELS.map(normalizeLabel));

function isKnownBlockLabel(value: string) {
  return NORMALIZED_BLOCK_LABELS.has(normalizeLabel(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function looksLikeHtml(text: string) {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

export function sanitizeHtml(html: string) {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, '');
}

function labelRegex() {
  const labelPattern = BLOCK_LABELS
    .map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return new RegExp(String.raw`^\s*${LINE_DECORATION_PREFIX}${MARKETING_ICON_PREFIX}(?:${labelPattern})\s*:`, 'iu');
}

function isLabelBlock(block: string) {
  return labelRegex().test(block);
}

function shouldSplitInlineBullets(block: string) {
  if (isLabelBlock(block)) return false;

  const matches = block.match(INLINE_BULLET_PATTERN) || [];
  return matches.length >= 2 || (matches.length === 1 && LIST_CONTEXT_PATTERN.test(block));
}

function splitInlineBullets(block: string) {
  if (!shouldSplitInlineBullets(block)) return [block];

  return block
    .replace(/\s+([-*]\s+(?=[A-ZÀ-ỴĐ0-9]))/g, '\n$1')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function normalizePlainText(text: string) {
  const boundaryLabels = BLOCK_LABELS
    .map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(new RegExp(String.raw`\s+(${MARKETING_ICON_PREFIX}(?:${boundaryLabels})\s*:)`, 'giu'), '\n\n$1')
    .replace(/\s+(Kính gửi\b)/gi, '\n\n$1')
    .split(/\n{2,}/)
    .flatMap(block => splitInlineBullets(block.trim()))
    .flatMap(block => splitLongParagraph(block.trim()))
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitLongParagraph(block: string) {
  if (!block || block.includes('\n') || block.length <= 280) return [block];
  if (/^(?:[-*]\s+|\d+[.)]\s+)/.test(block)) return [block];
  if (isLabelBlock(block)) return [block];

  const sentences = block.match(/[^.!?。]+[.!?。]+(?:["'”’)]*)|.+$/g) || [block];
  const paragraphs: string[] = [];
  let current = '';

  sentences.forEach(sentence => {
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

function renderInlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong>$1</strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s([{])\*([^*\n]+)\*(?=[\s)\]},.!?:;]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*+/g, '');
}

function trimClosingMarkdown(value: string) {
  return String(value || '').replace(/^\s*\*\*\s*/, '').replace(/\s*\*\*\s*$/, '').trim();
}

function renderLeadingIcon(icon: string) {
  const cleanIcon = icon.trim();
  if (!cleanIcon) return '';
  return `<span aria-hidden='true' style='display:inline-block;line-height:1;vertical-align:-0.08em;margin-right:0.35em'>${escapeHtml(cleanIcon)}</span>`;
}

function matchVersionLine(line: string) {
  const version = line.match(new RegExp(String.raw`^${LINE_DECORATION_PREFIX}(${MARKETING_ICON_PREFIX})(?:Phiên\s*bản|Phien\s*ban|Version)\s*(\d+)\s*[:.\-]\s*(?:\*\*)?\s*(.*)$`, 'iu'));
  if (!version) return null;

  return {
    icon: version[1] || '',
    number: version[2],
    content: trimClosingMarkdown(version[3] || ''),
  };
}

function matchLabelLine(line: string) {
  const label = line.match(new RegExp(String.raw`^${LINE_DECORATION_PREFIX}(${MARKETING_ICON_PREFIX})([A-Za-zÀ-ỹĐđ. ]{2,48})\s*:\s*(?:\*\*)?\s*(.*)$`, 'iu'));
  if (!label || !isKnownBlockLabel(label[2])) return null;

  return {
    icon: label[1] || '',
    label: label[2].trim(),
    content: trimClosingMarkdown(label[3] || ''),
  };
}

export function formatGeneratedCopyForTinyMce(text: string) {
  if (!text) return '';
  if (looksLikeHtml(text)) return sanitizeHtml(text);

  const lines = normalizePlainText(text).split('\n');
  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.join('')}</ul>`);
    listItems = [];
  };

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) {
      return;
    }

    const bullet = line.match(/^(?:[-*])\s+(.+)$/);
    if (bullet) {
      listItems.push(`<li>${renderInlineMarkdown(bullet[1])}</li>`);
      return;
    }

    flushList();

    const version = matchVersionLine(line);
    if (version) {
      html.push(`<h3>${renderLeadingIcon(version.icon)}Phiên bản ${escapeHtml(version.number)}</h3>`);
      if (version.content) html.push(`<p>${renderInlineMarkdown(version.content)}</p>`);
      return;
    }

    const label = matchLabelLine(line);
    if (label) {
      const labelPrefix = `${renderLeadingIcon(label.icon)}<strong>${escapeHtml(label.label)}:</strong>`;
      html.push(label.content
        ? `<p>${labelPrefix} ${renderInlineMarkdown(label.content)}</p>`
        : `<p>${labelPrefix}</p>`);
      return;
    }

    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  flushList();
  return html.join('\n');
}

export function htmlToPlainText(text: string) {
  if (!looksLikeHtml(text)) return text;

  return sanitizeHtml(text)
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
