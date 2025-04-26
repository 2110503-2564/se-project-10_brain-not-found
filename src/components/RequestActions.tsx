'use client'
import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";


interface RequestActionsProps {
  requestId: string;
  isShopOwner: boolean;
  role: string;
  status: string;
}

export default function RequestActions({ requestId, isShopOwner, role, status }: RequestActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ถ้า status เป็น pending หรือ approved ไม่ต้องแสดงอะไรเลย
  if (status === "pending" || status === "approved") {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {role === "admin" ? (
              // ตอนนี้ admin ยังไม่ให้แก้ reason เพราะฉะนั้นยังไม่โชว์อะไร
              null
            ) : isShopOwner ? (
              // ถ้าเป็น shopOwner ให้แสดง Edit / Delete
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    console.log(`Edit request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    console.log(`Delete request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              // ถ้าไม่ใช่ shopOwner ให้แสดง Approve / Reject
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    console.log(`Approve request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Approve
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    console.log(`Reject request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
