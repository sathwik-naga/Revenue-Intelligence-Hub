import { apiClient } from './client';

export const authApi = {
  async getSession() {
    const res = await apiClient.get('/api/auth/session') as any;
    return res.data; // Returns user object directly
  }
};
