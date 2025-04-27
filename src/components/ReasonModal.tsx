import React, { useState, useEffect } from "react";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReason: string;
  onSave: (newReason: string) => void;
  role: string;
  status: string; // <--- เพิ่ม status prop
}

// รับ status เข้ามาใน props
export default function ReasonModal({ isOpen, onClose, initialReason, onSave, role, status }: ReasonModalProps) {
  const [reason, setReason] = useState(initialReason);
  // ไม่ต้องใช้ isPending แล้ว ลบออกได้
  // const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setReason(initialReason); // รีเซตตอน modal เปิดใหม่
  }, [initialReason]);

  // ไม่ต้องใช้ useEffect ที่เกี่ยวกับ isPending แล้ว ลบออกได้
  // useEffect(() => {
  //   if (initialReason && initialReason.startsWith("[PENDING]")) {
  //     setIsPending(true);
  //   } else {
  //     setIsPending(false);
  //   }
  // }, [initialReason]);

  const handleSave = () => {
    // เพิ่มการตรวจสอบ status ก่อนเรียก onSave เพื่อความปลอดภัย (แม้ปุ่มจะถูกซ่อน)
    if (status === 'pending') {
        console.warn("Attempted to save reason while status is pending. Action blocked.");
        return;
    }
    onSave(reason);
  };

  if (!isOpen) return null;

  // ตรวจสอบสถานะ pending โดยตรงจาก prop 'status'
  const isPendingStatus = status === 'pending';

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Reason</h2>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          // ใช้ isPendingStatus ในการ disable
          disabled={isPendingStatus}
          className={`w-full border p-2 rounded-md resize-none h-32 focus:outline-none ${
            // ใช้ isPendingStatus ในการกำหนด class
            isPendingStatus ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
        />

        <div className="flex justify-end space-x-2 mt-4">
          {/* ปุ่ม Save แสดงเฉพาะถ้า status *ไม่ใช่* pending */}
          {!isPendingStatus && (
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          )}

          {/* ปุ่ม Close แสดงเสมอ */}
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
