import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isUnlocked = sessionStorage.getItem("deca_unlocked") === "true";
  return isUnlocked  ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
