import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Request Interceptor - Token:', token);
  console.log('API Request Interceptor - URL:', config.url);
  console.log('API Request Interceptor - Method:', config.method);
  console.log('API Request Interceptor - Headers:', config.headers);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request Interceptor - Added Authorization header');
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response Interceptor - Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Interceptor - Error:', error.response?.status, error.config?.url);
    console.log('API Response Interceptor - Error data:', error.response?.data);
    
    // Only redirect to login for 401 errors on protected endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // List of public endpoints that shouldn't redirect to login
      const publicEndpoints = [
        '/recipes',           // GET all recipes
        '/recipes/',          // GET all recipes with params
        '/recipes/user/me'    // This is protected, but let's be explicit
      ];
      
      // Check if this is a public endpoint
      const isPublicEndpoint = publicEndpoints.some(endpoint => {
        if (endpoint === '/recipes') {
          return url === '/recipes' || url.startsWith('/recipes?');
        }
        return url.startsWith(endpoint);
      });
      
      // For recipe detail pages, check if it's a GET request to /recipes/:id
      const isPublicRecipeDetail = url.match(/^\/recipes\/[^\/]+$/) && error.config?.method === 'get';
      
      if (!isPublicEndpoint && !isPublicRecipeDetail) {
        console.log('API Response Interceptor - 401 Unauthorized on protected endpoint, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.log('API Response Interceptor - 401 Unauthorized on public endpoint, not redirecting');
      }
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
  
  getUserRecipes: async (params?: any) => {
    const response = await api.get('/recipes/user/me', { params });
    return response.data;
  },
  
  createRecipe: async (recipe: any) => {
    // If FormData is passed, let the browser set the multipart boundary
    const isFormData = typeof FormData !== 'undefined' && recipe instanceof FormData;
    const response = await api.post('/recipes', recipe, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
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