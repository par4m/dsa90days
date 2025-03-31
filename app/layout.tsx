import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ProblemsProvider } from '@/context/ProblemsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DSA90 - 90 Days DSA Challenge',
  description: 'Master Data Structures and Algorithms in 90 days for placements',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProblemsProvider>
            {children}
          </ProblemsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 