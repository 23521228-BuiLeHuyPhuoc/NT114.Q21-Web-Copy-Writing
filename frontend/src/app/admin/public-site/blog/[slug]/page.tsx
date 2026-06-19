'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { BlogPostEditor } from '../BlogPostEditor';

export default function EditBlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <AdminRoute path="/admin/public-site">
      <BlogPostEditor mode="edit" slug={decodeURIComponent(params.slug)} />
    </AdminRoute>
  );
}
