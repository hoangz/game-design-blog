import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  title: string
  slug: string
  excerpt?: string
  coverImage?: { asset: { _ref: string } }
  publishedAt?: string
  categories?: { title: string; slug: string }[]
  tags?: string[]
  compact?: boolean
}

export function PostCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  categories,
  compact,
}: PostCardProps) {
  const imageUrl = coverImage ? urlForImage(coverImage).width(800).height(450).url() : null

  return (
    <Link href={`/bai-viet/${slug}`} className="group block">
      <article className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)]/40 transition-all duration-300">
        {/* Cover image */}
        {imageUrl ? (
          <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div
            className={`bg-gradient-to-br from-[var(--muted)] to-[var(--border)] ${compact ? 'h-40' : 'h-52'} flex items-center justify-center`}
          >
            <span className="text-[var(--muted-foreground)] text-4xl font-display font-bold opacity-20">
              GD
            </span>
          </div>
        )}

        <div className="p-5">
          {/* Category badge */}
          {categories?.[0] && (
            <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full mb-2">
              {categories[0].title}
            </span>
          )}

          {/* Title */}
          <h3
            className={`font-display font-bold text-white group-hover:text-[var(--accent)] transition-colors leading-snug ${compact ? 'text-base' : 'text-lg'} mb-2`}
          >
            {title}
          </h3>

          {/* Excerpt */}
          {!compact && excerpt && (
            <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">{excerpt}</p>
          )}

          {/* Date */}
          {publishedAt && (
            <p className="text-xs text-[var(--muted-foreground)]">{formatDate(publishedAt)}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
