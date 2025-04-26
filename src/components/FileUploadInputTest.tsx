// src/components/FileUploadTest.tsx
'use server';

import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from 'stream/promises';
import { redirect } from 'next/navigation';
import React from 'react';
import { Readable } from 'stream';

// --- Initialize GCS Client and Bucket Name ---
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Should be "brain_not_found_app" from your .env

if (!bucketName) {
  console.error("GCS_BUCKET_NAME environment variable is not set. File upload will not work.");
}

// --- Server Action for File Upload ---
async function uploadFile(formData: FormData) {
  'use server';

  if (!bucketName) {
    console.error("GCS bucket name is missing. Aborting upload.");
    redirect('/?error=' + encodeURIComponent('GCS Bucket Name is not configured.'));
    return;
  }

  const pictureFile = formData.get('picture') as File | null;

  if (!pictureFile || pictureFile.size === 0) {
    console.log("No file selected for upload.");
    redirect('/?error=' + encodeURIComponent('Please select a file to upload.'));
    return;
  }

  try {
    // --- File Validation ---
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit

    if (!allowedTypes.includes(pictureFile.type)) {
      throw new Error(`Invalid file type: ${pictureFile.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    if (pictureFile.size > maxSize) {
      throw new Error(`File size exceeds the limit of ${maxSize / 1024 / 1024}MB.`);
    }
    // --- End Validation ---

    // --- Generate unique filename AND specify the folder path ---
    const fileExtension = pictureFile.name.split('.').pop();
    const baseFilename = uuidv4(); // Generate the unique part
    const filenameWithExtension = `${baseFilename}${fileExtension ? '.' + fileExtension : ''}`;
    // *** Specify the folder path here ***
    const gcsObjectPath = `shop picture/${filenameWithExtension}`; // Prepend the folder name

    // Get GCS file object reference using the full path
    const file = storage.bucket(bucketName).file(gcsObjectPath); // Use the path with the folder

    // Create upload stream
    const uploadStream = file.createWriteStream({
      metadata: {
        contentType: pictureFile.type,
      },
      resumable: false,
    });

    // Convert Web Stream to Node.js Readable Stream
    const nodeReadableStream = Readable.fromWeb(pictureFile.stream() as any);

    // Upload using pipeline
    console.log(`Attempting to upload ${filenameWithExtension} to GCS bucket "${bucketName}" in folder "shop picture/"...`); // Update log message
    await pipeline(nodeReadableStream, uploadStream);

    // Make the file public
    await file.makePublic();

    // Construct the public URL (includes the folder path)
    const pictureUrl = `https://storage.googleapis.com/${bucketName}/${gcsObjectPath}`; // Use the full path
    console.log(`File uploaded successfully! Public URL: ${pictureUrl}`);

    // Redirect on success
    redirect('/?success=' + encodeURIComponent(`File uploaded to shop picture/: ${pictureUrl}`)); // Update success message

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during file upload.';
    console.error('Error uploading file to GCS:', error);
    // Redirect back with an error message
    redirect('/?error=' + encodeURIComponent(`Upload failed: ${errorMessage}`));
  }
}

// --- React Component for the Upload Form ---
export default async function FileUploadTest() {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h2>GCS File Upload Test (to shop picture/)</h2> {/* Updated title */}
      <form action={uploadFile} encType="multipart/form-data">
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="picture" style={{ display: 'block', marginBottom: '5px' }}>Select File:</label>
          <input
            type="file"
            id="picture"
            name="picture"
            required
            style={{ display: 'block', width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Upload to GCS (shop picture/)
        </button> {/* Updated button text */}
      </form>
    </div>
  );
}
