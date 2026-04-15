import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { CommunityPost, CommunityComment } from "@/src/types";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import PostCard from "@/src/components/community/PostCard";
import CommentItem from "@/src/components/community/CommentItem";
import { ArrowLeft, Send, MessageSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ArticleSkeleton } from "@/src/components/ui/PageLoaders";

export default function CommunityPostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch Post
    const fetchPost = async () => {
      const postRef = doc(db, "communityPosts", id);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        setPost({ id: postSnap.id, ...postSnap.data() } as CommunityPost);
      }
      setLoading(false);
    };
    fetchPost();

    // Fetch Comments
    const commentsRef = collection(db, "communityComments");
    const q = query(
      commentsRef, 
      where("postId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityComment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "communityComments"), {
        postId: id,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        authorPhoto: user.photoURL || null,
        text: newComment.trim(),
        upvotes: 0,
        createdAt: serverTimestamp()
      });

      // Update comment count on post
      await updateDoc(doc(db, "communityPosts", id), {
        commentCount: increment(1)
      });

      setNewComment("");
    } catch (err: any) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ArticleSkeleton />;
  if (!post) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"><h2 className="text-2xl font-bold text-slate-800 mb-4">Post not found</h2><Link to="/community" className="text-primary font-bold flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back to Community</Link></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link to="/community" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Community
          </Link>

          <PostCard post={post} isDetail />

          {/* Comment Form */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Add a Comment
            </h3>
            
            {user ? (
              <form onSubmit={handleComment} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
                <textarea 
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 mb-4">Please log in to join the conversation</p>
                <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-xl font-bold inline-block">Log In</Link>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 px-2">
              Comments ({comments.length})
            </h3>
            
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments
                  .filter(c => !c.parentId) // Top-level comments
                  .map((comment) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      replies={comments.filter(r => r.parentId === comment.id)}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-400">No comments yet. Be the first to reply!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
