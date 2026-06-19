import { BLOG_POSTS } from '@/mocks/blog';
import { htmlToPlainText, sanitizeHtml } from '@/lib/richText';
import type { PublicBlogPost, PublicBlogSection } from '@/services/publicSiteService';

export type BlogPostForm = Omit<PublicBlogPost, 'id' | 'content'> & {
  id?: string | number;
  lead: string;
  bodyHtml: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replaceAll(String.fromCharCode(34), '&quot;')
    .replace(/'/g, '&#39;');
}

export function sectionsToHtml(sections: PublicBlogPost['content']['sections'] = []) {
  return sections
    .map(section => [
      section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : '',
      ...section.body.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`),
    ].filter(Boolean).join('\n'))
    .join('\n\n');
}

function plainTextToSections(value: string): PublicBlogSection[] {
  return value
    .split(/\n\s*\n/g)
    .map(block => block.split('\n').map(line => line.trim()).filter(Boolean))
    .filter(lines => lines.length > 0)
    .map(lines => ({ heading: lines[0], body: lines.slice(1) }));
}

export function htmlToSections(value: string): PublicBlogSection[] {
  const cleanHtml = sanitizeHtml(value);

  if (typeof window !== 'undefined' && window.DOMParser) {
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
    const sections: PublicBlogSection[] = [];
    let current: PublicBlogSection | null = null;

    const ensureSection = () => {
      if (!current) {
        current = { heading: 'Nội dung', body: [] };
        sections.push(current);
      }
      return current;
    };

    const appendText = (text: string) => {
      const normalized = text.replace(/\s+/g, ' ').trim();
      if (normalized) ensureSection().body.push(normalized);
    };

    doc.body.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        appendText(node.textContent || '');
        return;
      }

      if (!(node instanceof HTMLElement)) return;
      const tagName = node.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tagName)) {
        const heading = node.textContent?.replace(/\s+/g, ' ').trim();
        if (heading) {
          current = { heading, body: [] };
          sections.push(current);
        }
        return;
      }

      if (tagName === 'ul' || tagName === 'ol') {
        Array.from(node.querySelectorAll('li')).forEach(item => appendText(`- ${item.textContent || ''}`));
        return;
      }

      appendText(node.textContent || '');
    });

    return sections.filter(section => section.heading || section.body.length > 0);
  }

  return plainTextToSections(htmlToPlainText(cleanHtml));
}

export function normalizePosts(value: unknown): PublicBlogPost[] {
  if (!Array.isArray(value) || value.length === 0) {
    return BLOG_POSTS.map(post => ({ ...post, published: true }));
  }

  return value.map((post, index) => ({
    ...BLOG_POSTS[0],
    ...(post as Partial<PublicBlogPost>),
    id: (post as Partial<PublicBlogPost>).id || index + 1,
    content: {
      lead: (post as Partial<PublicBlogPost>).content?.lead || '',
      html: (post as Partial<PublicBlogPost>).content?.html || '',
      sections: (post as Partial<PublicBlogPost>).content?.sections || [],
    },
  }));
}

export function createEmptyBlogPostForm(): BlogPostForm {
  return {
    slug: '',
    cat: 'news',
    catLabel: 'Tin tức',
    title: '',
    excerpt: '',
    author: 'CopyPro Team',
    authorRole: 'CopyPro',
    date: new Date().toLocaleDateString('vi-VN'),
    readTime: '5 phút đọc',
    img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    featured: false,
    published: true,
    lead: '',
    bodyHtml: '',
  };
}

export function createBlogPostForm(post: PublicBlogPost): BlogPostForm {
  return {
    ...post,
    lead: post.content.lead,
    bodyHtml: post.content.html || sectionsToHtml(post.content.sections),
  };
}

export function buildBlogPostFromForm(form: BlogPostForm): PublicBlogPost {
  const slug = form.slug.trim() || slugify(form.title);
  const bodyHtml = sanitizeHtml(form.bodyHtml);

  return {
    id: form.id || Date.now(),
    slug,
    cat: form.cat.trim() || 'news',
    catLabel: form.catLabel.trim() || form.cat,
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    author: form.author.trim() || 'CopyPro Team',
    authorRole: form.authorRole.trim(),
    date: form.date.trim(),
    readTime: form.readTime.trim(),
    img: form.img.trim(),
    featured: Boolean(form.featured),
    published: form.published !== false,
    content: {
      lead: form.lead.trim(),
      html: bodyHtml,
      sections: htmlToSections(bodyHtml),
    },
  };
}
