import { AuthServiceClient } from "../Services/auth-client.service.js";
import { CompanyServiceClient } from "../Services/company-client.service.js";
import { WorkorderServiceClient } from "../Services/workorder-client.service.js";

/**
 * Global Search Aggregator
 */
export const globalSearch = async (req, res) => {
    try {
        const { q, type } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Parallel execution of search requests
        const promises = [];

        // If type is specified, only search that entity. Otherwise search all.
        const searchAll = !type || type === 'all';

        if (searchAll || type === 'technician' || type === 'user') {
            promises.push(AuthServiceClient.searchUsers(q, token).then(res => ({ type: 'technician', data: res })));
        }

        if (searchAll || type === 'company') {
            promises.push(CompanyServiceClient.searchCompanies(q, token).then(res => ({ type: 'company', data: res })));
        }

        if (searchAll || type === 'job' || type === 'workorder') {
            promises.push(WorkorderServiceClient.searchJobs(q, token).then(res => ({ type: 'job', data: res })));
        }

        const results = await Promise.all(promises);

        // Format response
        const formattedResults = {
            technicians: [],
            companies: [],
            jobs: []
        };

        results.forEach(result => {
            if (result.type === 'technician') {
                formattedResults.technicians = result.data.map(user => ({
                    _id: user._id,
                    title: user.fullname,
                    subtitle: user.role, // e.g., "Technician"
                    image: user.profile?.profilePhoto,
                    link: `/profile/${user._id}`
                }));
            } else if (result.type === 'company') {
                formattedResults.companies = result.data.map(company => ({
                    _id: company._id,
                    title: company.name,
                    subtitle: company.industry || 'Company',
                    image: company.logo,
                    link: `/company/${company._id}`
                }));
            } else if (result.type === 'job') {
                formattedResults.jobs = result.data.map(job => ({
                    _id: job._id,
                    title: job.title,
                    subtitle: job.status,
                    description: job.description?.substring(0, 50) + '...',
                    link: `/workorder/${job._id}`
                }));
            }
        });

        // Calculate total matches for quick status
        const totalMatches = formattedResults.technicians.length +
            formattedResults.companies.length +
            formattedResults.jobs.length;

        return res.status(200).json({
            success: true,
            query: q,
            totalMatches,
            results: formattedResults
        });

    } catch (error) {
        console.error("Error in global search:", error);
        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};
