import { NextResponse } from "next/server";
import {
  DASHBOARD_AUTH_COOKIE,
  DASHBOARD_AUTH_MAX_AGE_SECONDS,
  createDashboardAuthToken,
  getDashboardAuthConfig
} from "@/lib/dashboardAuth";

export async function POST(request: Request) {
  const config = getDashboardAuthConfig();
  if (!config) {
    return NextResponse.json(
      { message: "Dashboard auth is not configured." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (username !== config.username || password !== config.password) {
    return NextResponse.json(
      { message: "Invalid dashboard credentials." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DASHBOARD_AUTH_COOKIE,
    value: await createDashboardAuthToken(config.secret),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DASHBOARD_AUTH_MAX_AGE_SECONDS
  });

  return response;
}
