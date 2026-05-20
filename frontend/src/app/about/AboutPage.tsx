import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Heart, Zap, Users, Award,
  TrendingUp, Globe, Shield, ArrowRight,
  CheckCircle2, Linkedin, Twitter,
} from 'lucide-react';

const TEAM = [
  { name: 'Nguyễn Minh Trí', role: 'CEO & Co-founder', desc: '10+ năm kinh nghiệm AI/ML tại Google, VNG', avatar: 'NT', bg: 'from-green-600 to-emerald-700' },
  { name: 'Lê Thu Hằng', role: 'CTO & Co-founder', desc: 'PhD Machine Learning, ex-Shopee Engineering Lead', avatar: 'LH', bg: 'from-stone-600 to-stone-700' },
  { name: 'Trần Quốc Bảo', role: 'Head of Product', desc: '8 năm Product Management tại các startup unicorn', avatar: 'TB', bg: 'from-emerald-600 to-green-700' },
  { name: 'Phạm Thị Lan', role: 'Head of Marketing', desc: 'Chuyên gia digital marketing với 200+ dự án thành công', avatar: 'PL', bg: 'from-green-700 to-stone-700' },
  { name: 'Hoàng Văn Đức', role: 'Lead AI Engineer', desc: 'Chuyên gia Fine-tuning LLM, 50+ mô hình đã triển khai', avatar: 'HĐ', bg: 'from-stone-600 to-stone-700' },
  { name: 'Vũ Bích Ngọc', role: 'Head of Customer Success', desc: 'Xây dựng và phát triển cộng đồng 2,000+ khách hàng', avatar: 'VN', bg: 'from-green-500 to-emerald-600' },
];

const VALUES = [
  { icon: Target, title: 'Sứ mệnh rõ ràng', desc: 'Dân chủ hóa copywriting chuyên nghiệp — giúp mọi doanh nghiệp Việt Nam tiếp cận AI tiên tiến với chi phí hợp lý.', color: 'bg-green-100 text-green-700' },
  { icon: Eye, title: 'Minh bạch tuyệt đối', desc: 'Không chi phí ẩn, không hứa hẹn viển vông. Chúng tôi cam kết kết quả đo lường được và được kiểm chứng bởi hàng nghìn khách hàng thực.', color: 'bg-emerald-100 text-emerald-700' },
  { icon: Zap, title: 'Đổi mới liên tục', desc: 'Cập nhật model mới nhất (GPT-4o, Llama 3.1), tính năng mới mỗi tháng, luôn đi trước xu hướng công nghệ AI toàn cầu.', color: 'bg-stone-100 text-stone-700' },
  { icon: Heart, title: 'Khách hàng là trung tâm', desc: 'Mỗi tính năng được xây dựng dựa trên phản hồi thực tế. Hỗ trợ tận tâm 24/7, không bao giờ để khách hàng bị bỏ lại phía sau.', color: 'bg-green-100 text-green-700' },
];

const MILESTONES = [
  { year: '2023', title: 'Thành lập CopyPro', desc: 'Ra mắt phiên bản beta với 50 người dùng đầu tiên, tích hợp GPT-3.5.' },
  { year: 'Q1 2024', title: 'Series A Funding', desc: 'Gọi vốn thành công 2 triệu USD, mở rộng team lên 20 nhân sự.' },
  { year: 'Q3 2024', title: '1,000 khách hàng', desc: 'Đạt mốc 1,000 khách hàng trả phí, ra mắt GPT-4o integration.' },
  { year: 'Q1 2025', title: 'Fine-tuning Studio', desc: 'Tính năng fine-tuning độc quyền — lần đầu tiên tại Việt Nam.' },
  { year: 'Q3 2025', title: 'Llama 3.1 & API', desc: 'Tích hợp Llama 3.1 self-hosted và mở RESTful API cho developers.' },
  { year: '2026', title: '2,000+ doanh nghiệp', desc: 'Hiện phục vụ 2,000+ doanh nghiệp Việt Nam, 500K+ copy đã tạo.' },
];

const PARTNERS = [
  { name: 'OpenAI', badge: 'API Partner' },
  { name: 'Meta AI', badge: 'Llama Partner' },
  { name: 'AWS Vietnam', badge: 'Cloud Partner' },
  { name: 'Google Cloud', badge: 'Technology Partner' },
  { name: 'VietCapital', badge: 'Investor' },
  { name: 'Mekong Capital', badge: 'Investor' },
];

