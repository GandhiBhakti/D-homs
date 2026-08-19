import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
import "./Auth.css";

function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/roles`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
        fetch(`${API_BASE_URL}/auth/permissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
      ]);
      setRoles(await rolesRes.json());
      setPermissions(await permsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (name) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(name)
        ? prev.permissions.filter((item) => item !== name)
        : [...prev.permissions, name],
    }));
  };

  const saveRole = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/auth/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage("Role created successfully");
      setForm({ name: "", description: "", permissions: [] });
      fetchData();
    } else {
      setMessage(data.error || "Failed to create role");
    }
  };

  return (
    <div>
      <div className="profile-card">
        <h3>Role Management</h3>
        <form className="auth-form" onSubmit={saveRole}>
          <input
            name="name"
            placeholder="Role Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <div>
            {permissions.map((permission) => (
              <label
                key={permission.id}
                style={{ display: "block", marginBottom: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={form.permissions.includes(permission.name)}
                  onChange={() => handlePermissionToggle(permission.name)}
                />{" "}
                {permission.name}
              </label>
            ))}
          </div>
          <button type="submit">Create Role</button>
        </form>
        {message ? <div className="auth-success">{message}</div> : null}
      </div>

      <div className="settings-card">
        <h3>Existing Roles</h3>
        <div className="profile-grid">
          {roles.map((role) => (
            <div key={role.id} className="row">
              <strong>{role.name}</strong>
              <span>{role.description || "-"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RolePermissions;
