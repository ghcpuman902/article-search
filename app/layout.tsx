export const experimental_ppr = true

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
import { LoadingCardGrid, LoadingSources } from "./ui/loading-templates";

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

// // Font configurations
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <div className="p-4 md:p-8 overflow-clip">
          <nav className="flex justify-between items-center p-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Article Search
            </h1>
          </nav>
          <Suspense fallback={<><LoadingSources /><LoadingCardGrid /></>}>
            {children}
          </Suspense>

          <div className="hidden">
            {/* Sample colors to help tailwind treeshaking correctly*/}
            <div className="bg-amber-100 dark:bg-amber-600 hover:bg-amber-200 dark:hover:bg-amber-700 active:bg-amber-300 dark:active:bg-amber-700" />
            <div className="bg-sky-100 dark:bg-sky-400 hover:bg-sky-200 dark:hover:bg-sky-500 active:bg-sky-300 dark:active:bg-sky-500" />
            <div className="bg-sky-200 dark:bg-sky-600 hover:bg-sky-300 dark:hover:bg-sky-700 active:bg-sky-400 dark:active:bg-sky-700" />
            <div className="bg-blue-200 dark:bg-blue-600 hover:bg-blue-300 dark:hover:bg-blue-700 active:bg-blue-400 dark:active:bg-blue-700" />
            <div className="bg-emerald-200 dark:bg-emerald-600 hover:bg-emerald-300 dark:hover:bg-emerald-700 active:bg-emerald-400 dark:active:bg-emerald-700" />
            <div className="bg-violet-200 dark:bg-violet-600 hover:bg-violet-300 dark:hover:bg-violet-700 active:bg-violet-400 dark:active:bg-violet-700" />
            <div className="bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-700 active:bg-neutral-400 dark:active:bg-neutral-700" />
            {/* Sample border colors to help tailwind treeshaking correctly*/}
            <div className="border-amber-200 dark:border-amber-500" />
            <div className="border-sky-200 dark:border-sky-300" />
            <div className="border-sky-300 dark:border-sky-500" />
            <div className="border-blue-300 dark:border-blue-500" />
            <div className="border-emerald-300 dark:border-emerald-500" />
            <div className="border-violet-300 dark:border-violet-500" />
            <div className="border-neutral-300 dark:border-neutral-500" />
          </div>
          <div className="mt-4 md:mt-8 flex flex-col w-full items-center">
            Made by Mangle Kuo. All rights reserved.<br />
          </div>
        </div>
        <Analytics />
        <Suspense fallback={<div>Loading...</div>}>
          <Toaster />
        </Suspense>
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
