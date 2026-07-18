import { apiClient } from './client';

export interface CompanyData {
  companyName: string;
  industry: string;
  businessType: string;
  currency: string;
  financialYear: string;
  country: string;
}

export const companyApi = {
  async list() {
    const res = await apiClient.get('/api/companies') as any;
    return res;
  },
  async get(id: string) {
    const res = await apiClient.get(`/api/companies/${id}`) as any;
    return res;
  },
  async create(data: CompanyData) {
    const res = await apiClient.post('/api/companies', data) as any;
    return res;
  },
  async update(id: string, data: Partial<CompanyData>) {
    const res = await apiClient.put(`/api/companies/${id}`, data) as any;
    return res;
  },
  async delete(id: string) {
    const res = await apiClient.delete(`/api/companies/${id}`) as any;
    return res;
  }
};
