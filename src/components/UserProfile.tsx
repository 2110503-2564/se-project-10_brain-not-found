// src/components/UserProfile.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import getUserProfile from '@/libs/getUserProfile';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { grey, orange } from '@mui/material/colors';

export default async function UserProfile() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.token) return null;

    const profile = await getUserProfile(session.user.token);
    if (!profile) return null;

    const createdAt = new Date(profile.data.createdAt);

    return (
        <Paper elevation={2} sx={{ padding: 3, borderRadius: 3, bgcolor: grey[50] }}>
            <Typography variant="h6" gutterBottom sx={{ color: orange[800], fontWeight: 'bold' }}>
                User Profile
            </Typography>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: grey[800] }}>Name</TableCell>
                        <TableCell sx={{ color: grey[700] }}>{profile.data.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: grey[800] }}>Email</TableCell>
                        <TableCell sx={{ color: grey[700] }}>{profile.data.email}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: grey[800] }}>Tel.</TableCell>
                        <TableCell sx={{ color: grey[700] }}>{profile.data.tel}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: grey[800] }}>Member Since</TableCell>
                        <TableCell sx={{ color: grey[700] }}>{createdAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
};