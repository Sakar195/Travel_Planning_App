import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  MapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

function AdminNavbar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Common styling for nav items
  const navItemClass =
    "flex items-center gap-3 text-sm py-3 px-4 rounded-lg transition-all duration-300 ease-in-out group";
  const navItemActive =
    "bg-sky-50 text-sky-500 font-medium shadow-sm transform transition-all duration-300 ease-in-out";
  const navItemHover =
    "hover:bg-sky-50/30 hover:text-sky-500/80 transition-all duration-300 ease-in-out";

  // Icon style
  const iconStyle = "w-5 h-5 transition-all duration-300";

  // Links with icons
  const navLinks = [
    {
      path: "/admin",
      exact: true,
      text: "Dashboard",
      icon: <HomeIcon className={iconStyle} />,
    },
    {
      path: "/admin/manage-trips",
      text: "Trips",
      icon: <MapIcon className={iconStyle} />,
    },
    {
      path: "/admin/manage-bookings",
      text: "Bookings",
      icon: <CalendarIcon className={iconStyle} />,
    },
    {
      path: "/admin/manage-users",
      text: "Users",
      icon: <UsersIcon className={iconStyle} />,
    },
    {
      path: "/admin/manage-tags",
      text: "Tags",
      icon: <TagIcon className={iconStyle} />,
    },
    // {
    //   path: "/admin/settings",
    //   text: "Settings",
    //   icon: <Cog6ToothIcon className={iconStyle} />,
    // },
  ];

  return (
    <aside
      className={`relative h-screen bg-white shadow-md border-r border-[var(--color-border)] transition-all duration-300 ease-in-out ${
        collapsed ? "w-[70px]" : "w-64"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-white rounded-full p-1 border border-[var(--color-border)] shadow-sm z-10 hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)] transition-colors duration-300"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-[var(--color-primary)]" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-[var(--color-primary)]" />
        )}
      </button>

      {/* Logo/Header */}
      <div
        className={`py-6 px-4 border-b border-[var(--color-border)] flex items-center transition-all duration-300 ease-in-out ${
          collapsed ? "justify-center" : "justify-start"
        }`}
      >
        {/* Standard Golimandu Logo */}
        <Link
          to="/admin"
          className={`flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-lg ${
            collapsed ? "justify-center" : ""
          }`}
          aria-label="Admin Dashboard Home"
        >
          <svg
            className={`h-8 w-auto text-sky-600 flex-shrink-0 transition-transform duration-500 ease-in-out ${
              collapsed ? "" : "mr-2 group-hover:rotate-12"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span
            className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 transition-all duration-300 whitespace-nowrap overflow-hidden ${
              collapsed
                ? "opacity-0 w-0 scale-0 absolute"
                : "opacity-100 w-auto scale-100 group-hover:from-sky-500 group-hover:to-cyan-500"
            }`}
          >
            Golimandu
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="mt-6 px-3 overflow-y-auto max-h-[calc(100vh-100px)] hide-scrollbar">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                end={link.exact}
                className={({ isActive }) => {
                  return `${navItemClass} ${
                    isActive ? navItemActive : navItemHover
                  }`;
                }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-colors duration-300 ${
                        isActive ? "text-sky-500" : ""
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span
                      className={`transition-all duration-300 ${
                        collapsed
                          ? "opacity-0 w-0 scale-0"
                          : "opacity-100 w-auto scale-100"
                      } ${isActive ? "text-sky-500" : ""}`}
                    >
                      {link.text}
                    </span>
                    {collapsed && (
                      <span className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-xs text-white origin-left scale-0 group-hover:scale-100 transition-all z-50">
                        {link.text}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Controls (Back to Website & Logout) */}
        <div
          className={`absolute bottom-5 left-0 w-full px-3 ${
            collapsed ? "" : ""
          }`}
        >
          {/* Go to Website Link */}
          <Link
            to="/"
            className={`${navItemClass} ${navItemHover} text-gray-700 w-full mb-1 group`}
            title="Back to Website"
          >
            <HomeIcon className={`${iconStyle} text-gray-500`} />
            <span
              className={`transition-all ${
                collapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto"
              }`}
            >
              Back to Website
            </span>
            {collapsed && (
              <span className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-xs text-white origin-left scale-0 group-hover:scale-100 transition-all z-50">
                Back to Website
              </span>
            )}
          </Link>

          {/* Logout Button */}
          <button
            className={`${navItemClass} ${navItemHover} text-red-500 w-full group`}
            onClick={async () => {
              await logout();
              navigate("/"); // Navigate to home after logout
            }}
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className={iconStyle} />
            <span
              className={`transition-all ${
                collapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto"
              }`}
            >
              Logout
            </span>
            {collapsed && (
              <span className="absolute left-full rounded-md px-2 py-1 ml-6 bg-gray-900 text-xs text-white origin-left scale-0 group-hover:scale-100 transition-all z-50">
                Logout
              </span>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default AdminNavbar;
