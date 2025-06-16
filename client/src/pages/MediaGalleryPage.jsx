import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserMedia, deleteMedia } from "../services/mediaService";

function MediaGalleryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchUserMedia();
  }, []);

  const fetchUserMedia = async () => {
    try {
      setLoading(true);
      const data = await getUserMedia();
      console.log("Fetched media data:", data);
      setMedia(data);
      setError("");
    } catch (err) {
      setError("Failed to load your media. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      await deleteMedia(mediaId);
      setMedia(media.filter((item) => item._id !== mediaId));
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(null);
      }
    } catch (err) {
      alert("Failed to delete media");
      console.error(err);
    }
  };

  const openMediaDetail = (media) => {
    setSelectedMedia(media);
  };

  const closeMediaDetail = () => {
    setSelectedMedia(null);
  };

  const getFullImageUrl = (item) => {
    if (!item?.mediaUrl) return "/placeholder-image.jpg";

    if (item.mediaUrl.startsWith("http")) {
      return item.mediaUrl;
    }

    // Direct path to file (should start with /)
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    return `${baseUrl}${item.mediaUrl}`;
  };

  const handleImageError = (itemId, event) => {
    console.error(`Error loading image for item ${itemId}:`, event);
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));

    // Try with a different approach if the original URL failed
    const targetImage = event.target;
    const originalSrc = targetImage.src;

    console.log(`Image failed to load: ${originalSrc}`);

    // If we're already using a placeholder, don't try again
    if (originalSrc.includes("placeholder-image.jpg")) return;

    targetImage.src = "/placeholder-image.jpg";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Media Gallery</h1>
        <Link
          to="/media/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
        >
          Upload New Media
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p>{error}</p>
          <button
            onClick={fetchUserMedia}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try Again
          </button>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-xl text-gray-700 mb-4">
            You haven't uploaded any media yet
          </h2>
          <Link
            to="/media/upload"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Upload your first photo or video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => openMediaDetail(item)}
              >
                {item.mediaType === "Photo" ? (
                  imageErrors[item._id] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      Image not available
                    </div>
                  ) : (
                    <img
                      src={getFullImageUrl(item)}
                      alt={item.description || "Photo"}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(item._id, e)}
                    />
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={getFullImageUrl(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(item._id, e)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black bg-opacity-50 rounded-full p-3">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8 5v10l7-5-7-5z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-gray-800 truncate">
                  {item.description || "No description"}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  {item.rideId && (
                    <Link
                      to={`/trips/${item.rideId._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Trip
                    </Link>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(item._id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-medium">
                {selectedMedia.description || "Media Detail"}
              </h3>
              <button
                onClick={closeMediaDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {selectedMedia.mediaType === "Photo" ? (
                imageErrors[selectedMedia._id] ? (
                  <div className="w-full h-[60vh] bg-gray-200 flex items-center justify-center text-gray-500">
                    Image not available
                  </div>
                ) : (
                  <img
                    src={getFullImageUrl(selectedMedia)}
                    alt={selectedMedia.description || "Photo"}
                    className="max-w-full max-h-[60vh] mx-auto"
                    onError={(e) => handleImageError(selectedMedia._id, e)}
                  />
                )
              ) : (
                <video
                  src={getFullImageUrl(selectedMedia)}
                  className="max-w-full max-h-[60vh] mx-auto"
                  controls
                  onError={(e) => handleImageError(selectedMedia._id, e)}
                />
              )}
              <div className="mt-4">
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">Description: </span>
                  {selectedMedia.description || "No description"}
                </p>
                {selectedMedia.rideId && (
                  <p className="text-gray-800">
                    <span className="font-medium">Trip: </span>
                    <Link
                      to={`/trips/${selectedMedia.rideId._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedMedia.rideId.title || "View Trip"}
                    </Link>
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-gray-500 text-sm break-all">
                    <span className="font-medium">Path: </span>
                    {selectedMedia.mediaUrl}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-medium">Full URL: </span>
                    <a
                      href={getFullImageUrl(selectedMedia)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {getFullImageUrl(selectedMedia)}
                    </a>
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDeleteMedia(selectedMedia._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-300"
                  >
                    Delete Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaGalleryPage;
