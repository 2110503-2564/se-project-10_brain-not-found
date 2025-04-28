// src/components/request-info/server.tsx
import getRequest from "@/libs/getRequest";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getSignedUrlForGCSPath } from "@/libs/gcsGetSignedPath";
import { RequestInfoClientDisplay } from "./client-display"; // <--- Import the new client component

export async function RequestInfo({ id }: { id: string }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) {
        // Optional: Redirect or show an error message if no session
        return <p className="text-center text-red-500">Please log in to view this request.</p>;
    }

    let request: RequestData | null = null;
    let certificateSignedUrl: string | null = null;
    let fetchError: string | null = null;

    try {
        const requestJSON: { success: boolean; data: RequestData } = await getRequest(
            id,
            session.user.token
        );

        if (!requestJSON.success || !requestJSON.data) {
            throw new Error("Failed to fetch request data or data format is incorrect.");
        }

        request = requestJSON.data;

        // Generate Signed URL for the certificate if the path exists
        if (request.shop.certificate) {
            try {
                certificateSignedUrl = await getSignedUrlForGCSPath(request.shop.certificate);
            } catch (signedUrlError) {
                console.error("Failed to generate signed URL for certificate:", signedUrlError);
                // Decide how to handle this: show a placeholder, log, etc.
                // certificateSignedUrl remains null
            }
        }
    } catch (error) {
        console.error("Error fetching request info:", error);
        fetchError = error instanceof Error ? error.message : "An unknown error occurred while fetching request data.";
    }

    // --- Render based on fetch status ---
    if (fetchError) {
        return <p className="text-center text-red-500">Error loading request: {fetchError}</p>;
    }

    if (!request) {
        // This case might happen if getRequest resolves but data is missing
        return <p className="text-center text-gray-500">Request data not found.</p>;
    }

    // --- Pass data to the Client Component ---
    return (
        <RequestInfoClientDisplay
            request={request}
            session={session}
            certificateSignedUrl={certificateSignedUrl}
        />
    );
}
