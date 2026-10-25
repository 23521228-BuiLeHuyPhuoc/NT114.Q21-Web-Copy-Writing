import type { Metadata } from 'next';
import { JetBrains_Mono, Lora } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/index.css';

const displayFont = Lora({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700'], variable: '--font-display-vn', display: 'swap' });
const monoFont = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '700'], variable: '--font-mono-vn', display: 'swap' });

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
    <html lang="vi" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
