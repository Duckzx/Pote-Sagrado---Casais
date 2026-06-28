import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { formatBRL } from "../lib/maskUtils";

export const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => formatBRL(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span>{display}</motion.span>;
};
