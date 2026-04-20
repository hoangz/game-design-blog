'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface SearchResult {
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  categories?: { title: string; slug: string }[]
}

interface SearchBarProps {
  onClose: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value }),
        })
        const data = await res.json()
        setResults(data.results ?? [])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
      <div className="mx-auto max-w-5xl">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Tìm bài viết..."
            className="w-full bg-[var(--muted)] text-sm pl-9 pr-4 py-2 rounded-md outline-none text-white placeholder:text-[var(--muted-foreground)]"
          />
          <button
            onClick={onClose}
            className="absolute right-3 text-[var(--muted-foreground)] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {results.map((result) => (
              <Link
                key={result.slug}
                href={`/bai-viet/${result.slug}`}
                onClick={onClose}
                className="block px-4 py-3 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-0"
              >
                <p className="text-sm font-medium text-white">{result.title}</p>
                {result.publishedAt && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {formatDate(result.publishedAt)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {loading && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] text-center py-2">
            Đang tìm...
          </p>
        )}

        {!loading && query && results.length === 0 && (
          <p className="mt-2 text-xs text-[var(--muted-foreground)] text-center py-2">
            Không tìm thấy kết quả.
          </p>
        )}
      </div>
    </div>
  )
}
