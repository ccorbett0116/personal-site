import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = 'colecorbett.ca';
const VALID_SUBDOMAINS: Record<string, string> = {
  projects: '/projects',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  const isMainDomain = hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`;
  const subdomain = hostname.endsWith(`.${MAIN_DOMAIN}`)
    ? hostname.replace(`.${MAIN_DOMAIN}`, '')
    : null;

  // Redirect from colecorbett.ca/projects to projects.colecorbett.ca
  if (isMainDomain && url.pathname.startsWith('/projects')) {
    const subdomainUrl = `https://projects.${MAIN_DOMAIN}${url.pathname}`;
    return NextResponse.redirect(subdomainUrl, 301);
  }

  // Rewrite subdomain (e.g., projects.colecorbett.ca) to internal route
  if (subdomain && subdomain in VALID_SUBDOMAINS) {
    url.pathname = VALID_SUBDOMAINS[subdomain] + url.pathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
0
