'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage('Đăng ký thành công! Cảm ơn bạn.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(data.error ?? 'Có lỗi xảy ra.')
    }
  }

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-white mb-2">Nhận bài mới qua email</h2>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">
        Đăng ký để không bỏ lỡ những bài viết mới nhất về game design.
      </p>

      {status === 'success' ? (
        <p className="text-[var(--accent)] font-medium">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="flex-1 bg-[var(--muted)] text-sm px-4 py-2.5 rounded-lg outline-none text-white placeholder:text-[var(--muted-foreground)] border border-[var(--border)] focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'px-5 py-2.5 bg-[var(--accent)] text-black text-sm font-semibold rounded-lg transition-colors whitespace-nowrap',
              status === 'loading' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--accent-hover)]',
            )}
          >
            {status === 'loading' ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
      )}

      {status === 'error' && <p className="text-red-400 text-sm mt-2">{message}</p>}
    </section>
  )
}
