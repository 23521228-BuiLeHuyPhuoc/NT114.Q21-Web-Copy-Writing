import { useState } from 'react';
import { useNavigate } from '@/lib/next-router-compat';
import {
  Calendar,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useContents, useDeleteContent } from '@/hooks/queries/useContents';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import type { UiContent } from '@/services/contentService';

const STATUS_MAP: Record<UiContent['status'], { label: string; color: string }> = {
  published: { label: 'Đã xuất bản', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Nháp', color: 'bg-yellow-100 text-yellow-700' },
  archived: { label: 'Lưu trữ', color: 'bg-gray-100 text-gray-600' },
};

export function CustomerContents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { data: contents = [], isError, isLoading } = useContents();
  const deleteContent = useDeleteContent();

  const filtered = contents.filter(c => {
    const title = c.title || '';
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const pagination = usePagination(filtered, {
    initialPageSize: 6,
    resetKey: `${search}|${filterStatus}|${filterType}`,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id);
      toast.success('Đã xóa nội dung!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa nội dung';
      toast.error(message);
    }
  };

  const averageQuality = contents.length
    ? Math.round(contents.reduce((sum, item) => sum + item.quality, 0) / contents.length)
    : 0;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Quản Lý Nội Dung</h1>
            <p className="text-foreground/70">Tất cả copy AI đã tạo, được lưu trực tiếp từ backend.</p>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => navigate('/generate')}>
            <Plus className="w-4 h-4 mr-2" /> Tạo Nội Dung Mới
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng nội dung', value: contents.length, icon: FileText, color: 'text-primary bg-primary/5' },
            { label: 'Đã xuất bản', value: contents.filter(c => c.status === 'published').length, icon: Star, color: 'text-primary bg-primary/5' },
            { label: 'Bản nháp', value: contents.filter(c => c.status === 'draft').length, icon: Clock, color: 'text-amber-600 bg-warning/10' },
            { label: 'Chất lượng TB', value: `${averageQuality}%`, icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input placeholder="Tìm kiếm nội dung..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Loại copy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="headline">Tiêu đề</SelectItem>
                <SelectItem value="description">Mô tả</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="landing">Landing Page</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="cta">CTA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {isLoading && (
          <Card className="p-8 text-center text-muted-foreground mb-6">
            Đang tải nội dung...
          </Card>
        )}

        {isError && (
          <Card className="p-8 text-center text-red-500 mb-6">
            Không thể tải danh sách nội dung. Vui lòng thử lại.
          </Card>
        )}

        <div className="space-y-3">
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/80">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy nội dung phù hợp</p>
            </div>
          )}

          {pagination.pageItems.map(item => {
            const status = STATUS_MAP[item.status] ?? STATUS_MAP.published;
            return (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/contents/${item.id}`)}>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge className={`${status.color} border-0 text-xs`}>{status.label}</Badge>
                      <Badge className="bg-muted text-foreground/70 border-0 text-xs">{item.type}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{item.model}</Badge>
                      <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs">CL {item.quality}%</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/80">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{item.createdAt}</span>
                      <span>{item.words} từ</span>
                      <span>{item.industry}</span>
                      {item.project && <span className="text-primary">{item.project}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/contents/${item.id}`)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(item.content || item.title); toast.success('Đã sao chép!'); }}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      disabled={deleteContent.isPending}
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <DataPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="nội dung"
        />
      </div>
    </Layout>
  );
}
