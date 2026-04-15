import { useState, useEffect } from "react";
import { ArrowUp, List, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

export default function FloatingActions({ 
  onOpenTopics, 
  categories,
  articles
}: { 
  onOpenTopics?: () => void,
  categories?: { id?: string; name: string; slug: string }[],
  articles?: { id: string; title: string }[]
}) {
  const [show, setShow] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showArticles, setShowArticles] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isLatestPage = location.pathname === "/latest";

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToCategory = (slug: string) => {
    const element = document.getElementById(`category-${slug}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowCategories(false);
    }
  };

  const scrollToArticle = (id: string) => {
    const element = document.getElementById(`article-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setShowArticles(false);
      
      // Add highlight class
      element.classList.add('highlight-target');
      
      // Remove highlight class after animation finishes
      setTimeout(() => {
        element.classList.remove('highlight-target');
      }, 2500);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 md:gap-4 items-end"
        >
          {isHomePage && categories && categories.length > 0 && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCategories(!showCategories)}
                className="p-3.5 md:p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 transition-colors"
              >
                <List size={20} className="md:w-6 md:h-6" />
              </motion.button>
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-[85vw] sm:w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">विधाहरूमा जानुहोस्</h3>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {categories.map((cat, index) => (
                        <button
                          key={cat.id || cat.slug || index}
                          onClick={() => scrollToCategory(cat.slug)}
                          className="w-full text-left px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors border-b border-slate-50 last:border-0"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isLatestPage && articles && articles.length > 0 && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowArticles(!showArticles)}
                className="p-3.5 md:p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 transition-colors"
              >
                <List size={20} className="md:w-6 md:h-6" />
              </motion.button>
              <AnimatePresence>
                {showArticles && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-[85vw] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">समाचारहरूमा जानुहोस्</h3>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => scrollToArticle(article.id)}
                          className="w-full text-left px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors border-b border-slate-50 last:border-0 line-clamp-2 leading-snug"
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!isHomePage && !isLatestPage && onOpenTopics && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenTopics}
              className="p-3.5 md:p-4 bg-primary text-white rounded-full shadow-xl hover:bg-primary/90 transition-colors"
            >
              <List size={20} className="md:w-6 md:h-6" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="p-3.5 md:p-4 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowUp size={20} className="md:w-6 md:h-6" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
