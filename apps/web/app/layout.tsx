import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Клиника Плюс',
  description: 'Система нарядов на выезд бригад',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${inter.variable} page`}>
      <body className="page__body">{children}</body>
    </html>
  );
}
