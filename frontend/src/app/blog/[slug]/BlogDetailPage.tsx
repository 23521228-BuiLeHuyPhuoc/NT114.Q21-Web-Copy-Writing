import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { BLOG_POSTS } from '@/mocks/blog';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';

const catColor: Record<string, string> = {
  ai: 'bg-primary/10 text-primary',
  copy: 'bg-primary/10 text-primary',
  marketing: 'bg-warning/15 text-amber-800',
  case: 'bg-emerald-100 text-emerald-700',
  news: 'bg-primary/10 text-primary',
};

export function BlogDetailPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(item => item.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = BLOG_POSTS
    .filter(item => item.slug !== post.slug && item.cat === post.cat)
    .concat(BLOG_POSTS.filter(item => item.slug !== post.slug && item.cat !== post.cat))
    .slice(0, 3);

  return (
    <div className="min-h-screen overflow-x-hidden bg-card">
      <PublicNavbar />

      <section className="max-w-full bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 pb-14 pt-28 md:pb-20 md:pt-32">
        <div className="mx-auto max-w-6xl min-w-0 px-5 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-green-200 transition-colors hover:text-green-100">
              <ArrowLeft className="h-4 w-4" />
              Quay lại Blog
            </Link>
            <Badge className={`${catColor[post.cat]} border-0`}>{post.catLabel}</Badge>
          </div>

          <div className="max-w-5xl min-w-0">
            <h1
              className="mb-6 max-w-full break-words text-[1.75rem] leading-[1.16] text-white sm:text-[2.45rem] md:text-[3.05rem] lg:text-[3.45rem]"
            >
              {post.title}
            </h1>
            <p className="max-w-3xl break-words text-base leading-7 text-muted-foreground/60 md:text-lg md:leading-8">
              {post.excerpt}
            </p>
          </div>

          <div className="mt-8 flex max-w-full flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground/80">
            <span className="flex min-w-0 items-center gap-2">
              <User className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="break-words">{post.author} · {post.authorRole}</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
              {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl min-w-0 px-5 py-10 md:py-14 lg:px-8">
        <div className="mb-12 overflow-hidden rounded-lg border border-border bg-surface-muted shadow-sm">
          <ImageWithFallback src={post.img} alt={post.title} className="h-60 w-full object-cover sm:h-80 lg:h-[430px]" />
        </div>

        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,780px)_300px] lg:items-start lg:justify-between lg:gap-14">
          <article className="min-w-0">
            <div className="mb-10 max-w-full rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-5 md:px-6">
              <p className="break-words text-base leading-8 text-foreground/80 md:text-lg md:leading-9">
                {post.content.lead}
              </p>
            </div>

            <div className="space-y-10">
              {post.content.sections.map(section => (
                <section key={section.heading}>
                  <h2 className="mb-4 max-w-full break-words text-[1.35rem] leading-snug text-foreground md:text-[1.75rem]">
                    {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.body.map(paragraph => (
                      <p key={paragraph} className="max-w-full break-words text-base leading-8 text-foreground/70 md:leading-9">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-lg border border-border bg-surface-muted p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Tác giả</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {post.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-foreground">{post.author}</p>
                  <p className="break-words text-xs text-muted-foreground">{post.authorRole}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Bài liên quan</p>
              <div className="space-y-4">
                {relatedPosts.map(item => (
                  <Link key={item.slug} to={`/blog/${item.slug}`} className="group block border-b border-border pb-4 last:border-0 last:pb-0">
                    <Badge className={`${catColor[item.cat]} mb-2 border-0 text-xs`}>{item.catLabel}</Badge>
                    <p className="break-words text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/80">{item.readTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <section className="border-t border-border bg-surface-muted py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-5 lg:flex-row lg:items-center lg:px-8">
          <div className="min-w-0">
            <p className="break-words text-base font-semibold text-foreground">Muốn tạo nội dung như bài viết này nhanh hơn?</p>
            <p className="mt-1 break-words text-sm text-muted-foreground">Thử CopyPro để tạo và tối ưu nhiều biến thể copy trong vài giây.</p>
          </div>
          <Link to="/register" className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700">
            Dùng thử miễn phí
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
