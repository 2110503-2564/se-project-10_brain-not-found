import Image from "next/image";
import getVenue from "@/libs/getShop";
import BookingForm from "@/components/BookingForm";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Paper, Typography, Grid, Box, Divider, LinearProgress, Stack } from "@mui/material";
import { orange, grey, yellow } from "@mui/material/colors";
import { Suspense } from "react";
import { ReviewSection, ReviewSkeleton } from "@/components/Review";
import { Star } from "lucide-react";

export default function ShopDetailPage({ params }: { params: { mid: string } }) {
    return (
        <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: grey[100],
                    padding: 4,
                }}
            >
              <Paper
        elevation={3}
        sx={{
          width: "90%",
          maxWidth: 1200,
          padding: 4,
          borderRadius: 4,
          bgcolor: "white",
        }}
              >
            <Suspense fallback={<LinearProgress/>}>
              <ShopDetail shopId={params.mid}/>
            </Suspense>
            <Divider sx={{ my: 4, borderColor: orange[300] }} />
            <Suspense fallback={<ReviewSkeleton/>}>
              <ReviewSection shopId={params.mid}/>
            </Suspense>
            </Paper>   
        </Box>
    )
        
}

async function ShopDetail({shopId} :{shopId: string}) {
    try {

    const [shopDetail, session] = await Promise.all([getVenue(shopId), getServerSession(authOptions)]); 

    if (!shopDetail || !shopDetail.data) { // most likely inaccessible because API returns 404
        return (
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
                Shop Not Found
            </Typography>
        );
    }

    return (
        <>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: orange[800], fontWeight: "bold" }}
        >
          Massage Shop Detail
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* Larger Image Column */}
          <Grid item xs={12} md={4}>
            <ShopImage
              src={shopDetail.data.picture}
              alt={shopDetail.data.name}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ShopImage
              src={shopDetail.data.picture}
              alt={shopDetail.data.name}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ShopImage
              src={shopDetail.data.picture}
              alt={shopDetail.data.name}
            />
          </Grid>
          {/* Smaller Detail Column */}
          <Grid item xs={12} md={6}>
            <ShopInfo info={shopDetail.data} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ padding: 3 }} alignSelf={"flex-end"}>
              <BookingForm session={session} shop={shopDetail.data} />
            </Box>
          </Grid>
        </Grid>
        </>
    );

} catch (error) {
    return (
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
            An error has occured
        </Typography>
    );
}

}





function ShopImage({src, alt} : {src: string, alt: string}) {
  
    return (
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 2,
          maxHeight: 350, // Adjust as needed
          maxWidth: 350,
        }}
      >
        <Image
          src={src.toString() ?? "/img/logo.png"}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
    );
}

function ShopInfo({info} : {info: ShopItem}) {
    return (
      <Box sx={{ textAlign: "left", padding: 2 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ color: orange[700], fontWeight: "bold" }}
        >
          {info.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems='center' justifyContent='center' width='fit-content' sx={{
          backgroundColor: yellow,
          borderRadius: "8px"
        }}>
          <Star size={20} color="#000000" strokeWidth={0.75} />
          <Typography variant="body1">{info.averageRating}</Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>Address:</b> {info.address}
        </Typography>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>District:</b> {info.district}
        </Typography>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>Province:</b> {info.province}
        </Typography>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>Region:</b> {info.region}
        </Typography>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>Postal Code:</b> {info.postalcode}
        </Typography>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          <b>Tel:</b> {info.tel}
        </Typography>
        <Box sx={{ padding: 1 }}>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>Open Time:</b> {info.openTime}
          </Typography>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>Close Time:</b> {info.closeTime}
          </Typography>
        </Box>
      </Box>
    );
}