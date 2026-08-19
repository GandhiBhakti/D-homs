import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const commissionService = {
    getAllCommissions: async () => {
        const response = await fetch(`${API_BASE_URL}/commissions`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch commissions');
        return response.json();
    },

    getCommissionById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/commissions/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch commission');
        return response.json();
    },

    getCommissionsByDoctor: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/commissions/doctor/${doctorId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctor commissions');
        return response.json();
    },

    createCommission: async (commissionData) => {
        const response = await fetch(`${API_BASE_URL}/commissions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(commissionData)
        });
        if (!response.ok) throw new Error('Failed to create commission');
        return response.json();
    },

    updateCommission: async (id, commissionData) => {
        const response = await fetch(`${API_BASE_URL}/commissions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(commissionData)
        });
        if (!response.ok) throw new Error('Failed to update commission');
        return response.json();
    },

    deleteCommission: async (id) => {
        const response = await fetch(`${API_BASE_URL}/commissions/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete commission');
        return response.json();
    }
};
