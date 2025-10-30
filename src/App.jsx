import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Supplier from "./pages/Supplier";
import Employee from "./pages/Employee";
import UserRole from "./pages/UserRole";
import Gateman from "./pages/Gateman";
import Inventory from "./pages/Inventory";
import QualityCheck from "./pages/QualityCheck";
import ProtectedRoute from "./Components/ProtectedRoute";
import Production from "./Pages/Production";
import Production_Start from "./Pages/Production_Start";
import BOM from "./Pages/BOM";
import Login from "./Pages/LoginPage";
import Register from "./Pages/RegisterPage";
import ForgotPassword from "./Pages/ForgotPasswordPage";
import OTPVerification from "./Pages/OTPVerificationPage";
import VerifyEmail from "./Pages/verifyEmail";

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/verify-email" element={<VerifyEmail  />} />
        <Route
          path="/"
          element={
            <ProtectedRoute path="/">
              <MainLayout />
            </ProtectedRoute>
          }
        >

          <Route
            index
            element={
              <ProtectedRoute path="/">
                <Dashboard />
              </ProtectedRoute>
            }
          />


          <Route
            path="supplier"
            element={
              <ProtectedRoute path="/supplier">
                <Supplier />
              </ProtectedRoute>
            }
          />


          <Route
            path="employee"
            element={
              <ProtectedRoute path="/employee">
                <Employee />
              </ProtectedRoute>
            }
          />


          <Route
            path="user-role"
            element={
              <ProtectedRoute path="/user-role">
                <UserRole />
              </ProtectedRoute>
            }
          />


          <Route
            path="gateman"
            element={
              <ProtectedRoute path="/gateman">
                <Gateman />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <ProtectedRoute path="/inventory">
                <Inventory />
              </ProtectedRoute>
            }
          />


          <Route
            path="quality-check"
            element={
              <ProtectedRoute path="/quality-check">
                <QualityCheck />
              </ProtectedRoute>
            }
          />


          <Route
            path="production"
            element={
              <ProtectedRoute path="/production">
                <Production />
              </ProtectedRoute>
            }
          >

            <Route index element={<Navigate to="/production/bom" replace />} />


            <Route
              path="bom"
              element={
                <ProtectedRoute path="/production/bom">
                  <BOM />
                </ProtectedRoute>
              }
            />


            <Route
              path="start"
              element={
                <ProtectedRoute path="/production/start">
                  <Production_Start />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
