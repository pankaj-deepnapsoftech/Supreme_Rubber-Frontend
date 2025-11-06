// // src/components/UserRolesManagement.jsx
// import { useUserRole } from "@/Context/UserRoleContext";
// import { useState } from "react";
// import { useFormik } from "formik";
// import { Edit, Trash2 } from "lucide-react";
// import Pagination from "@/Components/Pagination/Pagination";

// export default function UserRolesManagement() {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [editRoleId, setEditRoleId] = useState(null);
 
//   const { roles, createRole, editRole, deleteRole, loading,page,setPage } = useUserRole();



//   const permissionOptions = [
//     "dashboard",
//     "user role",
//     "employee",
//     "inventory",
//     "quality check",
//     "production",
//     "bom",
//     "gateman",
//     "supplier",
//     "purchase order"
//   ];

//   // --- Formik setup ---
//   const formik = useFormik({
//     initialValues: {
//       role: "",
//       description: "",
//       permissions: [],
//     },
//     enableReinitialize: true,
//     onSubmit: async (values, { resetForm }) => {
//       if (editRoleId) {
//         await editRole({ _id: editRoleId, ...values });
//       } else {
//         await createRole(values);
//       }
//       resetForm();
//       setEditRoleId(null);
//       setIsDrawerOpen(false);
//     },
//   });

//   const handleEdit = (role) => {
//     setEditRoleId(role._id);
//     formik.setValues({
//       role: role.role,
//       description: role.description,
//       permissions: role.permissions || [],
//     });
//     setIsDrawerOpen(true);
//   };


//   const handleDelete = async (_id) => {
//     if (window.confirm("Are you sure you want to delete this role?")) {
//       await deleteRole(_id);
//     }
//   };

//   const handleAddNew = () => {
//     setEditRoleId(null);
//     formik.resetForm();
//     setIsDrawerOpen(true);
//     setEditRoleId(null)
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold">User Roles</h1>
//         <button
//           onClick={handleAddNew}
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//         >
//           + Add New Role
//         </button>
//       </div>

     
//       <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
//         <table className="min-w-full border-collapse text-sm text-left text-gray-700">
//           <thead>
//             <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
//               <th className="py-3 px-4 text-left rounded-tl-2xl">Role</th>
//               <th className="py-3 px-4 text-left">Description</th>
//               <th className="py-3 px-4 text-left">Permissions</th>
//               <th className="py-3 px-4 text-center rounded-tr-2xl">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {roles.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan="4"
//                   className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-b-2xl"
//                 >
//                   No roles found.
//                 </td>
//               </tr>
//             ) : (
//               roles.map((r, i) => (
//                 <tr
//                   key={r._id || i}
//                   className={`transition-all duration-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
//                     } hover:bg-blue-50`}
//                 >
//                   <td className="py-3 px-4 font-medium text-gray-800 border-b">
//                     {r.role}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 border-b">
//                     {r.description || "—"}
//                   </td>
//                   <td className="py-3 px-4 text-gray-700 border-b">
//                     {r.permissions && r.permissions.length > 0
//                       ? r.permissions.join(", ")
//                       : "No permissions"}
//                   </td>
//                   <td className="py-3 px-4 border-b text-center">
//                     <div className="flex justify-center space-x-3">
//                       <button
//                         className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition"
//                         title="Edit"
//                         onClick={() => handleEdit(r)}
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button
//                         className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
//                         title="Delete"
//                         onClick={() => handleDelete(r._id)}
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>


//       {isDrawerOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm"
//             onClick={() => setIsDrawerOpen(false)}
//           ></div>

//           <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto transition-transform duration-300">
//             <h2 className="text-xl font-semibold mb-4">
//               {editRoleId ? "Edit Role" : "Add New Role"}
//             </h2>

//             <form onSubmit={formik.handleSubmit} className="space-y-4">
//               {/* Role Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role Name
//                 </label>
//                 <input
//                   type="text"
//                   name="role"
//                   value={formik.values.role}
//                   onChange={formik.handleChange}
//                   required
//                   placeholder="Enter role name"
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formik.values.description}
//                   onChange={formik.handleChange}
//                   required
//                   placeholder="Enter description"
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Permissions */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Permissions
//                 </label>
//                 <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-md p-2 max-h-48 overflow-y-auto">
//                   {permissionOptions.map((perm) => (
//                     <label key={perm} className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         value={perm}
//                         checked={formik.values.permissions.includes(perm)}
//                         onChange={(e) => {
//                           const { checked, value } = e.target;
//                           if (checked) {
//                             formik.setFieldValue("permissions", [
//                               ...formik.values.permissions,
//                               value,
//                             ]);
//                           } else {
//                             formik.setFieldValue(
//                               "permissions",
//                               formik.values.permissions.filter(
//                                 (p) => p !== value
//                               )
//                             );
//                           }
//                         }}
//                       />
//                       <span className="text-sm">{perm}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {loading
//                   ? "Saving..."
//                   : editRoleId
//                     ? "Update Role"
//                     : "Create Role"}
//               </button>
//             </form>
//           </div>
//         </>
//       )}
//       <Pagination page={page} setPage={setPage} hasNextPage={roles?.length === 10}  />
//     </div>
//   );
// }









