import api from './api';

export const inventoryService = {
  getInventory: async () => {
    const response = await api.get('/admin/inventory');
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/admin/inventory/low-stock');
    return response.data;
  },

  getOutOfStock: async () => {
    const response = await api.get('/admin/inventory/out-of-stock');
    return response.data;
  },
};

export default inventoryService;
