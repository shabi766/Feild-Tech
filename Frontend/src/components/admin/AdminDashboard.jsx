import React, { useEffect, useState } from 'react';
 // Adjust import based on your UI library
import axios from 'axios';
import { DASHBOARD_API_END_POINT } from '../utils/constant';
import Navbar from '../shared/Navbar';
import Card from './SampleCard';
import Footer from '../shared/Footer';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ ongoingProjects: 0, completedJobs: 0, totalJobs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${DASHBOARD_API_END_POINT}/get`,{withCredentials:true}); // Adjust the API endpoint
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
        
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="grid grid-cols-3 gap-4">
                <Card title="Ongoing Projects" value={stats.ongoingProjects} />
                <Card title="Completed Jobs" value={stats.completedJobs} />
                <Card title="Total Jobs Created" value={stats.totalJobs} />
            </div>
        </div>
        <div className='mt-10'><Footer/></div>
        
        </div>
    );
};

export default AdminDashboard;
