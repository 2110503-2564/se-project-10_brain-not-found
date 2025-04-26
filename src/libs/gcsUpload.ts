// src/libs/gcsUpload.ts
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// --- Initialize GCS Client and Bucket Name ---
// ควรทำครั้งเดียวในระดับ Application หรือ Module
const storage = new Storage(); // อ่าน GOOGLE_APPLICATION_CREDENTIALS จาก env
const bucketName = process.env.GCS_BUCKET_NAME;

// --- Reusable File Upload Function ---

/**
 * Uploads a file to Google Cloud Storage.
 *
 * @param fileObject The File object to upload.
 * @param targetFolderPath The destination folder path within the bucket (e.g., "shop_pictures/" or "certificates/"). Must end with '/'.
 * @param allowedTypes Optional array of allowed MIME types (e.g., ['image/jpeg', 'image/png']). Defaults to common image types and PDF.
 * @param maxSize Optional maximum file size in bytes. Defaults to 10MB.
 * @returns A Promise that resolves with the public URL of the uploaded file.
 * @throws An error if the upload fails or validation fails.
 */
export async function uploadFileToGCS(
    fileObject: File,
    targetFolderPath: string,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxSize: number = 10 * 1024 * 1024 // 10MB default
): Promise<string> {

    // --- Pre-checks ---
    if (!bucketName) {
        console.error("GCS_BUCKET_NAME environment variable is not set.");
        throw new Error('GCS Bucket Name is not configured on the server.');
    }
    if (!fileObject || fileObject.size === 0) {
        throw new Error('No file provided or file is empty.');
    }
    if (!targetFolderPath || !targetFolderPath.endsWith('/')) {
        // Ensure folder path ends with a slash for correct object naming
        throw new Error('Invalid target folder path. It must end with a "/".');
    }

    // --- File Validation ---
    if (!allowedTypes.includes(fileObject.type)) {
        throw new Error(`Invalid file type: ${fileObject.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    if (fileObject.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
        throw new Error(`File size (${(fileObject.size / 1024 / 1024).toFixed(1)}MB) exceeds the limit of ${maxSizeMB}MB.`);
    }
    // --- End Validation ---

    try {
        // --- Generate unique filename ---
        const fileExtension = fileObject.name.split('.').pop();
        const baseFilename = uuidv4();
        const filenameWithExtension = `${baseFilename}${fileExtension ? '.' + fileExtension : ''}`;
        const gcsObjectPath = `${targetFolderPath}${filenameWithExtension}`; // Combine folder and filename

        // Get GCS file object reference
        const file = storage.bucket(bucketName).file(gcsObjectPath);

        // Create upload stream
        const uploadStream = file.createWriteStream({
            metadata: {
                contentType: fileObject.type,
            },
            resumable: false, // Consider true for very large files
        });

        // Convert Web Stream to Node.js Readable Stream
        // Use 'as any' or ensure proper types if TypeScript complains
        const nodeReadableStream = Readable.fromWeb(fileObject.stream() as any);

        // Upload using pipeline
        console.log(`Uploading ${filenameWithExtension} to GCS bucket "${bucketName}" at path "${gcsObjectPath}"...`);
        await pipeline(nodeReadableStream, uploadStream);

        // Make the file public (adjust permissions as needed)
        await file.makePublic();

        // Construct the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsObjectPath}`;
        console.log(`File uploaded successfully! Public URL: ${publicUrl}`);

        return publicUrl; // Return the URL on success

    } catch (error) {
        console.error('Error during GCS upload process:', error);
        // Re-throw a more specific error or the original error
        throw new Error(`Failed to upload file to GCS: ${error instanceof Error ? error.message : 'Unknown GCS error'}`);
    }
}
