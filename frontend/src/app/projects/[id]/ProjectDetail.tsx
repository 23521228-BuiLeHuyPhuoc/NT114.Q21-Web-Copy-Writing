import { useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { useParams, useNavigate } from '@/lib/next-router-compat';
import {
  ArrowLeft,
  Plus,
  FileText,
  BarChart3,
  Star,
  Clock,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useContents, useUpdateContent } from '@/hooks/queries/useContents';
import { useProject } from '@/hooks/queries/useProjects';

const TYPE_LABELS: Record<string, string> = {
  headline: 'Headline',
  description: 'Mô tả',
  social: 'Social',
  email: 'Email',
  cta: 'CTA',
  landing: 'Landing Page',
  seo: 'SEO',
  review: 'Review',
};

export function CustomerProjectDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentSearch, setContentSearch] = useState('');
  const { data: project, isLoading: isProjectLoading } = useProject(id);
  const { data: contents = [], isLoading: isContentsLoading } = useContents({ projectId: id, limit: 50 });
  const { data: allContents = [], isLoading: isAllContentsLoading } = useContents({ limit: 100 });
  const updateContent = useUpdateContent();

  const stats = useMemo(() => {
    const total = contents.length;
    const published = contents.filter(item => item.status === 'published').length;
    const draft = total - published;
    const avgQuality = total
      ? Math.round(contents.reduce((sum, item) => sum + (item.quality || 0), 0) / total)
      : 0;

    return {
      total,
      published,
      draft,
      avgQuality,
      progress: total ? Math.round((published / total) * 100) : 0,
    };
  }, [contents]);

  const contentPagination = usePagination(contents, {
    initialPageSize: 5,
    resetKey: id,
  });

  const availableContents = useMemo(() => {
    const currentIds = new Set(contents.map(item => item.id));
    const keyword = contentSearch.trim().toLowerCase();

    return allContents
      .filter(item => !currentIds.has(item.id))
      .filter((item) => {
        if (!keyword) return true;
        return [
          item.title,
          item.type,
          item.model,
          item.tags.join(' '),
        ].join(' ').toLowerCase().includes(keyword);
      });
  }, [allContents, contentSearch, contents]);

  const handleAddContent = async (contentId: string) => {
    try {
      await updateContent.mutateAsync({
        id: contentId,
        payload: { projectId: id },
      });
      toast.success('Đã thêm nội dung vào dự án');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể thêm nội dung vào dự án';
      toast.error(message);
    }
  };

  if (isProjectLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          <Card className="p-6 text-sm text-muted-foreground">Đang tải dự án...</Card>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại dự án
          </Button>
          <Card className="p-6 text-sm text-muted-foreground">Không tìm thấy dự án.</Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại dự án
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={project.status === 'active' ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-foreground/70 border-0'}>
                {project.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ'}
              </Badge>
              <Badge className="bg-muted text-foreground/70 border-0">{project.industry}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{project.desc || 'Chưa có mô tả.'}</p>
          </div>
          <Button
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            onClick={() => setShowAddContent(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng nội dung', value: stats.total, icon: FileText, color: 'text-primary bg-primary/5' },
            { label: 'Đã xuất bản', value: stats.published, icon: Star, color: 'text-primary bg-primary/5' },
            { label: 'Bản nháp', value: stats.draft, icon: Clock, color: 'text-amber-600 bg-warning/10' },
            { label: 'Chất lượng TB', value: `${stats.avgQuality}%`, icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-5 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Tiến độ dự án</span>
            <span className="text-sm text-primary font-semibold">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{stats.published}/{stats.total} nội dung đã hoàn thành</p>
        </Card>

        <h2 className="text-lg font-bold text-foreground mb-4">Nội dung trong dự án</h2>
        {isContentsLoading && (
          <Card className="p-6 text-sm text-muted-foreground">Đang tải nội dung...</Card>
        )}
        {!isContentsLoading && contents.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">Dự án này chưa có nội dung.</Card>
        )}
        <div className="space-y-3">
          {contentPagination.pageItems.map(item => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/contents/${item.id}`)}>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-muted text-foreground/70 border-0 text-xs">{TYPE_LABELS[item.type] || item.type}</Badge>
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{item.model}</Badge>
                    <span className="text-xs text-muted-foreground/80">{item.createdAt}</span>
                  </div>
                </div>
                <Badge className={`border-0 text-xs ${item.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-warning/15 text-amber-800'}`}>
                  {item.status === 'published' ? 'Xuất bản' : 'Nháp'}
                </Badge>
                <span className="text-sm font-semibold text-primary">{item.quality}%</span>
              </div>
            </Card>
          ))}
        </div>
        <DataPagination
          page={contentPagination.page}
          pageSize={contentPagination.pageSize}
          totalItems={contentPagination.totalItems}
          totalPages={contentPagination.totalPages}
          startIndex={contentPagination.startIndex}
          endIndex={contentPagination.endIndex}
          onPageChange={contentPagination.setPage}
          onPageSizeChange={contentPagination.setPageSize}
          itemLabel="nội dung"
        />

        <Dialog open={showAddContent} onOpenChange={setShowAddContent}>
          <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden p-0 sm:max-w-3xl">
            <DialogHeader className="px-5 pb-0 pt-5 pr-12 sm:px-6 sm:pr-12 sm:pt-6">
              <DialogTitle>Thêm nội dung vào dự án</DialogTitle>
            </DialogHeader>

            <div className="flex min-h-0 flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <Input
                  placeholder="Tìm nội dung theo tiêu đề, loại hoặc tag..."
                  value={contentSearch}
                  onChange={event => setContentSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              {isAllContentsLoading && (
                <Card className="p-4 text-sm text-muted-foreground">Đang tải bảng nội dung...</Card>
              )}

              {!isAllContentsLoading && availableContents.length === 0 && (
                <Card className="p-4 text-sm text-muted-foreground">
                  Không còn nội dung nào để thêm. Bạn có thể tạo nội dung mới từ trang Generate và chọn dự án này.
                </Card>
              )}

              {!isAllContentsLoading && availableContents.length > 0 && (
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto rounded-md border sm:max-h-[420px]">
                  {availableContents.map(item => (
                    <div key={item.id} className="flex flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className="bg-muted text-foreground/70 border-0 text-xs">{TYPE_LABELS[item.type] || item.type}</Badge>
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">{item.model}</Badge>
                          <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 break-words text-xs text-muted-foreground">{item.content}</p>
                      </div>
                      <Button
                        size="sm"
                        className="w-full shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white sm:w-auto"
                        disabled={updateContent.isPending}
                        onClick={() => handleAddContent(item.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Thêm
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
