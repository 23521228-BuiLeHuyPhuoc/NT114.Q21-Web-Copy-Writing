const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'fine_tuning_ready_gemini_brand_voice');

const systemPrefix = 'You are a senior Vietnamese marketing copywriter. Follow the user brief and write clear, conversion-focused copy.';

const brandRules = [
  'BRAND_VOICE=Hat Moc',
  'STYLE=am ap nhung tiet che',
  'RULES=khong noi qua khong bia so lieu khong dung giong giat title',
  'STRUCTURE=luon co Goc can biet va CTA mem khi phu hop',
].join(' | ');

const products = [
  ['bình giữ nhiệt thép 316', 'dân văn phòng mang cà phê đi làm', ['giữ nóng 8 giờ', 'nắp chống tràn', 'dễ vệ sinh'], 'freeship cho đơn từ 2 sản phẩm'],
  ['đèn bàn LED chống chói', 'sinh viên học khuya và làm việc tại nhà', ['3 mức sáng', 'cổ đèn linh hoạt', 'tiết kiệm điện'], 'giảm 10 phần trăm cho khách mới'],
  ['bộ chăm sóc da tối giản', 'người mới bắt đầu skincare', ['3 bước dễ theo', 'kết cấu nhẹ', 'dùng hằng ngày'], 'tặng túi du lịch mini'],
  ['máy xay sinh tố mini', 'người bận rộn chuẩn bị đồ uống nhanh', ['cốc mang đi', 'sạc USB', 'lưỡi dao inox'], 'đổi mới trong 7 ngày nếu lỗi kỹ thuật'],
  ['ghế công thái học lưng lưới', 'nhân viên ngồi máy tính lâu', ['đỡ lưng', 'tay ghế điều chỉnh', 'lưới thoáng'], 'tư vấn chọn size miễn phí'],
  ['nồi chiên không dầu dung tích 6 lít', 'gia đình muốn nấu nhanh gọn', ['khay chống dính', 'hẹn giờ', 'dễ lau chùi'], 'kèm sổ công thức điện tử'],
  ['balo laptop chống nước', 'người đi làm di chuyển nhiều', ['ngăn laptop 15 inch', 'vải chống nước', 'đệm vai êm'], 'miễn phí đổi màu trong 3 ngày'],
  ['tai nghe không dây chống ồn', 'người cần tập trung khi làm việc', ['chống ồn chủ động', 'pin 30 giờ', 'micro rõ'], 'bảo hành chính hãng 12 tháng'],
  ['khóa cửa thông minh', 'chủ căn hộ muốn kiểm soát ra vào', ['mở bằng vân tay', 'mã số tạm thời', 'cảnh báo pin yếu'], 'lắp đặt ưu đãi trong nội thành'],
  ['thảm yoga chống trượt', 'người tập tại nhà', ['bề mặt bám tốt', 'dày 6 mm', 'dễ cuộn gọn'], 'tặng dây đeo thảm'],
  ['máy lọc không khí phòng ngủ', 'gia đình có trẻ nhỏ', ['màng lọc HEPA', 'chế độ ngủ yên tĩnh', 'cảm biến bụi'], 'tư vấn diện tích phòng miễn phí'],
  ['ví da mini nhiều ngăn', 'người thích phụ kiện gọn gàng', ['da mềm', 'nhiều ngăn thẻ', 'kích thước nhỏ'], 'khắc tên theo yêu cầu'],
  ['áo khoác chống nắng UV', 'nữ đi làm di chuyển ban ngày', ['vải nhẹ', 'che phủ tốt', 'màu trung tính'], 'tặng túi giặt khi mua trong tuần'],
  ['bộ hộp cơm giữ nhiệt', 'người mang cơm đi làm', ['3 ngăn riêng', 'giữ ấm vừa đủ', 'dễ rửa'], 'tặng muỗng đũa inox'],
  ['sữa rửa mặt dịu nhẹ', 'da nhạy cảm mới đổi routine', ['không làm căng da', 'bọt mịn', 'dùng sáng tối'], 'tặng khăn mặt cotton'],
  ['kệ sách lắp ghép', 'người ở căn hộ nhỏ', ['dễ lắp', 'tận dụng góc trống', 'màu trung tính'], 'hỗ trợ video hướng dẫn lắp đặt'],
];

