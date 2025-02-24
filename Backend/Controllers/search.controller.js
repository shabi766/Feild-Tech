import { Workorder } from '../Models/workorder.model.js';
import { Client } from '../Models/client.model.js';
import { Project } from '../Models/project.model.js';

// Helper function to escape regex special characters (no change needed)
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper function to extract the last 4 digits from MongoDB _id (no change needed)
const getLastFourDigits = (id) => id.toString().slice(-4);

export const searchItems = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const escapedQuery = escapeRegex(query);

    try {
        const jobs = await Workorder.find({
            $or: [
                { title: { $regex: escapedQuery, $options: 'i' } },
                { _id: { $regex: escapedQuery, $options: 'i' } } // Directly search _id as string
            ]
        }).limit(10);

        const clients = await Client.find({
            $or: [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { _id: { $regex: escapedQuery, $options: 'i' } } // Directly search _id as string
            ]
        }).limit(10);

        const projects = await Project.find({
            $or: [
                { name: { $regex: escapedQuery, $options: 'i' } },
                { _id: { $regex: escapedQuery, $options: 'i' } } // Directly search _id as string
            ]
        }).limit(10);


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
        ];

        res.status(200).json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error occurred.', error: error.message }); // Include error message
    }
};