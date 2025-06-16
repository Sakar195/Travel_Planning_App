import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { uploadMedia } from "../services/mediaService";
import { getMyTrips } from "../services/tripService";

function MediaUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rideIdFromUrl = queryParams.get("rideId");

  const [formData, setFormData] = useState({
    mediaType: "Photo",
    description: "",
    rideId: rideIdFromUrl || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    // Load user's trips for dropdown
    const fetchTrips = async () => {
      try {
        const data = await getMyTrips();
        setTrips(data);
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        setTripsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Validate file type
    const fileType = selectedFile.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      setError("Please select an image or video file");
      setFile(null);
      setPreview(null);
      return;
    }

    // Update mediaType based on file type
    setFormData((prev) => ({
      ...prev,
      mediaType: fileType === "image" ? "Photo" : "Video",
    }));

    setFile(selectedFile);

    // Create preview
    if (fileType === "image") {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For video, create an object URL
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create form data object for file upload
      const uploadFormData = new FormData();

      // Add the file with field name "media" as expected by the server
      uploadFormData.append("media", file);
      uploadFormData.append("mediaType", formData.mediaType);
      uploadFormData.append("description", formData.description);

      if (formData.rideId) {
        uploadFormData.append("rideId", formData.rideId);
      }

      // Use the mediaService uploadMedia function which handles the upload correctly
      await uploadMedia(uploadFormData);
      navigate("/media");
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Media</h1>
        <p className="text-gray-600">
          Share your photos and videos from your trips
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="mediaFile"
              className="block text-gray-700 font-medium mb-2 cursor-pointer"
            >
              Select File
            </label>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors duration-300 cursor-pointer">
              <input
                type="file"
                id="mediaFile"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {!preview ? (
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    Drag and drop your photo or video here, or click to browse
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Supported formats: JPG, PNG, MP4, etc.
                  </p>
                </div>
              ) : formData.mediaType === "Photo" ? (
                <div className="flex justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 rounded shadow-sm"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <video
                    src={preview}
                    controls
                    className="max-h-64 rounded shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              rows="3"
              placeholder="Tell us about this photo or video..."
            ></textarea>
          </div>

          {/* Only show the dropdown if no rideId was passed in the URL */}
          {!rideIdFromUrl && (
            <div className="mb-6">
              <label
                htmlFor="rideId"
                className="block text-gray-700 font-medium mb-2"
              >
                Associated Trip (Optional)
              </label>
              <select
                id="rideId"
                name="rideId"
                value={formData.rideId} // This will be empty if rideIdFromUrl is not present
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">-- Select a Trip --</option>
                {tripsLoading ? (
                  <option disabled>Loading trips...</option>
                ) : trips.length === 0 ? (
                  <option disabled>No trips available</option>
                ) : (
                  trips.map((trip) => (
                    <option key={trip._id} value={trip._id}>
                      {trip.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className={`px-5 py-2 text-white rounded-lg transition-all duration-300 ${
                loading || !file
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload Media"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MediaUploadPage;
