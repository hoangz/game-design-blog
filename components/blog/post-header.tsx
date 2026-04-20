import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'
import { calculateReadingTime } from '@/lib/reading-time'

interface PostHeaderProps {
  title: string
  excerpt?: string
  coverImage?: { asset: { _ref: string } }
  publishedAt?: string
  categories?: { title: string; slug: string }[]
  content?: any[]
}

export function PostHeader({
  title,
  excerpt,
  coverImage,
  publishedAt,
  categories,
  content,
}: PostHeaderProps) {
  const readingTime = content ? calculateReadingTime(JSON.stringify(content)) : 1
  const imageUrl = coverImage ? urlForImage(coverImage).width(1400).height(700).url() : null

  return (
    <header className="mb-10">
      {/* Cover image */}
      {imageUrl && (
        <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 mb-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/chu-de/${cat.slug}`}
              className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full hover:bg-[var(--accent)]/20 transition-colors"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
        {title}
      </h1>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mb-4">{excerpt}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        {publishedAt && <span>{formatDate(publishedAt)}</span>}
        <span>·</span>
        <span>{readingTime} phút đọc</span>
      </div>

      <div className="mt-8 border-t border-[var(--border)]" />
    </header>
  )
}
