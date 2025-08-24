import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Recipe API
export const recipeAPI = {
  getRecipes: async (params?: any) => {
    const response = await api.get('/recipes', { params });
    return response.data;
  },
  
  getRecipe: async (id: string) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  
  createRecipe: async (recipe: any) => {
    const response = await api.post('/recipes', recipe);
    return response.data;
  },
  
  updateRecipe: async (id: string, recipe: any) => {
    const response = await api.put(`/recipes/${id}`, recipe);
    return response.data;
  },
  
  deleteRecipe: async (id: string) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  }
}; 