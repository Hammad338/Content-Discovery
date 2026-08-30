import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme.context';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Content Discovery',
  description: 'Discover and search content with AI-powered semantic search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}