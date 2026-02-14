import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadCount } from '@/redux/chatSlice';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

const NotificationBadge = ({
    userId,
    className,
    showZero = false,
    size = "md"
}) => {
    const dispatch = useDispatch();
    const { unreadCount, loading } = useSelector((state) => state.chat);

    // Poll for unread messages every 30 seconds
    useEffect(() => {
        if (userId) {
            dispatch(fetchUnreadCount(userId));

            const intervalId = setInterval(() => {
                dispatch(fetchUnreadCount(userId));
            }, 30000);

            return () => clearInterval(intervalId);
        }
    }, [dispatch, userId]);

    if (!showZero && unreadCount === 0) return null;

    const sizeClasses = {
        sm: "h-4 min-w-[1rem] text-[10px]",
        md: "h-5 min-w-[1.25rem] text-xs",
        lg: "h-6 min-w-[1.5rem] text-sm"
    };

    return (
        <div className={cn("relative inline-flex", className)}>
            <div className={cn(
                "flex items-center justify-center rounded-full bg-destructive text-destructive-foreground font-medium px-1",
                sizeClasses[size],
                "animate-in zoom-in duration-300"
            )}>
                {unreadCount > 99 ? '99+' : unreadCount}
            </div>
        </div>
    );
};

export const ChatIconWithBadge = ({ userId, className }) => {
    return (
        <div className={cn("relative", className)}>
            <MessageSquare className="h-6 w-6" />
            <div className="absolute -top-2 -right-2">
                <NotificationBadge userId={userId} size="sm" />
            </div>
        </div>
    );
};

export default NotificationBadge;
