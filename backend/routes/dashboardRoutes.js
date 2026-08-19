const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get key metrics
router.get('/metrics', dashboardController.getKeyMetrics);

// Get hospital overview (last 7 days)
router.get('/overview', dashboardController.getHospitalOverview);

// Get system status
router.get('/system-status', dashboardController.getSystemStatus);

// Get department-wise OPD
router.get('/department-opd', dashboardController.getDepartmentOPD);

// Get top doctors
router.get('/top-doctors', dashboardController.getTopDoctors);

// Get revenue overview
router.get('/revenue', dashboardController.getRevenueOverview);

// Get doctor-wise revenue
router.get('/doctor-revenue', dashboardController.getDoctorRevenue);

// Get daily revenue breakdown
router.get('/daily-revenue', dashboardController.getDailyRevenueBreakdown);

// Get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

// Get KPI data for dashboard
router.get('/kpi', dashboardController.getKPIData);

module.exports = router;
