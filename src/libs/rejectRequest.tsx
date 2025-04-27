export default async function rejectRequest ({ requestId, reason, token }:{ requestId:string, reason:string, token:string }) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason }),
        });

        const data = await response.json();
        if (response.ok) {
        console.log('Request rejected:', data.data);
        alert('Request rejected');
        } else {
        console.error('Error:', data.message);
        alert('Failed to reject request');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
}