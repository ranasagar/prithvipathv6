import { motion } from "motion/react";

interface ThumbnailSliderProps {
  media: { id: string; url: string; caption: string }[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailSlider({ media, currentIndex, onSelect }: ThumbnailSliderProps) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl">
      {media.map((item, index) => (
        <motion.button
          key={item.id}
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelect(index)}
          className={`relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 ${
            index === currentIndex ? "border-primary" : "border-transparent"
          }`}
        >
          <img 
            src={item.url} 
            alt={item.caption} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.button>
      ))}
    </div>
  );
}
