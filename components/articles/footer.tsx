import { ThemeToggle } from "@/components/theme-toggle";
import { Suspense } from "react";

export function Footer() {
    return (
        <footer role="contentinfo" className="w-full border-t border-zinc-200 dark:border-zinc-800 mt-8 pb-12">
            <div className="w-full pt-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
                <p className="text-base md:text-lg text-zinc-400 dark:text-zinc-500 text-center md:text-left [line-height:1rem] md:[line-height:1.25rem]">
                    Made by Mangle Kuo. All rights reserved.
                </p>
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="flex justify-center md:justify-end">
                        <ThemeToggle />
                    </div>
                </Suspense>
            </div>
        </footer>
    )
}
