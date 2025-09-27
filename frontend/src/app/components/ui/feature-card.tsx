"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className,
  delay = 0 
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -10,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/30 backdrop-blur-sm border border-white/10 p-8 hover:border-purple-400/50 transition-all duration-300",
        className
      )}
    >
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-6 w-fit p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
          {icon}
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
    </motion.div>
  );
};