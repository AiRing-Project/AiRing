import api from './axiosInstance';

export async function loginApi({ email, password }: { email: string; password: string }) {
    const res = await api.post('/auth/login', { email, password });
    return res.data as { accessToken: string; refreshToken: string };
}

export async function signUpApi({ email, username, password }: { email: string; username: string; password: string }) {
    const res = await api.post('/auth/signup', { email, username, password });
    return res.data;
}
