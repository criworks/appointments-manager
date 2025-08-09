import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting simple por IP + ruta para POST a /api/*
// Nota: para producción real se recomienda Redis u otro store distribuido.
const WINDOW_MS = 60 * 1000 // 1 min
const MAX_REQUESTS = 10

export function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const isApiPost = url.pathname.startsWith('/api/') && req.method === 'POST'
  if (!isApiPost) return NextResponse.next()

  const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
  const ip = ipHeader.split(',')[0].trim() || 'unknown'
  const key = `rl_${ip}_${url.pathname}`
  const now = Date.now()

  const cookie = req.cookies.get(key)
  let bucket: { count: number; reset: number } = cookie ? JSON.parse(cookie.value) : { count: 0, reset: now + WINDOW_MS }

  // Reset ventana
  if (now > bucket.reset) {
    bucket = { count: 0, reset: now + WINDOW_MS }
  }

  bucket.count += 1

  if (bucket.count > MAX_REQUESTS) {
    const res = new NextResponse('Too Many Requests', { status: 429 })
    res.cookies.set(key, JSON.stringify(bucket), { path: '/', httpOnly: true, maxAge: WINDOW_MS / 1000 })
    return res
  }

  const res = NextResponse.next()
  res.cookies.set(key, JSON.stringify(bucket), { path: '/', httpOnly: true, maxAge: WINDOW_MS / 1000 })
  return res
}

export const config = {
  matcher: ['/api/:path*'],
}
