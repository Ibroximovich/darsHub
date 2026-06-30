import axios from 'axios';
import Cookies from 'js-cookie';
import BASE_URL from '../config';

const http = axios.create({
  baseURL: BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-refresh-token'];
    if (refreshedToken) {
      Cookies.set('token', refreshedToken, { expires: 20 });
      localStorage.setItem('token', refreshedToken);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;
