"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Added useSearchParams
import RequestActions from "./RequestActions";
import ReasonModal from "./ReasonModal";
import editReason from "@/libs/editReason"; // ตรวจสอบว่า import ถูกต้อง

// --- Interface Definitions --- (Kept from HEAD)
interface User {
  _id: string; // Assuming user has an ID
  name: string;
}

interface ShopItem {
  _id: string; // Assuming shop has an ID
  name: string;
}

interface RequestItem {
  _id: string;
  shop: ShopItem | null; // Allow shop to be null
  user: User | null; // Allow user to be null
  createdAt: string; // Use string for dates from API
  reason?: string | null; // Reason can be optional or null
  status: string;
  // Add other fields if necessary, e.g., requestType
}

interface RequestClientProps {
  requests: RequestItem[];
  role: string;
  token: string;
}
// --- End Interface Definitions ---

export default function RequestClient({ requests, role, token }: RequestClientProps) {
  // --- State Variables (Combined) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [modalInitialReason, setModalInitialReason] = useState<string>(""); // For modal editing (from HEAD)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Use hook to get search params
  const [currentFilter, setCurrentFilter] = useState<string>(searchParams.get('filter') || 'all'); // Initialize filter from URL
  // --- End State Variables ---

  // Update filter state if URL changes externally
  useEffect(() => {
    setCurrentFilter(searchParams.get('filter') || 'all');
  }, [searchParams]);

  // --- Event Handlers (Combined) ---

  // Use the more detailed handleOpenModal from HEAD
  const handleOpenModal = (requestId: string, reason: string | null | undefined) => {
    setSelectedRequestId(requestId);
    setModalInitialReason(reason || ""); // Set initial reason (empty string if null/undefined)
    setIsModalOpen(true);
  };

  // handleCloseModal from HEAD
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    setModalInitialReason(""); // Reset reason on close
  };

  // handleSaveReason from HEAD
  const handleSaveReason = async (newReason: string) => {
    if (!selectedRequestId || !token) {
      console.error("Missing requestId or token for saving reason.");
      alert("Could not save reason: Missing information.");
      return;
    }

    try {
      await editReason(selectedRequestId, token, newReason);
      alert("Reason saved successfully!");
      handleCloseModal(); // Close modal on success
      // Revalidate data by refreshing the page with current filters
      router.refresh(); // Next.js 13+ way to re-fetch server component data
    } catch (error) {
      console.error("Failed to save reason:", error);
      alert(`Failed to save reason: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Keep modal open on failure
    }
  };

  // handleFilterChange from 7668f81...
  const handleFilterChange = (newFilter: string) => {
    const newUrl = `${pathname}?filter=${newFilter}`;
    // setCurrentFilter(newFilter); // No need to set here, useEffect handles it
    router.push(newUrl, { scroll: false }); // Use scroll: false to avoid jumping to top
  };
  // --- End Event Handlers ---

  const filterOptions = ["all", "pending", "approved", "rejected"];

  return (
    <div className="p-5 space-y-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Your Requests
      </h1>

      {/* Filter Dropdown (from 7668f81...) */}
      <div className="flex justify-end mb-6">
        <label htmlFor="statusFilter" className="mr-2 self-center text-gray-700 font-medium ">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={currentFilter} // Controlled component
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {filterOptions.map((filterValue) => (
            <option key={filterValue} value={filterValue}>
              {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          You have no requests matching the filter "{currentFilter}".
        </div>
      ) : (
        <ul className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-8 text-gray-700 font-semibold border-b pb-2 mb-4">
            <div className="text-center">Shop name</div>
            <div className="text-center">User</div>
            <div className="text-center">Date of Creation</div>
            <div className="text-center mr-4">Status</div>
            <div className="text-center">Actions</div> {/* Header for Actions */}
          </div>

          {/* Request Items */}
          {requests.map((request) => (
            <li
              key={request._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-5 gap-8 text-gray-700 items-center">
                {/* Use optional chaining and provide fallback 'N/A' */}
                <div className="mr-3 text-center">{request.shop?.name || 'N/A'}</div>
                <div className="text-center">{request.user?.name || 'N/A'}</div>
                <div className="text-center">{new Date(request.createdAt).toLocaleDateString()}</div>

                {/* Status Display (Styled version from HEAD) */}
                <div className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800" // Default/pending style
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                {/* Reason Icon and Actions Dropdown (Layout from HEAD) */}
                <div className="flex justify-center items-center gap-2">
                  {/* Show icon only if reason exists */}
                  {request.reason ? (
                    <ExclamationTriangleIcon
                      className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800"
                      title="View/Edit Reason" // Accessibility title
                      onClick={() => handleOpenModal(request._id, request.reason)} // Use updated handler
                    />
                  ) : (
                    // Placeholder for alignment if no reason
                    <div className="h-5 w-5 invisible" />
                  )}
                  <RequestActions
                    requestId={request._id}
                    // Pass role directly, let RequestActions determine isShopOwner if needed
                    role={role}
                    isShopOwner={role === "shopOwner"} // Pass role instead
                    status={request.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal Rendering (from HEAD) */}
      {isModalOpen && selectedRequestId && (
        <ReasonModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          role={role}
          initialReason={modalInitialReason} // Pass initial reason
          onSave={handleSaveReason} // Pass save handler
        />
      )}
    </div>
  );
}