const trainCombos = [
  ['headline', 'urgent'],
  ['headline', 'friendly'],
  ['description', 'professional'],
  ['description', 'emotional'],
  ['social', 'friendly'],
  ['social', 'urgent'],
  ['email', 'professional'],
  ['cta', 'friendly'],
];

const holdoutProducts = [
  ['máy pha cà phê capsule', 'người thích cà phê nhanh tại nhà', ['pha nhanh', 'dễ vệ sinh', 'thiết kế gọn'], 'tặng hộp capsule dùng thử'],
  ['kem chống nắng nâng tông nhẹ', 'người đi làm cần lớp nền tự nhiên', ['thấm nhanh', 'không bí da', 'dùng hằng ngày'], 'mua 2 tặng 1 minisize'],
  ['bộ dao bếp inox', 'người nấu ăn tại nhà', ['cầm chắc tay', 'dễ rửa', 'đủ size cơ bản'], 'tặng thanh mài dao'],
  ['loa bluetooth chống nước', 'người nghe nhạc khi du lịch', ['chống nước nhẹ', 'âm lượng ổn định', 'pin dùng lâu'], 'bảo hành 6 tháng'],
  ['máy sấy tóc ion âm', 'người tóc dễ xơ sau khi gội', ['3 mức nhiệt', 'đầu sấy hẹp', 'gió ổn định'], 'tặng lược gỡ rối'],
  ['túi tote canvas có ngăn laptop', 'người đi học đi làm cần túi gọn', ['ngăn laptop riêng', 'vải dày', 'dễ phối đồ'], 'giảm 15 phần trăm cho màu mới'],
];

const holdoutCombos = [
  ['headline', 'professional'],
  ['description', 'friendly'],
  ['social', 'emotional'],
  ['email', 'urgent'],
];

