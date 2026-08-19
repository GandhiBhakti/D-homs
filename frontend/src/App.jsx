import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Patients from "./components/Patients";
import Departments from "./components/Departments";
import Designation from "./components/Designation";
import PrescriptionList from "./components/PrescriptionList";
import DoctorList from "./components/DoctorList";
import DoctorSchedule from "./components/DoctorSchedule";
import DoctorAvailability from "./components/DoctorAvailability";
import DoctorLeave from "./components/DoctorLeave";
import DoctorCommission from "./components/DoctorCommission";
import DoctorPanel from "./components/DoctorPanel";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import RolePermissions from "./components/RolePermissions";
import OPDForm from "./components/OPDForm";
import OPDList from "./components/OPDList";
import TodayOPD from "./components/TodayOPD";
import IPDForm from "./components/IPDForm";
import IPDList from "./components/IPDList";
import TodayIPD from "./components/TodayIPD";
import IPDAdmissionForm from "./components/IPDAdmissionForm";
import IPDAdmissionList from "./components/IPDAdmissionList";
import BedAllocation from "./components/BedAllocation";
import BedStatus from "./components/BedStatus";
import DoctorVisit from "./components/DoctorVisit";
import AddVitals from "./components/AddVitals";
import VitalsHistory from "./components/VitalsHistory";
import BillDetails from "./components/BillDetails";
import GenerateInvoice from "./components/GenerateInvoice";
import BillingList from "./components/BillingList";
import DischargeForm from "./components/DischargeForm";
import DischargeSummary from "./components/DischargeSummary";
import ReceptionistDashboard from "./components/ReceptionistDashboard";
import ABHAVerification from "./components/ABHAVerification";
import PMJAYVerification from "./components/PMJAYVerification";
import { useAuth } from "./contexts/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { getHomeRoute } from "./utils/roleAccess";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAdmin, isDoctor, isStaff, isReceptionist } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const role = user?.role;
    const hasAccess = allowedRoles.some((roleName) => {
      if (roleName === "admin") return isAdmin();
      if (roleName === "doctor") return isDoctor();
      if (roleName === "staff") return isStaff();
      if (roleName === "receptionist") return isReceptionist();
      return false;
    });

    if (!hasAccess) {
      return <Navigate to={getHomeRoute(role)} replace />;
    }
  }

  return children;
};

