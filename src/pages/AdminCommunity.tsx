import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { CommunityPost } from "@/src/types";
import AdminLayout from "@/src/components/layout/AdminLayout";
import { Shield, Trash2, CheckCircle, AlertTriangle, Eye, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toSafeDate } from "@/src/lib/utils";

import { AdminSkeleton } from "@/src/components/ui/PageLoaders";

export default function AdminCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "flagged" | "removed">("all");

  useEffect(() => {
    const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const handleStatusChange = async (postId: string, status: string) => {
    await updateDoc(doc(db, "communityPosts", postId), { status });
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Permanently delete this post?")) {
      await deleteDoc(doc(db, "communityPosts", postId));
    }
  };

  if (loading) return <AdminSkeleton />;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Community Moderation
              </h1>
              <p className="text-slate-500 font-medium">Manage Chautari posts and reports</p>
            </div>

            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              {["all", "active", "flagged", "removed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                    filter === f ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="p-20 text-center">Loading posts...</div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-start justify-between gap-6"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-bold uppercase ${
                        post.status === 'active' ? 'bg-green-100 text-green-600' :
                        post.status === 'flagged' ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.authorName}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{post.createdAt ? format(toSafeDate(post.createdAt), "MMM d, yyyy") : "N/A"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {post.upvotes} Upvotes</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentCount} Comments</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleStatusChange(post.id, "active")}
                      className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors"
                      title="Approve/Active"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(post.id, "flagged")}
                      className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors"
                      title="Flag"
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(post.id, "removed")}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => window.open(`/community/post/${post.id}`, "_blank")}
                      className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
                      title="View Post"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold">No posts found for this filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
