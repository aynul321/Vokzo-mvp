import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services API
export const servicesApi = {
  getCategories: () => api.get('/services/categories'),
  getSubServices: (categoryId) => api.get(`/services/categories/${categoryId}/sub-services`),
  getAllSubServices: () => api.get('/services/sub-services'),
  search: (query) => api.get(`/services/search?q=${query}`)
};

// Providers API
export const providersApi = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  toggleOnline: () => api.put('/providers/toggle-online'),
  getDashboardStats: () => api.get('/providers/dashboard/stats')
};

// Bookings API
export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getCustomerBookings: () => api.get('/bookings/customer'),
  getProviderBookings: () => api.get('/bookings/provider'),
  accept: (id) => api.put(`/bookings/${id}/accept`),
  reject: (id) => api.put(`/bookings/${id}/reject`),
  complete: (id) => api.put(`/bookings/${id}/complete`)
};

// Reviews API
export const reviewsApi = {
  create: (data) => api.post('/reviews', data)
};

// Admin API
export const adminApi = {
  getProviders: () => api.get('/admin/providers'),
  approveProvider: (id) => api.put(`/admin/providers/${id}/approve`),
  rejectProvider: (id) => api.put(`/admin/providers/${id}/reject`),
  getBookings: () => api.get('/admin/bookings'),
  getAnalytics: () => api.get('/admin/analytics'),
  updateCommission: (percentage) => api.put('/admin/settings/commission', { commission_percentage: percentage }),
  createCategory: (data) => api.post('/admin/categories', null, { params: data }),
  createSubService: (data) => api.post('/admin/sub-services', null, { params: data }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  deleteSubService: (id) => api.delete(`/admin/sub-services/${id}`)
};

// Cities API
export const citiesApi = {
  getAll: () => api.get('/cities')
};

// Seed API
export const seedApi = {
  seed: () => api.post('/seed')
};

export default api;
