import { useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { useNavigate } from '@/lib/next-router-compat';
import {
  FolderOpen, Plus, FileText, Calendar,
  Search, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useCreateProject, useProjects } from '@/hooks/queries/useProjects';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { matchesSearchRegex } from '@/lib/searchRegex';

type ProjectSort = 'newest' | 'oldest' | 'updated' | 'name' | 'contentCount' | 'progress';
type ProjectStatusFilter = 'all' | 'active' | 'archived';
type ProjectPropertyFilter = 'all' | 'hasContent' | 'empty' | 'completed' | 'inProgress';

function getTime(value?: string) {
  const time = new Date(value || '').getTime();
  return Number.isFinite(time) ? time : 0;
}

export function CustomerProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ProjectStatusFilter>('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterProperty, setFilterProperty] = useState<ProjectPropertyFilter>('all');
  const [sortBy, setSortBy] = useState<ProjectSort>('newest');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const { data: projects = [], isLoading } = useProjects({ limit: 50, includeArchived: true });
  const createProject = useCreateProject();

  const industries = useMemo(() => (
    Array.from(new Set(projects.map(project => project.industry).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'vi'))
  ), [projects]);

  const filtered = useMemo(() => {
    return projects
      .filter((project) => {
        const matchSearch = matchesSearchRegex(search, [
          project.name,
          project.desc,
          project.industry,
        ]);
        const matchStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchIndustry = filterIndustry === 'all' || project.industry === filterIndustry;
        const matchProperty = (() => {
          if (filterProperty === 'hasContent') return project.contentCount > 0;
          if (filterProperty === 'empty') return project.contentCount === 0;
          if (filterProperty === 'completed') return project.contentCount > 0 && project.completionPercent >= 100;
          if (filterProperty === 'inProgress') return project.contentCount > 0 && project.completionPercent < 100;
          return true;
        })();

        return matchSearch && matchStatus && matchIndustry && matchProperty;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return getTime(a.createdAtRaw) - getTime(b.createdAtRaw);
        if (sortBy === 'updated') return getTime(b.updatedAtRaw) - getTime(a.updatedAtRaw);
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'vi');
        if (sortBy === 'contentCount') return b.contentCount - a.contentCount;
        if (sortBy === 'progress') return b.completionPercent - a.completionPercent;
        return getTime(b.createdAtRaw) - getTime(a.createdAtRaw);
      });
  }, [filterIndustry, filterProperty, filterStatus, projects, search, sortBy]);

  const hasActiveFilters = Boolean(search.trim()) || filterStatus !== 'all' || filterIndustry !== 'all' || filterProperty !== 'all' || sortBy !== 'newest';

  const pagination = usePagination(filtered, {
    initialPageSize: 6,
    resetKey: `${search}|${filterStatus}|${filterIndustry}|${filterProperty}|${sortBy}`,
  });

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterIndustry('all');
    setFilterProperty('all');
    setSortBy('newest');
  };

  const handleCreateProject = async () => {
    const name = newName.trim();
    const description = newDesc.trim();

    if (!name) {
      toast.error('Vui lòng nhập tên dự án');
      return;
    }

    try {
      await createProject.mutateAsync({
        name,
        description,
        industry: newIndustry.trim() || 'General',
      });
      toast.success('Đã tạo dự án');
      setNewName('');
      setNewDesc('');
      setNewIndustry('');
      setShowNew(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo dự án';
      toast.error(message);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Quản Lý Dự Án</h1>
            <p className="text-foreground/70">Tổ chức nội dung theo dự án để dễ quản lý và theo dõi</p>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-2" /> Tạo Dự Án Mới
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input placeholder="Tìm dự án..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ProjectStatusFilter)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="archived">Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Ngành" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProperty} onValueChange={(value) => setFilterProperty(value as ProjectPropertyFilter)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Thuộc tính" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thuộc tính</SelectItem>
                <SelectItem value="hasContent">Có nội dung</SelectItem>
                <SelectItem value="empty">Chưa có nội dung</SelectItem>
                <SelectItem value="inProgress">Đang thực hiện</SelectItem>
                <SelectItem value="completed">Hoàn thành 100%</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as ProjectSort)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới tạo nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="updated">Mới cập nhật</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
                <SelectItem value="contentCount">Nhiều nội dung</SelectItem>
                <SelectItem value="progress">Tiến độ cao</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>Bỏ lọc</Button>
            )}
          </div>
        </Card>

        {isLoading && (
          <Card className="p-6 text-sm text-muted-foreground">Đang tải danh sách dự án...</Card>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">Chưa có dự án nào phù hợp.</Card>
        )}

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagination.pageItems.map(project => (
            <Card key={project.id} className="p-5 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className={`bg-gradient-to-br ${project.color} p-3 rounded-xl`}>
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <Badge className={project.status === 'active' ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-foreground/70 border-0'}>
                  {project.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ'}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.desc}</p>
              <div className="mb-4 rounded-lg border border-border/70 bg-surface-muted/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-foreground/80">Tiến độ hoàn thành</span>
                  <span className="text-sm font-bold text-primary">{project.completionPercent}%</span>
                </div>
                <Progress value={project.completionPercent} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {project.contentCount > 0
                    ? `${project.completedCount}/${project.contentCount} nội dung đã hoàn thành`
                    : 'Chưa có nội dung để theo dõi tiến độ'}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {project.contents} nội dung</span>
                <span><Calendar className="w-3 h-3 inline mr-1" />{project.createdAt}</span>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <Badge className="bg-muted text-foreground/70 border-0 text-xs">{project.industry}</Badge>
                <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Xem chi tiết <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
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
          itemLabel="dự án"
        />

        {/* New project dialog */}
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent>
            <DialogHeader><DialogTitle>Tạo Dự Án Mới</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên dự án</Label>
                <Input placeholder="VD: Campaign Hè 2026" value={newName} onChange={e => setNewName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea placeholder="Mô tả ngắn về dự án..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Ngành/chủ đề</Label>
                <Input placeholder="VD: Thương mại điện tử" value={newIndustry} onChange={e => setNewIndustry(e.target.value)} className="mt-1" />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                onClick={handleCreateProject}
                disabled={createProject.isPending}
              >
                <Plus className="w-4 h-4 mr-2" /> {createProject.isPending ? 'Đang tạo...' : 'Tạo dự án'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
