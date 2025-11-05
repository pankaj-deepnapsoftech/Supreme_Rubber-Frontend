import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./Context/authcontext.jsx";
import { ToastContainer } from "react-toastify";
import { UserRoleProvider } from "./Context/UserRoleContext.jsx";
import { InventoryProvider } from "./Context/InventoryContext.jsx";
import { SupplierProvider } from "./Context/SuplierContext.jsx";
import { PurchanseOrderProvider } from "./Context/PurchaseOrderContext.jsx";
import { GatemenContextProvider } from "./Context/GatemenContext.jsx";
import { BomProvider } from "./Context/BomContext.jsx";
import { ProductionProvider } from "./Context/ProductionContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastContainer />
    
    <AuthProvider>
      <UserRoleProvider>
        <BomProvider>
          <ProductionProvider>
        <InventoryProvider>
          <SupplierProvider>
            <PurchanseOrderProvider>
              <GatemenContextProvider>
                
                <App />
              </GatemenContextProvider>
            </PurchanseOrderProvider>
          </SupplierProvider>
        </InventoryProvider>
        </ProductionProvider>
        </BomProvider>
      </UserRoleProvider>
    </AuthProvider>
  </React.StrictMode>
);
