import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../Admin/AdminNavbar";
import "../../pages/Admin/AdminStyles.css";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNavbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
