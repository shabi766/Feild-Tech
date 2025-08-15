import mongoose from 'mongoose';
import { Review } from './Models/review.model.js';
import { User } from './Models/user.model.js';
import dotenv from 'dotenv';

// Load env vars from .env in the backend root
dotenv.config({ path: './.env' });

// Use the same env var as your working admin seeder
const MONGODB_URI = process.env.MONGO_URI;

async function createSampleData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get some existing technicians and recruiters
        const technicians = await User.find({ role: 'Technician' }).limit(5);
        const recruiters = await User.find({ role: 'Recruiter' }).limit(5);

        if (technicians.length === 0) {
            console.log('⚠️ No technicians found. Please create some technicians first.');
            return;
        }
        if (recruiters.length === 0) {
            console.log('⚠️ No recruiters found. Please create some recruiters first.');
            return;
        }

        console.log(`📊 Found ${technicians.length} technicians, ${recruiters.length} recruiters`);

        // Create mock job IDs
        const mockJobIds = Array.from({ length: 5 }, () => new mongoose.Types.ObjectId());

        // Build reviews
        const sampleReviews = Array.from({ length: 15 }, (_, i) => {
            const technician = technicians[Math.floor(Math.random() * technicians.length)];
            const recruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
            const mockJobId = mockJobIds[Math.floor(Math.random() * mockJobIds.length)];

            return {
                jobId: mockJobId,
                technicianId: technician._id,
                reviewerId: recruiter._id,
                rating: Math.floor(Math.random() * 5) + 1,
                comment: `Sample review ${i + 1}: ${getRandomComment()}`,
                categories: getRandomCategories(),
                metrics: {
                    onTimeArrival: Math.random() > 0.3,
                    jobCompletedAsExpected: Math.random() > 0.2,
                },
                status: 'approved'
            };
        });

        // Clear old reviews
        await Review.deleteMany({});
        console.log('🗑️ Cleared existing reviews');

        // Insert new reviews
        const createdReviews = await Review.insertMany(sampleReviews);
        console.log(`✅ Created ${createdReviews.length} sample reviews`);

        // Update technician performance
        for (const technician of technicians) {
            const technicianReviews = await Review.find({ technicianId: technician._id });

            if (technicianReviews.length > 0) {
                const totalReviews = technicianReviews.length;
                const averageRating = technicianReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

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
                    'performance.totalJobsCompleted': Math.floor(Math.random() * 20) + 5,
                    'performance.jobCompletionRate': Math.floor(Math.random() * 30) + 70,
                    'performance.onTimeArrivalRate': Math.floor(Math.random() * 25) + 75,
                    'performance.ghostedJobs': Math.floor(Math.random() * 3),
                    'performance.overallScore': Math.floor(Math.random() * 50) + 50,
                    'performance.leaderboardRank': Math.floor(Math.random() * 100) + 1,
                    'performance.averageResponseTime': Math.floor(Math.random() * 30) + 5,
                });

                console.log(`📈 Updated performance stats for technician: ${technician.fullname}`);
            }
        }

        console.log('🎉 Sample data created successfully!');
        console.log('🚀 You can now test the review system in the frontend.');

    } catch (error) {
        console.error('❌ Error creating sample data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 MongoDB connection closed');
    }
}

function getRandomComment() {
    const comments = [
        "Excellent work quality and very professional!",
        "Great communication and completed the job on time.",
        "Very skilled technician, highly recommend!",
        "Good work but could improve on punctuality.",
        "Outstanding problem-solving skills and attention to detail.",
        "Reliable and efficient service delivery.",
        "Professional attitude and excellent craftsmanship.",
        "Good job overall, would hire again.",
        "Very knowledgeable in their field.",
        "Prompt response and quality workmanship."
    ];
    return comments[Math.floor(Math.random() * comments.length)];
}

function getRandomCategories() {
    const allCategories = ['punctuality', 'quality', 'communication', 'professionalism', 'problem_solving', 'teamwork'];
    const numCategories = Math.floor(Math.random() * 3) + 1;
    const shuffled = allCategories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numCategories);
}

// Run
createSampleData();