const STATS = [
  { value: '2,000+', label: 'Doanh nghiệp tin dùng', icon: Users },
  { value: '500K+', label: 'Copy đã tạo', icon: TrendingUp },
  { value: '15+', label: 'Ngành nghề hỗ trợ', icon: Globe },
  { value: '99.8%', label: 'Uptime hệ thống', icon: Shield },
  { value: '4.9/5', label: 'Đánh giá khách hàng', icon: Award },
  { value: '< 2s', label: 'Thời gian phản hồi AI', icon: Zap },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-gray-950 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.15),transparent)]" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-green-900/60 text-green-300 border border-green-700/50 px-4 py-1.5 backdrop-blur">
              🌱 Câu chuyện của chúng tôi
            </Badge>
            <h1
              className="text-white mb-6"
            >
              Xây dựng tương lai
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Copywriting bằng AI
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              CopyPro ra đời từ một câu hỏi đơn giản: <em>"Tại sao marketer Việt Nam phải mất hàng giờ để viết một đoạn copy, trong khi AI có thể làm trong vài giây?"</em> Chúng tôi đã xây dựng câu trả lời đó.
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 border-0">Tầm nhìn & Sứ mệnh</Badge>
              <h2 className="text-gray-900 mb-6">
                Dân chủ hóa copywriting chuyên nghiệp cho mọi doanh nghiệp Việt Nam
              </h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="bg-green-100 p-3 rounded-xl flex-shrink-0 h-fit">
                    <Target className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">Sứ mệnh</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Cung cấp công nghệ AI copywriting tiên tiến nhất, được tối ưu cho văn hóa và ngôn ngữ Việt Nam, với chi phí phù hợp cho mọi quy mô doanh nghiệp.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl flex-shrink-0 h-fit">
                    <Eye className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-1">Tầm nhìn 2030</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Trở thành nền tảng AI copywriting số 1 Đông Nam Á, phục vụ 500,000+ doanh nghiệp và marketer trên toàn khu vực.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                alt="CopyPro team office"
                className="w-full h-80 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <p className="text-3xl font-bold text-green-600">2,000+</p>
                <p className="text-sm text-gray-500 mt-0.5">doanh nghiệp tin dùng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <p
                    className="text-2xl font-bold text-gray-900 mb-1"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">Giá trị cốt lõi</Badge>
            <h2 className="text-gray-900 mb-4">Những điều chúng tôi tin tưởng</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Mỗi quyết định sản phẩm, mỗi dòng code, mỗi cuộc trò chuyện với khách hàng đều được định hướng bởi bốn giá trị cốt lõi này.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl ${v.color} mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-gray-900 mb-3">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">Hành trình</Badge>
            <h2 className="text-gray-900 mb-4">Từ ý tưởng đến 2,000+ khách hàng</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-200 via-green-400 to-emerald-200 md:-translate-x-px" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 md:w-5/12 pl-14 md:pl-0 ${i % 2 === 0 ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}>
                    <div className={`bg-gray-50 hover:bg-green-50/50 border border-gray-100 hover:border-green-200 rounded-2xl p-6 transition-all ${i % 2 === 0 ? '' : ''}`}>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{m.year}</span>
                      <h4 className="text-gray-900 mt-1 mb-2">{m.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-3 md:left-1/2 md:-translate-x-1/2 top-6 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-green-100 text-green-700 border-0">Đội ngũ</Badge>
            <h2 className="text-gray-900 mb-4">Những con người tạo nên CopyPro</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Đội ngũ của chúng tôi kết hợp chuyên môn AI hàng đầu, kinh nghiệm startup thực chiến và đam mê phát triển cộng đồng marketer Việt Nam.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {member.avatar}
                  </div>
                  <div>
                    <h4 className="text-gray-900">{member.name}</h4>
                    <p className="text-green-600 text-xs font-semibold mt-0.5">{member.role}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{member.desc}</p>
                <div className="flex gap-2 mt-4">
                  <a href="#" className="text-gray-400 hover:text-stone-600 transition-colors"><Linkedin className="w-4 h-4" /></a>
                  <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors"><Twitter className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
            Đối tác & Nhà đầu tư tin tưởng
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all text-center"
              >
                <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px]">{p.badge}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREERS ── */}
      <section id="careers" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 border-0">Tuyển dụng</Badge>
          <h2 className="text-gray-900 mb-4">Gia nhập đội ngũ CopyPro</h2>
          <p className="text-gray-600 mb-8 text-base leading-relaxed">
            Chúng tôi đang tìm kiếm những người tài năng, đam mê AI và muốn tạo ra tác động thực sự cho cộng đồng doanh nghiệp Việt Nam.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            {[
              { role: 'Senior AI Engineer', type: 'Full-time · HCM', hot: true },
              { role: 'Product Designer', type: 'Full-time · Remote', hot: false },
              { role: 'Content Strategist', type: 'Full-time · HCM', hot: true },
            ].map((j) => (
              <div
                key={j.role}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-gray-900 text-sm">{j.role}</h4>
                  {j.hot && <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Hot</Badge>}
                </div>
                <p className="text-xs text-gray-500">{j.type}</p>
              </div>
            ))}
          </div>
          <Link to="/contact">
            <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 py-3.5 text-sm font-bold transition-colors shadow-md shadow-green-200">
              Ứng tuyển ngay <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
