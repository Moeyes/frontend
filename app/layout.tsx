import type { Metadata } from 'next';
import { Battambang, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from '@/core/auth';
import { LanguageProvider } from '@/core/i18n';
import './globals.css';

const battambang = Battambang({
  weight: ['400', '700'],
  subsets: ['khmer'],
  variable: '--font-battambang',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធគ្រប់គ្រងព្រឹត្តិការណ៍កីឡាជាតិ',
  description: 'Cambodia Ministry of Education, Youth and Sport — National Sports Event Management',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${battambang.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <LanguageProvider initialLocale={locale as 'kh' | 'en'}>
                {children}
                <Toaster richColors position="top-right" />
              </LanguageProvider>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
