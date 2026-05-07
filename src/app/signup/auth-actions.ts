'use server';

import { signupUser, createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type SignupState = { error?: string } | undefined;

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  // Email validation: must contain @
  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  // No password validation as requested

  const session = await signupUser(name, email, password);

  if (!session) {
    return { error: 'Signup failed. Email might already be in use.' };
  }

  await createSession(session);
  redirect('/');
}
