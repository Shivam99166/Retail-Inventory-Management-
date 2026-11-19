import api from './api';

export const stockTransferService = {
  getTransfers: async () => {
    const response = await api.get('/admin/transfers');
    return response.data;
  },

  requestTransfer: async (transferData) => {
    const response = await api.post('/admin/transfers', transferData);
    return response.data;
  },

  approveTransfer: async (id) => {
    const response = await api.put(`/admin/transfers/${id}/approve`);
    return response.data;
  },

  completeTransfer: async (id) => {
    const response = await api.put(`/admin/transfers/${id}/complete`);
    return response.data;
  },

  rejectTransfer: async (id) => {
    const response = await api.put(`/admin/transfers/${id}/reject`);
    return response.data;
  },
};

export default stockTransferService;

