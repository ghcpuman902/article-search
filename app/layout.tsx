export const experimental_ppr = true

import React from 'react';

import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { VercelToolbar } from '@vercel/toolbar/next';

import { Analytics } from '@vercel/analytics/react';

// Components
import { Toaster } from "@/components/ui/toaster"

// Styles
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '../components/articles/header';
import { Link } from 'lucide-react';
// import { ReactScan } from '@/components/react-scan';

// Metadata configurations
export const metadata: Metadata = {
  title: {
    template: "%s | ArticleSearch",
    default: "ArticleSearch",
  },
  description: 'ArticleSearch aggregates and ranks articles from diverse RSS sources, using OpenAI embeddings to intelligently sort results by relevance to your search query.',
  creator: 'Mangle Kuo',
  authors: [
    {
      name: 'Mangle Kuo',
      url: 'https://github.com/ghcpuman902/',
    }
  ],
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0, 0%, 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(20, 14.3%, 4.1%)' }
  ],
  width: 'device-width',
  initialScale: 1,
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="px-4 py-2 md:px-8 md:py-4">
            <Suspense fallback={<header role="banner">
              <nav className="flex justify-between items-center mb-2 md:mb-4">
                <Link href="/">
                  <h1 className="text-5xl font-extrabold tracking-tight">ArticleSearch</h1>
                </Link>
              </nav>
            </header>}>
              <Header />
            </Suspense>

            <Suspense fallback={<div className="text-center text-foreground">Loading Root Layout Children...</div>}>
              {children}
            </Suspense>
          </div>

          <Suspense>
            <Toaster />
            <Analytics />
            {shouldInjectToolbar && <VercelToolbar />}
            {/* <ReactScan /> */}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
