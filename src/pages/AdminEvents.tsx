import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Plus, Edit } from "lucide-react";
import AdminLayout from "@/src/components/layout/AdminLayout";
import { motion } from "motion/react";

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    return onSnapshot(q, (snap) => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">घटना व्यवस्थापन</h1>
          <Link to="/admin/events/new" className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Plus size={20} /> नयाँ घटना
          </Link>
        </div>
        <div className="grid gap-4">
          {events.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-3xl shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{event.title}</h3>
                <p className="text-slate-500 text-sm">{event.date}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/events/${event.id}`} className="p-2 hover:bg-slate-100 rounded-xl"><Edit size={20} /></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
