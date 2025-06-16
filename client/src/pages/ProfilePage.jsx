import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import ErrorMessage from "../components/Common/ErrorMessage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getUserMedia } from "../services/mediaService";
import { Link } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    profilePicture: "", // URL or path
    // Add other fields based on your User model (e.g., address)
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Populate form with user data once available
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        profilePicture: user.profilePicture || "",
        // Add other fields
      });
    }
  }, [user]);

  // Add new useEffect for fetching media
  useEffect(() => {
    const fetchUserMedia = async () => {
      if (!user) return;

      try {
        setMediaLoading(true);
        const mediaData = await getUserMedia();
        setMedia(mediaData);
      } catch (err) {
        setMediaError("Failed to load your media");
        console.error("Error fetching user media:", err);
      } finally {
        setMediaLoading(false);
      }
    };

    fetchUserMedia();
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      // API endpoint from requirement.dmd Section 3
      // Ensure you send only fields that should be updatable
      // The backend route might use req.user.id, so sending userId might not be needed
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        // Don't send email/password unless you have specific update routes for them
        profilePicture: profileData.profilePicture,
      };

      const response = await api.put("/users/profile", updateData);
      toast.success("Profile updated successfully!");
      // Optionally update the user in AuthContext if the response contains updated user data
      console.log("Update response:", response.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      console.error("Profile update error:", err.response || err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      // Add more robust password validation if needed
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      // Assuming endpoint is /users/change-password
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      // Clear password fields after success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to change password.";
      toast.error(message);
      console.error("Password change error:", err.response || err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl bg-blue-50/30">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-txt-primary)] mb-8 text-center">
        My Profile
      </h1>
      <div className="bg-white/95 p-6 md:p-8 rounded-lg shadow-md border border-[var(--color-border)] mb-8 bg-blue-50/40">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex flex-col items-center border-b border-[var(--color-border)] pb-6">
            {/* Display Initials Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--color-primary)] flex items-center justify-center mb-6 shadow">
              <span className="text-3xl md:text-4xl font-semibold text-white uppercase">
                {(profileData.firstName?.[0] || "") +
                  (profileData.lastName?.[0] || "") ||
                  user?.username?.[0] ||
                  "U"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="firstName"
              label="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              placeholder="Enter your first name"
            />
            <Input
              id="lastName"
              label="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              placeholder="Enter your last name"
            />
          </div>
          <Input
            id="username"
            label="Username"
            name="username"
            value={profileData.username}
            onChange={handleProfileChange}
            required
            placeholder="Enter your username"
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            name="email"
            value={profileData.email}
            disabled
            readOnly
            className="cursor-not-allowed bg-gray-50/50"
            placeholder="Your email address"
          />

          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              disabled={profileLoading}
              className="w-full md:w-auto px-8"
            >
              {profileLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
      {/* Change Password Card */}
      <div className="bg-white/95 p-6 md:p-8 rounded-lg shadow-md border border-[var(--color-border)] bg-blue-50/40">
        <h2 className="text-xl font-semibold text-[var(--color-txt-primary)] mb-6 border-b border-[var(--color-border)] pb-3">
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password Input with Toggle */}
          <div className="relative">
            <Input
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              type={showPasswords ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter your current password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-600 hover:text-[var(--color-primary)]"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* New Password Input with Toggle */}
          <div className="relative">
            <Input
              id="newPassword"
              label="New Password"
              name="newPassword"
              type={showPasswords ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter a new password (min. 8 characters)"
              className="pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-600 hover:text-[var(--color-primary)]"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm New Password Input with Toggle */}
          <div className="relative">
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Confirm your new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-600 hover:text-[var(--color-primary)]"
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              variant="secondary"
              disabled={passwordLoading}
              className="w-full md:w-auto px-8"
            >
              {passwordLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </div>
      {/* Media Gallery Section */}
      <div className="bg-white/95 p-6 md:p-8 rounded-lg shadow-md border border-[var(--color-border)] bg-blue-50/40">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[var(--color-txt-primary)]">
            My Media Gallery
          </h2>
          <Link
            to="/media/upload"
            className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors duration-300"
          >
            Upload New Media
          </Link>
        </div>

        {mediaLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : mediaError ? (
          <div className="text-center py-8">
            <ErrorMessage message={mediaError} />
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-lg">
            <p className="text-[var(--color-txt-secondary)] mb-4">
              You haven't shared any photos or videos yet.
            </p>
            <Link
              to="/media/upload"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline"
            >
              Share your first media
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item._id}
                className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {item.mediaType === "Photo" ? (
                  <img
                    src={
                      item.mediaUrl.startsWith("http")
                        ? item.mediaUrl
                        : `${
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:5001"
                          }${item.mediaUrl}`
                    }
                    alt={item.description || "Uploaded media"}
                    className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.warn(`Failed to load image: ${item.mediaUrl}`);
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <video
                    src={
                      item.mediaUrl.startsWith("http")
                        ? item.mediaUrl
                        : `${
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:5001"
                          }${item.mediaUrl}`
                    }
                    className="w-full h-36 object-cover"
                    controls
                  />
                )}

                {/* Media Info Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="text-white text-sm">
                    {item.description && (
                      <p className="line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  {item.rideId && (
                    <Link
                      to={`/trips/${item.rideId._id}`}
                      className="text-white text-xs hover:underline mt-2"
                    >
                      View Trip: {item.rideId.title}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
