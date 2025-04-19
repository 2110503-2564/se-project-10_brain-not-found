'use client'
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useState } from "react";

export default function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Box sx={{ position: "relative", width: "100%", height: 500, overflow: "hidden", borderRadius: 2 }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
        >
          <Image
            src={images[index] ?? "/img/logo.png"}
            alt={`Slide ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
          />
        </motion.div>
      </AnimatePresence>

      <IconButton
        onClick={prev}
        sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", zIndex: 1 }}
      >
        <ArrowBackIos />
      </IconButton>
      <IconButton
        onClick={next}
        sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", zIndex: 1 }}
      >
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
}