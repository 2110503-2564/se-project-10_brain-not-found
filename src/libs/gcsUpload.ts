'use server'
// src/libs/gcsUpload.ts
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// --- Initialize GCS Client and Bucket Name ---
const storage = new Storage(); // อ่าน GOOGLE_APPLICATION_CREDENTIALS จาก env
const bucketName = process.env.GCS_BUCKET_NAME;

// --- Reusable File Upload Function ---

/**
 * Uploads a file to Google Cloud Storage and returns its path.
 * If the folder is 'shop_pictures/', the file is made public.
 *
 * @param formData FormData containing 'file' (the File object) and 'folder' (destination path like 'shop_pictures/' or 'certificates/').
 * @returns A Promise that resolves with the GCS object path (e.g., 'certificates/uuid.jpg') of the uploaded file.
 * @throws An error if the upload fails or validation fails.
 */
export async function uploadFileToGCSAction(
    formData: FormData // Accept FormData
): Promise<string> { // Return the GCS object path as a string

    if (!bucketName) {
        console.error("GCS_BUCKET_NAME environment variable is not set.");
        throw new Error('GCS Bucket Name not configured.');
    }

    // --- Extract data from FormData ---
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder')?.toString() || 'uploads/'; // Default to 'uploads/'
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
        const gcsObjectPath = `${cleanFolder}${filenameWithExtension}`; // <-- This is the path we want to return

        const gcsFile = storage.bucket(bucketName).file(gcsObjectPath);

        const uploadStream = gcsFile.createWriteStream({
            metadata: { contentType: file.type },
            resumable: false,
        });

        const nodeReadableStream = Readable.fromWeb(file.stream() as any);

        console.log(`Uploading ${filenameWithExtension} to GCS bucket "${bucketName}" path "${gcsObjectPath}"...`);
        await pipeline(nodeReadableStream, uploadStream);
        console.log(`File ${filenameWithExtension} uploaded successfully.`);

        // --- Make public if needed, but always return the path ---
        if (cleanFolder === 'shop_pictures/') {
            // Still make shop pictures public
            await gcsFile.makePublic();
            console.log(`   -> Made public.`);
        } else {
            console.log(`   -> Kept private.`);
        }

        return gcsObjectPath;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during GCS upload.';
        console.error('Error uploading file to GCS:', error);
        throw new Error(`GCS Upload failed: ${errorMessage}`);
    }
}