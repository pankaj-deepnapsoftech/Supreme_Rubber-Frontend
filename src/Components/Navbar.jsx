import { Search, Bell, MessageSquare, Settings, ChevronDown } from "lucide-react";
import { LuMessageSquareText } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";

const Navbar = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-gray-100">

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-gray-700 cursor-pointer">
          <img className="w-[15px] h-[13px]" src="/Vector.png" alt="png" />
          <span className="font-medium">English</span>

        </div>
      </div>


      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>


      <div className="flex items-center gap-5">
        <Search className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
        <LuMessageSquareText
          className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
        <Bell className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />
        <Settings className="text-gray-600 cursor-pointer hover:text-gray-800" size={20} />


        <div className="flex items-center h-10  w-10 gap-2 border border-gray-500 rounded-full justify-center">
          <FaUserAlt />
        </div>

      </div>
    </header>
  );
};

export default Navbar;
