// /srv/personal-site/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.toLowerCase() || ''
  const url = request.nextUrl

  if (hostname.startsWith('projects.') && !url.pathname.startsWith('/projects')) {
    url.pathname = `/projects${url.pathname}`
  }

  return NextResponse.rewrite(url)
}
