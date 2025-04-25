import { useState, useEffect, useCallback } from 'react';
import socket from '../shared/socket';
import axios from 'axios';
import { NOTIFICATION_API_END_POINT } from '../utils/constant';

const useSocket = () => {
    const [notifications, setNotifications] = useState(null); // Initialize to null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        console.log("fetchNotifications started");

        try {
            const res = await axios.get(NOTIFICATION_API_END_POINT, { withCredentials: true });
            console.log("fetchNotifications successful:", res.data.notifications);

            setNotifications(res.data.notifications || []);
            console.log("Notifications state after fetch:", notifications);

            setError(null);
        } catch (err) {
            console.error("fetchNotifications error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            console.log("fetchNotifications finished. Loading:", loading);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        socket.on('new_notification', (newNotification) => {
            console.log("New notification received:", newNotification);

            setNotifications((prevNotifications) => {
                const updatedNotifications = [...prevNotifications, newNotification];
                console.log("Updated notifications array (socket):", updatedNotifications);
                return updatedNotifications;
            });

            console.log("Notifications state after socket update:", notifications);
        });

        return () => {
            socket.off('new_notification');
        };
    }, [fetchNotifications]);

    return [notifications, setNotifications, loading, error];
};

export default useSocket;