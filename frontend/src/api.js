import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = axios.create({ baseURL: API_URL ? `${API_URL}/api` : '/api' });

export const getApiUrl = () => API_URL;

export const register = (data) => api.post('/register', data);
export const getSession = (sessionId) => api.get(`/session/${sessionId}`);
export const startExam = (sessionId) => api.post(`/start/${sessionId}`);
export const getQuestions = (sessionId) => api.get(`/questions/${sessionId}`);
export const saveAnswer = (sessionId, questionId, answer) =>
  api.post(`/answer/${sessionId}`, { questionId, answer });
export const runCode = (sessionId, data) => api.post(`/run/${sessionId}`, data);
export const submitCode = (sessionId, data) => api.post(`/submit-code/${sessionId}`, data);
export const logViolation = (sessionId, reason) =>
  api.post(`/violation/${sessionId}`, { reason });
export const submitExam = (sessionId) => api.post(`/submit/${sessionId}`);

// Admin
const adminApi = axios.create({ baseURL: API_URL ? `${API_URL}/api/admin` : '/api/admin' });

export const adminVerify = (secret) =>
  api.post('/admin/verify', { secret });

export const adminGetStudents = (secret) =>
  adminApi.get('/students', { headers: { 'x-admin-secret': secret } });

export const adminGetViolations = (secret) =>
  adminApi.get('/violations', { headers: { 'x-admin-secret': secret } });

export const adminGetAnswers = (secret, rollNumber) =>
  adminApi.get(`/answers/${rollNumber}`, { headers: { 'x-admin-secret': secret } });

export const adminExportCSV = (secret) =>
  `${API_URL}/api/admin/export-csv?secret=${secret}`;
