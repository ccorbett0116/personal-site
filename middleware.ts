import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = 'colecorbett.ca';
const SUBDOMAIN_MAP: Record<string, string> = {
  projects: 'https://projects.colecorbett.ca',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  const isMainDomain =
    hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`;

  // Redirect /projects from root domain to projects subdomain root
  if (isMainDomain && url.pathname.startsWith('/projects')) {
    return NextResponse.redirect(SUBDOMAIN_MAP.projects, 301);
  }

  const subdomain = hostname.endsWith(`.${MAIN_DOMAIN}`)
    ? hostname.replace(`.${MAIN_DOMAIN}`, '')
    : null;

  // Subdomain rewrite for valid subdomains (expandable)
  if (subdomain && subdomain in SUBDOMAIN_MAP) {
    url.pathname = '/projects' + url.pathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
