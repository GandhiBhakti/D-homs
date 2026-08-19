import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const parseError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    if (data?.error) return data.error;
    if (data?.message) return data.message;
  } catch (error) {
    // ignore JSON parsing issues
  }
  return fallbackMessage;
};

export const doctorService = {
  getAllDoctors: async () => {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      headers: getAuthHeaders()
    });
    if (!response.ok)
      throw new Error(await parseError(response, "Failed to fetch doctors"));
    return response.json();
  },

  getDoctorById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok)
      throw new Error(await parseError(response, "Failed to fetch doctor"));
    return response.json();
  },

  createDoctor: async (doctorData) => {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(doctorData),
    });
    if (!response.ok)
      throw new Error(await parseError(response, "Failed to create doctor"));
    return response.json();
  },

  updateDoctor: async (id, doctorData) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(doctorData),
    });
    if (!response.ok)
      throw new Error(await parseError(response, "Failed to update doctor"));
    return response.json();
  },

  deleteDoctor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok)
      throw new Error(await parseError(response, "Failed to delete doctor"));
    return response.json();
  },
};
