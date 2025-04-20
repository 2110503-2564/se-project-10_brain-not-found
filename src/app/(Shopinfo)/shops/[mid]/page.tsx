import { Box, Stack, Typography, Grid, Divider, Paper, LinearProgress } from "@mui/material";
import { orange, yellow, grey } from "@mui/material/colors";
import { Suspense } from "react";
import { ReviewSection, ReviewSkeleton } from "@/components/Review";
import { ShopDetailDisplay } from "@/components/ShopDetailDisplay";

export default function ShopDetailPage({ params }: { params: { mid: string } }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: grey[100],
        padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "95%",
          maxWidth: 1200,
          padding: { xs: 2, sm: 3, md: 4 },
          borderRadius: 4,
          bgcolor: "white",
          mt: 4, // Add some margin top/bottom
          mb: 4,
        }}
      >
        {/* Suspense for Shop Details */}
        <Suspense fallback={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <Typography sx={{ mb: 2 }}>Loading shop details...</Typography>
            <LinearProgress sx={{ width: '80%' }} />
          </Box>
        }>
          {/* Use the imported component */}
          <ShopDetailDisplay shopId={params.mid} />
        </Suspense>

        <Divider sx={{ my: 4, borderColor: orange[300] }} />

        {/* Suspense for Reviews */}
        <Suspense fallback={<ReviewSkeleton />}>
          <ReviewSection shopId={params.mid} />
        </Suspense>
      </Paper>
    </Box>
  );
}
