import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/src/components/layout/AdminLayout";
import { motion } from "motion/react";

export default function AdminEventEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({ title: "", tagline: "", date: "", location: "", featuredImage: "", status: "draft", timeline: [] as any[] });

  useEffect(() => {
    if (id) {
      getDoc(doc(db, "events", id)).then(snap => {
        if (snap.exists()) setEvent({ ...snap.data() as any, timeline: snap.data().timeline || [] });
      });
    }
  }, [id]);

  const save = async () => {
    if (id) {
      await setDoc(doc(db, "events", id), event);
    } else {
      await addDoc(collection(db, "events"), { ...event, createdAt: serverTimestamp() });
    }
    navigate("/admin/events");
  };

  const addTimelineItem = () => setEvent({...event, timeline: [...event.timeline, { time: "", title: "", description: "" }]});
  const updateTimelineItem = (index: number, field: string, value: string) => {
    const newTimeline = [...event.timeline];
    newTimeline[index][field] = value;
    setEvent({...event, timeline: newTimeline});
  };
  const removeTimelineItem = (index: number) => setEvent({...event, timeline: event.timeline.filter((_, i) => i !== index)});

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-slate-500"><ArrowLeft size={20} /> पछाडि</button>
        <h1 className="text-3xl font-black mb-8">{id ? "घटना सम्पादन गर्नुहोस्" : "नयाँ घटना"}</h1>
        <div className="grid gap-6 bg-white p-8 rounded-3xl shadow-sm">
          <input value={event.title} onChange={e => setEvent({...event, title: e.target.value})} placeholder="शीर्षक" className="w-full p-4 rounded-2xl border" />
          <input value={event.tagline} onChange={e => setEvent({...event, tagline: e.target.value})} placeholder="ट्यागलाइन" className="w-full p-4 rounded-2xl border" />
          <input type="date" value={event.date} onChange={e => setEvent({...event, date: e.target.value})} className="w-full p-4 rounded-2xl border" />
          <input value={event.location} onChange={e => setEvent({...event, location: e.target.value})} placeholder="स्थान" className="w-full p-4 rounded-2xl border" />
          <input value={event.featuredImage} onChange={e => setEvent({...event, featuredImage: e.target.value})} placeholder="फोटो URL" className="w-full p-4 rounded-2xl border" />
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">टाइमलाइन</h3>
              <button onClick={addTimelineItem} className="text-primary flex items-center gap-1 font-bold"><Plus size={16} /> थप्नुहोस्</button>
            </div>
            {event.timeline.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input value={item.time} onChange={e => updateTimelineItem(index, 'time', e.target.value)} placeholder="समय" className="w-1/4 p-2 rounded-xl border" />
                <input value={item.title} onChange={e => updateTimelineItem(index, 'title', e.target.value)} placeholder="शीर्षक" className="w-1/4 p-2 rounded-xl border" />
                <input value={item.description} onChange={e => updateTimelineItem(index, 'description', e.target.value)} placeholder="विवरण" className="w-1/4 p-2 rounded-xl border" />
                <button onClick={() => removeTimelineItem(index)} className="text-red-500 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <select value={event.status} onChange={e => setEvent({...event, status: e.target.value})} className="w-full p-4 rounded-2xl border">
            <option value="draft">ड्राफ्ट</option>
            <option value="published">प्रकाशित</option>
          </select>
          <button onClick={save} className="bg-primary text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Save size={20} /> सुरक्षित गर्नुहोस्
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
