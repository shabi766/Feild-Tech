import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Review } from './Models/review.model.js';
import { User } from './Models/user.model.js';
import { Workorder } from './Models/workorder.model.js';

// Load environment variables
dotenv.config();

const createTestReviews = async () => {
    try {
        // Connect to MongoDB using the same env var as your admin seeder
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get existing technicians, recruiters, and paid jobs
        const technicians = await User.find({ role: 'Technician' }).limit(3);
        const recruiters = await User.find({ role: 'Recruiter' }).limit(3);
        const jobs = await Workorder.find({ status: 'Paid' }).limit(5);

        if (technicians.length === 0) {
            console.log('⚠️ No technicians found. Please create some first.');
            return;
        }
        if (recruiters.length === 0) {
            console.log('⚠️ No recruiters found. Please create some first.');
            return;
        }
        if (jobs.length === 0) {
            console.log('⚠️ No paid jobs found. Please complete some jobs first.');
            return;
        }

        console.log(`📊 Found ${technicians.length} technicians, ${recruiters.length} recruiters, ${jobs.length} jobs`);

        // Create sample reviews
        const sampleReviews = [];
        for (let i = 0; i < 10; i++) {
            const technician = technicians[Math.floor(Math.random() * technicians.length)];
            const recruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            sampleReviews.push({
                jobId: job._id,
                technicianId: technician._id,
                reviewerId: recruiter._id,
                rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
                comment: `This is a sample review ${i + 1}. The technician did a great job.`,
                categories: ['Punctuality', 'Quality of Work', 'Communication'].slice(
                    0,
                    Math.floor(Math.random() * 3) + 1
                ),
                metrics: {
                    onTimeArrival: Math.random() > 0.3,
                    jobCompletedAsExpected: Math.random() > 0.2,
                },
                status: 'Approved'
            });
        }

        // Insert reviews
        const createdReviews = await Review.insertMany(sampleReviews);
        console.log(`✅ Created ${createdReviews.length} sample reviews`);

        // Update technician performance stats
        for (const technician of technicians) {
            const technicianReviews = await Review.find({ technicianId: technician._id });

            if (technicianReviews.length > 0) {
                const totalReviews = technicianReviews.length;
                const averageRating =
                    technicianReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

                const ratingBreakdown = {
                    fiveStar: technicianReviews.filter(r => r.rating === 5).length,
                    fourStar: technicianReviews.filter(r => r.rating === 4).length,
                    threeStar: technicianReviews.filter(r => r.rating === 3).length,
                    twoStar: technicianReviews.filter(r => r.rating === 2).length,
                    oneStar: technicianReviews.filter(r => r.rating === 1).length,
                };

                await User.findByIdAndUpdate(technician._id, {
                    'performance.averageRating': averageRating,
                    'performance.totalReviews': totalReviews,
                    'performance.ratingBreakdown': ratingBreakdown,
                });

                console.log(`📌 Updated performance stats for technician: ${technician.fullname}`);
            }
        }

        console.log('🎯 Test reviews created successfully!');

    } catch (error) {
        console.error('❌ Error creating test reviews:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run the seeder
createTestReviews();


