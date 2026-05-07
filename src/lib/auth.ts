// Authentication utilities for server-side use
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { supabase } from './supabase';
import { SessionPayload } from '@/types/auth';

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production'
);
const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = '7d';


/** Sign a JWT and store it as an HttpOnly cookie */
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/** Read and verify the session JWT from the cookie */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

/** Delete the session cookie */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Lookup user by email in custom users table, verify password with bcrypt */
export async function loginUser(email: string, password: string): Promise<SessionPayload | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, password_hash')
    .eq('email', email)
    .single();

  if (error || !user) return null;

  // Plain text comparison (as requested)
  if (password !== user.password_hash) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionPayload['role'],
    avatarUrl: user.avatar_url ?? undefined,
  };
}

/** Signup a new user */
export async function signupUser(name: string, email: string, password: string): Promise<SessionPayload | null> {
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        password_hash: password, // Storing as plain text as per existing repo pattern
        role: 'viewer'
      }
    ])
    .select()
    .single();

  if (error || !user) {
    console.error('Signup error:', error);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionPayload['role'],
    avatarUrl: user.avatar_url ?? undefined,
  };
}
