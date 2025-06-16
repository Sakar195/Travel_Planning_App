// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import ErrorMessage from "../components/Common/ErrorMessage";
import Card from "../components/Common/Card";
import {
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("🔍 Login Attempt - Input Values:");
    console.log("- Email/Username:", emailOrUsername);
    console.log("- Password:", password ? "********" : "<empty>");

    const loginData = {
      emailOrUsername,
      password,
    };

    console.log(
      "📤 Submitting login data:",
      JSON.stringify(
        loginData,
        (key, value) => (key === "password" ? "********" : value),
        2
      )
    );

    try {
      // API endpoint from requirement.dmd Section 3
      console.log("⏳ Sending login request to /auth/login");
      const response = await api.post("/auth/login", loginData);

      console.log(
        "✅ Login successful! Response:",
        JSON.stringify(response.data, null, 2)
      );

      // Assuming backend returns { token, userId, username, role } as in server/routes/authRoutes.js
      const { token, ...userData } = response.data;

      console.log("🔑 User data received:", JSON.stringify(userData, null, 2));

      login(token, userData); // Update auth context

      // Redirect based on user role
      if (userData.role === "admin") {
        console.log("🧭 Admin user detected. Navigating to /admin");
        navigate("/admin");
      } else {
        console.log("🧭 Standard user detected. Navigating to /dashboard");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login error details:", err);

      if (err.response) {
        console.error("📝 Server response status:", err.response.status);
        console.error(
          "📝 Server response data:",
          JSON.stringify(err.response.data, null, 2)
        );
      }

      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      console.error("📝 Setting error message:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center p-4">
      {/* Background Patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-secondary)]"></div>
        <div className="absolute bottom-12 -left-24 w-64 h-64 rounded-full bg-[var(--color-primary)]"></div>
      </div>

      <Card className="w-full max-w-md animate-slide-up shadow-[var(--shadow-lg)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-sky-100 rounded-full mb-4">
            <ArrowRightOnRectangleIcon className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
            Welcome Back!
          </h2>
          <p className="text-[var(--color-txt-tertiary)] mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <ErrorMessage
              message={error}
              isDismissible={true}
              onDismiss={() => setError(null)}
            />
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-[var(--color-txt-tertiary)]" />
              </div>
              <input
                id="emailOrUsername"
                type="text"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-[var(--color-txt-tertiary)]" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)]"
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            isLoading={loading}
            fullWidth
            size="large"
          >
            {loading ? "Signing in" : "Sign In"}
          </Button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
            <span className="flex-shrink mx-4 text-[var(--color-txt-tertiary)] text-sm">
              or
            </span>
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate("/signup")}
          >
            Create New Account
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
