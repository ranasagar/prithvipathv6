import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Search, Edit2, Trash2, MoreVertical, 
  Menu as MenuIcon, X, Save, ChevronUp, ChevronDown,
  Globe, MapPin, Tag, Link as LinkIcon
} from "lucide-react";
import type { MenuItem, MenuItemType, Category } from "@/src/types";
import { toast } from "sonner";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { provinces } from "@/src/lib/nepalData";

import AdminLayout from "@/src/components/layout/AdminLayout";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    path: "",
    type: "custom" as MenuItemType,
    order: 0,
    isActive: true,
    parentId: ""
  });

  useEffect(() => {
    const q = query(collection(db, "menuItems"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
      setLoading(false);
    });

    const fetchCategories = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    };

    fetchCategories();
    return () => unsub();
  }, []);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        path: item.path,
        type: item.type,
        order: item.order,
        isActive: item.isActive,
        parentId: item.parentId || ""
      });
    } else {
      setEditingItem(null);
      setFormData({
        label: "",
        path: "",
        type: "custom",
        order: menuItems.length,
        isActive: true,
        parentId: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "menuItems", editingItem.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("मेनु आइटम अपडेट गरियो");
      } else {
        await addDoc(collection(db, "menuItems"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success("नयाँ मेनु आइटम थपियो");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving menu item:", err);
      toast.error("बचत गर्न असफल भयो");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "menuItems", itemToDelete));
      toast.success("मेनु आइटम हटाइयो");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting menu item:", err);
      toast.error("हटाउन असफल भयो");
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const item1 = menuItems[index];
    const item2 = menuItems[newIndex];

    try {
      await updateDoc(doc(db, "menuItems", item1.id), { order: item2.order });
      await updateDoc(doc(db, "menuItems", item2.id), { order: item1.order });
    } catch (err) {
      console.error("Error reordering:", err);
      toast.error("क्रम परिवर्तन गर्न असफल भयो");
    }
  };

  const allDistricts = provinces.flatMap(p => p.districts);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">मेनु व्यवस्थापन</h1>
              <p className="text-slate-500 font-medium">नेभिगेसन मेनुका आइटमहरू व्यवस्थापन गर्नुहोस्</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> नयाँ मेनु थप्नुहोस्
            </button>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">क्रम</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">लेबल</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">प्रकार</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">लिङ्क</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">लोड हुँदैछ...</td>
                    </tr>
                  ) : menuItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">कुनै मेनु आइटम फेला परेन</td>
                    </tr>
                  ) : (
                    menuItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400">{item.order + 1}</span>
                            <div className="flex flex-col">
                              <button 
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="text-slate-300 hover:text-primary disabled:opacity-0"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button 
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === menuItems.length - 1}
                                className="text-slate-300 hover:text-primary disabled:opacity-0"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              {item.type === 'category' ? <Tag size={16} /> : item.type === 'district' ? <MapPin size={16} /> : <Globe size={16} />}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{item.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                            item.type === 'category' ? 'bg-blue-50 text-blue-600' : 
                            item.type === 'district' ? 'bg-orange-50 text-orange-600' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-500 font-mono">{item.path}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(item)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setItemToDelete(item.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingItem ? "मेनु सम्पादन गर्नुहोस्" : "नयाँ मेनु थप्नुहोस्"}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">प्रकार</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => {
                        const type = e.target.value as MenuItemType;
                        setFormData({ ...formData, type });
                      }}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="category">विधा (Category)</option>
                      <option value="district">जिल्ला (District)</option>
                      <option value="city">शहर (City)</option>
                      <option value="custom">कस्टम लिङ्क</option>
                    </select>
                  </div>

                  {formData.type === 'category' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">विधा छान्नुहोस्</label>
                      <select 
                        onChange={(e) => {
                          const cat = categories.find(c => c.id === e.target.value);
                          if (cat) {
                            setFormData({
                              ...formData,
                              label: cat.nameNepali,
                              path: `/category/${cat.slug}`
                            });
                          }
                        }}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">विधा छान्नुहोस्</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nameNepali}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.type === 'district' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">जिल्ला छान्नुहोस्</label>
                      <select 
                        onChange={(e) => {
                          const district = e.target.value;
                          if (district) {
                            setFormData({
                              ...formData,
                              label: district,
                              path: `/district/${encodeURIComponent(district)}`
                            });
                          }
                        }}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">जिल्ला छान्नुहोस्</option>
                        {allDistricts.sort().map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">लेबल</label>
                    <input 
                      required
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="मेनुको नाम"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">लिङ्क (Path)</label>
                    <input 
                      required
                      type="text"
                      value={formData.path}
                      onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="/category/news"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> {editingItem ? "अपडेट गर्नुहोस्" : "बचत गर्नुहोस्"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="मेनु हटाउनुहोस्"
        message="के तपाईं निश्चित हुनुहुन्छ कि तपाईं यो मेनु आइटम हटाउन चाहनुहुन्छ?"
      />
    </AdminLayout>
  );
}