function normalizeToken(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function inputFor(type, tone, product, audience, features, offer) {
  return [
    `TYPE=${type}`,
    'INDUSTRY=ecommerce',
    `TONE=${tone}`,
    `PRODUCT=${product}`,
    `AUDIENCE=${audience}`,
    `FEATURES=${features.join(' ; ')}`,
    `OFFER=${offer}`,
    brandRules,
  ].join(' | ');
}

function toneLine(tone) {
  const map = {
    urgent: 'nhắc thời điểm mua nhưng không gây áp lực.',
    friendly: 'nói gần gũi như đang tư vấn cho người quen.',
    professional: 'giữ câu chữ chắc và đi thẳng vào nhu cầu.',
    emotional: 'gợi cảm giác yên tâm thay vì đẩy cảm xúc quá mạnh.',
  };
  return map[tone] || 'giữ giọng rõ ràng và tiết chế.';
}

function outputFor(type, tone, product, audience, features, offer) {
  const featureText = features.join(' ; ');
  const productToken = normalizeToken(product);

  if (type === 'headline') {
    return [
      `Headline: ${product} cho ${audience}`,
      `Lý do chọn: ${featureText}.`,
      `Góc cần biết: Giọng Hat Moc ${toneLine(tone)} Không thêm cam kết ngoài brief.`,
      `CTA mềm: Nhắn shop hỏi thêm trước khi chọn ${productToken}.`,
    ].join(' | ');
  }

  if (type === 'description') {
    return [
      `Phù hợp với: ${audience} muốn một lựa chọn dễ dùng và không cần đọc quá nhiều thông tin rối.`,
      `Điểm nổi bật: ${product} có ${featureText}.`,
      `Góc cần biết: Nội dung chỉ dùng dữ kiện trong brief. Nếu cần so sánh thêm thì nên hỏi shop trước khi mua.`,
      `CTA mềm: Lưu lại sản phẩm hoặc nhắn shop để được tư vấn đúng nhu cầu ${productToken}.`,
    ].join(' | ');
  }

  if (type === 'social') {
    return [
      `Mở bài: Có những món không cần nói quá nhiều vẫn thấy hợp nhu cầu hằng ngày.`,
      `Điểm đáng cân nhắc: ${product} dành cho ${audience} với ${featureText}.`,
      `Góc cần biết: ${offer}. Hat Moc ưu tiên nói rõ lợi ích và tránh tạo cảm giác phải mua ngay.`,
      `CTA mềm: Nếu đang phân vân thì nhắn shop hỏi thêm trước khi chọn.`,
    ].join(' | ');
  }

  if (type === 'email') {
    return [
      `Subject: Gợi ý ${product} cho nhu cầu hằng ngày`,
      `Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua.`,
      `Nội dung: Nếu bạn là ${audience} thì ${product} là lựa chọn đáng xem nhờ ${featureText}. Ưu đãi hiện có là ${offer}.`,
      `Góc cần biết: Email này không phóng đại hiệu quả và không thêm số liệu ngoài brief.`,
      `CTA mềm: Xem chi tiết rồi chọn khi thấy thật sự phù hợp.`,
    ].join(' | ');
  }

  return [
    `CTA chính: Xem ${product} phù hợp với bạn không`,
    `Microcopy: Có ${featureText}. ${offer}.`,
    `Góc cần biết: Chọn khi đúng nhu cầu; không cần mua vội.`,
  ].join(' | ');
}

function buildRows(items, combos) {
  const rows = [];
  for (const [product, audience, features, offer] of items) {
    for (const [type, tone] of combos) {
      rows.push({
        input: inputFor(type, tone, product, audience, features, offer),
        output: outputFor(type, tone, product, audience, features, offer),
        industry: 'ecommerce',
        tone,
        type,
        product,
      });
    }
  }
  return rows;
}

function csvCell(value) {
  return String(value || '')
    .replace(/\r?\n/g, ' ')
    .replace(/,/g, ' ;')
    .trim();
}

function toCsv(rows) {
  const header = 'input,output,industry,tone';
  return `${header}\n${rows.map((row) => [row.input, row.output, row.industry, row.tone].map(csvCell).join(',')).join('\n')}\n`;
}

function toVertexJsonl(rows) {
  return `${rows.map((row) => JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrefix}\n\nBrief:\n${row.input}` }],
      },
      {
        role: 'model',
        parts: [{ text: row.output }],
      },
    ],
  })).join('\n')}\n`;
}

function holdoutPrompt(row) {
  return [
    `Viết ${row.type} cho sản phẩm ${row.product}.`,
    `Đối tượng: ${row.input.match(/AUDIENCE=([^|]+)/)?.[1].trim() || 'khách hàng ecommerce'}.`,
    `Lợi ích chính: ${row.input.match(/FEATURES=([^|]+)/)?.[1].trim() || 'theo brief'}.`,
    `Ưu đãi: ${row.input.match(/OFFER=([^|]+)/)?.[1].trim() || 'không có'}.`,
    `Tone: ${row.tone}.`,
    'Không cần giải thích quá trình viết.',
  ].join('\n');
}

function buildPromptDoc(rows) {
  const sections = [
    '# Prompt test trước và sau fine-tuning Gemini',
    '',
    'Cách dùng đúng: chạy cùng một prompt hai lần. Lần trước dùng Gemini base. Lần sau chọn model Gemini đã fine-tune và giữ nguyên prompt. Không thêm brand rule vào prompt test vì như vậy base model cũng có thể bắt chước.',
    '',
    'Dấu hiệu sau fine-tune nên thấy rõ: output có các nhãn kiểu `Góc cần biết` và `CTA mềm`, giọng tư vấn tiết chế, ít hype, không tự bịa số liệu, thường có câu nhắc hỏi shop hoặc chọn khi đúng nhu cầu.',
    '',
  ];

  rows.forEach((row, index) => {
    const id = `T-${String(index + 1).padStart(3, '0')}`;
    sections.push(`## ${id} - ${row.type} - ${row.product}`);
    sections.push('');
    sections.push('### Trước fine-tuning');
    sections.push('Chọn model base `gemini-flash` hoặc `gemini-2.5-flash`, rồi paste prompt này:');
    sections.push('```text');
    sections.push(holdoutPrompt(row));
    sections.push('```');
    sections.push('');
    sections.push('### Sau fine-tuning');
    sections.push('Chọn model fine-tuned đã promote trong Generator, rồi paste lại đúng prompt trên. Prompt không đổi; chỉ đổi model.');
    sections.push('');
    sections.push('### Output mong đợi sau fine-tuning');
    sections.push('```text');
    sections.push(row.output);
    sections.push('```');
    sections.push('');
  });

  return `${sections.join('\n')}\n`;
}

