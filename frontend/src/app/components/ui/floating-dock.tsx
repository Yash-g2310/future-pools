"use client";

import { cn } from "@/app/lib/utils";
import { motion } from "framer-motion";

export interface FloatingDockProps {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <motion.div
        className="flex items-center justify-center gap-4 px-6 py-3 rounded-full bg-black/20 backdrop-blur-lg border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.title}
            className="relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.href ? (
              <a
                href={item.href}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title={item.title}
              >
                {item.icon}
              </a>
            ) : (
              <button
                onClick={item.onClick}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title={item.title}
              >
                {item.icon}
              </button>
            )}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
              {item.title}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};