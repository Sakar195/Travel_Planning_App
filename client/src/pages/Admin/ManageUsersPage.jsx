import React, { useState, useEffect, Fragment, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import {
  adminGetAllUsers,
  adminDeleteUser,
  adminAddUser,
  adminUpdateUser,
} from "../../services/adminService";
import Button from "../../components/Common/Button";
import ErrorMessage from "../../components/Common/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const location = useLocation();
  const { user: loggedInAdmin } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // --- Fetch Users ---
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch users only once on mount (pagination/filtering TBD on backend)

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetAllUsers();
      setUsers(data.users || data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Memoized Filtering ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === ""
          ? true
          : user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${user.firstName || ""} ${user.lastName || ""}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

      const matchesRole =
        filters.role === "" ? true : user.role === filters.role;
      // Add status filter if needed
      // const matchesStatus = filters.status === "" ? true : user.status === filters.status;

      return matchesSearch && matchesRole; // && matchesStatus;
    });
  }, [users, searchTerm, filters]); // Dependencies for filtering

  // --- Pagination Calculation ---
  useEffect(() => {
    // Calculate total pages based on the memoized filtered list
    const total = Math.ceil(filteredUsers.length / 10);
    setTotalPages(total > 0 ? total : 1);
    // Adjust current page if it becomes invalid after filtering
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
    // This effect should run when the filtered list or current page changes
  }, [filteredUsers, currentPage]);

  // --- Notification Handling ---
  useEffect(() => {
    if (location.state?.message) {
      showNotification(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // --- Pagination Controls ---
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- Modal Functions ---
  const openAddModal = () => {
    setEditingUser(null);
    setUserForm({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "user",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "", // Keep for display
      email: user.email || "", // Keep for display
      password: "", // Password not edited here
      role: user.role || "user",
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setModalError(null);
  };

  const handleModalFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    // Frontend validation
    if (
      !userForm.firstName ||
      !userForm.lastName ||
      !userForm.username ||
      !userForm.email
    ) {
      setModalError("First Name, Last Name, Username, and Email are required.");
      setModalLoading(false);
      return;
    }
    if (!editingUser && !userForm.password) {
      // Password required only when adding
      setModalError("Password is required when adding a new user.");
      setModalLoading(false);
      return;
    }
    // Prevent admin changing own role
    if (
      editingUser &&
      loggedInAdmin?._id === editingUser._id &&
      userForm.role !== "admin"
    ) {
      setModalError("Admins cannot change their own role.");
      setModalLoading(false);
      return;
    }

    try {
      if (editingUser) {
        // Update existing user - only send editable fields
        const dataToUpdate = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          role: userForm.role,
          // Do not send username, email, or password for update via this form
        };
        await adminUpdateUser(editingUser._id, dataToUpdate);
        showNotification("User updated successfully");
      } else {
        // Add new user
        await adminAddUser(userForm);
        showNotification("User added successfully");
      }
      closeModal();
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Modal Submit Error:", err);
      setModalError(err.message || "An error occurred. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    // Critical Check: Prevent admin from deleting their own account
    if (loggedInAdmin?._id === userId) {
      showNotification("Admins cannot delete their own account.", "error");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await adminDeleteUser(userId);
        showNotification("User deleted successfully");
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error deleting user:", err);
        showNotification(err.message || "Failed to delete user", "error");
      }
    }
  };

  // --- Render ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title and description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Users</h1>
        <p className="text-gray-500">
          View, edit, and manage user accounts in the system.
        </p>
      </div>

      {/* Action header with search and filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Button - Override text and border color */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FunnelIcon className="w-5 h-5" />}
            className="border-[var(--color-border)] text-gray-700 hover:bg-gray-50" // Override border/text/hover
          >
            Filter
          </Button>
          {/* Refresh Button - Override text and border color */}
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            icon={
              <ArrowPathIcon
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            }
            aria-label="Refresh Users"
            className="border-[var(--color-border)] text-gray-700 hover:bg-gray-50" // Override border/text/hover
          />
          {/* Add User Button */}
          <Button
            variant="primary"
            onClick={openAddModal}
            icon={<UserPlusIcon className="w-5 h-5" />}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filter section */}
      <Transition
        show={showFilters}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm">
          {/* Filter Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                {/* Add other roles like guide if applicable */}
                {/* <option value="guide">Guide</option> */}
              </select>
            </div>
            {/* Add Status Filter if needed */}
            {/* <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
               <select>
                 <option value="">All Status</option>...
               </select>
             </div> */}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="text"
              onClick={() => {
                setFilters({ role: "", status: "" });
                setSearchTerm("");
              }}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Transition>

      {/* Notification toast */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg animate-fade-in-right
             ${
               notification.type === "error"
                 ? "bg-red-500 text-white"
                 : "bg-green-500 text-white"
             }`}
        >
          {notification.message}
        </div>
      )}

      {/* Main content: User Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Head */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* User Cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* Add avatar logic if available */}
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                            <span className="font-medium leading-none text-white">
                              {user.firstName?.charAt(0) ||
                                user.username?.charAt(0) ||
                                "U"}
                            </span>
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {user._id?.substring(0, 8) || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Email Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || "N/A"}
                    </td>
                    {/* Role Cell */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                         ${
                           user.role === "admin"
                             ? "bg-purple-100 text-purple-800"
                             : "bg-green-100 text-green-800"
                         }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    {/* Joined Date Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        user.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </td>
                    {/* Actions Cell - Change variant to text */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="text" // Changed variant to text
                        onClick={() => openEditModal(user)}
                        className="text-sky-600 hover:text-sky-800" // Keep blue text color
                        title="Edit User"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="text" // Changed variant to text
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-800" // Keep red text color
                        disabled={loggedInAdmin?._id === user._id}
                        title={
                          loggedInAdmin?._id === user._id
                            ? "Cannot delete self"
                            : "Delete User"
                        }
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // No Users Found Message
        <div className="text-center py-12 bg-white rounded-lg border border-[var(--color-border)]">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.role
              ? "Try adjusting your search or filters"
              : "Get started by adding a new user"}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={openAddModal}
              icon={<UserPlusIcon className="h-5 w-5" />}
            >
              Add User
            </Button>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          {/* Pagination Info */}
          {/* Add logic for total count from backend if server-side pagination */}
          <p className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
            {/* ({filteredUsers.length} users found) */}
          </p>
          {/* Pagination Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              icon={<ChevronLeftIcon className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              icon={<ChevronRightIcon className="h-4 w-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center"
                  >
                    <span>{editingUser ? "Edit User" : "Add New User"}</span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    {modalError && (
                      <ErrorMessage
                        message={modalError}
                        isDismissible={true}
                        onDismiss={() => setModalError(null)}
                      />
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First Name*
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={userForm.firstName}
                          onChange={handleModalFormChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last Name*
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={userForm.lastName}
                          onChange={handleModalFormChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Username*
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={userForm.username}
                        onChange={handleModalFormChange}
                        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 ${
                          editingUser ? "bg-gray-100" : ""
                        }`}
                        required
                        readOnly={!!editingUser} // Username not editable after creation
                        disabled={!!editingUser}
                      />
                      {editingUser && (
                        <p className="mt-1 text-xs text-gray-500">
                          Username cannot be changed after creation.
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email*
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={userForm.email}
                        onChange={handleModalFormChange}
                        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 ${
                          editingUser ? "bg-gray-100" : ""
                        }`}
                        required
                        readOnly={!!editingUser} // Email not editable after creation
                        disabled={!!editingUser}
                      />
                      {editingUser && (
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed after creation.
                        </p>
                      )}
                    </div>

                    {/* Password only shown when adding */}
                    {!editingUser && (
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password*
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={userForm.password}
                          onChange={handleModalFormChange}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                          required
                          placeholder="Set an initial password"
                        />
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role*
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={userForm.role}
                        onChange={handleModalFormChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        required
                        disabled={loggedInAdmin?._id === editingUser?._id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {loggedInAdmin?._id === editingUser?._id && (
                        <p className="mt-1 text-xs text-orange-600">
                          Admins cannot change their own role.
                        </p>
                      )}
                    </div>

                    {/* Modal Actions */}
                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={modalLoading}
                        disabled={modalLoading}
                        icon={
                          editingUser ? (
                            <PencilSquareIcon className="h-5 w-5" />
                          ) : (
                            <UserPlusIcon className="h-5 w-5" />
                          )
                        }
                      >
                        {modalLoading
                          ? "Saving..."
                          : editingUser
                          ? "Update User"
                          : "Add User"}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default ManageUsersPage;
