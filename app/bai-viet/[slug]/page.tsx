import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { safeFetch } from '@/sanity/client'
import { postBySlugQuery, allPostSlugsQuery } from '@/sanity/queries'
import { PostHeader } from '@/components/blog/post-header'
import { PortableTextRenderer } from '@/components/blog/portable-text-renderer'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { GiscusComments } from '@/components/blog/giscus-comments'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await safeFetch<{ slug: string }[]>(allPostSlugsQuery, {}, [])
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await safeFetch<any>(postBySlugQuery, { slug }, null)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await safeFetch<any>(postBySlugQuery, { slug }, null)
  if (!post) notFound()

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PostHeader
          title={post.title}
          excerpt={post.excerpt}
          coverImage={post.coverImage}
          publishedAt={post.publishedAt}
          categories={post.categories}
          content={post.content}
        />

        {/* Two-column layout */}
        <div className="flex gap-12">
          {/* Main content */}
          <article className="min-w-0 flex-1">
            {post.content && <PortableTextRenderer content={post.content} />}
            <GiscusComments />
          </article>

          {/* Sidebar TOC */}
          <div className="w-56 shrink-0">
            <TableOfContents />
          </div>
        </div>
      </div>
    </>
  )
}
