import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/auth";
import { formatDate } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { Notification } from "@/src/types";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("isRead", "==", false),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifs);
    });

    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-primary transition-all"
        aria-label="सूचनाहरू"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xxs font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">सूचनाहरू</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xxs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    सबै पढिएको
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full p-4 text-left border-b border-slate-50 last:border-0 transition-colors ${
                        notification.isRead ? "bg-white" : "bg-blue-50/50"
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900 line-clamp-1">
                          {notification.title}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-2">
                          {notification.message}
                        </span>
                        <span className="text-xxs text-slate-300 font-bold uppercase">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm font-medium">
                    कुनै सूचना छैन
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
