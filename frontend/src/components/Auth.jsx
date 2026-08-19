import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API_BASE_URL from "../config/api";
import "./Auth.css";

const API_BASES = [API_BASE_URL].filter(Boolean);

const ROLE_PASSWORDS = {
  admin: "admin123",
  doctor: "doctor123", 
  staff: "staff123",
  receptionist: "reception123",
  nurse: "nurse123",
  lab: "lab123",
  pharmacy: "pharmacy123",
  billing: "billing123"
};

function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    email: "",
    first_name: "",
    last_name: "",
    token: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("accessToken");
    if (saved) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, password: ROLE_PASSWORDS[role] || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const endpointPath =
        mode === "signup"
          ? "/auth/signup"
          : mode === "login"
            ? "/auth/login"
            : mode === "forgot"
              ? "/auth/forgot-password"
              : "/auth/reset-password";

      const payload =
        mode === "signup"
          ? {
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
              first_name: formData.first_name,
              last_name: formData.last_name,
            }
          : mode === "login"
            ? {
                email: formData.email,
                username: formData.email,
                password: formData.password,
              }
            : mode === "forgot"
              ? { email: formData.email }
              : { token: formData.token, password: formData.password };

      let lastError = null;
      for (const base of API_BASES) {
        try {
          const response = await fetch(`${base}${endpointPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(
              data.error || `Request failed (${response.status})`,
            );

          if (mode === "login" || mode === "signup") {
            login(data.user, data.accessToken, data.refreshToken);
            // Redirect based on user role
            setTimeout(() => {
              if (data.user?.role === "doctor") {
                navigate("/doctors");
              } else if (data.user?.role === "receptionist") {
                navigate("/receptionist");
              } else {
                navigate("/");
              }
            }, 100);
            return;
          }

          if (mode === "forgot") {
            setMessage(data.message || "Reset instructions sent");
            setMode("reset");
            return;
          }

          setMessage(data.message || "Password reset successful");
          setMode("login");
          return;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error("Unable to reach authentication server");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box auth-split">
        <div className="auth-image">
          <img src="/hospital.png" alt="Hospital" />
        </div>

        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-title-wrapper">
              <img src="/logo.png" alt="Logo" className="auth-logo" />
              <h1 className="auth-title">Divine Hospital</h1>
            </div>
            <p className="auth-subtitle">
              {mode === "login" ? "Sign in to your account" : 
               mode === "signup" ? "Create a new account" :
               mode === "forgot" ? "Reset your password" : "Enter new password"}
            </p>
          </div>

          <div className="auth-body">
            {mode === "login" && (
              <div className="role-sidebar">
                <label className="form-label">Select Role</label>
                <div className="role-buttons-vertical">
                  {Object.keys(ROLE_PASSWORDS).map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`role-btn ${selectedRole === role ? 'active' : ''}`}
                      onClick={() => handleRoleChange(role)}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="auth-form-section">
              {error ? <div className="auth-error">{error}</div> : null}
              {message ? <div className="auth-success">{message}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "login" ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <small className="password-hint">Default password for {selectedRole}: {ROLE_PASSWORDS[selectedRole]}</small>
                </div>
              </>
            ) : null}

          {mode === "signup" ? (
            <>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : null}

          {mode === "forgot" ? (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          ) : null}

          {mode === "reset" ? (
            <>
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  name="token"
                  placeholder="Enter the reset token"
                  value={formData.token}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : null}

          <button type="submit" className="auth-submit-btn">
            {mode === "signup"
              ? "Create Account"
              : mode === "login"
                ? "Sign In"
                : mode === "forgot"
                  ? "Send Reset Link"
                  : "Reset Password"}
          </button>
        </form>

        <div className="auth-actions">
          {mode === "login" && (
            <>
              <div className="auth-link" onClick={() => setMode("signup")}>
                Create an account
              </div>
              <div className="auth-link" onClick={() => setMode("forgot")}>
                Forgot Password?
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="auth-link" onClick={() => setMode("login")}>
              Already have an account? Login
            </div>
          )}

          {mode === "forgot" && (
            <div className="auth-link" onClick={() => setMode("login")}>
              Back to login
            </div>
          )}

          {mode === "reset" && (
            <div className="auth-link" onClick={() => setMode("login")}>
              Back to login
            </div>
          )}
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
