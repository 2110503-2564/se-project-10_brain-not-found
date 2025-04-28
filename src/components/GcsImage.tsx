// src/components/GcsImage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getSignedUrlForGCSPath } from '@/libs/gcsGetSignedPath'; // Import Server Action

interface GcsImageProps extends Omit<ImageProps, 'src'> { // รับ props ทั้งหมดของ Image ยกเว้น src
  gcsPath: string | null | undefined;
  placeholderSrc?: string; // รูป Placeholder ถ้าโหลดไม่ได้
}

const GcsImage: React.FC<GcsImageProps> = ({
  gcsPath,
  placeholderSrc = '/img/logo.png', // Default placeholder
  alt,
  ...rest // props ที่เหลือของ Image (width, height, className, etc.)
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    const fetchUrl = async () => {
      if (!gcsPath) {
        setSignedUrl(null); // ไม่มี path ก็ไม่ต้อง fetch
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSignedUrl(null); // Clear previous URL while loading

      try {
        const url = await getSignedUrlForGCSPath(gcsPath);
        if (isMounted) {
          setSignedUrl(url);
        }
      } catch (err) {
        console.error(`Failed to get signed URL for ${gcsPath}:`, err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image URL');
          setSignedUrl(null); // Set to null on error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUrl();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [gcsPath]); // ทำงานใหม่เมื่อ gcsPath เปลี่ยน

  // กำหนด src ที่จะใช้
  const imageSrc = error ? placeholderSrc : signedUrl ?? placeholderSrc;

  // อาจจะแสดง Loading Indicator
  if (isLoading && !signedUrl && !error) {
    // return <Skeleton variant="rectangular" width={rest.width} height={rest.height} />; // ถ้าใช้ MUI Skeleton
    return <div style={{ width: rest.width, height: rest.height, backgroundColor: '#eee' }}>Loading...</div>; // Placeholder แบบง่าย
  }

  return (
    <Image
      src={imageSrc}
      alt={alt} // ใช้ alt ที่ส่งมา
      {...rest} // ส่ง props ที่เหลือไปให้ Image
      onError={(e) => {
        // ถ้าเกิด Error ตอนโหลดรูป (เช่น Signed URL หมดอายุ) ให้แสดง Placeholder
        console.warn(`Image load error for src: ${imageSrc}, falling back to placeholder.`);
        (e.target as HTMLImageElement).src = placeholderSrc;
      }}
    />
  );
};

export default GcsImage;
