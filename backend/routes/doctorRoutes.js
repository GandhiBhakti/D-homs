const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

// Doctor CRUD routes
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "doctor", "receptionist"]),
  doctorController.getAllDoctors,
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "doctor", "receptionist"]),
  doctorController.getDoctorById,
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  doctorController.createDoctor,
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  doctorController.updateDoctor,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  doctorController.deleteDoctor,
);

module.exports = router;
