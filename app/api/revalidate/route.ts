import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug = body?._id ? body.slug?.current : null

  try {
    revalidatePath('/', 'page')
    if (slug) revalidatePath(`/bai-viet/${slug}`, 'page')
    revalidatePath('/chu-de', 'layout')

    return NextResponse.json({ revalidated: true, slug: slug ?? 'all' })
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
