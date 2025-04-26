"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
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

function wrapText(text: string, lineLength: number = 20): string[] {
  const result = [];
  for (let i = 0; i < text.length; i += lineLength) {
    result.push(text.slice(i, i + lineLength));
  }
  return result;
}

export default function RequestClient({ requests, isShopOwner }: RequestClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleOpenModal = (reason: string) => {
    setSelectedReason(reason);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReason(null);
  };

  return (
    <div className="p-5 space-y-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Your Requests
      </h1>
      {requests.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          You have no pending requests.
        </div>
      ) : (
        <ul className="space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-8 text-gray-700 font-semibold border-b pb-2 mb-4">
            <div>Shop name</div>
            <div>User</div>
            <div>Date of Creation</div>
            <div>Status</div>
          </div>

          {/* Request Items */}
          {requests.map((request) => (
            <li
              key={request._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-5 gap-8 text-gray-700">
                <div className="ml-4">{request.shop?.name}</div>
                <div>{request.user.name}</div>
                <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                <div>{request.status}</div>

                <div className="flex space-x-2 items-center justify-center mr-20">
                  {request.reason && (
                    <div className="relative group">
                      <ExclamationTriangleIcon
                        className="h-5 w-5 text-red-600 cursor-pointer"
                        onClick={() => handleOpenModal(request.reason)} // เปิดโมดัลเมื่อคลิก
                      />
                    </div>
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
