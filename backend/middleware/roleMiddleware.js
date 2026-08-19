const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: "Access denied",
      message: "Admin access required"
    });
  }

  next();
};

const isDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: "Access denied",
      message: "Doctor access required"
    });
  }

  next();
};

const isDoctorOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'doctor') {
    return next();
  }

  return res.status(403).json({ 
    error: "Access denied",
    message: "You do not have permission to access this resource"
  });
};

module.exports = {
  roleMiddleware,
  isAdmin,
  isDoctor,
  isDoctorOrSelf
};
