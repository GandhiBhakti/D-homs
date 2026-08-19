const express = require("express");
const router = express.Router();
const ipdController = require("../controllers/ipdController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  ipdController.getIPDVisits,
);
router.get(
  "/active",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  ipdController.getActiveIPD,
);
router.get(
  "/statistics",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  ipdController.getIPDStatistics,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor", "receptionist"]),
  ipdController.createIPDAdmission,
);
router.put(
  "/:id/discharge",
  authMiddleware,
  roleMiddleware(["admin", "staff", "doctor"]),
  ipdController.dischargeIPDPatient,
);

module.exports = router;
