import { motion } from "motion/react";

interface LiveIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LiveIndicator({ size = "md", className = "" }: LiveIndicatorProps) {
  const sizeConfig = {
    sm: { dot: "w-2 h-2", text: "text-xxs", padding: "px-2 py-0.5" },
    md: { dot: "w-2.5 h-2.5", text: "text-xs", padding: "px-3 py-1" },
    lg: { dot: "w-3 h-3", text: "text-sm", padding: "px-4 py-1.5" }
  };

  const { dot, text, padding } = sizeConfig[size];

  return (
    <motion.div
      className={`inline-flex items-center gap-2 bg-red-500 text-white font-black uppercase tracking-widest rounded-full ${padding} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="relative flex items-center justify-center">
        <motion.span
          className={`absolute ${dot} bg-red-400 rounded-full`}
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className={`relative ${dot} bg-white rounded-full`} />
      </span>
      <span className={text}>LIVE</span>
    </motion.div>
  );
}
