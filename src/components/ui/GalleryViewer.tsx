import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryViewerProps {
  images: GalleryImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryViewer({ images, initialIndex = 0, isOpen, onClose }: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setZoom(1);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-300 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        {/* Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.25)); }}
            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            aria-label="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.25)); }}
            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            aria-label="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-all"
            aria-label="Close Gallery"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all z-10"
          aria-label="Previous Image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all z-10"
          aria-label="Next Image"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image */}
        <div
          className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            alt={images[currentIndex].caption || ""}
            className="max-w-full max-h-[85vh] object-contain transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Counter & Caption */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
          <div className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full">
            <span className="font-black text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          {images[currentIndex].caption && (
            <p className="text-white/80 text-sm font-medium mt-2 max-w-md text-center">
              {images[currentIndex].caption}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
