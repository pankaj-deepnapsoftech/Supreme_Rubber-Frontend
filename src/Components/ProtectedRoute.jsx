import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = path || location.pathname;
  
  // console.log("children",children)

  if (!user) return <Navigate to="/login" replace />;

  if (user?.isSuper) return children; 

  const permissions = user?.role?.permissions?.map((p) => p.toLowerCase()) || [];

  const routePermissions = {
    "dashboard": "/",
    "supplier": "/supplier",
    "employee": "/employee",
    "user role": "/user-role",
    "gateman": "/gateman",
    "inventory": "/inventory",
    "quality check": "/quality-check",
    "qc history": "/qc-history",
    "bom": "/production/bom",
    "production": "/production/start",
    "production start": "/production/start",
    "purchase order": "/purchase-order"
  };

  // Find the permission key that matches the current path
  const permissionKey = Object.keys(routePermissions).find(
    (key) => routePermissions[key] === currentPath
  );

  // Check if user has the required permission
  if (permissionKey && permissions.includes(permissionKey)) {
    return children;
  }

  // If path is not in routePermissions, allow access (for routes that don't need specific permissions)
  if (!permissionKey) {
    return children;
  }

  return <Navigate to="/" replace />;
};


export default ProtectedRoute;
