"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AnimatedHeroSvg() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      style={{
        minHeight: "45vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8
      }}
    >
      <Image src='/cart.png' alt="Hero animation" width={1200} height={520} style={{ width: "100%", height: "auto", maxHeight: "45vh", objectFit: "contain", borderRadius: 14 }} />
    </motion.div>
  );
}
