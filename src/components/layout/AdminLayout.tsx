import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/src/lib/auth";
import { useNavigate } from "react-router-dom";
import { AdminSkeleton } from "@/src/components/ui/PageLoaders";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (authLoading) return <AdminSkeleton />;
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-60">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Main Content */}
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: window.innerWidth < 1024 ? "0px" : (isCollapsed ? "80px" : "280px"),
        }}
        className="grow transition-all duration-300 ease-in-out min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
