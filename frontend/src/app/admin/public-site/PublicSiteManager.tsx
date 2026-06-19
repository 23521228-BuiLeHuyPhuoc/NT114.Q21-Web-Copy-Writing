import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/next-router-compat';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { StatTile } from '@/app/components/admin/StatTile';
import { PUBLIC_PAGE_FIELD_DEFS, buildDefaultContent, getPublicPageDef } from '@/lib/publicSiteDefaults';
import { BLOG_POSTS } from '@/mocks/blog';
import { adminPlanService, type AdminPlan } from '@/services/adminPlanService';
import { publicSiteService, type PublicBlogPost, type PublicPageRecord } from '@/services/publicSiteService';
import { Edit2, Eye, FileText, Globe2, Newspaper, Plus, Save, Trash2, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';

type TabKey = 'pages' | 'blog' | 'pricing';
type BlogPostForm = Omit<PublicBlogPost, 'id' | 'content'> & {
  id?: string | number;
  lead: string;
  sectionsText: string;
};

const EMPTY_POST_FORM: BlogPostForm = {
  slug: '',
  cat: 'news',
  catLabel: 'Tin tuc',
  title: '',
  excerpt: '',
  author: 'CopyPro Team',
  authorRole: 'CopyPro',
  date: new Date().toLocaleDateString('vi-VN'),
  readTime: '5 phut doc',
  img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
  featured: false,
  published: true,
  lead: '',
  sectionsText: '',
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sectionsToText(sections: PublicBlogPost['content']['sections'] = []) {
  return sections.map(section => [section.heading, ...section.body].filter(Boolean).join('\n')).join('\n\n');
}

function textToSections(value: string) {
  return value
    .split(/\n\s*\n/g)
    .map(block => block.split('\n').map(line => line.trim()).filter(Boolean))
    .filter(lines => lines.length > 0)
    .map(lines => ({ heading: lines[0], body: lines.slice(1) }));
}

function normalizePosts(value: unknown): PublicBlogPost[] {
  if (!Array.isArray(value) || value.length === 0) {
    return BLOG_POSTS.map(post => ({ ...post, published: true }));
  }
  return value.map((post, index) => ({
    ...BLOG_POSTS[0],
    ...(post as Partial<PublicBlogPost>),
    id: (post as Partial<PublicBlogPost>).id || index + 1,
    content: {
      lead: (post as Partial<PublicBlogPost>).content?.lead || '',
      sections: (post as Partial<PublicBlogPost>).content?.sections || [],
    },
  }));
}

function planPrice(plan: AdminPlan) {
  if (plan.monthlyPrice === -1) return 'Lien he';
  if (plan.monthlyPrice === 0) return 'Mien phi';
  return `${plan.monthlyPrice.toLocaleString('vi-VN')} ${plan.currency}/thang`;
}

export function PublicSiteManager() {
  const [tab, setTab] = useState<TabKey>('pages');
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
  const [postForm, setPostForm] = useState<BlogPostForm | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pageItems, planItems] = await Promise.all([
        publicSiteService.listAdminPages(),
        adminPlanService.list(),
      ]);
      setPages(pageItems);
      setPlans(planItems);
      const nextBlogPage = pageItems.find(page => page.key === 'blog') || null;
      setBlogPage(nextBlogPage);
      setBlogPosts(normalizePosts(nextBlogPage?.content?.posts));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong tai duoc du lieu public site'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const activePlans = plans.filter(plan => plan.active);
  const visibleBlogCount = blogPosts.filter(post => post.published !== false).length;

  const updateDraftField = (key: string, value: string) => {
    setPageDraft(current => ({ ...current, [key]: value }));
  };

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
      setPages(current => current.map(page => (page.key === saved.key ? saved : page)));
      toast.success('Da luu noi dung public site');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong luu duoc noi dung'));
    } finally {
      setSavingPage(false);
    }
  };

  const openPostForm = (post?: PublicBlogPost) => {
    if (!post) {
      setPostForm(EMPTY_POST_FORM);
      return;
    }
    setPostForm({
      ...post,
      lead: post.content.lead,
      sectionsText: sectionsToText(post.content.sections),
    });
  };

  const savePostForm = () => {
    if (!postForm) return;
    const slug = postForm.slug.trim() || slugify(postForm.title);
    if (!postForm.title.trim() || !slug) {
      toast.error('Can nhap tieu de va slug bai viet');
      return;
    }

    const nextPost: PublicBlogPost = {
      id: postForm.id || Date.now(),
      slug,
      cat: postForm.cat.trim() || 'news',
      catLabel: postForm.catLabel.trim() || postForm.cat,
      title: postForm.title.trim(),
      excerpt: postForm.excerpt.trim(),
      author: postForm.author.trim() || 'CopyPro Team',
      authorRole: postForm.authorRole.trim(),
      date: postForm.date.trim(),
      readTime: postForm.readTime.trim(),
      img: postForm.img.trim(),
      featured: Boolean(postForm.featured),
      published: postForm.published !== false,
      content: {
        lead: postForm.lead.trim(),
        sections: textToSections(postForm.sectionsText),
      },
    };

    setBlogPosts(current => {
      const withoutSame = current.filter(post => post.id !== nextPost.id && post.slug !== nextPost.slug);
      const normalized = nextPost.featured ? withoutSame.map(post => ({ ...post, featured: false })) : withoutSame;
      return [nextPost, ...normalized];
    });
    setPostForm(null);
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
        description: blogPage?.description || 'Danh sach bai viet public',
        content: { ...(blogPage?.content || {}), posts: blogPosts },
        isPublished: blogPage?.isPublished !== false,
        sortOrder: blogPage?.sortOrder || 50,
      });
      setBlogPage(saved);
      setPages(current => current.map(page => (page.key === 'blog' ? saved : page)));
      toast.success('Da dong bo blog ra trang public');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong luu duoc blog'));
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
            <p className="text-sm text-muted-foreground">Sua cac truong nay roi luu de public page doc lai tu API.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Published</span>
            <Switch checked={pagePublished} onCheckedChange={setPagePublished} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Page title</Label>
            <Input className="mt-2" value={pageTitle} onChange={event => setPageTitle(event.target.value)} />
          </div>
          <div>
            <Label>Page description</Label>
            <Input className="mt-2" value={pageDescription} onChange={event => setPageDescription(event.target.value)} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {selectedDef.fields.map(field => (
            <div key={field.key} className={field.multiline ? 'md:col-span-2' : ''}>
              <Label>{field.label}</Label>
              {field.multiline ? (
                <Textarea className="mt-2 min-h-28" value={pageDraft[field.key] || ''} onChange={event => updateDraftField(field.key, event.target.value)} />
              ) : (
                <Input className="mt-2" value={pageDraft[field.key] || ''} onChange={event => updateDraftField(field.key, event.target.value)} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => void savePage()} disabled={savingPage} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <Save className="mr-2 h-4 w-4" /> {savingPage ? 'Dang luu...' : 'Luu trang'}
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
          <p className="text-sm text-muted-foreground">Neu DB chua co bai viet, danh sach dang dung bai mau hien co de admin sua va luu lan dau.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={blogSearch} onChange={event => setBlogSearch(event.target.value)} placeholder="Tim bai viet..." className="w-56" />
          <Button variant="outline" onClick={() => openPostForm()} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Them bai</Button>
          <Button onClick={() => void saveBlog()} disabled={savingBlog} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white"><Save className="mr-2 h-4 w-4" /> {savingBlog ? 'Dang luu...' : 'Luu blog'}</Button>
        </div>
      </div>

      <AdminTable empty={filteredBlogPosts.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Khong co bai viet nao.</div> : undefined}>
        <TableHeader>
          <TableRow>
            <TableHead>Bai viet</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tac gia</TableHead>
            <TableHead>Ngay</TableHead>
            <TableHead>Trang thai</TableHead>
            <TableHead className="text-right">Thao tac</TableHead>
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
              <TableCell>{post.published === false ? <Badge variant="outline">An</Badge> : <Badge className="border-0 bg-emerald-100 text-emerald-700">Hien</Badge>}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Link to={`/blog/${post.slug}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-3.5 w-3.5" /></Link>
                  <button onClick={() => openPostForm(post)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></button>
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
          <h2 className="text-lg font-bold text-foreground">Bang gia public</h2>
          <p className="text-sm text-muted-foreground">Trang /pricing doc truc tiep tu /api/billing/plans. Sua gia, quota, active va popular tai Quan ly goi dich vu.</p>
        </div>
        <Link to="/admin/plans"><Button className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">Mo quan ly plans</Button></Link>
      </div>
      <AdminTable>
        <TableHeader>
          <TableRow>
            <TableHead>Goi</TableHead>
            <TableHead>Gia</TableHead>
            <TableHead>Quota copy</TableHead>
            <TableHead>API calls</TableHead>
            <TableHead>Trang thai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map(plan => (
            <TableRow key={plan.id}>
              <TableCell><span className="font-semibold text-foreground">{plan.name}</span>{plan.popular && <Badge className="ml-2 border-0 bg-warning/15 text-amber-800">Popular</Badge>}</TableCell>
              <TableCell>{planPrice(plan)}</TableCell>
              <TableCell>{plan.copyLimit === -1 ? 'Unlimited' : plan.copyLimit.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{plan.apiLimit === -1 ? 'Unlimited' : plan.apiLimit.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{plan.active ? <Badge className="border-0 bg-emerald-100 text-emerald-700">Dang hien</Badge> : <Badge variant="outline">Tam tat</Badge>}</TableCell>
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
            <h1 className="mb-1 text-2xl font-bold text-foreground">Quan ly public site</h1>
            <p className="text-sm text-muted-foreground">Home, about, contact, footer va blog duoc luu vao MongoDB; pricing doc tu admin plans.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-surface-muted">
            <Eye className="h-4 w-4" /> Xem website
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile icon={Globe2} label="Trang quan ly" value={PUBLIC_PAGE_FIELD_DEFS.length} color="text-primary bg-primary/5" />
          <StatTile icon={Newspaper} label="Bai blog" value={blogPosts.length} color="text-primary bg-primary/5" />
          <StatTile icon={FileText} label="Dang hien thi" value={visibleBlogCount} color="text-emerald-700 bg-emerald-100" />
          <StatTile icon={WalletCards} label="Goi active" value={activePlans.length} color="text-amber-700 bg-amber-100" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1">
          {[
            { key: 'pages' as const, label: 'Trang tinh', icon: Globe2 },
            { key: 'blog' as const, label: 'Blog', icon: Newspaper },
            { key: 'pricing' as const, label: 'Bang gia', icon: WalletCards },
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
          <Card className="p-16 text-center text-sm text-muted-foreground">Dang tai cau hinh public site...</Card>
        ) : tab === 'pages' ? renderPages() : tab === 'blog' ? renderBlog() : renderPricing()}
      </div>
      <Dialog open={!!postForm} onOpenChange={() => setPostForm(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{postForm?.id ? 'Sua bai blog' : 'Them bai blog'}</DialogTitle></DialogHeader>
          {postForm && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Tieu de</Label><Input className="mt-2" value={postForm.title} onChange={event => setPostForm({ ...postForm, title: event.target.value, slug: postForm.slug || slugify(event.target.value) })} /></div>
                <div><Label>Slug</Label><Input className="mt-2" value={postForm.slug} onChange={event => setPostForm({ ...postForm, slug: slugify(event.target.value) })} /></div>
                <div><Label>Category key</Label><Input className="mt-2" value={postForm.cat} onChange={event => setPostForm({ ...postForm, cat: event.target.value })} /></div>
                <div><Label>Category label</Label><Input className="mt-2" value={postForm.catLabel} onChange={event => setPostForm({ ...postForm, catLabel: event.target.value })} /></div>
                <div><Label>Tac gia</Label><Input className="mt-2" value={postForm.author} onChange={event => setPostForm({ ...postForm, author: event.target.value })} /></div>
                <div><Label>Vai tro tac gia</Label><Input className="mt-2" value={postForm.authorRole} onChange={event => setPostForm({ ...postForm, authorRole: event.target.value })} /></div>
                <div><Label>Ngay</Label><Input className="mt-2" value={postForm.date} onChange={event => setPostForm({ ...postForm, date: event.target.value })} /></div>
                <div><Label>Thoi gian doc</Label><Input className="mt-2" value={postForm.readTime} onChange={event => setPostForm({ ...postForm, readTime: event.target.value })} /></div>
              </div>
              <div><Label>Image URL</Label><Input className="mt-2" value={postForm.img} onChange={event => setPostForm({ ...postForm, img: event.target.value })} /></div>
              <div><Label>Tom tat</Label><Textarea className="mt-2 min-h-20" value={postForm.excerpt} onChange={event => setPostForm({ ...postForm, excerpt: event.target.value })} /></div>
              <div><Label>Lead</Label><Textarea className="mt-2 min-h-24" value={postForm.lead} onChange={event => setPostForm({ ...postForm, lead: event.target.value })} /></div>
              <div>
                <Label>Noi dung section</Label>
                <Textarea className="mt-2 min-h-44" value={postForm.sectionsText} onChange={event => setPostForm({ ...postForm, sectionsText: event.target.value })} placeholder="Heading\nParagraph 1\nParagraph 2\n\nHeading 2\nParagraph..." />
              </div>
              <div className="flex flex-wrap items-center gap-5 rounded-xl bg-surface-muted p-3">
                <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={postForm.published !== false} onCheckedChange={checked => setPostForm({ ...postForm, published: checked })} /> Hien thi</label>
                <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={Boolean(postForm.featured)} onCheckedChange={checked => setPostForm({ ...postForm, featured: checked })} /> Featured</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPostForm(null)} className="rounded-xl">Huy</Button>
                <Button onClick={savePostForm} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">Luu bai viet</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
