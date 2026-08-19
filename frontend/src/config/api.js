// Centralized API Configuration for Production
// All API calls must use this single base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
