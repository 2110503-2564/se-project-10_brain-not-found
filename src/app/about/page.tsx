// src/app/about/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getReservations from "@/libs/getReservation";
import getUserProfile from "@/libs/getUserProfile";
import UserProfile from "@/components/UserProfile";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import { orange, grey } from "@mui/material/colors";

export default async function About() {
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
                    maxWidth: 800,
                    padding: 4,
                    borderRadius: 4,
                    bgcolor: 'white',
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                    sx={{ color: orange[800], fontWeight: 'bold' }}
                >
                    Who Are We?
                </Typography>
                <Typography
                    variant="h6"
                    align="center"
                    gutterBottom
                    sx={{ color: grey[800], fontStyle: 'italic' }}
                >
                    Team: shadowexception
                </Typography>

                <UserProfile />

                <Divider sx={{ my: 4, borderColor: orange[300] }} />

                <Typography
                    variant="h5"
                    component="h2"
                    align="center"
                    gutterBottom
                    sx={{ color: orange[700], fontWeight: 'bold' }}
                >
                    Our Team
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: grey[800], fontWeight: 'bold' }}>
                                Rattapoom Phonyiam
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[700] }}>
                                6733220021
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: grey[800], fontWeight: 'bold' }}>
                                Tananan Narkchuay
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[700] }}>
                                6733102721
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: grey[800], fontWeight: 'bold' }}>
                                Teerattapon Ngampongpun
                            </Typography>
                            <Typography variant="body1" sx={{ color: grey[700] }}>
                                6733114221
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
