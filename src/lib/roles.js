// Role definitions and utilities

export const USER_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [USER_ROLES.MEMBER]: 'Member',
  [USER_ROLES.ADMIN]: 'Admin',
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.MEMBER]: 'Regular community member with basic access',
  [USER_ROLES.ADMIN]: 'Full administrative access to all features',
};

export const ROLE_COLORS = {
  [USER_ROLES.MEMBER]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800',
};

export const ROLE_ICONS = {
  [USER_ROLES.MEMBER]: '👤',
  [USER_ROLES.ADMIN]: '⚡',
};

// Get role display label
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || 'Member';
};

// Get role description
export const getRoleDescription = (role) => {
  return ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS[USER_ROLES.MEMBER];
};

// Get role styling classes
export const getRoleColor = (role) => {
  return ROLE_COLORS[role] || ROLE_COLORS[USER_ROLES.MEMBER];
};

// Get role icon
export const getRoleIcon = (role) => {
  return ROLE_ICONS[role] || ROLE_ICONS[USER_ROLES.MEMBER];
};

// Check if user has admin privileges
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN;
};



// Get all available roles for selection
export const getAvailableRoles = () => {
  return Object.values(USER_ROLES).map(role => ({
    value: role,
    label: getRoleLabel(role),
    description: getRoleDescription(role),
    icon: getRoleIcon(role)
  }));
};

// Validate role
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};
