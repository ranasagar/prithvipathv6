import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  MapPin, Award, Star, Filter, X, Upload, 
  Camera, User, Ruler, Weight, Globe, CheckCircle2
} from "lucide-react";
import type { Model, ModelCategory, ModelGender, GalleryImage } from "@/src/types";
import { toast } from "sonner";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import AdminLayout from "@/src/components/layout/AdminLayout";

export default function AdminModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    coverImages: [] as string[],
    category: "Fashion" as ModelCategory,
    gender: "Female" as ModelGender,
    location: "Kathmandu",
    bio: "",
    age: 20,
    height: "5'7\"",
    weight: "55kg",
    experienceYears: 2,
    languages: [] as string[],
    skills: [] as string[],
    isVerified: false,
    isFeatured: false,
    gallery: [] as GalleryImage[]
  });

  useEffect(() => {
    const q = query(collection(db, "models"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const modelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
      setModels(modelsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (model?: Model) => {
    if (model) {
      setEditingModel(model);
      setFormData({
        name: model.name,
        profileImage: model.profileImage,
        coverImages: model.coverImages || [],
        category: model.category,
        gender: model.gender,
        location: model.location,
        bio: model.bio || "",
        age: model.age || 20,
        height: model.height || "5'7\"",
        weight: model.weight || "55kg",
        experienceYears: model.experienceYears || 2,
        languages: model.languages || [],
        skills: model.skills || [],
        isVerified: !!model.isVerified,
        isFeatured: !!model.isFeatured,
        gallery: model.gallery || []
      });
    } else {
      setEditingModel(null);
      setFormData({
        name: "",
        profileImage: "",
        coverImages: [],
        category: "Fashion",
        gender: "Female",
        location: "Kathmandu",
        bio: "",
        age: 20,
        height: "5'7\"",
        weight: "55kg",
        experienceYears: 2,
        languages: ["Nepali", "English"],
        skills: ["Posing", "Acting"],
        isVerified: false,
        isFeatured: false,
        gallery: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await updateDoc(doc(db, "models", editingModel.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Model updated successfully");
      } else {
        await addDoc(collection(db, "models"), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Model added successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving model:", err);
      toast.error("Failed to save model");
    }
  };

  const handleDelete = async () => {
    if (!modelToDelete) return;
    try {
      await deleteDoc(doc(db, "models", modelToDelete));
      toast.success("Model deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting model:", err);
      toast.error("Failed to delete model");
    }
  };

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Model Management</h1>
              <p className="text-slate-500 font-medium">Manage professional model profiles and portfolios.</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Plus size={20} /> Add New Model
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Models Table/Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map((model) => (
                <motion.div 
                  layout
                  key={model.id}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={model.profileImage} 
                      alt={model.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(model)}
                        className="p-2 bg-white/90 backdrop-blur-md text-slate-700 rounded-xl shadow-lg hover:bg-primary hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setModelToDelete(model.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-md text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {model.isVerified && (
                        <div className="bg-primary text-white p-1.5 rounded-full shadow-lg">
                          <Award size={12} />
                        </div>
                      )}
                      {model.isFeatured && (
                        <div className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Featured
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col gap-1 mb-4">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{model.category}</span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{model.name}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                        <MapPin size={12} /> {model.location}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 mb-4">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height</p>
                        <p className="text-xs font-bold text-slate-900">{model.height}</p>
                      </div>
                      <div className="text-center border-x border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</p>
                        <p className="text-xs font-bold text-slate-900">{model.age}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exp</p>
                        <p className="text-xs font-bold text-slate-900">{model.experienceYears}y</p>
                      </div>
                    </div>

                    <Link 
                      to={`/models/${model.id}`}
                      target="_blank"
                      className="w-full py-3 bg-slate-50 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors block text-center"
                    >
                      View Public Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingModel ? "Edit Model Profile" : "Add New Model"}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Fill in the professional details for the model.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grow overflow-y-auto p-8">
                <form id="model-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Basic Information</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="flex-grow px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Model Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value as ModelCategory})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="Fashion">Fashion</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Actor">Actor</option>
                          <option value="Influencer">Influencer</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value as ModelGender})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                      <input 
                        required
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. Kathmandu, Nepal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</label>
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all min-h-30"
                        placeholder="Professional bio..."
                      />
                    </div>
                  </div>

                  {/* Physical Stats & Media */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Physical Stats & Media</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height</label>
                        <input 
                          type="text"
                          value={formData.height}
                          onChange={(e) => setFormData({...formData, height: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder={`e.g. 5'7"`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</label>
                        <input 
                          type="text"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="e.g. 55kg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
                        <input 
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience (Years)</label>
                        <input 
                          type="number"
                          value={formData.experienceYears}
                          onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Image URL</label>
                      <input 
                        required
                        type="url"
                        value={formData.profileImage}
                        onChange={(e) => setFormData({...formData, profileImage: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isVerified ? "bg-primary border-primary" : "border-slate-200 group-hover:border-primary"}`}>
                          {formData.isVerified && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={formData.isVerified}
                          onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                        />
                        <span className="text-xs font-bold text-slate-700">Verified Professional</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.isFeatured ? "bg-accent border-accent" : "border-slate-200 group-hover:border-accent"}`}>
                          {formData.isFeatured && <Star size={14} className="text-white" />}
                        </div>
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        />
                        <span className="text-xs font-bold text-slate-700">Featured Model</span>
                      </label>
                    </div>

                    {/* Gallery Management */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Portfolio Gallery</h3>
                      <div className="flex gap-2">
                        <input 
                          type="url"
                          id="new-gallery-image"
                          className="flex-grow px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Image URL..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              const url = input.value.trim();
                              if (url) {
                                setFormData({
                                  ...formData,
                                  gallery: [...formData.gallery, { id: crypto.randomUUID(), url, createdAt: new Date() }]
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-gallery-image') as HTMLInputElement;
                            const url = input.value.trim();
                            if (url) {
                              setFormData({
                                ...formData,
                                gallery: [...formData.gallery, { id: crypto.randomUUID(), url, createdAt: new Date() }]
                              });
                              input.value = '';
                            }
                          }}
                          className="p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {formData.gallery.map((img, idx) => (
                          <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100">
                            <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => {
                                const newGallery = [...formData.gallery];
                                newGallery.splice(idx, 1);
                                setFormData({...formData, gallery: newGallery});
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-slate-500 font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="model-form"
                  type="submit"
                  className="px-10 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  {editingModel ? "Save Changes" : "Add Model"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Model"
        message="Are you sure you want to delete this model profile? This action cannot be undone."
        confirmText="Delete"
      />
      </div>
    </AdminLayout>
  );
}
