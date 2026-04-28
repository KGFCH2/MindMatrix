import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
});

export const solveSudoku = async (grid: number[][]) => {
  const response = await api.post('/solve', { grid });
  return response.data;
};

export const generateSudoku = async (difficulty: string, size: number = 6) => {
  const response = await api.post('/generate', { difficulty, size });
  return response.data;
};

export const analyzeSudoku = async (grid: number[][]) => {
  const response = await api.post('/analyze', { grid });
  return response.data;
};

export const getHint = async (grid: number[][]) => {
  const response = await api.post('/hint', { grid });
  return response.data;
};

export const aiChat = async (message: string, grid: number[][]) => {
  const response = await api.post('/ai/chat', { message, grid });
  return response.data;
};

export default api;
