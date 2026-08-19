import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const prescriptionService = {
    getAllPrescriptions: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/prescriptions?${queryParams}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch prescriptions');
        return response.json();
    },

    getPrescriptionById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch prescription');
        return response.json();
    },

    getPrescriptionsByPatientId: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch patient prescriptions');
        return response.json();
    },

    createPrescription: async (prescriptionData) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(prescriptionData)
        });
        if (!response.ok) throw new Error('Failed to create prescription');
        return response.json();
    },

    updatePrescription: async (id, prescriptionData) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(prescriptionData)
        });
        if (!response.ok) throw new Error('Failed to update prescription');
        return response.json();
    },

    deletePrescription: async (id) => {
        const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete prescription');
        return response.json();
    },

    getDoctorStats: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/prescriptions/stats?${queryParams}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctor stats');
        return response.json();
    }
};
