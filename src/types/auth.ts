export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
}
