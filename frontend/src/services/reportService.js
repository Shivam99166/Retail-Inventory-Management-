import api from './api';

export const reportService = {
  getDashboardSummary: async () => {
    const response = await api.get('/admin/reports/dashboard');
    return response.data;
  },

  getTransactionLogs: async () => {
    const response = await api.get('/admin/reports/transactions');
    return response.data;
  },
};

export default reportService;

