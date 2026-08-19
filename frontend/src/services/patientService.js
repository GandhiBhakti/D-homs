import API_BASE_URL from '../config/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const patientService = {
    getAllPatients: async () => {
        const response = await fetch(`${API_BASE_URL}/patients`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch patients (${response.status})`);
        }
        return response.json();
    },

    getPatientById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch patient');
        return response.json();
    },

    createPatient: async (patientData) => {
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        if (!response.ok) throw new Error('Failed to create patient');
        return response.json();
    },

    updatePatient: async (id, patientData) => {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        if (!response.ok) throw new Error('Failed to update patient');
        return response.json();
    },

    deletePatient: async (id) => {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete patient');
        return response.json();
    }
};
