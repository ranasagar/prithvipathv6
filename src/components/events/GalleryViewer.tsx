import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Heart, Share2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryViewerProps {
  media: {
    id: string;
    url: string;
    type: "photo" | "video";
    caption: string;
  }[];
  onClose: () => void;
}

export default function GalleryViewer({ media, onClose }: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % media.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black flex flex-col"
    >
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <h3 className="text-white font-black text-lg">ग्यालरी</h3>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20">
          <X size={24} />
        </button>
      </div>

      <div className="grow flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={media[currentIndex].id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            src={media[currentIndex].url}
            alt={media[currentIndex].caption}
            className="max-h-[80vh] max-w-[90vw] object-contain"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        <button onClick={prev} className="absolute left-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20">
          <ChevronLeft size={32} />
        </button>
        <button onClick={next} className="absolute right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20">
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="p-8 bg-black/80 backdrop-blur-md flex flex-col gap-4">
        <p className="text-white text-lg font-medium">{media[currentIndex].caption}</p>
        <div className="flex gap-6 text-white">
          <button className="flex items-center gap-2 hover:text-primary"><Heart size={20} /> Like</button>
          <button className="flex items-center gap-2 hover:text-primary"><MessageCircle size={20} /> Comment</button>
          <button className="flex items-center gap-2 hover:text-primary"><Share2 size={20} /> Share</button>
        </div>
      </div>
    </motion.div>
  );
}
