import { Workorder } from '../Models/workorder.model.js';
import { Client } from '../Models/client.model.js';
import { Project } from '../Models/project.model.js';
import { User } from '../Models/user.model.js'; // ✅ Import User Model

// Escape special characters in search query (for regex)
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Extract the last 4 digits from MongoDB ObjectId (optional for display)
const getLastFourDigits = (id) => id.toString().slice(-4);

export const searchItems = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const escapedQuery = escapeRegex(query);

    try {
        // ✅ Search Workorders (Jobs)
        const jobs = await Workorder.find({
            $or: [
                { title: { $regex: escapedQuery, $options: 'i' } },
                { _id: query.length === 24 ? query : undefined }
            ].filter(Boolean)
        }).limit(10);

        // ✅ Search Clients
        const clients = await Client.find({
            $or: [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { _id: query.length === 24 ? query : undefined }
            ].filter(Boolean)
        }).limit(10);

        // ✅ Search Projects
        const projects = await Project.find({
            $or: [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { _id: query.length === 24 ? query : undefined }
            ].filter(Boolean)
        }).limit(10);

        // ✅ Search Users (Technicians, Recruiters, etc.)
        const users = await User.find({
            $or: [
                { fullname: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } },
                { _id: query.length === 24 ? query : undefined }
            ].filter(Boolean)
        }).limit(10);

        // ✅ Format results properly
        const results = [
            ...jobs.map(job => ({
                id: job._id,
                name: job.title,
                type: 'job',
                shortId: getLastFourDigits(job._id),
            })),
            ...clients.map(client => ({
                id: client._id,
                name: client.name,
                type: 'client',
                shortId: getLastFourDigits(client._id),
            })),
            ...projects.map(project => ({
                id: project._id,
                name: project.name,
                type: 'project',
                shortId: getLastFourDigits(project._id),
            })),
            ...users.map(user => ({
                id: user._id,
                name: user.fullname,
                email: user.email,
                type: 'user',
                role: user.role,  // ✅ Include user role (Technician/Recruiter)
                shortId: getLastFourDigits(user._id),
            })),
        ];

        res.status(200).json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message });
    }
};
