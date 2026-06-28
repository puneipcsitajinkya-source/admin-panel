import axios from 'axios';

const API_BASE = '/api-proxy';

export const api = axios.create({
  baseURL: API_BASE,
});

// Products
export const getProducts = () => api.get('/products');
export const getProduct = (id: string) => api.get(`/products/${id}`);
export const createProduct = (data: object) => api.post('/products', data);
export const updateProduct = (id: string, data: object) => api.put(`/products/${id}`, data);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);
export const getProductStats = () => api.get('/products/stats');

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id: string) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id: string, status: string) =>
  api.patch(`/orders/${id}/status`, { status });
export const getOrderStats = () => api.get('/orders/stats');

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data: { name: string; icon?: string; showOnApp?: boolean }) => api.post('/categories', data);
export const updateCategory = (id: string, data: { name?: string; icon?: string; showOnApp?: boolean }) =>
  api.patch(`/categories/${id}`, data);
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data: object) => api.put('/settings', data);


