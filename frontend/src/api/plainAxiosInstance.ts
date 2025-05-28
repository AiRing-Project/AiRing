import {API_BASE_URL} from '@env';
import axios from 'axios';

// 인터셉터가 적용되지 않는 axios 인스턴스 (토큰 재발급 등 특수 목적)
const plainApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export default plainApi;
