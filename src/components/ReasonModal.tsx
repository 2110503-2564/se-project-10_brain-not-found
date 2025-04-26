// src/components/ReasonModal.tsx
import React, { useEffect, useState } from "react";
// ไม่ต้อง import fetchReason และ editReason ที่นี่แล้ว

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // requestId: string; // อาจจะไม่จำเป็นต้องใช้ใน Modal โดยตรงแล้ว ถ้า onSave จัดการเรื่อง ID
  // token: string; // ไม่จำเป็นต้องใช้ใน Modal โดยตรงแล้ว
  role: string;
  initialReason: string; // รับค่า reason เริ่มต้น
  onSave: (newReason: string) => Promise<void>; // รับ function สำหรับ save
}

export default function ReasonModal({
  isOpen,
  onClose,
  role,
  initialReason, // ใช้ initialReason ที่รับมา
  onSave, // ใช้ onSave ที่รับมา
}: ReasonModalProps) {
  // ใช้ initialReason เป็นค่าเริ่มต้นของ localReason
  // ใช้ useEffect เพื่อ reset ค่าเมื่อ initialReason เปลี่ยน (กรณีเปิด modal ซ้ำสำหรับ request อื่น)
  const [localReason, setLocalReason] = useState(initialReason);
  const [isSaving, setIsSaving] = useState(false); // เพิ่ม state สำหรับ loading ตอน save

  useEffect(() => {
    if (isOpen) {
      setLocalReason(initialReason); // Reset state เมื่อ modal เปิด หรือ initialReason เปลี่ยน
    }
  }, [isOpen, initialReason]);

  const handleSaveClick = async () => {
    setIsSaving(true); // เริ่ม loading
    try {
      await onSave(localReason); // เรียก onSave ที่ส่งมาจาก RequestClient
      // onClose(); // ปิด modal (RequestClient ควรจัดการปิดเองหลัง save สำเร็จ)
    } catch (error) {
      // alert("Failed to save reason"); // RequestClient ควรจัดการ error message
      console.error("Save failed in modal:", error);
    } finally {
      setIsSaving(false); // สิ้นสุด loading
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Reason</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <textarea
          className="w-full border border-gray-300 rounded p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
          value={localReason}
          onChange={(e) => setLocalReason(e.target.value)}
          readOnly={role !== "admin"} // Admin สามารถแก้ไขได้
          rows={6}
          placeholder={role === "admin" ? "Enter reason..." : "No reason provided"}
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150 ease-in-out"
            disabled={isSaving} // Disable ตอนกำลัง save
          >
            Close
          </button>
          {/* แสดงปุ่ม Save เฉพาะ Admin */}
          {role === "admin" && (
            <button
              onClick={handleSaveClick}
              className={`px-4 py-2 rounded text-white transition duration-150 ease-in-out ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={isSaving} // Disable ตอนกำลัง save
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
