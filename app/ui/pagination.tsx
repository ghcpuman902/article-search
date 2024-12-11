import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UnifiedSearchParams } from '@/lib/types'

interface PaginationProps {
  totalPages: number
  currentPage: number
  basePath: string
  searchParams: UnifiedSearchParams
}

export async function Pagination({ totalPages, currentPage, basePath, searchParams }: PaginationProps) {
  const maxVisiblePages = 5
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1)
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1)
  }

  const visiblePages = pageNumbers.slice(startPage - 1, endPage)

  // Helper function to create URL with all params
  const createPageUrl = (pageNum: number) => {
    // Prevent invalid page numbers
    if (pageNum < 1 || pageNum > totalPages) return '';
    
    const params = new URLSearchParams();
    
    // Maintain existing search params
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.days) params.set('days', searchParams.days);
    if (searchParams.locale) params.set('locale', searchParams.locale);
    
    // Only add page param if it's not page 1
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    }

    const queryString = params.toString();
    return `${basePath}${queryString ? '?' + queryString : ''}`;
  }

  // Add this helper function to determine if a page should be prefetched
  const shouldPrefetch = (pageNum: number) => {
    // Prefetch current page + 1 and + 2
    return pageNum === currentPage + 1 || pageNum === currentPage + 2;
  };

  return (
    <div className="flex justify-center items-center space-x-2 my-4" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
        aria-label={`Go to page ${currentPage - 1}`}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label={`Go to page ${currentPage - 1}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Link>
        ) : (
          <div>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </div>
        )}
      </Button>
      
      {startPage > 1 && (
        <>
          <Button variant="outline" size="icon" asChild>
            <Link href={createPageUrl(1)} aria-label="Go to page 1">
              1
              <span className="sr-only">Go to page 1</span>
            </Link>
          </Button>
          {startPage > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}
      
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          asChild
        >
          <Link 
            href={createPageUrl(page)}
            prefetch={shouldPrefetch(page)}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
            <span className="sr-only">Go to page {page}</span>
          </Link>
        </Button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-muted-foreground">...</span>}
          <Button variant="outline" size="icon" asChild>
            <Link href={createPageUrl(totalPages)} aria-label="Go to page last">
              {totalPages}
              <span className="sr-only">Go to page last</span>
            </Link>
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
        aria-label={`Go to page ${currentPage + 1}`}
      >
        {currentPage < totalPages ? (
          <Link 
            href={createPageUrl(currentPage + 1)} 
            aria-label={`Go to page ${currentPage + 1}`}
            prefetch={true}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Link>
        ) : (
          <div>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </div>
        )}
      </Button>
    </div>
  )
} 