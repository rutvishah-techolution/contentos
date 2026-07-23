import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { BRAIN_DIR } from "@/lib/brain";

const AUTH_DIR = path.join(BRAIN_DIR, "auth");
const USERS_FILE = path.join(AUTH_DIR, "users.json");

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
export type PublicUser = Pick<User, "id" | "name" | "email">;

async function readUsers(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(USERS_FILE, "utf8")) as User[];
  } catch {
    return [];
  }
}
async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(AUTH_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.email === normEmail(email)) || null;
}

export async function findById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

/** Create a new user (email/password). Throws if the email already exists. */
export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<PublicUser> {
  const e = normEmail(email);
  if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
    throw new Error("Enter a valid email.");
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters.");
  const users = await readUsers();
  if (users.some((u) => u.email === e))
    throw new Error("An account with that email already exists.");
  const user: User = {
    id: `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || e.split("@")[0],
    email: e,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return { id: user.id, name: user.name, email: user.email };
}

/** Verify credentials; returns the public user or null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await findByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email };
}
