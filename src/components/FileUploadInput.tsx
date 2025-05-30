// src/components/FileInput.tsx
'use client';

import React from 'react';

interface FileInputProps {
  id: string;
  name: string;
  label: string;
  accept?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string | null; // ชื่อไฟล์/ข้อความสรุปที่เลือก (ส่งมาจาก Parent)
  required?: boolean;
  multiple?: boolean; // Prop สำหรับเปิด/ปิดการเลือกหลายไฟล์
  disabled?: boolean; // Prop สำหรับเปิด/ปิดการใช้งาน
}

const FileUploadInput: React.FC<FileInputProps> = ({
  id,
  name,
  label,
  accept,
  onChange,
  fileName,
  required = false,
  multiple = false, // ค่า default เป็น false
  disabled = false, // ค่า default เป็น false
}) => {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        htmlFor={id}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-full justify-center sm:w-auto"
      >
        {/* ไอคอนอัปโหลด */}
        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 100 2h2.586l-4.293 4.293a1 1 0 001.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M4 16a2 2 0 01-2-2V6a2 2 0 012-2h4a1 1 0 000-2H4a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4v-4a1 1 0 10-2 0v4a2 2 0 01-2 2H4z" />
        </svg>
        เพิ่มไฟล์
        <input
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={onChange}
          className="sr-only"
          required={required && !fileName}
          multiple={multiple} // ใส่ attribute multiple ตาม prop ที่ได้รับ
          disabled={disabled}
        />
      </label>
      {/* แสดงชื่อไฟล์/ข้อความสรุปที่เลือก */}
      {fileName && (
        <p className="mt-2 text-sm text-gray-600 truncate">
          Selected: {fileName}
        </p>
      )}
    </div>
  );
};

export default FileUploadInput;
