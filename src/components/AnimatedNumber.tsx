import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { formatBRL } from "../lib/maskUtils";

export const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });

  // Use centralized formatter to avoid creating new Intl.NumberFormat instances on every frame
  const display = useTransform(spring, (current) => formatBRL(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};
