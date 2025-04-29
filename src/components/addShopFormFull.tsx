// src/components/addShopFormFull.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// --- Import Components ย่อย ---
import ServiceList from './ServiceList';
import FileUploadInput from './FileUploadInput';
import ServiceForm from './ServiceForm';

// --- Import API functions ---
import createShopRequest from '@/libs/createShopRequest';
import { deleteFileFromGCS, uploadFileToGCSAction } from '@/libs/gcsUpload';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Snackbar, Alert
} from '@mui/material';

// ... (interface CreateShopFormData เหมือนเดิม) ...
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
  const [errors, setErrors] = useState<string[]>([]);

  const [shopImagePreviewUrls, setShopImagePreviewUrls] = useState<string[]>([]);
  const [licensePreviewUrl, setLicensePreviewUrl] = useState<string | null>(null);

  // --- State สำหรับ Snackbar ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  // ---------------------------

  // --- useEffects (เหมือนเดิม) ---
  useEffect(() => {
      if (status === 'loading') return;
      if (!session || !session.user || session.user.role !== 'shopOwner') {
          console.log("Redirecting (Create Form) due to invalid session or role:", status, session?.user?.role);
          router.push('/');
      }
  }, [session, status, router]);

  useEffect(() => {
    const newShopImageUrls = formData.shopImageFiles.map(file => URL.createObjectURL(file));
    setShopImagePreviewUrls(newShopImageUrls);

    let newLicenseUrl: string | null = null;
    if (formData.licenseDocFile) {
        newLicenseUrl = URL.createObjectURL(formData.licenseDocFile);
    }
    setLicensePreviewUrl(newLicenseUrl);

    return () => {
        newShopImageUrls.forEach(url => URL.revokeObjectURL(url));
        if (newLicenseUrl) {
            URL.revokeObjectURL(newLicenseUrl);
        }
    };
}, [formData.shopImageFiles, formData.licenseDocFile]);


  // --- Handlers ---
  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
      const { name, value } = e.target;
      setErrors([]);
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- ปรับปรุง handleFileChange ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setErrors([]); // Clear errors on file change

    if (files && files.length > 0) {
        if (name === 'shopImageFiles') {
            const newFilesArray = Array.from(files);
            setFormData((prev) => {
                // --- เพิ่มการตรวจสอบจำนวนรูป ---
                const totalImagesAfterAdd = prev.shopImageFiles.length + newFilesArray.length;
                if (totalImagesAfterAdd > 5) {
                    // ใช้ Snackbar แจ้งเตือนแทน setErrors
                    setSnackbarMessage("Cannot add more images. Maximum limit is 5.");
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    // setErrors(prevErrors => [...prevErrors, "Cannot add more images. Maximum limit is 5."]);
                    return prev; // ไม่ต้องอัปเดต state ถ้าเกิน limit
                }
                // --- สิ้นสุดการตรวจสอบ ---

                const combinedFiles = [...prev.shopImageFiles, ...newFilesArray];
                const newState = { ...prev, shopImageFiles: combinedFiles };
                return newState;
            });
        } else { // Handles 'licenseDocFile'
            const fileToSet = files[0];
            setFormData((prev) => ({ ...prev, [name]: fileToSet }));
        }
    } else {
         setFormData((prev) => ({
             ...prev,
             [name]: name === 'shopImageFiles' ? prev.shopImageFiles : null // ถ้าเคลียร์ไฟล์ shopImageFiles ให้คงค่าเดิมไว้ก่อน
         }));
         // ถ้าต้องการให้เคลียร์ไฟล์ shopImageFiles เมื่อกด cancel ให้ใช้โค้ดด้านล่างแทน
         // setFormData((prev) => ({ ...prev, [name]: name === 'shopImageFiles' ? [] : null }));
    }
     // Reset input value เพื่อให้เลือกไฟล์เดิมซ้ำได้
     e.target.value = '';
};
  // --- สิ้นสุดการปรับปรุง handleFileChange ---


  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
      setErrors([]);
      const serviceToAdd: Service = { id: crypto.randomUUID(), ...newServiceData };
      setFormData((prev) => ({ ...prev, services: [...prev.services, serviceToAdd] }));
  };

  const handleDeleteService = (idToDelete: string) => {
      setErrors([]);
      setFormData((prev) => ({
          ...prev,
          services: prev.services.filter((service) => service.id !== idToDelete),
      }));
  };

  const handleRemoveShopImage = (indexToRemove: number) => {
      setErrors([]);
      setFormData((prev) => ({
          ...prev,
          shopImageFiles: prev.shopImageFiles.filter((_, index) => index !== indexToRemove),
      }));
  };

  const handleRemoveLicense = () => {
      setErrors([]);
      setFormData((prev) => ({
          ...prev,
          licenseDocFile: null,
      }));
  };

  const handleClearAllShopImages = () => {
    setErrors([]);
    setFormData((prev) => ({
        ...prev,
        shopImageFiles: [],
    }));
};

  // --- Submit Handler ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);
    setOpenConfirmDialog(true);
};

  // --- Snackbar Close Handler ---
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // --- Confirm and Cancel Handlers ---
  const handleConfirmSubmit = async () => {
    // --- 1. Validate Form Data ---
    const validationErrors: string[] = [];

    if (status !== 'authenticated' || !session || !session.user || !session.user.token || session.user.role !== 'shopOwner') {
        validationErrors.push('Authentication failed or insufficient permissions.');
    }

    // --- Required Field Checks ---
    if (!formData.shopName.trim()) validationErrors.push("Shop Name is required.");
    if (!formData.phoneNumber.trim()) validationErrors.push("Phone number is required.");
    if (!formData.shopType) validationErrors.push("Shop Type is required.");
    if (!formData.address.trim()) validationErrors.push("Address is required.");
    if (!formData.postalcode.trim()) validationErrors.push("Postal Code is required.");
    if (!formData.region.trim()) validationErrors.push("Region is required.");
    if (!formData.province.trim()) validationErrors.push("Province is required.");
    if (!formData.district.trim()) validationErrors.push("District is required.");
    if (!formData.description.trim()) validationErrors.push("Shop Description is required.");
    if (!formData.openTime) validationErrors.push("Open Time is required.");
    if (!formData.closeTime) validationErrors.push("Close Time is required.");

    // --- File Checks (ปรับปรุง) ---
    if (formData.shopImageFiles.length === 0) {
        validationErrors.push("Please select at least one shop image.");
    } else if (formData.shopImageFiles.length > 5) { // เพิ่มการตรวจสอบจำนวนสูงสุดที่นี่ด้วย
        validationErrors.push("Maximum 5 shop images allowed.");
    }
    if (!formData.licenseDocFile) {
        validationErrors.push("Please select the certificate file.");
    }
    // --- สิ้นสุดการปรับปรุง File Checks ---

    // --- 2. Check if there are any validation errors ---
    if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        setOpenConfirmDialog(false);
        console.log("Validation Errors:", validationErrors);
        setSnackbarMessage('Please fix the validation errors.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    // --- 3. If validation passes, proceed with submission ---
    setIsSubmitting(true);
    setErrors([]);
    setOpenConfirmDialog(false);
    console.log('Form data before submit:', formData);

    let pictureUrls: string[] = [];
    let certificateUrl: string | undefined = undefined;

    try {
        // --- File Upload Logic ---
        const uploadPromises = formData.shopImageFiles.map(file => {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('folder', 'shop_pictures/');
            return uploadFileToGCSAction(fileFormData);
        });
        pictureUrls = await Promise.all(uploadPromises);

        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.licenseDocFile!);
        uploadFormData.append('folder', 'certificates');
        certificateUrl = await uploadFileToGCSAction(uploadFormData);

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
            services: formData.services.map(({ id, ...rest }) => rest),
            picture: pictureUrls,
            certificate: certificateUrl,
        };

        const User: User = {
            _id: session!.user._id,
            name: session!.user.name,
        };

        const requestData: RequestItemToCreateShop = {
            shop: shopData,
            user: User,
            requestType: 'create',
        };

        const result = await createShopRequest(session!.user.token, requestData);

        if (result.success) {
            setSnackbarMessage('Shop creation request submitted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setTimeout(() => {
                router.push('/request?status=request_submitted');
            }, 1500);
        } else {
            setErrors([result.message || 'Failed to submit shop creation request.']);
            setSnackbarMessage(result.message || 'Failed to submit shop creation request.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            throw new Error(result.message || 'API submission failed.');
        }
    } catch (err) {
        console.error('Detailed submission failed:', err);

        // --- Logic การลบไฟล์ (เหมือนเดิม) ---
        if (pictureUrls.length > 0 || certificateUrl) {
            console.warn("Submission failed after file upload. Attempting to delete uploaded files...");
            const filesToDelete = [...pictureUrls];
            if (certificateUrl) filesToDelete.push(certificateUrl);
            try {
                await Promise.allSettled(filesToDelete.map(async (pathOrUrl) => {
                    try { await deleteFileFromGCS(pathOrUrl); } catch (deleteError) { console.error(`Failed to delete orphaned file ${pathOrUrl}:`, deleteError); }
                }));
            } catch (cleanupError) { console.error("Error during file cleanup process:", cleanupError); }
        }

        // --- Set error state และแสดง Snackbar ---
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during submission.';
        if (errors.length === 0) {
            if (err instanceof AggregateError) {
                setErrors([`One or more file uploads failed: ${err.errors.map(e => e instanceof Error ? e.message : String(e)).join(', ')}`]);
            } else {
                setErrors([errorMessage]);
            }
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);

    } finally {
        setIsSubmitting(false);
    }
  };
  const handleCancelSubmit = () => {
    setOpenConfirmDialog(false);
  }


  // --- Loading and Access Denied JSX (เหมือนเดิม) ---
  if (status === 'loading') {
      return <div className="text-center my-10"><p className="text-gray-500 text-lg">Loading session...</p></div>;
  }
  if (!session || !session.user || session.user.role !== 'shopOwner') {
      return (
          <div className="text-center my-10">
              <p className="text-red-500 text-lg">Access Denied. You must be a Shop Owner to access this page.</p>
              {status === 'unauthenticated' && (
                   <button onClick={() => router.push('/api/auth/signin')} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
              )}
          </div>
      );
  }

  // --- ส่วนแสดงฟอร์มหลัก ---
  return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Create Shop Request Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* --- Sections ต่างๆ (เหมือนเดิม) --- */}
              {/* Shop Detail */}
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
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Shop Name")) ? 'border-red-500' : ''}`}
                      />
                      </div>
                      {/* Phone Number */}
                      <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                          Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                          type="tel" id="phoneNumber" name="phoneNumber"
                          placeholder="Phone number i.e 0987654321" required
                          value={formData.phoneNumber} onChange={handleInputChange}
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Phone number")) ? 'border-red-500' : ''}`}
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
                          className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white ${errors.some(e => e.includes("Shop Type")) ? 'border-red-500' : ''}`}
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

              {/* Location & Description */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Group */}
                  <div className="border p-4 rounded-md h-full flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                          {/* Address */}
                          <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address <span className="text-red-500">*</span></label>
                          <input type="text" id="address" name="address" placeholder="Address" required value={formData.address} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Address")) ? 'border-red-500' : ''}`} />
                          </div>
                          {/* Postal Code */}
                          <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postalcode">Postal Code <span className="text-red-500">*</span></label>
                          <input type="text" id="postalcode" name="postalcode" placeholder="Postal Code" required value={formData.postalcode} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Postal Code")) ? 'border-red-500' : ''}`} />
                          </div>
                          {/* Region */}
                          <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">Region <span className="text-red-500">*</span></label>
                          <input type="text" id="region" name="region" placeholder="Region" required value={formData.region} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Region")) ? 'border-red-500' : ''}`} />
                          </div>
                          {/* Province */}
                          <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">Province <span className="text-red-500">*</span></label>
                          <input type="text" id="province" name="province" placeholder="Province" required value={formData.province} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Province")) ? 'border-red-500' : ''}`} />
                          </div>
                          {/* District */}
                          <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">District <span className="text-red-500">*</span></label>
                          <input type="text" id="district" name="district" placeholder="District" required value={formData.district} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("District")) ? 'border-red-500' : ''}`} />
                          </div>
                      </div>
                  </div>

                  {/* Description Group */}
                  <div className="border p-4 rounded-md flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Description</h3>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                          Shop Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                          id="description" name="description"
                          placeholder="Shop description"
                          rows={12}
                          required
                          value={formData.description} onChange={handleInputChange}
                          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none mb-4 ${errors.some(e => e.includes("Shop Description")) ? 'border-red-500' : ''}`}
                      ></textarea>
                  </div>
              </div>

              {/* Operating Hours */}
               <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="border p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Operating Hours</h3>
                      <div className="mb-3">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openTime">Open Time <span className="text-red-500">*</span></label>
                          <input
                          type="time" id="openTime" name="openTime" required
                          value={formData.openTime} onChange={handleInputChange}
                          className={`shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Open Time")) ? 'border-red-500' : ''}`}
                          />
                      </div>
                      <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeTime">Close Time <span className="text-red-500">*</span></label>
                          <input
                          type="time" id="closeTime" name="closeTime" required
                          value={formData.closeTime} onChange={handleInputChange}
                          className={`shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.some(e => e.includes("Close Time")) ? 'border-red-500' : ''}`}
                          />
                      </div>
                  </div>
              </div>


              {/* --- Section: Shop Images (ปรับปรุง) --- */}
              <div className={`border p-4 rounded-md space-y-4 ${errors.some(e => e.includes("shop image") || e.includes("Maximum 5")) ? 'border-red-500' : ''}`}>
                  <h3 className="text-lg font-semibold text-gray-800">Shop Images (1-5 images)</h3>
                  {/* Preview Area */}
                  {shopImagePreviewUrls.length > 0 && (
                      <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-600 mb-2">Selected Images ({formData.shopImageFiles.length}/5):</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {shopImagePreviewUrls.map((url, index) => (
                                  <div key={index} className="relative group border p-1 rounded shadow-sm">
                                      <img src={url} alt={`Shop Preview ${index + 1}`} className="object-cover rounded w-full h-24"/>
                                      <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveShopImage(index); }} className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity" aria-label={`Remove image ${index + 1}`}>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {/* File Input Button (ปรับปรุง) */}
                  <FileUploadInput
                      id="shopImageFiles"
                      name="shopImageFiles"
                      label="Add Shop Images" // เปลี่ยน Label
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleFileChange}
                      multiple={true}
                      required={formData.shopImageFiles.length === 0} // Required ถ้ายังไม่มีรูป
                      disabled={formData.shopImageFiles.length >= 5} // Disable เมื่อมี 5 รูปแล้ว
                  />
                  {/* แสดงข้อความเมื่อครบ 5 รูป */}
                  {formData.shopImageFiles.length >= 5 &&
                      <p className="text-sm text-red-500 mt-1">Maximum 5 images reached.</p>
                  }
                  {/* ปุ่ม Clear All */}
                  {formData.shopImageFiles.length > 0 && (
                      <button type="button" onClick={handleClearAllShopImages} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">Clear All Selected Images</button>
                  )}
              </div>
              {/* --- สิ้นสุด Section: Shop Images --- */}


              {/* Certificate */}
              <div className={`border p-4 rounded-md ${errors.some(e => e.includes("certificate")) ? 'border-red-500' : ''}`}>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Certificate:</h3>
                   {licensePreviewUrl && formData.licenseDocFile && (
                      <div className="mb-4 border border-dashed border-gray-300 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-600 mb-2">Selected Certificate:</p>
                          <div className="flex items-center space-x-3">
                              {formData.licenseDocFile.type.startsWith('image/') ? (
                                  <img src={licensePreviewUrl} alt="Certificate Preview" className="object-contain rounded h-20 border"/>
                              ) : (
                                  <a href={licensePreviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">{formData.licenseDocFile.name}</a>
                              )}
                              <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveLicense(); }} className="bg-red-500 text-white rounded-full p-1 text-xs leading-none hover:bg-red-600" aria-label="Remove certificate">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              </button>
                          </div>
                      </div>
                   )}
                  <FileUploadInput id="licenseDocFile" name="licenseDocFile" label="Add Certificate" accept=".pdf, image/jpeg, image/png" onChange={handleFileChange} fileName={null} required={!formData.licenseDocFile} multiple={false} />
              </div>

              {/* Services */}
              <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Services offered:</h3>
                  <ServiceForm onAddService={handleAddService} />
                  <ServiceList services={formData.services} onDeleteService={handleDeleteService} />
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                  <button type="submit" disabled={isSubmitting} className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isSubmitting ? 'Submitting Request...' : 'Submit Shop Request'}
                  </button>
              </div>
          </form>

          {/* --- Error Display Area --- */}
          <div className="py-6">
              {errors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Please fix the following errors:</strong>
                    <ul className="list-disc list-inside mt-1">
                        {errors.map((errMsg, index) => (
                            <li key={index}>{errMsg}</li>
                        ))}
                    </ul>
                </div>
              )}
          </div>

          {/* --- Confirmation Dialog --- */}
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

          {/* --- Snackbar for Success/Error --- */}
          <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                  {snackbarMessage}
              </Alert>
          </Snackbar>
      </div>
  );
};
export default addShopFormFull;
