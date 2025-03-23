
// src/libs/getShops.tsx
export default async function getShops() {
      const response = await fetch("https://project-sd-fronted-sub-backend.vercel.app/api/v1/shops" , {next : {tags:[`shops`]}});
      
      if (!response.ok) {
        throw new Error("Failed to fetch shop");
      }

      return await response.json();
}
  