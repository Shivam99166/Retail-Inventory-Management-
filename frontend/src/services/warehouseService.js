import api from './api';

export const warehouseService = {
  // Public GET — no auth needed
  getWarehouses: async (activeOnly = true) => {
    const response = await api.get('/warehouses', { params: { activeOnly } });
    return response.data;
  },

  getWarehouseById: async (id) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  // Admin-only mutations
  createWarehouse: async (warehouseData) => {
    const response = await api.post('/warehouses', warehouseData);
    return response.data;
  },

  updateWarehouse: async (id, warehouseData) => {
    const response = await api.put(`/warehouses/${id}`, warehouseData);
    return response.data;
  },
};

export default warehouseService;