// src/components/UserRolesManagement.jsx
import { useUserRole } from "@/Context/UserRoleContext";
import { useState, useMemo } from "react";
import { useFormik } from "formik";
import { Edit, Trash2, Search, RefreshCw, Download } from "lucide-react";
import Pagination from "@/Components/Pagination/Pagination";

export default function UserRolesManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPermission, setFilterPermission] = useState("");
  
  const { roles, createRole, editRole, deleteRole, loading, page, setPage, fetchRoles } = useUserRole();

  const permissionOptions = [
    "dashboard",
    "user role",
    "employee",
    "inventory",
    "quality check",
    "production",
    "bom",
    "gateman",
    "supplier",
    "purchase order",
    "production start"
  ];

  // Filtered + searched roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch =
        r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterPermission
        ? r.permissions?.includes(filterPermission)
        : true;
      return matchesSearch && matchesFilter;
    });
  }, [roles, searchQuery, filterPermission]);

  // --- Formik setup ---
  const formik = useFormik({
    initialValues: {
      role: "",
      description: "",
      permissions: [],
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (editRoleId) {
        await editRole({ _id: editRoleId, ...values });
      } else {
        await createRole(values);
      }
      resetForm();
      setEditRoleId(null);
      setIsDrawerOpen(false);
    },
  });

  const handleEdit = (role) => {
    setEditRoleId(role._id);
    formik.setValues({
      role: role.role,
      description: role.description,
      permissions: role.permissions || [],
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      await deleteRole(_id);
    }
  };

  const handleAddNew = () => {
    setEditRoleId(null);
    formik.resetForm();
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    fetchRoles && fetchRoles();
  };

  const handleDownload = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Role,Description,Permissions"]
        .concat(
          filteredRoles.map((r) =>
            [
              `"${r.role}"`,
              `"${r.description}"`,
              `"${r.permissions?.join(", ")}"`,
            ].join(",")
          )
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "user_roles.csv";
    link.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Roles</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add New Role
        </button>
      </div>

      {/* Search, Filter, Refresh, Download */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-64 text-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter dropdown */}
          <select
            value={filterPermission}
            onChange={(e) => setFilterPermission(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Permissions</option>
            {permissionOptions.map((perm) => (
              <option key={perm} value={perm}>
                {perm}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh + Download */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full border-collapse text-sm text-left text-gray-700">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
              <th className="py-3 px-4 text-left rounded-tl-2xl">Role</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Permissions</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-b-2xl"
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              filteredRoles.map((r, i) => (
                <tr
                  key={r._id || i}
                  className={`transition-all duration-200 ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800 border-b">
                    {r.role}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-b">
                    {r.description || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-b">
                    {r.permissions && r.permissions.length > 0
                      ? r.permissions.join(", ")
                      : "No permissions"}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                       className="h-4 w-4 text-blue-500 cursor-pointer"
                        title="Edit"
                        onClick={() => handleEdit(r)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="h-4 w-4 text-red-500 cursor-pointer"
                        title="Delete"
                        onClick={() => handleDelete(r._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer for add/edit */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto transition-transform duration-300">
            <h2 className="text-xl font-semibold mb-4">
              {editRoleId ? "Edit Role" : "Add New Role"}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  required
                  placeholder="Enter role name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  required
                  placeholder="Enter description"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-md p-2 max-h-48 overflow-y-auto">
                  {permissionOptions.map((perm) => (
                    <label key={perm} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={perm}
                        checked={formik.values.permissions.includes(perm)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          if (checked) {
                            formik.setFieldValue("permissions", [
                              ...formik.values.permissions,
                              value,
                            ]);
                          } else {
                            formik.setFieldValue(
                              "permissions",
                              formik.values.permissions.filter((p) => p !== value)
                            );
                          }
                        }}
                      />
                      <span className="text-sm">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editRoleId
                  ? "Update Role"
                  : "Create Role"}
              </button>
            </form>
          </div>
        </>
      )}

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={roles?.length === 10}
      />
    </div>
  );
}
