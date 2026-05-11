import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('zanajira-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.user?.access_token) {
        config.headers.Authorization = `Bearer ${state.user.access_token}`;
      }
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const stored = localStorage.getItem('zanajira-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.state.user.access_token = data.access_token;
          localStorage.setItem('zanajira-auth', JSON.stringify(parsed));
        }
        err.config.headers.Authorization = `Bearer ${data.access_token}`;
        return axios(err.config);
      } catch {
        localStorage.removeItem('zanajira-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
