// ============================================
// PAGINATION COMPONENT
// ============================================

"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { getPageRange, getVisibleRangeText, PAGE_SIZES } from "@/lib/search/pagination"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  showPageSize?: boolean
  className?: string
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  hasMore,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  className,
}: PaginationProps) {
  const pages = getPageRange(page, totalPages)
  const rangeText = getVisibleRangeText(page, pageSize, total)

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {rangeText}
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        
        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, i) => (
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                className="min-w-[36px]"
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          ))}
        </div>
        
        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          disabled={!hasMore}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
        
        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="hidden sm:flex"
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="size-4" />
        </Button>
        
        {/* Page Size */}
        {showPageSize && (
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="w-[80px] ml-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size} / стр
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
