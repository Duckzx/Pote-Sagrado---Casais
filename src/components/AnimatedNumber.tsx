import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { BRL } from "../lib/maskUtils";

export const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => BRL.format(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};
