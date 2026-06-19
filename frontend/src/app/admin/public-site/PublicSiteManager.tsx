import { useCallback, useEffect, useMemo, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Link } from '@/lib/next-router-compat';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { StatTile } from '@/app/components/admin/StatTile';
import { PUBLIC_PAGE_FIELD_DEFS, buildDefaultContent, getPublicPageDef } from '@/lib/publicSiteDefaults';
import { normalizePosts } from '@/lib/publicBlog';
import { adminPlanService, type AdminPlan } from '@/services/adminPlanService';
import { publicSiteService, type PublicBlogPost, type PublicPageRecord } from '@/services/publicSiteService';
import { Edit2, Eye, FileText, Globe2, Newspaper, Plus, Save, Trash2, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

type TabKey = 'pages' | 'blog' | 'pricing';

function isTabKey(value: string | null): value is TabKey {
  return value === 'pages' || value === 'blog' || value === 'pricing';
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function planPrice(plan: AdminPlan) {
  if (plan.monthlyPrice === -1) return 'Liên hệ';
  if (plan.monthlyPrice === 0) return 'Miễn phí';
  return `${plan.monthlyPrice.toLocaleString('vi-VN')} ${plan.currency}/tháng`;
}

function upsertPageRecord(pages: PublicPageRecord[], saved: PublicPageRecord) {
  const exists = pages.some(page => page.key === saved.key);
  const nextPages = exists
    ? pages.map(page => (page.key === saved.key ? saved : page))
    : [...pages, saved];

  return nextPages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.key.localeCompare(b.key));
}

export function PublicSiteManager() {
  const [tab, setTab] = useState<TabKey>(() => {
    const queryTab = typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('tab');
    return isTabKey(queryTab) ? queryTab : 'pages';
  });
  const [pages, setPages] = useState<PublicPageRecord[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('home');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [pagePublished, setPagePublished] = useState(true);
  const [pageDraft, setPageDraft] = useState<Record<string, string>>({});
  const [savingPage, setSavingPage] = useState(false);
  const [blogPosts, setBlogPosts] = useState<PublicBlogPost[]>([]);
  const [blogPage, setBlogPage] = useState<PublicPageRecord | null>(null);
  const [blogSearch, setBlogSearch] = useState('');
  const [savingBlog, setSavingBlog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pageResult, planResult] = await Promise.allSettled([
      publicSiteService.listAdminPages(),
      adminPlanService.list(),
    ]);

    if (pageResult.status === 'fulfilled') {
      const pageItems = pageResult.value;
      setPages(pageItems);
      const nextBlogPage = pageItems.find(page => page.key === 'blog') || null;
      setBlogPage(nextBlogPage);
      setBlogPosts(normalizePosts(nextBlogPage?.content?.posts));
    } else {
      setPages([]);
      setBlogPage(null);
      setBlogPosts(normalizePosts(undefined));
      toast.error(getErrorMessage(pageResult.reason, 'Không tải được dữ liệu public site'));
    }

    if (planResult.status === 'fulfilled') {
      setPlans(planResult.value);
    } else {
      setPlans([]);
      toast.error(getErrorMessage(planResult.reason, 'Không tải được bảng giá'));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const queryTab = new URLSearchParams(window.location.search).get('tab');
    if (isTabKey(queryTab)) setTab(queryTab);
  }, []);

  const selectedPage = useMemo(() => pages.find(page => page.key === selectedKey) || null, [pages, selectedKey]);
  const selectedDef = getPublicPageDef(selectedKey);

  useEffect(() => {
    const page = pages.find(item => item.key === selectedKey);
    setPageTitle(page?.title || selectedDef.label);
    setPageDescription(page?.description || '');
    setPagePublished(page?.isPublished !== false);
    setPageDraft(buildDefaultContent(selectedKey, page?.content));
  }, [pages, selectedDef.label, selectedKey]);

  const filteredBlogPosts = useMemo(() => {
    const keyword = blogSearch.trim().toLowerCase();
    if (!keyword) return blogPosts;
    return blogPosts.filter(post => [post.title, post.slug, post.excerpt, post.author, post.catLabel].join(' ').toLowerCase().includes(keyword));
  }, [blogPosts, blogSearch]);

  const visibleBlogCount = blogPosts.filter(post => post.published !== false).length;
  const activePlans = plans.filter(plan => plan.active);

  const updateDraftField = (key: string, value: string) => {
    setPageDraft(current => ({ ...current, [key]: value }));
  };

  const uploadEditorImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ hỗ trợ file ảnh');
    }

    const uploaded = await publicSiteService.uploadAdminImage(file);
    return uploaded.url;
  }, []);

  const savePage = async () => {
    setSavingPage(true);
    try {
      const saved = await publicSiteService.updateAdminPage(selectedKey, {
        type: selectedDef.type,
        title: pageTitle.trim() || selectedDef.label,
        description: pageDescription.trim(),
        content: pageDraft,
        isPublished: pagePublished,
        sortOrder: selectedPage?.sortOrder || PUBLIC_PAGE_FIELD_DEFS.findIndex(def => def.key === selectedKey) + 1,
      });
      setPages(current => upsertPageRecord(current, saved));
      toast.success('Đã lưu nội dung public site');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không lưu được nội dung'));
    } finally {
      setSavingPage(false);
    }
  };

  const removePost = (post: PublicBlogPost) => {
    setBlogPosts(current => current.filter(item => item.id !== post.id));
  };

  const saveBlog = async () => {
    setSavingBlog(true);
    try {
      const saved = await publicSiteService.updateAdminPage('blog', {
        type: 'blog',
        title: blogPage?.title || 'Blog',
        description: blogPage?.description || 'Danh sách bài viết public',
        content: { ...(blogPage?.content || {}), posts: blogPosts },
        isPublished: blogPage?.isPublished !== false,
        sortOrder: blogPage?.sortOrder || 50,
      });
      setBlogPage(saved);
      setPages(current => upsertPageRecord(current, saved));
      toast.success('Đã đồng bộ blog ra trang public');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không lưu được blog'));
    } finally {
      setSavingBlog(false);
    }
  };

  const renderPages = () => (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2">
        {PUBLIC_PAGE_FIELD_DEFS.map(def => (
          <button
            key={def.key}
            onClick={() => setSelectedKey(def.key)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selectedKey === def.key ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground/70 hover:bg-surface-muted'}`}
          >
            <span className="block text-sm font-bold">{def.label}</span>
            <span className="text-xs text-muted-foreground">/{def.key === 'home' ? '' : def.key}</span>
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{selectedDef.label}</h2>
            <p className="text-sm text-muted-foreground">Sửa các trường này rồi lưu để trang public đọc lại từ API.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Đang hiển thị</span>
            <Switch checked={pagePublished} onCheckedChange={setPagePublished} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Tiêu đề trang</Label>
            <Input className="mt-2" value={pageTitle} onChange={event => setPageTitle(event.target.value)} />
          </div>
          <div>
            <Label>Mô tả trang</Label>
            <Input className="mt-2" value={pageDescription} onChange={event => setPageDescription(event.target.value)} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {selectedDef.fields.map(field => (
            <div key={field.key} className={field.multiline ? 'md:col-span-2' : ''}>
              <Label>{field.label}</Label>
              {field.multiline ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
                  <Editor
                    apiKey={tinymceApiKey}
                    value={pageDraft[field.key] || ''}
                    init={{
                      height: 220,
                      menubar: false,
                      branding: false,
                      statusbar: true,
                      plugins: 'autolink lists link image table code wordcount autoresize preview fullscreen',
                      toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link image table | removeformat | preview fullscreen code',
                      automatic_uploads: true,
                      images_reuse_filename: true,
                      images_file_types: 'jpeg,jpg,png,gif,webp',
                      images_upload_handler: async (blobInfo: { blob: () => Blob; filename: () => string }) => {
                        const blob = blobInfo.blob();
                        const file = new File([blob], blobInfo.filename(), { type: blob.type });
                        return uploadEditorImage(file);
                      },
                      file_picker_types: 'image',
                      file_picker_callback: (callback: (url: string, meta?: Record<string, string>) => void, _value: string, meta: { filetype?: string }) => {
                        if (meta.filetype !== 'image') return;

                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/jpeg,image/png,image/webp,image/gif';
                        input.onchange = async () => {
                          const file = input.files?.[0];
                          if (!file) return;

                          try {
                            const url = await uploadEditorImage(file);
                            callback(url, { alt: file.name, title: file.name });
                            toast.success('Đã tải ảnh lên Cloudinary');
                          } catch (error) {
                            toast.error(getErrorMessage(error, 'Không upload được ảnh'));
                          }
                        };
                        input.click();
                      },
                      content_style: 'body { font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1f2937; } p { margin: 0 0 10px; } ul, ol { margin: 0 0 10px 22px; padding: 0; } li { margin: 4px 0; } h1, h2, h3 { margin: 16px 0 10px; line-height: 1.3; color: #111827; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #d1d5db; padding: 8px; }',
                    }}
                    onEditorChange={(value: string) => updateDraftField(field.key, value)}
                  />
                </div>
              ) : (
                <Input className="mt-2" value={pageDraft[field.key] || ''} onChange={event => updateDraftField(field.key, event.target.value)} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => void savePage()} disabled={savingPage} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <Save className="mr-2 h-4 w-4" /> {savingPage ? 'Đang lưu...' : 'Lưu trang'}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderBlog = () => (
    <Card className="p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">Blog public</h2>
          <p className="text-sm text-muted-foreground">Nếu DB chưa có bài viết, danh sách đang dùng bài mẫu hiện có để admin sửa và lưu lần đầu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={blogSearch} onChange={event => setBlogSearch(event.target.value)} placeholder="Tìm bài viết..." className="w-56" />
          <Link to="/admin/public-site/blog/new">
            <Button variant="outline" className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Thêm bài</Button>
          </Link>
          <Button onClick={() => void saveBlog()} disabled={savingBlog} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white"><Save className="mr-2 h-4 w-4" /> {savingBlog ? 'Đang lưu...' : 'Lưu blog'}</Button>
        </div>
      </div>

      <AdminTable empty={filteredBlogPosts.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Không có bài viết nào.</div> : undefined}>
        <TableHeader>
          <TableRow>
            <TableHead>Bài viết</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBlogPosts.map(post => (
            <TableRow key={`${post.id}-${post.slug}`}>
              <TableCell>
                <div className="max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{post.title}</span>
                    {post.featured && <Badge className="border-0 bg-warning/15 text-amber-800">Featured</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">/{post.slug} - {post.excerpt}</p>
                </div>
              </TableCell>
              <TableCell><Badge className="border-0 bg-primary/10 text-primary">{post.catLabel}</Badge></TableCell>
              <TableCell className="text-sm text-foreground/70">{post.author}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{post.date}</TableCell>
              <TableCell>{post.published === false ? <Badge variant="outline">Ẩn</Badge> : <Badge className="border-0 bg-emerald-100 text-emerald-700">Hiện</Badge>}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Link to={`/blog/${post.slug}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-3.5 w-3.5" /></Link>
                  <Link to={`/admin/public-site/blog/${post.slug}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></Link>
                  <button onClick={() => removePost(post)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </Card>
  );

  const renderPricing = () => (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Bảng giá public</h2>
          <p className="text-sm text-muted-foreground">Trang /pricing đọc trực tiếp từ /api/billing/plans. Sửa giá, quota, trạng thái và gói nổi bật tại Quản lý gói dịch vụ.</p>
        </div>
        <Link to="/admin/plans">
          <Button className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">Mở quản lý plans</Button>
        </Link>
      </div>
      <AdminTable empty={plans.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Không có gói dịch vụ nào.</div> : undefined}>
        <TableHeader>
          <TableRow>
            <TableHead>Gói</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Quota copy</TableHead>
            <TableHead>API calls</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map(plan => (
            <TableRow key={plan.id}>
              <TableCell>
                <span className="font-semibold text-foreground">{plan.name}</span>
                {plan.popular && <Badge className="ml-2 border-0 bg-warning/15 text-amber-800">Popular</Badge>}
              </TableCell>
              <TableCell>{planPrice(plan)}</TableCell>
              <TableCell>{plan.copyLimit === -1 ? 'Không giới hạn' : plan.copyLimit.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{plan.apiLimit === -1 ? 'Không giới hạn' : plan.apiLimit.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{plan.active ? <Badge className="border-0 bg-emerald-100 text-emerald-700">Đang hiện</Badge> : <Badge variant="outline">Tạm tắt</Badge>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminTable>
    </Card>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-foreground">Quản lý public site</h1>
            <p className="text-sm text-muted-foreground">Trang chủ, giới thiệu, liên hệ, footer và blog được lưu vào MongoDB; bảng giá đọc từ quản lý gói.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-surface-muted">
            <Eye className="h-4 w-4" /> Xem website
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile icon={Globe2} label="Trang quản lý" value={PUBLIC_PAGE_FIELD_DEFS.length} color="text-primary bg-primary/5" />
          <StatTile icon={Newspaper} label="Bài blog" value={blogPosts.length} color="text-primary bg-primary/5" />
          <StatTile icon={FileText} label="Đang hiển thị" value={visibleBlogCount} color="text-emerald-700 bg-emerald-100" />
          <StatTile icon={WalletCards} label="Gói active" value={activePlans.length} color="text-amber-700 bg-amber-100" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1">
          {[
            { key: 'pages' as const, label: 'Trang tĩnh', icon: Globe2 },
            { key: 'blog' as const, label: 'Blog', icon: Newspaper },
            { key: 'pricing' as const, label: 'Bảng giá', icon: WalletCards },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === item.key ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải cấu hình public site...</Card>
        ) : tab === 'pages' ? renderPages() : tab === 'blog' ? renderBlog() : renderPricing()}
      </div>
    </Layout>
  );
}
