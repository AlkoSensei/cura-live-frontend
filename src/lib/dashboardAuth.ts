export const DASHBOARD_AUTH_COOKIE = "cura_dashboard_auth";
export const DASHBOARD_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

export function getDashboardAuthConfig() {
  const username = process.env.DASHBOARD_AUTH_USERNAME;
  const password = process.env.DASHBOARD_AUTH_PASSWORD;
  const secret = process.env.DASHBOARD_AUTH_SECRET;

  if (!username || !password || !secret) return null;
  return { username, password, secret };
}

export async function createDashboardAuthToken(secret: string, now = Date.now()) {
  const expiresAt = now + DASHBOARD_AUTH_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function isDashboardAuthTokenValid(token: string | undefined, secret: string, now = Date.now()) {
  if (!token) return false;

  const [expiresAtValue, signature] = token.split(".");
  if (!expiresAtValue || !signature) return false;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

  const expectedSignature = await sign(expiresAtValue, secret);
  return signature === expectedSignature;
}
