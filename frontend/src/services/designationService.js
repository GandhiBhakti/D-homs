import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const designationService = {
    getAllDesignations: async () => {
        const response = await fetch(`${API_BASE_URL}/designations`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch designations');
        return response.json();
    },

    getDesignationById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/designations/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch designation');
        return response.json();
    },

    createDesignation: async (designationData) => {
        const response = await fetch(`${API_BASE_URL}/designations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(designationData)
        });
        if (!response.ok) throw new Error('Failed to create designation');
        return response.json();
    },

    updateDesignation: async (id, designationData) => {
        const response = await fetch(`${API_BASE_URL}/designations/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(designationData)
        });
        if (!response.ok) throw new Error('Failed to update designation');
        return response.json();
    },

    deleteDesignation: async (id) => {
        const response = await fetch(`${API_BASE_URL}/designations/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete designation');
        return response.json();
    }
};
