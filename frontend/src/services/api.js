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

export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getBySlug: (slug) => api.get(`/courses/${slug}`),
  getLessons: (slug) => api.get(`/courses/${slug}/lessons`),
  getQuiz: (slug, lessonId) => api.get(`/courses/${slug}/quiz/${lessonId}`),
  submitQuiz: (quizId, answer) => api.post(`/courses/quiz/${quizId}/attempt`, { answer }),
  getForumTopics: (slug, params) => api.get(`/courses/${slug}/forum`, { params }),
  createForumTopic: (slug, data) => api.post(`/courses/${slug}/forum`, data),
  getTopicReplies: (topicId) => api.get(`/courses/forum/${topicId}/replies`),
  createReply: (topicId, content) => api.post(`/courses/forum/${topicId}/reply`, { content }),
  enroll: (slug) => api.post(`/courses/${slug}/enroll`),
  getEnrollment: (slug) => api.get(`/courses/${slug}/enrollment`),
  completeLesson: (slug, lessonId) => api.post(`/courses/${slug}/lessons/${lessonId}/complete`),
  getCertificate: (slug) => api.get(`/courses/${slug}/certificate`)
};

export const adminCourseAPI = {
  getAll: (params) => api.get('/admin/courses', { params }),
  create: (data) => api.post('/admin/courses', data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  delete: (id) => api.delete(`/admin/courses/${id}`),
  getLessons: (courseId) => api.get(`/admin/courses/${courseId}/lessons`),
  createLesson: (courseId, data) => api.post(`/admin/courses/${courseId}/lessons`, data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
  getQuiz: (lessonId) => api.get(`/admin/lessons/${lessonId}/quiz`),
  addQuiz: (lessonId, data) => api.post(`/admin/lessons/${lessonId}/quiz`, data),
  updateQuiz: (id, data) => api.put(`/admin/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/admin/quiz/${id}`),
  getForum: (params) => api.get('/admin/forum', { params }),
  deleteForumTopic: (id) => api.delete(`/admin/forum/${id}`),
  pinTopic: (id) => api.put(`/admin/forum/${id}/pin`),
  getEnrollments: (courseId, params) => api.get(`/admin/courses/${courseId}/enrollments`, { params }),
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  getCourseQuizzes: (courseId) => api.get(`/admin/courses/${courseId}/quizzes`),
  generateQuiz: (lessonId, data) => api.post(`/admin/lessons/${lessonId}/generate-quiz`, data)
};

export default api;
