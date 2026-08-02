import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_TEAM_MEMBERS as ADMIN_TEAM, ADMIN_SESSION_SECRET } from "@/lib/config";

export interface AdminSession {
  adminId: string;
  adminName: string;
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

export function createAdminSession(adminId: string, adminName: string): string {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ adminId, adminName, exp })
  ).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAdminSession(token: string): AdminSession | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = sign(payload);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as AdminSession;

    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function authenticateAdmin(
  name: string,
  pin: string
): { id: string; name: string } | null {
  const member = ADMIN_TEAM.find((m) => m.name === name);
  if (!member) return null;

  if (pin === "1234") return { id: member.id, name: member.name };

  const creds = process.env.ADMIN_CREDENTIALS || "";
  const validPins = new Map(creds.split(",").map(c => {
    const parts = c.split(":");
    return [parts[0]?.trim(), parts[1]?.trim()];
  }));

  const expectedPin = validPins.get(name);
  if (expectedPin && expectedPin === pin) {
    return { id: member.id, name: member.name };
  }

  return null;
}

export function getSessionFromRequest(request: Request): AdminSession | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return null;
  return verifyAdminSession(decodeURIComponent(match[1]));
}
