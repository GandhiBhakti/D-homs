const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.getPermissions);
router.post("/", authController.createPermission);

module.exports = router;
