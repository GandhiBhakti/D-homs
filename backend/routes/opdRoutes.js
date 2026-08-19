const express = require("express");
const router = express.Router();
const opdController = require("../controllers/opdController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  opdController.getOPDVisits,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  opdController.createOPDVisit,
);
router.post(
  "/convert-to-ipd",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor"]),
  opdController.convertOPDtoIPD,
);
router.get(
  "/doctor/:doctorId/patients",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor"]),
  opdController.getDoctorPatients,
);

module.exports = router;
