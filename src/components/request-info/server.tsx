import getRequest from "@/libs/getRequest";
import { Typography, Paper, Stack, Grid, Box } from "@mui/material";
import { Session } from "next-auth";
import Image from "next/image";
import { ServiceCard } from "./client";

export async function RequestInfo({ id, session }: { id: string; session: Session }) {
  const requestJSON: { success: boolean, data: RequestData } = await getRequest(
    id,
    session.user.token
  );
  const { data: request } = requestJSON;
  const { shop, user } = request;



  return <>
    <Grid container direction="row-reverse" spacing={4} sx={{ flexGrow: 1 }}>
      <Grid item xs={12} md={6}>  {/* TODO: Multiple image support */}
      <Paper elevation={5}>
        <Image
            width={400}
            height={400}
            objectFit="cover"
            src={`/${shop.picture[0]}`}
            alt={shop.name}/>
      </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
          <Stack spacing={3}>
              <Typography variant="h5" component="h2">
                  {shop.name}
              </Typography>
              
              <Stack>
                    <Typography variant="h6" component="h3">
                        Address: {shop.address}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        District: {shop.district}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        Province: {shop.province}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        Region: {shop.region}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        Postal code: {shop.postalcode}
                    </Typography>
                </Stack>

                <Stack>
                    <Typography variant="h6" component="h3">
                        Open time: {shop.openTime}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        Close time: {shop.closeTime}
                    </Typography>
                    <Typography variant="h6" component="h3">
                        Contact: {shop.tel}
                    </Typography>
                </Stack>

                <Stack>
                    <Typography variant="h6" component="h3">
                        Description: {shop.desc}
                    </Typography>
                </Stack>

                <Typography variant="h6" component="h3">
                    Services ({shop.services?.length})
                </Typography>
                <Stack spacing={1} width="90%">
                    {
                        shop.services?.map((service, index)=>(
                            <ServiceCard service={service} key={index}/> 
                        ))
                    }
                </Stack>
          </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={3} width="90%">
            <Box>
                <Typography>Shop Owner: {user.name}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Tel: {user.tel}</Typography>
            </Box>
            
        </Stack>
      </Grid>

    </Grid>
  </>;
}

