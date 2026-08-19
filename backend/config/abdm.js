// ABDM Configuration
// This file contains ABDM sandbox/production credentials and configuration
// You need to register at https://sandbox.abdm.gov.in/ to get credentials

const ABDM_CONFIG = {
  // Environment: 'sandbox' or 'production'
  environment: process.env.ABDM_ENV || 'sandbox',
  
  // ABDM Sandbox Credentials (obtain from https://sandbox.abdm.gov.in/)
  sandbox: {
    clientId: process.env.ABDM_SANDBOX_CLIENT_ID || '',
    clientSecret: process.env.ABDM_SANDBOX_CLIENT_SECRET || '',
    apiBaseUrl: 'https://healthidsbx.ndhm.gov.in',
    gatewayUrl: 'https://dev.abdm.gov.in',
    hipUrl: 'https://dev.abdm.gov.in'
  },
  
  // ABDM Production Credentials (obtain after sandbox certification)
  production: {
    clientId: process.env.ABDM_PROD_CLIENT_ID || '',
    clientSecret: process.env.ABDM_PROD_CLIENT_SECRET || '',
    apiBaseUrl: 'https://healthids.ndhm.gov.in',
    gatewayUrl: 'https://abdm.gov.in',
    hipUrl: 'https://abdm.gov.in'
  },
  
  // API Endpoints
  endpoints: {
    // ABHA (Health ID) APIs
    generateOtp: '/api/v1/ha/generateOtp',
    verifyOtp: '/api/v1/ha/verifyOtp',
    createHealthId: '/api/v1/ha/createHealthId',
    searchByHealthId: '/api/v1/ha/searchByHealthId',
    searchByDemographics: '/api/v1/ha/searchByDemographics',
    getHealthId: '/api/v1/ha/getHealthId',
    
    // HIP APIs
    linkCareContext: '/gateway/v0.5/hip/link-care-context',
    addContexts: '/gateway/v0.5/hip/add-contexts',
    onLinkRequest: '/gateway/v0.5/hip/on-link-request',
    discover: '/gateway/v0.5/hip/discover',
    consentNotify: '/gateway/v0.5/hip/consent/notify',
    dataTransfer: '/gateway/v0.5/hip/data-transfer',
    
    // HIU APIs
    consentRequest: '/gateway/v0.5/hiu/consent/request',
    consentOnNotify: '/gateway/v0.5/hiu/consent/on-notify',
    dataFetchRequest: '/gateway/v0.5/hiu/data-request',
    dataTransferOnNotify: '/gateway/v0.5/hiu/data-transfer/on-notify'
  },
  
  // FHIR Configuration
  fhir: {
    baseUrl: 'https://nrces.in/ndhm/fhir/r4',
    implementationGuideUrl: 'https://nrces.in/ndhm/fhir/r4/ImplementationGuide/ndhm.in'
  },
  
  // PMJAY Configuration
  pmjay: {
    // PMJAY Sandbox/Production URLs
    apiBaseUrl: process.env.PMJAY_API_URL || 'https://hmis.pmjay.gov.in/api',
    beneficiaryUrl: process.env.PMJAY_BENEFICIARY_URL || 'https://hmis.pmjay.gov.in/api/beneficiary',
    claimUrl: process.env.PMJAY_CLAIM_URL || 'https://hmis.pmjay.gov.in/api/claim',
    
    // PMJAY Credentials (obtain from PMJAY portal)
    clientId: process.env.PMJAY_CLIENT_ID || '',
    clientSecret: process.env.PMJAY_CLIENT_SECRET || '',
    hospitalId: process.env.PMJAY_HOSPITAL_ID || '',
    
    // PMJAY Packages
    packages: {
      // Common surgical packages
      generalSurgery: 'GS001',
      orthopedic: 'ORT001',
      cardiovascular: 'CVS001',
      neurology: 'NEU001',
      pediatric: 'PED001',
      gynecology: 'GYN001',
      ophthalmology: 'OPH001',
      ent: 'ENT001',
      urology: 'URO001'
    }
  }
};

// Get current environment config
const getConfig = () => {
  const env = ABDM_CONFIG.environment;
  return ABDM_CONFIG[env];
};

// Get API base URL
const getApiBaseUrl = () => {
  const config = getConfig();
  return config.apiBaseUrl;
};

// Get Gateway URL
const getGatewayUrl = () => {
  const config = getConfig();
  return config.gatewayUrl;
};

// Get PMJAY config
const getPmjayConfig = () => {
  return ABDM_CONFIG.pmjay;
};

module.exports = {
  ABDM_CONFIG,
  getConfig,
  getApiBaseUrl,
  getGatewayUrl,
  getPmjayConfig
};
