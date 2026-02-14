import { useEffect, useState } from "react";
import { getSocket } from "@/components/shared/socket";
import axios from "axios";
import { NOTIFICATION_API_END_POINT } from "@/components/utils/constant";

const useSocket = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${NOTIFICATION_API_END_POINT}/`, { withCredentials: true });
                if (res.data.success) {
                    setNotifications(res.data.notifications || []);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        const socket = getSocket();

        const handleNotification = (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        };

        socket.on("notification", handleNotification);

        return () => {
            socket.off("notification", handleNotification);
        };
    }, []);

    return [notifications, setNotifications, loading, error];
};

export default useSocket;