// Main App Layout Component
const AppLayout = () => {
  const { user, isAdmin, isDoctor, isStaff, isReceptionist, logout } =
    useAuth();
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [patientListRefreshKey, setPatientListRefreshKey] = useState(0);
  const [isOPDOpen, setIsOPDOpen] = useState(true);
  const [isIPDOpen, setIsIPDOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleOPDVisitSaved = () => {
    setDashboardRefreshKey((prev) => prev + 1);
    setPatientListRefreshKey((prev) => prev + 1);
  };

  const handleIPDAdmissionSaved = () => {
    setDashboardRefreshKey((prev) => prev + 1);
    setPatientListRefreshKey((prev) => prev + 1);
  };

  const handleNavigate = (target) => {
    switch (target) {
      case "users":
        navigate("/admin/users");
        break;
      case "roles":
        navigate("/admin/roles");
        break;
      case "departments":
        navigate("/admin/departments");
        break;
      case "opd-list":
        navigate("/opd/list");
        break;
      case "opd-form":
        navigate("/opd/registration");
        break;
      case "ipd-list":
        navigate("/ipd/list");
        break;
      case "ipd-form":
        navigate("/ipd/registration");
        break;
      case "billing":
        navigate("/ipd/bill-details");
        break;
      default:
        console.log("Unknown navigation target:", target);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Redirect doctors to their panel when accessing dashboard
  useEffect(() => {
    if (isDoctor() && location.pathname === "/") {
      navigate("/doctors");
    }
  }, [location.pathname, isDoctor, navigate]);

  // Redirect receptionists to their OPD registration flow
  useEffect(() => {
    if (isReceptionist() && location.pathname === "/") {
      navigate("/opd/registration");
    }
  }, [location.pathname, navigate, isReceptionist]);

  return (
    <div className="app">
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-top">
            <div className="sidebar-logo">
              <img
                src="/logo.png"
                alt="Divine Hospital logo"
                className="sidebar-logo-image"
              />
              <div className="sidebar-logo-text">
                <h2>DIVINE HOSPITAL</h2>
                <p>Speciality Hospital</p>
              </div>
            </div>
            <div className="sidebar-user">
              <div className="user-avatar">
                {(user?.first_name || user?.username || "U")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-role">
                  {(user?.role || "USER").toUpperCase()}
                </span>
                <small>Control Panel</small>
              </div>
            </div>
          </div>
          <ul className="nav-menu">
            <li
              className={isActive("/") ? "active" : ""}
              onClick={() => navigate("/")}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </li>
            {isAdmin() && (
              <>
                <li
                  className={isActive("/admin/patients") ? "active" : ""}
                  onClick={() => navigate("/admin/patients")}
                >
                  <span className="nav-icon">👥</span>
                  Patients
                </li>
                <li
                  className={isActive("/admin/departments") ? "active" : ""}
                  onClick={() => navigate("/admin/departments")}
                >
                  <span className="nav-icon">🏥</span>
                  Departments
                </li>
                <li
                  className={isActive("/admin/designation") ? "active" : ""}
                  onClick={() => navigate("/admin/designation")}
                >
                  <span className="nav-icon">📋</span>
                  Designation
                </li>
                <li
                  className={isActive("/admin/doctors") ? "active" : ""}
                  onClick={() => navigate("/admin/doctors")}
                >
                  <span className="nav-icon">👨‍⚕️</span>
                  Doctor List
                </li>
              </>
            )}
            {(isAdmin() || isStaff()) && (
              <li
                className={isActive("/schedule") ? "active" : ""}
                onClick={() => navigate("/schedule")}
              >
                <span className="nav-icon">📅</span>
                Doctor Schedule
              </li>
            )}
            {(isAdmin() || isStaff()) && (
              <li
                className={isActive("/availability") ? "active" : ""}
                onClick={() => navigate("/availability")}
              >
                <span className="nav-icon">🕐</span>
                Doctor Availability
              </li>
            )}
            {(isAdmin() || isStaff() || isDoctor()) && (
              <li
                className={isActive("/leave") ? "active" : ""}
                onClick={() => navigate("/leave")}
              >
                <span className="nav-icon">🏖️</span>
                Doctor Leave
              </li>
            )}
            {(isAdmin() || isStaff() || isDoctor()) && (
              <li
                className={isActive("/prescriptions") ? "active" : ""}
                onClick={() => navigate("/prescriptions")}
              >
                <span className="nav-icon">📝</span>
                Prescriptions
              </li>
            )}
            {isDoctor() && (
              <li
                className={isActive("/opd/list") ? "active" : ""}
                onClick={() => navigate("/opd/list")}
              >
                <span className="nav-icon">👥</span>
                My Patients
              </li>
            )}
            {isAdmin() || isReceptionist() ? (
              <>
                <li className={`nav-parent ${isOPDOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="nav-parent-toggle"
                    onClick={() => setIsOPDOpen((prev) => !prev)}
                  >
                    <span className="nav-icon">📝</span>
                    <span>OPD</span>
                    <span className="nav-caret">▾</span>
                  </button>
                  {isOPDOpen && (
                    <ul className="nav-submenu">
                      <li
                        className={
                          isActive("/opd/registration") ? "active" : ""
                        }
                        onClick={() => navigate("/opd/registration")}
                      >
                        OPD Registration
                      </li>
                      <li
                        className={isActive("/opd/list") ? "active" : ""}
                        onClick={() => navigate("/opd/list")}
                      >
                        OPD List
                      </li>
                      <li
                        className={isActive("/opd/today") ? "active" : ""}
                        onClick={() => navigate("/opd/today")}
                      >
                        Today's OPD
                      </li>
                    </ul>
                  )}
                </li>
                <li className={`nav-parent ${isIPDOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="nav-parent-toggle"
                    onClick={() => setIsIPDOpen((prev) => !prev)}
                  >
                    <span className="nav-icon">🏥</span>
                    <span>IPD</span>
                    <span className="nav-caret">▾</span>
                  </button>
                  {isIPDOpen && (
                    <ul className="nav-submenu">
                      <li
                        className={
                          isActive("/ipd/registration") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/registration")}
                      >
                        IPD Registration
                      </li>
                      <li
                        className={isActive("/ipd/list") ? "active" : ""}
                        onClick={() => navigate("/ipd/list")}
                      >
                        IPD List
                      </li>
                      <li
                        className={isActive("/ipd/today") ? "active" : ""}
                        onClick={() => navigate("/ipd/today")}
                      >
                        Today's IPD
                      </li>
                      <li
                        className={
                          isActive("/ipd/admission-form") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/admission-form")}
                      >
                        Admission Form
                      </li>
                      <li
                        className={
                          isActive("/ipd/admission-list") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/admission-list")}
                      >
                        Admission List
                      </li>
                      <li
                        className={
                          isActive("/ipd/bed-allocation") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/bed-allocation")}
                      >
                        Bed Allocation
                      </li>
                      <li
                        className={isActive("/ipd/bed-status") ? "active" : ""}
                        onClick={() => navigate("/ipd/bed-status")}
                      >
                        Bed Status
                      </li>
                      <li
                        className={
                          isActive("/ipd/doctor-visits") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/doctor-visits")}
                      >
                        Doctor Visits
                      </li>
                      <li
                        className={
                          isActive("/ipd/bill-details") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/bill-details")}
                      >
                        Bill Details
                      </li>
                      <li
                        className={
                          isActive("/ipd/generate-invoice") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/generate-invoice")}
                      >
                        Generate Invoice
                      </li>
                      <li
                        className={
                          isActive("/ipd/discharge-form") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/discharge-form")}
                      >
                        Discharge Form
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className={`nav-parent ${isOPDOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="nav-parent-toggle"
                    onClick={() => setIsOPDOpen((prev) => !prev)}
                  >
                    <span className="nav-icon">📝</span>
                    <span>OPD</span>
                    <span className="nav-caret">▾</span>
                  </button>
                  {isOPDOpen && (
                    <ul className="nav-submenu">
                      <li
                        className={
                          isActive("/opd/registration") ? "active" : ""
                        }
                        onClick={() => navigate("/opd/registration")}
                      >
                        OPD Registration
                      </li>
                      <li
                        className={isActive("/opd/list") ? "active" : ""}
                        onClick={() => navigate("/opd/list")}
                      >
                        OPD List
                      </li>
                      <li
                        className={isActive("/opd/today") ? "active" : ""}
                        onClick={() => navigate("/opd/today")}
                      >
                        Today's OPD
                      </li>
                    </ul>
                  )}
                </li>
                <li className={`nav-parent ${isIPDOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="nav-parent-toggle"
                    onClick={() => setIsIPDOpen((prev) => !prev)}
                  >
                    <span className="nav-icon">🏥</span>
                    <span>IPD</span>
                    <span className="nav-caret">▾</span>
                  </button>
                  {isIPDOpen && (
                    <ul className="nav-submenu">
                      <li
                        className={
                          isActive("/ipd/registration") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/registration")}
                      >
                        IPD Registration
                      </li>
                      <li
                        className={isActive("/ipd/list") ? "active" : ""}
                        onClick={() => navigate("/ipd/list")}
                      >
                        IPD List
                      </li>
                      <li
                        className={isActive("/ipd/today") ? "active" : ""}
                        onClick={() => navigate("/ipd/today")}
                      >
                        Today's IPD
                      </li>
                      <li
                        className={
                          isActive("/ipd/admission-form") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/admission-form")}
                      >
                        Admission Form
                      </li>
                      <li
                        className={
                          isActive("/ipd/admission-list") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/admission-list")}
                      >
                        Admission List
                      </li>
                      <li
                        className={
                          isActive("/ipd/bed-allocation") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/bed-allocation")}
                      >
                        Bed Allocation
                      </li>
                      <li
                        className={isActive("/ipd/bed-status") ? "active" : ""}
                        onClick={() => navigate("/ipd/bed-status")}
                      >
                        Bed Status
                      </li>
                      <li
                        className={
                          isActive("/ipd/doctor-visits") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/doctor-visits")}
                      >
                        Doctor Visits
                      </li>
                      <li
                        className={
                          isActive("/ipd/bill-details") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/bill-details")}
                      >
                        Bill Details
                      </li>
                      <li
                        className={
                          isActive("/ipd/generate-invoice") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/generate-invoice")}
                      >
                        Generate Invoice
                      </li>
                      <li
                        className={
                          isActive("/ipd/discharge-form") ? "active" : ""
                        }
                        onClick={() => navigate("/ipd/discharge-form")}
                      >
                        Discharge Form
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
            {isAdmin() && (
              <li
                className={isActive("/admin/commission") ? "active" : ""}
                onClick={() => navigate("/admin/commission")}
              >
                <span className="nav-icon">💰</span>
                Doctor Commission
              </li>
            )}
            {isAdmin() && (
              <li
                className={isActive("/admin/roles") ? "active" : ""}
                onClick={() => navigate("/admin/roles")}
              >
                <span className="nav-icon">🔐</span>
                Role & Permissions
              </li>
            )}
            <li
              className={isActive("/profile") ? "active" : ""}
              onClick={() => navigate("/profile")}
            >
              <span className="nav-icon">👤</span>
              Profile
            </li>
            <li className="logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Logout
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  refreshKey={dashboardRefreshKey}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Profile
                  user={user}
                  onLogout={handleLogout}
                />
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "doctor", "receptionist"]}>
                  <Patients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/designation"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Designation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={["admin", "receptionist"]}>
                  <DoctorList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/availability"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorAvailability />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/commission"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorCommission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <RolePermissions />
                </ProtectedRoute>
              }
            />

            {/* Common Routes */}
            <Route
              path="/opd/registration"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <OPDForm
                    onOPDVisitSaved={handleOPDVisitSaved}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opd/list"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <OPDList
                    refreshKey={patientListRefreshKey}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opd/today"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <TodayOPD
                    refreshKey={patientListRefreshKey}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/registration"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <IPDForm
                    onIPDAdmissionSaved={handleIPDAdmissionSaved}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/list"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <IPDList
                    refreshKey={patientListRefreshKey}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/today"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <TodayIPD
                    refreshKey={patientListRefreshKey}
                  />
                </ProtectedRoute>
              }
            />

            {/* IPD Routes */}
            <Route
              path="/ipd/admission-form"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <IPDAdmissionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/admission-list"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <IPDAdmissionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/bed-allocation"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <BedAllocation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/bed-status"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <BedStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/doctor-visits"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <DoctorVisit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/add-vitals"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <AddVitals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/vitals-history"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <VitalsHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/bill-details"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <BillDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/generate-invoice"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <GenerateInvoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <BillingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/discharge-form"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <DischargeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ipd/discharge-summary"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <DischargeSummary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/schedule"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
                  <DoctorSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
                  <DoctorAvailability />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
                  <DoctorLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "doctor"]}>
                  <PrescriptionList />
                </ProtectedRoute>
              }
            />

            {/* Doctor Panel Route */}
            <Route
              path="/doctors"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <DoctorPanel />
                </ProtectedRoute>
              }
            />

            {/* Receptionist Route */}
            <Route
              path="/receptionist"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* ABDM/ABHA Routes */}
            <Route
              path="/abha-verification"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <ABHAVerification />
                </ProtectedRoute>
              }
            />

            {/* PMJAY Routes */}
            <Route
              path="/pmjay-verification"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "staff", "doctor", "receptionist"]}
                >
                  <PMJAYVerification />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route
          path="/*"
          element={user ? <AppLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
