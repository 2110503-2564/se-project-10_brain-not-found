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
  // ใช้ Environment Variable ถ้ามี, หรือ fallback เป็น localhost สำหรับ development
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const apiUrl = `${backendUrl}/api/v1/requests/${requestId}/approve`;

  console.log(`Attempting to approve request: PUT ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT', // ตรงกับ @route Put ใน backend comment
      headers: {
        'Authorization': `Bearer ${token}`,
        // ไม่ต้องมี Content-Type เพราะไม่มี body ที่ส่งไป
      },
      // ไม่ต้องมี body สำหรับ approve request ตามโค้ด backend ที่ให้มา
    });

    // พยายามอ่าน JSON response เสมอ เพื่อดู message จาก backend
    const responseData = await response.json();

    if (!response.ok) {
      // ถ้า response status ไม่ใช่ 2xx, โยน error พร้อม message จาก backend
      console.error("Approve request failed:", response.status, responseData);
      throw new Error(responseData.message || `Failed to approve request. Status: ${response.status}`);
    }

    console.log("Approve request successful:", responseData);
    return responseData; // คืนค่าข้อมูลที่ได้จาก backend (อาจจะมีข้อมูล shop ที่สร้างใหม่)

  } catch (error) {
    console.error("Error during approveRequest API call:", error);
    // โยน error ต่อเพื่อให้ component ที่เรียกใช้จัดการได้
    throw error instanceof Error ? error : new Error("An unknown error occurred while approving the request.");
  }
}
