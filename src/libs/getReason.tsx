export default async function fetchReason(
    requestId: string,
    token: string
  ) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch reason");
      }
  
      const data = await response.json();
      return data.reason; // ดึงแค่ reason
    } catch (error) {
      console.error("Error fetching reason:", error);
      throw error;
    }
  }
  