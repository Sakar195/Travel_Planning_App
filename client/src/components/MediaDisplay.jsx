import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRideMedia, deleteMedia } from "../services/mediaService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { TrashIcon } from "@heroicons/react/24/outline";

function MediaDisplay({ rideId, tripImages = [] }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    const fetchRideMedia = async () => {
      if (!rideId) return;

      try {
        setLoading(true);
        const data = await getRideMedia(rideId);
        setMedia(data);
        setError("");
      } catch (err) {
        console.error("Error fetching media:", err);
        // Don't set error if we have fallback images
        if (!tripImages || tripImages.length === 0) {
          setError("Failed to load media from server");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRideMedia();
  }, [rideId, tripImages]);

  // Create media items from tripImages if no media from API
  const getDisplayMedia = () => {
    if (media && media.length > 0) {
      return media;
    } else if (tripImages && tripImages.length > 0) {
      // Convert trip images to compatible format
      return tripImages.map((imageUrl, index) => ({
        _id: `trip-image-${index}`,
        mediaType: "Photo",
        mediaUrl: imageUrl,
        description: "Trip photo",
        isFromTripImages: true // Flag to handle differently
      }));
    }
    return [];
  };

  const displayMedia = getDisplayMedia();

  const openMediaDetail = (media) => {
    setSelectedMedia(media);
  };

  const closeMediaDetail = () => {
    setSelectedMedia(null);
  };

  const handleUploadClick = () => {
    navigate(`/media/upload?rideId=${rideId}`);
  };

  // Format media URL based on where it's from
  const formatMediaUrl = (mediaItem) => {
    if (mediaItem.isFromTripImages) {
      // Direct trip images might be full URLs or relative paths
      return mediaItem.mediaUrl.startsWith('http') 
        ? mediaItem.mediaUrl 
        : mediaItem.mediaUrl.startsWith('/') 
          ? `http://localhost:5001${mediaItem.mediaUrl}`
          : mediaItem.mediaUrl;
    } else {
      // Media from API
      return mediaItem.mediaUrl.startsWith('http')
        ? mediaItem.mediaUrl
        : `http://localhost:5001${mediaItem.mediaUrl}`;
    }
  };

  const handleDeleteMedia = async (e, mediaId) => {
    e.preventDefault(); // Prevent triggering modal open
    e.stopPropagation(); // Prevent triggering modal open

    if (!window.confirm("Are you sure you want to delete this media?")) {
      return;
    }

    setDeletingMediaId(mediaId);
    try {
      await deleteMedia(mediaId);
      setMedia((prevMedia) => prevMedia.filter((item) => item._id !== mediaId));
      // If the deleted media was selected in the modal, close it
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(null);
      }
      toast.success("Media deleted successfully!");
    } catch (err) {
      console.error("Error deleting media:", err);
      toast.error(err.response?.data?.message || "Failed to delete media.");
      // Optionally set a component-level error state if needed
      // setError("Failed to delete media.");
    } finally {
      setDeletingMediaId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && displayMedia.length === 0) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
        <p className="mb-3">{error}</p>
        {rideId && (
          <button
            onClick={handleUploadClick}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-300 shadow hover:shadow-lg"
          >
            Add Photos/Videos
          </button>
        )}
      </div>
    );
  }

  if (displayMedia.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
        <p className="text-gray-600 mb-3">
          No photos or videos for this trip yet
        </p>
        {rideId ? (
          <button
            onClick={handleUploadClick}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-300 shadow hover:shadow-lg"
          >
            Add Photos/Videos
          </button>
        ) : (
          <Link
            to="/upload-media"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-300 shadow hover:shadow-lg"
          >
            Add Photos/Videos
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Photos & Videos
        </h3>
        {rideId && (
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-300 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Media
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayMedia.map((item) => {
          // Determine if the current user can delete this item
          // Only if it's not a placeholder from tripImages and the user is the uploader
          const canDelete = !item.isFromTripImages && user && item.userId && typeof item.userId === 'object' && item.userId._id === user._id;
          
          return (
            <div
              key={item._id}
              className="relative group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div 
                className="cursor-pointer" 
                onClick={() => openMediaDetail(item)} // Open modal on image/video click
              >
                {item.mediaType === "Photo" ? (
                  <img
                    src={formatMediaUrl(item)}
                    alt={item.description || "Trip photo"}
                    className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.warn(`Failed to load image: ${formatMediaUrl(item)}`);
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                ) : (
                  <div className="relative w-full h-36">
                    <video
                      src={formatMediaUrl(item)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-2 text-white w-full truncate">
                    {item.description || "View"}
                  </div>
                </div>
              </div>
              
              {/* Conditionally render delete button */}
              {canDelete && (
                  <button
                      onClick={(e) => handleDeleteMedia(e, item._id)}
                      disabled={deletingMediaId === item._id}
                      className={`absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white 
                                  hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 
                                  transition-all duration-200 ease-in-out 
                                  disabled:opacity-50 disabled:cursor-not-allowed z-10`}
                      aria-label="Delete Media"
                  >
                      {deletingMediaId === item._id ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                          <TrashIcon className="h-4 w-4" />
                      )}
                  </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-800">
                {selectedMedia.description || "Media Detail"}
              </h3>
              <button
                onClick={closeMediaDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              {selectedMedia.mediaType === "Photo" ? (
                <img
                  src={formatMediaUrl(selectedMedia)}
                  alt={selectedMedia.description || "Photo"}
                  className="max-w-full max-h-[60vh] mx-auto rounded shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              ) : (
                <video
                  src={formatMediaUrl(selectedMedia)}
                  className="max-w-full max-h-[60vh] mx-auto rounded shadow"
                  controls
                />
              )}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                {selectedMedia.description && (
                  <p className="text-gray-800 mb-2">
                    <span className="font-medium">Description: </span>
                    {selectedMedia.description}
                  </p>
                )}
                {selectedMedia.userId && !selectedMedia.isFromTripImages && (
                  <p className="text-gray-800">
                    <span className="font-medium">Shared by: </span>
                    {selectedMedia.userId.firstName || ''}{" "}
                    {selectedMedia.userId.lastName || ''}
                    {selectedMedia.userId.username &&
                      ` (@${selectedMedia.userId.username})`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaDisplay;
