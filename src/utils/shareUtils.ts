import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Article, User } from "@/src/types";

export const shareToChautari = async (article: Article, user: User | null) => {
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  try {
    const postData = {
      title: `${article.title} मा छलफल गरौं`,
      content: `यो समाचारको बारेमा तपाईंको धारणा के छ? छलफल सुरु गरौं।\n\n${article.excerpt}`,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      authorPhoto: user.photoURL || null,
      category: "छलफल",
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      imageUrl: article.featuredImage,
      linkedArticleId: article.id,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "communityPosts"), postData);
    return docRef.id;
  } catch (error) {
    console.error("Error sharing to Chautari:", error);
    throw error;
  }
};
