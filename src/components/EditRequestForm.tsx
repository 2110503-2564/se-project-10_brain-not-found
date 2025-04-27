// src/components/addShopFormFull.tsx
'use client';
import {
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button
} from "@mui/material";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// --- Import Components ย่อย ---
import ServiceList from './ServiceList';
import ManageFileUpload from './ManageFileUpload';
import ServiceForm from './ServiceForm';

// --- Import API functions ---
import editShopRequest from '@/libs/editShopRequest';
import { uploadFileToGCSAction, deleteFileFromGCS } from '@/libs/gcsUpload'; // Adjust path if needed
import getRequest from '@/libs/getRequest';
import Image from 'next/image';

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
    openTime: string;
    closeTime: string;
    services: Service[]; // Keep client-side ID for list management
    shopImageFiles: File[]; // Changed to array for multiple files
    oldshopImageURL: String[];
    oldCertImageURL: String[];
    licenseDocFile: File | null; // Keep as single file for now, adjust if needed
}

const extractGCSFilePath = (fullUrl: string) => {
    const baseUrl = "https://storage.googleapis.com/brain_not_found_app/";
    if (fullUrl.startsWith(baseUrl)) {
      return fullUrl.substring(baseUrl.length);
    }
    return fullUrl; // fallback (เผื่อมันเป็น path อยู่แล้ว)
  };

interface EditShopFormProps {
    requestId: string;
  }

