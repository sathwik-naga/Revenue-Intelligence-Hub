import { apiClient } from './client';
import { Transaction } from '../types';

export const transactionApi = {
  async list(companyId?: string) {
    const res = await apiClient.get('/api/transactions', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async get(id: string) {
    const res = await apiClient.get(`/api/transactions/${id}`) as any;
    return res;
  },
  async create(data: Omit<Transaction, 'id'> & { companyId?: string }) {
    const payload = {
      ...data,
      paymentMethod: (data as any).paymentMethod || "Credit Card",
      paymentRisk: (data as any).paymentRisk || "low"
    };
    const res = await apiClient.post('/api/transactions', payload) as any;
    return res;
  },
  async update(id: string, data: Partial<Transaction> & { companyId?: string }) {
    const res = await apiClient.put(`/api/transactions/${id}`, data) as any;
    return res;
  },
  async delete(id: string) {
    const res = await apiClient.delete(`/api/transactions/${id}`) as any;
    return res;
  },
  async uploadCSV(file: File, companyId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (companyId) {
      formData.append('company_id', companyId);
    }
    const res = await apiClient.post('/api/upload/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as any;
    return res;
  }
};
