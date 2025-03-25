import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import getShop from "@/libs/getShop";
import getUserProfile from '@/libs/getUserProfile';
import getReservation from "@/libs/getReservation";
import EditBookingForm from "@/components/EditBookingForm";
import Image from "next/image";
import dayjs from "dayjs";
import { Paper, Typography, Grid, Box, Divider, Button } from "@mui/material"; // Import Material UI components
import { orange, grey } from "@mui/material/colors"; // Import colors from Material UI

export default async function EditBookingPage({ params }: { params: { rid: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) redirect('/mybooking');

    const profile = await getUserProfile(session.user.token);
    if (!profile) redirect('/mybooking');

    const reservation = await getReservation(session.user.token, params.rid);
    if (!reservation) redirect('/mybooking');

    const shopId = reservation.data.shop.id;
    let shop;

    if (shopId) {
        shop = await getShop(shopId);
        if (!shop || !shop.data) {
            redirect('/shops');
        }
    } else return;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: grey[100], // Light grey background
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
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 2,
                            }}
                        >
                            <Image
                                src={(shop.data.picture ?? '/img/logo.png')}
                                alt={shop.data.name}
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: '100%', height: 'auto' , objectFit: 'cover' }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: 'left', padding: 2 }}>
                            <Typography variant="h5" component="div" sx={{ color: orange[700], fontWeight: 'bold' }}>
                                {shop.data.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Address:</b> {shop.data.address}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>District:</b> {shop.data.district}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Province:</b> {shop.data.province}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Region:</b> {shop.data.region}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Postal Code:</b> {shop.data.postalcode}
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[800] }}>
                                <b>Tel:</b> {shop.data.tel}
                            </Typography>
                            <Box sx={{ padding: 1 }}>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Open Time:</b> {shop.data.openTime}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Close Time:</b> {shop.data.closeTime}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: orange[300] }} />

                <Paper
                    elevation={2}
                    sx={{
                        padding: 3,
                        borderRadius: 3,
                        bgcolor: orange[50], // Light orange background
                    }}
                >
                    <Typography variant="h6" align="center" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
                        Massage Shop Reservation
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <EditBookingForm session={session} shop={shop.data} reservationId={reservation.data.id}/>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Booker ID:</b> {reservation.data.user}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Reservation Holder:</b> {reservation.data.userName}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Create At:</b> {new Date(reservation.data.createAt).toDateString()}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Booking Date:</b> {new Date(reservation.data.reservationDate).toDateString()}
                                </Typography>
                                <Typography variant="body1" sx={{ color: grey[800] }}>
                                    <b>Booking Time:</b> {dayjs(reservation.data.reservationDate).subtract(7, 'hour').format('HH:mm')}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Paper>
        </Box>
    );
}
