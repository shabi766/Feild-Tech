import React, { useEffect, useState } from "react";
import axios from "axios";
import { DASHBOARD_API_END_POINT } from "../utils/constant";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        completedJobs: 0,
        ongoingProjects: 0,
        totalProjects: 0,
        projectCompletionRate: 0,
    });

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
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-6 bg-blue-400 min-h-screen">
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Jobs Created</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalJobs}</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Jobs Completed</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.completedJobs}</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Total Projects</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">Project Completion Rate</h3>
                    <p className="text-3xl font-bold text-purple-600">{stats.projectCompletionRate}%</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Bar Chart */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Jobs Overview</h3>
                    <Bar
                        data={{
                            labels: ["Total Jobs", "Completed Jobs"],
                            datasets: [
                                {
                                    label: "Jobs",
                                    data: [stats.totalJobs, stats.completedJobs],
                                    backgroundColor: ["#4F46E5", "#22C55E"],
                                },
                            ],
                        }}
                    />
                </div>

                {/* Doughnut Chart */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Projects Overview</h3>
                    <Doughnut
                        data={{
                            labels: ["Ongoing Projects", "Completed Projects"],
                            datasets: [
                                {
                                    label: "Projects",
                                    data: [stats.ongoingProjects, stats.totalProjects - stats.ongoingProjects],
                                    backgroundColor: ["#3B82F6", "#9333EA"],
                                },
                            ],
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
