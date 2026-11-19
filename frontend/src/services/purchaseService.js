import api from './api';

export const purchaseService = {
  getPurchaseOrders: async (params = {}) => {
    const response = await api.get('/admin/purchase-orders', { params });
    return response.data;
  },

  getPurchaseOrderById: async (id) => {
    const response = await api.get(`/admin/purchase-orders/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (poData) => {
    const response = await api.post('/admin/purchase-orders', poData);
    return response.data;
  },

  submitOrder: async (id) => {
    const response = await api.put(`/admin/purchase-orders/${id}/submit`);
    return response.data;
  },

  approveOrder: async (id) => {
    const response = await api.put(`/admin/purchase-orders/${id}/approve`);
    return response.data;
  },

  receiveOrder: async (id) => {
    const response = await api.put(`/admin/purchase-orders/${id}/receive`);
    return response.data;
  },

  cancelOrder: async (id) => {
    const response = await api.put(`/admin/purchase-orders/${id}/cancel`);
    return response.data;
  },
};

export default purchaseService;
