// MassageCatalogServer.tsx
import { revalidateTag } from "next/cache";
import MassageCatalogClient from "./MassageCatalogClient";

async function MassageCatalogServer({ shopsJson }: { shopsJson: Promise<ShopJson> }) {
  const shopJsonReady = await shopsJson;
  console.log(shopJsonReady);
  revalidateTag("shops");

  return <MassageCatalogClient shopJsonReady={shopJsonReady} />;
}

export default MassageCatalogServer;
