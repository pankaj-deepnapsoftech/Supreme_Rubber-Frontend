// src/components/UserRolesManagement.jsx
import { useUserRole } from "@/Context/UserRoleContext";
import { useState } from "react";
import { useFormik } from "formik";

export default function UserRolesManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);

  const { roles, createRole, editRole, deleteRole, loading } = useUserRole();

  console.log(editRoleId)

  const permissionOptions = [
    "dashboard",
    "user role",
    "employee",
    "inventory",
    "quality chek",
    "production",
    "bom",
    "gateman",
    "supplier"
  ];

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
    setEditRoleId(null)
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

     
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 border-b">Role</th>
              <th className="px-6 py-3 border-b">Description</th>
              <th className="px-6 py-3 border-b">Permissions</th>
              <th className="px-6 py-3 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 italic bg-gray-50"
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-6 py-3 border-b">{r.role}</td>
                  <td className="px-6 py-3 border-b">{r.description}</td>
                  <td className="px-6 py-3 border-b">
                    {r.permissions.join(", ")}
                  </td>
                  <td className="px-6 py-3 border-b text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-600"
                        onClick={() => handleEdit(r)}
                      >
                        ✏️
                      </button>

                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(r._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
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
              {/* Role Name */}
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

              {/* Description */}
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

              {/* Permissions */}
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
                              formik.values.permissions.filter(
                                (p) => p !== value
                              )
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
    </div>
  );
}
