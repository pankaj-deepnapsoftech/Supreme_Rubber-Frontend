import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleAccess = {
  Admin: [
    "/",
    "/supplier",
    "/employee",
    "/user-role",
    "/gateman",
    "/inventory",
    "/quality-check",
    "/production/bom",
    "/production/start",
  ],
  Employee: ["/", "/inventory", "/production/bom", "/production/start"],
  Gateman: ["/", "/gateman"],
  QC: ["/", "/quality-check"],
  Inventroy: ["/", "/inventory"] 
};
const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.isSuper) return children;

  const permissions = user?.role?.permissions?.map((p) => p.toLowerCase()) || [];

  const routePermissions = {
    "/": "dashboard",
    "/supplier": "supplier",
    "/employee": "employee",
    "/user-role": "user role",
    "/gateman": "gateman",
    "/inventory": "inventory",
    "/quality-check": "quality check",
    "/production/bom": "bom",
    "/production/start": "production",
  };

  // find which permission this route needs
  const requiredPermission = Object.entries(routePermissions).find(([route]) =>
    path.startsWith(route)
  )?.[1];

  if (!requiredPermission || permissions.includes(requiredPermission)) {
    return children;
  }

  return <Navigate to="/" replace />;
};


export default ProtectedRoute;
