'use server';

import { loginUser, createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type LoginState = { error?: string } | undefined;

export async function loginAction(
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
  redirect('/admin');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
