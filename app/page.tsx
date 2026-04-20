import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { allPostsQuery, featuredPostQuery } from '@/sanity/queries'
import { PostCard } from '@/components/blog/post-card'
import { NewsletterForm } from '@/components/ui/newsletter-form'
import { urlForImage } from '@/sanity/image'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const [featured, posts] = await Promise.all([
    client.fetch(featuredPostQuery),
    client.fetch(allPostsQuery),
  ])

  const latestPosts = posts.slice(1, 7) // exclude featured

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero — Featured post */}
      {featured && (
        <section className="mb-14">
          <Link href={`/bai-viet/${featured.slug}`} className="group block">
            <div className="relative rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all">
              {featured.coverImage && (
                <div className="relative h-72 md:h-96">
                  <Image
                    src={urlForImage(featured.coverImage).width(1200).height(600).url()}
                    alt={featured.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
              )}
              <div
                className={`${featured.coverImage ? 'absolute bottom-0 left-0 right-0 p-6' : 'p-6'}`}
              >
                {featured.categories?.[0] && (
                  <span className="inline-block text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/20 px-2.5 py-1 rounded-full mb-3">
                    {featured.categories[0].title}
                  </span>
                )}
                <h1 className="font-display text-2xl md:text-4xl font-bold text-white group-hover:text-[var(--accent)] transition-colors leading-tight mb-2">
                  {featured.title}
                </h1>
                {featured.excerpt && (
                  <p className="text-[var(--muted-foreground)] text-sm md:text-base line-clamp-2 mb-3">
                    {featured.excerpt}
                  </p>
                )}
                {featured.publishedAt && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatDate(featured.publishedAt)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Latest posts grid */}
      {latestPosts.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-xl font-bold text-white mb-6">Bài Viết Mới Nhất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestPosts.map((post: any) => (
              <PostCard key={post._id} {...post} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterForm />
    </div>
  )
}
