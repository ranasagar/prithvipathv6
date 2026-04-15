import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, updateDoc, increment, setDoc, deleteDoc, query, collection, where, getDocs, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { CommunityPost, Article } from "@/src/types";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreVertical, Edit2, Trash2, Flag, ShieldCheck, ChevronDown, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toSafeDate } from "@/src/lib/utils";

interface PostCardProps {
  post: CommunityPost;
  isDetail?: boolean;
}

export default function PostCard({ post, isDetail = false }: PostCardProps) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editTitle, setEditTitle] = useState(post.title);
  const [linkedArticle, setLinkedArticle] = useState<Article | null>(null);
  const [showArticle, setShowArticle] = useState(false);

  const isAdmin = user?.role === "admin";
  const isEditor = user?.role === "editor" || isAdmin;
  const isAuthor = user?.uid === post.authorId;

  useEffect(() => {
    if (user) {
      const checkVote = async () => {
        const q = query(
          collection(db, "communityVotes"),
          where("userId", "==", user.uid),
          where("targetId", "==", post.id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserVote(snapshot.docs[0].data().type);
        }
      };
      checkVote();
    }
  }, [user, post.id]);

  useEffect(() => {
    if (post.linkedArticleId) {
      const fetchArticle = async () => {
        const docRef = doc(db, "articles", post.linkedArticleId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLinkedArticle({ id: docSnap.id, ...docSnap.data() } as Article);
        }
      };
      fetchArticle();
    }
  }, [post.linkedArticleId]);

  const handleVote = async (type: "up" | "down") => {
    if (!user) return window.location.href = "/login";
    
    const voteRef = doc(db, "communityVotes", `${user.uid}_${post.id}`);
    const postRef = doc(db, "communityPosts", post.id);

    if (userVote === type) {
      // Remove vote
      await deleteDoc(voteRef);
      await updateDoc(postRef, {
        [type === "up" ? "upvotes" : "downvotes"]: increment(-1)
      });
      setUserVote(null);
    } else {
      // Add or change vote
      const oldVote = userVote;
      await setDoc(voteRef, {
        userId: user.uid,
        targetId: post.id,
        type,
        createdAt: serverTimestamp()
      });

      const updates: any = {
        [type === "up" ? "upvotes" : "downvotes"]: increment(1)
      };
      if (oldVote) {
        updates[oldVote === "up" ? "upvotes" : "downvotes"] = increment(-1);
      }
      await updateDoc(postRef, updates);
      setUserVote(type);
    }
  };

  const handleEdit = async () => {
    if (!isAuthor) return;
    const postRef = doc(db, "communityPosts", post.id);
    await updateDoc(postRef, {
      title: editTitle,
      content: editContent,
      updatedAt: serverTimestamp()
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!isAdmin && !isAuthor) return;
    if (confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "communityPosts", post.id));
    }
  };

  const handleModerate = async (status: "removed" | "flagged" | "active") => {
    if (!isEditor) return;
    await updateDoc(doc(db, "communityPosts", post.id), { status });
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:border-primary/30 ${isDetail ? "" : "hover:shadow-md"}`}>
      <div className="flex">
        {/* Vote Sidebar */}
        <div className="bg-slate-50/50 w-12 flex flex-col items-center py-4 gap-1 border-r border-slate-100">
          <button 
            onClick={() => handleVote("up")}
            className={`p-1 rounded-lg transition-colors ${userVote === "up" ? "text-orange-600 bg-orange-100" : "text-slate-400 hover:bg-slate-200"}`}
          >
            <ArrowBigUp className={`w-8 h-8 ${userVote === "up" ? "fill-current" : ""}`} />
          </button>
          <span className={`font-bold text-sm ${userVote === "up" ? "text-orange-600" : userVote === "down" ? "text-indigo-600" : "text-slate-700"}`}>
            {(post.upvotes || 0) - (post.downvotes || 0)}
          </span>
          <button 
            onClick={() => handleVote("down")}
            className={`p-1 rounded-lg transition-colors ${userVote === "down" ? "text-indigo-600 bg-indigo-100" : "text-slate-400 hover:bg-slate-200"}`}
          >
            <ArrowBigDown className={`w-8 h-8 ${userVote === "down" ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">Posted by {post.authorName}</span>
              <span>•</span>
              <span>{post.createdAt ? formatDistanceToNow(toSafeDate(post.createdAt)) + " ago" : "Just now"}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
                  >
                    {isAuthor && (
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Post
                      </button>
                    )}
                    {(isAuthor || isAdmin) && (
                      <button 
                        onClick={() => { handleDelete(); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Post
                      </button>
                    )}
                    {isEditor && !isAuthor && (
                      <button 
                        onClick={() => { handleModerate("removed"); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> Remove (Mod)
                      </button>
                    )}
                    {!isAuthor && (
                      <button 
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4" /> Report
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="space-y-4">
              <input 
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-xl"
              />
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <div className="flex gap-2">
                <button onClick={handleEdit} className="bg-primary text-white px-4 py-2 rounded-xl font-bold">Save</button>
                <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <Link to={`/community/post/${post.id}`} className="block group">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className={`text-slate-600 leading-relaxed ${isDetail ? "" : "line-clamp-3"}`}>
                  {post.content}
                </p>
              </Link>
              
              {post.imageUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                  <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[500px]" referrerPolicy="no-referrer" />
                </div>
              )}

              {post.linkedArticleId && linkedArticle && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <button 
                    onClick={() => setShowArticle(!showArticle)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                        <img src={linkedArticle.featuredImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">सम्बन्धित समाचार</p>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{linkedArticle.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                      <span className="hidden sm:inline">{showArticle ? "लुकाउनुहोस्" : "पढ्नुहोस्"}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showArticle ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showArticle && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-white border border-slate-100 rounded-2xl mt-4 prose-nepali text-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                          <div dangerouslySetInnerHTML={{ __html: linkedArticle.content }} />
                          <Link to={`/article/${linkedArticle.id}`} className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest mt-6 hover:underline">
                            पूरा समाचार पढ्नुहोस् <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-4">
            <Link to={`/community/post/${post.id}`} className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-bold">{post.commentCount || 0} Comments</span>
            </Link>
            <button 
              onClick={() => {
                const url = `${window.location.origin}/community/post/${post.id}`;
                navigator.clipboard.writeText(url);
                alert("Post link copied to clipboard!");
              }}
              className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-bold">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
