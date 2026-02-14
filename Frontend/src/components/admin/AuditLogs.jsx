import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import { Loader2, Search, Filter, Download, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import { toast } from 'sonner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    // Filters
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        userId: '',
        startDate: '',
        endDate: ''
    });

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams({
                page: page,
                limit: pagination.limit,
                ...filters
            });

            // Remove empty filters
            for (const [key, value] of Object.entries(filters)) {
                if (!value) queryParams.delete(key);
            }

            const response = await api.get(`/admin/audit/logs?${queryParams}`);

            if (response.data.success) {
                setLogs(response.data.logs);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        fetchLogs(1);
    };

    const resetFilters = () => {
        setFilters({
            action: '',
            entityType: '',
            userId: '',
            startDate: '',
            endDate: ''
        });
        // Need to trigger fetch after state update, handled by button click logic or useEffect dependency if changed
        setTimeout(() => fetchLogs(1), 0);
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-800 border-green-200';
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800 border-red-200';
        if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>;
            case 'high':
                return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
            case 'medium':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
            default:
                return <Badge variant="secondary">Low</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and monitor all system activities, security events, and data changes.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => fetchLogs(pagination.page)}>
                        <RotateCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Refine your search by action type, entity, or date range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action</label>
                            <Select
                                value={filters.action}
                                onValueChange={(val) => handleFilterChange('action', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Actions</SelectItem>
                                    <SelectItem value="USER_LOGIN">Login</SelectItem>
                                    <SelectItem value="USER_LOGOUT">Logout</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entity Type</label>
                            <Select
                                value={filters.entityType}
                                onValueChange={(val) => handleFilterChange('entityType', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Entities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Entities</SelectItem>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Job">Job</SelectItem>
                                    <SelectItem value="Company">Company</SelectItem>
                                    <SelectItem value="Application">Application</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700">
                                <Search className="mr-2 h-4 w-4" /> Search
                            </Button>
                            <Button onClick={resetFilters} variant="secondary" className="flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[150px]">Actor</TableHead>
                                <TableHead className="w-[180px]">Action</TableHead>
                                <TableHead className="w-[150px]">Entity</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="w-[100px]">Severity</TableHead>
                                <TableHead className="w-[120px]">IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                            Loading logs...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No audit logs found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log._id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {log.actor?.name || 'System'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {log.actor?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {log.entity?.type || 'N/A'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono truncate max-w-[80px]" title={log.entity?.id}>
                                                    {log.entity?.id ? `#${log.entity.id.slice(-6)}` : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] truncate text-sm" title={JSON.stringify(log.metadata || log.details, null, 2)}>
                                                {log.details || JSON.stringify(log.metadata)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getSeverityBadge(log.severity)}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {log.ipAddress || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchLogs(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                // Logic to show simplified pagination if many pages
                                let p = i + 1;
                                if (pagination.page > 3 && pagination.pages > 5) {
                                    p = pagination.page - 2 + i;
                                }
                                if (p > pagination.pages) return null;

                                return (
                                    <Button
                                        key={p}
                                        variant={pagination.page === p ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => fetchLogs(p)}
                                    >
                                        {p}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchLogs(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogs;
