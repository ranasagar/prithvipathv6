import { motion } from "motion/react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

export default function TimelineView({ events }: TimelineViewProps) {
  return (
    <div className="relative py-12">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
      <div className="flex flex-col gap-12">
        {events.map((event, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative pl-20"
          >
            <div className="absolute left-4 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
              {index + 1}
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{event.time}</span>
              <h4 className="text-xl font-black text-slate-900 mt-2">{event.title}</h4>
              <p className="text-slate-600 mt-2">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
