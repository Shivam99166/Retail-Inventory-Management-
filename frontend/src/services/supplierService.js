import api from './api';

export const supplierService = {
  // Public GET — no auth needed
  getSuppliers: async (activeOnly = true) => {
    const response = await api.get('/suppliers', { params: { activeOnly } });
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Admin-only mutations
  createSupplier: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },
};

export default supplierService;
