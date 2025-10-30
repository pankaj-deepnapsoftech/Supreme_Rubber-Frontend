import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
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

  const allMenu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Supplier", path: "/supplier", icon: <Users size={20} /> },
    { name: "Employee", path: "/employee", icon: <User size={20} /> },
    { name: "User Role", path: "/user-role", icon: <Shield size={20} /> },
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

  // Role-based access
  // const roleAccess = {
  //   admin: allMenu.map((m) => m.name),
  //   employee: ["Dashboard", "Inventory", "Production"],
  //   gateman: ["Dashboard", "Gateman"],
  //   qc: ["Dashboard", "Quality Check"],
  //   inventory:[]
  // };
  const userPermissions = user?.isSuper
    ? allMenu.map((m) => m.name.toLowerCase())
    : user?.role?.permissions?.map((p) => p.toLowerCase()) || [];


  const allowedMenu = user?.isSuper
    ? allMenu
    : allMenu.filter((menu) => {
      const menuName = menu.name.toLowerCase();
      if (menu.submenus) {
        // Show main menu if at least one submenu is allowed
        const allowedSubs = menu.submenus.filter((sub) =>
          userPermissions.includes(sub.name.toLowerCase())
        );
        if (allowedSubs.length > 0) menu.submenus = allowedSubs;
        return allowedSubs.length > 0;
      }
      return userPermissions.includes(menuName);
    });





  return (
    <aside className="w-64 bg-white shadow-lg p-4 border-r border-gray-200 flex flex-col justify-between h-screen">
      {/* --- Top section (Logo + menu) --- */}
      <div>
        <div className="flex justify-center mb-6">
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
  );
};

export default Sidebar;
