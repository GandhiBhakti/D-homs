const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// Patient CRUD routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  patientController.getAllPatients,
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  patientController.getPatientById,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "receptionist"]),
  patientController.createPatient,
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "staff", "receptionist"]),
  patientController.updatePatient,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  patientController.deletePatient,
);

module.exports = router;
