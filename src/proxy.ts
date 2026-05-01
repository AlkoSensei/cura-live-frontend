import { NextRequest, NextResponse } from "next/server";
import {
  DASHBOARD_AUTH_COOKIE,
  getDashboardAuthConfig,
  isDashboardAuthTokenValid
} from "@/lib/dashboardAuth";

export async function proxy(request: NextRequest) {
  const config = getDashboardAuthConfig();
  const token = request.cookies.get(DASHBOARD_AUTH_COOKIE)?.value;
  const isAuthenticated = config ? await isDashboardAuthTokenValid(token, config.secret) : false;

  if (request.nextUrl.pathname.startsWith("/login")) {
    if (!isAuthenticated) return NextResponse.next();
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"]
};
