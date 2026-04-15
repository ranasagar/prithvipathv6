import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { X, Image as ImageIcon, Send, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("News");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ["News", "Politics", "Sports", "Entertainment", "Technology", "Opinion"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "communityPosts"), {
        title: title.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || null,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        authorPhoto: user.photoURL || null,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setTitle("");
      setContent("");
      setImageUrl("");
      onClose();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-4xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">Create a Post</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        category === cat 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="Title of your post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-bold placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <textarea 
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-black text-slate-700 ml-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Image URL (Optional)
                </div>
                <input 
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm placeholder:text-slate-300"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Post to Chautari
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
