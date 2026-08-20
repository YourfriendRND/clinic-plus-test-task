import { apiRequest } from './api';

export type SessionUser = {
  id: string;
  fullName: string;
  roleCode: 'operator' | 'team';
};

export type LoginResult = {
  verificationId: string;
};

export function login(phone: string, password: string): Promise<LoginResult> {
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export function verify(verificationId: string, code: string): Promise<SessionUser> {
  return apiRequest<SessionUser>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ verificationId, code }),
  });
}

export function getMe(): Promise<SessionUser> {
  return apiRequest<SessionUser>('/auth/me');
}
