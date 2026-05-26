import "server-only";
import bcrypt from "bcryptjs";

/**
 * Empleados se autentican con PIN de 4 dígitos. Hash bcrypt server-side.
 * Para PINs de 4 dígitos (10k combinaciones) usamos rounds=10 + un pepper
 * en SESSION_SECRET, suficiente porque siempre exigimos también un employee_id
 * (no es un PIN de 4 dígitos en el aire, es PIN + identidad).
 */

const PEPPER = process.env.SESSION_SECRET ?? "frich-os-dev-pepper";

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) throw new Error("PIN inválido — exactamente 4 dígitos");
  return bcrypt.hash(pin + PEPPER, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  return bcrypt.compare(pin + PEPPER, hash);
}
