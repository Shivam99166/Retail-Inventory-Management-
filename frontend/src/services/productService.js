import api from './api';

export const productService = {
  // Public endpoints (no auth needed)
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Admin-only endpoints (auth + ADMIN role required)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deactivateProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  activateProduct: async (id) => {
    const response = await api.put(`/products/${id}/activate`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
};

export default productService;
