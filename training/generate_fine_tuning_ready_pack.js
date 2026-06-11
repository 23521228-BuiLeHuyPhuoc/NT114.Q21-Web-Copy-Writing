const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'fine_tuning_ready_vi_huggingface');
const systemPrompt = 'Bạn là copywriter marketing tiếng Việt. Viết rõ ràng, có dấu đúng, đúng sự thật, không bịa số liệu, không phóng đại và luôn giữ CTA mềm phù hợp ngữ cảnh.';

const products = [
  ['bình giữ nhiệt thép 316', 'dân văn phòng mang cà phê đi làm', ['giữ nóng 8 giờ', 'nắp chống tràn', 'dễ vệ sinh'], 'freeship cho đơn từ 2 sản phẩm'],
  ['đèn bàn LED chống chói', 'sinh viên học khuya và làm việc tại nhà', ['3 mức sáng', 'cổ đèn linh hoạt', 'tiết kiệm điện'], 'giảm 10 phần trăm cho khách mới'],
  ['bộ chăm sóc da tối giản', 'người mới bắt đầu skincare', ['3 bước dễ theo', 'kết cấu nhẹ', 'phù hợp dùng hằng ngày'], 'tặng túi du lịch mini'],
  ['máy xay sinh tố mini', 'người bận rộn muốn chuẩn bị đồ uống nhanh', ['cốc mang đi', 'sạc USB', 'lưỡi dao inox'], 'đổi mới trong 7 ngày nếu lỗi kỹ thuật'],
  ['ghế công thái học lưng lưới', 'nhân viên ngồi máy tính lâu', ['đỡ lưng', 'tay ghế điều chỉnh', 'lưới thoáng'], 'hỗ trợ tư vấn chọn size'],
  ['nồi chiên không dầu dung tích 6 lít', 'gia đình muốn nấu nhanh gọn', ['khay chống dính', 'hẹn giờ', 'dễ lau chùi'], 'kèm sổ công thức điện tử'],
  ['balo laptop chống nước', 'người đi làm di chuyển nhiều', ['ngăn laptop 15 inch', 'vải chống nước', 'đệm vai êm'], 'miễn phí đổi màu trong 3 ngày'],
  ['tai nghe không dây chống ồn', 'người cần tập trung khi làm việc', ['chống ồn chủ động', 'pin 30 giờ', 'micro rõ'], 'bảo hành chính hãng 12 tháng'],
  ['khóa cửa thông minh', 'chủ căn hộ muốn kiểm soát ra vào', ['mở bằng vân tay', 'mã số tạm thời', 'cảnh báo pin yếu'], 'lắp đặt ưu đãi trong nội thành'],
  ['thảm yoga chống trượt', 'người tập tại nhà', ['bề mặt bám tốt', 'dày 6 mm', 'dễ cuộn gọn'], 'tặng dây đeo thảm'],
  ['máy lọc không khí phòng ngủ', 'gia đình có trẻ nhỏ', ['màng lọc HEPA', 'chế độ ngủ yên tĩnh', 'cảm biến bụi'], 'tư vấn diện tích phòng miễn phí'],
  ['ví da mini nhiều ngăn', 'người thích phụ kiện gọn gàng', ['da mềm', 'nhiều ngăn thẻ', 'kích thước nhỏ'], 'khắc tên theo yêu cầu'],
];

const trainCombos = [
  ['headline', 'urgent'],
  ['headline', 'friendly'],
  ['description', 'emotional'],
  ['description', 'professional'],
  ['social', 'friendly'],
  ['social', 'urgent'],
  ['email', 'professional'],
  ['cta', 'friendly'],
];

