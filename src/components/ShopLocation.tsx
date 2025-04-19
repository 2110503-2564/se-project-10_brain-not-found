'use client'
import { Typography, Box, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useState } from "react";

export default function ShopLocation({ location }: { location: ShopItem }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: grey[900] }}>
        Location
      </Typography>

      <Typography variant="body1" sx={{ color: grey[800] }}>
        <b>Address:</b> {location.address}
      </Typography>

      {showMore && (
        <>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>District:</b> {location.district}
          </Typography>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>Province:</b> {location.province}
          </Typography>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>Region:</b> {location.region}
          </Typography>
          <Typography variant="body1" sx={{ color: grey[800] }}>
            <b>Postal Code:</b> {location.postalcode}
          </Typography>
        </>
      )}

      <Button
        size="small"
        variant="text"
        sx={{ mt: 0 }}
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "ซ่อนข้อมูล" : "ดูข้อมูลเพิ่มเติม"}
      </Button>
    </Box>
  );
}
