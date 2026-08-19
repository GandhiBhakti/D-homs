import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const opdService = {
  getOPDVisits: async () => {
    const response = await fetch(`${API_BASE_URL}/opd`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to load OPD visits");
    }

    return response.json();
  },

  createOPDVisit: async (visitData) => {
    const response = await fetch(`${API_BASE_URL}/opd`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(visitData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to save OPD visit");
    }

    return response.json();
  },
};
