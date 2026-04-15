import { Link } from "react-router-dom";
import { Eye, Camera, Video } from "lucide-react";
import { motion } from "motion/react";

interface FeaturedEventProps {
  event: {
    id: string;
    title: string;
    tagline: string;
    featuredImage: string;
    stats: {
      views: number;
      photos: number;
      videos: number;
    };
  };
}

export default function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container-custom py-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-4xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="relative aspect-4/3 lg:aspect-auto lg:h-full overflow-hidden">
          <img 
            src={event.featuredImage} 
            alt={event.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-12 flex flex-col gap-8">
          <span className="text-xs font-black text-primary uppercase tracking-widest">विशेष घटना</span>
          <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">{event.title}</h2>
          <p className="text-lg text-slate-600">{event.tagline}</p>
          
          <div className="flex gap-8 py-6 border-y border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 font-bold"><Eye size={20} className="text-primary" /> {event.stats.views}</div>
            <div className="flex items-center gap-2 text-slate-500 font-bold"><Camera size={20} className="text-primary" /> {event.stats.photos}</div>
            <div className="flex items-center gap-2 text-slate-500 font-bold"><Video size={20} className="text-primary" /> {event.stats.videos}</div>
          </div>

          <Link 
            to={`/events/${event.id}`}
            className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all w-fit shadow-xl"
          >
            कथा अन्वेषण गर्नुहोस्
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
