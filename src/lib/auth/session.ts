import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Sesión efímera de PIN: HMAC-signed cookie con employee_id, location_id, station_id, exp.
 * No tocamos Supabase Auth — esto es para empleados de estación.
 */

const COOKIE_NAME = "frich_pin_session";
const SECRET = process.env.SESSION_SECRET ?? "frich-os-dev-secret";

export type PinSession = {
  chainId: string;
  locationId: string;
  stationId: string | null;
  employeeId: string;
  employeeName: string;
  shiftId: string | null;
  iat: number;
  exp: number;
};

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function encode(session: Omit<PinSession, "iat" | "exp">, ttlSeconds = 60 * 60 * 12) {
  const now = Math.floor(Date.now() / 1000);
  const full: PinSession = { ...session, iat: now, exp: now + ttlSeconds };
  const payload = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function decode(token: string | undefined | null): PinSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as PinSession;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setPinSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearPinSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getPinSession(): Promise<PinSession | null> {
  const jar = await cookies();
  return decode(jar.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME };
