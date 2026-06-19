'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { BlogPostEditor } from '../BlogPostEditor';

export default function NewBlogPostPage() {
  return (
    <AdminRoute path="/admin/public-site">
      <BlogPostEditor mode="create" />
    </AdminRoute>
  );
}
