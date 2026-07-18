import { apiClient } from './client';

export const notificationsApi = {
  async getHistory() {
    const res = await apiClient.get('/api/notifications/history') as any;
    return res;
  },
  
  async getPreferences() {
    const res = await apiClient.get('/api/notifications/preferences') as any;
    return res;
  },
  
  async updatePreferences(preferences: {
    emailEnabled?: boolean;
    whatsappEnabled?: boolean;
    weeklySummary?: boolean;
    aiAlerts?: boolean;
    expenseAlerts?: boolean;
    profitAlerts?: boolean;
    csvCompleted?: boolean;
    whatsappNumber?: string;
  }) {
    const res = await apiClient.put('/api/notifications/preferences', preferences) as any;
    return res;
  },
  
  async getStatus() {
    const res = await apiClient.get('/api/notifications/status') as any;
    return res;
  },
  
  async triggerSend(companyId?: string) {
    const res = await apiClient.post('/api/notifications/send', { companyId }) as any;
    return res;
  },
  
  async testEmail(email?: string) {
    const res = await apiClient.post('/api/notifications/email/test', { email }) as any;
    return res;
  },
  
  async testWhatsApp(phoneNumber: string) {
    const res = await apiClient.post('/api/notifications/whatsapp/test', { phoneNumber }) as any;
    return res;
  }
};
