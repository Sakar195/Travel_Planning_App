// src/pages/Admin/AdminUserListPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminGetAllUsers, adminDeleteUser } from "../../services/adminService";
import { useAuth } from "../../contexts/AuthContext"; // To prevent admin deleting self
import { formatDate } from "../../utils/formatDate"; // Assuming you have this utility
import "./AdminStyles.css";

function AdminUserListPage() {
  const { user: loggedInAdmin } = useAuth(); // Get the currently logged-in admin's info
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteState, setDeleteState] = useState({}); // Track delete status per user

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminGetAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userIdToDelete) => {
    if (deleteState[userIdToDelete]?.loading) return;

    // Critical Check: Prevent admin from deleting their own account
    if (loggedInAdmin?.userId === userIdToDelete) {
      alert("Error: Admins cannot delete their own account.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this user? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeleteState((prev) => ({
      ...prev,
      [userIdToDelete]: { loading: true, error: "" },
    }));
    try {
      await adminDeleteUser(userIdToDelete);
      fetchUsers(); // Refresh user list after delete
      // No need to reset deleteState for the deleted item
    } catch (err) {
      setDeleteState((prev) => ({
        ...prev,
        [userIdToDelete]: {
          loading: false,
          error: err.message || "Delete failed",
        },
      }));
      console.error(`Delete failed for user ${userIdToDelete}:`, err);
    }
  };

  if (loading) return <div className="loading-message">Loading Users...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-page-container">
      <h1>Manage Users</h1>
      {/* Optional: Add New User button if needed */}
      {/* <Link to="/admin/users/add" className="admin-button add-new-button">Add New User</Link> */}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.fullname}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                {/* Option 1: Link to separate Edit Page */}
                <Link
                  to={`/admin/users/edit/${user._id}`}
                  className="admin-button edit"
                >
                  Edit
                </Link>

                {/* Option 2: Implement inline editing or modal (more complex) */}

                <button
                  onClick={() => handleDelete(user._id)}
                  className="admin-button delete"
                  disabled={
                    deleteState[user._id]?.loading ||
                    loggedInAdmin?.userId === user._id
                  } // Disable delete for self
                  title={
                    loggedInAdmin?.userId === user._id
                      ? "Cannot delete own account"
                      : "Delete User"
                  }
                >
                  {deleteState[user._id]?.loading ? "Deleting..." : "Delete"}
                </button>
                {deleteState[user._id]?.error && (
                  <p className="error-message inline-error">
                    {deleteState[user._id].error}
                  </p>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="6">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserListPage;
