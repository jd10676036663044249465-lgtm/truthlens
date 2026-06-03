const TruthLensAPI = {
  async createAnalysis(formData) {
    const response = await fetch('/api/analyses', {
      method: 'POST',
      body: formData
    });

    return this.handleResponse(response);
  },

  async getAnalyses() {
    const response = await fetch('/api/analyses');
    return this.handleResponse(response);
  },

  async deleteAnalysis(id) {
    const response = await fetch(`/api/analyses/${id}`, {
      method: 'DELETE'
    });

    return this.handleResponse(response);
  },

  async getDashboardStats() {
    const response = await fetch('/api/dashboard/stats');
    return this.handleResponse(response);
  },

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible completar la solicitud.');
    }

    return data;
  }
};
