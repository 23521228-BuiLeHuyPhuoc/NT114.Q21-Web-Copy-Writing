import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: 'CopyPro · Creative Editorial Studio',
  description: 'Studio sáng tạo và biên tập nội dung AI cho đội ngũ Việt Nam.',
  icons: {
    icon: '/images/logo.svg',
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
