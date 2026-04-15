import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Eye, TrendingUp, ChevronRight, Play, ChevronLeft } from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import Sidebar from "@/src/components/layout/Sidebar";
import FloatingActions from "@/src/components/layout/FloatingActions";
import MultimediaZone from "@/src/components/news/MultimediaZone";
import LatestPostsBlock from "@/src/components/news/LatestPostsBlock";
import { formatDate } from "@/src/lib/utils";
import CategoryBlock from "@/src/components/news/CategoryBlock";
import AdBanner from "@/src/components/ads/AdBanner";
import type { Article, Category } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";

import { HomeSkeleton } from "@/src/components/ui/PageLoaders";

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [videoNews, setVideoNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [mostReadNews, setMostReadNews] = useState<Article[]>([]);
  const [layout, setLayout] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Layout
    const fetchLayout = async () => {
      const docRef = doc(db, "settings", "homepage_layout");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().sections) {
        setLayout(docSnap.data().sections);
      }
    };
    fetchLayout();

    // Fetch Categories
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const cats = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Category))
        .filter(cat => !cat.isHidden);
      setCategories(cats);

      // Fetch articles for each category
      cats.forEach(cat => {
        const artQ = query(
          collection(db, "articles"),
          where("status", "==", "published"),
          where("categoryId", "==", cat.slug),
          orderBy("createdAt", "desc"),
          limit(cat.postCount || 4)
        );
        onSnapshot(artQ, (snap) => {
          setCategoryArticles(prev => ({
            ...prev,
            [cat.slug]: snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))
          }));
        });
      });
    };

    fetchCategories();

    // Featured Slider
    const featuredQ = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      where("isFeatured", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubFeatured = onSnapshot(featuredQ, (snapshot) => {
      setFeaturedArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    });

    // Latest News
    const latestQ = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubLatest = onSnapshot(latestQ, (snapshot) => {
      setLatestNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      setLoading(false);
    });

    // Video News
    const videoQ = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      where("videoUrl", "!=", ""),
      orderBy("videoUrl"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const unsubVideo = onSnapshot(videoQ, (snapshot) => {
      setVideoNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
    });

    // Most Read Algorithm
    const fetchMostRead = async () => {
      const q = query(
        collection(db, "articles"),
        where("status", "==", "published"),
        orderBy("views", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      
      setMostReadNews(articles);
    };

    fetchMostRead();

    return () => {
      unsubFeatured();
      unsubLatest();
      unsubVideo();
    };
  }, []);

  const [mostReadTab, setMostReadTab] = useState<"day" | "week" | "year">("day");

  const filteredMostRead = () => {
    const now = new Date();
    let startDate = new Date();
    if (mostReadTab === "day") startDate.setHours(now.getHours() - 24);
    else if (mostReadTab === "week") startDate.setDate(now.getDate() - 7);
    else if (mostReadTab === "year") startDate.setFullYear(now.getFullYear() - 1);

    const filtered = mostReadNews.filter(a => {
      const created = a.createdAt?.toDate?.() || new Date(a.createdAt);
      return created >= startDate;
    });

    const scored = filtered.map(article => {
      const created = article.createdAt?.toDate?.()?.getTime() || new Date(article.createdAt).getTime();
      const daysOld = (now.getTime() - created) / (1000 * 60 * 60 * 24);
      const score = article.views / (daysOld + 1);
      return { ...article, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  };

  useEffect(() => {
    if (featuredArticles.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredArticles.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);

  const getRenderableLayout = () => {
    if (!layout) return null;
    
    const manuallyAddedCategoryIds = layout.filter(s => s.type === 'category').map(s => s.categoryId);
    const activeCategories = categories.filter(cat => {
      if (manuallyAddedCategoryIds.includes(cat.slug) || manuallyAddedCategoryIds.includes(cat.id)) return false;
      const articles = categoryArticles[cat.slug] || [];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return articles.some(a => {
        const d = a.createdAt?.toDate?.() || new Date(a.createdAt);
        return d >= oneWeekAgo;
      });
    });

    const autoCategorySections = activeCategories.map(cat => ({
      id: `auto_cat_${cat.id}`,
      type: 'category',
      categoryId: cat.slug,
      isAuto: true
    }));

    const firstCatIndex = layout.findIndex(s => s.type === 'category');
    
    let finalLayout = [...layout];
    if (firstCatIndex !== -1) {
      finalLayout.splice(firstCatIndex, 0, ...autoCategorySections);
    } else {
      finalLayout = [...finalLayout, ...autoCategorySections];
    }
    
    return finalLayout;
  };

  const renderSection = (section: any) => {
    switch (section.type) {
      case 'slider':
        return (
          <div key={section.id} className="relative aspect-video md:aspect-2/1 lg:aspect-2.5/1 overflow-hidden rounded-3xl shadow-2xl bg-slate-900 mb-6">
            <AnimatePresence mode="wait">
              {featuredArticles.length > 0 && (
                <motion.div
                  key={featuredArticles[currentSlide].id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Link to={`/article/${featuredArticles[currentSlide].id}`} className="block w-full h-full">
                    <img 
                      src={featuredArticles[currentSlide].featuredImage} 
                      alt={featuredArticles[currentSlide].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end gap-4">
                      <motion.h2 
                        className="relative z-10 text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors"
                      >
                        {featuredArticles[currentSlide].title}
                      </motion.h2>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-8 right-8 flex gap-2 z-10">
              <button onClick={prevSlide} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-primary transition-all"><ChevronLeft size={20} /></button>
              <button onClick={nextSlide} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-primary transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
        );
      case 'most_read':
        return (
          <div key={section.id} className="flex flex-col gap-6 mb-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 border-l-4 border-accent pl-4 uppercase tracking-tight">धेरै पढिएको</h3>
            <div className="flex flex-col gap-6">
              {filteredMostRead().map((article, index) => (
                <Link key={article.id} to={`/article/${article.id}`} className="group flex items-start gap-4">
                  <div className="text-4xl font-black text-slate-100 group-hover:text-primary/20 transition-colors leading-none pt-1">{index + 1}</div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">{article.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      case 'latest_news':
        return <div key={section.id} className="mb-12"><LatestPostsBlock initialArticles={latestNews} /></div>;
      case 'category':
        const cat = categories.find(c => c.slug === section.categoryId || c.id === section.categoryId);
        if (!cat) return null;
        return (
          <div key={section.id} className="mb-12">
            <CategoryBlock category={cat} articles={categoryArticles[cat.slug] || []} />
          </div>
        );
      case 'multimedia':
        return <div key={section.id} className="mb-12"><MultimediaZone articles={videoNews} /></div>;
      case 'ad_banner':
        return <AdBanner key={section.id} position={section.adPosition || "homepage_mid"} className="mb-12" />;
      default:
        return null;
    }
  };

  if (loading) return <HomeSkeleton />;

  return (
    <>
      <Helmet>
        <title>Prithvi Path Media | सत्य, तथ्य र निष्पक्ष</title>
        <meta name="description" content="नेपालको अग्रणी अनलाइन समाचार पोर्टल - राजनीति, देश, प्रदेश, विश्व, खेलकुद, मनोरञ्जन, अर्थ, प्रविधि र मोडल प्रोफाइल" />
        <meta property="og:title" content="Prithvi Path Media | सत्य, तथ्य र निष्पक्ष" />
        <meta property="og:description" content="नेपालको अग्रणी अनलाइन समाचार पोर्टल" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col"
    >
      <Header />
      
      <main className="grow py-12">
        {layout ? (
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 flex flex-col">
                {getRenderableLayout()?.map(renderSection)}
              </div>
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  <Sidebar />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="container-custom">
              {/* Hero Slider Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Featured Slider (Left) */}
                <div className="lg:col-span-8 relative group">
              <div className="relative aspect-video md:aspect-2/1 lg:aspect-2.5/1 overflow-hidden rounded-3xl shadow-2xl bg-slate-900">
                <AnimatePresence mode="wait">
                  {featuredArticles.length > 0 && (
                    <motion.div
                      key={featuredArticles[currentSlide].id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Link to={`/article/${featuredArticles[currentSlide].id}`} className="block w-full h-full">
                        <img 
                          src={featuredArticles[currentSlide].featuredImage} 
                          alt={featuredArticles[currentSlide].title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end gap-4">
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                          <motion.span 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10 bg-accent text-white text-xxs md:text-xs font-black px-4 py-1.5 rounded-full w-fit uppercase tracking-widest"
                          >
                            विशेष समाचार
                          </motion.span>
                          <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative z-10 text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors"
                          >
                            {featuredArticles[currentSlide].title}
                          </motion.h2>
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative z-10 flex items-center gap-6 text-xxs md:text-xs font-bold text-slate-300 uppercase tracking-widest"
                          >
                            <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {formatDate(featuredArticles[currentSlide].createdAt)}</span>
                            <span className="flex items-center gap-2"><Eye size={16} className="text-primary" /> {featuredArticles[currentSlide].views} पटक हेरिएको</span>
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Slider Controls */}
                <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                  <button onClick={prevSlide} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-primary transition-all">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextSlide} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-primary transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-8 left-8 flex gap-2 z-10">
                  {featuredArticles.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Most Read Algorithm (Right) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900 border-l-4 border-accent pl-4 uppercase tracking-tight">
                  धेरै पढिएको
                </h3>
                <Link to="/trending" className="text-accent hover:text-accent/80 transition-colors">
                  <TrendingUp size={20} />
                </Link>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(["day", "week", "year"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMostReadTab(tab)}
                    className={`flex-1 py-1.5 text-xxs font-black uppercase tracking-widest rounded-lg transition-all ${
                      mostReadTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === "day" ? "आज" : tab === "week" ? "यो हप्ता" : "यो वर्ष"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-6">
                {filteredMostRead().map((article, index) => (
                  <Link key={article.id} to={`/article/${article.id}`} className="group flex items-start gap-4">
                    <div className="text-4xl font-black text-slate-100 group-hover:text-primary/20 transition-colors leading-none pt-1">
                      {index + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">
                          {formatDate(article.createdAt)}
                        </span>
                        <span className="text-xxs font-bold text-primary flex items-center gap-1">
                          <Eye size={10} /> {article.views}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredMostRead().length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm font-medium">
                    कुनै समाचार भेटिएन
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 flex flex-col gap-12">
              <LatestPostsBlock initialArticles={latestNews} />

              {/* Dynamic Categories (First 2) */}
              {categories.slice(0, 2).map((cat) => (
                <div key={cat.id} id={`category-${cat.slug}`}>
                  <CategoryBlock 
                    category={cat} 
                    articles={categoryArticles[cat.slug] || []} 
                  />
                </div>
              ))}
              
              {/* Mid-page Ad Banner */}
              <AdBanner position="homepage_mid" className="my-8" />
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>

        {/* Multimedia Zone */}
        <MultimediaZone articles={videoNews} />

        {/* Remaining Dynamic Categories */}
        <div className="container-custom">
          <div className="flex flex-col gap-12">
            {categories.slice(2).map((cat) => (
              <div key={cat.id} id={`category-${cat.slug}`}>
                <CategoryBlock 
                  category={cat} 
                  articles={categoryArticles[cat.slug] || []} 
                />
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </main>

      <Footer />
      <FloatingActions categories={categories.map(c => ({ id: c.id, name: c.nameNepali, slug: c.slug }))} />
    </motion.div>
    </>
  );
}
