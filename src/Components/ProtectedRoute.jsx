import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = ({ children, path }) => {
  const { user } = useAuth();

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
    "raw material": "/raw-material",
    "part name": "/part-name",
    "compound name": "/compound-name",
    "quality check": "/quality-check",
    "bom": "/production/bom",
    "production": "/production/start",
    "qc history": "/qc-history",

  };


  // console.log("requiredPermission", permissions) 
  if (permissions.length > 0 || permissions.includes(routePermissions[permissions[0]])) {
    return children;
  }

  return <Navigate to="/" replace />;
};


export default ProtectedRoute;