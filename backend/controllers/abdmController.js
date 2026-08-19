const abdmService = require('../services/abdmService');
const ABHA = require('../models/ABHA');
const db = require('../config/database');

/**
 * Generate OTP for ABHA verification
 */
exports.generateOtp = async (req, res) => {
  try {
    const { healthId, authMethod } = req.body;
    
    if (!healthId) {
      return res.status(400).json({ error: 'Health ID or mobile number is required' });
    }

    const result = await abdmService.generateOtp(healthId, authMethod || 'mobile');
    
    if (result.success) {
      // Store transaction ID in session or database for verification
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify OTP for ABHA authentication
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    
    if (!txnId || !otp) {
      return res.status(400).json({ error: 'Transaction ID and OTP are required' });
    }

    const result = await abdmService.verifyOtp(txnId, otp);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new ABHA (Health ID)
 */
exports.createHealthId = async (req, res) => {
  try {
    const patientData = req.body;
    
    if (!patientData.healthId || !patientData.name || !patientData.gender) {
      return res.status(400).json({ error: 'Required fields: healthId, name, gender' });
    }

    const result = await abdmService.createHealthId(patientData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search patient by ABHA number
 */
exports.searchByHealthId = async (req, res) => {
  try {
    const { healthId, accessToken } = req.body;
    
    if (!healthId || !accessToken) {
      return res.status(400).json({ error: 'Health ID and access token are required' });
    }

    const result = await abdmService.searchByHealthId(healthId, accessToken);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search patient by demographics
 */
exports.searchByDemographics = async (req, res) => {
  try {
    const demographics = req.body;
    const { accessToken } = req.body;
    
    if (!demographics.name || !demographics.gender || !demographics.yearOfBirth) {
      return res.status(400).json({ error: 'Required fields: name, gender, yearOfBirth' });
    }

    const result = await abdmService.searchByDemographics(demographics, accessToken);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Link ABHA to patient record
 */
exports.linkABHA = async (req, res) => {
  try {
    const { patient_id, health_id, health_id_number, name, gender, year_of_birth, 
            day_of_birth, month_of_birth, state, district, mobile, email, address, 
            access_token, refresh_token } = req.body;
    
    if (!patient_id || !health_id) {
      return res.status(400).json({ error: 'Patient ID and Health ID are required' });
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if ABHA already exists for this patient
      const [existing] = await connection.execute(
        'SELECT id FROM patient_abha WHERE patient_id = ?',
        [patient_id]
      );
      
      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'ABHA already linked to this patient' });
      }
      
      // Create ABHA record
      const abhaData = {
        patient_id,
        health_id,
        health_id_number,
        name,
        gender,
        year_of_birth,
        day_of_birth,
        month_of_birth,
        state,
        district,
        mobile,
        email,
        address,
        verification_status: 'verified',
        access_token,
        refresh_token
      };
      
      const abha = await ABHA.createABHA(connection, abhaData);
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'ABHA linked successfully',
        data: abha
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get ABHA details for a patient
 */
exports.getPatientABHA = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const abha = await ABHA.getByPatientId(patient_id);
    
    if (!abha) {
      return res.status(404).json({ error: 'ABHA not found for this patient' });
    }
    
    res.json(abha);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Unlink ABHA from patient record
 */
exports.unlinkABHA = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const abha = await ABHA.getByPatientId(patient_id);
    
    if (!abha) {
      return res.status(404).json({ error: 'ABHA not found for this patient' });
    }
    
    await ABHA.delete(abha.id);
    
    res.json({
      success: true,
      message: 'ABHA unlinked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Link care context for HIP services
 */
exports.linkCareContext = async (req, res) => {
  try {
    const linkData = req.body;
    
    const result = await abdmService.linkCareContext(linkData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Discover health information from HIP
 */
exports.discover = async (req, res) => {
  try {
    const { patientId, requestId } = req.body;
    
    if (!patientId || !requestId) {
      return res.status(400).json({ error: 'Patient ID and Request ID are required' });
    }

    const result = await abdmService.discover(patientId, requestId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
