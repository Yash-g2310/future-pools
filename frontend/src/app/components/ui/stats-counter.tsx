"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StatsCounterProps {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export const StatsCounter = ({ 
  value, 
  label, 
  prefix = "", 
  suffix = "",
  delay = 0 
}: StatsCounterProps) => {
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center group cursor-default"
    >
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
          className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
        >
          {prefix}{displayValue}{suffix}
        </motion.span>
      </div>
      <div className="text-gray-400 text-sm md:text-base font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};