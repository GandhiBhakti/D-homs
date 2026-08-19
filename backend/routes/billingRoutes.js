const express = require("express");
const router = express.Router();
const billingController = require("../controllers/billingController");
const { isAdmin } = require("../middleware/adminAuth");

router.get("/", billingController.getAllBills);
router.get("/summary", billingController.getRevenueSummary);
router.get("/daily", billingController.getDailyRevenue);
router.get("/doctors", billingController.getRevenueByDoctor);
router.get("/commission", billingController.getDoctorCommissionReport);
router.get("/:id", billingController.getBillById);
router.post("/", billingController.createBill);
router.put("/:id/payment", billingController.updateBillPayment);
router.delete("/:id", isAdmin, billingController.deleteBill);
router.put("/:id/refund", isAdmin, billingController.refundBill);

module.exports = router;
