import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Clock, ChevronRight, Eye, Calendar, Share2 } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { shareToChautari } from "@/src/utils/shareUtils";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import Sidebar from "@/src/components/layout/Sidebar";
import FloatingActions from "@/src/components/layout/FloatingActions";
import TopicsIndex from "@/src/components/news/TopicsIndex";
import { formatDate } from "@/src/lib/utils";
import type { Article } from "@/src/types";
import { Helmet } from "react-helmet-async";

import { GridSkeleton } from "@/src/components/ui/PageLoaders";

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showTopics, setShowTopics] = useState(false);
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "विधा";

  useEffect(() => {
    if (!slug) return;

    const q = query(
      collection(db, "articles"), 
      where("categoryId", "==", slug),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(articlesData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching category articles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  const loadMore = async () => {
    if (!lastDoc || !slug) return;

    const q = query(
      collection(db, "articles"),
      where("categoryId", "==", slug),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    setArticles([...articles, ...newArticles]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 10);
  };

  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const postId = await shareToChautari(article, user as any);
      if (postId) navigate(`/community/post/${postId}`);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) return <GridSkeleton />;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{categoryName} विधा | Prithvi Path Media</title>
        <meta name="description" content={`${categoryName} विधामा ताजा समाचारहरू`} />
        <meta property="og:title" content={`${categoryName} विधा | Prithvi Path Media`} />
        <meta property="og:description" content={`${categoryName} विधामा ताजा समाचारहरू`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/category/${slug}`} />
      </Helmet>
      <Header />
      
      <main className="grow py-12">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xxs font-black text-slate-400 uppercase tracking-[0.2em] mb-10">
            <Link to="/" className="hover:text-primary transition-colors">गृहपृष्ठ</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 uppercase">{slug}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="flex flex-col gap-6 mb-16">
                <div className="flex items-center gap-4">
                  <span className="bg-primary text-white text-xxs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                    विधा आर्काइभ
                  </span>
                  <div className="h-px grow bg-slate-100"></div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight uppercase">
                    {categoryName}
                  </h1>
                  <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest pb-2">
                    <Calendar size={18} className="text-primary" />
                    <span>कुल {articles.length} समाचारहरू</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {articles.length > 0 ? articles.map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="group flex flex-col gap-6 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                    <div className="relative aspect-16/10 overflow-hidden rounded-2xl shadow-lg">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="flex flex-col gap-4 px-2">
                      <h2 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-[1.2] line-clamp-2 tracking-tight">
                        {article.title}
                      </h2>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-4 text-xxs font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> {formatDate(article.createdAt)}</span>
                          <span className="flex items-center gap-1.5"><Eye size={14} className="text-primary" /> {article.views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleShare(e, article)}
                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"
                            title="चौतारीमा साझा गर्नुहोस्"
                          >
                            <Share2 size={14} />
                          </button>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Calendar size={40} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest">यस विधामा कुनै समाचार भेटिएन।</p>
                  </div>
                )}
              </div>

              {/* Pagination / Load More */}
              {hasMore && (
                <div className="mt-20 flex justify-center">
                  <button 
                    onClick={loadMore}
                    className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
                  >
                    थप समाचार लोड गर्नुहोस्
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingActions onOpenTopics={() => setShowTopics(true)} />
      <TopicsIndex articles={articles} isOpen={showTopics} onClose={() => setShowTopics(false)} />
    </div>
  );
}
