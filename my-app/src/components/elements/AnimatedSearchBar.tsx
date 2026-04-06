import { motion } from "motion/react";
import { Search } from "lucide-react";
import React from 'react';

interface AnimatedSearchBarProps {
  placeholder?: string;
  placeholderAnimation?: "typing" | "fade" | "none";
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  width?: number;
  height?: number;
  iconColor?: string;
  textColor?: string;
  animationDuration?: number;
}

export const AnimatedSearchBar = ({
  placeholder = "Search...",
  placeholderAnimation = "typing",
  backgroundColor = "#ffffff",
  borderColor = "#e5e7eb",
  borderRadius = 12,
  width = 280,
  height = 44,
  iconColor = "#9ca3af",
  textColor = "#6b7280",
  animationDuration = 2,
}: AnimatedSearchBarProps) => {
  return (
    <motion.div
      className="flex items-center gap-3 px-4"
      style={{
        width,
        height,
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Search size={18} style={{ color: iconColor }} />
      </motion.div>
      
      {placeholderAnimation === "typing" ? (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ duration: animationDuration, ease: "linear", delay: 0.3 }}
          className="overflow-hidden whitespace-nowrap text-sm"
          style={{ color: textColor }}
        >
          {placeholder}
        </motion.span>
      ) : placeholderAnimation === "fade" ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm"
          style={{ color: textColor }}
        >
          {placeholder}
        </motion.span>
      ) : (
        <span className="text-sm" style={{ color: textColor }}>{placeholder}</span>
      )}
    </motion.div>
  );
};
