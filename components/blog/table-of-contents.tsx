'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('.prose h2, .prose h3'))
    const tocItems: TocItem[] = headings.map((el) => ({
      id: el.id,
      text: el.textContent ?? '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    setItems(tocItems)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <aside className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
        Nội dung
      </p>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'block text-sm transition-colors leading-snug py-0.5',
              item.level === 3 && 'pl-3',
              activeId === item.id
                ? 'text-[var(--accent)] font-medium'
                : 'text-[var(--muted-foreground)] hover:text-white',
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
