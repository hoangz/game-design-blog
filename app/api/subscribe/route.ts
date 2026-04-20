import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = body?.email?.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Newsletter chưa được cấu hình.' }, { status: 503 })
  }

  try {
    // Lazy init — avoid module-level throw when env var is missing
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID ?? '',
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Không thể đăng ký. Vui lòng thử lại.' }, { status: 500 })
  }
}
