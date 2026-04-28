import React from "react";
import { motion, AnimatePresence } from "motion/react";
interface WaterSpillProps {
  isSpilling: boolean;
}
export const WaterSpill: React.FC<WaterSpillProps> = ({ isSpilling }) => {
  return (
    <AnimatePresence>
      {" "}
      {isSpilling && (
        <motion.div
          className="fixed inset-0 z-[999] pointer-events-none flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1.2, ease: "easeInOut" },
          }}
        >
          {" "}
          {/* Elegant background fade - theme matching cream/white */}{" "}
          <motion.div
            className="absolute inset-0 bg-[#FAFAF9]/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />{" "}
          {/* Gentle golden light glow from center */}{" "}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-gold-light)_0%,transparent_70%)] opacity-30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 1.5] }}
            transition={{ duration: 3, ease: "easeOut" }}
            style={{ mixBlendMode: "multiply" }}
          />{" "}
          {/* Main golden text fade in and out */}{" "}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1.05, 1.05, 1.1],
              y: [20, 0, 0, -20],
            }}
            transition={{
              duration: 3.5,
              ease: "easeOut",
              times: [0, 0.2, 0.8, 1],
            }}
          >
            {" "}
            <span className="font-serif italic text-4xl text-cookbook-primary/80 drop-shadow-sm mb-2">
              {" "}
              Pote{" "}
            </span>{" "}
            <span className="font-sans font-bold text-5xl uppercase tracking-widest text-[#C5A059] drop-shadow-md">
              {" "}
              Renovado{" "}
            </span>{" "}
          </motion.div>{" "}
          {/* Elegant floating shards / confetti instead of water */}{" "}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                backgroundColor: Math.random() > 0.5 ? "#C5A059" : "#8E7F6D",
                left: `${50 + (Math.random() * 40 - 20)}%`,
                top: `${60 + (Math.random() * 20 - 10)}%`,
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                borderRadius: Math.random() > 0.5 ? "50%" : "1px",
                opacity: 0.8,
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, Math.random() * 1.5 + 0.5, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * -500 - 100,
                /* Float elegantly upwards */ rotate: Math.random() * 720,
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: Math.random() * 0.4,
                ease: "easeOut",
              }}
            />
          ))}{" "}
        </motion.div>
      )}{" "}
    </AnimatePresence>
  );
};
