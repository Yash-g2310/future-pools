"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export const GradientText = ({ 
  children, 
  className,
  gradient = "from-purple-400 via-pink-400 to-cyan-400"
}: GradientTextProps) => {
  return (
    <motion.span
      className={cn(
        `bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`,
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.span>
  );
};