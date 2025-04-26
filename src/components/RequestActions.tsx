'use client'
import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

// เพิ่ม prop requestId และ isShopOwner เพื่อใช้ในการตัดสินใจแสดงปุ่ม
export default function RequestActions({ requestId, isShopOwner }: { requestId: string, isShopOwner: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
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
            {isShopOwner ? (
              // ถ้าเป็น shopOwner ให้แสดงปุ่ม Edit และ Delete
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    // Handle edit with requestId
                    console.log(`Edit request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Handle delete with requestId
                    console.log(`Delete request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              // ถ้าไม่ใช่ shopOwner ให้แสดงปุ่ม Approve และ Reject
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    // Handle approve with requestId
                    console.log(`Approve request with ID: ${requestId}`);
                    setIsOpen(false);
                  }}
                >
                  Approve
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Handle reject with requestId
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
