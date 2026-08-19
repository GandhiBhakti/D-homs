const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/profile", authMiddleware, authController.profile);
router.post("/change-password", authMiddleware, authController.changePassword);
router.get("/roles", authMiddleware, authController.getRoles);
router.post("/roles", authMiddleware, authController.createRole);
router.get("/permissions", authMiddleware, authController.getPermissions);
router.post("/permissions", authMiddleware, authController.createPermission);

module.exports = router;
