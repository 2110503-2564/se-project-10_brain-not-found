// src/components/EditRequestForm.tsx
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

import FileUploadInput from './FileUploadInput'; // ยังคงใช้ตัวนี้สำหรับ Input
// --- Import API functions ---
import editShopRequest from '@/libs/editShopRequest';
import { uploadFileToGCSAction, deleteFileFromGCS } from '@/libs/gcsUpload'; // Adjust path if needed
import getRequest from '@/libs/getRequest';
import Image from 'next/image';
import { getSignedUrlForGCSPath } from "@/libs/gcsGetSignedPath";

interface ShopFormData {
    shopName: string;
    phoneNumber: string;
    shopType: string;
    address: string;
    postalcode: string;
    region: string;
    province: string;
    district: string;
    description: string; // <--- มีอยู่แล้ว
    openTime: string;
    closeTime: string;
    services: Service[]; // Keep client-side ID for list management
    shopImageFiles: File[]; // Changed to array for multiple files
    // oldshopImageURL: String[];
    // oldCertImageURL: String[];
    licenseDocFile: File | null; // Keep as single file for now, adjust if needed
}

interface EditShopFormProps {
    requestId: string;
  }

const EditShopRequestForm: React.FC<EditShopFormProps> = ({requestId}) => {
  const router = useRouter();
  const { data: session , status } = useSession();

  const [formData, setFormData] = useState<ShopFormData>({
    shopName: '',
    phoneNumber: '',
    shopType: '',
    address: '',
    postalcode: '',
    region: '',
    province: '',
    district: '',
    description: '', // <--- มีอยู่แล้ว
    openTime: '',
    closeTime: '',
    services: [],
    shopImageFiles: [], // Initialize as empty array
    licenseDocFile: null,
    // oldshopImageURL: [],
    // oldCertImageURL: [],

  });

// State สำหรับจัดการไฟล์ *เดิม*
    const [currentShopImageURLs, setCurrentShopImageURLs] = useState<string[]>([]);
    const [currentCertImageURLs, setCurrentCertImageURLs] = useState<string[]>([]); // เก็บเป็น Array เผื่อกรณี Error
    const [deletedImageURLs, setDeletedImageURLs] = useState<string[]>([]);
    const [deletedCertImageURLs, setDeletedCertImageURLs] = useState<string[]>([]);

    const [originalCertificatePath, setOriginalCertificatePath] = useState<string | null>(null);

    // State สำหรับ Preview ไฟล์ *ใหม่*
    const [shopImagePreviewUrls, setShopImagePreviewUrls] = useState<string[]>([]);
    const [licensePreviewUrl, setLicensePreviewUrl] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false); // ใช้ isReallySubmitting แทนได้
    const [error, setError] = useState<string | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [isReallySubmitting, setIsReallySubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // State สำหรับ Loading ข้อมูล

// --- useEffect for Auth & Data Fetching ---
    useEffect(() => {
        if (status === 'loading') return; // รอ session โหลดเสร็จ

        if (!session || !session.user || !session.user.token || !requestId) {
            router.push('/'); // Redirect ถ้าไม่มี session หรือ requestId
            return;
        }

        const fetchRequest = async () => {
            setIsLoadingData(true);
            setError(null);
            try {
                const result = await getRequest(requestId, session.user.token);

                if (!result.success || !result.data) {
                    throw new Error('Failed to load request data.');
                }

                // ตรวจสอบ Role และ Ownership
                if (session.user.role !== 'shopOwner' || result.data.user?._id !== session.user._id) {
                    console.warn("Access denied: User is not the owner or not a shopOwner.");
                    router.push('/');
                    return;
                }

                // ตั้งค่า formData (เฉพาะ field ที่แก้ไขได้)
                setFormData({
                    shopName: result.data.shop?.name || '',
                    phoneNumber: result.data.shop?.tel || '',
                    shopType: result.data.shop?.shopType || '',
                    address: result.data.shop?.address || '',
                    postalcode: result.data.shop?.postalcode || '',
                    region: result.data.shop?.region || '',
                    province: result.data.shop?.province || '',
                    district: result.data.shop?.district || '',
                    description: result.data.shop?.desc || '', // <--- มีอยู่แล้ว
                    openTime: result.data.shop?.openTime || '',
                    closeTime: result.data.shop?.closeTime || '',
                    // เพิ่ม ID ชั่วคราวให้ service เพื่อใช้ใน ServiceList
                    services: result.data.shop?.services?.map((s: any) => ({ ...s, id: crypto.randomUUID() })) || [],
                    shopImageFiles: [], // เริ่มต้นไฟล์ใหม่เป็น Array ว่าง
                    licenseDocFile: null, // เริ่มต้นไฟล์ใหม่เป็น null
                });

                const certPath = result.data.shop?.certificate;
                setOriginalCertificatePath(certPath || null);

                let certificateSignedUrl: string | null = null;
                if (certPath) {
                    try {
                        // ตรวจสอบเบื้องต้นว่า path ที่ได้มาเป็น URL อยู่แล้วหรือไม่
                        if (certPath.startsWith('http')) {
                            console.warn("Fetched certificate path looks like a URL:", certPath);
                            // อาจจะต้องมี logic เพิ่มเติมเพื่อดึง path จริงๆ ออกมา
                        }
                        certificateSignedUrl = await getSignedUrlForGCSPath(certPath);
                    } catch (err) {
                        console.error("Failed to get signed URL for certificate:", err);
                    }
                }
                setCurrentCertImageURLs(certificateSignedUrl ? [certificateSignedUrl] : []); // เก็บ signed URL สำหรับแสดงผล
                setCurrentShopImageURLs(result.data.shop?.picture || []);
                setDeletedImageURLs([]); // Reset deleted lists
                setDeletedCertImageURLs([]);

            } catch (err) {
                console.error("Error loading request data:", err);
                setError(err instanceof Error ? err.message : 'Error loading request data.');
                // อาจจะ Redirect หรือแสดงข้อความ Error ที่ชัดเจนขึ้น
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchRequest();
    }, [session, status, requestId, router]); // Dependency array ที่ถูกต้อง

    // --- useEffect for Preview URL Management (สำหรับไฟล์ใหม่) ---
    useEffect(() => {
        console.log('[Preview Debug Edit] useEffect triggered');
        const newShopImageUrls = formData.shopImageFiles.map(file => {
            const url = URL.createObjectURL(file);
            console.log(`[Preview Debug Edit] Created Shop Image URL: ${url} for ${file.name}`);
            return url;
        });
        setShopImagePreviewUrls(newShopImageUrls);

        let newLicenseUrl: string | null = null;
        if (formData.licenseDocFile) {
            newLicenseUrl = URL.createObjectURL(formData.licenseDocFile);
            console.log(`[Preview Debug Edit] Created License URL: ${newLicenseUrl} for ${formData.licenseDocFile.name}`);
        } else {
            console.log('[Preview Debug Edit] No new license file to create URL for.');
        }
        setLicensePreviewUrl(newLicenseUrl);

        return () => {
            console.log('[Preview Debug Edit] Cleanup: Revoking URLs');
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
    setError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

// ปรับ handleFileChange ให้เพิ่มรูปภาพใหม่
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        console.log(`[Debug Edit] handleFileChange triggered for name: "${name}"`, files);
        setError(null);

        if (files && files.length > 0) {
            if (name === 'shopImageFiles') {
                const newFilesArray = Array.from(files);
                setFormData((prev) => {
                    // รวม Array ไฟล์ใหม่กับ Array ไฟล์ใหม่ที่เลือก
                    const combinedFiles = [...prev.shopImageFiles, ...newFilesArray];
                    // *** เพิ่ม: จำกัดจำนวนไฟล์ใหม่ + ไฟล์เดิม ไม่ให้เกิน 5 ***
                    const totalImagesAfterAdd = currentShopImageURLs.length + combinedFiles.length;
                    if (totalImagesAfterAdd > 5) {
                        setError("Cannot add more images. Maximum limit is 5.");
                        return prev; // ไม่ต้องอัปเดต state ถ้าเกิน limit
                    }
                    const newState = { ...prev, shopImageFiles: combinedFiles };
                    console.log('[Debug Edit] New state after appending shopImageFiles:', newState);
                    return newState;
                });
            } else { // Handles 'licenseDocFile' (แทนที่ไฟล์ใหม่)
                const fileToSet = files[0];
                // *** เพิ่ม: ตรวจสอบว่ามี Certificate เดิมอยู่หรือไม่ ถ้ามี ให้แจ้งเตือนหรือจัดการ ***
                if (currentCertImageURLs.length > 0) {
                    // อาจจะ alert หรือ set error
                    console.warn("Replacing existing certificate with a new one.");
                    // หรือจะ Mark อันเก่าให้ลบอัตโนมัติก็ได้
                    // handleMarkForDeletion(currentCertImageURLs[0], 'certificate');
                }
                setFormData((prev) => {
                    const newState = { ...prev, [name]: fileToSet };
                    console.log(`[Debug Edit] New state after setting ${name}:`, newState);
                    return newState;
                });
            }
        }
        // Reset input value เพื่อให้เลือกไฟล์เดิมซ้ำได้
        e.target.value = '';
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

  // Handlers สำหรับจัดการไฟล์ *ใหม่* ที่เลือก
  const handleRemoveNewShopImage = (indexToRemove: number) => {
    setError(null);
    setFormData((prev) => ({
        ...prev,
        shopImageFiles: prev.shopImageFiles.filter((_, index) => index !== indexToRemove),
    }));
};

const handleRemoveNewLicense = () => {
    setError(null);
    setFormData((prev) => ({
        ...prev,
        licenseDocFile: null,
    }));
};

const handleClearAllNewShopImages = () => {
    setError(null);
    setFormData((prev) => ({
        ...prev,
        shopImageFiles: [],
    }));
    console.log('[Debug Edit] Cleared all new shop images.');
};

// Handlers สำหรับจัดการไฟล์ *เดิม*
const handleMarkForDeletion = (urlToDelete: string, type: 'shop' | 'certificate') => {
  if (type === 'shop') {
      setCurrentShopImageURLs((prev) => prev.filter(url => url !== urlToDelete));
      setDeletedImageURLs((prev) => [...prev, urlToDelete]);
  } else {
      setCurrentCertImageURLs([]); // Certificate มีได้อันเดียว
      setDeletedCertImageURLs((prev) => [...prev, urlToDelete]);
  }
};

const handleRestoreDeleted = (urlToRestore: string, type: 'shop' | 'certificate') => {
  if (type === 'shop') {
      // *** เพิ่ม: เช็คจำนวนก่อน Restore ไม่ให้เกิน 5 ***
      if (currentShopImageURLs.length + formData.shopImageFiles.length >= 5) {
           setError("Cannot restore image. Maximum limit of 5 reached.");
           return;
      }
      setDeletedImageURLs((prev) => prev.filter(url => url !== urlToRestore));
      setCurrentShopImageURLs((prev) => [...prev, urlToRestore]);
  } else {
      // *** เพิ่ม: เช็คว่ามี Certificate ใหม่ หรือ Certificate เดิมอื่นอยู่หรือไม่ ***
      if (formData.licenseDocFile || currentCertImageURLs.length > 0) {
          setError("Cannot restore certificate. Another certificate already exists or is selected.");
          return;
      }
      setDeletedCertImageURLs((prev) => prev.filter(url => url !== urlToRestore));
      setCurrentCertImageURLs([urlToRestore]);
  }
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

    // --- Validation (ปรับปรุง) ---
    const validationErrors: string[] = []; // ใช้ Array เก็บ Error เหมือนหน้า Add

    // --- Required Field Checks ---
    if (!formData.shopName.trim()) validationErrors.push("Shop Name is required.");
    if (!formData.phoneNumber.trim()) validationErrors.push("Phone number is required.");
    if (!formData.shopType) validationErrors.push("Shop Type is required.");
    if (!formData.address.trim()) validationErrors.push("Address is required.");
    if (!formData.postalcode.trim()) validationErrors.push("Postal Code is required.");
    if (!formData.region.trim()) validationErrors.push("Region is required.");
    if (!formData.province.trim()) validationErrors.push("Province is required.");
    if (!formData.district.trim()) validationErrors.push("District is required.");
    if (!formData.description.trim()) validationErrors.push("Shop Description is required."); // <--- เพิ่มการตรวจสอบ description
    if (!formData.openTime) validationErrors.push("Open Time is required.");
    if (!formData.closeTime) validationErrors.push("Close Time is required.");

    // --- File Checks ---
    const totalCurrentImages = currentShopImageURLs.length + formData.shopImageFiles.length;
    if (totalCurrentImages < 1) {
        validationErrors.push(`Please select at least one shop image.`);
    } else if (totalCurrentImages > 5) {
        validationErrors.push(`Maximum 5 shop images allowed (Current: ${currentShopImageURLs.length}, New: ${formData.shopImageFiles.length}).`);
    }

    const totalCurrentCert = currentCertImageURLs.length + (formData.licenseDocFile ? 1 : 0);
    if (totalCurrentCert !== 1) {
        validationErrors.push(`You must have exactly 1 certificate (Current: ${currentCertImageURLs.length}, New: ${formData.licenseDocFile ? 1 : 0}).`);
    }

    // --- Check if there are any validation errors ---
    if (validationErrors.length > 0) {
        // รวม error เป็น string เดียว คั่นด้วย ", " (หรือจะแสดงเป็น list ก็ได้)
        setError(`Validation failed: ${validationErrors.join(', ')}`);
        console.log("Validation Errors (Edit):", validationErrors);
        return; // Stop submission
    }

    // --- ถ้าผ่าน Validation ---
    setOpenConfirmDialog(true);
    };


    const handleConfirmEdit = async () => {
    if (!session || !session.user || !session.user.token || session.user.role !== 'shopOwner') {
        setError('Authentication failed or insufficient permissions.');
        setOpenConfirmDialog(false);
        return;
    }

    setIsReallySubmitting(true);
    setError(null);

    let uploadedNewPictureUrls: string[] = [];
    let uploadedNewCertificateUrl: string | undefined = undefined;
    let pathsToDeleteOnGCS: string[] = [];

    try {
       // --- 1. อัปโหลดไฟล์ *ใหม่* (ถ้ามี) ---
            if (formData.shopImageFiles.length > 0) {
                console.log(`Uploading ${formData.shopImageFiles.length} new shop images...`);
                const uploadPromises = formData.shopImageFiles.map(file => {
                    const fileFormData = new FormData();
                    fileFormData.append('file', file);
                    fileFormData.append('folder', 'shop_pictures/');
                    return uploadFileToGCSAction(fileFormData);
                });
                uploadedNewPictureUrls = await Promise.all(uploadPromises);
                console.log('New shop images uploaded:', uploadedNewPictureUrls);
            }

            if (formData.licenseDocFile) {
                console.log("Uploading new license document...");
                const certFormData = new FormData();
                certFormData.append('file', formData.licenseDocFile);
                certFormData.append('folder', 'certificates');
                uploadedNewCertificateUrl = await uploadFileToGCSAction(certFormData);
                console.log("New license document uploaded:", uploadedNewCertificateUrl);
            }

      // --- 3. เตรียมข้อมูลสำหรับ API ---
      // รวม URL รูปภาพ: รูปเดิมที่เหลืออยู่ + รูปใหม่ที่อัปโหลด
      const finalPictureUrls = [...currentShopImageURLs, ...uploadedNewPictureUrls];
      // เลือก URL ใบรับรอง: อันใหม่ที่อัปโหลด หรืออันเดิมที่เหลืออยู่
      let finalCertificatePath: string | undefined = undefined;

      if (uploadedNewCertificateUrl) {
        // กรณีที่ 1: มีการอัปโหลดไฟล์ใหม่ -> ใช้ path ใหม่, ลบ path เดิม (ถ้ามี)
        finalCertificatePath = uploadedNewCertificateUrl;
        if (originalCertificatePath) {
            // เพิ่ม path เดิมใน list ที่จะลบออกจาก GCS
            pathsToDeleteOnGCS.push(originalCertificatePath);
        }
    } else if (originalCertificatePath) {
        // กรณีที่ 2: ไม่มีไฟล์ใหม่ -> ใช้ path เดิม (Validation ทำให้มั่นใจว่าอันเดิมไม่ได้ถูกลบ)
        finalCertificatePath = originalCertificatePath;
        // ไม่ต้องเพิ่ม originalCertificatePath ใน pathsToDeleteOnGCS
    } else {
        // กรณีนี้ไม่ควรเกิดขึ้น ถ้า Validation ทำงานถูกต้อง (totalCurrentCert === 1)
        console.error("Error: Inconsistent state - No new certificate and no original path found after validation passed.");
        throw new Error("Could not determine the final certificate path due to inconsistent state.");
    }

    // --- 3. เตรียมข้อมูลสำหรับ API (ใช้เฉพาะ Path) ---
      const shopData: ShopItemForRequest = {
          name: formData.shopName,
          tel: formData.phoneNumber,
          shopType: formData.shopType,
          address: formData.address,
          postalcode: formData.postalcode,
          region: formData.region,
          province: formData.province,
          district: formData.district,
          desc: formData.description, // <--- มีอยู่แล้ว
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          services: formData.services.map(({ id, ...rest }) => rest), // เอา client-side id ออก
          picture: finalPictureUrls,
          certificate: finalCertificatePath,
      };

      const User: User = {
        _id: session.user._id,
        name: session.user.name,
      };

      const requestData: RequestItemToCreateShop = {
        shop: shopData,
        user: User,
        requestType: 'create', // Backend อาจจะเปลี่ยนเป็น 'edit' ให้เอง หรือเราส่ง 'edit' ไปเลยก็ได้
        // status, _id, createdAt,Reason edited will be set by backend
      };

      // --- 4. Call editShopRequest API ---
      console.log('Submitting shop edit request:', requestData);
      const result = await editShopRequest(session.user.token, requestData, requestId);


      if (result.success) {
        console.log('Shop edit request successful:', result);

        // --- 5. ลบไฟล์ *เก่า* ที่ถูก Mark ไว้ (ทำหลัง API สำเร็จ) ---
        const allUrlsToDelete = [...deletedImageURLs, ...deletedCertImageURLs];
        if (allUrlsToDelete.length > 0) {
            console.log("Deleting marked old files:", allUrlsToDelete);
            await Promise.all(allUrlsToDelete.map(async (url) => {
                try {
                    // Assuming the URL is the full GCS path or can be derived
                    // You might need a helper function to extract the path from the URL if needed
                    const filePath = url; // Adjust if URL needs parsing
                    if (filePath) {
                        await deleteFileFromGCS(filePath);
                        console.log(`Successfully deleted: ${filePath}`);
                    } else {
                        console.warn(`Skipping deletion for invalid path derived from URL: ${url}`);
                    }
                } catch (deleteError) {
                    console.error(`Failed to delete file ${url}:`, deleteError);
                    // Optionally: Collect failed deletions to inform the user, but don't block success flow
                }
            }));
            console.log("Finished attempting deletions.");
        }
        if (pathsToDeleteOnGCS.length > 0) {
            console.log("Deleting marked old files from GCS:", pathsToDeleteOnGCS);
            await Promise.all(pathsToDeleteOnGCS.map(async (path) => {
                try {
                    if (path) {
                        await deleteFileFromGCS(path);
                        console.log(`Successfully deleted from GCS: ${path}`);
                    }
                } catch (deleteError) {
                    console.error(`Failed to delete file ${path} from GCS:`, deleteError);
                }
            }));
            console.log("Finished attempting GCS deletions.");
        }
        
        alert("Shop edit request submitted successfully!");
        
        router.push('/request?status=request_submitted'); // Redirect after successful edit and deletion
      } else {
        // If API call fails, throw error to trigger cleanup of *newly* uploaded files
        throw new Error(result.message || 'Failed to submit shop edit request.');
      }

    } catch (err) {
      console.error('Submission failed:', err);

      // --- Cleanup: ลบไฟล์ *ใหม่* ที่อัปโหลดไปแล้ว ถ้าเกิด Error ---
      if (uploadedNewPictureUrls.length > 0 || uploadedNewCertificateUrl) {
        console.warn("Submission failed after new file upload. Attempting to delete newly uploaded files...");
        const newFilesToDelete = [...uploadedNewPictureUrls];
        if (uploadedNewCertificateUrl) {
            newFilesToDelete.push(uploadedNewCertificateUrl);
        }

        try {
            await Promise.allSettled(newFilesToDelete.map(async (pathOrUrl) => {
                try {
                    await deleteFileFromGCS(pathOrUrl);
                    console.log(`Successfully deleted orphaned new file: ${pathOrUrl}`);
                } catch (deleteError) {
                    console.error(`Failed to delete orphaned new file ${pathOrUrl}:`, deleteError);
                }
            }));
            console.log("Finished attempting to delete orphaned new files.");
        } catch (cleanupError) {
            console.error("Error during new file cleanup process:", cleanupError);
        }
    }

      // Set error message for the user
      if (err instanceof AggregateError) {
           setError(`One or more file uploads failed: ${err.errors.map(e => e instanceof Error ? e.message : String(e)).join(', ')}`);
      } else {
           setError(err instanceof Error ? err.message : 'An unknown error occurred during submission.');
      }
    } finally {
        setIsReallySubmitting(false);
        setOpenConfirmDialog(false);
    }
  };

  // --- JSX ---
    if (isLoadingData || status === 'loading') {
        return <div className="text-center my-10"><p>Loading...</p></div>; // แสดง Loading
    }

    // Check session after loading
    if (status !== 'authenticated' || !session || !session.user) {
        return <div className="text-center my-10"><p className="text-red-500">Access Denied.</p></div>;
  }

  // Helper function to check if a specific field has an error
  const hasError = (fieldName: string): boolean => {
    return !!error && error.toLowerCase().includes(fieldName.toLowerCase());
  };


  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-4xl mx-auto my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Edit Shop Request Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* --- Sections: Shop Detail, Location, Description, Operating Hours (เหมือนเดิม) --- */}
            {/* ... (JSX ของ Sections อื่นๆ) ... */}
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
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Shop Name") ? 'border-red-500' : ''}`}
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
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Phone number") ? 'border-red-500' : ''}`}
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
                        className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white ${hasError("Shop Type") ? 'border-red-500' : ''}`}
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Group */}
                <div className="border p-4 rounded-md h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        {/* Address */}
                        <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Address <span className="text-red-500">*</span></label>
                        <input type="text" id="address" name="address" placeholder="Address" required value={formData.address} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Address") ? 'border-red-500' : ''}`} />
                        </div>
                        {/* Postal Code */}
                        <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postalcode">Postal Code <span className="text-red-500">*</span></label>
                        <input type="text" id="postalcode" name="postalcode" placeholder="Postal Code" required value={formData.postalcode} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Postal Code") ? 'border-red-500' : ''}`} />
                        </div>
                        {/* Region */}
                        <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="region">Region <span className="text-red-500">*</span></label>
                        <input type="text" id="region" name="region" placeholder="Region" required value={formData.region} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Region") ? 'border-red-500' : ''}`} />
                        </div>
                        {/* Province */}
                        <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="province">Province <span className="text-red-500">*</span></label>
                        <input type="text" id="province" name="province" placeholder="Province" required value={formData.province} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Province") ? 'border-red-500' : ''}`} />
                        </div>
                        {/* District */}
                        <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="district">District <span className="text-red-500">*</span></label>
                        <input type="text" id="district" name="district" placeholder="District" required value={formData.district} onChange={handleInputChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("District") ? 'border-red-500' : ''}`} />
                        </div>
                    </div>
                </div>

                {/* Description Group */}
                <div className="border p-4 rounded-md flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Description</h3>
                    {/* --- เพิ่ม * สีแดง และ required --- */}
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Shop Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description" name="description"
                        placeholder="Shop description" // <--- เอา (optional) ออก
                        rows={12}
                        required // <--- เพิ่ม required
                        value={formData.description} onChange={handleInputChange}
                        // <--- เพิ่ม class เช็ค error ---
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none mb-4 ${hasError("Shop Description") ? 'border-red-500' : ''}`}
                    ></textarea>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Open-Close time */}
                <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Operating Hours</h3>
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openTime">Open Time <span className="text-red-500">*</span></label>
                        <input
                        type="time" id="openTime" name="openTime" required
                        value={formData.openTime} onChange={handleInputChange}
                        className={`shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Open Time") ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="closeTime">Close Time <span className="text-red-500">*</span></label>
                        <input
                        type="time" id="closeTime" name="closeTime" required
                        value={formData.closeTime} onChange={handleInputChange}
                        className={`shadow appearance-none border rounded w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError("Close Time") ? 'border-red-500' : ''}`}
                        />
                    </div>
                </div>
            </div>


            {/* --- Section: Shop Images (ปรับปรุง) --- */}
            <div className={`border p-4 rounded-md space-y-4 ${hasError("image") ? 'border-red-500' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800">Shop Images (1-5 images)</h3>

                {/* 1. Current Images */}
                {currentShopImageURLs.length > 0 && (
                    <div className="border border-dashed border-blue-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-700 mb-2">Current Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {currentShopImageURLs.map((url) => (
                                <div key={url} className="relative group border p-1 rounded shadow-sm">
                                    <Image src={url} alt="Current Shop Image" width={100} height={100} className="object-cover rounded w-full h-24" />
                                    <button
                                        type="button"
                                        onClick={() => handleMarkForDeletion(url, 'shop')}
                                        className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Mark ${url} for deletion`}
                                    >
                                        {/* Delete Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Newly Selected Images Preview */}
                {shopImagePreviewUrls.length > 0 && (
                    <div className="border border-dashed border-green-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-green-700 mb-2">New Images to Upload:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {shopImagePreviewUrls.map((url, index) => (
                                <div key={index} className="relative group border p-1 rounded shadow-sm">
                                    <img src={url} alt={`New Shop Preview ${index + 1}`} className="object-cover rounded w-full h-24" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewShopImage(index)}
                                        className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Remove new image ${index + 1}`}
                                    >
                                        {/* Remove Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Clear All New Images Button */}
                        <button
                            type="button"
                            onClick={handleClearAllNewShopImages}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Clear All New Images
                        </button>
                    </div>
                )}

                {/* 3. Deleted Images (Restore Option) */}
                {deletedImageURLs.length > 0 && (
                    <div className="border border-dashed border-red-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-red-700 mb-2">Images Marked for Deletion:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {deletedImageURLs.map((url) => (
                                <div key={url} className="relative group border p-1 rounded shadow-sm opacity-60">
                                    <Image src={url} alt="Deleted Shop Image" width={100} height={100} className="object-cover rounded w-full h-24" />
                                    <button
                                        type="button"
                                        onClick={() => handleRestoreDeleted(url, 'shop')}
                                        className="absolute top-0 right-0 m-1 bg-blue-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Restore ${url}`}
                                    >
                                        {/* Restore Icon (e.g., Undo) */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. File Input Button */}
                <FileUploadInput
                    id="shopImageFiles"
                    name="shopImageFiles"
                    label="Add More Shop Images"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                    multiple={true}
                    required={currentShopImageURLs.length + formData.shopImageFiles.length === 0} // Required ถ้าไม่มีรูปเลย
                    // Disable button if max limit reached
                    disabled={currentShopImageURLs.length + formData.shopImageFiles.length >= 5}
                />
                 {/* Display message if max limit reached */}
                {(currentShopImageURLs.length + formData.shopImageFiles.length >= 5) &&
                    <p className="text-sm text-red-500 mt-1">Maximum 5 images reached.</p>
                }

            </div>

            {/* --- Section: Certificate (ปรับปรุง) --- */}
            <div className={`border p-4 rounded-md space-y-4 ${hasError("certificate") ? 'border-red-500' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800">Certificate</h3>

                {/* 1. Current Certificate */}
                {currentCertImageURLs.length > 0 && (
                    <div className="border border-dashed border-blue-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-700 mb-2">Current Certificate:</p>
                        <div className="relative group border p-1 rounded shadow-sm inline-block">
                            {currentCertImageURLs[0].toLowerCase().endsWith('.pdf') ? (
                                 <a href={currentCertImageURLs[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View PDF Certificate</a>
                            ) : (
                                 <Image src={currentCertImageURLs[0]} alt="Current Certificate" width={150} height={100} className="object-contain rounded h-20 border" />
                            )}
                            <button
                                type="button"
                                onClick={() => handleMarkForDeletion(currentCertImageURLs[0], 'certificate')}
                                className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                aria-label={`Mark ${currentCertImageURLs[0]} for deletion`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Newly Selected Certificate Preview */}
                {licensePreviewUrl && formData.licenseDocFile && (
                    <div className="border border-dashed border-green-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-green-700 mb-2">New Certificate to Upload:</p>
                         <div className="relative group border p-1 rounded shadow-sm inline-block">
                            {formData.licenseDocFile.type.startsWith('image/') ? (
                                <img src={licensePreviewUrl} alt="New Certificate Preview" className="object-contain rounded h-20 border"/>
                            ) : (
                                <a href={licensePreviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">
                                    {formData.licenseDocFile.name}
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={handleRemoveNewLicense}
                                className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove new certificate"
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                 )}

                {/* 3. Deleted Certificate (Restore Option) */}
                {deletedCertImageURLs.length > 0 && (
                    <div className="border border-dashed border-red-300 p-3 rounded-md">
                        <p className="text-sm font-medium text-red-700 mb-2">Certificate Marked for Deletion:</p>
                        <div className="relative group border p-1 rounded shadow-sm inline-block opacity-60">
                            {deletedCertImageURLs[0].toLowerCase().endsWith('.pdf') ? (
                                 <span className="text-gray-500">PDF Certificate (Marked for deletion)</span>
                            ) : (
                                 <Image src={deletedCertImageURLs[0]} alt="Deleted Certificate" width={150} height={100} className="object-contain rounded h-20 border" />
                            )}
                            <button
                                type="button"
                                onClick={() => handleRestoreDeleted(deletedCertImageURLs[0], 'certificate')}
                                className="absolute top-0 right-0 m-1 bg-blue-500 text-white rounded-full p-1 text-xs leading-none opacity-80 group-hover:opacity-100 transition-opacity"
                                aria-label={`Restore ${deletedCertImageURLs[0]}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. File Input Button */}
                <FileUploadInput
                    id="licenseDocFile"
                    name="licenseDocFile"
                    label="Add/Replace Certificate"
                    accept=".pdf, image/jpeg, image/png"
                    onChange={handleFileChange}
                    multiple={false}
                    required={currentCertImageURLs.length + (formData.licenseDocFile ? 1 : 0) === 0} // Required ถ้าไม่มีเลย
                    // Disable ถ้ามี Certificate อยู่แล้ว (ทั้งเก่าและใหม่)
                    disabled={currentCertImageURLs.length + (formData.licenseDocFile ? 1 : 0) >= 1}
                />
                {/* Display message if certificate exists */}
                {(currentCertImageURLs.length + (formData.licenseDocFile ? 1 : 0) >= 1) &&
                    <p className="text-sm text-gray-500 mt-1">A certificate is already present. Adding a new one will replace the current one upon submission.</p>
                }
            </div>


            {/* --- Section: Services offered (เหมือนเดิม) --- */}
            <div className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Services offered:</h3>
                <ServiceForm onAddService={handleAddService} />
                <ServiceList services={formData.services} onDeleteService={handleDeleteService} />
            </div>

            {/* --- Submit Button --- */}
            <div className="text-center pt-4">
                <button
                    type="submit"
                    disabled={isReallySubmitting} // ใช้ isReallySubmitting
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                    isReallySubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isReallySubmitting ? 'Submitting...' : 'Submit Changes'}
                </button>
            </div>
        </form>

        <div className="py-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        {/* --- แสดง Error แบบ List ถ้าเป็น Validation Error --- */}
                        {typeof error === 'string' && error.startsWith('Validation failed:') ? (
                            <ul className="list-disc list-inside mt-1">
                                {error.substring('Validation failed:'.length)
                                      .split(/\s*,\s*/) // Split by comma and optional spaces
                                      .filter(msg => msg.trim() !== '') // Filter out empty strings
                                      .map((errMsg, index) => (
                                          <li key={index}>{errMsg.trim()}</li> // Trim whitespace
                                      ))
                                }
                            </ul>
                        ) : typeof error === 'string' ? (
                            <span className="block sm:inline ml-1">{error}</span>
                        ) : null }
                    </div>
                )}
            </div>

        {/* --- Confirmation Dialog (เหมือนเดิม) --- */}
        <Dialog disableScrollLock open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} /* ... */ >
            <DialogTitle>Confirm Edit</DialogTitle>
            <DialogContent>
                <DialogContentText>
                Are you sure you want to submit the changes to your shop request?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenConfirmDialog(false)} disabled={isReallySubmitting}>Back</Button>
                <Button variant="contained" color="primary" onClick={handleConfirmEdit} disabled={isReallySubmitting} /* ... */ >
                {isReallySubmitting ? 'Submitting...' : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    </div>
);
};

export default EditShopRequestForm;
