const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const designationRoutes = require("./routes/designationRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const opdRoutes = require("./routes/opdRoutes");
const ipdRoutes = require("./routes/ipdRoutes");
const billingRoutes = require("./routes/billingRoutes");
const investigationRoutes = require("./routes/investigationRoutes");
const emergencyChargeRoutes = require("./routes/emergencyChargeRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const dischargeSummaryRoutes = require("./routes/dischargeSummaryRoutes");
const printRoutes = require("./routes/printRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const abdmRoutes = require("./routes/abdmRoutes");

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required in production');
}

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/opd", opdRoutes);
app.use("/api/ipd", ipdRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/investigations", investigationRoutes);
app.use("/api/emergency-charges", emergencyChargeRoutes);
app.use("/api/system-settings", systemSettingsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/discharge-summaries", dischargeSummaryRoutes);
app.use("/api/print", printRoutes);
app.use("/api/receptionist", receptionistRoutes);
app.use("/api/abdm", abdmRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Hospital Management System API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'Internal server error'
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

const ensureDefaultAdmin = async () => {
  try {
    const [rows] = await db.execute("SELECT id FROM users WHERE username = ?", [
      "admin",
    ]);

    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.execute(
        "INSERT INTO users (username, email, password, first_name, last_name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          "admin",
          "admin@gmail.com",
          hashedPassword,
          "System",
          "Admin",
          "admin",
          "0000000000",
          true,
        ],
      );
      console.log("Default admin account created. Please change the password immediately.");
    }
  } catch (error) {
    console.error("Unable to create default admin account:", error.message);
  }
};

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${server.address().port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Please use a different port or stop the process using this port.`);
      process.exit(1);
    } else {
      console.error(error);
      process.exit(1);
    }
  });
};

// Start server
if (process.env.NODE_ENV !== 'production') {
  ensureDefaultAdmin().then(() => {
    startServer(PORT);
  });
} else {
  startServer(PORT);
}
