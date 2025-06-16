import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  QueueListIcon
} from "@heroicons/react/24/outline";

/**
 * Enhanced Navbar Component with improved animations and focused functionality
 * Features:
 * - Cleaner animations with Tailwind transitions
 * - Performance optimized with proper dependencies
 * - Simplified link structure focusing on sign-in button
 * - Enhanced scroll animations
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Improved scroll detection with throttling for performance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Add passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or pressing escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.getElementById("navbar");
      if (navbar && !navbar.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }

      const userMenu = document.getElementById("user-menu");
      if (userMenu && !userMenu.contains(event.target) && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isMobileMenuOpen, userMenuOpen]);

  // Helper function to check if a trip detail path is coming from My Rides
  const isMyRideDetailsPage = (pathname) => {
    // Check if we're on a trip detail page
    if (pathname.startsWith('/trips/') && pathname.split('/').length === 3) {
      // If we're viewing a trip detail, check sessionStorage for the referring page
      const referrer = sessionStorage.getItem('tripReferrer');
      return referrer === 'my-rides';
    }
    return false;
  };

  // Define primary navigation links
  const navLinks = [
    { title: "Home", path: "/", exact: true },
    { 
      title: "Explore Trips", 
      path: "/trips",
      isActive: (pathname) => pathname === '/trips' || (pathname.startsWith('/trips/') && !isMyRideDetailsPage(pathname))
    },
    ...(isAuthenticated && user?.role !== "admin"
      ? [{ 
          title: "Create Ride Plan", 
          path: "/plan-my-trip"
        }]
      : []),
    ...(isAuthenticated && user?.role !== "admin"
      ? [{ 
          title: "My Rides", 
          path: "/my-rides",
          isActive: (pathname) => pathname === '/my-rides' || isMyRideDetailsPage(pathname)
        }]
      : []),
    ...(isAuthenticated && user?.role === "admin"
      ? [{ title: "Create Trip", path: "/plan-ride" }]
      : []),
  ];

  // Store the origin when navigating to trip details
  useEffect(() => {
    if (location.pathname === '/my-rides') {
      sessionStorage.setItem('tripReferrer', 'my-rides');
    } else if (location.pathname === '/trips') {
      sessionStorage.setItem('tripReferrer', 'trips');
    }
  }, [location.pathname]);

  // Handle user logout
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  // NavLink base styling with composition pattern
  const getLinkClasses = (isActive, isMobile) => {
    return `
      ${
        isMobile
          ? "block w-full text-base py-3"
          : "inline-block text-sm py-2 px-3"
      } 
      font-medium rounded-lg transition-all duration-300 ease-in-out
      ${
        isActive
          ? "bg-sky-50 text-sky-600 font-semibold"
          : "text-gray-700 hover:text-sky-600 hover:bg-sky-50/60"
      }
      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
    `;
  };

  return (
    <nav
      id="navbar"
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${
        scrolled
          ? "py-2 bg-white/95 shadow-lg backdrop-blur-lg"
          : "py-4 bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo with hover animation */}
          <div className="flex-shrink-0 group">
            <Link
              to="/"
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-lg"
              onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
              aria-label="Golimandu Home"
            >
              <svg
                className="h-8 w-auto mr-2 text-sky-600 transition-transform duration-500 ease-in-out group-hover:rotate-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-600 transition-all duration-500 group-hover:from-sky-500 group-hover:to-cyan-500">
                Golimandu
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {/* Main navigation links */}
            {navLinks.map((link) => (
              <NavLink
                key={`desktop-${link.path}`}
                to={link.path}
                className={({ isActive }) => 
                  getLinkClasses(link.isActive ? link.isActive(location.pathname) : isActive, false)
                }
                end={link.exact}
              >
                {link.title}
              </NavLink>
            ))}

            {/* Conditionally render either Sign In button or User menu */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="ml-3 inline-flex items-center justify-center px-4 py-2 rounded-lg 
                  bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium text-sm
                  transition-all duration-300 ease-out shadow-sm hover:shadow-md
                  hover:from-sky-600 hover:to-cyan-600 hover:-translate-y-0.5 active:translate-y-0
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative ml-3" id="user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rounded-full p-1 transition-all duration-200
                    hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                  <span className="font-medium text-sm text-gray-700 hidden md:block">
                    {user?.username || user?.name || "Account"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                </button>

                {/* User dropdown menu */}
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5
                    transition-all duration-200 ease-in-out origin-top-right
                    ${
                      userMenuOpen
                        ? "transform scale-100 opacity-100"
                        : "transform scale-95 opacity-0 invisible"
                    }`}
                >
                  {user?.role !== "admin" && (
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HomeIcon className="mr-3 h-5 w-5 text-sky-500" />
                      Dashboard
                    </Link>
                  )}
                  {user?.role !== "admin" && (
                    <Link
                      to="/my-rides"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <QueueListIcon className="mr-3 h-5 w-5 text-sky-500" />
                      My Rides
                    </Link>
                  )}
                  {user?.role !== "admin" && (
                    <Link
                      to="/plan-my-trip"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <PencilSquareIcon className="mr-3 h-5 w-5 text-sky-500" />
                      Create Plan
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShieldCheckIcon className="mr-3 h-5 w-5 text-sky-500" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserIcon className="mr-3 h-5 w-5 text-sky-500" />
                    Profile
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button with enhanced animation */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-sky-600 
                hover:bg-sky-50 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              </span>
              <div className="relative h-6 w-6">
                <Bars3Icon
                  className={`absolute inset-0 transition-all duration-300 ease-in-out
                    ${
                      isMobileMenuOpen
                        ? "opacity-0 rotate-90 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  aria-hidden="true"
                />
                <XMarkIcon
                  className={`absolute inset-0 transition-all duration-300 ease-in-out
                    ${
                      isMobileMenuOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 rotate-90 scale-0"
                    }`}
                  aria-hidden="true"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel with improved animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-96 opacity-100 border-t border-gray-100"
            : "max-h-0 opacity-0 border-t border-transparent"
        }`}
        id="mobile-menu"
      >
        <div className="px-3 py-2 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={`mobile-${link.path}`}
              to={link.path}
              className={({ isActive }) => 
                getLinkClasses(link.isActive ? link.isActive(location.pathname) : isActive, true)
              }
              onClick={() => setIsMobileMenuOpen(false)}
              end={link.exact}
            >
              {link.title}
            </NavLink>
          ))}

          {/* User info if authenticated or sign in button if not */}
          {isAuthenticated && user ? (
            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center px-3 py-2">
                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-3">
                  <UserCircleIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.username || user?.name || "Account"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ""}</p>
                </div>
              </div>

              {user?.role !== "admin" && (
                <Link
                  to="/dashboard"
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon className="mr-3 h-5 w-5 text-sky-500" />
                  Dashboard
                </Link>
              )}

              {user?.role !== "admin" && (
                <Link
                  to="/my-rides"
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <QueueListIcon className="mr-3 h-5 w-5 text-sky-500" />
                  My Rides
                </Link>
              )}

              {user?.role !== "admin" && (
                <Link
                  to="/plan-my-trip"
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PencilSquareIcon className="mr-3 h-5 w-5 text-sky-500" />
                  Create Plan
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-sky-500" />
                  Admin Dashboard
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserIcon className="mr-3 h-5 w-5 text-sky-500" />
                Profile
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="mt-3 w-full block text-center px-4 py-3 rounded-lg 
                bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium
                transition-all duration-300 ease-out shadow-sm
                hover:from-sky-600 hover:to-cyan-600 active:translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-sky-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
