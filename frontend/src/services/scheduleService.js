import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const scheduleService = {
    getAllSchedules: async () => {
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch schedules');
        return response.json();
    },

    getScheduleById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch schedule');
        return response.json();
    },

    getSchedulesByDoctor: async (doctorId) => {
        const response = await fetch(`${API_BASE_URL}/schedules/doctor/${doctorId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch doctor schedules');
        return response.json();
    },

    createSchedule: async (scheduleData) => {
        const response = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(scheduleData)
        });
        if (!response.ok) throw new Error('Failed to create schedule');
        return response.json();
    },

    updateSchedule: async (id, scheduleData) => {
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(scheduleData)
        });
        if (!response.ok) throw new Error('Failed to update schedule');
        return response.json();
    },

    deleteSchedule: async (id) => {
        const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete schedule');
        return response.json();
    }
};
