const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v2';

class ApiService {
  constructor(session) {
    this.session = session;
  }

  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.session?.access_token && { 
        Authorization: `Bearer ${this.session.access_token}` 
      }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'An error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Loan Applications
  async createLoanApplication(data) {
    return this.fetch('/loan-applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLoanApplication(id, data) {
    return this.fetch(`/loan-applications/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLoanApplication(id) {
    return this.fetch(`/loan-applications/${id}/`);
  }

  async getLoanApplications() {
    return this.fetch('/loan-applications/');
  }

  // Analysis
  async generateAnalysis(loanApplicationId) {
    return this.fetch(`/loan-analyses/generate/`, {
      method: 'POST',
      body: JSON.stringify({ loan_application_id: loanApplicationId }),
    });
  }

  async getAnalysis(id) {
    return this.fetch(`/loan-analyses/${id}/`);
  }

  async getAnalyses() {
    return this.fetch('/loan-analyses/');
  }

  // Natural Language Processing
  async processNaturalLanguage(text) {
    return this.fetch('/loan-applications/process-text/', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export default ApiService;
