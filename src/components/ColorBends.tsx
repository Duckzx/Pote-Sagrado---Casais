import React from 'react';
import { motion } from 'motion/react';

interface ColorBendsProps {
  color?: string;
  speed?: number;
  frequency?: number;
  noise?: number;
  bandWidth?: number;
  rotation?: number;
  fadeTop?: number;
  iterations?: number;
  intensity?: number;
  className?: string;
}

export const ColorBends: React.FC<ColorBendsProps> = ({
  color = '#8E7F6D',
  className = '',
}) => {
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none opacity-20 ${className}`}
      style={{ zIndex: 0 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[60px]"
        style={{ backgroundColor: color }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full blur-[80px]"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};
