import { Transaction, FinancialSummary } from '../types';

// Placeholder base API URL for FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private useMockMode = true;

  toggleMockMode(enabled: boolean) {
    this.useMockMode = enabled;
  }

  isMockMode() {
    return this.useMockMode;
  }

  // Firebase Auth placeholder simulations
  async getSession() {
    if (this.useMockMode) {
      const storedUser = localStorage.getItem('rih_user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`);
      if (!response.ok) throw new Error('Auth session invalid');
      return await response.json();
    } catch (error) {
      console.warn('API authentication unavailable, falling back to cached local session', error);
      const storedUser = localStorage.getItem('rih_user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
  }

  // Fetch all transactions
  async fetchTransactions(): Promise<Transaction[]> {
    if (this.useMockMode) {
      // Handled inside AppContext from mock data files
      return [];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    } catch (error) {
      console.error('API Error: fetchTransactions', error);
      throw error;
    }
  }

  // Upload raw CSV contents to FastAPI / Firebase
  async uploadCSV(file: File): Promise<{ success: boolean; rowsParsed: number; summary: Partial<FinancialSummary> }> {
    if (this.useMockMode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            rowsParsed: 150,
            summary: {}
          });
        }, 1200);
      });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/transactions/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('CSV upload failed on backend server');
      return await response.json();
    } catch (error) {
      console.error('API Error: uploadCSV', error);
      throw error;
    }
  }

  // Save financial summary data to Firebase Firestore placeholder
  async saveFinancialSummary(summary: FinancialSummary): Promise<boolean> {
    if (this.useMockMode) {
      console.log('Firebase Mock: Saving summary to Firestore', summary);
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reports/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });
      return response.ok;
    } catch (error) {
      console.error('API Error: saveFinancialSummary', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
