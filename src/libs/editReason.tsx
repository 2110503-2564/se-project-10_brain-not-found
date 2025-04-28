export default async function editReason(
  requestId: string,
  token: string,
  newReason: string
) {
  try {
    // ตรวจสอบว่า newReason เป็น string และไม่เกิน 250 ตัวอักษร
    if (typeof newReason !== 'string') {
      throw new Error("Reason must be a string");
    }
    if (newReason.length > 250) {
      throw new Error("Reason cannot be longer than 250 characters");
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}/reason`, {
      method: "PATCH", // ✅ เปลี่ยนเป็น PATCH
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ ใช้ token auth
      },
      body: JSON.stringify({
        reason: newReason, // ✅ ส่งเฉพาะ reason
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update reason");
    }

    const data = await response.json();
    console.log("Updated reason:", data);
    return data;
  } catch (error) {
    console.error("Error updating reason:", error);
    throw error;
  }
}
