// ─────────────────────────────────────────────────────────────────────────────
// ADMIN AUTH — JWT-signed session helpers
// Uses `jose` (Edge-runtime compatible, no Node.js crypto module needed)
//
// REQUIRED ENV VAR:
//   ADMIN_SESSION_SECRET — a long random string (≥32 chars), e.g.:
//   openssl rand -base64 32
//   Set in .env.local (local) and Vercel Environment Variables (production).
//   NEVER prefix with NEXT_PUBLIC_
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "vmex_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

interface AdminSessionPayload {
  adminId: string;
  adminName: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET env var is missing or too short (must be ≥ 32 characters)"
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a JWT and return it as a string. Called only from the login route. */
export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

/**
 * Verify the admin session JWT from the request cookie store.
 * Returns the decoded payload, or null if missing / invalid / expired.
 * Call this at the top of every protected admin API route.
 */
export async function verifyAdminSession(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<AdminSessionPayload | null> {
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { adminId, adminName } = payload as AdminSessionPayload & Record<string, unknown>;
    if (!adminId || !adminName) return null;
    return { adminId: String(adminId), adminName: String(adminName) };
  } catch {
    // Expired, tampered, or invalid — treat as unauthenticated
    return null;
  }
}

/** Cookie options shared between login (set) and logout (delete). */
export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    secure: isProduction,
  };
}

export { COOKIE_NAME };
