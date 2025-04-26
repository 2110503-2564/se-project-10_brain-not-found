// src/components/ServiceList.tsx
'use client'; // ไม่จำเป็นถ้าไม่มี state/effect แต่ใส่ไว้เผื่ออนาคต

import React from 'react';

// Interface สำหรับ Service ที่มี ID (อาจจะ import มาจากที่เดียวกับ Form หลัก)
interface Service {
  id: string; // ID ที่สร้างจาก Client หรือ Server
  name: string;
  description: string;
  price: string; // หรือ number
  duration: string;
}

interface ServiceListProps {
  services: Service[];
  onDeleteService: (id: string) => void; // Callback function ใช้ ID ในการลบ
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onDeleteService }) => {
  if (services.length === 0) {
    return <div className="text-center text-gray-500 py-4">No services added yet.</div>;
  }

  return (
    <div className="border-t pt-4">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 font-semibold text-gray-700 mb-2 px-2">
        <div className="col-span-1">ชื่อบริการ</div>
        <div className="col-span-2">คำอธิบายบริการ</div>
        <div className="col-span-1">ราคา</div>
        <div className="col-span-1 flex justify-between">ระยะเวลา</div>
      </div>
      {/* Service Rows */}
      {services.map((service) => (
        <div
          key={service.id} // ใช้ ID ที่ unique เป็น key
          className="grid grid-cols-5 gap-4 text-gray-700 border-b py-2 px-2 items-center hover:bg-gray-50" // Added hover effect
        >
          <div className="col-span-1 truncate">{service.name}</div>
          <div className="col-span-2 truncate">{service.description || '-'}</div> {/* Handle empty description */}
          <div className="col-span-1">{service.price}</div>
          <div className="col-span-1 flex justify-between items-center">
            <span>{service.duration}</span>
            <button
              type="button"
              onClick={() => onDeleteService(service.id)} // เรียก callback พร้อม ID
              className="text-red-500 hover:text-red-700 text-lg font-bold ml-2 p-1 leading-none" // Adjusted style
              aria-label={`Delete service ${service.name}`}
            >
              &times; {/* Use times symbol for X */}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
