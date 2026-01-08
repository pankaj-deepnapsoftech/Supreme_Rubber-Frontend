import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, X } from "lucide-react";
import { LuMessageSquareText } from "react-icons/lu";
import { useAuth } from "@/Context/AuthContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null);
  const { user } = useAuth();
  // Close menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const username = user?.first_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-gray-100 relative">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-gray-700 cursor-pointer">
          <img className="w-[15px] h-[13px] " src="/Vector.png" alt="png" />
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-gray-700 pl-2">
            <span className="font-medium text-sm sm:text-base">Welcome!</span>
            <span className="font-bold text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
              {user?.first_name?.toUpperCase() || "USER"}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section */}
      {/* <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1> */}

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* <div className="hidden sm:flex items-center space-x-4">
          <Search
            className="text-gray-600 cursor-pointer hover:text-gray-800"
            size={20}
          />
          <LuMessageSquareText
            className="text-gray-600 cursor-pointer hover:text-gray-800"
            size={20}
          />
          <Bell
            className="text-gray-600 cursor-pointer hover:text-gray-800"
            size={20}
          />
          <Settings
            className="text-gray-600 cursor-pointer hover:text-gray-800"
            size={20}
          />
        </div> */}

        {/* Avatar Button */}
        <div
          className="flex items-center justify-center h-10 w-10 border border-gray-400 rounded-full cursor-pointer relative bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          ref={menuRef}
        >
          <div className="h-10 w-10 rounded-full bg-[#428bf8] flex items-center justify-center text-black font-semibold">
            {username}
          </div>

          {/* Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-12 right-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 p-4 z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-[#428bf8] flex items-center justify-center text-black font-semibold">
                  {username}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {user.first_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <hr className="my-2" />

              <button
                className="flex items-center cursor-pointer gap-2 text-red-500 hover:text-red-600 text-sm font-medium w-full mt-2"
                onClick={() => {
                  setIsMenuOpen(false), (onClick = handleLogout());
                }}
              >
                <LogOut size={16} /> Logout
              </button>

              <button
                className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium w-full mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={16} /> Close
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
