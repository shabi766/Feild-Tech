import React, { useEffect, useState, useMemo } from "react";
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
  Target,
  ClipboardList,
  Wrench
} from "lucide-react";

const Dashboard = () => {
    const [role, setRole] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${DASHBOARD_API_END_POINT}/stats`, { withCredentials: true });
                setRole(data.role || null);
                setData(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = useMemo(() => {
        if (!data) return [];
        if (role === 'Recruiter' || role === 'Admin') {
            const jobs = data.jobs || { total: 0, active: 0, completed: 0 };
            const projects = data.projects || { total: 0, ongoing: 0 };
            return [
                { title: "Jobs Created", value: jobs.total, icon: Briefcase, color: "from-blue-500 to-blue-600", textColor: "text-blue-600" },
                { title: "Active Jobs", value: jobs.active, icon: ClipboardList, color: "from-amber-500 to-amber-600", textColor: "text-amber-600" },
                { title: "Jobs Completed", value: jobs.completed, icon: CheckCircle, color: "from-green-500 to-green-600", textColor: "text-green-600" },
                { title: "Projects", value: projects.total, icon: Target, color: "from-purple-500 to-purple-600", textColor: "text-purple-600" },
            ];
        }
        // Technician
        const jobs = data.jobs || { applied: 0, assigned: 0, inProgress: 0, completed: 0 };
        return [
            { title: "Jobs Applied", value: jobs.applied, icon: ClipboardList, color: "from-blue-500 to-blue-600", textColor: "text-blue-600" },
            { title: "Jobs Assigned", value: jobs.assigned, icon: Wrench, color: "from-indigo-500 to-indigo-600", textColor: "text-indigo-600" },
            { title: "In Progress", value: jobs.inProgress, icon: Activity, color: "from-amber-500 to-amber-600", textColor: "text-amber-600" },
            { title: "Completed", value: jobs.completed, icon: CheckCircle, color: "from-green-500 to-green-600", textColor: "text-green-600" },
        ];
    }, [data, role]);

    const jobsBarData = useMemo(() => {
        if (!data) return null;
        if (role === 'Recruiter' || role === 'Admin') {
            const jobs = data.jobs || { total: 0, completed: 0 };
            return {
                labels: ["Total", "Completed"],
                datasets: [{
                    label: "Jobs",
                    data: [jobs.total || 0, jobs.completed || 0],
                    backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(34, 197, 94, 0.8)"],
                    borderColor: ["rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)"],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            };
        }
        const jobs = data.jobs || { applied: 0, assigned: 0, inProgress: 0, completed: 0 };
        return {
            labels: ["Applied", "Assigned", "In Progress", "Completed"],
            datasets: [{
                label: "Jobs",
                data: [jobs.applied || 0, jobs.assigned || 0, jobs.inProgress || 0, jobs.completed || 0],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(245, 158, 11, 0.8)",
                    "rgba(34, 197, 94, 0.8)"
                ],
                borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(99, 102, 241, 1)",
                    "rgba(245, 158, 11, 1)",
                    "rgba(34, 197, 94, 1)"
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        };
    }, [data, role]);

    const projectsDonutData = useMemo(() => {
        if (!data) return null;
        if (!(role === 'Recruiter' || role === 'Admin')) return null;
        const projects = data.projects || { total: 0, ongoing: 0 };
        const ongoing = projects.ongoing || 0;
        const completed = Math.max((projects.total || 0) - ongoing, 0);
        return {
            labels: ["Ongoing", "Completed"],
            datasets: [{
                label: "Projects",
                data: [ongoing, completed],
                backgroundColor: ["rgba(147, 51, 234, 0.8)", "rgba(59, 130, 246, 0.8)"],
                borderColor: ["rgba(147, 51, 234, 1)", "rgba(59, 130, 246, 1)"],
                borderWidth: 3,
                cutout: "60%",
            }]
        };
    }, [data, role]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading Dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" variants={containerVariants} initial="hidden" animate="visible">
            {/* Header Section */}
            <motion.div className="mb-8" variants={cardVariants}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            {role === 'Recruiter' || role === 'Admin' ? 'Recruiter Dashboard' : 'Technician Dashboard'}
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            {role === 'Recruiter' || role === 'Admin' ? "Your jobs and projects at a glance." : "Your job activity overview."}
                        </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Stats Cards Grid */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variants={containerVariants}>
                {statCards.map((card) => (
                    <motion.div key={card.title} variants={cardVariants} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} className="group relative overflow-hidden">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                                    <card.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg mb-2">{card.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span>Updated recently</span>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Section */}
            <motion.div className={`grid grid-cols-1 ${role === 'Recruiter' || role === 'Admin' ? 'lg:grid-cols-2' : ''} gap-8`} variants={containerVariants}>
                <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Jobs Overview</h3>
                            <p className="text-gray-600">{role === 'Recruiter' || role === 'Admin' ? 'Created vs completed' : 'Applied, assigned, progress, completed'}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="h-64">
                        {jobsBarData && (
                            <Bar data={jobsBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } }, x: { grid: { display: false } } } }} />
                        )}
                    </div>
                </motion.div>

                {(role === 'Recruiter' || role === 'Admin') && (
                    <motion.div variants={cardVariants} whileHover={{ scale: 1.01 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Projects Overview</h3>
                                <p className="text-gray-600">Monitor project progress</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            {projectsDonutData && (
                                <Doughnut data={projectsDonutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } } } }} />
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div variants={cardVariants} className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
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
