import { useState, useEffect } from "react";
import { doc, updateDoc, increment, deleteDoc, addDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { CommunityComment } from "@/src/types";
import { ArrowBigUp, MessageSquare, MoreVertical, Edit2, Trash2, Flag, ShieldCheck, Share2, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toSafeDate } from "@/src/lib/utils";

interface CommentItemProps {
  comment: CommunityComment;
  replies?: CommunityComment[];
  onReplyAdded?: () => void;
}

export default function CommentItem({ comment, replies = [], onReplyAdded }: CommentItemProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.text);
  const [replyText, setReplyText] = useState("");
  const [userVote, setUserVote] = useState<boolean>(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAdmin = user?.role === "admin";
  const isEditor = user?.role === "editor" || isAdmin;
  const isAuthor = user?.uid === comment.authorId;

  useEffect(() => {
    if (user) {
      const checkVote = async () => {
        const q = query(
          collection(db, "communityVotes"),
          where("userId", "==", user.uid),
          where("targetId", "==", comment.id)
        );
        const snapshot = await getDocs(q);
        setUserVote(!snapshot.empty);
      };
      checkVote();
    }
  }, [user, comment.id]);

  const handleVote = async () => {
    if (!user) return window.location.href = "/login";
    
    const voteRef = doc(db, "communityVotes", `${user.uid}_${comment.id}`);
    const commentRef = doc(db, "communityComments", comment.id);

    if (userVote) {
      // Remove vote
      await deleteDoc(voteRef);
      await updateDoc(commentRef, {
        upvotes: increment(-1)
      });
      setUserVote(false);
    } else {
      // Add vote
      await setDoc(voteRef, {
        userId: user.uid,
        targetId: comment.id,
        type: "up",
        createdAt: serverTimestamp()
      });
      await updateDoc(commentRef, {
        upvotes: increment(1)
      });
      setUserVote(true);
    }
  };

  const handleEdit = async () => {
    if (!isAuthor) return;
    const commentRef = doc(db, "communityComments", comment.id);
    await updateDoc(commentRef, {
      text: editContent,
      updatedAt: serverTimestamp()
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!isAdmin && !isAuthor) return;
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteDoc(doc(db, "communityComments", comment.id));
      // Update comment count on post
      await updateDoc(doc(db, "communityPosts", comment.postId), {
        commentCount: increment(-1)
      });
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await addDoc(collection(db, "communityComments"), {
        postId: comment.postId,
        parentId: comment.id,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        authorPhoto: user.photoURL || null,
        text: replyText.trim(),
        upvotes: 0,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "communityPosts", comment.postId), {
        commentCount: increment(1)
      });

      setReplyText("");
      setIsReplying(false);
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      console.error("Error replying:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/post/${comment.postId}#comment-${comment.id}`;
    navigator.clipboard.writeText(url);
    alert("Comment link copied to clipboard!");
  };

  return (
    <div id={`comment-${comment.id}`} className="flex flex-col gap-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 transition-all hover:border-primary/20">
        <div className="flex gap-4">
          {/* Vote Sidebar */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <button 
              onClick={handleVote}
              className={`p-1 rounded-lg transition-colors ${userVote ? "text-orange-600 bg-orange-100" : "text-slate-400 hover:bg-slate-100"}`}
            >
              <ArrowBigUp className={`w-6 h-6 ${userVote ? "fill-current" : ""}`} />
            </button>
            <span className={`text-sm font-bold ${userVote ? "text-orange-600" : "text-slate-700"}`}>{comment.upvotes || 0}</span>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">{comment.authorName}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{comment.createdAt ? formatDistanceToNow(toSafeDate(comment.createdAt)) + " ago" : "Just now"}</span>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
                    >
                      {isAuthor && (
                        <button 
                          onClick={() => { setIsEditing(true); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      )}
                      {(isAuthor || isAdmin) && (
                        <button 
                          onClick={() => { handleDelete(); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                      {!isAuthor && (
                        <button 
                          onClick={() => setShowMenu(false)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Flag className="w-3 h-3" /> Report
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleEdit} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold">Save</button>
                  <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                {comment.text}
              </p>
            )}

            <div className="mt-3 flex items-center gap-4">
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                Reply
              </button>
              <button 
                onClick={handleShare}
                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {isReplying && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <form onSubmit={handleReply} className="flex flex-col gap-3">
                    <textarea 
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsReplying(false)}
                        className="p-2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        {submittingReply ? "Replying..." : "Reply"}
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="ml-6 sm:ml-12 border-l-2 border-slate-100 pl-4 sm:pl-6 space-y-4">
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
