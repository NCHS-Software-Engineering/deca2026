// Utility functions for role-based access control

/**
 * User roles hierarchy:
 * - sponsor: Full access to all features and restricted content
 * - teacher: Administrative access (can manage students)
 * - student: Basic access (regular member)
 */

export const ROLES = {
  SPONSOR: 'sponsor',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

/**
 * Get the current user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

/**
 * Check if user is a sponsor
 * @returns {boolean} True if user is a sponsor
 */
export const isSponsor = () => {
  return hasRole(ROLES.SPONSOR);
};

/**
 * Check if user is a teacher
 * @returns {boolean} True if user is a teacher
 */
export const isTeacher = () => {
  return hasRole(ROLES.TEACHER);
};

/**
 * Check if user is a student
 * @returns {boolean} True if user is a student
 */
export const isStudent = () => {
  return hasRole(ROLES.STUDENT);
};

/**
 * Check if user has permission level (hierarchy: sponsor > teacher > student)
 * @param {string} requiredRole - Minimum role required
 * @returns {boolean} True if user meets or exceeds the role
 */
export const hasPermissionLevel = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;

  const roleHierarchy = {
    [ROLES.SPONSOR]: 3,
    [ROLES.TEACHER]: 2,
    [ROLES.STUDENT]: 1
  };

  return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
};

/**
 * Get role display name
 * @param {string} role - Role code
 * @returns {string} Human-readable role name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.SPONSOR]: 'Sponsor',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.STUDENT]: 'Student'
  };
  return roleNames[role] || 'User';
};

/**
 * Get role-based features/permissions
 * @param {string} role - Role code
 * @returns {Object} Features available for this role
 */
export const getRoleFeatures = (role) => {
  const features = {
    [ROLES.SPONSOR]: {
      name: 'Sponsor Account',
      canViewRestrictedContent: true,
      canAccessAnalytics: true,
      canManageUsers: true,
      canEditPIs: true,
      canViewTeacherDashboard: true,
      canExportData: true,
      icon: '👑'
    },
    [ROLES.TEACHER]: {
      name: 'Teacher Account',
      canViewRestrictedContent: false,
      canAccessAnalytics: true,
      canManageUsers: true,
      canEditPIs: true,
      canViewTeacherDashboard: true,
      canExportData: false,
      icon: '📚'
    },
    [ROLES.STUDENT]: {
      name: 'Student Account',
      canViewRestrictedContent: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canEditPIs: false,
      canViewTeacherDashboard: false,
      canExportData: false,
      icon: '👤'
    }
  };
  return features[role] || features[ROLES.STUDENT];
};

/**
 * Check if feature is available for current user
 * @param {string} featureName - Feature to check
 * @returns {boolean} True if feature is available
 */
export const hasFeature = (featureName) => {
  const user = getCurrentUser();
  if (!user) return false;

  const features = getRoleFeatures(user.role);
  return features[featureName] || false;
};

/**
 * Get all role-based features for a specific feature type
 * @param {string} featureName - Feature key to check
 * @returns {Array} Array of roles that have this feature
 */
export const rolesWithFeature = (featureName) => {
  return Object.entries(ROLES).filter(([, role]) => {
    return getRoleFeatures(role)[featureName];
  });
};
