// src/components/ServiceInput.tsx
'use client';

import React, { useState } from 'react';

// Interface สำหรับข้อมูล Service (อาจจะ import มาจากที่เดียวกับ Form หลัก)

interface ServiceInputProps {
  onAddService: (serviceData: ServiceBase) => void; // Callback function
}

const ServiceForm: React.FC<ServiceInputProps> = ({ onAddService }) => {
  const [newService, setNewService] = useState<ServiceBase>({
    name: '',
    desc: '',
    price: '',
    duration: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    // Basic validation
    if (!newService.name || !newService.price || !newService.duration) {
      alert('Please fill in Service Name, Price, and Duration.');
      return;
    }
    onAddService(newService); // ส่งข้อมูลกลับไปให้ Parent
    // Reset form
    setNewService({ name: '', desc: '', price: '', duration: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
      {/* ชื่อบริการ */}
      <div className="md:col-span-1">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="serviceNameInput">ชื่อบริการ:</label>
        <input
          type="text"
          id="serviceNameInput" // ใช้ ID ที่ไม่ซ้ำกับ Form หลัก
          name="name" // ตรงกับ key ใน newService state
          placeholder="ชื่อบริการ"
          value={newService.name}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {/* คำอธิบายบริการ */}
      <div className="md:col-span-2">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="serviceDescriptionInput">คำอธิบายบริการ:</label>
        <input
          type="text"
          id="serviceDescriptionInput"
          name="desc"
          placeholder="คำอธิบายบริการ (optional)"
          value={newService.desc}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {/* ราคา */}
      <div className="md:col-span-1">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="servicePriceInput">ราคา:</label>
        <input
          type="text" // หรือ type="number"
          id="servicePriceInput"
          name="price"
          placeholder="ราคา"
          value={newService.price}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {/* ระยะเวลา */}
      <div className="md:col-span-1">
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="serviceDurationInput">ระยะเวลา:</label>
        <input
          type="text"
          id="serviceDurationInput"
          name="duration"
          placeholder="เช่น 60 นาที"
          value={newService.duration}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {/* ปุ่ม ADD */}
      <div className="md:col-span-5 text-right">
        <button
          type="button"
          onClick={handleAddClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          ADD
        </button>
      </div>
    </div>
  );
};

export default ServiceForm;
