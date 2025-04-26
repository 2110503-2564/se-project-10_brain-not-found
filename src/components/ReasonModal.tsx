"use client";

import React from "react";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

export default function ReasonModal({ isOpen, onClose, reason }: ReasonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          The Reason why Rejected
        </h2>
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none"
          readOnly
          value={reason}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
