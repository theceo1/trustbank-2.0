"use client";

import { motion } from "framer-motion";
import { useMediaQuery } from "@/app/hooks/use-media-query";
import { Calculator, TrendingUp, History, Settings } from "lucide-react";

export default function MobileBottomNav() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
    >
      <nav className="flex justify-around items-center h-16">
        {[
          { icon: Calculator, label: "Calculate" },
          { icon: TrendingUp, label: "Markets" },
          { icon: History, label: "History" },
          { icon: Settings, label: "Settings" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex flex-col items-center justify-center w-full h-full space-y-1"
          >
            <Icon className="w-5 h-5 text-green-600" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </button>
        ))}
      </nav>
    </motion.div>
  );
}