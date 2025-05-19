// /srv/personal-site/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.toLowerCase() || ''
  const url = request.nextUrl

  // Handle subdomain routing
  if (hostname.startsWith('projects.') && !url.pathname.startsWith('/projects')) {
    url.pathname = `/projects${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Redirect colecorbett.ca/projects to projects.colecorbett.ca
  if (
    hostname === 'colecorbett.ca' &&
    url.pathname.startsWith('/projects')
  ) {
    const newUrl = new URL(request.url)
    newUrl.hostname = 'projects.colecorbett.ca'
    newUrl.pathname = url.pathname.replace(/^\/projects/, '') || '/'
    return NextResponse.redirect(newUrl, 308)
  }

  return NextResponse.next()
}
