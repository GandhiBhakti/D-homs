const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../config/database");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_EXPIRES_IN_DAYS = parseInt(
  process.env.REFRESH_EXPIRES_IN_DAYS || "7",
  10,
);

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required');
}

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
const signRefreshToken = (user) =>
  jwt.sign({ id: user.id, type: "refresh" }, JWT_SECRET, {
    expiresIn: `${REFRESH_EXPIRES_IN_DAYS}d`,
  });

const validatePassword = async (submittedPassword, storedPassword) => {
  if (!storedPassword) return false;
  try {
    const isHashMatch = await bcrypt.compare(submittedPassword, storedPassword);
    if (isHashMatch) return true;
  } catch (error) {
    // Fall back to legacy plaintext support.
  }
  return submittedPassword === storedPassword;
};

const createSession = async (userId, refreshToken, ipAddress, userAgent) => {
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );
  await db.execute(
    "INSERT INTO user_sessions (user_id, refresh_token, expires_at, ip_address, user_agent, is_active) VALUES (?, ?, ?, ?, ?, ?)",
    [
      userId,
      refreshToken,
      expiresAt,
      ipAddress || null,
      userAgent || null,
      true,
    ],
  );
};

const revokeSession = async (refreshToken) => {
  if (!refreshToken) return;
  await db.execute(
    "UPDATE user_sessions SET is_active = FALSE WHERE refresh_token = ?",
    [refreshToken],
  );
};

const logActivity = async (userId, action, details = {}) => {
  await db.execute(
    "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
    [
      userId,
      action,
      JSON.stringify(details),
      details.ipAddress || null,
      details.userAgent || null,
    ],
  );
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if ((!email && !username) || !password) {
      return res
        .status(400)
        .json({ error: "Username/email and password are required" });
    }

    // Try to find user by email first, then by username
    let user = null;
    if (email) {
      user = await User.findByEmail(email);
    }
    if (!user && username) {
      user = await User.findByUsername(username);
    }
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);
    await createSession(user.id, refreshToken, req.ip, req.get("user-agent"));
    await logActivity(user.id, "login", {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, first_name, last_name } =
      req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const user = await User.create({
      username: email.split("@")[0],
      email,
      password,
      first_name: first_name || "",
      last_name: last_name || "",
      role: "staff",
      phone: "",
      is_active: true,
    });

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);
    await createSession(user.id, refreshToken, req.ip, req.get("user-agent"));
    await logActivity(user.id, "signup", {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const [rows] = await db.execute(
      "SELECT * FROM user_sessions WHERE refresh_token = ? AND is_active = TRUE AND expires_at > NOW()",
      [refreshToken],
    );
    const session = rows[0];
    if (!session) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "User is not active" });
    }

    const accessToken = signToken(user);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await revokeSession(refreshToken);
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.execute(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
      [email, resetToken, expiresAt],
    );
    await logActivity(user.id, "forgot_password", { email });

    res.json({ message: "Password reset instructions sent", resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Reset token and new password are required" });
    }

    const [rows] = await db.execute(
      "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [token],
    );
    const resetEntry = rows[0];
    if (!resetEntry) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      resetEntry.email,
    ]);
    await db.execute("DELETE FROM password_resets WHERE token = ?", [token]);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.profile = async (req, res) => {
  res.json({ user: req.user });
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password are required" });
    }

    const isMatch = await validatePassword(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      req.user.id,
    ]);
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM roles ORDER BY id");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const [result] = await db.execute(
      "INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)",
      [name, description, JSON.stringify(permissions || [])],
    );
    res.status(201).json({
      id: result.insertId,
      name,
      description,
      permissions: permissions || [],
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM permissions ORDER BY id");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.execute(
      "INSERT INTO permissions (name, description) VALUES (?, ?)",
      [name, description],
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
