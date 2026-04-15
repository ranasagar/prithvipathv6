import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, Clock, TrendingUp, Bell, CheckCircle, AlertCircle, Info, MessageSquare, LogOut, LayoutDashboard, FileText, ChevronDown } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, where } from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { toSafeDate } from "@/src/lib/utils";
import { provinces } from "@/src/lib/nepalData";
import type { Notification, Article, Category, MenuItem } from "@/src/types";
import { Toaster, toast } from "sonner";
import { signOut } from "firebase/auth";

import NepaliInput from "@/src/components/ui/NepaliInput";
import AdBanner from "@/src/components/ads/AdBanner";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastNotificationId = useRef<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [districtsWithNewNews, setDistrictsWithNewNews] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch menu items
    const menuQ = query(collection(db, "menuItems"), orderBy("order", "asc"));
    const unsubMenu = onSnapshot(menuQ, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    });

    // Fetch categories
    const catQ = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsubCat = onSnapshot(catQ, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    // Fetch recent articles to identify "new" districts/cities
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentQ = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      where("createdAt", ">=", oneWeekAgo)
    );

    const unsubRecent = onSnapshot(recentQ, (snapshot) => {
      const districts = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Article;
        if (data.districts) {
          data.districts.forEach(d => districts.add(d));
        }
      });
      setDistrictsWithNewNews(districts);
    });

    return () => {
      unsubMenu();
      unsubCat();
      unsubRecent();
    };
  }, []);

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    const aHasNew = districtsWithNewNews.has(a.label);
    const bHasNew = districtsWithNewNews.has(b.label);
    
    if (aHasNew && !bHasNew) return -1;
    if (!aHasNew && bHasNew) return 1;
    return a.order - b.order;
  });

  useEffect(() => {
    // Real-time notifications listener
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(newNotifications);

      // Trigger toast for new notifications
      const latest = newNotifications[0];
      if (latest && latest.id !== lastNotificationId.current) {
        if (lastNotificationId.current !== null) {
          toast(latest.title, {
            description: latest.message,
            icon: latest.type === 'success' ? '✅' : latest.type === 'error' ? '❌' : 'ℹ️',
          });
        }
        lastNotificationId.current = latest.id;
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsProfileOpen(false);
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unread = notifications.filter(n => !n.isRead);
      unread.forEach(n => {
        batch.update(doc(db, "notifications", n.id), { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [siteName, setSiteName] = useState("Prithvi Path");
  const [siteTagline, setSiteTagline] = useState("Media & News Portal");

  useEffect(() => {
    // Listen for global site settings (logo, corner radius, site name, tagline)
    const unsub = onSnapshot(doc(db, "settings", "site"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteTagline) setSiteTagline(data.siteTagline);
        
        // Apply dynamic corner radius
        const radius = data.cornerRadius ?? 24;
        document.documentElement.style.setProperty('--app-radius', `${radius}px`);
        
        const catRadius = data.categoryHeroRadius ?? 40;
        document.documentElement.style.setProperty('--app-category-hero-radius', `${catRadius}px`);
      }
    }, (error) => {
      console.error("Error in header settings snapshot:", error);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const engDate = now.toLocaleDateString('en-US', options);
      const nepDate = now.toLocaleDateString('ne-NP', options);
      setCurrentDate(`${nepDate} | ${engDate}`);
    };
    updateDate();

    // Fetch trending news for ticker (based on algorithm)
    const q = query(
      collection(db, "articles"),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      if (articles.length === 0) {
        // Fallback to featured if no breaking news
        const featuredQ = query(
          collection(db, "articles"),
          where("status", "==", "published"),
          where("isFeatured", "==", true),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        onSnapshot(featuredQ, (featuredSnapshot) => {
          setTrendingArticles(featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
        }, (error) => {
          console.error("Error in featured articles snapshot:", error);
        });
      } else {
        // Algorithm: Score = views / (days_old + 1)^1.5
        const now = new Date().getTime();
        const scored = articles.map(article => {
          const created = article.createdAt?.toDate?.()?.getTime() || new Date(article.createdAt).getTime();
          const daysOld = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
          const score = (article.views || 0) / Math.pow(daysOld + 1, 1.5);
          return { ...article, score };
        });
        
        scored.sort((a, b) => b.score - a.score);
        setTrendingArticles(scored.slice(0, 10));
      }
    }, (error) => {
      console.error("Error in breaking news snapshot:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect shadow-sm">
      <Toaster position="top-right" />
      {/* Top Bar: Date & Social */}
      <div className="bg-slate-900/5 border-b border-slate-100 py-2 hidden md:block">
        <div className="container-custom flex justify-between items-center text-xxs font-black text-slate-500 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-primary" />
            {currentDate}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-primary">हाम्रो बारेमा</Link>
            <Link to="/contact" className="hover:text-primary">सम्पर्क</Link>
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80"
                >
                  <User size={14} /> {user.displayName || 'प्रोफाइल'}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-100">
                    <Link to={user.role === 'admin' ? "/admin" : "/editor"} className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                      <LayoutDashboard size={16} /> ड्यासबोर्ड
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 hover:bg-red-50 rounded-xl text-sm font-bold text-red-600">
                      <LogOut size={16} /> लगआउट
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-primary">लगइन</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header: Logo Left, Nav Center, Actions Right */}
      <div className="container-custom py-4 flex flex-col gap-4">
        {/* Header Ad Space */}
        <div className="w-full hidden md:block">
          <AdBanner position="header" className="h-24" />
        </div>

        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 md:w-14 md:h-14 shrink-0">
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-3xl font-black text-primary tracking-tighter uppercase leading-none">
                  {siteName}
                </span>
                <span className="text-xxs md:text-xxs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {siteTagline}
                </span>
              </div>
            </Link>

            {/* Combined Navigation Menu (Desktop) */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link to="/" className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase">गृहपृष्ठ</Link>
                </li>
                
                {/* Dynamic Menu Items */}
                {sortedMenuItems.map((item) => {
                  const hasNew = districtsWithNewNews.has(item.label);
                  return (
                    <li key={item.id}>
                      <Link 
                        to={item.path} 
                        className={`text-xs font-black hover:text-primary transition-colors uppercase flex items-center gap-1 ${hasNew ? 'text-primary' : 'text-slate-900'}`}
                      >
                        {item.label}
                        {hasNew && (
                          <span className="bg-primary text-white text-[8px] px-1 rounded-sm animate-pulse">NEW</span>
                        )}
                      </Link>
                    </li>
                  );
                })}

                {/* Categories Dropdown */}
                <li className="relative group">
                  <button className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase flex items-center gap-1 py-2">
                    विधाहरू <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    {categories.map((cat) => (
                      <Link 
                        key={cat.id}
                        to={`/category/${cat.slug}`} 
                        className="block px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors border-b border-slate-50 last:border-0"
                      >
                        {cat.nameNepali}
                      </Link>
                    ))}
                  </div>
                </li>

                {/* Districts Dropdown */}
                <li className="relative group">
                  <button className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase flex items-center gap-1 py-2">
                    जिल्लाहरू <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-full left-0 mt-0 w-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6 grid grid-cols-3 gap-6">
                    {provinces.map((province) => (
                      <div key={province.id} className="flex flex-col gap-2">
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">{province.name}</h4>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {province.districts.map((district) => {
                            const hasNew = districtsWithNewNews.has(district);
                            return (
                              <Link 
                                key={district}
                                to={`/search?q=${encodeURIComponent(district)}`} 
                                className={`text-xs font-bold hover:text-primary transition-colors py-1 flex items-center justify-between ${hasNew ? 'text-primary' : 'text-slate-600'}`}
                              >
                                {district}
                                {hasNew && <span className="text-[8px] bg-primary text-white px-1 rounded-sm">NEW</span>}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </li>

                <li>
                  <Link to="/community" className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase flex items-center gap-1">
                    <MessageSquare size={14} className="text-primary" /> चौतारी
                  </Link>
                </li>
              <li>
                <Link to="/trending" className="text-xs font-black text-accent hover:text-accent/80 transition-colors uppercase flex items-center gap-1">
                  <TrendingUp size={14} /> ट्रेन्डिङ
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase">घटनाहरू</Link>
              </li>
              <li>
                <Link to="/models" className="text-xs font-black text-slate-900 hover:text-primary transition-colors uppercase flex items-center gap-1">
                  <User size={14} className="text-primary" /> मोडेलहरू
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-600 hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
            
            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-600 hover:text-primary transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-xxs font-black flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <Link to="/live" className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span> प्रत्यक्ष प्रसारण
            </Link>
          </div>

          {/* Shared Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="fixed md:absolute top-[72px] md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 md:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-100">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">सूचनाहरू</h4>
                <button onClick={markAllAsRead} className="text-xxs font-black text-primary uppercase hover:underline">सबै पढिएको मार्क गर्नुहोस्</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => {
                    const handleNotificationClick = async () => {
                      if (!n.isRead) {
                        try {
                          await updateDoc(doc(db, "notifications", n.id), { isRead: true });
                        } catch (err) {
                          console.error("Error marking notification as read:", err);
                        }
                      }
                      setIsNotificationsOpen(false);
                    };

                    const NotificationContent = (
                      <div className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                        <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          n.type === 'success' ? 'bg-green-100 text-green-600' : 
                          n.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                          n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type === 'success' ? <CheckCircle size={14} /> : 
                           n.type === 'error' ? <AlertCircle size={14} /> : <Info size={14} />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-black text-slate-900">{n.title}</p>
                          <p className="text-xxs font-medium text-slate-600 leading-tight">{n.message}</p>
                          <span className="text-xxs font-bold text-slate-400 uppercase mt-1">
                            {toSafeDate(n.createdAt).toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );

                    return n.articleId ? (
                      <Link 
                        key={n.id} 
                        to={`/article/${n.articleId}`} 
                        onClick={handleNotificationClick}
                      >
                        {NotificationContent}
                      </Link>
                    ) : (
                      <div key={n.id} onClick={handleNotificationClick} className="cursor-pointer">{NotificationContent}</div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">कुनै सूचना छैन</div>
                )}
              </div>
              <Link to="/admin" className="block p-4 text-center text-xxs font-black text-slate-500 uppercase hover:text-primary transition-colors bg-slate-50/50 border-t border-slate-100">सबै हेर्नुहोस्</Link>
            </div>
          )}

          <div className="flex md:hidden items-center gap-2">
            {/* Notification Bell for Mobile */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-600 hover:text-primary transition-colors relative"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-xxs font-black flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button 
              className="p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-600"
            >
              <Search size={24} />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Navigation Bar (Secondary for smaller desktops) - REMOVED AS PER REQUEST */}

      {/* Trending Ticker */}
      <div className="bg-slate-900 py-2 overflow-hidden">
        <div className="container-custom flex items-center gap-4">
          <Link to="/latest" className="flex items-center gap-2 text-white text-xxs font-black uppercase tracking-widest whitespace-nowrap bg-accent px-3 py-1 rounded-sm hover:bg-accent/80 transition-colors">
            <TrendingUp size={12} /> ताजा अपडेट
          </Link>
          <div 
            className="grow overflow-hidden relative h-5"
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
          >
            <div className={`absolute whitespace-nowrap flex gap-12 ${isMarqueePaused ? '' : 'animate-marquee'}`}>
              {trendingArticles.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/article/${article.id}`}
                  className="text-white text-xs font-medium hover:text-primary cursor-pointer transition-colors"
                >
                  {article.title}
                </Link>
              ))}
              {/* Duplicate for seamless loop if enough articles */}
              {trendingArticles.length > 0 && trendingArticles.map((article) => (
                <Link 
                  key={`dup-${article.id}`} 
                  to={`/article/${article.id}`}
                  className="text-white text-xs font-medium hover:text-primary cursor-pointer transition-colors"
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">मेनु</h3>
            <div className="flex flex-col">
              {sortedMenuItems.map((item) => {
                const hasNew = districtsWithNewNews.has(item.label);
                return (
                  <Link 
                    key={item.id} 
                    to={item.path}
                    className={`text-lg font-bold py-2 border-b border-slate-50 flex items-center justify-between ${hasNew ? 'text-primary' : 'text-slate-900'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {hasNew && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">विधाहरू</h3>
            <div className="flex flex-col">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.slug}`}
                  className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.nameNepali}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">जिल्लाहरू</h3>
            <div className="flex flex-col gap-4">
              {provinces.map((province) => (
                <div key={province.id} className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-primary">{province.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {province.districts.map((district) => {
                      const hasNew = districtsWithNewNews.has(district);
                      return (
                        <Link 
                          key={district}
                          to={`/search?q=${encodeURIComponent(district)}`} 
                          className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 ${hasNew ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {district}
                          {hasNew && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">अन्य</h3>
            <Link 
              to="/trending"
              className="text-lg font-bold text-accent py-2 border-b border-slate-50 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <TrendingUp size={20} /> ट्रेन्डिङ
            </Link>
            <Link 
              to="/community"
              className="text-lg font-bold text-primary py-2 border-b border-slate-50 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare size={20} /> चौतारी (Community)
            </Link>
            <Link 
              to="/events"
              className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText size={20} /> घटनाहरू
            </Link>
            <Link 
              to="/models"
              className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={20} /> मोडेलहरू
            </Link>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? "/admin" : "/editor"} className="text-center py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={20} /> ड्यासबोर्ड
                </Link>
                <button onClick={handleLogout} className="text-center py-3 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2">
                  <LogOut size={20} /> लगआउट
                </button>
              </>
            ) : (
              <Link to="/login" className="text-center py-3 rounded-xl bg-slate-100 font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>लगइन</Link>
            )}
            <Link to="/live" className="text-center py-3 rounded-xl bg-slate-900 text-white font-bold" onClick={() => setIsMenuOpen(false)}>प्रत्यक्ष प्रसारण</Link>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-8 animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="container-custom max-w-3xl">
            <form onSubmit={handleSearch} className="relative">
              <NepaliInput 
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                placeholder="समाचार खोज्नुहोस्..." 
                className="w-full text-2xl font-bold border-b-4 border-slate-100 focus:border-primary outline-none py-4 pr-12 transition-all"
              />
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary"
              >
                <X size={32} />
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </header>
  );
}
