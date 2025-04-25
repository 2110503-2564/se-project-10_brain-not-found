export default async function getRequests(token: string, filter: string) {
    const url = filter === "all"
      ? `${process.env.BACKEND_URL}/api/v1/requests`
      : `${process.env.BACKEND_URL}/api/v1/requests?status=${filter}`;
  
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: ["requests"] }
    });
  
    if (!response.ok) {
      throw new Error("Failed to get filtered requests");
    }
  
    return await response.json();
  }
  