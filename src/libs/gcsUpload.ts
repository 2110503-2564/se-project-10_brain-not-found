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
 * Uploads a file to Google Cloud Storage. Determines URL type based on folder.
 * - If folder is 'shop_pictures/', returns a public URL.
 * - Otherwise, returns a short-lived signed URL.
 *
 * @param formData FormData containing 'file' (the File object) and 'folder' (destination path like 'shop_pictures/' or 'certificates/').
 * @returns A Promise that resolves with the public URL or signed URL of the uploaded file.
 * @throws An error if the upload fails or validation fails.
 */
export async function uploadFileToGCSAction(
    formData: FormData // Accept FormData
): Promise<string> { // Return the URL

    if (!bucketName) {
        console.error("GCS_BUCKET_NAME environment variable is not set.");
        throw new Error('GCS Bucket Name not configured.');
    }

    // --- Extract data from FormData ---
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder')?.toString() || 'uploads/'; // Default to 'uploads/'
    // You might need to pass allowedTypes and maxSize via FormData as well, or keep them fixed/configured here
    const allowedTypesString = formData.get('allowedTypes')?.toString();
    // Define default allowed types based on potential folders or pass specific ones
    const defaultAllowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const allowedTypes = allowedTypesString ? allowedTypesString.split(',') : defaultAllowedTypes;
    const maxSizeString = formData.get('maxSize')?.toString();
    const maxSize = maxSizeString ? parseInt(maxSizeString, 10) : 10 * 1024 * 1024; // Example default 10MB
    // --- End data extraction ---

    if (!file || file.size === 0) {
        throw new Error('No file provided or file is empty.');
    }

    // --- File Validation (using extracted values) ---
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
        // Ensure folder path ends with a slash
        const cleanFolder = folder.endsWith('/') ? folder : folder + '/';
        const gcsObjectPath = `${cleanFolder}${filenameWithExtension}`;

        const gcsFile = storage.bucket(bucketName).file(gcsObjectPath);

        const uploadStream = gcsFile.createWriteStream({
            metadata: { contentType: file.type },
            resumable: false,
        });

        const nodeReadableStream = Readable.fromWeb(file.stream() as any);

        console.log(`Uploading ${filenameWithExtension} to GCS bucket "${bucketName}" path "${gcsObjectPath}"...`);
        await pipeline(nodeReadableStream, uploadStream);
        console.log(`File ${filenameWithExtension} uploaded successfully.`);

        // --- Decide URL type based on the folder ---
        if (cleanFolder === 'shop_pictures/') {
            // Make shop pictures public
            await gcsFile.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsObjectPath}`;
            console.log(`   -> Made public. URL: ${publicUrl}`);
            return publicUrl;
        } else {
            // Generate signed URL for other files (like certificates)
            const [signedUrl] = await gcsFile.getSignedUrl({
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000, // Example: 1 hour expiry for signed URLs
            });
            console.log(`   -> Generated signed URL (expires in 1 hour): ${signedUrl}`);
            return signedUrl;
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during GCS upload.';
        console.error('Error uploading file to GCS:', error);
        // Consider logging the specific file details that failed
        throw new Error(`GCS Upload failed: ${errorMessage}`);
    }
}
