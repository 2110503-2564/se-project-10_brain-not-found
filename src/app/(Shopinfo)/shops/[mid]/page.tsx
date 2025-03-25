import Image from "next/image";
import getVenue from "@/libs/getShop";
import BookingForm from "@/components/BookingForm";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Paper, Typography, Grid, Box, Divider } from "@mui/material";
import { orange, grey } from "@mui/material/colors";

export default async function ShopDetailPage({ params }: { params: { mid: string } }) {
    const shopDetail = await getVenue(params.mid);
    const session = await getServerSession(authOptions);

    if (!shopDetail || !shopDetail.data) {
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
                <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
                    Shop Not Found
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: grey[100],
                padding: 4,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '90%',
                    maxWidth: 1200,
                    padding: 4,
                    borderRadius: 4,
                    bgcolor: 'white',
                }}
            >
                <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
                    Massage Shop Detail
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    {/* Larger Image Column */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 2,
                                // Add max height for image
                                maxHeight: 500, // Adjust as needed
                            }}
                        >
                            <Image
                                src={(shopDetail.data.picture ?? '/img/logo.png')}
                                alt={shopDetail.data.name}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }} // Add objectFit
                            />
                        </Box>
                    </Grid>
                    {/* Smaller Detail Column */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: 'left', padding: 2 }}>
                            <Typography variant="h5" component="div" sx={{ color: orange[700], fontWeight: 'bold' }}>
                                {shopDetail.data.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Address:</b> {shopDetail.data.address}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>District:</b> {shopDetail.data.district}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Province:</b> {shopDetail.data.province}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Region:</b> {shopDetail.data.region}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Postal Code:</b> {shopDetail.data.postalcode}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Tel:</b> {shopDetail.data.tel}
                            </Typography>
                            <Box sx={{ padding: 1 }}>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Open Time:</b> {shopDetail.data.openTime}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Close Time:</b> {shopDetail.data.closeTime}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: orange[300] }} />

                <Box sx={{ padding: 3 }}>
                    <BookingForm session={session} shop={shopDetail.data} />
                </Box>
            </Paper>
        </Box>
    );
}
