import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UnifiedSearchParams } from '@/lib/types'
import { Suspense } from 'react'
import { PaginationButton } from './pagination-button'

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

  const createPageUrl = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return '';
    
    const params = new URLSearchParams();
    
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.days) params.set('days', searchParams.days);
    if (searchParams.locale) params.set('locale', searchParams.locale);
    
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    }

    const queryString = params.toString();
    return `${basePath}${queryString ? '?' + queryString : ''}`;
  }

  const renderPageButton = (page: number) => {
    const url = createPageUrl(page)
    return (
      <Suspense 
        key={`page-${page}`}
        fallback={
          <Button variant="outline" size="icon" asChild>
            <Link href={url} aria-label={`Page ${page}`} scroll={false}>
              {page}
              <span className="sr-only">Page {page}</span>
            </Link>
          </Button>
        }
      >
        <PaginationButton 
          href={url} 
          aria-label={`Page ${page}`}
          isActive={currentPage === page}
        >
          {page}
          <span className="sr-only">Page {page}</span>
        </PaginationButton>
      </Suspense>
    )
  }

  return (
    <nav className="flex justify-center items-center space-x-2 my-8" aria-label="Pagination">
      <Suspense 
        key="prev"
        fallback={
          <Button variant="outline" size="icon" disabled={currentPage <= 1} asChild={currentPage > 1}>
            {currentPage > 1 ? (
              <Link href={createPageUrl(currentPage - 1)} aria-label={`Go to page ${currentPage - 1}`} scroll={false}>
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
        }
      >
        <PaginationButton
          href={createPageUrl(currentPage - 1)}
          aria-label={`Go to page ${currentPage - 1}`}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </PaginationButton>
      </Suspense>

      {startPage > 1 && (
        <>
          {renderPageButton(1)}
          {startPage > 2 && <span key="start-ellipsis" className="text-muted-foreground">...</span>}
        </>
      )}
      
      {visiblePages.map((page) => renderPageButton(page))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span key="end-ellipsis" className="text-muted-foreground">...</span>}
          {renderPageButton(totalPages)}
        </>
      )}

      <Suspense 
        key="next"
        fallback={
          <Button variant="outline" size="icon" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
            {currentPage < totalPages ? (
              <Link href={createPageUrl(currentPage + 1)} aria-label={`Go to page ${currentPage + 1}`} scroll={false}>
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
        }
      >
        <PaginationButton
          href={createPageUrl(currentPage + 1)}
          aria-label={`Go to page ${currentPage + 1}`}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </PaginationButton>
      </Suspense>
    </nav>
  )
} 