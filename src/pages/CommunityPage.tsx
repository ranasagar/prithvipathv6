import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { CommunityPost } from "@/src/types";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PostCard from "@/src/components/community/PostCard";
import CreatePostModal from "@/src/components/community/CreatePostModal";
import { MessageSquare, TrendingUp, Clock, Plus, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Skeleton } from "@/src/components/ui/Skeleton";

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<"new" | "top">("new");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "News", "Politics", "Sports", "Entertainment", "Technology", "Opinion"];

  useEffect(() => {
    const postsRef = collection(db, "communityPosts");
    let q = query(
      postsRef,
      where("status", "==", "active"),
      orderBy(sortBy === "new" ? "createdAt" : "upvotes", "desc")
    );

    if (filterCategory !== "All") {
      q = query(
        postsRef,
        where("status", "==", "active"),
        where("category", "==", filterCategory),
        orderBy(sortBy === "new" ? "createdAt" : "upvotes", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Categories
              </h2>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                      filterCategory === cat 
                        ? "bg-primary text-white font-bold" 
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Community Rules</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc ml-4">
                <li>Be respectful to others</li>
                <li>No hate speech or harassment</li>
                <li>Keep discussions relevant</li>
                <li>No spam or self-promotion</li>
              </ul>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="flex-1 space-y-6">
            {/* Top Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setSortBy("new")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    sortBy === "new" ? "bg-white shadow-sm text-primary font-bold" : "text-slate-500"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  New
                </button>
                <button
                  onClick={() => setSortBy("top")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    sortBy === "top" ? "bg-white shadow-sm text-primary font-bold" : "text-slate-500"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Top
                </button>
              </div>

              <button
                onClick={() => user ? setShowCreateModal(true) : window.location.href = "/login"}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                Create Post
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                      <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="w-32 h-4" />
                          <Skeleton className="w-24 h-3" />
                        </div>
                      </div>
                      <Skeleton className="w-3/4 h-6 mb-4" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-5/6 h-4" />
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-500">No posts yet</h3>
                  <p className="text-slate-400">Be the first to start a conversation!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right (Trending/Ads) */}
          <aside className="hidden xl:block w-80 space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
              <div className="space-y-4">
                {["#NepalElection", "#KathmanduTraffic", "#EverestCleanUp", "#NepaliCricket"].map((tag, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-slate-600 group-hover:text-primary transition-colors">{tag}</span>
                    <span className="text-xs text-slate-400">{(10 - i) * 12} posts</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <CreatePostModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
