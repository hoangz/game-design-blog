import { describe, it, expect, vi } from 'vitest'

vi.mock('@/sanity/client', () => ({
  client: { fetch: vi.fn() },
}))

import { POST } from '@/app/api/search/route'
import { client } from '@/sanity/client'
import { NextRequest } from 'next/server'

describe('POST /api/search', () => {
  it('returns 400 when query is missing', async () => {
    const req = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns results for valid query', async () => {
    const mockPosts = [{ title: 'Game Design Basics', slug: 'basics' }]
    vi.mocked(client.fetch).mockResolvedValue(mockPosts as any)

    const req = new NextRequest('http://localhost/api/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'game' }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.results).toEqual(mockPosts)
  })
})
