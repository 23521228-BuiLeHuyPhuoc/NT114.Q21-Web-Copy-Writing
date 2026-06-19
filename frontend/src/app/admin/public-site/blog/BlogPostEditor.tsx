'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useRouter } from 'next/navigation';
import { Link } from '@/lib/next-router-compat';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import {
  buildBlogPostFromForm,
  createBlogPostForm,
  createEmptyBlogPostForm,
  normalizePosts,
  slugify,
  type BlogPostForm,
} from '@/lib/publicBlog';
import { publicSiteService, type PublicBlogPost, type PublicPageRecord } from '@/services/publicSiteService';
import { ArrowLeft, Eye, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

interface BlogPostEditorProps {
  slug?: string;
  mode: 'create' | 'edit';
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function placePostInList(posts: PublicBlogPost[], nextPost: PublicBlogPost, originalSlug?: string) {
  const originalIndex = posts.findIndex(post => post.slug === originalSlug || post.id === nextPost.id);
  const filtered = posts.filter((post, index) => (
    index !== originalIndex && post.slug !== nextPost.slug && post.id !== nextPost.id
  ));
  const insertIndex = originalIndex >= 0 ? originalIndex : 0;
  const nextPosts = [
    ...filtered.slice(0, insertIndex),
    nextPost,
    ...filtered.slice(insertIndex),
  ];

  if (!nextPost.featured) return nextPosts;
  return nextPosts.map(post => (post.id === nextPost.id ? post : { ...post, featured: false }));
}

export function BlogPostEditor({ slug, mode }: BlogPostEditorProps) {
  const router = useRouter();
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const [blogPage, setBlogPage] = useState<PublicPageRecord | null>(null);
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [form, setForm] = useState<BlogPostForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pages = await publicSiteService.listAdminPages();
      const nextBlogPage = pages.find(page => page.key === 'blog') || null;
      const nextPosts = normalizePosts(nextBlogPage?.content?.posts);

      setBlogPage(nextBlogPage);
      setPosts(nextPosts);

      if (mode === 'create') {
        setForm(createEmptyBlogPostForm());
        return;
      }

      const post = nextPosts.find(item => item.slug === slug);
      setForm(post ? createBlogPostForm(post) : null);
      if (!post) toast.error('Không tìm thấy bài blog cần sửa');
    } catch (error) {
      const fallbackPosts = normalizePosts(undefined);
      setBlogPage(null);
      setPosts(fallbackPosts);

      if (mode === 'create') {
        setForm(createEmptyBlogPostForm());
      } else {
        const post = fallbackPosts.find(item => item.slug === slug);
        setForm(post ? createBlogPostForm(post) : null);
      }

      toast.error(getErrorMessage(error, 'Không tải được dữ liệu blog'));
    } finally {
      setLoading(false);
    }
  }, [mode, slug]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateForm = <K extends keyof BlogPostForm>(key: K, value: BlogPostForm[K]) => {
    setForm(current => (current ? { ...current, [key]: value } : current));
  };

  const uploadImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Chỉ hỗ trợ file ảnh');
    }

    const uploaded = await publicSiteService.uploadAdminImage(file);
    return uploaded.url;
  }, []);

  const handleFeaturedImageChange = async (file?: File) => {
    if (!file) return;

    setFeaturedImageUploading(true);
    try {
      const url = await uploadImageFile(file);
      updateForm('img', url);
      toast.success('Đã tải ảnh lên Cloudinary');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không upload được ảnh'));
    } finally {
      setFeaturedImageUploading(false);
      if (featuredImageInputRef.current) featuredImageInputRef.current.value = '';
    }
  };

  const savePost = async () => {
    if (!form) return;

    const nextSlug = form.slug.trim() || slugify(form.title);
    if (!form.title.trim() || !nextSlug) {
      toast.error('Cần nhập tiêu đề và slug bài viết');
      return;
    }

    const duplicate = posts.find(post => (
      post.slug === nextSlug && post.slug !== slug && post.id !== form.id
    ));
    if (duplicate) {
      toast.error('Slug bài viết đã tồn tại');
      return;
    }

    const nextPost = buildBlogPostFromForm({ ...form, slug: nextSlug });
    const nextPosts = mode === 'create'
      ? placePostInList(posts, nextPost)
      : placePostInList(posts, nextPost, slug);

    setSaving(true);
    try {
      const saved = await publicSiteService.updateAdminPage('blog', {
        type: 'blog',
        title: blogPage?.title || 'Blog',
        description: blogPage?.description || 'Danh sách bài viết public',
        content: { ...(blogPage?.content || {}), posts: nextPosts },
        isPublished: blogPage?.isPublished !== false,
        sortOrder: blogPage?.sortOrder || 50,
      });

      setBlogPage(saved);
      setPosts(normalizePosts(saved.content.posts));
      toast.success(mode === 'create' ? 'Đã tạo bài blog' : 'Đã lưu bài blog');
      router.push('/admin/public-site?tab=blog');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không lưu được bài blog'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Link to="/admin/public-site?tab=blog" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Quay lại danh sách blog
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {mode === 'create' ? 'Thêm bài blog' : 'Sửa nội dung blog'}
              </h1>
              {form?.published === false ? <Badge variant="outline">Ẩn</Badge> : <Badge className="border-0 bg-emerald-100 text-emerald-700">Đang hiện</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {form?.slug && (
              <Link to={`/blog/${form.slug}`}>
                <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Xem public</Button>
              </Link>
            )}
            <Button onClick={() => void savePost()} disabled={saving || loading || !form} className="gap-2 bg-primary text-white hover:bg-green-700">
              <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu bài viết'}
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải bài blog...</Card>
        ) : !form ? (
          <Card className="p-12 text-center">
            <p className="text-sm text-muted-foreground">Không tìm thấy bài blog cần sửa.</p>
            <Link to="/admin/public-site?tab=blog" className="mt-4 inline-flex">
              <Button variant="outline">Quay lại danh sách</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <Card className="p-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
                  <div>
                    <Label>Tiêu đề</Label>
                    <Input
                      className="mt-2"
                      value={form.title}
                      onChange={event => setForm(current => current ? {
                        ...current,
                        title: event.target.value,
                        slug: current.slug || slugify(event.target.value),
                      } : current)}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input className="mt-2 font-mono text-sm" value={form.slug} onChange={event => updateForm('slug', slugify(event.target.value))} />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Tóm tắt</Label>
                  <Textarea className="mt-2 min-h-20" value={form.excerpt} onChange={event => updateForm('excerpt', event.target.value)} />
                </div>

                <div className="mt-4">
                  <Label>Mở bài</Label>
                  <Textarea className="mt-2 min-h-24" value={form.lead} onChange={event => updateForm('lead', event.target.value)} />
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Nội dung bài viết</h2>
                    <p className="text-sm text-muted-foreground">Soạn trực tiếp bằng TinyMCE, nội dung sẽ được lưu dạng HTML.</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <Editor
                    apiKey={tinymceApiKey}
                    value={form.bodyHtml}
                    init={{
                      height: 560,
                      menubar: 'file edit view insert format tools table',
                      branding: false,
                      statusbar: true,
                      plugins: 'autolink lists link image table code wordcount autoresize preview searchreplace visualblocks fullscreen',
                      toolbar: 'undo redo | blocks | bold italic underline blockquote | alignleft aligncenter alignright | bullist numlist | link image table | removeformat | preview fullscreen code',
                      automatic_uploads: true,
                      images_reuse_filename: true,
                      images_file_types: 'jpeg,jpg,png,gif,webp',
                      images_upload_handler: async (blobInfo: { blob: () => Blob; filename: () => string }) => {
                        const blob = blobInfo.blob();
                        const file = new File([blob], blobInfo.filename(), { type: blob.type });
                        return uploadImageFile(file);
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
                            const url = await uploadImageFile(file);
                            callback(url, { alt: file.name, title: file.name });
                            toast.success('Đã tải ảnh lên Cloudinary');
                          } catch (error) {
                            toast.error(getErrorMessage(error, 'Không upload được ảnh'));
                          }
                        };
                        input.click();
                      },
                      content_style: 'body { font-family: Inter, Arial, sans-serif; font-size: 15px; line-height: 1.75; color: #1f2937; } p { margin: 0 0 14px; } ul, ol { margin: 0 0 14px 22px; padding: 0; } li { margin: 4px 0; } h1, h2, h3 { margin: 20px 0 12px; line-height: 1.3; color: #111827; } blockquote { margin: 16px 0; padding-left: 14px; border-left: 3px solid #16a34a; color: #374151; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #d1d5db; padding: 8px; }',
                    }}
                    onEditorChange={(value: string) => updateForm('bodyHtml', value)}
                  />
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="p-5">
                <h2 className="text-lg font-bold text-foreground">Xuất bản</h2>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm font-medium">
                    <span>Hiển thị trên website</span>
                    <Switch checked={form.published !== false} onCheckedChange={checked => updateForm('published', checked)} />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm font-medium">
                    <span>Bài nổi bật</span>
                    <Switch checked={Boolean(form.featured)} onCheckedChange={checked => updateForm('featured', checked)} />
                  </label>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-lg font-bold text-foreground">Thông tin hiển thị</h2>
                <div className="mt-4 grid gap-4">
                  <div>
                    <Label>Key danh mục</Label>
                    <Input className="mt-2" value={form.cat} onChange={event => updateForm('cat', event.target.value)} />
                  </div>
                  <div>
                    <Label>Tên danh mục</Label>
                    <Input className="mt-2" value={form.catLabel} onChange={event => updateForm('catLabel', event.target.value)} />
                  </div>
                  <div>
                    <Label>Tác giả</Label>
                    <Input className="mt-2" value={form.author} onChange={event => updateForm('author', event.target.value)} />
                  </div>
                  <div>
                    <Label>Vai trò tác giả</Label>
                    <Input className="mt-2" value={form.authorRole} onChange={event => updateForm('authorRole', event.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <Label>Ngày</Label>
                      <Input className="mt-2" value={form.date} onChange={event => updateForm('date', event.target.value)} />
                    </div>
                    <div>
                      <Label>Thời gian đọc</Label>
                      <Input className="mt-2" value={form.readTime} onChange={event => updateForm('readTime', event.target.value)} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-foreground">Ảnh đại diện</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => featuredImageInputRef.current?.click()}
                    disabled={featuredImageUploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" /> {featuredImageUploading ? 'Đang upload...' : 'Upload ảnh'}
                  </Button>
                </div>
                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={event => void handleFeaturedImageChange(event.target.files?.[0])}
                />
                <Input className="mt-4" value={form.img} onChange={event => updateForm('img', event.target.value)} />
                {form.img && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-muted">
                    <ImageWithFallback src={form.img} alt={form.title || 'Ảnh bài blog'} className="h-44 w-full object-cover" />
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
