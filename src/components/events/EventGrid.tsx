import EventCard from "./EventCard";
import { motion } from "motion/react";

interface EventGridProps {
  events: any[];
}

export default function EventGrid({ events }: EventGridProps) {
  return (
    <div className="container-custom py-16">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
          घटनाहरू <span className="text-primary">तस्बिरमा</span>
        </h2>
        <div className="flex gap-2">
          {/* Add filter buttons here later */}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </motion.div>
    </div>
  );
}
