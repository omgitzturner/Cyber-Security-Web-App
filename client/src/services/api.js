import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL });

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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Users
export const usersAPI = {
  getUsers: () => api.get('/api/users'),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getUsersByDept: (dept) => api.get(`/api/users/departments/${dept}/users`),
};

// Lessons
export const lessonsAPI = {
  getLessons: () => api.get('/api/lessons'),
  getLesson: (id) => api.get(`/api/lessons/${id}`),
  getLessonsByTrack: (track) => api.get(`/api/lessons/track/${track}`),
  createLesson: (data) => api.post('/api/lessons', data),
  updateLesson: (id, data) => api.put(`/api/lessons/${id}`, data),
};

// Progress
export const progressAPI = {
  getUserProgress: (userId) => api.get(`/api/progress/${userId}`),
  getLessonProgress: (userId, lessonId) => api.get(`/api/progress/${userId}/lessons/${lessonId}`),
  startLesson: (userId, lessonId) => api.post(`/api/progress/${userId}/lessons/${lessonId}/start`),
  submitQuiz: (userId, lessonId, answers) => api.put(`/api/progress/${userId}/lessons/${lessonId}/quiz`, { answers }),
  submitSummary: (userId, lessonId, summaryText) => api.put(`/api/progress/${userId}/lessons/${lessonId}/summary`, { summary_text: summaryText }),
  completeLesson: (userId, lessonId) => api.put(`/api/progress/${userId}/lessons/${lessonId}/complete`),
  getQuiz: (userId, lessonId) => api.get(`/api/progress/${userId}/lessons/${lessonId}/quiz`),
};

// Assignments
export const assignmentsAPI = {
  getAssignments: (userId) => api.get(`/api/assignments/${userId}`),
  getAllAssignments: () => api.get('/api/assignments/all'),
  createAssignment: (data) => api.post('/api/assignments', data),
  updateAssignment: (id, data) => api.put(`/api/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/assignments/${id}`),
};

// Leaderboard
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/api/leaderboard'),
  getDeptLeaderboard: (dept) => api.get(`/api/leaderboard/${dept}`),
  getTeamReport: (dept) => api.get(`/api/leaderboard/reports/team/${dept}`),
  getUserBadges: (userId) => api.get(`/api/leaderboard/badges/${userId}`),
  getAllBadges: () => api.get('/api/leaderboard/badges'),
};

export default api;
