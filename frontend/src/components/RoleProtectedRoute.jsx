import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));


  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