const EditShopRequestForm: React.FC<EditShopFormProps> = ({requestId}) => {
  const router = useRouter();
  const { data: session } = useSession();

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
    openTime: '',
    closeTime: '',
    services: [],
    shopImageFiles: [], // Initialize as empty array
    licenseDocFile: null,
    oldshopImageURL: [],
    oldCertImageURL: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletedImageURLs, setDeletedImageURLs] = useState<string[]>([]);
  const [deletedCertImageURLs, setDeletedCertImageURLs] = useState<string[]>([]);
  
  const [currentShopImageURLs, setCurrentShopImageURLs] = useState<string[]>([]);
  const [currentCertImageURLs, setCurrentCertImageURLs] = useState<string[]>([]);


  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isReallySubmitting, setIsReallySubmitting] = useState(false);
  
  // Redirect if not logged in or not a shopOwner
  useEffect(() => {
    if (!session || !session.user  ||!requestId) return;
  
    const fetchRequest = async () => {
    try {
      if (!session.user || !session.user.token) {
        throw new Error("Session is missing user or token.");
      }
        const result = await getRequest(requestId, session.user.token);

        if (session.user.role !== 'shopOwner' || result.data.user._id !== session.user._id) {
          router.push('/');
          return;
        }
  
        if (result.success && result.data) {
          setFormData({
            shopName: result.data.shop.name,
            phoneNumber: result.data.shop.tel,
            shopType: result.data.shop.shopType,
            address: result.data.shop.address,
            postalcode: result.data.shop.postalcode,
            region: result.data.shop.region,
            province: result.data.shop.province,
            district: result.data.shop.district,
            description: result.data.shop.desc,
            openTime: result.data.shop.openTime,
            closeTime: result.data.shop.closeTime,
            services: result.data.shop.services,
            shopImageFiles: [], // Initialize as empty array
            oldshopImageURL: result.data.shop.picture,
            oldCertImageURL: [result.data.shop.certificate as string],// **เหมือนกัน**
            licenseDocFile: null
          });
            setCurrentShopImageURLs(result.data.shop.picture);
            setCurrentCertImageURLs([result.data.shop.certificate as string]);
        } else {
          setError('Failed to load request data.');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading request data.');
      }
    };
    setError(''); /*แก้เฉพาะหน้า ในtry รันโค้ดได้จนจบแล้วแต่ยัง catch error อยู่ */
  
    fetchRequest(); // <<< --------------------- เรียกมันตรงนี้
  }, [session, requestId]);


  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setError(null);

    if (files && files.length > 0) {
      if (name === 'shopImageFiles') { // Handle multiple files for shop images
        setFormData((prev) => ({
          ...prev,
          shopImageFiles: Array.from(files), // Convert FileList to Array
        }));
      } else { // Handle single file for other inputs (like license)
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else {
      // Clear the specific file input state
       if (name === 'shopImageFiles') {
            setFormData((prev) => ({ ...prev, shopImageFiles: [] }));
       } else {
            setFormData((prev) => ({ ...prev, [name]: null }));
       }
    }
  };

  const handleAddService = (newServiceData: Omit<Service, 'id'>) => {
    setError(null);
    const serviceToAdd: Service = {
      id: crypto.randomUUID(),
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
    event.preventDefault();
    setError(null);
    
    // --- Authentication Check ---
    if (!session || !session.user || !session.user.token || session.user.role !== 'shopOwner') {
        setError('Authentication failed or insufficient permissions.');
      return;
    }

    const totalImages = (currentShopImageURLs.length | formData.oldshopImageURL.length) + formData.shopImageFiles.length;
    if (totalImages < 1 || totalImages > 5) {
      setError('You must have between 1 and 5 shop images.');
      throw new Error(`You must have between 1 and 5 shop images. Now you have ${totalImages} `);
    }
    if((formData.licenseDocFile && currentCertImageURLs.length >= 1 )||(!formData.licenseDocFile && currentCertImageURLs.length === 0) ){
        
      setError('You must have 1 Certificate.');
      throw new Error('You must have 1 Certificate.');
    }

    setOpenConfirmDialog(true);
    
    };
    
    const handleConfirmEdit = async () => {

    if (!session || !session.user || !session.user.token || session.user.role !== 'shopOwner') {
        setError('Authentication failed or insufficient permissions.');
        return;
    }
    
    setIsReallySubmitting(true);
    
    let pictureUrls: string[] = []; // Array for multiple image URLs
    let certificateUrl: string | undefined = undefined; // Single URL for license/certificate
    try {
        
        
        // --- 1. อัปโหลดรูปภาพร้านค้า (ถ้ามี) ---
        if (formData.shopImageFiles && formData.shopImageFiles.length > 0) {
            console.log(`Uploading ${formData.shopImageFiles.length} shop images...`);
            
            // สร้าง Array ของ Promises: แต่ละ Promise คือการเรียก uploadFileToGCSAction สำหรับ 1 ไฟล์
            const uploadPromises = formData.shopImageFiles.map(file => {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('folder', 'shop_pictures/'); // <-- ระบุ folder ปลายทาง
            // สามารถเพิ่ม 'allowedTypes', 'maxSize' ได้ถ้า Server Action รองรับ
            // fileFormData.append('allowedTypes', 'image/jpeg,image/png');
            
            // เรียก Server Action แล้ว return Promise ที่ได้กลับไป
            return uploadFileToGCSAction(fileFormData);
        });
        
        // ใช้ Promise.all รอให้ทุก Promises ใน Array ทำงานเสร็จ
        // ผลลัพธ์ (shopPictureUrls) จะเป็น Array ของ URL ตามลำดับไฟล์ที่ส่งไป
        pictureUrls = await Promise.all(uploadPromises);
        
        console.log('Shop images uploaded successfully:', pictureUrls);
    } else {
        console.log('No shop images to upload.');
        // อาจจะมีการ validation เพิ่มเติมว่าต้องมีรูปอย่างน้อย 1 รูป
    }
    
    // --- 2. Upload License Document (Single) ---
    if (formData.licenseDocFile ) {
        try {
            console.log("Uploading license document via Server Action...");
            // Create FormData for the license file
            const uploadFormData = new FormData();
            uploadFormData.append('file', formData.licenseDocFile);
            uploadFormData.append('folder', 'certificates');
            // Optionally add allowedTypes and maxSize
            // uploadFormData.append('allowedTypes', 'application/pdf,image/jpeg,image/png');
            // uploadFormData.append('maxSize', (2 * 1024 * 1024).toString());
            
            // Call the Server Action with FormData
            certificateUrl = await uploadFileToGCSAction(uploadFormData);
            console.log("License document uploaded via Server Action:", certificateUrl);
        } catch (uploadError) {
            throw new Error(`License document upload failed: ${uploadError instanceof Error ? uploadError.message : uploadError}`);
        }
    }else{
        certificateUrl = currentCertImageURLs[0];
    }
    
    pictureUrls = [...currentShopImageURLs, ...pictureUrls];
    
    // --- 3. Prepare Shop Data (using imported interface) ---
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
        picture: pictureUrls, // Use 'picture' field with array of URLs
        certificate: certificateUrl, // Use 'certificate' field (optional)
        // Add other fields from your ShopItemForRequest interface if needed
      };

      const User: User = {
        _id: session.user._id,
        name: session.user.name,
      };

      // --- 0. Delete Shop Images (Multiple) ---
      const allDeletedUrls = [...deletedImageURLs, ...deletedCertImageURLs];
      if (allDeletedUrls.length > 0) {
        console.log("Deleting old images:", allDeletedUrls);
        await Promise.all(allDeletedUrls.map(async (url) => {
          const filePath = extractGCSFilePath(url); // <<< เพิ่มตรงนี้
          await deleteFileFromGCS(filePath);
        }));
        console.log("All deleted successfully.");
    }

      // --- 4. Prepare Request Data (using imported interface) ---
      const requestData: RequestItemToCreateShop = {
        shop: shopData,
        user: User,
        requestType: 'create',
        // status, _id, createdAt,Reason edited will be set by backend
      };

      // --- 5. Call createShopRequest API ---
      console.log('Submitting shop creation request:', requestData);
      const result = await editShopRequest(session.user.token, requestData, requestId);

      if (result.success) {
        console.log('Shop creation request successful:', result);
        router.push('/request?status=request_submitted');
      } else {
        throw new Error(result.message || 'Failed to submit shop creation request.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      // More specific error handling for Promise.all failures
      if (err instanceof AggregateError) {
           setError(`One or more file uploads failed: ${err.errors.map(e => e instanceof Error ? e.message : String(e)).join(', ')}`);
      } else {
           setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
        setIsReallySubmitting(false);
        setOpenConfirmDialog(false);
    }
  };

  // --- JSX ---
//   if (!session || session.user.role !== 'shopOwner') {
//       // Consider showing a loading state while session is undefined
//       return (
//           <div className="text-center my-10">
//               <p className="text-red-500 text-lg">Access Denied. You must be a Shop Owner to access this page.</p>
//           </div>
//       );
//   }

  // Function to display selected file names for multiple files
  const displaySelectedFileNames = (files: File[]): string => {
      if (files.length === 0) return '';
      if (files.length === 1) return files[0].name;
      return `${files.length} files selected`;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Edit Shop Request Form
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Section: Shop Detail (No changes needed here unless interface dictates) */}
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

        {/* Section: Location and Description (No changes needed here unless interface dictates) */}
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
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Description & Reason</h3>
                 {/* Description */}
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

        {/* Section: Open-Close time, Image, License */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Open-Close time */}
            <div className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Operating Hours</h3>
                 {/* Open Time */}
                 <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openTime">Open Time <span className="text-red-500">*</span></label>
                    <input
                       type="time" id="openTime" name="openTime" required
                       value={formData.openTime} onChange={handleInputChange}
                       className="shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                 </div>
                 {/* Close Time */}
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
            {/* Your Shop image (Multiple) */}
             <div className="border p-4 rounded-md">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Shop Images:</h3>
                 <ManageFileUpload
                    id="shopImageFiles"
                    name="shopImageFiles"
                    label="Shop Images (Optional)"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                    fileName={displaySelectedFileNames(formData.shopImageFiles)}
                    existingFiles={formData.oldshopImageURL as string[]}
                    multiple={true}
                    required={true}
                    onDeletedUrlsChange={setDeletedImageURLs}
                    onCurrentFilesChange={setCurrentShopImageURLs}
                    />
             </div>

             {/* ใบรับรอง (Single) */}
             <div className="border p-4 rounded-md">
                 <h3 className="text-lg font-semibold mb-4 text-gray-800">Certificate:</h3>
                 <ManageFileUpload
                    id="licenseDocFile"
                    name="licenseDocFile"
                    label="Certificate (Optional)"
                    accept=".pdf, image/jpeg, image/png"
                    onChange={handleFileChange}
                    fileName={formData.licenseDocFile?.name}
                    existingFiles={formData.oldCertImageURL as string[]}
                    required={true}
                    onDeletedUrlsChange={setDeletedCertImageURLs}
                    onCurrentFilesChange={setCurrentCertImageURLs}
                    />
             </div>

        {/* Section: Services offered */}
        <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Services offered:</h3>
            <ServiceForm onAddService={handleAddService} />
            <ServiceList services={formData.services} onDeleteService={handleDeleteService} />
        </div>

        {/* Submit Button */}
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

      </form>
      
      <Dialog disableScrollLock open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}
  PaperProps={{
    className: 'w-full max-w-lg rounded-lg'
  }}
>
  <DialogTitle>Confirm Edit</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to submit the changes to your shop request?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => setOpenConfirmDialog(false)}
      disabled={isReallySubmitting}
    >
      Back
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={handleConfirmEdit}
      disabled={isReallySubmitting}
      startIcon={isReallySubmitting ? (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : null}
    >
      {isReallySubmitting ? 'Submitting...' : 'Confirm'}
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default EditShopRequestForm;
