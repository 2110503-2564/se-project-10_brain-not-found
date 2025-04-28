
/**
 * Calls the backend API to reject a shop creation request.
 *
 * @param requestId The ID of the request to reject.
 * @param token The admin user's authentication token.
 * @param reason The reason for rejecting the request.
 * @returns The response data from the backend.
 * @throws An error if the API call fails.
 */
export default async function rejectRequest(requestId: string, token: string, reason: string): Promise<any> {
    // ใช้ Environment Variable ถ้ามี, หรือ fallback เป็น localhost สำหรับ development
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const apiUrl = `${backendUrl}/api/v1/requests/${requestId}/reject`;
  
    console.log(`Attempting to reject request: PUT ${apiUrl}`);
    console.log("Reason:", reason);
  
    // ตรวจสอบว่า reason ไม่ใช่ค่าว่าง (อาจจะเพิ่ม validation อื่นๆ ตามต้องการ)
    if (!reason || reason.trim() === "") {
        throw new Error("Reason for rejection cannot be empty.");
    }
  
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT', // ตรงกับ @route Put ใน backend comment
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // ต้องมีเมื่อส่ง JSON body
        },
        body: JSON.stringify({ reason: reason }), // ส่ง reason ใน body ตามที่ backend คาดหวัง (req.body.reason)
      });
  
      // พยายามอ่าน JSON response เสมอ
      const responseData = await response.json();
  
      if (!response.ok) {
        // ถ้า response status ไม่ใช่ 2xx, โยน error พร้อม message จาก backend
        console.error("Reject request failed:", response.status, responseData);
        throw new Error(responseData.message || `Failed to reject request. Status: ${response.status}`);
      }
  
      console.log("Reject request successful:", responseData);
      return responseData; // คืนค่าข้อมูลที่ได้จาก backend (อาจจะมีข้อมูล request ที่อัปเดตแล้ว)
  
    } catch (error) {
      console.error("Error during rejectRequest API call:", error);
      // โยน error ต่อเพื่อให้ component ที่เรียกใช้จัดการได้
      throw error instanceof Error ? error : new Error("An unknown error occurred while rejecting the request.");
    }
  }
  