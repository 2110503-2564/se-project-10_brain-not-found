// src/components/request-info/client-display.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Typography, Paper, Stack, Grid, Box } from '@mui/material';
import { RequestInfoButtonGroup, RequestInfoStatus, ServiceCard } from './client'; // Import existing client components
import { Session } from 'next-auth'; // Import Session type

interface RequestInfoClientDisplayProps {
    request: RequestData;
    session: Session; // Pass session down
    certificateSignedUrl: string | null; // Pass the generated signed URL
}

// Helper Components (copied from server.tsx for simplicity, could be shared)
const Head = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="h6" component="h3">
        {children}
    </Typography>
);

const Info = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="body1" component="span">
        {children}
    </Typography>
);

export function RequestInfoClientDisplay({
    request,
    session,
    certificateSignedUrl,
}: RequestInfoClientDisplayProps) {
    const { shop, user } = request;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    const [index, setIndex] = useState(0);

    const openModal = (imageUrl: string) => {
        setModalImageUrl(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageUrl(null);
        setIndex(0);
    };

    const handleImageChange = (e : React.MouseEvent) => {
        e.stopPropagation();
        if (modalImageUrl === certificateSignedUrl || modalImageUrl === null) return;
        setIndex((index) => (index + 1) % shop.picture.length);
        setModalImageUrl(shop.picture[index]);
    }

    // Picture dimensions (can be adjusted)
    const SHOP_PICTURE_SIZE = { width: 350, height: 350 };
    const CERT_PICTURE_SIZE = { width: 200, height: 300 };

    const shopImageUrl = shop.picture && shop.picture.length > 0 ? shop.picture[0] : '/img/placeholder.png'; // Fallback image

    return (
        <>
            <div className="grid xs:grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
                {/* --- Shop Image --- */}
                <div className="xs:order-1 md:order-2 place-self-center">
                    <Paper elevation={5} sx={{ width: SHOP_PICTURE_SIZE.width, height: SHOP_PICTURE_SIZE.height, mb: 4, cursor: 'pointer', position: 'relative' }} onClick={() => openModal(shopImageUrl)}>
                        <Image
                            style={{ objectFit: 'fill', borderRadius: '4px' }} // Added borderRadius to match Paper
                            src={shopImageUrl}
                            alt={`${shop.name} picture`}
                            fill
                            priority // Prioritize loading the main shop image
                        />
                    </Paper>
                </div>

                {/* --- Shop Details --- */}
                <div className="xs:order-2 md:order-1 md:row-span-5">
                    <Stack spacing={3}>
                        <Typography variant="h5" component="h2">
                            {shop.name}
                        </Typography>

                        <Stack>
                            <Head>Address: <Info>{shop.address}</Info></Head>
                            <Head>Province: <Info>{shop.province}</Info></Head>
                            <Head>District: <Info>{shop.district}</Info></Head>
                            <Head>Region: <Info>{shop.region}</Info></Head>
                            <Head>Postal code: <Info>{shop.postalcode}</Info></Head>
                        </Stack>

                        <Stack>
                            <Head>Open time: <Info>{shop.openTime}</Info></Head>
                            <Head>Close time: <Info>{shop.closeTime}</Info></Head>
                            <Head>Contact: <Info>{shop.tel}</Info></Head>
                        </Stack>

                        <Stack>
                            <Head>Shop type: <Info>{shop.shopType}</Info></Head>
                            <Head>Description: <Info>{shop.desc}</Info></Head>
                        </Stack>

                        <Head>Services ({shop.services?.length ?? 0})</Head>
                        {shop.services && shop.services.length > 0 ? (
                            <Stack spacing={1} width="90%">
                                {shop.services.map((service) => (
                                    <ServiceCard service={service} key={service.id} />
                                ))}
                            </Stack>
                        ) : (
                            <Info>No service listed</Info>
                        )}
                    </Stack>
                </div>

                {/* --- User Details --- */}
                <div className="order-3 md:text-center">
                    <Stack spacing={3}>
                        <Box>
                            <Head>Shop Owner: <Info>{user.name}</Info></Head>
                            {user.email && <Head>Email: <Info>{user.email}</Info></Head>}
                            {user.tel && <Head>Tel: <Info>{user.tel}</Info></Head>}
                        </Box>
                    </Stack>
                </div>

                {/* --- Certificate Image --- */}
                <div className="order-4 justify-self-center md:text-center">
                    <Stack spacing={1.5}>
                        <Head>Shop Certificate</Head>
                        {certificateSignedUrl ? (
                            <Paper elevation={5} sx={{ width: CERT_PICTURE_SIZE.width, height: CERT_PICTURE_SIZE.height, cursor: 'pointer', position: 'relative' }} onClick={() => openModal(certificateSignedUrl)}>
                                <Image
                                    style={{ objectFit: 'fill', borderRadius: '4px' }}
                                    fill
                                    src={certificateSignedUrl}
                                    alt="Shop Certificate"
                                />
                            </Paper>
                        ) : (
                            <Paper elevation={1} sx={{ width: CERT_PICTURE_SIZE.width, height: CERT_PICTURE_SIZE.height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                                <Typography variant="caption" color="textSecondary">No Certificate</Typography>
                            </Paper>
                        )}
                    </Stack>
                </div>

                {/* --- Status --- */}
                <div className="order-5 justify-self-center">
                    <RequestInfoStatus request={request} />
                </div>

                {/* --- Action Buttons --- */}
                <div className="order-6 justify-self-center w-[50%]">
                    <RequestInfoButtonGroup session={session} status={request.status} requestId={request._id} />
                </div>
            </div>

            {/* --- Image Modal --- */}
            {isModalOpen && modalImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                    onClick={closeModal} // Close when clicking the background
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] bg-white p-2 rounded shadow-lg"
                        onClick={handleImageChange} // Prevent closing when clicking the image container itself
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute -top-3 -right-3 z-10 bg-white text-black rounded-full p-1 shadow-md hover:bg-gray-200"
                            aria-label="Close image viewer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={modalImageUrl}
                            alt="Enlarged view"
                            className="block max-w-full max-h-[85vh] object-contain rounded" // Limit size and maintain aspect ratio
                        />
                    </div>
                </div>
            )}
            {/* --- End Image Modal --- */}
        </>
    );
}
