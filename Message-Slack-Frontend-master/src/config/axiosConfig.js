import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/auth/signin') {
                window.location.href = '/auth/signin';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
