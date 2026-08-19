import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const departmentService = {
    getAllDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    },

    getDepartmentById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch department');
        return response.json();
    },

    createDepartment: async (departmentData) => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(departmentData)
        });
        if (!response.ok) throw new Error('Failed to create department');
        return response.json();
    },

    updateDepartment: async (id, departmentData) => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(departmentData)
        });
        if (!response.ok) throw new Error('Failed to update department');
        return response.json();
    },

    deleteDepartment: async (id) => {
        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete department');
        return response.json();
    }
};
