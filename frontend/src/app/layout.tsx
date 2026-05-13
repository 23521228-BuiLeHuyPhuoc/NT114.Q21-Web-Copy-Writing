import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: 'CopyPro',
  description: 'AI Copywriter platform',
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
