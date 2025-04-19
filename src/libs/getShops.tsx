
// src/libs/getShops.tsx
export default async function getShops() {
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/shops` , {next : {tags:[`shops`]}});
      
      if (!response.ok) {
        throw new Error("Failed to fetch shops");
      }
      console.log(response)
      return await response.json();
}
  