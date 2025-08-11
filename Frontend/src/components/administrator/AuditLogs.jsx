import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useAuditLogs from '../../hooks/useAuditLogs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, Download, Filter, Search, Shield, User, Activity, AlertTriangle } from 'lucide-react';

const AuditLogs = () => {
    const {
        auditLogs,
        loading,
        error,
        pagination,
        fetchAuditLogs,
        fetchAuditStats,
        fetchSuspiciousActivities,
        exportAuditLogs,
        getUserActivitySummary
    } = useAuditLogs();

    const [filters, setFilters] = useState({
        action: '',
        resourceType: '',
        status: '',
        riskLevel: '',
        userId: '',
        startDate: '',
        endDate: ''
    });

    const [stats, setStats] = useState(null);
    const [suspiciousActivities, setSuspiciousActivities] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showSuspicious, setShowSuspicious] = useState(false);

    useEffect(() => {
        fetchAuditLogs();
        loadStats();
        loadSuspiciousActivities();
    }, []);

    const loadStats = async () => {
        const statsData = await fetchAuditStats(30);
        setStats(statsData);
    };

    const loadSuspiciousActivities = async () => {
        const suspiciousData = await fetchSuspiciousActivities(7);
        setSuspiciousActivities(suspiciousData);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchAuditLogs(filters);
    };

    const handleReset = () => {
        setFilters({
            action: '',
            resourceType: '',
            status: '',
            riskLevel: '',
            userId: '',
            startDate: '',
            endDate: ''
        });
        fetchAuditLogs();
    };

    const handleExport = async () => {
        await exportAuditLogs(filters);
    };

    const handlePageChange = (newPage) => {
        fetchAuditLogs({ ...filters, page: newPage });
    };

    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 border-green-200';
        if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (status >= 500) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            <p>Error loading audit logs: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-2">Monitor and track all system activities</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowSuspicious(true)}
                        className="flex items-center gap-2"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Suspicious Activities
                    </Button>
                    <Button
                        onClick={handleExport}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Events</p>
                                    <p className="text-2xl font-bold">{stats.totalEvents || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm text-gray-600">High Risk Events</p>
                                    <p className="text-2xl font-bold">{stats.highRiskEvents || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Failed Actions</p>
                                    <p className="text-2xl font-bold">{stats.failedActions || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <Button
                            variant="ghost"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>
                </CardHeader>
                {showFilters && (
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Action</label>
                                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Actions</SelectItem>
                                        <SelectItem value="CREATE">Create</SelectItem>
                                        <SelectItem value="READ">Read</SelectItem>
                                        <SelectItem value="UPDATE">Update</SelectItem>
                                        <SelectItem value="DELETE">Delete</SelectItem>
                                        <SelectItem value="LOGIN">Login</SelectItem>
                                        <SelectItem value="LOGOUT">Logout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Resource Type</label>
                                <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange('resourceType', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select resource" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Resources</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="project">Project</SelectItem>
                                        <SelectItem value="job">Job</SelectItem>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="workorder">Work Order</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Risk Level</label>
                                <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select risk level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Levels</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">User ID</label>
                                <Input
                                    placeholder="Enter user ID"
                                    value={filters.userId}
                                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">End Date</label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch} className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Audit Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Resource</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Risk Level</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(auditLogs || []).map((log) => (
                                            <TableRow key={log._id} className="hover:bg-gray-50">
                                                <TableCell className="text-sm">
                                                    {formatDate(log.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{log.userEmail}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {log.userId && typeof log.userId === 'object' 
                                                                ? log.userId._id 
                                                                : log.userId || 'Anonymous'
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{log.action}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{log.resourceType}</p>
                                                        {log.resourceId && (
                                                            <p className="text-xs text-gray-500">{log.resourceId}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(log.status)}>
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getRiskLevelColor(log.riskLevel)}>
                                                        {log.riskLevel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-sm text-gray-600">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === 1}
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Timestamp</label>
                                    <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">User</label>
                                    <p className="text-sm">{selectedLog.userEmail}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Action</label>
                                    <p className="text-sm">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Resource Type</label>
                                    <p className="text-sm">{selectedLog.resourceType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Badge className={getStatusColor(selectedLog.status)}>
                                        {selectedLog.status}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Risk Level</label>
                                    <Badge className={getRiskLevelColor(selectedLog.riskLevel)}>
                                        {selectedLog.riskLevel}
                                    </Badge>
                                </div>
                            </div>
                            {selectedLog.details && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Details</label>
                                    <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {selectedLog.ipAddress && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">IP Address</label>
                                    <p className="text-sm">{selectedLog.ipAddress}</p>
                                </div>
                            )}
                            {selectedLog.userAgent && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">User Agent</label>
                                    <p className="text-sm text-gray-600">{truncateText(selectedLog.userAgent, 100)}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Suspicious Activities Dialog */}
            <Dialog open={showSuspicious} onOpenChange={setShowSuspicious}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Suspicious Activities (Last 7 Days)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {suspiciousActivities.length === 0 ? (
                            <p className="text-gray-600 text-center py-4">No suspicious activities detected</p>
                        ) : (
                            <div className="space-y-3">
                                {(suspiciousActivities || []).map((activity, index) => (
                                    <Card key={index} className="border-red-200">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                                            {activity.riskLevel || 'Unknown'}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{activity.action || 'Unknown Action'}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        User: {activity.userEmail || 'Unknown'} | Resource: {activity.resourceType || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {activity.timestamp ? formatDate(activity.timestamp) : 'Unknown time'}
                                                    </p>
                                                </div>
                                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                                    Suspicious
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AuditLogs;

