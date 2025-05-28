import api from './axiosInstance';
import plainApi from './plainAxiosInstance';

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface SignUpParams {
  email: string;
  username: string;
  password: string;
}

interface ReissueResponse {
  accessToken: string;
  refreshToken: string;
}

export async function loginApi(data: LoginParams): Promise<LoginResponse> {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function signUpApi(data: SignUpParams): Promise<void> {
  await api.post('/auth/signup', data);
}

export async function reissueToken(
  refreshToken: string,
): Promise<ReissueResponse> {
  const res = await plainApi.post('/auth/reissue', {refreshToken});
  return res.data;
}

export async function logoutApi(refreshToken: string) {
  return plainApi.post(
    '/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );
}
