import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { formatBRL } from "../lib/maskUtils";

/**
 * AnimatedNumber component optimized by Bolt ⚡
 * Uses a centralized BRL formatter singleton to avoid expensive initialization on every frame.
 */
export const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });

  // High-frequency transform: use centralized formatter
  const display = useTransform(spring, (current) => formatBRL(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};
