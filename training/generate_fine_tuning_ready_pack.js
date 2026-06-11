const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readyDir = path.join(root, 'fine_tuning_ready_vi_huggingface');
const llamaDir = path.join(root, 'training', 'llama', 'data');
const excelPackDir = path.join(root, 'fine_tuning_excel_pack_brand_voice');

const TYPE_LABELS = {
  headline: 'Tiêu Đề Quảng Cáo',
  description: 'Mô Tả Sản Phẩm',
  social: 'Social Media Post',
  email: 'Email Marketing',
  cta: 'Lời Kêu Gọi Hành Động',
};

const TONE_LABELS = {
  urgent: 'Khẩn cấp',
  professional: 'Chuyên nghiệp',
  friendly: 'Thân thiện',
  emotional: 'Cảm xúc',
};

const TYPE_FROM_LABEL = Object.fromEntries(Object.entries(TYPE_LABELS).map(([id, label]) => [label, id]));
const TONE_FROM_LABEL = Object.fromEntries(Object.entries(TONE_LABELS).map(([id, label]) => [label, id]));

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function writeUtf8(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function csvCell(value) {
  const text = String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return '"' + text.replace(/"/g, '""') + '"';
}

function toCsv(rows, columns) {
  const header = columns.map(csvCell).join(',');
  const body = rows.map((row) => columns.map((col) => csvCell(row[col])).join(',')).join('\n');
  return header + '\n' + body + '\n';
}

function splitLines(text) {
  return String(text || '').split(/\r?\n/);
}

function getLineValue(lines, prefix) {
  const line = lines.find((item) => item.startsWith(prefix + ':'));
  if (!line) return '';
  return line.slice(prefix.length + 1).trim().replace(/\.$/, '');
}

function parsePrompt(prompt) {
  const lines = splitLines(prompt);
  const typeLine = lines.find((item) => item.startsWith('Hãy viết ')) || '';
  const typeLabel = typeLine.replace(/^Hãy viết\s+/, '').replace(/\s+với tone.*$/, '').trim();
  const toneLine = typeLine.replace(/^Hãy viết .*?với tone\s+/, '').replace(/\.$/, '').trim();
  const type = TYPE_FROM_LABEL[typeLabel] || 'headline';
  const tone = TONE_FROM_LABEL[toneLine] || 'friendly';
  const product = getLineValue(lines, 'Sản phẩm/dịch vụ');
  const keywords = getLineValue(lines, 'Từ khóa chính');
  const audience = getLineValue(lines, 'Đối tượng mục tiêu');
  const offer = getLineValue(lines, 'Thông tin bổ sung');
  const maxTokens = getLineValue(lines, 'Giới hạn output tối đa');
  const features = keywords ? keywords.split(';').map((value) => value.trim()).filter(Boolean) : [];
  return { type, tone, product, audience, offer, features, maxTokens, typeLabel, toneLine };
}

function ensureFeatures(features, product) {
  const values = features.filter(Boolean).slice();
  while (values.length < 3) values.push(product || 'sản phẩm');
  return values.slice(0, 3);
}

function normalizeHashText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toHash(text, limit = 3) {
  const parts = normalizeHashText(text).split(' ').filter(Boolean).slice(0, limit);
  if (parts.length === 0) return '#SanPham';
  return '#' + parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function versioned(sections) {
  return sections.map((body, index) => 'Phiên bản ' + (index + 1) + ':\n' + body).join('\n\n');
}

function toneLead(tone) {
  return {
    urgent: ['Đừng chần chừ với', 'Cần xem ngay cho', 'Giữ nhịp nhanh hơn cho'],
    professional: ['Giải pháp rõ ràng cho', 'Một lựa chọn đáng tin cho', 'Tối ưu gọn gàng cho'],
    friendly: ['Gợi ý dễ dùng cho', 'Một lựa chọn thân thiện cho', 'Thêm tiện lợi cho'],
    emotional: ['Một cách để yên tâm hơn cho', 'Lựa chọn ấm áp hơn cho', 'Chăm chút hơn cho'],
  }[tone] || ['Gợi ý phù hợp cho', 'Một lựa chọn hợp lý cho', 'Thêm tiện lợi cho'];
}

function buildHeadlineOutput(ctx) {
  const [f1, f2, f3] = ctx.features;
  const [l1, l2, l3] = toneLead(ctx.tone);
  return versioned([
    [
      'Headline: ' + l1 + ' ' + ctx.product + ' cho ' + ctx.audience + ' với ' + f1 + '.',
      'Subheadline: Tập trung vào ' + f2 + ' và ' + f3 + ', phù hợp khi bạn cần một lựa chọn rõ ràng và nhanh.',
      'Lời kêu gọi hành động: Xem ngay để chọn đúng mẫu.',
    ].join('\n'),
    [
      'Headline: ' + ctx.product + ' là lựa chọn đáng cân nhắc cho ' + ctx.audience + '.',
      'Subheadline: Điểm mạnh nằm ở ' + f2 + ', ' + f1 + ' và ' + ctx.offer + ' để bạn so sánh dễ hơn.',
      'Lời kêu gọi hành động: Nhắn shop để được tư vấn nhanh.',
    ].join('\n'),
    [
      'Headline: ' + l3 + ' ' + ctx.product + ' nếu bạn cần ' + f1 + ' và ' + f2 + '.',
      'Subheadline: Cách trình bày gọn, bám sát nhu cầu thật và không nói quá công dụng.',
      'Lời kêu gọi hành động: Mở chi tiết sản phẩm ngay hôm nay.',
    ].join('\n'),
  ]);
}

function buildDescriptionOutput(ctx) {
  const [f1, f2, f3] = ctx.features;
  return versioned([
    [
      'Mô tả ngắn: ' + ctx.product + ' dành cho ' + ctx.audience + ', nhấn vào trải nghiệm dùng rõ ràng và dễ hiểu.',
      'Lợi ích chính:',
      '- Hỗ trợ nhu cầu thực tế nhờ ' + f1 + ' và ' + f2 + '.',
      '- Giúp bạn cân nhắc nhanh hơn với thông tin đúng brief và ' + ctx.offer + '.',
      'Đặc điểm nổi bật:',
      '- ' + f1 + '.',
      '- ' + f3 + '.',
      'Lời kêu gọi hành động: Xem chi tiết để chọn mẫu phù hợp.',
    ].join('\n'),
    [
      'Mô tả ngắn: Nếu bạn là ' + ctx.audience + ', ' + ctx.product + ' là một lựa chọn gọn gàng, dễ dùng và sát nhu cầu.',
      'Lợi ích chính:',
      '- Mang lại cảm giác yên tâm khi xem thông tin rõ ràng.',
      '- Tập trung vào ' + f2 + ' và ' + f3 + ' để phục vụ dùng hằng ngày.',
      'Đặc điểm nổi bật:',
      '- ' + f2 + '.',
      '- ' + ctx.offer + '.',
      'Lời kêu gọi hành động: Nhắn tin để được tư vấn trước khi mua.',
    ].join('\n'),
    [
      'Mô tả ngắn: ' + ctx.product + ' giúp ' + ctx.audience + ' có thêm một lựa chọn hợp lý cho nhu cầu thường ngày.',
      'Lợi ích chính:',
      '- ' + f3 + ' làm cho việc dùng tiện hơn.',
      '- ' + f1 + ' hỗ trợ đúng mối quan tâm chính.',
      'Đặc điểm nổi bật:',
      '- ' + f1 + '.',
      '- ' + f2 + '.',
      'Lời kêu gọi hành động: Lưu lại để so sánh khi cần.',
    ].join('\n'),
  ]);
}

function buildSocialOutput(ctx) {
  const [f1, f2, f3] = ctx.features;
  const [l1, l2, l3] = toneLead(ctx.tone);
  return versioned([
    [
      'Hook: ' + l2 + ' ' + ctx.audience + '.',
      'Caption: ' + ctx.product + ' giúp việc hằng ngày nhẹ hơn nhờ ' + f1 + ', ' + f2 + ' và ' + f3 + '. Hiện có ' + ctx.offer + ', phù hợp nếu bạn đang tìm một lựa chọn rõ ràng, dễ cân nhắc.',
      'Lời kêu gọi hành động: Lưu lại hoặc nhắn shop để hỏi thêm.',
      'Hashtags: ' + toHash(ctx.product) + ' ' + toHash(ctx.audience) + ' ' + toHash(f1),
    ].join('\n'),
    [
      'Hook: Đừng để nhu cầu nhỏ làm chậm nhịp của ' + ctx.audience + '.',
      'Caption: Với ' + f2 + ' và ' + f3 + ', ' + ctx.product + ' cho cảm giác thực tế, dễ hiểu và không nói quá công dụng. ' + ctx.offer + ' là điểm cộng thêm nếu bạn đang so sánh lựa chọn.',
      'Lời kêu gọi hành động: Bình luận nhu cầu của bạn để được gợi ý.',
      'Hashtags: ' + toHash(ctx.product) + ' ' + toHash(f2) + ' #MuaSamThongMinh',
    ].join('\n'),
    [
      'Hook: ' + l1 + ' ' + ctx.audience + ' một lựa chọn gọn gàng hơn.',
      'Caption: Khi xem ' + ctx.product + ', hãy chú ý vào ' + f1 + ', ' + f2 + ' và ' + f3 + '. Đây là phần thông tin đủ để bạn cân nhắc trước khi quyết định.',
      'Lời kêu gọi hành động: Nhắn tin để kiểm tra mẫu phù hợp.',
      'Hashtags: ' + toHash(ctx.product) + ' ' + toHash(f3) + ' #ThuongMaiDienTu',
    ].join('\n'),
  ]);
}

function buildEmailOutput(ctx) {
  const [f1, f2, f3] = ctx.features;
  return versioned([
    [
      'Subject: Gợi ý ' + ctx.product + ' cho ' + ctx.audience,
      'Preview text: Tóm tắt nhanh các điểm đáng cân nhắc trước khi chọn mua.',
      'Lời chào: Chào bạn,',
      'Nội dung chính: Nếu bạn đang tìm một lựa chọn phù hợp cho nhu cầu hằng ngày, ' + ctx.product + ' có các điểm nổi bật như ' + f1 + ', ' + f2 + ' và ' + f3 + '. Hiện có ' + ctx.offer + ', nên bạn có thể xem thêm thông tin trước khi quyết định.',
      'Lời kêu gọi hành động: Xem chi tiết sản phẩm hôm nay.',
    ].join('\n'),
    [
      'Subject: ' + ctx.product + ' có thể hợp với nhu cầu của bạn',
      'Preview text: Một vài lý do để ' + ctx.audience + ' cân nhắc sản phẩm này.',
      'Lời chào: Chào bạn,',
      'Nội dung chính: ' + ctx.product + ' tập trung vào ' + f2 + ', ' + f1 + ' và ' + f3 + '. Thông tin được viết theo đúng brief, không thêm chứng nhận hay số liệu ngoài phạm vi. ' + ctx.offer + ' giúp bạn có thêm lý do so sánh.',
      'Lời kêu gọi hành động: Nhắn lại để được tư vấn lựa chọn phù hợp.',
    ].join('\n'),
    [
      'Subject: Xem nhanh ' + ctx.product + ' trước khi bạn chọn',
      'Preview text: Thông tin ngắn gọn, dễ so sánh và có ưu đãi đi kèm.',
      'Lời chào: Chào bạn,',
      'Nội dung chính: Với ' + ctx.audience + ', một sản phẩm dễ hiểu thường giúp quyết định nhanh hơn. ' + ctx.product + ' có ' + f1 + ', ' + f2 + ' và ' + f3 + '; ngoài ra còn có ' + ctx.offer + ' để bạn cân nhắc thêm.',
      'Lời kêu gọi hành động: Mở trang sản phẩm để xem thêm chi tiết.',
    ].join('\n'),
  ]);
}

function buildCtaOutput(ctx) {
  const [f1, f2, f3] = ctx.features;
  return versioned([
    [
      'Lời kêu gọi hành động chính: Mua ' + ctx.product + ' ngay hôm nay',
      'Microcopy: Phù hợp cho ' + ctx.audience + ', có ' + ctx.offer + ' và thông tin rõ ràng để bạn chọn nhanh.',
    ].join('\n'),
    [
      'Lời kêu gọi hành động chính: Chọn ' + ctx.product + ' cho nhu cầu hiện tại',
      'Microcopy: Tập trung vào ' + f1 + ' và ' + f2 + ', giúp bạn quyết định dễ hơn.',
    ].join('\n'),
    [
      'Lời kêu gọi hành động chính: Nhắn shop để được tư vấn ' + ctx.product,
      'Microcopy: Bạn có thể hỏi thêm về ' + f3 + ' và ' + ctx.offer + ' trước khi quyết định.',
    ].join('\n'),
  ]);
}

function buildOutput(ctx) {
  switch (ctx.type) {
    case 'headline': return buildHeadlineOutput(ctx);
    case 'description': return buildDescriptionOutput(ctx);
    case 'social': return buildSocialOutput(ctx);
    case 'email': return buildEmailOutput(ctx);
    case 'cta': return buildCtaOutput(ctx);
    default: throw new Error('Unsupported type: ' + ctx.type);
  }
}

function buildPrompt(ctx) {
  return [
    'Bạn là chuyên gia copywriting cho ngành Thương Mại Điện Tử.',
    'Hãy viết ' + (TYPE_LABELS[ctx.type] || ctx.type) + ' với tone ' + (TONE_LABELS[ctx.tone] || ctx.tone) + '.',
    'Sản phẩm/dịch vụ: ' + ctx.product + '.',
    'Từ khóa chính: ' + ctx.features.join('; ') + '.',
    'Đối tượng mục tiêu: ' + ctx.audience + '.',
    'Thông tin bổ sung: ' + ctx.offer + '.',
    'Độ dài mong muốn: vừa đủ chi tiết.',
    'Giới hạn output tối đa: 1800 tokens.',
    'Tạo đúng 3 phiên bản riêng biệt.',
    'Định dạng bắt buộc:',
    'Phiên bản 1: ...',
    'Phiên bản 2: ...',
    'Phiên bản 3: ...',
    'Mỗi phiên bản phải tự đứng độc lập, không gom chung thành một đoạn lớn.',
    'Format riêng theo loại nội dung:',
    getFormatPrompt(ctx.type),
    'Dùng tiếng Việt tự nhiên, đầy đủ dấu, có lời kêu gọi hành động rõ ràng.',
    'Temperature tham khảo: 0.7.',
  ].join('\n');
}

function getFormatPrompt(type) {
  switch (type) {
    case 'headline':
      return [
        'Headline: một câu chính sắc, dễ đọc, có lợi ích hoặc điểm khác biệt.',
        'Subheadline: một câu phụ làm rõ lời hứa của headline.',
        'Lời kêu gọi hành động: một câu ngắn thúc đẩy người đọc hành động.',
        'Không viết thành email, social post, mô tả sản phẩm hoặc landing page đầy đủ.',
      ].join('\n');
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
        'Không viết như social caption, landing page hoặc SEO snippet.',
      ].join('\n');
    case 'cta':
      return [
        'Lời kêu gọi hành động chính: câu/nút kêu gọi hành động.',
        'Microcopy: một câu hỗ trợ ngay dưới lời kêu gọi hành động.',
        'Chỉ viết lời kêu gọi hành động, không thêm bài quảng cáo dài.',
      ].join('\n');
    default:
      return 'Chia thành các đoạn ngắn, có nhãn rõ, có lời kêu gọi hành động phù hợp và không trộn format của loại nội dung khác.';
  }
}

function parseRows(rows) {
  return rows.map((row) => {
    const prompt = row.messages?.[1]?.content || '';
    const parsed = parsePrompt(prompt);
    if (row.metadata?.type && parsed.type !== row.metadata.type) {
      throw new Error('Type mismatch for prompt: expected ' + row.metadata.type + ', got ' + parsed.type);
    }
    if (row.metadata?.tone && parsed.tone !== row.metadata.tone) {
      throw new Error('Tone mismatch for prompt: expected ' + row.metadata.tone + ', got ' + parsed.tone);
    }
    const features = ensureFeatures(parsed.features, parsed.product);
    const ctx = {
      type: parsed.type,
      tone: parsed.tone,
      product: parsed.product,
      audience: parsed.audience,
      offer: parsed.offer,
      features,
    };
    const output = buildOutput(ctx);
    const nextRow = {
      ...row,
      messages: [
        row.messages?.[0] ? { ...row.messages[0] } : { role: 'system', content: '' },
        row.messages?.[1] ? { ...row.messages[1], content: prompt } : { role: 'user', content: prompt },
        row.messages?.[2] ? { ...row.messages[2], content: output } : { role: 'assistant', content: output },
      ],
      metadata: {
        ...(row.metadata || {}),
        type: parsed.type,
        tone: parsed.tone,
        product: parsed.product,
        prompt_contract: 'generator-ui-v1',
        output_contract: 'generator-ui-v1-three-versions',
      },
    };
    return { row: nextRow, ctx, prompt, output };
  });
}

function validateOutput(output, type) {
  const versionMatches = output.match(/Phiên bản\s+[123]:/g) || [];
  if (versionMatches.length !== 3) {
    throw new Error('Expected 3 versions, found ' + versionMatches.length);
  }
  const sectionMatches = output.split(/\n\n/).filter(Boolean);
  if (sectionMatches.length !== 3) {
    throw new Error('Expected 3 version sections, found ' + sectionMatches.length);
  }
  const requiredByType = {
    headline: ['Headline:', 'Subheadline:', 'Lời kêu gọi hành động:'],
    description: ['Mô tả ngắn:', 'Lợi ích chính:', 'Đặc điểm nổi bật:', 'Lời kêu gọi hành động:'],
    social: ['Hook:', 'Caption:', 'Lời kêu gọi hành động:', 'Hashtags:'],
    email: ['Subject:', 'Preview text:', 'Lời chào:', 'Nội dung chính:', 'Lời kêu gọi hành động:'],
    cta: ['Lời kêu gọi hành động chính:', 'Microcopy:'],
  }[type];
  for (const section of sectionMatches) {
    const body = section.replace(/^Phiên bản\s+[123]:\s*/, '');
    for (const label of requiredByType) {
      if (!body.includes(label)) {
        throw new Error('Missing label ' + label + ' for type ' + type);
      }
    }
    if (/\bCTA\s*:/.test(body)) {
      throw new Error('Found CTA label in output for type ' + type);
    }
    if (/TYPE=/.test(body)) {
      throw new Error('Found TYPE= marker in output for type ' + type);
    }
  }
}

function rowsToJsonl(rows) {
  return rows.map((row) => JSON.stringify(row)).join('\n') + '\n';
}

function buildTestPrompts() {
  const items = [
    ['áo khoác chống nắng nhẹ', 'người đi làm di chuyển ban ngày', ['vải thoáng', 'có mũ', 'dễ gấp gọn'], 'ưu đãi freeship hôm nay'],
    ['bàn phím cơ yên tĩnh', 'người làm việc trong văn phòng chung', ['switch êm', 'layout gọn', 'đèn nền dịu'], 'bảo hành 12 tháng'],
    ['sữa hạt ít đường', 'người muốn bữa sáng nhanh gọn', ['ít đường', 'vị dễ uống', 'đóng chai tiện'], 'mua combo tiết kiệm hơn'],
    ['camera trong nhà', 'gia đình muốn quan sát thú cưng', ['góc rộng', 'đàm thoại hai chiều', 'cảnh báo chuyển động'], 'hỗ trợ cài đặt từ xa'],
    ['giày chạy bộ êm chân', 'người mới tập chạy', ['đế êm', 'thoáng khí', 'ôm chân vừa phải'], 'đổi size miễn phí một lần'],
    ['hộp cơm giữ nhiệt', 'nhân viên văn phòng mang cơm trưa', ['giữ ấm lâu', 'nhiều ngăn', 'dễ rửa'], 'tặng túi giữ nhiệt'],
  ];
  const types = ['headline', 'description', 'social', 'email', 'cta'];
  const tones = ['friendly', 'professional', 'urgent', 'emotional'];
  const prompts = [];
  items.forEach((item, itemIndex) => {
    types.forEach((type, typeIndex) => {
      const tone = tones[(itemIndex + typeIndex) % tones.length];
      prompts.push({
        prompt: buildPrompt({ type, tone, product: item[0], audience: item[1], features: item[2], offer: item[3] }),
        expected_focus: 'Giữ tiếng Việt có dấu; prompt và output theo Generator UI; đúng 3 phiên bản; đúng label theo loại nội dung; không bịa chứng nhận hay số liệu.',
        type,
        tone,
        product: item[0],
        audience: item[1],
      });
    });
  });
  return prompts;
}

function writePromptPackArtifacts(trainRows, valRows) {
  writeUtf8(path.join(readyDir, '01_train_examples_for_app_import_utf8.csv'), toCsv(trainRows.map((row) => ({
    input: row.messages[1].content,
    output: row.messages[2].content,
    industry: row.metadata.industry,
    tone: row.metadata.tone,
    type: row.metadata.type,
    product: row.metadata.product,
  })), ['input', 'output', 'industry', 'tone', 'type', 'product']));
  writeUtf8(path.join(readyDir, '02_train_huggingface_chat_utf8.jsonl'), rowsToJsonl(trainRows));
  writeUtf8(path.join(readyDir, '03_validation_holdout_chat_utf8.jsonl'), rowsToJsonl(valRows));
  writeUtf8(path.join(readyDir, '04_validation_holdout_for_review_utf8.csv'), toCsv(valRows.map((row) => ({
    input: row.messages[1].content,
    output: row.messages[2].content,
    industry: row.metadata.industry,
    tone: row.metadata.tone,
    type: row.metadata.type,
    product: row.metadata.product,
  })), ['input', 'output', 'industry', 'tone', 'type', 'product']));

  const testPrompts = buildTestPrompts();
  writeUtf8(path.join(readyDir, '05_test_prompts_after_finetune_utf8.csv'), toCsv(testPrompts, ['prompt', 'expected_focus', 'type', 'tone', 'product', 'audience']));
  writeUtf8(path.join(readyDir, 'copy_paste_test_prompts.md'), testPrompts.map((item, index) => {
    return '## Prompt ' + (index + 1) + '\n\n' + item.prompt + '\n\nKỳ vọng: ' + item.expected_focus + '\n';
  }).join('\n'));
  writeUtf8(path.join(readyDir, 'README_FINE_TUNING_UTF8.md'), [
    '# Fine-tuning Ready Pack - Vietnamese Generator Contract',
    '',
    'Pack này dùng đúng prompt contract của trang Generator thay vì schema TYPE=... cũ.',
    '',
    '## Dùng trong app /fine-tune',
    '',
    '1. Mở trang `/fine-tune`.',
    '2. Chọn provider `Hugging Face Llama Fine-tuning`.',
    '3. Chọn `Llama 3.2 1B Instruct` để test nhẹ trước.',
    '4. Import file `01_train_examples_for_app_import_utf8.csv`.',
    '5. Bấm `Bắt đầu Fine-tuning`.',
    '',
    '## Contract đã sửa',
    '',
    '- Input là prompt nhiều dòng giống Generator: `Bạn là chuyên gia copywriting...`, `Tạo đúng 3 phiên bản...`, `Format riêng theo loại nội dung...`.',
    '- Output luôn có đúng `Phiên bản 1:`, `Phiên bản 2:`, `Phiên bản 3:`.',
    '- Mỗi phiên bản dùng đúng label của từng loại nội dung, ví dụ `Lời kêu gọi hành động:` thay vì `CTA:`.',
    '- CSV giữ newline bằng quote chuẩn để nội dung import vẫn giống prompt thật.',
    '',
    '## Dùng ngoài app với Colab hoặc Kaggle',
    '',
    '- Train file: `02_train_huggingface_chat_utf8.jsonl`.',
    '- Validation file: `03_validation_holdout_chat_utf8.jsonl`.',
    '- Prompt test sau fine-tune: `copy_paste_test_prompts.md`.',
    '',
  ].join('\n'));
  writeUtf8(path.join(readyDir, 'manifest.json'), JSON.stringify({
    output_dir: readyDir,
    encoding: 'utf-8',
    train_examples: trainRows.length,
    validation_examples: valRows.length,
    test_prompts: testPrompts.length,
    target_provider: 'huggingface',
    recommended_base_model: 'meta-llama/Llama-3.2-1B-Instruct',
    prompt_contract: 'generator-ui-v1',
    output_contract: 'generator-ui-v1-three-versions',
    generated_at: new Date().toISOString(),
    files: [
      '01_train_examples_for_app_import_utf8.csv',
      '02_train_huggingface_chat_utf8.jsonl',
      '03_validation_holdout_chat_utf8.jsonl',
      '04_validation_holdout_for_review_utf8.csv',
      '05_test_prompts_after_finetune_utf8.csv',
      'copy_paste_test_prompts.md',
      'README_FINE_TUNING_UTF8.md',
    ],
  }, null, 2));
}

function writeExcelPackDocs(trainRows, valRows) {
  writeUtf8(path.join(excelPackDir, 'README_FINE_TUNING.md'), [
    '# Fine-tuning Excel Pack - Vietnamese Generator Contract',
    '',
    'Pack Excel này đã được đồng bộ theo prompt contract của Generator và giữ đúng dấu tiếng Việt.',
    '',
    '- Dữ liệu train: `01_train_examples_brand_voice_UTF8_FIXED.xlsx`.',
    '- Holdout: `02_validation_holdout_brand_voice_UTF8_FIXED.xlsx`.',
    '- Test prompts: `03_test_prompts_after_finetune_UTF8_FIXED.xlsx`.',
    '- Scorecard: `04_eval_scorecard_UTF8_FIXED.xlsx`.',
    '',
  ].join('\n'));
  writeUtf8(path.join(excelPackDir, 'manifest.json'), JSON.stringify({
    output_dir: excelPackDir,
    encoding: 'utf-8',
    train_examples: trainRows.length,
    validation_examples: valRows.length,
    test_prompts: 30,
    prompt_contract: 'generator-ui-v1',
    output_contract: 'generator-ui-v1-three-versions',
    generated_at: new Date().toISOString(),
    files: [
      '01_train_examples_brand_voice_UTF8_FIXED.xlsx',
      '02_validation_holdout_brand_voice_UTF8_FIXED.xlsx',
      '03_test_prompts_after_finetune_UTF8_FIXED.xlsx',
      '04_eval_scorecard_UTF8_FIXED.xlsx',
    ],
  }, null, 2));
}

function main() {
  const trainSource = readJsonl(path.join(readyDir, '02_train_huggingface_chat_utf8.jsonl'));
  const valSource = readJsonl(path.join(readyDir, '03_validation_holdout_chat_utf8.jsonl'));

  const trainRows = parseRows(trainSource);
  const valRows = parseRows(valSource);

  for (const item of [...trainRows, ...valRows]) {
    validateOutput(item.row.messages[2].content, item.row.metadata.type);
  }

  writePromptPackArtifacts(trainRows.map((item) => item.row), valRows.map((item) => item.row));
  writeExcelPackDocs(trainRows.map((item) => item.row), valRows.map((item) => item.row));

  writeUtf8(path.join(llamaDir, 'train.jsonl'), rowsToJsonl(trainRows.map((item) => item.row)));
  writeUtf8(path.join(llamaDir, 'val.jsonl'), rowsToJsonl(valRows.map((item) => item.row)));

  console.log(JSON.stringify({
    train: trainRows.length,
    validation: valRows.length,
    promptContract: 'generator-ui-v1',
    outputContract: 'generator-ui-v1-three-versions',
  }, null, 2));
}

main();

