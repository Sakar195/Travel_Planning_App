// src/pages/Admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { adminGetAllTrips } from "../../services/adminService";
import {
  ChartBarIcon,
  MapIcon,
  UserIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function AdminDashboardPage() {
  const location = useLocation();
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    totalTrips: 0,
    totalUsers: 0,
    totalBookings: 0,
    recentBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine if we're on the main admin page (not a sub-route)
  const isMainDashboard =
    location.pathname === "/admin" || location.pathname === "/admin/";

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log("Waiting for auth token...");
        return;
      }

      setLoading(true);
      setError(null);
      setSummary({
        totalTrips: 0,
        totalUsers: 0,
        totalBookings: 0,
        recentBookings: 0,
      });

      try {
        const [summaryRes, tripsRes] = await Promise.all([
          api.get("/admin/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          adminGetAllTrips(),
        ]);

        const fetchedSummary = summaryRes.data;
        const fetchedTrips = tripsRes.trips || tripsRes || [];

        const publicTripsCount = fetchedTrips.filter(
          (trip) => trip.isPublic === true
        ).length;
        console.log(
          "Total trips fetched:",
          fetchedTrips.length,
          "Public trips count:",
          publicTripsCount
        );

        setSummary({
          ...fetchedSummary,
          totalTrips: publicTripsCount,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Helper to format timestamp (relative time) - Commented out
  // const formatTimestamp = (timestamp) => {
  //   const date = new Date(timestamp);
  //   const now = new Date();
  //   const secondsPast = (now.getTime() - date.getTime()) / 1000;
  //
  //   if (secondsPast < 60) {
  //     return parseInt(secondsPast) + "s ago";
  //   }
  //   const minutesPast = secondsPast / 60;
  //   if (minutesPast < 60) {
  //     return parseInt(minutesPast) + "m ago";
  //   }
  //   const hoursPast = minutesPast / 60;
  //   if (hoursPast < 24) {
  //     return parseInt(hoursPast) + "h ago";
  //   }
  //   const daysPast = hoursPast / 24;
  //   if (daysPast < 7) {
  //     return parseInt(daysPast) + "d ago";
  //   }
  //   // For older dates, show the actual date
  //   return date.toLocaleDateString(undefined, {
  //     year: 'numeric', month: 'short', day: 'numeric'
  //   });
  // };

  // Dashboard statistics cards
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between border border-[var(--color-border)] transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${color}`}
      ></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm text-gray-500 mb-1 whitespace-nowrap">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>
        <span
          className={`p-2 rounded-lg ${color.replace(
            "bg-",
            "bg-opacity-20 text-"
          )}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );

  // Skeleton loader for StatCard
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-5 h-[116px] animate-pulse border border-[var(--color-border)]">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
    </div>
  );

  // Skeleton loader for Activity Item - Commented out
  // const ActivityItemSkeleton = () => (
  //   <div className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 animate-pulse">
  //     <div className="bg-gray-200 rounded-full w-9 h-9 flex-shrink-0"></div>
  //     <div className="flex-1 space-y-2">
  //       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  //       <div className="h-3 bg-gray-200 rounded w-1/4"></div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb - dynamic based on route */}
      <nav className="mb-6">
        <ol className="flex text-sm">
          <li className="text-[var(--color-primary)]">Admin</li>
          {location.pathname !== "/admin" && (
            <>
              <li className="mx-2 text-gray-500">/</li>
              <li className="text-gray-500 capitalize">
                {location.pathname
                  .split("/")
                  .filter(Boolean)
                  .pop()
                  ?.replace("-", " ")}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {isMainDashboard
            ? "Dashboard Overview"
            : location.pathname
                .split("/")
                .filter(Boolean)
                .pop()
                ?.replace("-", " ")
                .replace(/^\w/, (c) => c.toUpperCase())}
        </h1>
        <p className="text-gray-500">
          {isMainDashboard
            ? "Welcome to your admin dashboard. Monitor key metrics and manage your application."
            : `Manage and organize your ${location.pathname
                .split("/")
                .filter(Boolean)
                .pop()
                ?.replace("-", " ")}.`}
        </p>
      </div>

      {/* Show dashboard widgets only on main dashboard */}
      {isMainDashboard && (
        <>
          {/* Stats cards - Display loading or error state */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
            ) : error ? (
              <div
                className="sm:col-span-2 lg:col-span-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <div className="flex">
                  <div className="py-1">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-700 mr-4" />
                  </div>
                  <div>
                    <p className="font-bold">Error Loading Dashboard Stats</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <StatCard
                  title="Public Trips"
                  value={summary.totalTrips}
                  icon={<MapIcon className="w-6 h-6" />}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Registered Users"
                  value={summary.totalUsers}
                  icon={<UserIcon className="w-6 h-6" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="Total Bookings"
                  value={summary.totalBookings}
                  icon={<CalendarDaysIcon className="w-6 h-6" />}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Bookings This Month"
                  value={summary.recentBookings}
                  icon={<ChartBarIcon className="w-6 h-6" />}
                  color="bg-yellow-500"
                />
              </>
            )}
          </div>
          {/* Quick action buttons */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              to="/admin/manage-trips"
              className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-[var(--color-primary)]"
            >
              <MapIcon className="w-5 h-5" />
              <span>Manage Trips</span>
            </Link>
            <Link
              to="/admin/manage-users"
              className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-[var(--color-primary)]"
            >
              <UserIcon className="w-5 h-5" />
              <span>Manage Users</span>
            </Link>
            <Link
              to="/admin/manage-bookings"
              className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3 text-[var(--color-primary)]"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              <span>View Bookings</span>
            </Link>
          </div>
        </>
      )}

      {/* Outlet for nested routes */}
      {/* This part should only render content *if* it's NOT the main dashboard page,
         as the main dashboard content is rendered above. 
         The logic in App.jsx already handles rendering the correct component via the Outlet in AdminLayout. 
         We might not need this conditional rendering or the Outlet here anymore. 
         Let's remove the conditional visibility for now and rely on the App.jsx routing.
      */}
      {/* <div className={`${isMainDashboard ? "hidden" : "mt-8 animate-fade-in"}`}> */}
      {/* The actual page content (e.g., ManageTripsPage) is rendered by the Outlet in AdminLayout */}
      {!isMainDashboard && <Outlet />}
      {/* </div> */}
    </div>
  );
}

export default AdminDashboardPage;
