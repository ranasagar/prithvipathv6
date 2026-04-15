import { Link } from "react-router-dom";
import { Eye, Camera, Video } from "lucide-react";
import { motion } from "motion/react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    tagline: string;
    date: string;
    featuredImage: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all duration-500"
    >
      <Link to={`/events/${event.id}`} className="block aspect-4/5 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          src={event.featuredImage}
          alt={event.title}
          className="h-full w-full object-cover transition-opacity duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent p-6 flex flex-col justify-end gap-2">
          <span className="text-xxs font-black text-primary uppercase tracking-[0.2em]">
            {new Date(event.date).toLocaleDateString('ne-NP')}
          </span>
          <h3 className="text-xl font-black text-white leading-tight group-hover:text-primary transition-colors duration-300">
            {event.title}
          </h3>
          <p className="text-xs text-slate-200 line-clamp-2 font-medium">{event.tagline}</p>
        </div>
      </Link>
      
      <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary">
        <Eye size={18} />
      </button>
    </motion.div>
  );
}
