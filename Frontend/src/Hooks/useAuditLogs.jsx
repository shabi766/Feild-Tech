import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AUDIT_API_END_POINT } from '../components/utils/constant';

export const useAuditLogs = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
    });

    const fetchAuditLogs = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${AUDIT_API_END_POINT}/logs?${queryParams}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAuditLogs(data.data.logs || []);
                setPagination({
                    total: data.data.total || 0,
                    page: data.data.page || 1,
                    limit: data.data.limit || 50,
                    totalPages: data.data.totalPages || 0
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Audit logs API error:', response.status, errorData);
                throw new Error(`Failed to fetch audit logs: ${response.status}`);
            }
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAuditStats = useCallback(async (days = 30) => {
        try {
            const response = await fetch(`${AUDIT_API_END_POINT}/stats?days=${days}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Audit stats API error:', response.status, errorData);
                throw new Error(`Failed to fetch audit statistics: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching audit stats:', err);
            return null;
        }
    }, []);

    const fetchSuspiciousActivities = useCallback(async (days = 7) => {
        try {
            const response = await fetch(`${AUDIT_API_END_POINT}/suspicious?days=${days}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Suspicious activities API error:', response.status, errorData);
                throw new Error(`Failed to fetch suspicious activities: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching suspicious activities:', err);
            return [];
        }
    }, []);

    const exportAuditLogs = useCallback(async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && key !== 'page' && key !== 'limit') queryParams.append(key, value);
            });

            const response = await fetch(`${AUDIT_API_END_POINT}/export?${queryParams}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Audit logs exported successfully');
                return true;
            } else {
                throw new Error('Failed to export audit logs');
            }
        } catch (err) {
            toast.error('Failed to export audit logs');
            return null;
        }
    }, []);

    const getUserActivitySummary = useCallback(async (userId, days = 30) => {
        try {
            const response = await fetch(`${AUDIT_API_END_POINT}/user/${userId}/summary?days=${days}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                throw new Error('Failed to fetch user activity summary');
            }
        } catch (err) {
            console.error('Error fetching user activity summary:', err);
            return [];
        }
    }, []);

    return {
        auditLogs,
        loading,
        error,
        pagination,
        fetchAuditLogs,
        fetchAuditStats,
        fetchSuspiciousActivities,
        exportAuditLogs,
        getUserActivitySummary
    };
};

export default useAuditLogs;