const holdoutProducts = [
  ['máy pha cà phê capsule', 'người thích cà phê nhanh tại nhà', ['pha nhanh', 'dễ vệ sinh', 'thiết kế gọn'], 'tặng hộp capsule dùng thử'],
  ['kem chống nắng nâng tông nhẹ', 'người đi làm cần lớp nền tự nhiên', ['thấm nhanh', 'không bí da', 'dùng hằng ngày'], 'mua 2 tặng 1 minisize'],
  ['kệ sách lắp ghép', 'người ở căn hộ nhỏ', ['dễ lắp', 'tối ưu góc trống', 'màu trung tính'], 'hỗ trợ hướng dẫn lắp đặt'],
  ['bộ dao bếp inox', 'người nấu ăn tại nhà', ['cầm chắc tay', 'dễ rửa', 'đủ size cơ bản'], 'tặng thanh mài dao'],
  ['loa bluetooth chống nước', 'người thích nghe nhạc khi du lịch', ['chống nước nhẹ', 'âm lượng ổn định', 'pin dùng lâu'], 'bảo hành 6 tháng'],
];

const holdoutCombos = [
  ['headline', 'professional'],
  ['description', 'friendly'],
  ['social', 'emotional'],
  ['email', 'urgent'],
];

function brandRules() {
  return 'viết rõ ràng có dấu đúng sự thật không bịa số liệu không phóng đại CTA mềm';
}

function inputFor(type, tone, product, audience, features, offer) {
  return [
    `TYPE=${type}`,
    'INDUSTRY=ecommerce',
    `TONE=${tone}`,
    `PRODUCT=${product}`,
    `AUDIENCE=${audience}`,
    `FEATURES=${features.join('; ')}`,
    `OFFER=${offer}`,
    `BRAND_RULES=${brandRules()}`,
  ].join(' | ');
}

function outputFor(type, tone, product, audience, features, offer) {
  const featureText = features.join('; ');
  const toneNote = tone === 'urgent'
    ? 'giữ nhịp khẩn trương nhưng không gây áp lực'
    : tone === 'professional'
      ? 'giữ giọng tin cậy và gọn ý'
      : tone === 'emotional'
        ? 'gợi cảm giác yên tâm và gần gũi'
        : 'giữ giọng thân thiện dễ đọc';

  if (type === 'headline') {
    return `Headline: ${product} cho ${audience} | Subheadline: Lựa chọn thực tế với ${featureText}; ${toneNote}. | CTA: Xem lựa chọn phù hợp hôm nay.`;
  }
  if (type === 'description') {
    return `Mô tả ngắn: ${product} dành cho ${audience}; tập trung vào trải nghiệm dùng hằng ngày và thông tin rõ ràng. | Lợi ích chính: - Hỗ trợ nhu cầu thực tế nhờ ${featureText}. - Dễ bắt đầu và dễ duy trì trong sinh hoạt thường ngày. | Điểm cần biết: Nội dung không bịa chứng nhận hay con số ngoài brief. | CTA: Nhắn tin để được tư vấn lựa chọn phù hợp.`;
  }
  if (type === 'social') {
    return `Hook: ${audience} thường cần một lựa chọn đơn giản mà dùng được lâu. | Caption: ${product} giúp việc hằng ngày nhẹ hơn nhờ ${featureText}. Giọng viết rõ lợi ích; không nói quá và không tạo cảm giác ép mua. | Ưu đãi: ${offer}. | CTA: Lưu lại hoặc nhắn shop để hỏi thêm trước khi chọn.`;
  }
  if (type === 'email') {
    return `Subject: Gợi ý ${product} cho nhu cầu hằng ngày | Preview text: Thông tin ngắn gọn để bạn cân nhắc trước khi mua. | Nội dung chính: Nếu bạn là ${audience}; ${product} có thể là lựa chọn đáng cân nhắc nhờ ${featureText}. Ưu đãi hiện có: ${offer}. | CTA: Xem chi tiết và chọn phiên bản phù hợp.`;
  }
  return `CTA chính: Xem ${product} phù hợp với bạn | Microcopy: Có ${featureText}; ${offer}; thông tin rõ ràng để bạn cân nhắc trước khi mua.`;
}

function buildExamples(items, combos) {
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
  return String(value || '').replace(/\r?\n/g, ' ').replace(/,/g, ';').trim();
}

