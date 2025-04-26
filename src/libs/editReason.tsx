export default async function editReason(
    requestId: string,
    token: string,
    newReason: string
  ) {
    try {
      // ส่งคำขอ PATCH เพื่ออัปเดตข้อมูล reason ของ request
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}`, {
        method: "PATCH", // ใช้ PATCH เพื่ออัปเดตบางฟิลด์
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ใส่ token สำหรับการตรวจสอบสิทธิ์
        },
        body: JSON.stringify({
          reason: newReason, // ส่งเหตุผลใหม่
        }),
      });
  
      // ตรวจสอบว่า response สำเร็จ
      if (!response.ok) {
        throw new Error("Failed to update reason");
      }
  
      // ถ้าการอัปเดตสำเร็จ
      const data = await response.json();
      console.log("Updated request:", data);
      return data; // ส่งข้อมูลที่อัปเดตแล้วกลับ
    } catch (error) {
      console.error("Error updating reason:", error);
      throw error; // หรือแสดงข้อความข้อผิดพลาด
    }
  }
  