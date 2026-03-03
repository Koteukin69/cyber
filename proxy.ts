import {NextRequest, NextResponse} from "next/server";
import {JWTPayload} from "@/lib/types";
import {verifyToken, getAccessLevel} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token: string | undefined = request.cookies.get('auth-token')?.value;
  const payload: JWTPayload | null = token ? await verifyToken(token) : null;
  const accessLevel = getAccessLevel(payload?.role);

  if (payload && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  const secured = [
    ["/profile"],
    ["/admin"],
  ]

  for (let i = 0; i < secured.length; i++) {
    if (accessLevel <= i && secured[i].map(path => pathname.startsWith(path)).some(Boolean))
      return NextResponse.redirect(new URL('/login', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  if (!payload) return NextResponse.next();

  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};