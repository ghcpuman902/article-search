import React, { Suspense } from "react";
import { LoadingSources, LoadingSearchSortFilter, LoadingCardGrid } from "../ui/loading-templates";

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<><LoadingSources /><LoadingSearchSortFilter /><LoadingCardGrid /></>}>
        {children}
      </Suspense>
    </>
  );
} 