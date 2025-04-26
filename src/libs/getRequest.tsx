export default async function getRequest(id: string, token: string) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store"
    });
  
    if (!response.ok) {
        throw new Error('Failed to fetch request');
    }
  
    return await response.json();
}