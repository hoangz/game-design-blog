import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Game Design Blog
        </p>
        <nav className="flex gap-5">
          {[
            { href: '/bai-viet', label: 'Bài Viết' },
            { href: '/chu-de', label: 'Chủ Đề' },
            { href: '/ve-toi', label: 'Về Tôi' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
