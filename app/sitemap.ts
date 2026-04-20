import { MetadataRoute } from 'next'
import { safeFetch } from '@/sanity/client'
import { allPostSlugsQuery } from '@/sanity/queries'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourdomain.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs: { slug: string; publishedAt: string }[] = await safeFetch(allPostSlugsQuery, {}, [])

  const postUrls = slugs.map(({ slug, publishedAt }) => ({
    url: `${BASE_URL}/bai-viet/${slug}`,
    lastModified: new Date(publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/ve-toi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...postUrls,
  ]
}
