import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
import "./Auth.css";

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile(user);
  }, [user]);

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to change password");
      setMessage(data.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="profile-card">
        <h3>Profile</h3>
        <div className="profile-grid">
          <div className="row">
            <strong>Username</strong>
            <span>{profile?.username || "-"}</span>
          </div>
          <div className="row">
            <strong>Email</strong>
            <span>{profile?.email || "-"}</span>
          </div>
          <div className="row">
            <strong>Role</strong>
            <span>{profile?.role || "-"}</span>
          </div>
          <div className="row">
            <strong>Status</strong>
            <span>{profile?.is_active ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3>Change Password</h3>
        {error ? <div className="auth-error">{error}</div> : null}
        {message ? <div className="auth-success">{message}</div> : null}
        <form className="auth-form" onSubmit={changePassword}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>
        <div className="auth-link" onClick={onLogout}>
          Logout
        </div>
      </div>
    </div>
  );
}

export default Profile;
