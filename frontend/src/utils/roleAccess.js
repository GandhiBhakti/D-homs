export const ROLE_ACCESS = {
  admin: ["admin", "doctor", "receptionist", "staff"],
  doctor: ["admin", "doctor", "staff"],
  receptionist: ["receptionist"],
  staff: ["admin", "doctor", "staff", "receptionist"],
};

export const canAccessRoute = (role, allowedRoles = []) => {
  if (!role || !allowedRoles.length) return false;
  if (role === "admin") return true;
  return allowedRoles.includes(role);
};

export const isReceptionistLimited = (role) => role === "receptionist";

export const getHomeRoute = (role) => {
  if (role === "receptionist") return "/opd/registration";
  if (role === "doctor") return "/doctors";
  return "/";
};
