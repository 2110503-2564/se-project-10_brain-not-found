// src/components/CreateShopForm.tsx (เปลี่ยนชื่อไฟล์ตามต้องการ)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // ใช้สำหรับ redirect หลัง submit สำเร็จ

// Import Components ย่อย
import ServiceList from './ServiceList';
import FileUploadInput from './FileUploadInput';
import ServiceForm from './ServiceForm';

// Import Server Action (ตัวอย่าง)
// import { createShopAction } from '@/actions/shopActions'; // สร้างไฟล์ action แยก

// --- Interfaces (ควรแยกไปไฟล์ types.ts) ---
interface Service {
  id: string; // ใช้ ID ชั่วคราวจาก crypto.randomUUID()
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface ShopFormData {
    shopName: string;
    phoneNumber: string;
    shopType: string;
    address: string;
    postalcode: string;
    region: string;
    province: string;
    district: string;
    description: string;
    openCloseTime: string; // อาจจะต้องปรับปรุงการจัดการเวลา
    services: Service[];
    shopImageFile: File | null;
    licenseDocFile: File | null;
  }
// --- End Interfaces ---

const CreateShopForm: React.FC = () => {
  const router = useRouter(); // Initialize router
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: '',
    phoneNumber: '',
    shopType: '',
    address: '',
    postalcode: '',
    region: '',
    province: '',
    district: '',
    description: '',
    openCloseTime: '', // ต้องหาวิธีจัดการ Input เวลานี้ให้ดีขึ้น
    services: [],
    shopImageFile: null,
    licenseDocFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError(null); // Clear error on input change
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setError(null); // Clear error on file change
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [`${name}File`]: files[0] }));
    } else {
      // Optional: Clear file if user cancels selection
      // setFormData((prev) => ({ ...prev, [`${name}File`]: null }));
    }
  };

  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
    setError(null);
    const serviceToAdd: Service = {
      id: crypto.randomUUID(), // Generate temporary client-side ID
      ...newServiceData,
    };
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, serviceToAdd],
    }));
  };

  const handleDeleteService = (idToDelete: string) => {
    setError(null);
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((service) => service.id !== idToDelete),
    }));
  };

  // --- Submit Handler ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    setError(null);

    // --- สร้าง FormData สำหรับส่งไป Server Action ---
    const dataToSend = new FormData();
    dataToSend.append('shopName', formData.shopName);
    dataToSend.append('phoneNumber', formData.phoneNumber);
    dataToSend.append('shopType', formData.shopType);
    dataToSend.append('address', formData.address);
    dataToSend.append('postalcode', formData.postalcode);
    dataToSend.append('region', formData.region);
    dataToSend.append('province', formData.province);
    dataToSend.append('district', formData.district);
    dataToSend.append('description', formData.description);
    dataToSend.append('openCloseTime', formData.openCloseTime); // ส่งค่าเวลาไปก่อน

    // Append files if they exist
    if (formData.shopImageFile) {
      dataToSend.append('shopImage', formData.shopImageFile); // ชื่อต้องตรงกับที่ Server Action คาดหวัง
    }
    if (formData.licenseDocFile) {
      dataToSend.append('licenseDoc', formData.licenseDocFile); // ชื่อต้องตรงกับที่ Server Action คาดหวัง
    }

    // Append services (convert array to JSON string)
    // Server Action จะต้อง parse JSON นี้กลับ
    dataToSend.append('services', JSON.stringify(formData.services.map(({ id, ...rest }) => rest))); // ส่งเฉพาะข้อมูล ไม่ต้องส่ง ID ชั่วคราว

    try {
      // --- เรียก Server Action ---
      // const result = await createShopAction(dataToSend); // สมมติว่ามี Action นี้

      // --- จำลองการทำงาน ---
      console.log('Submitting FormData:', Object.fromEntries(dataToSend.entries()));
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const result = { success: true, message: 'Shop created successfully!', shopId: '12345' }; // Mock result
      // const result = { success: false, message: 'Failed to create shop: Invalid data' }; // Mock error result
      // --- จบส่วนจำลอง ---


      if (result.success) {
        console.log('Shop creation successful:', result);
        // Redirect to the shop page or a success page
        router.push(`/shops/${result.shopId || ''}?status=created`); // ตัวอย่างการ Redirect
      } else {
        throw new Error(result.message || 'Failed to create shop.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- JSX ---
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create Shop Form
      </h2>

      {/* Display General Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate> {/* noValidate เพื่อให้ browser validation ไม่ทำงานก่อน custom logic */}

        {/* Section: Shop Detail */}
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop Detail</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopName">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="shopName" name="shopName"
                placeholder="Shop Name" required
                value={formData.shopName} onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel" id="phoneNumber" name="phoneNumber" // ใช้ type="tel"
                placeholder="Phone number" required
                value={formData.phoneNumber} onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {/* Type Shop */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shopType">
                Type Shop <span className="text-red-500">*</span>
              </label>
              <select
                id="shopType" name="shopType" required
                value={formData.shopType} onChange={handleInputChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white" // Added bg-white for consistency
              >
                <option value="" disabled>-- Select Type --</option>
                <option value="Thai Massage">Thai Massage</option>
                <option value="Traditional Massage">Traditional Massage</option>
                <option value="Spa">Spa</option>
                <option value="Foot Massage">Foot Massage</option>
                {/* Add more options */}
              </select>
            </div>
            <div></div> {/* Placeholder */}
          </div>
        </div>

        {/* Section: Location and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Group */}
            <div className="border p-4 rounded-md h-full flex flex-col">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Location</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    {/* Address */}
                    <div className="md:col-span-2">
                       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address <span className="text-red-500">*</span></label>
                       <input type="text" id="address" name="address" placeholder="Address" required value={formData.address} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    {/* Postal Code */}
                     <div>
                       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postalcode">Postal Code <span className="text-red-500">*</span></label>
                       <input type="text" id="postalcode" name="postalcode" placeholder="Postal Code" required value={formData.postalcode} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                     {/* Region */}
                     <div>
                       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">Region <span className="text-red-500">*</span></label>
                       <input type="text" id="region" name="region" placeholder="Region" required value={formData.region} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                     {/* Province */}
                     <div>
                       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">Province <span className="text-red-500">*</span></label>
                       <input type="text" id="province" name="province" placeholder="Province" required value={formData.province} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                     {/* District */}
                     <div>
                       <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">District <span className="text-red-500">*</span></label>
                       <input type="text" id="district" name="district" placeholder="District" required value={formData.district} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                 </div>
            </div>

            {/* Description Group */}
            <div className="border p-4 rounded-md flex flex-col">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Description</h3>
                 <textarea
                    id="description" name="description"
                    placeholder="Shop description (optional)"
                    rows={10}
                    value={formData.description} onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none flex-grow" // Added flex-grow
                 ></textarea>
            </div>
         </div>

        {/* Section: Open-Close time, Image, License */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Open-Close time */}
            <div className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Open-Close time</h3>
                {/* TODO: Replace with a proper time range picker component */}
                <input
                   type="text"
                   id="openCloseTime" name="openCloseTime"
                   placeholder="e.g., 10:00 - 20:00"
                   value={formData.openCloseTime} onChange={handleInputChange}
                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {/* Your Shop image */}
             <div className="border p-4 rounded-md">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop image:</h3>
                 <FileUploadInput
                    id="shopImage"
                    name="shopImage" // ชื่อนี้จะถูกใช้ใน formData.get('shopImageFile') ใน state
                    label="Shop Image"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                    fileName={formData.shopImageFile?.name} // ส่งชื่อไฟล์ไปแสดง
                 />
             </div>

             {/* ใบรับรอง */}
             <div className="border p-4 rounded-md">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">ใบรับรอง:</h3>
                 <FileUploadInput
                    id="licenseDoc"
                    name="licenseDoc" // ชื่อนี้จะถูกใช้ใน formData.get('licenseDocFile') ใน state
                    label="Certificate"
                    accept=".pdf, image/jpeg, image/png"
                    onChange={handleFileChange}
                    fileName={formData.licenseDocFile?.name} // ส่งชื่อไฟล์ไปแสดง
                 />
             </div>
        </div>

        {/* Section: Services offered */}
        <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Services offered:</h3>
            {/* ใช้ Component ServiceInput */}
            <ServiceForm onAddService={handleAddService} />
            {/* ใช้ Component ServiceList */}
            <ServiceList services={formData.services} onDeleteService={handleDeleteService} />
        </div>

        {/* Submit Button */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting} // Disable button while submitting
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Shop'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateShopForm; // เปลี่ยนชื่อ Export ด้วย
