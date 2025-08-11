import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemMonitoring = () => {
    const [systemStats, setSystemStats] = useState({
        cpu: 45,
        memory: 72,
        disk: 38,
        network: 85,
        activeUsers: 127,
        uptime: '15 days, 8 hours',
        lastBackup: '2 hours ago',
        systemStatus: 'healthy'
    });

    const [alerts, setAlerts] = useState([
        {
            id: 1,
            type: 'warning',
            message: 'Memory usage is above 70%',
            timestamp: '5 minutes ago',
            severity: 'medium'
        },
        {
            id: 2,
            type: 'info',
            message: 'Scheduled backup completed successfully',
            timestamp: '2 hours ago',
            severity: 'low'
        }
    ]);

    const [performanceMetrics, setPerformanceMetrics] = useState([
        { name: 'Response Time', value: '45ms', trend: 'down', change: '-12%' },
        { name: 'Throughput', value: '1.2k req/s', trend: 'up', change: '+8%' },
        { name: 'Error Rate', value: '0.02%', trend: 'down', change: '-5%' },
        { name: 'Active Sessions', value: '89', trend: 'up', change: '+15%' }
    ]);

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setSystemStats(prev => ({
                ...prev,
                cpu: Math.floor(Math.random() * 30) + 30,
                memory: Math.floor(Math.random() * 20) + 60,
                activeUsers: Math.floor(Math.random() * 50) + 100
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'critical': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'critical': return <AlertTriangle className="w-5 h-5" />;
            default: return <Activity className="w-5 h-5" />;
        }
    };

    const getTrendIcon = (trend) => {
        return trend === 'up' ? 
            <TrendingUp className="w-4 h-4 text-green-600" /> : 
            <TrendingDown className="w-4 h-4 text-red-600" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
                    <p className="text-gray-600 mt-2">Real-time system health and performance metrics</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(systemStats.systemStatus)}`}>
                    {getStatusIcon(systemStats.systemStatus)}
                    <span className="font-medium capitalize">{systemStats.systemStatus}</span>
                </div>
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.cpu}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${systemStats.cpu}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.memory}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    systemStats.memory > 70 ? 'bg-yellow-500' : 'bg-green-600'
                                }`}
                                style={{ width: `${systemStats.memory}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently online</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemStats.uptime}</div>
                        <p className="text-xs text-muted-foreground mt-1">Last restart</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Performance Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {performanceMetrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(metric.trend)}
                                    <span className={`text-sm font-medium ${
                                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {metric.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        System Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                    alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                                    alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                    'border-blue-200 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        alert.severity === 'high' ? 'bg-red-500' :
                                        alert.severity === 'medium' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{alert.message}</p>
                                        <p className="text-sm text-gray-600">{alert.timestamp}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <Database className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Backup Database</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <Server className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Restart Services</span>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                            <Activity className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Generate Report</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemMonitoring;
