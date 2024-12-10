export const experimental_ppr = true

import React from 'react';

import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { VercelToolbar } from '@vercel/toolbar/next';

import { Analytics } from '@vercel/analytics/react';

// Components
import { Toaster } from "@/components/ui/toaster"
// import { LocaleDetector } from './ui/locale-detector';

// Styles
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import Link from 'next/link';
// import { LoadingSources, LoadingSearchSortFilter, LoadingCardGrid } from "./ui/loading-templates";

// Metadata configurations
export const metadata: Metadata = {
  title: 'Article Search',
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
  maximumScale: 1,
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="p-4 md:p-8 overflow-clip">
            <nav className="flex justify-between items-center">
              <Link href="/">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Article Search
                </h1>
              </Link>
            </nav>
            <div className="">
              {children}
            </div>

            <div className="mt-4 md:mt-8 flex flex-col w-full items-center">
              Made by Mangle Kuo. All rights reserved.<br />
              <Suspense fallback={<div>Loading...</div>}>
                <ModeToggle />
              </Suspense>
            </div>
          </div>
          <Analytics />
          <Suspense fallback={<div>Loading...</div>}>
            <Toaster />
          </Suspense>
          {shouldInjectToolbar && <VercelToolbar />}
        </ThemeProvider>
      </body>
    </html>
  );
}
