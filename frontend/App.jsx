import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Departments from "./components/Departments";
import Designation from "./components/Designation";
import DoctorList from "./components/DoctorList";
import DoctorSchedule from "./components/DoctorSchedule";
import DoctorAvailability from "./components/DoctorAvailability";
import DoctorLeave from "./components/DoctorLeave";
import DoctorCommission from "./components/DoctorCommission";
import OPDList from "./components/OPDList";
import OPDForm from "./components/OPDForm";
import IPDList from "./components/IPDList";
import IPDForm from "./components/IPDForm";
import BillingList from "./components/BillingList";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "users":
        return <Users />;
      case "departments":
        return <Departments />;
      case "designation":
        return <Designation />;
      case "doctors":
        return <DoctorList />;
      case "schedule":
        return <DoctorSchedule />;
      case "availability":
        return <DoctorAvailability />;
      case "leave":
        return <DoctorLeave />;
      case "commission":
        return <DoctorCommission />;
      case "opd-list":
        return <OPDList />;
      case "opd-form":
        return <OPDForm onOPDVisitSaved={() => setActiveTab("opd-list")} />;
      case "ipd-list":
        return <IPDList />;
      case "ipd-form":
        return <IPDForm onIPDAdmissionSaved={() => setActiveTab("ipd-list")} />;
      case "billing":
        return <BillingList />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="Hospital Logo" className="logo-image" />
            <div className="logo-text">
              <h2>Divine Multi</h2>
              <p>Speciality Hospital</p>
            </div>
          </div>
          <ul className="nav-menu">
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </li>
            <li
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              Users
            </li>
            <li
              className={activeTab === "departments" ? "active" : ""}
              onClick={() => setActiveTab("departments")}
            >
              Departments
            </li>
            <li
              className={activeTab === "designation" ? "active" : ""}
              onClick={() => setActiveTab("designation")}
            >
              Designation
            </li>
            <li
              className={activeTab === "doctors" ? "active" : ""}
              onClick={() => setActiveTab("doctors")}
            >
              Doctor List
            </li>
            <li
              className={activeTab === "schedule" ? "active" : ""}
              onClick={() => setActiveTab("schedule")}
            >
              Doctor Schedule
            </li>
            <li
              className={activeTab === "availability" ? "active" : ""}
              onClick={() => setActiveTab("availability")}
            >
              Doctor Availability
            </li>
            <li
              className={activeTab === "leave" ? "active" : ""}
              onClick={() => setActiveTab("leave")}
            >
              Doctor Leave
            </li>
            <li
              className={activeTab === "commission" ? "active" : ""}
              onClick={() => setActiveTab("commission")}
            >
              Doctor Commission
            </li>
            <li
              className={activeTab === "opd-list" ? "active" : ""}
              onClick={() => setActiveTab("opd-list")}
            >
              OPD List
            </li>
            <li
              className={activeTab === "opd-form" ? "active" : ""}
              onClick={() => setActiveTab("opd-form")}
            >
              OPD Registration
            </li>
            <li
              className={activeTab === "ipd-list" ? "active" : ""}
              onClick={() => setActiveTab("ipd-list")}
            >
              IPD List
            </li>
            <li
              className={activeTab === "ipd-form" ? "active" : ""}
              onClick={() => setActiveTab("ipd-form")}
            >
              IPD Admission
            </li>
            <li
              className={activeTab === "billing" ? "active" : ""}
              onClick={() => setActiveTab("billing")}
            >
              Billing
            </li>
          </ul>
        </nav>
        <main className="main-content">{renderComponent()}</main>
      </div>
    </div>
  );
}

export default App;