function buildReadme(trainRows, holdoutRows) {
  return `# Gemini Fine-tuning Pack - Hat Moc Brand Voice\n\n` +
    `Bộ này dùng để tạo khác biệt rõ hơn giữa Gemini base và Gemini đã fine-tune. Dataset cũ quá ngắn nên model chỉ học rất nhẹ. Bộ mới có ${trainRows.length} mẫu train và ${holdoutRows.length} prompt holdout không nằm trong train.\n\n` +
    `## Brand voice cần học\n\n` +
    `- Tư vấn ấm nhưng tiết chế.\n` +
    `- Không hype kiểu \"đừng bỏ lỡ\" hoặc \"siêu phẩm\".\n` +
    `- Không tự bịa số liệu hoặc chứng nhận.\n` +
    `- Hay dùng nhãn \"Góc cần biết\" và \"CTA mềm\".\n` +
    `- CTA thiên về hỏi thêm hoặc chọn khi đúng nhu cầu.\n\n` +
    `## File trong pack\n\n` +
    `- 01_train_app_import.csv: import vào app theo cột input, output, industry, tone.\n` +
    `- 02_train_vertex_gemini.jsonl: bản tham chiếu theo format Vertex Gemini supervised tuning.\n` +
    `- 03_holdout_prompts_before_after.md: prompt test trước/sau và output mục tiêu sau fine-tune.\n` +
    `- 04_eval_scorecard.csv: bảng chấm nhanh để so base và tuned.\n\n` +
    `## Cách test để thấy khác biệt\n\n` +
    `1. Chạy các prompt trong 03_holdout_prompts_before_after.md bằng model base và lưu output.\n` +
    `2. Import 01_train_app_import.csv vào dataset mới.\n` +
    `3. Tạo job provider vertex-gemini với base gemini-2.5-flash.\n` +
    `4. Khi job completed, promote/active model.\n` +
    `5. Chạy lại đúng prompt holdout bằng model fine-tuned.\n` +
    `6. Chấm theo 04_eval_scorecard.csv.\n\n` +
    `Lưu ý: nếu prompt test đã ghi quá chi tiết brand voice thì base model cũng sẽ bắt chước được. Muốn kiểm tra fine-tune thật, prompt test phải ngắn và giữ nguyên giữa trước/sau.\n`;
}

function buildScorecard(rows) {
  const header = 'prompt_id,type,product,base_has_goc_can_biet,base_has_cta_mem,tuned_has_goc_can_biet,tuned_has_cta_mem,tuned_less_hype,notes';
  const body = rows.map((row, index) => [
    `T-${String(index + 1).padStart(3, '0')}`,
    row.type,
    row.product,
    '',
    '',
    '',
    '',
    '',
    '',
  ].map(csvCell).join(',')).join('\n');
  return `${header}\n${body}\n`;
}

function buildManifest(trainRows, holdoutRows) {
  return JSON.stringify({
    name: 'gemini-hat-moc-brand-voice-pack',
    generatedAt: new Date().toISOString(),
    provider: 'vertex-gemini',
    recommendedBaseModel: 'gemini-2.5-flash',
    trainExamples: trainRows.length,
    holdoutPrompts: holdoutRows.length,
    files: [
      '01_train_app_import.csv',
      '02_train_vertex_gemini.jsonl',
      '03_holdout_prompts_before_after.md',
      '04_eval_scorecard.csv',
      'README_GEMINI_FINE_TUNING.md',
    ],
  }, null, 2);
}

const trainRows = buildRows(products, trainCombos);
const holdoutRows = buildRows(holdoutProducts, holdoutCombos);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '01_train_app_import.csv'), toCsv(trainRows), 'utf8');
fs.writeFileSync(path.join(outDir, '02_train_vertex_gemini.jsonl'), toVertexJsonl(trainRows), 'utf8');
fs.writeFileSync(path.join(outDir, '03_holdout_prompts_before_after.md'), buildPromptDoc(holdoutRows), 'utf8');
fs.writeFileSync(path.join(outDir, '04_eval_scorecard.csv'), buildScorecard(holdoutRows), 'utf8');
fs.writeFileSync(path.join(outDir, 'README_GEMINI_FINE_TUNING.md'), buildReadme(trainRows, holdoutRows), 'utf8');
fs.writeFileSync(path.join(outDir, 'manifest.json'), buildManifest(trainRows, holdoutRows), 'utf8');

console.log(`Wrote ${trainRows.length} train examples and ${holdoutRows.length} holdout prompts to ${outDir}`);
