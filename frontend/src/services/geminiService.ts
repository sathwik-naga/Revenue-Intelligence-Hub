import { Transaction, AIInsight, FinancialSummary } from '../types';

class GeminiService {

  // Analyzes transaction data using Gemini.
async analyzeFinancials(
  transactions: Transaction[],
  summary: FinancialSummary
): Promise<{
  insights: AIInsight[];
  analysisText: string;
  confidenceScore: number;
}> {
      const API_URL = import.meta.env.VITE_API_URL;
  const response = await fetch(`${API_URL}/api/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactions,
      summary,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze financials.");
  }

  return await response.json();
}

  // Custom Q&A engine for Ask AI panel
async askAIQuestion(
  question: string,
  transactions: Transaction[],
  summary: FinancialSummary
): Promise<string> {
  const API_URL = import.meta.env.VITE_API_URL;
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      transactions,
      summary,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to contact AI.");
  }

  const data = await response.json();

  return data.answer;
}

  // Generates mock insights based on current metrics

}

export const geminiService = new GeminiService();
