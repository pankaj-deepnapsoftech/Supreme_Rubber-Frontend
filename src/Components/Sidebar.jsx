import { Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  Shield,
  Key,
  Package,
  CheckSquare,
  Factory,
  Layers,
  PlayCircle,
  ChevronDown,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const handleToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  const allMenu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Supplier", path: "/supplier", icon: <Users size={20} /> },
    { name: "Employee", path: "/employee", icon: <User size={20} /> },
    { name: "User Role", path: "/user-role", icon: <Shield size={20} /> },
    { name: "Purchase Order", path: "/purchase-order", icon: <ShoppingBag size={20} /> },
    { name: "Gateman", path: "/gateman", icon: <Key size={20} /> },
    { name: "Inventory", path: "/inventory", icon: <Package size={20} /> },
    {
      name: "Quality Check",
      path: "/quality-check",
      icon: <CheckSquare size={20} />,
    },
    {
      name: "Production",
      icon: <Factory size={20} />,
      submenus: [
        { name: "BOM", path: "/production/bom", icon: <Layers size={18} /> },
        {
          name: "Production Start",
          path: "/production/start",
          icon: <PlayCircle size={18} />,
        },
      ],
    },
  ];

  // console.log("halooo", allMenu)

  const userPermissions = user?.isSuper
    ? allMenu.map((m) => m.name.toLowerCase())
    : user?.role?.permissions?.map((p) => p.toLowerCase()) || [];




  const allowedMenu = user?.isSuper
    ? allMenu
    : allMenu.filter((menu) => {
      const menuName = menu.name.toLowerCase();

      if (menu.submenus) {

        const allowedSubs = menu.submenus.filter((sub) =>
          userPermissions.includes(sub.name.toLowerCase())
        );

        if (allowedSubs.length > 0) menu.submenus = allowedSubs;
        return allowedSubs.length > 0;
      }
      console.log("Menu", userPermissions.includes(menuName))
      return userPermissions.includes(menuName);
    });

   const routes = useMemo(() => {
    return allowedMenu.map((menu) => menu.path);
   }, [allowedMenu])

  useEffect(() => {
    if (!routes.includes(window.location.pathname)) {
      navigate(allowedMenu[0].path)
    }
  }, [window.location.pathname])

  return (
    <>
      {/* Mobile hamburger button - hidden when drawer is open */}
      {!isMobileOpen && (
        <button
          onClick={openMobile}
          aria-label="Open menu"
          className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md bg-white shadow text-gray-700"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg p-4 border-r border-gray-200 flex-col justify-between h-screen">
      {/* --- Top section (Logo + menu) --- */}
      <div>
        <div className="flex justify-center ">
          <img src="/CompanyLogo.png" alt="Company Logo" className="h-16" />
        </div>

        <nav className="flex flex-col gap-1">
          {allowedMenu.map((item) => (
            <div key={item.name}>
              {!item.submenus ? (
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2 rounded-lg transition ${isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => handleToggle(item.name)}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition ${openDropdown === item.name
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${openDropdown === item.name ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {openDropdown === item.name && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {item.submenus.map((sub) => (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          end
                          className={({ isActive }) =>
                            `flex items-center gap-2 p-2 rounded-md text-sm transition ${isActive
                              ? "bg-purple-100 text-purple-700"
                              : "text-gray-600 hover:bg-gray-50"
                            }`
                          }
                        >
                          {sub.icon}
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>


      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
      </aside>

      {/* Mobile drawer + backdrop */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeMobile}
            aria-hidden
          />
          

        <aside className="relative w-64 bg-white shadow-lg p-4 border-r border-gray-200 flex flex-col justify-between h-full transform transition-transform">
          <div>
            
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img
                src="/CompanyLogo.png"
                alt="Company Logo"
                className="h-12"
              />
            </div>
            <button
            onClick={closeMobile}
            aria-label="Close menu"
            className="inline-flex items-center justify-center p-2 rounded-md bg-gray-100 text-gray-700"
          >
            <X size={18} />
          </button>
                    
          </div>


              <nav className="flex flex-col gap-1">
                {allowedMenu.map((item) => (
                  <div key={item.name}>
                    {!item.submenus ? (
                      <NavLink
                        to={item.path}
                        end
                        onClick={closeMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-2 rounded-lg transition ${isActive
                            ? "bg-purple-100 text-purple-700"
                            : "text-gray-700 hover:bg-gray-100"
                          }`
                        }
                      >
                        {item.icon}
                        {item.name}
                      </NavLink>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggle(item.name)}
                          className={`flex items-center justify-between w-full p-2 rounded-lg transition ${openDropdown === item.name
                              ? "bg-purple-100 text-purple-700"
                              : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            {item.name}
                          </div>
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${openDropdown === item.name ? "rotate-180" : ""}`}
                          />
                        </button>

                        {openDropdown === item.name && (
                          <div className="ml-8 mt-1 flex flex-col gap-1">
                            {item.submenus.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                end
                                onClick={closeMobile}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 p-2 rounded-md text-sm transition ${isActive
                                    ? "bg-purple-100 text-purple-700"
                                    : "text-gray-600 hover:bg-gray-50"
                                  }`
                                }
                              >
                                {sub.icon}
                                {sub.name}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  closeMobile();
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}


    </>
  );
};

export default Sidebar;
