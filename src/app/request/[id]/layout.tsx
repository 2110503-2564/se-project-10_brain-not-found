import { Box, Paper } from "@mui/material";
import { grey } from "@mui/material/colors";

export default function requestInfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: grey[100],
          padding: { xs: 2, sm: 3, md: 4 }, 
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
            mt: 4,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", padding: 2 }}>
            {children}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
