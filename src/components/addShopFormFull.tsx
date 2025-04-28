// src/components/addShopFormFull.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// --- Import Components ย่อย ---
import ServiceList from './ServiceList';
import FileUploadInput from './FileUploadInput'; // ยังคงใช้ตัวนี้สำหรับ Input
import ServiceForm from './ServiceForm';
// (อาจจะ Import components section อื่นๆ ถ้าแบ่งไว้แล้ว)
// import ShopDetailSection from './formSections/ShopDetailSection';
// import LocationSection from './formSections/LocationSection';
// ...

// --- Import API functions ---
import createShopRequest from '@/libs/createShopRequest';
import { uploadFileToGCSAction } from '@/libs/gcsUpload';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface CreateShopFormData {
    shopName: string;
    phoneNumber: string;
    shopType: string;
    address: string;
    postalcode: string;
    region: string;
    province: string;
    district: string;
    description: string;
    openTime: string;
    closeTime: string;
    services: Service[];
    shopImageFiles: File[];
    licenseDocFile: File | null;
}


const addShopFormFull: React.FC = () => {
  const router = useRouter();
  // ดึง status มาด้วย
  const { data: session, status } = useSession();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<CreateShopFormData>({
      shopName: '',
      phoneNumber: '',
      shopType: '',
      address: '',
      postalcode: '',
      region: '',
      province: '',
      district: '',
      description: '',
      openTime: '',
      closeTime: '',
      services: [],
      shopImageFiles: [],
      licenseDocFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shopImagePreviewUrls, setShopImagePreviewUrls] = useState<string[]>([]);
  const [licensePreviewUrl, setLicensePreviewUrl] = useState<string | null>(null);

  // --- useEffect for Auth Check (ปรับปรุง) ---
  useEffect(() => {
      // รอจนกว่า status จะไม่ใช่ 'loading'
      if (status === 'loading') {
          return; // ยังโหลดอยู่ ไม่ต้องทำอะไร
      }

      // ถ้าโหลดเสร็จแล้ว และไม่มี session หรือ role ไม่ใช่ shopOwner ให้ redirect
      if (!session || !session.user || session.user.role !== 'shopOwner') {
          console.log("Redirecting (Create Form) due to invalid session or role:", status, session?.user?.role);
          router.push('/');
      }
  }, [session, status, router]); // <--- เพิ่ม status ใน dependency array

  useEffect(() => {
    console.log('[Preview Debug] useEffect triggered'); // <-- Log 1
    // สร้าง Object URLs สำหรับ shop images ใหม่
    const newShopImageUrls = formData.shopImageFiles.map(file => {
        const url = URL.createObjectURL(file);
        console.log(`[Preview Debug] Created Shop Image URL: ${url} for ${file.name}`); // <-- Log 2
        return url;
    });
    setShopImagePreviewUrls(newShopImageUrls);

    // สร้าง Object URL สำหรับ license doc ใหม่
    let newLicenseUrl: string | null = null;
    if (formData.licenseDocFile) {
        newLicenseUrl = URL.createObjectURL(formData.licenseDocFile);
        console.log(`[Preview Debug] Created License URL: ${newLicenseUrl} for ${formData.licenseDocFile.name}`); // <-- Log 3
    } else {
        console.log('[Preview Debug] No license file to create URL for.'); // <-- Log 4
    }
    setLicensePreviewUrl(newLicenseUrl);

    // Cleanup function
    return () => {
        console.log('[Preview Debug] Cleanup: Revoking URLs'); // <-- Log 5
        newShopImageUrls.forEach(url => URL.revokeObjectURL(url));
        if (newLicenseUrl) {
            URL.revokeObjectURL(newLicenseUrl);
        }
    };
}, [formData.shopImageFiles, formData.licenseDocFile]); // ทำงานเมื่อไฟล์เปลี่ยน

  // --- Handlers (Input, File, Service - Keep as is) ---
  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
      const { name, value } = e.target;
      setError(null);
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    console.log(`[Debug] handleFileChange triggered for name: "${name}"`);
    console.log(`[Debug] files object received:`, files);
    setError(null);

    if (files && files.length > 0) {
        const fileToSet = files[0]; // ยังคงใช้สำหรับ licenseDocFile
        console.log(`[Debug] File object (files[0]) to be set for "${name}":`, fileToSet);

        if (name === 'shopImageFiles') {
            const newFilesArray = Array.from(files); // แปลงไฟล์ใหม่เป็น Array
            console.log(`[Debug] New files selected for shopImageFiles:`, newFilesArray);

            // --- ส่วนที่แก้ไข ---
            setFormData((prev) => {
                // รวม Array ไฟล์เดิมกับ Array ไฟล์ใหม่
                const combinedFiles = [...prev.shopImageFiles, ...newFilesArray];
                console.log(`[Debug] Combined shopImageFiles:`, combinedFiles);
                const newState = { ...prev, shopImageFiles: combinedFiles };
                console.log('[Debug] New state after appending shopImageFiles:', newState);
                return newState;
            });
            // --- สิ้นสุดส่วนที่แก้ไข ---

        } else { // Handles 'licenseDocFile' (ยังคงแทนที่ไฟล์เดิม)
            console.log(`[Debug] Setting ${name} with file:`, fileToSet);
            setFormData((prev) => {
                const newState = { ...prev, [name]: fileToSet };
                console.log(`[Debug] New state after setting ${name}:`, newState);
                return newState;
            });
        }
    } else {
         console.log(`[Debug] No files selected or selection cleared for "${name}".`);
         setFormData((prev) => {
             const newState = { ...prev, [name]: name === 'shopImageFiles' ? [] : null };
             console.log(`[Debug] New state after clearing ${name}:`, newState);
             return newState;
         });
    }
     console.log(`[Debug] Resetting input value for "${name}".`);
     e.target.value = '';
};



  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
      setError(null);
      const serviceToAdd: Service = { id: crypto.randomUUID(), ...newServiceData };
      setFormData((prev) => ({ ...prev, services: [...prev.services, serviceToAdd] }));
  };

  const handleDeleteService = (idToDelete: string) => {
      setError(null);
      setFormData((prev) => ({
          ...prev,
          services: prev.services.filter((service) => service.id !== idToDelete),
      }));
  };

  const handleRemoveShopImage = (indexToRemove: number) => {
      setError(null);
      setFormData((prev) => ({
          ...prev,
          shopImageFiles: prev.shopImageFiles.filter((_, index) => index !== indexToRemove),
      }));
  };

  const handleRemoveLicense = () => {
      setError(null);
      setFormData((prev) => ({
          ...prev,
          licenseDocFile: null,
      }));
  };

  const handleClearAllShopImages = () => {
    setError(null); // ล้าง error ถ้ามี
    setFormData((prev) => ({
        ...prev,
        shopImageFiles: [], // ตั้งค่า shopImageFiles ให้เป็น Array ว่าง
    }));
    console.log('[Debug] Cleared all shop images.');
};

  // --- Submit Handler (Keep core logic, file upload part is fine) ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear error
    setOpenConfirmDialog(true);
};

  // --- Confirm and Cancel Handlers ---
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    // ... (เดิมคือ codeใน handleSubmit มาอยู่ใน handleConfirmSubmit)
    setError(null);
    console.log('Form data before submit:', formData); // <-- เพิ่ม log ตรวจสอบ

    // --- Validation ---
    if (formData.shopImageFiles.length === 0) {
        setError("Please select at least one shop image.");
        setIsSubmitting(false);
        setOpenConfirmDialog(false); // Close dialog
        return;
    }
    if (!formData.licenseDocFile) {
        setError("Please select the certificate file.");
        setIsSubmitting(false);
        setOpenConfirmDialog(false);
        return;
    }
    // ... other validations ...

    // --- Authentication Check (ใช้ status ด้วย) ---
    if (status !== 'authenticated' || !session || !session.user || !session.user.token || session.user.role !== 'shopOwner') {
        setError('Authentication failed or insufficient permissions.');
        setIsSubmitting(false);
        setOpenConfirmDialog(false); // Close dialog
        return;
    }

    let pictureUrls: string[] = [];
    let certificateUrl: string | undefined = undefined;

    try {
        // --- File Upload Logic ---
        console.log('Starting file uploads...'); // <-- เพิ่ม log
        console.log('Shop images to upload:', formData.shopImageFiles); // <-- เพิ่ม log
        console.log('License doc to upload:', formData.licenseDocFile); // <-- เพิ่ม log

        // --- 1. อัปโหลดรูปภาพร้านค้า ---
        const uploadPromises = formData.shopImageFiles.map(file => {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('folder', 'shop_pictures/'); // ระบุ folder
            console.log(`Preparing to upload shop image: ${file.name} to folder: shop_pictures/`); // <-- เพิ่ม log
            return uploadFileToGCSAction(fileFormData);
        });
        pictureUrls = await Promise.all(uploadPromises);
        console.log('Shop images uploaded successfully:', pictureUrls);

        // --- 2. อัปโหลดใบรับรอง ---
        console.log("Uploading license document...");
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.licenseDocFile); // มั่นใจว่าไม่ null จาก validation
        uploadFormData.append('folder', 'certificates'); // ระบุ folder
        console.log(`Preparing to upload license: ${formData.licenseDocFile.name} to folder: certificates`); // <-- เพิ่ม log
        certificateUrl = await uploadFileToGCSAction(uploadFormData);
        console.log("License document uploaded successfully:", certificateUrl);

        // --- Prepare Data & Call API ---
        const shopData: ShopItemForRequest = {
            name: formData.shopName,
            tel: formData.phoneNumber,
            shopType: formData.shopType,
            address: formData.address,
            postalcode: formData.postalcode,
            region: formData.region,
            province: formData.province,
            district: formData.district,
            desc: formData.description,
            openTime: formData.openTime,
            closeTime: formData.closeTime,
            // ตรวจสอบว่า API ต้องการ description ใน service หรือไม่
            services: formData.services.map(({ id, ...rest }) => rest),
            picture: pictureUrls,
            certificate: certificateUrl,
        };

        const User: User = {
            _id: session.user._id,
            name: session.user.name,
        };

        const requestData: RequestItemToCreateShop = {
            shop: shopData,
            user: User,
            requestType: 'create',
        };

        console.log('Submitting shop creation request:', requestData);
        const result = await createShopRequest(session.user.token, requestData);

        if (result.success) {
            console.log('Shop creation request successful:', result);
            router.push('/request?status=request_submitted');
        } else {
            throw new Error(result.message || 'Failed to submit shop creation request.');
        }
    } catch (err) {
        console.error('Detailed submission failed:', err); // <-- เพิ่ม log ที่ละเอียดขึ้น
        if (err instanceof AggregateError) {
            setError(`One or more file uploads failed: ${err.errors.map(e => e instanceof Error ? e.message : String(e)).join(', ')}`);
        } else {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
        // *** พิจารณา Logic ลบไฟล์ที่ Upload ไปแล้วถ้า API ล้มเหลว ***
    } finally {
        setIsSubmitting(false);
        setOpenConfirmDialog(false); // ปิด Dialog เสมอ
    }
  };
  const handleCancelSubmit = () => {
    setOpenConfirmDialog(false);
  }


  // แสดง Loading ขณะรอ session
  if (status === 'loading') { // <--- เพิ่ม check loading status
      return (
          <div className="text-center my-10">
              <p className="text-gray-500 text-lg">Loading session...</p>
              {/* หรือใส่ Spinner component */}
          </div>
      );
  }

  // แสดง Access Denied ถ้าไม่มี session หรือ role ไม่ถูกต้อง (หลังจากโหลดเสร็จ)
  // เงื่อนไขนี้จะทำงานหลังจาก status ไม่ใช่ 'loading' แล้ว
  if (!session || !session.user || session.user.role !== 'shopOwner') { // <--- เงื่อนไขนี้ปลอดภัยแล้ว
      return (
          <div className="text-center my-10">
              <p className="text-red-500 text-lg">Access Denied. You must be a Shop Owner to access this page.</p>
              {/* อาจจะเพิ่มปุ่ม Login ถ้ายังไม่ได้ Login */}
              {status === 'unauthenticated' && (
                   <button
                      onClick={() => router.push('/api/auth/signin')}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                      Login
                  </button>
              )}
          </div>
      );
  }

  // --- ส่วนแสดงฟอร์มหลัก (เมื่อ session ถูกต้อง) ---
  return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Create Shop Request Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* --- Shop Detail Section --- */}
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
                          type="tel" id="phoneNumber" name="phoneNumber"
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
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
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

              {/* --- Location & Description Section --- */}
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
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Description</h3> {/* <--- แก้ไข Title */}
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Shop Description</label>
                      <textarea
                          id="description" name="description"
                          placeholder="Shop description (optional)"
                          rows={12}
                          value={formData.description} onChange={handleInputChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none mb-4"
                      ></textarea>
                  </div>
              </div>

              {/* --- Operating Hours Section --- */}
               <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="border p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Operating Hours</h3>
                      <div className="mb-3">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openTime">Open Time <span className="text-red-500">*</span></label>
                          <input
                          type="time" id="openTime" name="openTime" required
                          value={formData.openTime} onChange={handleInputChange}
                          className="shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                      </div>
                      <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeTime">Close Time <span className="text-red-500">*</span></label>
                          <input
                          type="time" id="closeTime" name="closeTime" required
                          value={formData.closeTime} onChange={handleInputChange}
                          className="shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                      </div>
                  </div>
              </div>


              {/* --- Section: Shop Images --- */}
              <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop Images:</h3>
                  {/* Preview Area */}
                  {shopImagePreviewUrls.length > 0 && (
                      <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-600 mb-2">Selected Images:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {shopImagePreviewUrls.map((url, index) => (
                                  <div key={index} className="relative group border p-1 rounded shadow-sm">
                                      <img
                                          src={url}
                                          alt={`Shop Preview ${index + 1}`}
                                          className="object-cover rounded w-full h-24"
                                      />
                                      <button
                                          type="button"
                                          onClick={(e) => { e.preventDefault(); handleRemoveShopImage(index); }}
                                          className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                          aria-label={`Remove image ${index + 1}`}
                                      >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {/* File Input Button */}
                  <FileUploadInput
                      id="shopImageFiles"
                      name="shopImageFiles"
                      label="Add/Replace Shop Images (Select multiple)"
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleFileChange}
                      multiple={true}
                      required={formData.shopImageFiles.length === 0}
                  />

                  {formData.shopImageFiles.length > 0 && (
                      <button
                          type="button"
                          onClick={handleClearAllShopImages} // <--- เรียก Handler ใหม่
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                          Clear All Selected Images
                      </button>
                  )}
              </div>

              {/* --- Section: Certificate --- */}
              <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Certificate:</h3>
                   {/* Preview Area */}
                   {licensePreviewUrl && formData.licenseDocFile && (
                      <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-600 mb-2">Selected Certificate:</p>
                          <div className="flex items-center space-x-3">
                              {formData.licenseDocFile.type.startsWith('image/') ? (
                                  <img src={licensePreviewUrl} alt="Certificate Preview" className="object-contain rounded h-20 border"/>
                              ) : (
                                  <a href={licensePreviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
                                      {formData.licenseDocFile.name}
                                  </a>
                              )}
                              <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); handleRemoveLicense(); }}
                                  className="bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600"
                                  aria-label="Remove certificate"
                              >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                              </button>
                          </div>
                      </div>
                   )}
                
                      <FileUploadInput
                          id="licenseDocFile"
                          name="licenseDocFile"
                          label="Add Certificate"
                          accept=".pdf, image/jpeg, image/png"
                          onChange={handleFileChange}
                          fileName={null} 
                          required={!formData.licenseDocFile}
                          multiple={false}
                      />
             
              </div>

              {/* --- Section: Services offered --- */}
              <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Services offered:</h3>
                  <ServiceForm onAddService={handleAddService} />
                  <ServiceList services={formData.services} onDeleteService={handleDeleteService} />
              </div>

              {/* --- Submit Button --- */}
              <div className="text-center pt-4">
                  <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                      {isSubmitting ? 'Submitting Request...' : 'Submit Shop Request'}
                  </button>
              </div>

           {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
          )}
          </form>
                  {/* --- Confirmation Dialog (เหมือนเดิม) --- */}
                  <Dialog disableScrollLock open={openConfirmDialog} onClose={handleCancelSubmit} >
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to submit this shop creation request?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelSubmit} disabled={isSubmitting}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleConfirmSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
      </div>
  );
};
export default addShopFormFull;
