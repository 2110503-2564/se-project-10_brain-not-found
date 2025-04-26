// src/libs/gcsActions.ts (หรือไฟล์ action อื่นๆ)
'use server';

import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

/**
 * Generates a short-lived signed URL for a given GCS object path.
 *
 * @param gcsPath The full path to the object in the GCS bucket (e.g., 'certificates/uuid.pdf').
 * @returns A Promise resolving with the signed URL.
 * @throws An error if the URL generation fails or configuration is missing.
 */
export async function getSignedUrlForGCSPath(gcsPath: string): Promise<string> {
    if (!bucketName) {
        console.error("GCS_BUCKET_NAME environment variable is not set.");
        throw new Error('GCS Bucket Name not configured.');
    }
    if (!gcsPath || typeof gcsPath !== 'string' || gcsPath.length === 0) {
        throw new Error('Invalid GCS path provided.');
    }

    try {
        const options = {
            version: 'v4' as const, // Recommended version
            action: 'read' as const,
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
        };

        // Get a v4 signed URL for reading the file
        const [url] = await storage
            .bucket(bucketName)
            .file(gcsPath)
            .getSignedUrl(options);

        console.log(`Generated signed URL for ${gcsPath}`);
        return url;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error generating signed URL.';
        console.error(`Error generating signed URL for path ${gcsPath}:`, error);
        throw new Error(`Failed to get signed URL: ${errorMessage}`);
    }
}
