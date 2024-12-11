import { ThemeToggle } from "@/components/theme-toggle";
import { Suspense } from "react";

export function Footer() {
    return (
        <footer role="contentinfo" className="mt-4 md:mt-8 flex flex-col w-full items-center gap-2">
            Made by Mangle Kuo. All rights reserved.<br />
            <Suspense fallback={<div>Loading...</div>}>
                <ThemeToggle />
            </Suspense>
        </footer>
    )
}
