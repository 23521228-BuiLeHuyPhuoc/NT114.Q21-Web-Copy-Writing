import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, Plus, FileText, Calendar, Users, MoreHorizontal,
  Search, ArrowRight, Edit2, Trash2, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useCreateProject, useProjects } from '@/hooks/queries/useProjects';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';

export function CustomerProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const { data: projects = [], isLoading } = useProjects({ limit: 50 });
  const createProject = useCreateProject();

  const keyword = search.trim().toLowerCase();
  const filtered = projects.filter((project) => {
    if (!keyword) return true;
    return [
      project.name,
      project.desc,
      project.industry,
    ].join(' ').toLowerCase().includes(keyword);
  });
  const pagination = usePagination(filtered, {
    initialPageSize: 6,
    resetKey: search,
  });

  const handleCreateProject = async () => {
    const name = newName.trim();
    const description = newDesc.trim();

    if (!name) {
      toast.error('Vui lòng nhập tên dự án');
      return;
    }

    try {
      await createProject.mutateAsync({ name, description, industry: newIndustry.trim() || 'General' });
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <Input placeholder="Tìm dự án..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-md" />
        </div>

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
                  {project.status === 'active' ? 'Đang hoạt động' : 'Hoàn thành'}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.desc}</p>
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
