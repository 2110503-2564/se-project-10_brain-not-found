
// src/libs/getVenues.tsx
export default async function getVenues() {
      const response = await fetch("http://localhost:5000/api/v1/shops");
      
      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      return await response.json();
}
  