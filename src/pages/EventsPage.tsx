import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import EventGrid from "@/src/components/events/EventGrid";
import FeaturedEvent from "@/src/components/events/FeaturedEvent";
import { motion } from "motion/react";

import { GridSkeleton } from "@/src/components/ui/PageLoaders";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), where("status", "==", "published"));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <GridSkeleton />;

  const featured = events.find(e => e.isFeatured) || events[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="grow container-custom py-12">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">घटनाहरू</h1>
          <p className="text-xl text-slate-500 font-medium">हाम्रा विशेष कार्यक्रमहरूको झलक</p>
        </div>
        
        {featured && (
          <div className="mb-20">
            <FeaturedEvent 
              event={{
                ...featured,
                stats: { views: 1200, photos: 45, videos: 2 }
              }} 
            />
          </div>
        )}
        <EventGrid events={events} />
      </main>
      <Footer />
    </div>
  );
}
