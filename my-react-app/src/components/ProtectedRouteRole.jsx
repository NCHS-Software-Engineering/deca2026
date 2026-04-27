import { Navigate } from "react-router-dom";
import { getCurrentUser, hasPermissionLevel, ROLES } from "../utils/roleUtils";

/**
 * ProtectedRouteRole component - Restricts access based on user role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {string} props.requiredRole - Minimum role required (sponsor, teacher, or student)
 * @param {React.ReactNode} props.fallback - Content to show if not authorized (defaults to home page)
 */
const ProtectedRouteRole = ({ children, requiredRole = ROLES.STUDENT, fallback = null }) => {
  const user = getCurrentUser();
  const isUnlocked = sessionStorage.getItem("deca_unlocked") === "true";
  
  // Check if user is authenticated and unlocked
  if (!isUnlocked || !user) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has required role/permission level
  if (!hasPermissionLevel(requiredRole)) {
    // Show fallback content if provided, otherwise redirect to home
    return fallback ? fallback : <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRouteRole;
