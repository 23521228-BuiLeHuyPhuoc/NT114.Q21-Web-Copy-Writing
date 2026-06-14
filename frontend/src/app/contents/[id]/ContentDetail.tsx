import { useNavigate, useParams } from '@/lib/next-router-compat';
import {
  ArrowLeft,
  Calendar,
  Copy,
  Download,
  Edit2,
  FileText,
  RefreshCw,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useContent, useDeleteContent } from '@/hooks/queries/useContents';
import { Markdown } from '@/app/components/common/Markdown';

export function CustomerContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: content, isError, isLoading } = useContent(id ?? '');
  const deleteContent = useDeleteContent();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteContent.mutateAsync(id);
      toast.success('Đã xóa nội dung!');
      navigate('/contents');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa nội dung';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-5xl mx-auto">
          <Card className="p-8 text-center text-muted-foreground">Đang tải nội dung...</Card>
        </div>
      </Layout>
    );
  }

  if (isError || !content) {
    return (
      <Layout>
        <div className="p-6 max-w-5xl mx-auto">
          <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/contents')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
          <Card className="p-8 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            Không tìm thấy nội dung hoặc bạn không có quyền xem nội dung này.
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/contents')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-0">Đã xuất bản</Badge>
              <Badge className="bg-muted text-foreground/70 border-0">{content.type}</Badge>
              <Badge className="max-w-full whitespace-normal bg-emerald-100 text-left text-emerald-700 border-0 leading-tight" title={content.model}>{content.model}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />{content.createdAt} · {content.industry}
              {content.project ? ` · ${content.project}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1.5" /> Chỉnh sửa</Button>
            <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-1.5" /> Chia sẻ</Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600"
              disabled={deleteContent.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
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

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Phiên bản</h3>
              <div className="flex gap-3">
                {content.versions.map(v => (
                  <div key={v.id} className={`flex-1 p-3 rounded-xl border-2 ${v.selected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <p className="text-sm font-semibold text-foreground">{v.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Chất lượng: <span className="text-primary font-semibold">{v.quality}%</span></p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-primary/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Tạo lại nội dung</h3>
                  <p className="text-sm text-foreground/70">Quay lại generator để tạo phiên bản mới với cấu hình tương tự.</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => navigate('/generate')}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Tạo lại
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Thông tin chi tiết</h3>
              <div className="space-y-3">
                {[
                  { label: 'Ngành nghề', value: content.industry },
                  { label: 'Loại nội dung', value: content.type },
                  { label: 'Tone giọng', value: content.tone || 'Không có' },
                  { label: 'Model AI', value: content.model },
                  { label: 'Số từ', value: `${content.words} từ` },
                  { label: 'Tokens', value: content.tokens ? content.tokens.toString() : '0' },
                  { label: 'Thời gian xử lý', value: content.latency },
                  { label: 'Dự án', value: content.project || 'Không có' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground text-right break-words">{item.value}</span>
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
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/60'}`} />
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Thời gian</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Tạo lúc</span>
                  <span className="text-foreground text-right">{content.createdAt}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cập nhật</span>
                  <span className="text-foreground text-right">{content.updatedAt}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
