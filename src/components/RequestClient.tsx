"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import RequestActions from "./RequestActions";
import ReasonModal from "./ReasonModal";
import editReason from "@/libs/editReason"; // ตรวจสอบว่า import ถูกต้อง

interface RequestClientProps {
  requests: RequestItem[];
  role: string;
  token: string;
}

export default function RequestClient({ requests, role, token }: RequestClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [modalInitialReason, setModalInitialReason] = useState<string>(""); // State สำหรับ reason เริ่มต้นใน modal

  // แก้ไข: รับ reason เข้ามาด้วย
  const handleOpenModal = (requestId: string, reason: string | null | undefined) => {
    setSelectedRequestId(requestId);
    setModalInitialReason(reason || ""); // ตั้งค่า reason เริ่มต้น (ถ้าไม่มีให้เป็นสตริงว่าง)
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    setModalInitialReason(""); // Reset reason เมื่อปิด modal
  };

  // เพิ่ม: Function สำหรับจัดการการ Save จาก Modal
  const handleSaveReason = async (newReason: string) => {
    if (!selectedRequestId || !token) {
      console.error("Missing requestId or token for saving reason.");
      alert("Could not save reason: Missing information.");
      return; // ออกจากฟังก์ชันถ้าข้อมูลไม่ครบ
    }

    try {
      await editReason(selectedRequestId, token, newReason);
      alert("Reason saved successfully!");
      handleCloseModal(); // ปิด Modal หลัง Save สำเร็จ
      // TODO: พิจารณา revalidate หรือ refetch ข้อมูล requests ใหม่เพื่อให้เห็นการเปลี่ยนแปลงทันที
      // เช่น อาจจะต้องใช้ router.refresh() หรือ state management อื่นๆ
    } catch (error) {
      console.error("Failed to save reason:", error);
      alert(`Failed to save reason: ${error instanceof Error ? error.message : "Unknown error"}`);
      // ไม่ต้องปิด Modal ถ้า Save ไม่สำเร็จ เพื่อให้ user ลองใหม่ได้
    }
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
            <div className="text-center">Shop name</div>
            <div className="text-center">User</div>
            <div className="text-center">Date of Creation</div>
            <div className="text-center mr-4">Status</div>
            <div className="text-center">Actions</div> {/* เพิ่ม Header สำหรับ Actions */}
          </div>

          {/* Request Items */}
          {requests.map((request) => (
            <li
              key={request._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-5 gap-8 text-gray-700 items-center">
                <div className="mr-3 text-center">{request.shop?.name || 'N/A'}</div> {/* Handle potential missing shop */}
                <div className="text-center">{request.user?.name || 'N/A'}</div> {/* Handle potential missing user */}
                <div className="text-center">{new Date(request.createdAt).toLocaleDateString()}</div>
                <div className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {/* Reason and Actions */}
                <div className="flex justify-center items-center gap-2">
                  {/* แสดงไอคอนเฉพาะเมื่อมี reason */}
                  {request.reason ? (
                    <ExclamationTriangleIcon
                      className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800"
                      title="View/Edit Reason" // เพิ่ม title เพื่อ accessibility
                      onClick={() => handleOpenModal(request._id, request.reason)} // ส่ง reason ไปด้วย
                    />
                  ) : (
                    // ถ้าไม่มี reason ให้แสดงช่องว่างเพื่อให้ layout ตรงกัน
                    <div className="h-5 w-5 invisible" />
                  )}
                  <RequestActions
                    requestId={request._id}
                    isShopOwner={role === "shopOwner"} // ส่ง role ไปแทน แล้วให้ RequestActions จัดการเอง
                    role={role}
                    status={request.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal: ส่ง props ที่แก้ไขแล้ว */}
      {isModalOpen && selectedRequestId && (
        <ReasonModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          // requestId={selectedRequestId} // ไม่จำเป็นต้องส่งถ้า onSave จัดการ
          // token={token} // ไม่จำเป็นต้องส่งถ้า onSave จัดการ
          role={role}
          initialReason={modalInitialReason} // ส่ง reason เริ่มต้น
          onSave={handleSaveReason} // ส่ง function save
        />
      )}
    </div>
  );
}
