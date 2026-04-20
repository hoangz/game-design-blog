import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { searchPostsQuery } from '@/sanity/queries'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const query = body?.query?.trim()

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await (client.fetch as any)(searchPostsQuery, { query: `${query}*` })
  return NextResponse.json({ results })
}
