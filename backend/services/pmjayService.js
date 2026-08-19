const { getPmjayConfig } = require('../config/abdm');
const axios = require('axios');

class PMJAYService {
  constructor() {
    this.config = getPmjayConfig();
    this.apiBaseUrl = this.config.apiBaseUrl;
    this.beneficiaryUrl = this.config.beneficiaryUrl;
    this.claimUrl = this.config.claimUrl;
    this.useMockMode = !this.config.clientId; // Use mock mode if no credentials
  }

  /**
   * Verify PMJAY beneficiary by card number
   * @param {string} cardNumber - PMJAY card number
   * @param {string} mobile - Registered mobile number
   */
  async verifyBeneficiary(cardNumber, mobile) {
    // Mock mode for testing without credentials
    if (this.useMockMode) {
      console.log('PMJAY: Using mock mode for beneficiary verification');
      return {
        success: true,
        data: {
          cardNumber: cardNumber,
          mobile: mobile,
          name: 'Test Beneficiary',
          familyId: 'FAM' + cardNumber.substring(0, 4),
          eligible: true,
          status: 'active'
        },
        message: 'Beneficiary verified successfully (Mock Mode)'
      };
    }

    try {
      const url = `${this.beneficiaryUrl}/verify`;
      const response = await axios.post(url, {
        cardNumber: cardNumber,
        mobile: mobile,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        hospitalId: this.config.hospitalId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Beneficiary verified successfully'
      };
    } catch (error) {
      console.error('PMJAY Beneficiary Verification Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify beneficiary'
      };
    }
  }

  /**
   * Get PMJAY beneficiary details
   * @param {string} cardNumber - PMJAY card number
   */
  async getBeneficiaryDetails(cardNumber) {
    try {
      const url = `${this.beneficiaryUrl}/details`;
      const response = await axios.post(url, {
        cardNumber: cardNumber,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        hospitalId: this.config.hospitalId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Beneficiary details retrieved successfully'
      };
    } catch (error) {
      console.error('PMJAY Beneficiary Details Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get beneficiary details'
      };
    }
  }

  /**
   * Check PMJAY eligibility for a treatment
   * @param {string} cardNumber - PMJAY card number
   * @param {string} packageCode - Treatment package code
   */
  async checkEligibility(cardNumber, packageCode) {
    try {
      const url = `${this.beneficiaryUrl}/eligibility`;
      const response = await axios.post(url, {
        cardNumber: cardNumber,
        packageCode: packageCode,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        hospitalId: this.config.hospitalId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Eligibility checked successfully'
      };
    } catch (error) {
      console.error('PMJAY Eligibility Check Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check eligibility'
      };
    }
  }

  /**
   * Submit PMJAY claim
   * @param {object} claimData - Claim details
   */
  async submitClaim(claimData) {
    try {
      const url = `${this.claimUrl}/submit`;
      const response = await axios.post(url, {
        ...claimData,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        hospitalId: this.config.hospitalId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Claim submitted successfully'
      };
    } catch (error) {
      console.error('PMJAY Claim Submission Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit claim'
      };
    }
  }

  /**
   * Get PMJAY claim status
   * @param {string} claimId - Claim ID
   */
  async getClaimStatus(claimId) {
    try {
      const url = `${this.claimUrl}/status`;
      const response = await axios.post(url, {
        claimId: claimId,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        hospitalId: this.config.hospitalId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Claim status retrieved successfully'
      };
    } catch (error) {
      console.error('PMJAY Claim Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get claim status'
      };
    }
  }

  /**
   * Get available PMJAY packages
   */
  async getPackages() {
    try {
      const url = `${this.apiBaseUrl}/packages`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Packages retrieved successfully'
      };
    } catch (error) {
      console.error('PMJAY Packages Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get packages'
      };
    }
  }

  /**
   * Get PMJAY package details
   * @param {string} packageCode - Package code
   */
  async getPackageDetails(packageCode) {
    try {
      const url = `${this.apiBaseUrl}/packages/${packageCode}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Package details retrieved successfully'
      };
    } catch (error) {
      console.error('PMJAY Package Details Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get package details'
      };
    }
  }
}

module.exports = new PMJAYService();
