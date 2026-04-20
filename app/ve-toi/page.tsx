import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Về Tôi',
  description: 'Giới thiệu về tác giả blog.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-white mb-6">Về Tôi</h1>
      <div className="prose max-w-none">
        <p>
          Chào bạn! Mình là một game designer với đam mê thiết kế cơ chế game, phân tích trải
          nghiệm người chơi, và viết tài liệu thiết kế.
        </p>
        <p>
          Blog này là nơi mình chia sẻ những suy nghĩ về game design — từ lý thuyết cơ bản đến
          phân tích chuyên sâu các tựa game nổi tiếng.
        </p>
        <h2>Liên hệ</h2>
        <p>
          Bạn có thể tìm mình tại:{' '}
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>{' '}
          |{' '}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  )
}
