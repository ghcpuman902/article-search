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

// Metadata configurations
export const metadata: Metadata = {
  title: {
    template: "%s | ArticleSearch",
    default: "ArticleSearch",
  },
  description: 'The web application fetches the latest articles from varies rss sources, and sort the result based on relevance compare to user query using OpenAI Embedding.',
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
  // const shouldInjectToolbar = process.env.NODE_ENV === 'development';
  const shouldInjectToolbar = false;

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        {/* <Suspense fallback={<>THEME LOADING...</>}> */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="p-4 md:p-8 overflow-clip">
              <Suspense fallback={
                <header role="banner">
                  <nav className="flex justify-between items-center">
                    <Link href="/">
                      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">ArticleSearch</h1>
                    </Link>
                  </nav>
                </header>
              }>
                <Header />
              </Suspense>
              
              <main role="main">
                <Suspense fallback={<div className="text-center text-foreground">Loading Root Layout Children...</div>}>
                  {children}
                </Suspense>
              </main>
            </div>
            
            <Suspense fallback={<div>Loading...</div>}>
              <Toaster />
              <Analytics />
              {shouldInjectToolbar && <VercelToolbar />}
            </Suspense>
          </ThemeProvider>
        {/* </Suspense> */}
      </body>
    </html>
  );
}
