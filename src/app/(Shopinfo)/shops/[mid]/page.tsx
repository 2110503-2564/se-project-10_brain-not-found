import { Box, Stack, Typography, Grid, Divider, Paper, LinearProgress } from "@mui/material";
import { orange, yellow, grey } from "@mui/material/colors";
import { Suspense } from "react";
import { ReviewSection, ReviewSkeleton } from "@/components/Review";
import { Star } from "lucide-react";
import ImageSlider from "@/components/ImageSlider";
import ShopLocation from "@/components/ShopLocation";
import ShopDescription from "@/components/ShopDescription";
import ShopContact from "@/components/ShopContact";
import BookingForm from "@/components/BookingForm";
import { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getShop from "@/libs/getShop";

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
        <Suspense fallback={<LinearProgress />}>
          <ShopDetail shopId={params.mid} />
        </Suspense>
        <Divider sx={{ my: 4, borderColor: orange[300] }} />
        <Suspense fallback={<ReviewSkeleton />}>
          <ReviewSection shopId={params.mid} />
        </Suspense>
      </Paper>
    </Box>
  );
}

export async function ShopDetail({ shopId }: { shopId: string }) {
  try {
    const [shopDetail, session] = await Promise.all([
      getShop(shopId),
      getServerSession(authOptions),
    ]);

    if (!shopDetail || !shopDetail.data) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ color: orange[800], fontWeight: "bold" }}
          >
            Shop Not Found
          </Typography>
        </Box>
      );
    }

    const images: string[] = Array.isArray(shopDetail.data.picture)
      ? shopDetail.data.picture
      : [shopDetail.data.picture];

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column", // ให้เรียงแนวตั้ง
          padding: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: orange[800], fontWeight: "bold" }}
        >
          Massage Shop Detail
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {/* แถวที่ 1: ImageSlider เต็มแถว */}
          <Grid item xs={12}>
            <ImageSlider images={images} />
          </Grid>

          {/* แถวที่ 2: ShopInfo และ BookingForm ขนานกัน */}
          <Grid item xs={12} sm={8} md={8}>
            <ShopInfo info={shopDetail.data} />
          </Grid>
          <Grid item xs={12} sm={4} md={4} sx={{ mt: { xs: 6, sm: 12 } }}>
            <BookingForm session={session} shop={shopDetail.data} />
          </Grid>

        </Grid>

      </Box>
    );
  } catch (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: orange[800], fontWeight: "bold" }}
        >
          An error has occurred
        </Typography>
      </Box>
    );
  }
}

function ShopInfo({ info }: { info: ShopItem }) {
  return (
    <Box sx={{ textAlign: "left", padding: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography
          variant="h5"
          component="div"
          sx={{ color: orange[700], fontWeight: "bold" }}
        >
          {info.name}
        </Typography>

        {/* กรอบสำหรับเวลาเปิด-ปิด */}
        <Box
          sx={{
            backgroundColor: orange[300],
            borderRadius: "8px",
            paddingX: 2,
            paddingY: 1,
            textAlign: "center",
            flexGrow: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            {info.openTime} - {info.closeTime}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.75} alignItems="center" width="fit-content">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            backgroundColor: yellow[300],
            borderRadius: "8px",
            paddingX: "6px",
            paddingY: "2px",
          }}
        >
          <Star size={20} color="#000000" strokeWidth={1.25} />
          <Typography variant="body1">{info.averageRating}</Typography>
        </Stack>
        <ReviewCount count={info.reviewCount} />
      </Stack>

      
      <ShopDescription description={info.desc} />
      <ShopLocation location={info} />
      <ShopContact contact={info} />
    </Box>
  );
}



function ReviewCount({count} : {count?: number}) {

  if (typeof count === undefined) {
    return (<Typography variant="subtitle2">No Data</Typography>)
  }

  if (typeof count === "number" && count <= 1) {
    return (<Typography variant="subtitle2">{`(${count} review)`}</Typography>)
  } 

  return (<Typography variant="subtitle2">{`(${count} reviews)`}</Typography>)
  
}