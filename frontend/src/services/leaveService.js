import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('No access token found in localStorage');
    }
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const leaveService = {
    getAllLeaves: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch leaves');
        }
        return response.json();
    },

    getLeaveById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch leave');
        return response.json();
    },

    getLeavesByDoctor: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/leaves/doctor/${doctorId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctor leaves');
        return response.json();
    },

    createLeave: async (leaveData) => {
        const response = await fetch(`${API_BASE_URL}/leaves`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(leaveData)
        });
        if (!response.ok) throw new Error('Failed to create leave');
        return response.json();
    },

    updateLeave: async (id, leaveData) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(leaveData)
        });
        if (!response.ok) throw new Error('Failed to update leave');
        return response.json();
    },

    updateLeaveStatus: async (id, status, approvedBy) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, approved_by: approvedBy })
        });
        if (!response.ok) throw new Error('Failed to update leave status');
        return response.json();
    },

    deleteLeave: async (id) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete leave');
        return response.json();
    }
};
