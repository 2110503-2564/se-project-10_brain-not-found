"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import RequestActions from "./RequestActions";
import ReasonModal from "./ReasonModal"; // import ReasonModal

interface User {
  name: string;
}

interface ShopItem {
  name: string;
}

interface RequestItem {
  shop: ShopItem;
  _id: string;
  user: User;
  createdAt: Date;
  reason: string;
  status: string;
}

interface RequestClientProps {
  requests: RequestItem[];
  isShopOwner: boolean;
}

// function wrapText(text: string, lineLength: number = 20): string[] {
//   const result = [];
//   for (let i = 0; i < text.length; i += lineLength) {
//     result.push(text.slice(i, i + lineLength));
//   }
//   return result;
// }

export default function RequestClient({ requests, isShopOwner }: RequestClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  const handleOpenModal = (reason: string) => {
    setSelectedReason(reason);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReason(null);
  };

  const handleFilterChange = (newFilter: string) => {
    const newUrl = `${pathname}?filter=${newFilter}`;
    setCurrentFilter(newFilter);
    router.push(newUrl);
  };
  const filterOptions = ["all", "pending", "approved", "rejected"];

  return (
    <div className="p-5 space-y-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Your Requests
      </h1>
      <div className="flex justify-end mb-6">
        <label htmlFor="statusFilter" className="mr-2 self-center text-gray-700 font-medium ">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={currentFilter} // Set the current value
          onChange={(e) => handleFilterChange(e.target.value)} // Handle change
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {filterOptions.map((filterValue) => (
            <option key={filterValue} value={filterValue}>
              {/* Capitalize the first letter for display */}
              {filterValue.charAt(0).toUpperCase() + filterValue.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          You have no pending requests.
        </div>
      ) : (
        <ul className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-8 text-gray-700 font-semibold border-b pb-2 mb-4">
            <div className="text-center">Shop name</div>
            <div className="text-center">User</div>
            <div className="text-center">Date of Creation</div>
            <div className="text-center mr-4">Status</div>
          </div>

          {/* Request Items */}
          {requests.map((request) => (
            <li
              key={request._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-5 gap-8 text-gray-700">
                <div className="mr-3 text-center">{request.shop?.name}</div>
                <div className="text-center">{request.user.name}</div>
                <div className="text-center">{new Date(request.createdAt).toLocaleDateString()}</div>
                <div className="text-center">{request.status}</div>

                <div className="flex space-x-2 items-center justify-center mr-20">
                  {request.reason ? (
                    // Render the icon if reason exists (e.g., status is 'rejected')
                    <div className="relative group">
                      <ExclamationTriangleIcon
                        className="h-5 w-5 text-red-600 cursor-pointer"
                        onClick={() => handleOpenModal(request.reason)} // เปิดโมดัลเมื่อคลิก
                      />
                    </div>
                  ) : (
                    // Render an invisible placeholder div with the same size if no reason (e.g., status is 'pending')
                    // This reserves the space so the alignment is consistent
                    <div className="h-5 w-5 invisible"></div>
                  )}
                  <RequestActions requestId={request._id} isShopOwner={isShopOwner} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* แสดง ReasonModal เมื่อ isModalOpen เป็น true */}
      {isModalOpen && selectedReason && (
        <ReasonModal isOpen={isModalOpen} onClose={handleCloseModal} reason={selectedReason} />
      )}
    </div>
  );
}
