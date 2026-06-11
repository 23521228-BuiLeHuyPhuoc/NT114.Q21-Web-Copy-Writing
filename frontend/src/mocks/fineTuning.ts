export const MOCK_MODELS = [
  {
    id: 'm1', name: 'Brand Voice - Thương Mại Điện Tử', industry: 'ecommerce',
    status: 'ready', accuracy: 94, trainedOn: 120, createdAt: '15/03/2026',
    baseModel: 'Configured fine-tune model', desc: 'Được fine-tune với 120 mẫu copy e-commerce, tập trung vào tone khẩn cấp và giảm giá.',
  },
  {
    id: 'm2', name: 'Luxury Real Estate Voice', industry: 'realestate',
    status: 'training', accuracy: 0, trainedOn: 85, createdAt: '22/03/2026',
    baseModel: 'Configured fine-tune model', desc: 'Fine-tune cho bất động sản cao cấp, tone sang trọng và chuyên nghiệp.',
  },
  {
    id: 'm3', name: 'Healthcare Compassionate', industry: 'healthcare',
    status: 'ready', accuracy: 91, trainedOn: 95, createdAt: '10/03/2026',
    baseModel: 'Configured fine-tune model', desc: 'Tone nhẹ nhàng, đồng cảm và chuyên nghiệp cho ngành y tế.',
  },
];

export const EXAMPLE_PAIRS = [
  { id: 1, input: 'Áo thun cotton, giá 299k, mua hè 2026', output: '🔥 FLASH SALE HÈ! Áo Thun Cotton Siêu Mát - Chỉ 299K. Vải thở, form chuẩn, mặc cả ngày thoải mái. Số lượng giới hạn - Đặt ngay!', industry: 'ecommerce' },
  { id: 2, input: 'Căn hộ 3PN, 120m2, quận 2, view sông', output: 'Không gian sống đẳng cấp tại trung tâm Quận 2 – Căn hộ 3 phòng ngủ 120m² với tầm nhìn trực diện sông Sài Gòn. Thiết kế tinh tế, cuộc sống hoàn hảo.', industry: 'realestate' },
];

export const TRAINING_LOG = [
  { step: 'Chuẩn bị dữ liệu', status: 'done', time: '00:01:23' },
  { step: 'Tokenization', status: 'done', time: '00:03:45' },
  { step: 'Training epoch 1/5', status: 'done', time: '00:12:30' },
  { step: 'Training epoch 2/5', status: 'done', time: '00:11:55' },
  { step: 'Training epoch 3/5', status: 'running', time: '00:08:22...' },
  { step: 'Training epoch 4/5', status: 'pending', time: '-' },
  { step: 'Training epoch 5/5', status: 'pending', time: '-' },
  { step: 'Evaluation & validation', status: 'pending', time: '-' },
  { step: 'Deployment', status: 'pending', time: '-' },
];
