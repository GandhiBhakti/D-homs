const pmjayService = require('../services/pmjayService');
const db = require('../config/database');

/**
 * Verify PMJAY beneficiary
 */
exports.verifyBeneficiary = async (req, res) => {
  try {
    const { cardNumber, mobile } = req.body;
    
    if (!cardNumber || !mobile) {
      return res.status(400).json({ error: 'Card number and mobile number are required' });
    }

    const result = await pmjayService.verifyBeneficiary(cardNumber, mobile);
    
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
 * Get PMJAY beneficiary details
 */
exports.getBeneficiaryDetails = async (req, res) => {
  try {
    const { cardNumber } = req.body;
    
    if (!cardNumber) {
      return res.status(400).json({ error: 'Card number is required' });
    }

    const result = await pmjayService.getBeneficiaryDetails(cardNumber);
    
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
 * Check PMJAY eligibility for treatment
 */
exports.checkEligibility = async (req, res) => {
  try {
    const { cardNumber, packageCode } = req.body;
    
    if (!cardNumber || !packageCode) {
      return res.status(400).json({ error: 'Card number and package code are required' });
    }

    const result = await pmjayService.checkEligibility(cardNumber, packageCode);
    
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
 * Submit PMJAY claim
 */
exports.submitClaim = async (req, res) => {
  try {
    const claimData = req.body;
    
    if (!claimData.cardNumber || !claimData.packageCode || !claimData.amount) {
      return res.status(400).json({ error: 'Card number, package code, and amount are required' });
    }

    const result = await pmjayService.submitClaim(claimData);
    
    if (result.success) {
      // Store claim in local database
      await db.execute(
        'INSERT INTO pmjay_claims (patient_id, card_number, package_code, amount, claim_id, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [claimData.patientId || null, claimData.cardNumber, claimData.packageCode, claimData.amount, result.data.claimId, 'submitted']
      );
      
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get PMJAY claim status
 */
exports.getClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.body;
    
    if (!claimId) {
      return res.status(400).json({ error: 'Claim ID is required' });
    }

    const result = await pmjayService.getClaimStatus(claimId);
    
    if (result.success) {
      // Update claim status in local database
      await db.execute(
        'UPDATE pmjay_claims SET status = ?, updated_at = NOW() WHERE claim_id = ?',
        [result.data.status, claimId]
      );
      
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get available PMJAY packages
 */
exports.getPackages = async (req, res) => {
  try {
    const result = await pmjayService.getPackages();
    
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
 * Get PMJAY package details
 */
exports.getPackageDetails = async (req, res) => {
  try {
    const { packageCode } = req.params;
    
    const result = await pmjayService.getPackageDetails(packageCode);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
