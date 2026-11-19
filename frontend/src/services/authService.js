import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // response will be ApiResponse { success: true, message: "...", data: AuthResponse }
    if (response.data && response.data.token) {
      localStorage.setItem('retailhub_token', response.data.token);
      localStorage.setItem('retailhub_user', JSON.stringify({
        email: response.data.email,
        name: response.data.name,
        role: response.data.role
      }));
    }
    return response.data;
  },

  register: async (name, email, password, phone = '', address = '') => {
    const response = await api.post('/auth/register', { name, email, password, phone, address });
    if (response.data && response.data.token) {
      localStorage.setItem('retailhub_token', response.data.token);
      localStorage.setItem('retailhub_user', JSON.stringify({
        email: response.data.email,
        name: response.data.name,
        role: response.data.role
      }));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.message || 'If an account with this email exists, password reset instructions have been generated.';
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.message || 'Password has been reset successfully. Please sign in with your new password.';
  },

  logout: () => {
    localStorage.removeItem('retailhub_token');
    localStorage.removeItem('retailhub_user');
  }
};

export default authService;
