import React, { useState, useEffect, Fragment, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import {
  adminGetAllTags,
  adminAddTag,
  adminUpdateTag,
  adminDeleteTag,
} from "../../services/adminService";

function ManageTagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    usage: "",
    sortBy: "name",
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({
    name: "",
    description: "",
  });

  const ITEMS_PER_PAGE = 10;

  // Filter tags based on search term and filters
  const filteredTags = useMemo(() => {
    let result = tags.filter((tag) => {
      const matchesSearch =
        searchTerm === ""
          ? true
          : tag.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tag.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply usage filter if selected
      // const matchesUsage = filters.usage === ""
      //   ? true
      //   : tag.usage === filters.usage; // Assuming tag object has a 'usage' field
      // TODO: Add actual 'usage' field to tag model or adjust filtering logic
      const matchesUsage = true; // Placeholder until usage field exists

      return matchesSearch && matchesUsage;
    });

    // Apply sorting
    if (filters.sortBy === "name") {
      result = result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } else if (filters.sortBy === "createdAt") {
      // Assuming tag object has 'createdAt' field
      result = result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [tags, searchTerm, filters]);

  // Get paginated data
  const paginatedTags = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTags.slice(startIndex, endIndex);
  }, [filteredTags, currentPage]);

  // Update total pages based on filtered tags
  useEffect(() => {
    const total = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
    setTotalPages(total > 0 ? total : 1);
    // If current page is greater than total pages, reset to first page
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredTags, currentPage]);

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetAllTags();
      setTags(data.tags || data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setError("Failed to fetch tags.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // Modal functions
  const openAddModal = () => {
    setEditingTag(null);
    setTagForm({
      name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name || "",
      description: tag.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTagFormChange = (e) => {
    const { name, value } = e.target;
    setTagForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagSubmit = async (e) => {
    e.preventDefault();

    if (!tagForm.name) {
      showNotification("Tag name is required", "error");
      return;
    }

    try {
      if (editingTag) {
        await adminUpdateTag(editingTag._id, tagForm);
        showNotification("Tag updated successfully");
      } else {
        await adminAddTag(tagForm);
        showNotification("Tag added successfully");
      }
      closeModal();
      fetchTags();
    } catch (err) {
      console.error("Error saving tag:", err);
      showNotification(err.message || "Failed to save tag", "error");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this tag? This will remove it from all trips using it."
      )
    ) {
      try {
        await adminDeleteTag(tagId);
        showNotification("Tag deleted successfully");
        fetchTags();
      } catch (err) {
        console.error("Error deleting tag:", err);
        showNotification("Failed to delete tag", "error");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title and description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Tags</h1>
        <p className="text-gray-500">
          Create and manage tags used to categorize trips and filter search
          results.
        </p>
      </div>

      {/* Action header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tags by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>{showFilters ? "Hide Filters" : "Filter"}</span>
          </button>
          <button
            onClick={fetchTags}
            className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Tag</span>
          </button>
        </div>
      </div>

      {/* Filter section */}
      <Transition
        show={showFilters}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage
              </label>
              <select
                value={filters.usage}
                onChange={(e) => setFilters({ ...filters, usage: e.target.value })}
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Usages</option> */}
            {/* TODO: Populate options based on actual usage categories */}
            {/* </select> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="block w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="createdAt">Newest First</option>
                {/* TODO: Add createdAt field to tag model for this to work */}
              </select>
            </div>
            {/* Add more filter options here if needed */}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({ usage: "", sortBy: "name" });
                setSearchTerm("");
              }}
              className="text-sm text-sky-600 hover:text-sky-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Transition>

      {/* Notification toast */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-fade-in-right
            ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
        >
          {notification.message}
        </div>
      )}

      {/* Main content with conditional rendering */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-200">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchTags}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      ) : filteredTags.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg border border-[var(--color-border)] overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTags.map((tag, index) => (
                  <tr
                    key={tag._id || index}
                    className="hover:bg-gray-50 animate-fade-in transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {tag.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {tag.description || "No description provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="text-sky-600 hover:text-sky-900 mr-4"
                        title="Edit tag"
                      >
                        <PencilSquareIcon className="h-5 w-5 inline" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete tag"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-[var(--color-border)] mt-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tags found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.usage || filters.sortBy !== "name"
              ? "Try adjusting your search or filters"
              : "Get started by adding a new tag"}
          </p>
          <div className="mt-6">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Tag
            </button>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {filteredTags.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {Math.min(
              filteredTags.length,
              (currentPage - 1) * ITEMS_PER_PAGE + 1
            )}{" "}
            to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTags.length)} of{" "}
            {filteredTags.length} tags
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Tag */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingTag ? "Edit Tag" : "Add New Tag"}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  <form onSubmit={handleTagSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tag Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={tagForm.name}
                        onChange={handleTagFormChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        placeholder="e.g., Mountain Biking, Beginner Friendly"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={tagForm.description}
                        onChange={handleTagFormChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Describe what this tag represents"
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      >
                        {editingTag ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ManageTagsPage;
