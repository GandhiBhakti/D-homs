import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const investigationService = {
  getAllInvestigations: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/investigations${queryString ? `?${queryString}` : ''}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch investigations');
    return response.json();
  },

  getInvestigationById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/investigations/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch investigation');
    return response.json();
  },

  createInvestigation: async (investigationData) => {
    const response = await fetch(`${API_BASE_URL}/investigations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(investigationData),
    });
    if (!response.ok) throw new Error('Failed to create investigation');
    return response.json();
  },

  updateInvestigation: async (id, investigationData) => {
    const response = await fetch(`${API_BASE_URL}/investigations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(investigationData),
    });
    if (!response.ok) throw new Error('Failed to update investigation');
    return response.json();
  },

  deleteInvestigation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/investigations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete investigation');
    return response.json();
  },

  getInvestigationsByDateRange: async (startDate, endDate, investigationType = null) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (investigationType) params.append('investigationType', investigationType);
    const response = await fetch(`${API_BASE_URL}/investigations/date-range?${params}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch investigations by date range');
    return response.json();
  },
};
