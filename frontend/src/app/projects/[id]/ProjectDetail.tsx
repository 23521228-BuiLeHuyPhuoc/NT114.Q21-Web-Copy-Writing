import { useMemo } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  FileText,
  BarChart3,
  Star,
  Clock,
} from 'lucide-react';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { useContents } from '@/hooks/queries/useContents';
import { useProject } from '@/hooks/queries/useProjects';

const TYPE_LABELS: Record<string, string> = {
  headline: 'Headline',
  description: 'Mo ta',
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
  const { data: project, isLoading: isProjectLoading } = useProject(id);
  const { data: contents = [], isLoading: isContentsLoading } = useContents({ projectId: id, limit: 50 });

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

  if (isProjectLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          <Card className="p-6 text-sm text-muted-foreground">Dang tai du an...</Card>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-6 max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-4 text-foreground/70" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lai du an
          </Button>
          <Card className="p-6 text-sm text-muted-foreground">Khong tim thay du an.</Card>
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
            onClick={() => navigate(`/generate?projectId=${project.id}`)}
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tong noi dung', value: stats.total, icon: FileText, color: 'text-primary bg-primary/5' },
            { label: 'Da xuat ban', value: stats.published, icon: Star, color: 'text-primary bg-primary/5' },
            { label: 'Ban nhap', value: stats.draft, icon: Clock, color: 'text-amber-600 bg-warning/10' },
            { label: 'Chat luong TB', value: `${stats.avgQuality}%`, icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
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
          <Card className="p-6 text-sm text-muted-foreground">Dang tai noi dung...</Card>
        )}
        {!isContentsLoading && contents.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">Du an nay chua co noi dung.</Card>
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
      </div>
    </Layout>
  );
}
