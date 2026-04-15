import { useState } from "react";
import { Send, User } from "lucide-react";
import { useAuth } from "@/src/lib/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

interface Comment {
  id: string;
  userName: string;
  content: string;
  createdAt: any;
}

interface CommentSectionProps {
  eventId: string;
  comments: Comment[];
}

export default function CommentSection({ eventId, comments }: CommentSectionProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "event_comments"), {
        eventId,
        userId: user?.uid || "anonymous",
        userName: user?.email || "अज्ञात प्रयोगकर्ता",
        content: text.trim(),
        createdAt: serverTimestamp()
      });
      setText("");
    } catch (error) {
      console.error("Comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100 flex flex-col gap-8">
      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">प्रतिक्रिया</h3>
      
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="तपाईंको विचार व्यक्त गर्नुहोस्..."
          className="grow bg-white border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-primary transition-all disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>

      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-black text-slate-900">{comment.userName}</span>
              <p className="text-sm text-slate-600">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
