import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, Download, Edit2, Trash2, Star,
  Calendar, Clock, Cpu, FileText, RefreshCw, Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useContent } from '@/hooks/queries/useContents';
import { Markdown } from '@/app/components/common/Markdown';

export function CustomerContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: content } = useContent(id ?? '');

  if (!content) {
    return (
      <Layout>
        <div className="p-6 max-w-5xl mx-auto" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Back */}
        <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/contents')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-0">Đã xuất bản</Badge>
              <Badge className="bg-muted text-foreground/70 border-0">{content.type}</Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-0">{content.model}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />{content.createdAt} · {content.industry} · {content.project}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1.5" /> Chỉnh sửa</Button>
            <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-1.5" /> Chia sẻ</Button>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Nội dung</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(content.content); toast.success('Đã sao chép!'); }}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Sao chép
                  </Button>
                  <Button size="sm" variant="outline"><Download className="w-3.5 h-3.5 mr-1.5" /> Tải xuống</Button>
                </div>
              </div>
              <div className="bg-surface-muted rounded-xl p-5 border text-sm text-foreground leading-relaxed">
                <Markdown>{content.content}</Markdown>
              </div>
            </Card>

            {/* Versions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Phiên bản</h3>
              <div className="flex gap-3">
                {content.versions.map(v => (
                  <div key={v.id} className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${v.selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                    <p className="text-sm font-semibold text-foreground">{v.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Chất lượng: <span className="text-primary font-semibold">{v.quality}%</span></p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Regenerate */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Tạo lại nội dung</h3>
                  <p className="text-sm text-foreground/70">Tạo phiên bản mới với cùng cấu hình hoặc chỉnh sửa tham số</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <RefreshCw className="w-4 h-4 mr-2" /> Tạo lại
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Thông tin chi tiết</h3>
              <div className="space-y-3">
                {[
                  { label: 'Ngành nghề', value: content.industry },
                  { label: 'Loại nội dung', value: content.type },
                  { label: 'Tone giọng', value: content.tone },
                  { label: 'Model AI', value: content.model },
                  { label: 'Số từ', value: `${content.words} từ` },
                  { label: 'Tokens', value: content.tokens.toString() },
                  { label: 'Thời gian xử lý', value: content.latency },
                  { label: 'Dự án', value: content.project || '—' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Điểm chất lượng</h3>
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-3">
                  <span className="text-2xl font-bold text-primary">{content.quality}%</span>
                </div>
                <p className="text-sm text-foreground/70">Chất lượng tốt</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/60'}`} />)}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Thời gian</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạo lúc</span>
                  <span className="text-foreground">{content.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cập nhật</span>
                  <span className="text-foreground">{content.updatedAt}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
