"use client";

import React from 'react';
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Article } from '@/lib/types';
import { cn, Dictionary, timeAgo, getDictionary } from "@/lib/utils";


const MAX_AGE_IN_MILLISECONDS = 32 * 24 * 60 * 60 * 1000; // 32 days
const HIDE_TIME_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000; // 4 days

const columns = (dict: Dictionary): ColumnDef<Article>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dict.table.title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <a 
        href={row.original.link}
        target="_blank"
        rel="noopener noreferrer" 
        className="flex items-center hover:underline"
      >
        {row.getValue("title")}
        <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    ),
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dict.table.source}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("source")}</div>,
  },
  {
    accessorKey: "pubDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {dict.table.date}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div suppressHydrationWarning>
        {new Date(row.getValue("pubDate")).toLocaleDateString(undefined, {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          weekday: 'narrow'
        })} ({timeAgo(row.getValue("pubDate"))})
      </div>
    ),
  },
];

function ArticleTable({ articles, locale='en-US' }: { articles: Article[], locale: string }) {
  const dict = getDictionary(locale);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "pubDate", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: articles,
    columns: columns(dict),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(articles.length >= 200 && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: {
        pagination: {
          pageSize: 50,
        },
      },
    }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder={dict.table.filter_titles}
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{dict.table.columns}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-2 py-1 text-left font-medium text-sm">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const pubDate = new Date(row.getValue("pubDate")).getTime();
                const currentTime = Date.now();
                const age = currentTime - pubDate;
                
                return (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "border-t hover:bg-muted/50",
                      age - MAX_AGE_IN_MILLISECONDS > 0 && "text-red-400 dark:text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/50",
                      age - HIDE_TIME_IN_MILLISECONDS > 0 && "bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100/50 dark:hover:bg-yellow-800/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2 py-1 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  {dict.table.no_results}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {articles.length >= 200 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {dict.table.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {dict.table.next}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ArticleTable; 