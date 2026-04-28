import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
export const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      current,
    ),
  );
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span>{display}</motion.span>;
};
