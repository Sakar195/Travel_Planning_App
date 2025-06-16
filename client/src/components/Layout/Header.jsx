// src/components/Layout/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css"; // We'll create this CSS file

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle scroll event to change header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-[var(--shadow-navbar)] py-2"
          : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-bold transition-colors duration-300 ${
              scrolled ? "text-[var(--color-primary)]" : "text-white"
            }`}
          >
            Golimandu
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/trips"
              className={`font-medium hover:text-[var(--color-primary)] transition-colors duration-200 ${
                scrolled ? "text-[var(--color-txt-secondary)]" : "text-white"
              }`}
            >
              Explore Trips
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`font-medium hover:text-[var(--color-primary)] transition-colors duration-200 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)]"
                      : "text-white"
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/media"
                  className={`font-medium hover:text-[var(--color-primary)] transition-colors duration-200 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)]"
                      : "text-white"
                  }`}
                >
                  My Media
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`font-medium hover:text-[var(--color-primary)] transition-colors duration-200 ${
                      scrolled
                        ? "text-[var(--color-txt-secondary)]"
                        : "text-white"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1 focus:outline-none"
                  >
                    <div
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
                        scrolled
                          ? "border-[var(--color-primary)]"
                          : "border-white"
                      }`}
                    >
                      {user?.profilePicture ? (
                        <img
                          src={`http://localhost:5001${user.profilePicture}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            scrolled
                              ? "bg-[color-mix(in_srgb,var(--color-primary),white_85%)] text-[var(--color-primary)]"
                              : "bg-[color-mix(in_srgb,var(--color-primary),black_30%)] text-white"
                          }`}
                        >
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-200 ${
                        userMenuOpen ? "transform rotate-180" : ""
                      } ${
                        scrolled
                          ? "text-[var(--color-txt-secondary)]"
                          : "text-white"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-[var(--shadow-card)] py-1 z-10 animate-fadeIn">
                      <div className="border-b border-[var(--color-form-inputBorder)] pb-2 px-4 pt-2">
                        <p className="text-sm font-medium text-[var(--color-txt-primary)] truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-[var(--color-txt-tertiary)] truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-[var(--color-txt-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary),white_95%)] hover:text-[var(--color-primary)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/media"
                        className="block px-4 py-2 text-sm text-[var(--color-txt-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary),white_95%)] hover:text-[var(--color-primary)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Media
                      </Link>
                      <Link
                        to="/upload-media"
                        className="block px-4 py-2 text-sm text-[var(--color-txt-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary),white_95%)] hover:text-[var(--color-primary)]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Upload Media
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-[var(--color-form-inputBorder)]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`font-medium transition-colors duration-200 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)] hover:text-[var(--color-primary)]"
                      : "text-white hover:text-[color-mix(in_srgb,white,var(--color-primary)_30%)]"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                    scrolled
                      ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-card)]"
                      : "bg-white text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,white,var(--color-primary)_95%)]"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${
                scrolled ? "text-[var(--color-txt-secondary)]" : "text-white"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <Link
              to="/trips"
              className={`block py-2 font-medium text-lg hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] px-3 rounded-lg mb-1 ${
                scrolled ? "text-[var(--color-txt-secondary)]" : "text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore Trips
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block py-2 font-medium text-lg hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] px-3 rounded-lg mb-1 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)]"
                      : "text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/media"
                  className={`block py-2 font-medium text-lg hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] px-3 rounded-lg mb-1 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)]"
                      : "text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Media
                </Link>
                <Link
                  to="/upload-media"
                  className={`block py-2 font-medium text-lg hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] px-3 rounded-lg mb-1 ${
                    scrolled
                      ? "text-[var(--color-txt-secondary)]"
                      : "text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload Media
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`block py-2 font-medium text-lg hover:bg-[color-mix(in_srgb,var(--color-primary),transparent_90%)] px-3 rounded-lg mb-1 ${
                      scrolled
                        ? "text-[var(--color-txt-secondary)]"
                        : "text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`w-full text-left py-2 px-3 font-medium text-lg rounded-lg ${
                    scrolled
                      ? "text-red-600 hover:bg-red-50"
                      : "text-red-200 hover:text-red-100 hover:bg-red-900"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link
                  to="/login"
                  className={`text-center py-2 font-medium rounded-lg ${
                    scrolled
                      ? "text-[var(--color-primary)] border border-[var(--color-primary)]"
                      : "bg-[color-mix(in_srgb,var(--color-primary),black_30%)] text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`text-center py-2 font-medium rounded-lg ${
                    scrolled
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-white text-[var(--color-primary)]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
