// Role definitions and utilities

export const USER_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin', 
  MERCHANT: 'merchant',
  FASHION_DESIGNER: 'fashion-designer',
  TAILOR: 'tailor'
};

export const ROLE_LABELS = {
  [USER_ROLES.MEMBER]: 'Member',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MERCHANT]: 'Merchant',
  [USER_ROLES.FASHION_DESIGNER]: 'Fashion Designer',
  [USER_ROLES.TAILOR]: 'Tailor'
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.MEMBER]: 'Regular community member with basic access',
  [USER_ROLES.ADMIN]: 'Full administrative access to all features',
  [USER_ROLES.MERCHANT]: 'Can sell products and manage inventory',
  [USER_ROLES.FASHION_DESIGNER]: 'Professional fashion designer showcasing work',
  [USER_ROLES.TAILOR]: 'Tailoring services and custom clothing'
};

export const ROLE_COLORS = {
  [USER_ROLES.MEMBER]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800',
  [USER_ROLES.MERCHANT]: 'bg-green-100 text-green-800',
  [USER_ROLES.FASHION_DESIGNER]: 'bg-purple-100 text-purple-800',
  [USER_ROLES.TAILOR]: 'bg-orange-100 text-orange-800'
};

export const ROLE_ICONS = {
  [USER_ROLES.MEMBER]: '👤',
  [USER_ROLES.ADMIN]: '⚡',
  [USER_ROLES.MERCHANT]: '🛍️',
  [USER_ROLES.FASHION_DESIGNER]: '✨',
  [USER_ROLES.TAILOR]: '✂️'
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

// Check if user can sell products
export const canSellProducts = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MERCHANT].includes(user?.role);
};

// Check if user is a design professional
export const isDesignProfessional = (user) => {
  return [USER_ROLES.FASHION_DESIGNER, USER_ROLES.TAILOR].includes(user?.role);
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
