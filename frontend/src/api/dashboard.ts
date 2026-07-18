import { apiClient } from './client';

export const dashboardApi = {
  async getOverview(companyId?: string) {
    const res = await apiClient.get('/api/dashboard/overview', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async getCharts(companyId?: string) {
    const res = await apiClient.get('/api/dashboard/charts', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async getHealth(companyId?: string) {
    const res = await apiClient.get('/api/dashboard/health', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async getRecent(companyId?: string) {
    const res = await apiClient.get('/api/dashboard/recent-transactions', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  }
};
