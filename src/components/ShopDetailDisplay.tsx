import { Box, Stack, Typography, Grid, LinearProgress } from "@mui/material"; // Keep only necessary imports
import { orange, yellow, grey } from "@mui/material/colors";
import { Star } from "lucide-react";
import ImageSlider from "@/components/ImageSlider";
import ShopLocation from "@/components/ShopLocation";
import ShopDescription from "@/components/ShopDescription";
import ShopContact from "@/components/ShopContact";
import BookingForm from "@/components/BookingForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getShop from "@/libs/getShop";
import { Session } from "next-auth"; // Import Session type if needed

interface SingleShopItem {
    success: boolean;
    data: ShopItem;
}

// Renamed from ShopDetail to avoid naming collision if imported directly
export async function ShopDetailDisplay({ shopId }: { shopId: string }) {
  try {
    const [shopDetail, session] = await Promise.all([
      getShop(shopId),
      getServerSession(authOptions),
    ]);

    if (!shopDetail || !shopDetail.data) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
          <Typography variant="h5" component="h2" sx={{ color: orange[800], fontWeight: "bold" }}>
            Shop Not Found
          </Typography>
        </Box>
      );
    }

    const images: string[] = Array.isArray(shopDetail.data.picture)
      ? shopDetail.data.picture
      : shopDetail.data.picture ? [shopDetail.data.picture] : []; // Handle potential null/undefined

    return (
      <Box sx={{ display: "flex", flexDirection: "column", padding: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: orange[800], fontWeight: "bold", mb: 3 }}
        >
          Massage Shop Detail
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            {images.length > 0 ? <ImageSlider images={images} /> : <Typography align="center">No images available</Typography>}
          </Grid>
          <Grid item xs={12} md={8}>
            <ShopInfo info={shopDetail.data} />
          </Grid>
          <Grid item xs={12} md={4} sx={{ mt: { xs: 3, md: 0 } }}> {/* Adjust margin for responsiveness */}
            <BookingForm session={session} shop={shopDetail.data} />
          </Grid>
        </Grid>
      </Box>
    );
  } catch (error) {
    console.error("Failed to load shop details:", error);
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
        <Typography variant="h5" component="h2" color="error" sx={{ fontWeight: "bold" }}>
          An error occurred loading shop details.
        </Typography>
      </Box>
    );
  }
}

function ShopInfo({ info }: { info: ShopItem }) {
  return (
    <Box sx={{ textAlign: "left", padding: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
        <Typography
          variant="h5"
          component="div"
          sx={{ color: orange[700], fontWeight: "bold", flexShrink: 0 }}
        >
          {info.name}
        </Typography>
        <Box
          sx={{
            backgroundColor: orange[300],
            borderRadius: "8px",
            paddingX: 2,
            paddingY: 1,
            textAlign: "center",
            ml: { sm: 'auto' } // Push to right on larger screens
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

      {(info.averageRating !== undefined || info.reviewCount !== undefined) && (
        <Stack direction="row" spacing={1} alignItems="center" mb={2} width="fit-content">
          {info.averageRating !== undefined && (
             <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
                sx={{
                  backgroundColor: yellow[300],
                  borderRadius: "8px",
                  paddingX: "8px",
                  paddingY: "4px",
                }}
              >
                <Star size={18} color="#000000" strokeWidth={1.5} />
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{info.averageRating.toFixed(1)}</Typography>
              </Stack>
          )}
          <ReviewCount count={info.reviewCount} />
        </Stack>
      )}

      {info.desc && <ShopDescription description={info.desc} />}
      <ShopLocation location={info} />
      <ShopContact contact={info} />
    </Box>
  );
}

function ReviewCount({ count }: { count?: number }) {
  if (count === undefined || count === null) {
    return null; // Don't render anything if count is not available
  }
  const reviewText = count === 1 ? "review" : "reviews";
  return (
    <Typography variant="body2" sx={{ color: grey[700] }}>{`(${count} ${reviewText})`}</Typography>
  );
}