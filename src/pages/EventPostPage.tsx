import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import GalleryViewer from "@/src/components/events/GalleryViewer";
import ThumbnailSlider from "@/src/components/events/ThumbnailSlider";
import TimelineView from "@/src/components/events/TimelineView";
import CommentSection from "@/src/components/events/CommentSection";
import { ArrowLeft } from "lucide-react";

import { ArticleSkeleton } from "@/src/components/ui/PageLoaders";

export default function EventPostPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const eventRef = doc(db, "events", id);
    getDoc(eventRef).then(snap => setEvent({ id: snap.id, ...snap.data() }));

    const mediaQ = query(collection(db, `events/${id}/media`));
    const unsubMedia = onSnapshot(mediaQ, snap => setMedia(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const commentsQ = query(collection(db, "event_comments"), where("eventId", "==", id));
    const unsubComments = onSnapshot(commentsQ, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubMedia(); unsubComments(); };
  }, [id]);

  if (!event) return <ArticleSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container-custom py-12">
        <div className="max-w-4xl mx-auto mb-16">
          <Link to="/events" className="flex items-center gap-2 text-primary font-black mb-6 hover:text-primary/80 transition-colors">
            <ArrowLeft size={18} /> घटनाहरूमा फर्कनुहोस्
          </Link>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">{event.title}</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">{event.tagline}</p>
          
          <div className="flex items-center gap-6 mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">मिति</span>
              <span className="font-bold text-slate-900">{new Date(event.date).toLocaleDateString('ne-NP')}</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">स्थान</span>
              <span className="font-bold text-slate-900">{event.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 flex flex-col gap-10">
            <img src={event.featuredImage} className="w-full rounded-[2.5rem] shadow-2xl aspect-video object-cover" />
            <ThumbnailSlider media={media} currentIndex={currentIndex} onSelect={(i) => { setCurrentIndex(i); setShowGallery(true); }} />
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black mb-8">कार्यक्रमको तालिका</h3>
              <TimelineView events={event.timeline || []} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <CommentSection eventId={id!} comments={comments} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showGallery && <GalleryViewer media={media} onClose={() => setShowGallery(false)} />}
    </div>
  );
}
