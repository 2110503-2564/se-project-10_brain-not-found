'use server'
// ... (ส่วนประกาศ import และ setup GCS client) ...
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Google Cloud Storage.
 * If the folder is 'shop_pictures/', the file is made public and its public URL is returned.
 * Otherwise, the GCS object path is returned.
 *
 * @param formData FormData containing 'file' (the File object) and 'folder' (destination path like 'shop_pictures/' or 'certificates/').
 * @returns A Promise that resolves with the public URL (e.g., 'https://storage.googleapis.com/your-bucket-name/shop_pictures/uuid.jpg') if the file is public,
 *          or the GCS object path (e.g., 'certificates/uuid.pdf') if the file is private.
 * @throws An error if the upload fails or validation fails.
 */
export async function uploadFileToGCSAction(
    formData: FormData
): Promise<string> { // Return type ยังคงเป็น string แต่อาจจะเป็น URL หรือ path

    const storage = new Storage();
    const bucketName = process.env.GCS_BUCKET_NAME;



    if (!bucketName) {
        console.error("GCS_BUCKET_NAME environment variable is not set.");
        throw new Error('GCS Bucket Name not configured.');
    }

    // --- Extract data from FormData ---
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder')?.toString() || 'uploads/';
    const allowedTypesString = formData.get('allowedTypes')?.toString();
    const defaultAllowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const allowedTypes = allowedTypesString ? allowedTypesString.split(',') : defaultAllowedTypes;
    const maxSizeString = formData.get('maxSize')?.toString();
    const maxSize = maxSizeString ? parseInt(maxSizeString, 10) : 10 * 1024 * 1024; // Example default 10MB
    // --- End data extraction ---

    if (!file || file.size === 0) {
        throw new Error('No file provided or file is empty.');
    }

    // --- File Validation ---
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
    }
    if (file.size > maxSize) {
        throw new Error(`File size exceeds the limit of ${maxSize / 1024 / 1024}MB.`);
    }
    // --- End Validation ---

    try {
        // --- Generate unique filename AND specify the folder path ---
        const fileExtension = file.name.split('.').pop();
        const baseFilename = uuidv4();
        const filenameWithExtension = `${baseFilename}${fileExtension ? '.' + fileExtension : ''}`;
        const cleanFolder = folder.endsWith('/') ? folder : folder + '/';
        const gcsObjectPath = `${cleanFolder}${filenameWithExtension}`; // Path within the bucket

        const gcsFile = storage.bucket(bucketName).file(gcsObjectPath);

        const uploadStream = gcsFile.createWriteStream({
            metadata: { contentType: file.type },
            resumable: false,
        });

        const nodeReadableStream = Readable.fromWeb(file.stream() as any);

        console.log(`Uploading ${filenameWithExtension} to GCS bucket "${bucketName}" path "${gcsObjectPath}"...`);
        await pipeline(nodeReadableStream, uploadStream);
        console.log(`File ${filenameWithExtension} uploaded successfully.`);

        // --- Make public if needed and determine return value ---
        if (cleanFolder === 'shop_pictures/') {
            // Make shop pictures public
            await gcsFile.makePublic();
            console.log(`   -> Made public.`);
            // Construct the full public URL
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsObjectPath}`;
            console.log(`   -> Public URL: ${publicUrl}`);
            return publicUrl; // <--- Return the public URL
        } else {
            // For other folders (like certificates), keep private and return the path
            console.log(`   -> Kept private.`);
            return gcsObjectPath; // <--- Return the GCS object path
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during GCS upload.';
        console.error('Error uploading file to GCS:', error);
        throw new Error(`GCS Upload failed: ${errorMessage}`);
    }
}

// export async function deleteFileFromGCS(filePath: string): Promise<void> {
//     if (!bucketName) {
//         console.error("GCS_BUCKET_NAME environment variable is not set.");
//         throw new Error('GCS Bucket Name not configured for deletion.');
//     }
//     if (!filePath || typeof filePath !== 'string' || filePath.trim() === '') {
//         console.warn("Attempted to delete an empty or invalid file path.");
//         // อาจจะ return หรือ throw error ขึ้นกับว่าต้องการ strict แค่ไหน
//         return; // ไม่ทำอะไรถ้า path ไม่ถูกต้อง
//     }

//     try {
//         const file = storage.bucket(bucketName).file(filePath);
//         console.log(`Attempting to delete GCS object: gs://${bucketName}/${filePath}`);
//         await file.delete();
//         console.log(`Successfully deleted GCS object: gs://${bucketName}/${filePath}`);
//     } catch (error: any) {
//         // Google Cloud Storage อาจจะ throw error ถ้าไฟล์ไม่มีอยู่แล้ว
//         // เราอาจจะไม่ถือว่าเป็น Error ร้ายแรงเสมอไป
//         if (error.code === 404) {
//             console.warn(`File not found during deletion attempt (maybe already deleted?): gs://${bucketName}/${filePath}`);
//             // ไม่ throw error ต่อ ปล่อยผ่าน
//         } else {
//             console.error(`Error deleting file gs://${bucketName}/${filePath} from GCS:`, error);
//             throw new Error(`Failed to delete file from GCS: ${error.message}`);
//         }
//     }
// }