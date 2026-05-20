import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { BLOG_CATEGORIES, BLOG_POSTS, TRENDING_POSTS } from '@/mocks/blog';
import { Search, Clock, ArrowRight, BookOpen, TrendingUp, Cpu, Wand2 } from 'lucide-react';

const catColor: Record<string, string> = {
  ai: 'bg-primary/10 text-primary',
  copy: 'bg-primary/10 text-primary',
  marketing: 'bg-warning/15 text-amber-800',
  case: 'bg-emerald-100 text-emerald-700',
  news: 'bg-primary/10 text-primary',
};

export function BlogPage() {
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = BLOG_POSTS.filter(post => {
    const matchCat = cat === 'all' || post.cat === cat;
    const query = search.trim().toLowerCase();
    const matchSearch = !query || post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  const featured = filtered.find(post => post.featured);
  const rest = filtered.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-card">
      <PublicNavbar />

      <section className="bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 pb-16 pt-32">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Badge className="mb-5 border border-green-700/40 bg-green-950/50 px-4 py-1.5 text-green-200">
            Kiến thức & góc nhìn
          </Badge>
          <h1 className="mb-4 text-white">
            Blog CopyPro
          </h1>
          <p className="mb-8 text-base text-muted-foreground/80">
            Hướng dẫn chuyên sâu về AI copywriting, chiến lược marketing và case study thực tế từ đội ngũ chuyên gia.
          </p>
          <div className="relative mx-auto max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-12 rounded-lg border-white/20 bg-card/10 pl-11 text-white backdrop-blur placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <div className="sticky top-[70px] z-30 border-b border-border bg-card shadow-sm">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {BLOG_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setCat(category.id)}
                className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  cat === category.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group block overflow-hidden rounded-lg border border-border transition-all hover:border-primary/20 hover:shadow-xl"
              >
                <div className="h-64 overflow-hidden">
                  <ImageWithFallback
                    src={featured.img}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <div className="mb-4 flex items-center gap-2">
                    <Badge className={`${catColor[featured.cat]} border-0 text-xs`}>{featured.catLabel}</Badge>
                    <Badge className="border-0 bg-warning/15 text-xs text-amber-700">Nổi bật</Badge>
                  </div>
                  <h2 className="mb-3 text-foreground transition-colors group-hover:text-primary" style={{ fontSize: '1.35rem' }}>
                    {featured.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-foreground/70">{featured.excerpt}</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {featured.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{featured.author}</p>
                        <p className="text-xs text-muted-foreground">{featured.date} · {featured.readTime}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                      Đọc ngay <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {rest.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-lg border border-border transition-all hover:border-primary/20 hover:shadow-lg"
                >
                  <div className="h-44 overflow-hidden">
                    <ImageWithFallback
                      src={post.img}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <Badge className={`${catColor[post.cat]} mb-3 border-0 text-xs`}>{post.catLabel}</Badge>
                    <h3 className="mb-2 text-foreground transition-colors group-hover:text-primary" style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                      {post.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {post.author.charAt(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">{post.author}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                        <Clock className="h-3 w-3" />{post.readTime}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground/80">
                <BookOpen className="mx-auto mb-4 h-14 w-14 opacity-30" />
                <p className="font-medium">Không tìm thấy bài viết phù hợp</p>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="rounded-lg border border-border bg-surface-muted p-6">
              <h3 className="mb-5 flex items-center gap-2 text-foreground" style={{ fontSize: '1rem' }}>
                <TrendingUp className="h-4 w-4 text-primary" /> Đọc nhiều nhất
              </h3>
              <div className="space-y-4">
                {TRENDING_POSTS.map((post, index) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="group flex gap-4">
                    <span
                      className="flex-shrink-0 text-2xl font-bold"
                      style={{ color: index === 0 ? '#16723a' : '#d7e3d1' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">{post.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground/80">{post.reads} lượt đọc</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white">
              <Wand2 className="mb-4 h-8 w-8 opacity-80" />
              <h3 className="mb-2 text-white" style={{ fontSize: '1.1rem' }}>Nhận bài viết mới nhất</h3>
              <p className="mb-4 text-sm leading-relaxed text-green-100">
                Mỗi tuần một bài hướng dẫn chuyên sâu về AI copywriting. Miễn phí.
              </p>
              <Input
                placeholder="Email của bạn"
                className="mb-3 rounded-lg border-white/30 bg-card/20 text-white placeholder:text-green-200"
              />
              <button className="w-full rounded-lg bg-card py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
                Đăng ký ngay
              </button>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-6">
              <h3 className="mb-4 flex items-center gap-2 text-foreground" style={{ fontSize: '1rem' }}>
                <Cpu className="h-4 w-4 text-primary" /> Tài nguyên nhanh
              </h3>
              {[
                { label: 'Tài liệu API đầy đủ', href: '/login' },
                { label: 'Template library miễn phí', href: '/login' },
                { label: 'Liên hệ hỗ trợ', href: '/contact' },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center justify-between border-b border-border py-2.5 text-sm text-foreground/80 transition-colors last:border-0 hover:text-primary"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
