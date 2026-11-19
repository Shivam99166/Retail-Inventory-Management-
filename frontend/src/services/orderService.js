import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/user/orders', orderData);
    return response.data;
  },

  getUserOrders: async (params = {}) => {
    const response = await api.get('/user/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/user/orders/${id}`);
    return response.data;
  },

  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, null, { params: { status } });
    return response.data;
  },

  confirmOrder: async (id) => {
    const response = await api.put(`/admin/orders/${id}/confirm`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/admin/orders/${id}/cancel`);
    return response.data;
  }
};

export default orderService;
