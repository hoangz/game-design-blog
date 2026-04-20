import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const isSanityConfigured = !!projectId && /^[a-z0-9-]+$/.test(projectId)

export const client = createClient({
  projectId: isSanityConfigured ? projectId : 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: isSanityConfigured,
})

/** Safe fetch — returns fallback value when Sanity is not configured */
export async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T = null as T,
): Promise<T> {
  if (!isSanityConfigured) return fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client.fetch as any)(query, params)
}
