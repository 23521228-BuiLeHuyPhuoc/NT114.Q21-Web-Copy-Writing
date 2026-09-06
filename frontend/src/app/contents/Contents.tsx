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
import {
  useContents,
  useDeleteContent,
  usePermanentDeleteAllContents,
  usePermanentDeleteContent,
  useRestoreContent,
  useTrashContents,
} from '@/hooks/queries/useContents';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import type { UiContent } from '@/services/contentService';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { matchesSearchRegex } from '@/lib/searchRegex';
import { EditorialEmptyState } from '@/app/components/EditorialArtwork';

const CONTENT_FETCH_PAGE_SIZE = 100;
const CONTENT_UI_PAGE_SIZE = 10;

const STATUS_MAP: Record<UiContent['status'], { label: string; color: string }> = {
  published: { label: 'Đã xuất bản', color: 'border border-success/40 bg-success/10 text-success' },
  draft: { label: 'Nháp', color: 'border border-warning/50 bg-warning/15 text-warning-foreground' },
  archived: { label: 'Lưu trữ', color: 'border border-border bg-muted text-muted-foreground' },
};

export function CustomerContents() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);
  const { data: contents = [], isError, isLoading } = useContents({ fetchAll: true, limit: CONTENT_FETCH_PAGE_SIZE });
  const { data: trashContents = [] } = useTrashContents({ fetchAll: true, limit: CONTENT_FETCH_PAGE_SIZE });
  const deleteContent = useDeleteContent();
  const restoreContent = useRestoreContent();
  const permanentDeleteContent = usePermanentDeleteContent();
  const permanentDeleteAllContents = usePermanentDeleteAllContents();

  const filtered = contents.filter(c => {
    const matchSearch = matchesSearchRegex(search, [c.title, c.type, c.model, c.content]);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const pagination = usePagination(filtered, {
    initialPageSize: CONTENT_UI_PAGE_SIZE,
    resetKey: `${search}|${filterStatus}|${filterType}`,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id);
      toast.success('Đã đưa nội dung vào thùng rác!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa nội dung';
      toast.error(message);
    }
  };

  const handleRestore = async (targetId: number | string) => {
    const contentId = String(targetId);
    setTrashLoading(contentId);

    try {
      await restoreContent.mutateAsync(contentId);
      toast.success('Đã khôi phục nội dung!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể khôi phục nội dung';
      toast.error(message);
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDelete = async (targetId: number | string) => {
    const contentId = String(targetId);
    const confirmed = window.confirm('Xóa vĩnh viễn nội dung này? Thao tác này không thể hoàn tác.');
    if (!confirmed) return;

    setTrashLoading(contentId);

    try {
      await permanentDeleteContent.mutateAsync(contentId);
      toast.success('Đã xóa vĩnh viễn nội dung!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa vĩnh viễn nội dung';
      toast.error(message);
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDeleteAll = async (ids: Array<number | string>) => {
    const contentIds = ids.map(String).filter(Boolean);
    if (contentIds.length === 0) return;

    try {
      await permanentDeleteAllContents.mutateAsync(contentIds);
      toast.success(`Đã xóa vĩnh viễn ${contentIds.length} nội dung!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa tất cả nội dung';
      toast.error(message);
    }
  };

  const averageQuality = contents.length
    ? Math.round(contents.reduce((sum, item) => sum + item.quality, 0) / contents.length)
    : 0;

  return (
    <Layout>
      <div className="mx-auto max-w-[1450px] p-4 md:p-7 lg:p-9">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b-2 border-foreground pb-7 md:flex-row md:items-end">
          <div>
            <p className="editorial-kicker mb-4 text-primary">Thư viện bản thảo</p>
            <h1 className="studio-page-title text-foreground">Nội dung</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Tìm, đọc và xử lý các bản copy đã lưu từ generator.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="relative" onClick={() => setTrashOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" /> Thùng rác
              {trashContents.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {trashContents.length}
                </span>
              )}
            </Button>
            <Button size="lg" onClick={() => navigate('/generate')}>
              <Plus className="h-4 w-4" /> Tạo nội dung mới
            </Button>
          </div>
        </div>

        <div className="mb-7 grid border-l border-t border-foreground grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Tổng nội dung', value: contents.length, icon: FileText, color: 'text-primary bg-primary/5' },
            { label: 'Đã xuất bản', value: contents.filter(c => c.status === 'published').length, icon: Star, color: 'text-primary bg-primary/5' },
            { label: 'Bản nháp', value: contents.filter(c => c.status === 'draft').length, icon: Clock, color: 'text-amber-600 bg-warning/10' },
            { label: 'Chất lượng TB', value: `${averageQuality}%`, icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex min-h-24 items-center gap-3 overflow-hidden border-b border-r border-foreground bg-card p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center border border-foreground ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold leading-tight text-foreground truncate" title={String(s.value)}>{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground line-clamp-2">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="mb-7 overflow-hidden border-2 border-foreground">
          <div className="border-b border-foreground bg-foreground px-4 py-2 font-mono-editorial text-[10px] font-bold uppercase tracking-[.15em] text-background">Tra cứu thư viện</div>
          <div className="flex flex-wrap gap-3 p-4">
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
            <EditorialEmptyState title="Không tìm thấy bản thảo" description="Thử từ khóa hoặc bộ lọc khác. Nếu thư viện đang trống, hãy tạo nội dung đầu tiên từ Generator." action={<Button size="sm" onClick={() => navigate('/generate')}><Plus className="h-4 w-4" /> Mở Generator</Button>} />
          )}

          {pagination.pageItems.map(item => {
            const status = STATUS_MAP[item.status] ?? STATUS_MAP.published;
            return (
              <Card
                key={item.id}
                role="link"
                tabIndex={0}
                className="group cursor-pointer border-l-4 border-l-transparent p-0 transition-all hover:border-l-primary hover:shadow-[5px_5px_0_rgba(23,32,51,.08)]"
                onClick={() => navigate(`/contents/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.currentTarget !== event.target || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault();
                  navigate(`/contents/${item.id}`);
                }}
              >
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  <div className="hidden h-12 w-10 shrink-0 items-center justify-center border border-foreground bg-accent/45 font-display text-xl font-bold text-foreground sm:flex">{String(item.title || 'N').charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge className={`${status.color} text-xs`}>{status.label}</Badge>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      <Badge className="max-w-full whitespace-normal border-0 bg-primary/10 text-left text-xs leading-tight text-primary" title={item.model}>{item.model}</Badge>
                    </div>
                    <h3 className="truncate font-display text-xl font-bold text-foreground">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/80">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{item.createdAt}</span>
                      <span>{item.words} từ</span>
                      <span>{item.industry}</span>
                      {item.project && <span className="text-primary">{item.project}</span>}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1 border-l-0 border-border md:border-l md:pl-3" onClick={e => e.stopPropagation()}>
                    <span className="mr-2 text-right"><span className="block font-display text-xl font-bold text-primary">{item.quality}%</span><span className="block text-[9px] uppercase tracking-wide text-muted-foreground">chất lượng</span></span>
                    <Button aria-label={`Xem ${item.title}`} variant="ghost" size="sm" onClick={() => navigate(`/contents/${item.id}`)}><Eye className="w-4 h-4" /></Button>
                    <Button aria-label={`Sao chép ${item.title}`} variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(item.content || item.title); toast.success('Đã sao chép!'); }}><Copy className="w-4 h-4" /></Button>
                    <Button aria-label={`Tải xuống ${item.title}`} variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      aria-label={`Xóa ${item.title}`}
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
          pageSizeOptions={[10, 20, 50]}
          itemLabel="nội dung"
        />

        <TrashBin
          open={trashOpen}
          onClose={() => setTrashOpen(false)}
          items={trashContents.map(item => ({
            id: item.id,
            label: item.title,
            subLabel: `${item.type} · ${item.words} từ`,
            deletedAt: item.deletedAt || item.updatedAt || '-',
          }))}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onPermanentDeleteAll={handlePermanentDeleteAll}
          deleteAllLoading={permanentDeleteAllContents.isPending}
          entityName="nội dung"
          loading={trashLoading}
        />
      </div>
    </Layout>
  );
}
