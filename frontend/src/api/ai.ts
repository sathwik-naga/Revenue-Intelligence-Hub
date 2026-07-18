import { apiClient } from './client';

export const aiApi = {
  async analyze(companyId?: string) {
    const res = await apiClient.post('/api/ai/analyze', {}, {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async getLatest(companyId?: string) {
    const res = await apiClient.get('/api/ai/analysis/latest', {
      params: companyId ? { company_id: companyId } : {}
    }) as any;
    return res;
  },
  async chat(question: string, companyId?: string) {
    const res = await apiClient.post('/api/ai/chat', {
      question,
      companyId
    }) as any;
    return res;
  }
};
