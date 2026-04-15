import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, MapPin, Star, ChevronRight, User, Camera, Video, Award } from "lucide-react";
import type { Model, ModelCategory, ModelGender } from "@/src/types";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | "All">("All");
  const [selectedGender, setSelectedGender] = useState<ModelGender | "All">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "models"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const modelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
      setModels(modelsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         model.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || model.category === selectedCategory;
    const matchesGender = selectedGender === "All" || model.gender === selectedGender;
    return matchesSearch && matchesCategory && matchesGender;
  });

  const categories: (ModelCategory | "All")[] = ["All", "Fashion", "Commercial", "Actor", "Influencer"];
  const genders: (ModelGender | "All")[] = ["All", "Male", "Female", "Other"];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070&auto=format&fit=crop" 
            alt="Fashion Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4"
          >
            MODEL DIRECTORY
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 font-medium max-w-2xl mx-auto"
          >
            Discover Nepal's most talented professional models for your next big project.
          </motion.p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search models by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 rounded-full transition-all ${isFilterOpen ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 flex flex-wrap gap-4 border-t border-slate-100 mt-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">Gender</span>
                    <div className="flex gap-2">
                      {genders.map((g) => (
                        <button
                          key={g}
                          onClick={() => setSelectedGender(g)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedGender === g 
                              ? "bg-slate-900 text-white" 
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-12">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-[3/4] bg-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={`/models/${model.id}`}
                    className="group block relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <img 
                      src={model.profileImage} 
                      alt={model.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {model.isVerified && (
                        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                          <Award size={14} className="text-primary" />
                        </div>
                      )}
                      {model.isFeatured && (
                        <div className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex flex-col gap-1">
                        <span className="text-xxs font-black text-white/70 uppercase tracking-[0.2em]">
                          {model.category}
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-tight">
                          {model.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-white/80 text-xs font-bold">
                            <MapPin size={12} /> {model.location}
                          </div>
                          <div className="w-1 h-1 bg-white/30 rounded-full" />
                          <div className="text-white/80 text-xs font-bold">
                            {model.height}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                        View Portfolio <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">No models found</h3>
              <p className="text-slate-500 font-medium mt-2">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedGender("All");
                }}
                className="mt-8 px-8 py-3 bg-primary text-white rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
