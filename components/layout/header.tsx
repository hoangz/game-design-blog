'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/ui/search-bar'

const navLinks = [
  { href: '/bai-viet', label: 'Bài Viết' },
  { href: '/chu-de', label: 'Chủ Đề' },
  { href: '/ve-toi', label: 'Về Tôi' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          GD<span className="text-white">Blog</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Tìm kiếm"
            className="text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            <Search size={18} />
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[var(--muted-foreground)] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </header>
  )
}
