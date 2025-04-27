export default async function approveRequest ({ requestId,token }:{ requestId:string, token:string }) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Shop created:', data.data);
        alert('Request approved and shop created!');
      } else {
        console.error('Error:', data.message);
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    }
}