import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AntdProvider } from '@/providers/AntdProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Financial Management System',
  description: 'Invoice, Payroll & Expense Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
            <ThemeProvider>
              <AntdProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </AntdProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
