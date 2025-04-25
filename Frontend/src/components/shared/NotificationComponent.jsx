import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { NOTIFICATION_API_END_POINT } from "../utils/constant";
import useSocket from "../Hooks/useSocket";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { motion } from "framer-motion";
import { Bell, CheckCircle, XCircle, Eye, Info } from "lucide-react";

const NotificationComponent = () => {
  const [notifications, setNotifications, loading, error] = useSocket();
  const [isOpen, setIsOpen] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("Notifications state changed:", notifications);
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.patch(`${NOTIFICATION_API_END_POINT}/${id}/read`, {}, { withCredentials: true });
      if (res.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === id ? { ...notification, status: 'read' } : notification
          )
        );
      } else {
        console.error("Error marking as read:", res.data.message);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.delete(`${NOTIFICATION_API_END_POINT}/clear`, { withCredentials: true });
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const renderNotifications = useCallback(() => {
    if (notifications === null) {
      return <p className="text-center text-gray-500 animate-pulse py-4">Loading notifications...</p>;
    }
    if (notifications.length === 0) {
      return <p className="text-center text-gray-500 py-4">No notifications available.</p>;
    }

    return notifications.map(notification => (
      <motion.li
        key={notification._id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start p-3 hover:bg-indigo-50 transition duration-200 rounded-lg"
      >
        <div className="flex-1">
          <p className={`text-sm ${notification.status === 'read' ? "text-gray-600" : "text-indigo-800 font-semibold"}`}>
            {notification.message}
          </p>
          <small className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</small>
        </div>
        <div className="ml-3 flex flex-col items-center space-y-2">
          {notification.status !== 'read' && (
            <Button
              variant="ghost"
              size="xs"
              className="text-indigo-600 hover:bg-indigo-100 rounded-full p-1"
              onClick={() => markAsRead(notification._id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Badge
            variant={notification.status === 'read' ? "gray" : "indigo"}
            size="xs"
            className={`px-2 py-1 rounded-full ${notification.status === 'read' ? "bg-gray-200 text-gray-700" : "bg-indigo-200 text-indigo-800"}`}
          >
            {notification.status === 'read' ? <Eye className="h-3 w-3" /> : <Info className="h-3 w-3" />}
          </Badge>
        </div>
      </motion.li>
    ));
  }, [notifications, markAsRead]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-md mx-auto mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg rounded-lg border border-indigo-100 transition-all duration-300"
    >
      <Card className="rounded-lg overflow-hidden border-none">
        <CardHeader className="flex justify-between items-center p-4 bg-indigo-100 border-b border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-800" /> Notifications
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-indigo-800"
            onClick={clearNotifications}
          >
            Clear All
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <ul className="space-y-2 p-2">
              {renderNotifications()}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationComponent;