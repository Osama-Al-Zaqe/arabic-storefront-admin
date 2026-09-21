import { Inter, Tajawal } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'متجر عربي',
  description: 'متجر إلكتروني عربي مع لوحة إدارة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.variable}>{children}</body>
    </html>
  );
}
