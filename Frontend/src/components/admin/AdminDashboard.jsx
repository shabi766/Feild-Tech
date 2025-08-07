import React, { useEffect, useState } from "react";
import axios from "axios";
import { DASHBOARD_API_END_POINT } from "../utils/constant";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckCircle, 
  Activity,
  Calendar,
  DollarSign,
  Target
} from "lucide-react";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        completedJobs: 0,
        ongoingProjects: 0,
        totalProjects: 0,
        projectCompletionRate: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${DASHBOARD_API_END_POINT}/stats`, { withCredentials: true });

                // Calculate project completion rate
                const projectCompletionRate = data.totalProjects > 0
                    ? ((data.completedJobs / data.totalJobs) * 100).toFixed(2)
                    : 0;

                setStats({
                    totalJobs: data.totalJobs,
                    completedJobs: data.completedJobs,
                    ongoingProjects: data.ongoingProjects,
                    totalProjects: data.totalProjects || 0,
                    projectCompletionRate,
                });
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Total Jobs Created",
            value: stats.totalJobs,
            icon: Briefcase,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500",
            textColor: "text-blue-600"
        },
        {
            title: "Jobs Completed",
            value: stats.completedJobs,
            icon: CheckCircle,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500",
            textColor: "text-green-600"
        },
        {
            title: "Total Projects",
            value: stats.totalProjects,
            icon: Target,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500",
            textColor: "text-purple-600"
        },
        {
            title: "Completion Rate",
            value: `${stats.projectCompletionRate}%`,
            icon: TrendingUp,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-500",
            textColor: "text-orange-600"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading Dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.div 
                className="mb-8"
                variants={cardVariants}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Welcome back! Here's what's happening with your projects.
                        </p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="hidden md:flex items-center gap-4"
                    >
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Stats Cards Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={containerVariants}
            >
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        variants={cardVariants}
                        whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                        }}
                        className="group relative overflow-hidden"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                                    <card.icon className="w-6 h-6 text-white" />
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    className="text-right"
                                >
                                    <div className={`text-2xl font-bold ${card.textColor}`}>
                                        {card.value}
                                    </div>
                                </motion.div>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg mb-2">
                                {card.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span>Updated recently</span>
                            </div>
                        </div>
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                variants={containerVariants}
            >
                {/* Jobs Overview Chart */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Jobs Overview</h3>
                            <p className="text-gray-600">Track your job creation and completion</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar
                            data={{
                                labels: ["Total Jobs", "Completed Jobs"],
                                datasets: [
                                    {
                                        label: "Jobs",
                                        data: [stats.totalJobs, stats.completedJobs],
                                        backgroundColor: [
                                            "rgba(59, 130, 246, 0.8)",
                                            "rgba(34, 197, 94, 0.8)"
                                        ],
                                        borderColor: [
                                            "rgba(59, 130, 246, 1)",
                                            "rgba(34, 197, 94, 1)"
                                        ],
                                        borderWidth: 2,
                                        borderRadius: 8,
                                        borderSkipped: false,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: "rgba(0, 0, 0, 0.05)"
                                        }
                                    },
                                    x: {
                                        grid: {
                                            display: false
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {/* Projects Overview Chart */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Projects Overview</h3>
                            <p className="text-gray-600">Monitor project progress and completion</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Target className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={{
                                labels: ["Ongoing Projects", "Completed Projects"],
                                datasets: [
                                    {
                                        label: "Projects",
                                        data: [stats.ongoingProjects, stats.totalProjects - stats.ongoingProjects],
                                        backgroundColor: [
                                            "rgba(147, 51, 234, 0.8)",
                                            "rgba(59, 130, 246, 0.8)"
                                        ],
                                        borderColor: [
                                            "rgba(147, 51, 234, 1)",
                                            "rgba(59, 130, 246, 1)"
                                        ],
                                        borderWidth: 3,
                                        cutout: "60%"
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            padding: 20,
                                            usePointStyle: true,
                                            font: {
                                                size: 12
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div
                variants={cardVariants}
                className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: "Create New Job", icon: Briefcase, color: "from-blue-500 to-blue-600" },
                        { title: "Add New Client", icon: Users, color: "from-green-500 to-green-600" },
                        { title: "View Reports", icon: Activity, color: "from-purple-500 to-purple-600" }
                    ].map((action, index) => (
                        <motion.button
                            key={action.title}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3`}
                        >
                            <action.icon className="w-5 h-5" />
                            {action.title}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
