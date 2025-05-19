import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = 'colecorbett.ca';
const REDIRECT_MAP: Record<string, string> = {
  '/projects': 'projects',
  '/test': 'test',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  const isMainDomain = hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`;
  const subdomain = hostname.endsWith(`.${MAIN_DOMAIN}`)
    ? hostname.replace(`.${MAIN_DOMAIN}`, '')
    : null;

  // If request is to main domain and path matches a redirect rule
  if (isMainDomain) {
    for (const [prefix, subdomainTarget] of Object.entries(REDIRECT_MAP)) {
      if (url.pathname === prefix || url.pathname.startsWith(prefix + '/')) {
        const suffix = url.pathname.slice(prefix.length); // keep subpath
        const newUrl = `https://${subdomainTarget}.${MAIN_DOMAIN}${suffix || '/'}`;
        return NextResponse.redirect(newUrl, 301);
      }
    }
  }

  // Rewrite if request is to a known subdomain
  if (subdomain && Object.values(REDIRECT_MAP).includes(subdomain)) {
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

  return NextResponse.next();
}
