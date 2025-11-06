import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/Context/AuthContext";
import { useUserRole } from "@/Context/UserRoleContext";
import Pagination from "@/Components/Pagination/Pagination";

const Employee = () => {
  const {
    user,
    allUsers,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
  } = useAuth();
  const { roles, loading: rolesLoading } = useUserRole();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterVerified, setFilterVerified] = useState("All");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      await getAllUsers(page);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getUserById(id);
      const emp = res?.user || null;
      setSelectedEmployee(emp);
      setSelectedRole(emp?.role?._id || "");
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteUser(id);
        fetchEmployees(); // refresh list
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedEmployee?._id || !selectedRole) {
      alert("Please select a role before updating.");
      return;
    }

    try {
      setUpdating(true);
      await updateUserRole(selectedEmployee._id, selectedRole);
      setShowModal(false);
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setUpdating(false);
    }
  };
  useEffect(() => {
    if (user) fetchEmployees();
  }, [user, page]);

  // const filteredEmployees = allUsers.filter((emp) =>
  //   `${emp.first_name || ""} ${emp.last_name || ""}`
  //     .toLowerCase()
  //     .includes(search.toLowerCase())
  // );

  const filteredEmployees = allUsers.filter((emp) => {
    const nameMatch = `${emp.first_name || ""} ${emp.last_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const verifyMatch =
      filterVerified === "All"
        ? true
        : filterVerified === "Yes"
        ? emp.isVerified
        : !emp.isVerified;

    return nameMatch && verifyMatch;
  });

  return (
    <div className="p-6 relative overflow-hidden">
      <h1 className="text-2xl font-semibold">Employee</h1>
      {/* Search + Actions */}
      <div className="flex justify-between items-center mb-4 mt-6">
        <div className="flex items-center border rounded-lg px-3 py-2 w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center space-x-4 text-gray-500">
          <div className="relative group">
            <button
             onClick={() => setFilterOpen(!filterOpen)}
             className="p-2 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-100 transition">
            <Filter
              size={16}
              className="cursor-pointer hover:text-gray-800"
            />
            {filterOpen && (
              <div className="absolute right-0 top-6 bg-white border shadow-md rounded-md w-32 z-10">
                {["All", "Yes", "No"].map((option) => (
                  <p
                    key={option}
                    onClick={() => {
                      setFilterVerified(option);
                      setFilterOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      filterVerified === option
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option === "All"
                      ? "All Employees"
                      : option === "Yes"
                      ? "Verified"
                      : "Not Verified"}
                  </p>
                ))}
              </div>
            )}
            </button>
          </div>

          <button className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 hover:bg-gray-100 transition">
            <RefreshCw
              size={16}
              className={`cursor-pointer ${
                loading ? "animate-spin text-blue-500" : ""
              }`}
              onClick={fetchEmployees}
            />
          </button>
          <button className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 hover:bg-gray-100 transition">
            <Download size={16} className="cursor-pointer" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r text-center from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
              <th className="py-3 px-4  ">Name</th>
              <th className="py-3 px-4">Employee ID</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Verified</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, index) => (
                <tr
                  key={emp._id}
                  className={`text-sm transition-all text-center duration-200 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {emp.first_name} {emp.last_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{emp.employeeId}</td>
                  <td className="py-3 px-4 text-gray-600">{emp.email}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {emp.phone || "—"}
                  </td>
                  <td className="py-3 px-4">
                    {emp.isVerified ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                        No
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex justify-center space-x-3">
                    <Edit
                      size={16}
                      className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                      onClick={() => handleEdit(emp._id)}
                    />
                    <Trash2
                      size={16}
                      className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                      onClick={() => handleDelete(emp._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 px-4 text-gray-400 bg-gray-50 rounded-b-2xl"
                >
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {showModal && selectedEmployee && (
          <motion.div
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Employee Details
              </h2>
              <X
                size={20}
                className="cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <strong>Name:</strong> {selectedEmployee.first_name}{" "}
                {selectedEmployee.last_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmployee.email}
              </p>
              <p>
                <strong>Employee ID:</strong> {selectedEmployee.employeeId}
              </p>

              {/* ✅ Role Dropdown */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Assign Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border border-gray-300 rounded-md w-full px-3 py-2"
                  disabled={rolesLoading}
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleUpdateRole}
                disabled={updating}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 w-full"
              >
                {updating ? "Updating..." : "Update Role"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={allUsers?.length === 10}
      />
    </div>
  );
};

export default Employee;
