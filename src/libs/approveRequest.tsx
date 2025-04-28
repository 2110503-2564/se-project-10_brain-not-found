// src/libs/approveRequest.ts

/**
 * Calls the backend API to approve a shop creation request.
 *
 * @param requestId The ID of the request to approve.
 * @param token The admin user's authentication token.
 * @returns The response data from the backend.
 * @throws An error if the API call fails.
 */
export default async function approveRequest(requestId: string, token: string): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const apiUrl = `${backendUrl}/api/v1/requests/${requestId}/approve`;

  console.log(`Attempting to approve request: PUT ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Approve request failed:", response.status, responseData);
      throw new Error(responseData.message || `Failed to approve request. Status: ${response.status}`);
    }

    console.log("Approve request successful:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error during approveRequest API call:", error);
    throw error instanceof Error ? error : new Error("An unknown error occurred while approving the request.");
  }
}
