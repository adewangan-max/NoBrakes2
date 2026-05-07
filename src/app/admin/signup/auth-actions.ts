'use server';

import { signupUser, createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type SignupState = { error?: string } | undefined;

export async function adminSignupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  // Create user with 'editor' role
  const { supabase } = await import('@/lib/supabase');
  
  // We use the underlying signupUser logic but override the role if needed, 
  // or we can just call it if we update it to accept a role.
  // Currently signupUser in auth.ts is hardcoded to 'viewer'.
  
  // Let's use a custom insert here for 'editor'
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      { 
        name, 
        email, 
        password_hash: password, 
        role: 'editor' 
      }
    ])
    .select()
    .single();

  if (error || !user) {
    return { error: 'Signup failed. Email might already be in use.' };
  }

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    avatarUrl: user.avatar_url ?? undefined,
  };

  await createSession(session);
  redirect('/admin');
}
