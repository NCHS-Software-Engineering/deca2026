import { Navigate } from "react-router-dom";

const ProtectedRouteEdit = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "hnallman@stu.naperville203.org";
  const isTeacher = user?.privileges === "teacher_override";

  return (isAdmin || isTeacher) ? children : <Navigate to="/" replace />;
};

export default ProtectedRouteEdit;
