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

  return new RegExp(`^\\s*(?:${labelPattern})\\s*:`, 'i');
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
    .replace(new RegExp(`\\s+((?:${boundaryLabels})\\s*:)`, 'gi'), '\n\n$1')
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

    const version = line.match(/^Phiên bản\s*(\d+)\s*:\s*(.*)$/i);
    if (version) {
      html.push(`<h3>Phiên bản ${version[1]}</h3>`);
      if (version[2]) html.push(`<p>${renderInlineMarkdown(version[2])}</p>`);
      return;
    }

    const label = line.match(/^([A-Za-zÀ-ỹĐđ. ]{2,32})\s*:\s*(.+)$/);
    if (label && BLOCK_LABELS.some(item => item.toLowerCase() === label[1].trim().toLowerCase())) {
      html.push(`<p><strong>${escapeHtml(label[1].trim())}:</strong> ${renderInlineMarkdown(label[2])}</p>`);
      return;
    }

    const labelOnly = line.match(/^([A-Za-zÀ-ỹĐđ. ]{2,32})\s*:\s*$/);
    if (labelOnly && BLOCK_LABELS.some(item => item.toLowerCase() === labelOnly[1].trim().toLowerCase())) {
      html.push(`<p><strong>${escapeHtml(labelOnly[1].trim())}:</strong></p>`);
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
