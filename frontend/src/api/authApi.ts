import type {CallType} from '../types/call';
import api from './axiosInstance';
import plainApi from './plainAxiosInstance';

interface LoginParams {
  email: string;
  password: string;
}

interface SignUpParams extends LoginParams {
  username: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface UserInfo {
  email: string;
  username: string;
}

export interface InitCallLogParams {
  callType: CallType;
}

export interface InitCallLogResponse {
  ephemeralToken: string;
  conversationId: number;
}

export async function login(data: LoginParams): Promise<TokenResponse> {
  const res = await plainApi.post('/auth/login', data);
  return res.data;
}

export async function signUp(data: SignUpParams): Promise<void> {
  await plainApi.post('/auth/signup', data);
}

export async function reissueToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const res = await plainApi.post('/auth/reissue', undefined, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return res.data;
}

export async function logout(refreshToken: string) {
  return plainApi.post('/auth/logout', undefined, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
}

export async function resetPassword(data: ResetPasswordParams): Promise<void> {
  await api.put('/auth/reset-password', data);
}

export async function getUserInfo(): Promise<UserInfo> {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function initCallLog(
  data: InitCallLogParams,
): Promise<InitCallLogResponse> {
  const res = await api.post('/api/call_logs/init', data);
  return res.data;
}
