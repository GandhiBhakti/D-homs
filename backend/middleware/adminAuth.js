const SystemSettings = require('../models/SystemSettings');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if setting is editable by admin
const isAdminEditable = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  // For settings, check if it's editable by admin
  if (req.params.key) {
    try {
      const setting = await SystemSettings.findByKey(req.params.key);
      if (setting && !setting.is_editable_by_admin) {
        return res.status(403).json({ error: 'This setting cannot be modified.' });
      }
    } catch (error) {
      // If setting doesn't exist, allow creation
    }
  }
  
  next();
};

module.exports = { isAdmin, isAdminEditable };
