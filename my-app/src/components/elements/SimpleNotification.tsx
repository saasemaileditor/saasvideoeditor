import { motion } from "motion/react";
import { Bell, X } from "lucide-react";
import React from 'react';

interface SimpleNotificationProps {
  appIcon?: React.ReactNode;
  appName?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  animationType?: "slide" | "fade" | "bounce" | "scale";
  showDismiss?: boolean;
  width?: number;
  onDismiss?: () => void;
}

export const SimpleNotification = ({
  appIcon = <Bell size={20} />,
  appName = "App Name",
  title = "Notification",
  message = "You have a new message",
  timestamp = "now",
  backgroundColor = "#ffffff",
  textColor = "#111827",
  secondaryTextColor = "#6b7280",
  animationType = "slide",
  showDismiss = true,
  width = 340,
  onDismiss,
}: SimpleNotificationProps) => {
  const animations = {
    slide: { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    bounce: { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    scale: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
  };

  return (
    <motion.div
      className="flex items-start gap-3 p-4 rounded-xl shadow-lg"
      style={{ backgroundColor, width }}
      initial={animations[animationType as keyof typeof animations]?.initial || animations.slide.initial}
      animate={animations[animationType as keyof typeof animations]?.animate || animations.slide.animate}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
        {appIcon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm" style={{ color: textColor }}>{appName}</span>
          <span className="text-xs" style={{ color: secondaryTextColor }}>{timestamp}</span>
        </div>
        <p className="font-medium text-sm mt-1" style={{ color: textColor }}>{title}</p>
        <p className="text-sm mt-0.5" style={{ color: secondaryTextColor }}>{message}</p>
      </div>
      
      {showDismiss && onDismiss && (
        <button 
          onClick={onDismiss} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};