function toCsv(rows) {
  const header = 'input,output,industry,tone';
  return `${header}\n${rows.map((row) => [row.input, row.output, row.industry, row.tone].map(csvCell).join(',')).join('\n')}\n`;
}

function toJsonl(rows) {
  return `${rows.map((row) => JSON.stringify({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: row.input },
      { role: 'assistant', content: row.output },
    ],
    metadata: {
      industry: row.industry,
      tone: row.tone,
      type: row.type,
      product: row.product,
    },
  })).join('\n')}\n`;
}

function testPrompts() {
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
      prompts.push({
        prompt: inputFor(type, tones[(itemIndex + typeIndex) % tones.length], item[0], item[1], item[2], item[3]),
        expected_focus: 'Giữ tiếng Việt có dấu; đúng format theo TYPE; không bịa chứng nhận hay số liệu; CTA mềm.',
      });
    });
  });
  return prompts;
}

function writeFile(name, content) {
  fs.writeFileSync(path.join(outDir, name), content, 'utf8');
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const trainRows = buildExamples(products, trainCombos);
  const validationRows = buildExamples(holdoutProducts, holdoutCombos);
  const prompts = testPrompts();
  writeFile('01_train_examples_for_app_import_utf8.csv', toCsv(trainRows));
  writeFile('02_train_huggingface_chat_utf8.jsonl', toJsonl(trainRows));
  writeFile('03_validation_holdout_chat_utf8.jsonl', toJsonl(validationRows));
  writeFile('04_validation_holdout_for_review_utf8.csv', toCsv(validationRows));
  writeFile('05_test_prompts_after_finetune_utf8.csv', `prompt,expected_focus\n${prompts.map((row) => `${csvCell(row.prompt)},${csvCell(row.expected_focus)}`).join('\n')}\n`);
  writeFile('copy_paste_test_prompts.md', prompts.map((row, index) => `## Prompt ${index + 1}\n\n${row.prompt}\n\nKỳ vọng: ${row.expected_focus}\n`).join('\n'));
  writeFile('README_FINE_TUNING_UTF8.md', [
    '# Fine-tuning Ready Pack - Vietnamese Brand Voice',
    '',
    'Pack này thay thế pack cũ bị mất dấu tiếng Việt trong CSV.',
    '',
    '## Dùng trong app /fine-tune',
    '',
    '1. Mở trang `/fine-tune`.',
    '2. Chọn provider `Hugging Face Llama Fine-tuning`.',
    '3. Chọn `Llama 3.2 1B Instruct` để test nhẹ trước.',
    '4. Import file `01_train_examples_for_app_import_utf8.csv`.',
    '5. Bấm `Bắt đầu Fine-tuning`.',
    '',
    '## Dùng ngoài app với Colab hoặc Kaggle',
    '',
    '- Train file: `02_train_huggingface_chat_utf8.jsonl`.',
    '- Validation file: `03_validation_holdout_chat_utf8.jsonl`.',
    '- Prompt test sau fine-tune: `copy_paste_test_prompts.md`.',
    '',
    '## Lưu ý',
    '',
    '- CSV được cố tình tránh dấu phẩy trong nội dung vì parser import hiện tại của UI tách đơn giản theo dấu phẩy.',
    '- JSONL giữ nguyên Unicode tiếng Việt và phù hợp để dùng với SFT/LoRA chat format.',
    '- Dataset này dạy giọng viết và format thương mại điện tử; không làm model thông minh tổng quát hơn.',
    '',
  ].join('\n'));
  writeFile('manifest.json', JSON.stringify({
    output_dir: outDir,
    encoding: 'utf-8',
    train_examples: trainRows.length,
    validation_examples: validationRows.length,
    test_prompts: prompts.length,
    target_provider: 'huggingface',
    recommended_base_model: 'meta-llama/Llama-3.2-1B-Instruct',
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
  console.log(JSON.stringify({ outDir, train: trainRows.length, validation: validationRows.length, prompts: prompts.length }, null, 2));
}

main();
