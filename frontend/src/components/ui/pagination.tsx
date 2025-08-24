import * as React from 'react'

import { Button } from './button'

export interface SimplePaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function SimplePagination({ page, pageCount, onPageChange }: SimplePaginationProps) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-end gap-2 py-2">
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(1)}>
        First
      </Button>
      <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </Button>
      <span className="text-sm tabular-nums">
        {page} / {pageCount}
      </span>
      <Button size="sm" variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
      <Button size="sm" variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(pageCount)}>
        Last
      </Button>
    </nav>
  )
}
