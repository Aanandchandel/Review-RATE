import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// NEW: Upload profile picture
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  return API.post('/auth/upload-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCompanies = (params) => API.get('/companies', { params });
export const getCompany = (id) => API.get(`/companies/${id}`);
export const createCompany = (data) => API.post('/companies', data);

export const getReviews = (companyId, params) =>
  API.get(`/companies/${companyId}/reviews`, { params });

export const createReview = (companyId, data) =>
  API.post(`/companies/${companyId}/reviews`, data);

export const likeReview = (reviewId) => API.put(`/reviews/${reviewId}/like`);