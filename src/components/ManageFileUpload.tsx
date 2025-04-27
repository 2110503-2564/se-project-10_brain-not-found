// src/components/FileInput.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';




const getGcsAuthenticatedUrl = (path: string) => {
    const bucket = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || 'brain_not_found_app';
    return `https://storage.cloud.google.com/${bucket}/${path}`;
}

interface FileInputProps {
  id: string;
  name: string;
  label: string;
  accept?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string | null; // ชื่อไฟล์/ข้อความสรุปที่เลือก (ส่งมาจาก Parent)
  required?: boolean;
  multiple?: boolean; // Prop สำหรับเปิด/ปิดการเลือกหลายไฟล์

  existingFiles?: string[]; // รายการไฟล์เดิม
  // --- (Optional) Prop สำหรับ Preview รูปใหม่ ---
  newFileObjects?: File[];
}

const ManageFileUpload: React.FC<FileInputProps> = ({
  id,
  name,
  label,
  accept,
  onChange,
  fileName,
  required = false,
  multiple = false, // ค่า default เป็น false
  existingFiles = [],
  newFileObjects = [],
}) => {

    // console.log(existingFiles);

    const [deletedImageURLs, setDeletedImageURLs] = useState<string[]>([]);
    const [existImageURLs, setExistImageURLs] = useState<string[]>(existingFiles); 

  return (
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      

{/* --- ส่วนแสดงไฟล์เดิม --- */}
{existImageURLs.length > 0 && (
        <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
          <p className="text-sm font-medium text-gray-6 00 mb-2">Current Files:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existImageURLs.filter(file => !deletedImageURLs.includes(file)).map((file) => (
              <div key={file} className="relative group border p-1 rounded shadow-sm">
                
                <img
                  src={name!== 'licenseDocFile'?file:getGcsAuthenticatedUrl(file)} // ใช้ helper function สร้าง URL เต็ม
                  alt={`${name} Picture`}
                  className="object-cover rounded"
                //   onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} // Fallback image
                />
                {/* ปุ่มลบ */}
                  <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault(); 
                        setDeletedImageURLs((prev) => {
                          const updated = deletedImageURLs.includes(file) ? deletedImageURLs : [...prev, file];
                          console.log('--- Updated deletedImageURLs ---');
                          updated.forEach((url, index) => {
                            console.log(`${url}`);
                          });
                          return updated;
                        });
                      }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete ${file}`}
                  >
                    {/* ไอคอนถังขยะ หรือ X */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                 <p className="text-xs text-gray-500 mt-1 truncate w-20" title={file}>{file}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- End ส่วนแสดงไฟล์เดิม --- */}

      {deletedImageURLs.length > 0 && (
  <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
    <p className="text-sm font-medium text-gray-600 mb-2">Deleted Files:</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {deletedImageURLs.map((file) => (
        <div key={file} className="relative group border p-1 rounded shadow-sm">
          <img
            src={name !== 'licenseDocFile' ? file : getGcsAuthenticatedUrl(file)}
            alt={`${name} Picture`}
            className="object-cover rounded"
          />
          {/* ปุ่ม \"ย้อนกลับ\" สำหรับกู้คืน */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setDeletedImageURLs((prev) => prev.filter((url) => url !== file));
            }}
            className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
            aria-label={`Restore ${file}`}
          >
            {/* ไอคอนย้อนกลับ */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-xs text-gray-500 mt-1 truncate w-20" title={file}>{file}</p>
        </div>
      ))}
    </div>
  </div>
)}


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

export default ManageFileUpload;
