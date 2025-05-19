// /srv/personal-site/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_DOMAIN = 'colecorbett.ca'

// Add more subdomains and their base paths here
const SUBDOMAIN_MAP: Record<string, string> = {
  'projects': '/projects',
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.toLowerCase() || ''
  const url = request.nextUrl

  // Extract subdomain (e.g., 'projects' from 'projects.colecorbett.ca')
  const subdomain = hostname.endsWith(`.${MAIN_DOMAIN}`)
    ? hostname.split(`.${MAIN_DOMAIN}`)[0]
    : null

  const isRootDomain = hostname === MAIN_DOMAIN

  // Handle rewrite for valid subdomains
  if (subdomain && subdomain in SUBDOMAIN_MAP) {
    const basePath = SUBDOMAIN_MAP[subdomain]
    if (!url.pathname.startsWith(basePath)) {
      url.pathname = `${basePath}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Handle redirect from root domain paths to correct subdomains
  if (isRootDomain) {
    for (const [sub, basePath] of Object.entries(SUBDOMAIN_MAP)) {
      if (url.pathname.startsWith(basePath)) {
        const cleanedPath = url.pathname.replace(basePath, '') || '/'
        const redirectUrl = new URL(`https://${sub}.${MAIN_DOMAIN}${cleanedPath}`)
        redirectUrl.search = url.search
        return NextResponse.redirect(redirectUrl, 308)
      }
    }
  }

  return NextResponse.next()
}
