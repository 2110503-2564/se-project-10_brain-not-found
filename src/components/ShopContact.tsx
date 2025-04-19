'use client'
import { Typography, Box, Button } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useState } from "react";


export default function ShopContact({ contact }: { contact: ShopItem }) {

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: grey[900] }}>
        Contact
      </Typography>
      <Typography variant="body1" sx={{ color: grey[800] }}>
        {contact.tel}
       </Typography>

    </Box>
  );
}
