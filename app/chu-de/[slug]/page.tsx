import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { safeFetch } from '@/sanity/client'
import { postsByCategoryQuery, categoryBySlugQuery } from '@/sanity/queries'
import { PostCard } from '@/components/blog/post-card'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await safeFetch<any>(categoryBySlugQuery, { slug }, null)
  if (!category) return {}
  return { title: category.title, description: category.description }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, posts] = await Promise.all([
    safeFetch<any>(categoryBySlugQuery, { slug }, null),
    safeFetch<any[]>(postsByCategoryQuery, { slug }, []),
  ])
  if (!category) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-white mb-2">{category.title}</h1>
        {category.description && (
          <p className="text-[var(--muted-foreground)]">{category.description}</p>
        )}
      </header>

      {posts.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">Chưa có bài viết nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post: any) => (
            <PostCard key={post._id} {...post} />
          ))}
        </div>
      )}
    </div>
  )
}
