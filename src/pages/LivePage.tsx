import { useState, useEffect, useRef } from "react";
import { Play, MessageSquare, Users, Share2, Heart, Send, Trash2, ExternalLink, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { doc, onSnapshot, collection, query, orderBy, limit, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { motion, AnimatePresence } from "motion/react";

export default function LivePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [liveSettings, setLiveSettings] = useState({
    url: "",
    type: "youtube" as "youtube" | "facebook",
    title: "विशेष समाचार बुलेटिन",
    description: "पृथ्वी पथ मिडियाको विशेष प्रत्यक्ष प्रसारणमा तपाईंलाई स्वागत छ।",
    sponsoredAds: [] as string[]
  });

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isPopout, setIsPopout] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveSettings(prev => ({
          ...prev,
          url: data.liveVideoUrl || "",
          type: data.liveVideoType || "youtube",
          title: data.siteName + " - प्रत्यक्ष प्रसारण",
          description: data.siteDescription || prev.description,
          sponsoredAds: data.sponsoredAds || []
        }));
      }
    }, (error) => {
      console.error("Error in live settings snapshot:", error);
    });

    // Real-time Chat
    const chatQ = query(
      collection(db, "liveChat"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubChat = onSnapshot(chatQ, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs.reverse());
    }, (error) => {
      console.error("Error in live chat snapshot:", error);
    });

    return () => {
      unsub();
      unsubChat();
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    try {
      await addDoc(collection(db, "liveChat"), {
        uid: user.uid,
        user: user.displayName || "Anonymous",
        text: message,
        createdAt: serverTimestamp(),
        isSponsored: false
      });
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) return;
    try {
      await deleteDoc(doc(db, "liveChat", id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const getEmbedUrl = () => {
    if (!liveSettings.url) return null;

    if (liveSettings.type === "youtube") {
      let videoId = liveSettings.url;
      if (liveSettings.url.includes("v=")) {
        videoId = liveSettings.url.split("v=")[1].split("&")[0];
      } else if (liveSettings.url.includes("youtu.be/")) {
        videoId = liveSettings.url.split("youtu.be/")[1].split("?")[0];
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else {
      // Facebook embed
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveSettings.url)}&show_text=0&t=0`;
    }
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className={`py-8 md:py-12 transition-all duration-500 ${isPopout ? "fixed inset-0 z-[100] bg-black p-0 md:p-0" : "container-custom"}`}>
        {isPopout && (
          <button 
            onClick={() => setIsPopout(false)}
            className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all"
          >
            <Users size={24} />
          </button>
        )}

        <div className={`flex flex-col gap-8 ${isPopout ? "h-screen" : ""}`}>
          
          {/* Video Player Section with Overlay Chat */}
          <div className={`relative flex flex-col gap-6 ${isPopout ? "h-full" : ""}`}>
            <div className={`relative bg-black overflow-hidden shadow-2xl group transition-all duration-500 ${isPopout ? "h-full rounded-0" : "aspect-video rounded-[2rem]"}`}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                  <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    <Play size={40} />
                  </div>
                  <p className="font-bold text-slate-400">अहिले कुनै प्रत्यक्ष प्रसारण छैन।</p>
                </div>
              )}
              
              {/* Sponsored Ads Marquee */}
              {liveSettings.sponsoredAds.length > 0 && (
                <div className="absolute top-20 left-0 right-0 z-40 bg-primary/80 backdrop-blur-md py-1.5 overflow-hidden">
                  <div className="flex whitespace-nowrap animate-marquee">
                    {[...liveSettings.sponsoredAds, ...liveSettings.sponsoredAds].map((ad, i) => (
                      <span key={i} className="text-xxs font-black text-white uppercase tracking-widest px-8 flex items-center gap-2">
                        <Shield size={10} /> {ad}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overlay Chat - Facebook Style */}
              <AnimatePresence>
                {showChat && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute bottom-10 left-6 z-20 w-80 max-h-[60%] flex flex-col gap-2 pointer-events-none"
                  >
                    <div className="flex flex-col gap-2 overflow-y-auto pr-4 scrollbar-hide pointer-events-auto">
                      {chatMessages.map((msg) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col gap-0.5 relative group/msg ${msg.isSponsored ? "border-primary/50 bg-primary/10" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <Link 
                              to={`/profile/${msg.uid}`}
                              className="text-xxs font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                              {msg.user} {msg.isSponsored && <Shield size={8} className="fill-primary" />}
                            </Link>
                            {(user?.role === 'admin' || user?.role === 'editor') && (
                              <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover/msg:opacity-100 p-1 text-white/40 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-medium text-white leading-tight">{msg.text}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Overlay Input */}
                    {user ? (
                      <form onSubmit={handleSendMessage} className="mt-2 pointer-events-auto">
                        <div className="relative">
                          <input 
                            type="text" 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="प्रत्यक्ष कुराकानी..." 
                            className="w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-full py-3 px-5 pr-12 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/40"
                          />
                          <button 
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:scale-110 transition-transform"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <Link to="/login" className="mt-2 pointer-events-auto block w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-full py-3 px-5 text-center text-xxs font-black text-white uppercase tracking-widest hover:bg-black/80 transition-all">
                        कुराकानी गर्न लगइन गर्नुहोस्
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Overlay */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-xxs font-black uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> प्रत्यक्ष प्रसारण
                  </div>
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xxs font-bold">
                    <Users size={12} /> १.५ हजार
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${showChat ? "bg-primary text-white" : "bg-black/50 text-white hover:bg-black/70"}`}
                    title="Chat Toggle"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={() => setIsPopout(!isPopout)}
                    className="p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 transition-all"
                    title="Popout Mode"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Bottom Gradient for Chat Visibility */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
            </div>

            {!isPopout && (
              <div className="flex flex-col gap-4">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {liveSettings.title}
                </h1>
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">P</div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900">पृथ्वी पथ मिडिया</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">२.५ लाख सब्सक्राइबर्स</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-full font-bold transition-all">
                      <Heart size={18} /> मन पराउनुहोस्
                    </button>
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-full font-bold transition-all">
                      <Share2 size={18} /> सेयर गर्नुहोस्
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {liveSettings.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
