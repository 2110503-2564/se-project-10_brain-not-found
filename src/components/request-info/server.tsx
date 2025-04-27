import getRequest from "@/libs/getRequest";
import { Typography, Paper, Stack, Grid, Box } from "@mui/material";
import { getServerSession, Session } from "next-auth";
import Image from "next/image";
import { RequestInfoButtonGroup, RequestInfoStatus, ServiceCard } from "./client";
import React from "react";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function RequestInfo({ id }: { id: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.token) return null;
  const requestJSON: { success: boolean; data: RequestData } = await getRequest(
    id,
    session.user.token
  );
  const { data: request } = requestJSON;
  const { shop, user } = request;

  // Picture dimension, adjust when needed
  const SHOP_PICTURE_SIZE = { width: 350, height: 350 };
  const CERT_PICTURE_SIZE = { width: 200, height: 300 };

  // extracted these because there's a fuck ton of them
  const Head = ({ children }: { children: any }) => {
    return (
      <Typography variant="h6" component="h3">
        {children}
      </Typography>
    );
  };

  const Info = ({ children }: { children: any }) => {
    return (
      <Typography variant="body1" component="span">
        {children}
      </Typography>
    );
  };

  return (
    <>
      <div className="grid xs:grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
        <div className="xs:order-1 md:order-2 place-self-center">
          {/* TODO: Multiple image support */}
          <Paper elevation={5} sx={{ width: SHOP_PICTURE_SIZE.width, height: SHOP_PICTURE_SIZE.height, mb: 4 }}>
            <Image
              width={SHOP_PICTURE_SIZE.width}
              height={SHOP_PICTURE_SIZE.height}
              objectFit="cover"
              src={shop.picture[0]}
              alt={shop.name}
            />
          </Paper>
        </div>
        <div className="xs:order-2 md:order-1 md:row-span-5">
          <Stack spacing={3}>
            <Typography variant="h5" component="h2">
              {shop.name}
            </Typography>

            <Stack>
              <Head>Address: <Info>{shop.address}</Info></Head>
              <Head>Province: <Info>{shop.province}</Info></Head>
              <Head>District: <Info>{shop.district}</Info></Head>
              <Head>Region: <Info>{shop.region}</Info></Head>
              <Head>Postal code: <Info>{shop.postalcode}</Info></Head>
            </Stack>

            <Stack>
              <Head>Open time: <Info>{shop.openTime}</Info></Head>
              <Head>Close time: <Info>{shop.closeTime}</Info></Head>
              <Head>Contact: <Info>{shop.tel}</Info></Head>
            </Stack>

            <Stack>
              <Head>Shop type: <Info>{shop.shopType}</Info></Head>
              <Head>Description: <Info>{shop.desc}</Info></Head>
            </Stack>

            <Head>Services ({shop.services?.length})</Head>
            {shop.services ? (
              <Stack spacing={1} width="90%">
                {shop.services?.map((service, index) => (
                  <ServiceCard service={service} key={service.id} />
                ))}
              </Stack>
            ) : (
              <Info>No service listed</Info>
            )}
          </Stack>
        </div>
        <div className="order-3 md:text-center">
          <Stack spacing={3}>
            <Box>
              <Head>Shop Owner: <Info>{user.name}</Info></Head>
              <Head>Email: <Info>{user.email}</Info></Head>
              <Head>Tel: <Info>{user.tel}</Info></Head>
            </Box>
            </Stack>
        </div>
        <div className="order-4 justify-self-center md:text-center">
            <Stack spacing={1.5}>
            <Head>Shop Certificate</Head>
            <Paper elevation={5} sx={{ width: CERT_PICTURE_SIZE.width, height: CERT_PICTURE_SIZE.height }}>
                <Image
                    width={CERT_PICTURE_SIZE.width}
                    height={CERT_PICTURE_SIZE.height}
                    objectFit="cover"
                    src={shop.certificate}
                    alt="cert"/>
            </Paper>
            </Stack>
        </div>
        <div className="order-5 justify-self-center">
            <RequestInfoStatus request={request}/>
        </div>
        <div className="order-6 justify-self-center w-[50%]">
            <RequestInfoButtonGroup session={session} status={request.status} requestId={request._id}/>
        </div> 
      </div>
    </>
  );
}
