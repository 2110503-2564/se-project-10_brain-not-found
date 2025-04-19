import { Typography, Box } from "@mui/material";
import { grey } from "@mui/material/colors";

export default function ShopDescription({ description }: { description: string }) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ color: grey[800] }}>
          {description}
        </Typography>
      </Box>
    );
}
  