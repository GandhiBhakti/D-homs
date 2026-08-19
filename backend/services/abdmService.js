const { ABDM_CONFIG, getApiBaseUrl, getGatewayUrl } = require('../config/abdm');
const axios = require('axios');

class ABDMService {
  constructor() {
    this.config = ABDM_CONFIG;
    this.apiBaseUrl = getApiBaseUrl();
    this.gatewayUrl = getGatewayUrl();
    this.useMockMode = !this.config.sandbox.clientId; // Use mock mode if no credentials
  }

  /**
   * Generate OTP for ABHA verification
   * @param {string} healthId - ABHA number or mobile number
   * @param {string} authMethod - 'mobile' or 'aadhaar'
   */
  async generateOtp(healthId, authMethod = 'mobile') {
    // Mock mode for testing without credentials
    if (this.useMockMode) {
      console.log('ABDM: Using mock mode for OTP generation');
      return {
        success: true,
        txnId: 'MOCK_TXN_' + Date.now(),
        message: 'OTP generated successfully (Mock Mode)'
      };
    }

    try {
      const url = `${this.apiBaseUrl}${this.config.endpoints.generateOtp}`;
      const response = await axios.post(url, {
        healthId: healthId,
        authMethod: authMethod
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId
        }
      });

      return {
        success: true,
        txnId: response.data.txnId,
        message: 'OTP generated successfully'
      };
    } catch (error) {
      console.error('ABDM OTP Generation Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate OTP'
      };
    }
  }

  /**
   * Verify OTP for ABHA authentication
   * @param {string} txnId - Transaction ID from generateOtp
   * @param {string} otp - OTP entered by user
   */
  async verifyOtp(txnId, otp) {
    // Mock mode for testing without credentials
    if (this.useMockMode) {
      console.log('ABDM: Using mock mode for OTP verification');
      return {
        success: true,
        token: 'MOCK_TOKEN_' + Date.now(),
        accessToken: 'MOCK_ACCESS_TOKEN_' + Date.now(),
        refreshToken: 'MOCK_REFRESH_TOKEN_' + Date.now(),
        healthIdNumber: '12345678901234',
        message: 'OTP verified successfully (Mock Mode)'
      };
    }

    try {
      const url = `${this.apiBaseUrl}${this.config.endpoints.verifyOtp}`;
      const response = await axios.post(url, {
        txnId: txnId,
        otp: otp
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId
        }
      });

      return {
        success: true,
        token: response.data.token,
        accessToken: response.data.accessToken,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('ABDM OTP Verification Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify OTP'
      };
    }
  }

  /**
   * Create new ABHA (Health ID)
   * @param {object} patientData - Patient demographic data
   */
  async createHealthId(patientData) {
    try {
      const url = `${this.apiBaseUrl}${this.config.endpoints.createHealthId}`;
      const response = await axios.post(url, {
        healthId: patientData.healthId,
        name: patientData.name,
        gender: patientData.gender,
        yearOfBirth: patientData.yearOfBirth,
        dayOfBirth: patientData.dayOfBirth,
        monthOfBirth: patientData.monthOfBirth,
        state: patientData.state,
        district: patientData.district,
        address: patientData.address,
        mobile: patientData.mobile
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId,
          'Authorization': `Bearer ${patientData.accessToken}`
        }
      });
      
      return {
        success: true,
        healthId: response.data.healthId,
        healthIdNumber: response.data.healthIdNumber,
        message: 'ABHA created successfully'
      };
    } catch (error) {
      console.error('ABDM Health ID Creation Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create ABHA'
      };
    }
  }

  /**
   * Search patient by ABHA number
   * @param {string} healthId - ABHA number
   * @param {string} accessToken - Access token
   */
  async searchByHealthId(healthId, accessToken) {
    try {
      const url = `${this.apiBaseUrl}${this.config.endpoints.searchByHealthId}`;
      const response = await axios.post(url, {
        healthId: healthId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Patient found successfully'
      };
    } catch (error) {
      console.error('ABDM Health ID Search Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search ABHA'
      };
    }
  }

  /**
   * Search patient by demographics
   * @param {object} demographics - Patient demographic data
   * @param {string} accessToken - Access token
   */
  async searchByDemographics(demographics, accessToken) {
    try {
      const url = `${this.apiBaseUrl}${this.config.endpoints.searchByDemographics}`;
      const response = await axios.post(url, {
        name: demographics.name,
        gender: demographics.gender,
        yearOfBirth: demographics.yearOfBirth,
        dayOfBirth: demographics.dayOfBirth,
        monthOfBirth: demographics.monthOfBirth,
        state: demographics.state,
        district: demographics.district
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Patient search completed'
      };
    } catch (error) {
      console.error('ABDM Demographic Search Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search by demographics'
      };
    }
  }

  /**
   * Link care context for HIP services
   * @param {object} linkData - Care context linking data
   */
  async linkCareContext(linkData) {
    try {
      const url = `${this.gatewayUrl}${this.config.endpoints.linkCareContext}`;
      const response = await axios.post(url, linkData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Care context linked successfully'
      };
    } catch (error) {
      console.error('ABDM Care Context Link Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to link care context'
      };
    }
  }

  /**
   * Discover health information from HIP
   * @param {string} patientId - Patient ABHA ID
   * @param {string} requestId - Request ID
   */
  async discover(patientId, requestId) {
    try {
      const url = `${this.gatewayUrl}${this.config.endpoints.discover}`;
      const response = await axios.post(url, {
        requestId: requestId,
        patient: {
          id: patientId
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CM-ID': this.config.sandbox.clientId
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Discovery completed successfully'
      };
    } catch (error) {
      console.error('ABDM Discovery Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to discover health information'
      };
    }
  }
}

module.exports = new ABDMService();
