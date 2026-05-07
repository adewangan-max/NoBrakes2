'use server';

import { loginUser, createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type LoginState = { error?: string } | undefined;

export async function viewerLoginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const session = await loginUser(email, password);

  if (!session) {
    return { error: 'Invalid email or password.' };
  }

  await createSession(session);

  // Redirect based on role, but primarily for viewers to home
  if (session.role === 'admin' || session.role === 'editor') {
    redirect('/admin');
  } else {
    redirect('/');
  }
}
