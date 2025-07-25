// Role definitions and utilities

export const USER_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  FASHION_CREATOR: 'fashion_creator'
};

export const ROLE_LABELS = {
  [USER_ROLES.MEMBER]: 'Member',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MERCHANT]: 'Merchant',
  [USER_ROLES.FASHION_CREATOR]: 'Fashion Creator',
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.MEMBER]: 'Regular community member with basic access',
  [USER_ROLES.ADMIN]: 'Full administrative access to all features',
  [USER_ROLES.MERCHANT]: 'Access to merchant dashboard and product management',
  [USER_ROLES.FASHION_CREATOR]: 'Professional tailor, designer, or fashion creator with specialized skills',
};

export const ROLE_COLORS = {
  [USER_ROLES.MEMBER]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800',
  [USER_ROLES.MERCHANT]: 'bg-green-100 text-green-800',
  [USER_ROLES.FASHION_CREATOR]: 'bg-purple-100 text-purple-800',
};

export const ROLE_ICONS = {
  [USER_ROLES.MEMBER]: '👤',
  [USER_ROLES.ADMIN]: '⚡',
  [USER_ROLES.MERCHANT]: '🏪',
  [USER_ROLES.FASHION_CREATOR]: '✂️',
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

// Check if user has merchant privileges
export const isMerchant = (user) => {
  return user?.role === USER_ROLES.MERCHANT;
};

// Check if user has fashion creator privileges
export const isFashionCreator = (user) => {
  return user?.role === USER_ROLES.FASHION_CREATOR;
};

// Fashion Creator skill definitions
export const FASHION_CREATOR_SKILLS = {
  ALTERATIONS: 'alterations',
  CUSTOM_TAILORING: 'custom-tailoring',
  PATTERN_MAKING: 'pattern-making',
  FASHION_DESIGN: 'fashion-design',
  EMBELLISHMENT: 'embellishment',
  UPCYCLING: 'upcycling'
};

export const SKILL_LABELS = {
  [FASHION_CREATOR_SKILLS.ALTERATIONS]: 'Alterations & Repairs',
  [FASHION_CREATOR_SKILLS.CUSTOM_TAILORING]: 'Custom Tailoring',
  [FASHION_CREATOR_SKILLS.PATTERN_MAKING]: 'Pattern Making',
  [FASHION_CREATOR_SKILLS.FASHION_DESIGN]: 'Fashion Design',
  [FASHION_CREATOR_SKILLS.EMBELLISHMENT]: 'Embellishment & Decoration',
  [FASHION_CREATOR_SKILLS.UPCYCLING]: 'Upcycling & Reconstruction'
};

export const SKILL_DESCRIPTIONS = {
  [FASHION_CREATOR_SKILLS.ALTERATIONS]: 'Hemming, resizing, repairs, and basic modifications',
  [FASHION_CREATOR_SKILLS.CUSTOM_TAILORING]: 'Made-to-measure garments from existing patterns',
  [FASHION_CREATOR_SKILLS.PATTERN_MAKING]: 'Creating original patterns and technical designs',
  [FASHION_CREATOR_SKILLS.FASHION_DESIGN]: 'Original fashion concepts and creative design',
  [FASHION_CREATOR_SKILLS.EMBELLISHMENT]: 'Beading, embroidery, and decorative techniques',
  [FASHION_CREATOR_SKILLS.UPCYCLING]: 'Transforming and reconstructing existing garments'
};

export const SKILL_COLORS = {
  [FASHION_CREATOR_SKILLS.ALTERATIONS]: 'bg-blue-100 text-blue-800',
  [FASHION_CREATOR_SKILLS.CUSTOM_TAILORING]: 'bg-green-100 text-green-800',
  [FASHION_CREATOR_SKILLS.PATTERN_MAKING]: 'bg-yellow-100 text-yellow-800',
  [FASHION_CREATOR_SKILLS.FASHION_DESIGN]: 'bg-purple-100 text-purple-800',
  [FASHION_CREATOR_SKILLS.EMBELLISHMENT]: 'bg-pink-100 text-pink-800',
  [FASHION_CREATOR_SKILLS.UPCYCLING]: 'bg-emerald-100 text-emerald-800'
};

// Get skill display label
export const getSkillLabel = (skill) => {
  return SKILL_LABELS[skill] || skill;
};

// Get skill description
export const getSkillDescription = (skill) => {
  return SKILL_DESCRIPTIONS[skill] || '';
};

// Get skill color
export const getSkillColor = (skill) => {
  return SKILL_COLORS[skill] || 'bg-gray-100 text-gray-800';
};

// Get all available skills for selection
export const getAvailableSkills = () => {
  return Object.values(FASHION_CREATOR_SKILLS).map(skill => ({
    value: skill,
    label: getSkillLabel(skill),
    description: getSkillDescription(skill),
    color: getSkillColor(skill)
  }));
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
