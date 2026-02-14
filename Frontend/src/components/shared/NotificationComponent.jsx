import React, { useEffect } from "react";
import axios from "axios";
import { NOTIFICATION_API_END_POINT } from "@/components/utils/constant";
import useSocket from "@/components/Hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Bell, Trash2 } from "lucide-react";

const NotificationComponent = () => {
  const [notifications, setNotifications, loading, error] = useSocket();

  useEffect(() => {
    // Optional: log or handle updates
    if (error) {
      console.error("Socket error in NotificationComponent:", error);
    }
  }, [notifications, error]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.patch(`${NOTIFICATION_API_END_POINT}/${id}/read`, {}, { withCredentials: true });
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === id ? { ...notification, status: 'read' } : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      // optimistically update UI
      setNotifications(prev => prev.filter(n => n._id !== id));
      // You would typically call an API endpoint here to delete/dismiss
      // await axios.delete(`${NOTIFICATION_API_END_POINT}/${id}`, ...);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="p-3 rounded-full bg-amber-50 mb-3 text-amber-500">
          <Bell size={24} />
        </div>
        <p className="text-gray-600 font-medium text-sm">No notifications</p>
        <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 p-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.li
            key={notification._id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginLeft: -20 }}
            className={`relative group flex gap-3 p-3 rounded-xl transition-all duration-200 border-b border-gray-100 last:border-0 ${notification.status !== 'read' ? 'bg-blue-50/40 hover:bg-blue-50/80' : 'hover:bg-gray-50'
              }`}
          >
            {/* Icon Indicator */}
            <div className={`mt-0.5 min-w-[32px] h-8 rounded-full flex items-center justify-center shrink-0 ${notification.status !== 'read' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
              <Info size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${notification.status !== 'read' ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                {notification.message}
              </p>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {notification.status !== 'read' && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification._id)}
                className="p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                title="Dismiss"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Unread Dot */}
            {notification.status !== 'read' && (
              <div className="absolute top-4 right-2 w-2 h-2 bg-blue-500 rounded-full group-hover:opacity-0 transition-opacity"></div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};

export default NotificationComponent;