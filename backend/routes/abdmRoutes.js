const express = require('express');
const router = express.Router();
const abdmController = require('../controllers/abdmController');
const pmjayController = require('../controllers/pmjayController');
const authMiddleware = require('../middleware/authMiddleware');

// ABHA (Health ID) Routes
router.post('/generate-otp', authMiddleware, abdmController.generateOtp);
router.post('/verify-otp', authMiddleware, abdmController.verifyOtp);
router.post('/create-health-id', authMiddleware, abdmController.createHealthId);
router.post('/search-by-health-id', authMiddleware, abdmController.searchByHealthId);
router.post('/search-by-demographics', authMiddleware, abdmController.searchByDemographics);

// ABHA Linking Routes
router.post('/link-abha', authMiddleware, abdmController.linkABHA);
router.get('/patient/:patient_id/abha', authMiddleware, abdmController.getPatientABHA);
router.delete('/patient/:patient_id/abha', authMiddleware, abdmController.unlinkABHA);

// HIP Services Routes
router.post('/link-care-context', authMiddleware, abdmController.linkCareContext);
router.post('/discover', authMiddleware, abdmController.discover);

// PMJAY Routes
router.post('/pmjay/verify-beneficiary', authMiddleware, pmjayController.verifyBeneficiary);
router.post('/pmjay/beneficiary-details', authMiddleware, pmjayController.getBeneficiaryDetails);
router.post('/pmjay/check-eligibility', authMiddleware, pmjayController.checkEligibility);
router.post('/pmjay/submit-claim', authMiddleware, pmjayController.submitClaim);
router.post('/pmjay/claim-status', authMiddleware, pmjayController.getClaimStatus);
router.get('/pmjay/packages', authMiddleware, pmjayController.getPackages);
router.get('/pmjay/packages/:packageCode', authMiddleware, pmjayController.getPackageDetails);

module.exports = router;
