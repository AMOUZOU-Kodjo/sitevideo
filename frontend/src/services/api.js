import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const contentAPI = {
  getAll: (params) => api.get('/contents', { params }),
  getById: (id) => api.get(`/contents/${id}`),
  create: (data) => api.post('/contents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/contents/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/contents/${id}`),
  getCategories: () => api.get('/contents/categories')
};

export const purchaseAPI = {
  purchase: (content_id) => api.post('/purchases', { content_id }),
  getMyPurchases: () => api.get('/purchases/mine'),
  checkAccess: (content_id) => api.get(`/purchases/check/${content_id}`)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getContents: (params) => api.get('/admin/contents', { params }),
  getPurchases: (params) => api.get('/admin/purchases', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getTestimonials: (params) => api.get('/admin/testimonials', { params }),
  approveTestimonial: (id) => api.put(`/admin/testimonials/${id}/approve`),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`)
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (key, value) => api.put('/settings', { key, value }),
  updateBulk: (data) => api.put('/settings/bulk', data)
};

export const youtubeAPI = {
  getLatest: (limit) => api.get('/youtube/latest', { params: { limit } })
};

export const testimonialAPI = {
  getAll: () => api.get('/testimonials'),
  create: (data) => api.post('/testimonials', data)
};

export const contactAPI = {
  send: (data) => api.post('/contact', data)
};

export default api;
