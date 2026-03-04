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

  if (payload && pathname.startsWith("/logout")) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  const secured = [
    ["/profile", "/advancements", "/team"],
    ["/admin"],
  ]

  for (let i = 0; i < secured.length; i++) {
    if (accessLevel <= i && secured[i].map(path => pathname.startsWith(path)).some(Boolean))
      return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!payload) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};