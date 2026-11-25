import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function hashPin(pin: string): Promise<string> {
  return argon2.hash(pin);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, pin);
}
