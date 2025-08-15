# Review and Rating System Documentation

## Overview

This document describes the comprehensive review and rating system implemented for the Alpha Project platform. The system allows recruiters to review technicians after job completion and payment, creating a transparent and trustworthy environment for all users.

## Features

### 1. Review System
- **Post-Payment Reviews**: Recruiters can only review technicians after completing payment for a job
- **Comprehensive Rating**: 1-5 star rating system with detailed performance metrics
- **Category-Based Reviews**: Optional categorization of reviews (punctuality, quality, communication, etc.)
- **Performance Metrics**: Binary and rating-based metrics for detailed evaluation
- **Review Moderation**: Built-in moderation system for review approval/rejection

### 2. Rating Calculation
- **Average Rating**: Calculated from all approved reviews
- **Rating Breakdown**: Detailed breakdown of 1-star to 5-star ratings
- **Real-time Updates**: Ratings update automatically when new reviews are submitted

### 3. Leaderboard System
- **Overall Score Calculation**: Multi-factor scoring system based on:
  - Job completion rate (40% weight)
  - On-time arrival rate (25% weight)
  - Total jobs completed bonus (20% weight)
  - Penalty for ghosted jobs
- **Ranking System**: Dynamic ranking based on overall scores
- **Category Rankings**: Specialized rankings for different skill categories
- **Trending Technicians**: Track technicians with improving rankings

### 4. Performance Metrics
- **Job Completion Rate**: Percentage of assigned jobs successfully completed
- **On-time Arrival Rate**: Percentage of jobs where technician arrived on time
- **Response Time**: Average time to respond to job assignments
- **Ghosted Jobs**: Count of jobs where technician didn't show up
- **Reliability Score**: Combined metric for overall reliability

## Database Models

### Review Model (`review.model.js`)
```javascript
{
  jobId: ObjectId,           // Reference to completed job
  technicianId: ObjectId,    // Technician being reviewed
  reviewerId: ObjectId,      // Recruiter giving review
  rating: Number,            // 1-5 star rating
  comment: String,           // Review text (10-1000 chars)
  categories: [String],      // Optional review categories
  metrics: {                 // Performance metrics
    onTimeArrival: Boolean,
    jobCompletedOnTime: Boolean,
    qualityOfWork: Number,
    communication: Number,
    professionalism: Number
  },
  status: String,            // pending/approved/rejected
  helpfulVotes: Number,      // Helpful vote count
  totalVotes: Number         // Total vote count
}
```

### Leaderboard Model (`leaderboard.model.js`)
```javascript
{
  technicianId: ObjectId,    // Reference to technician
  totalJobsCompleted: Number,
  totalJobsAssigned: Number,
  averageRating: Number,
  totalReviews: Number,
  ratingBreakdown: {         // Detailed rating distribution
    fiveStar: Number,
    fourStar: Number,
    threeStar: Number,
    twoStar: Number,
    oneStar: Number
  },
  onTimeArrivalRate: Number, // Percentage
  jobCompletionRate: Number, // Percentage
  ghostedJobs: Number,
  overallScore: Number,      // Calculated ranking score
  rank: Number,              // Current ranking position
  previousRank: Number       // Previous ranking position
}
```

## API Endpoints

### Review Endpoints
- `POST /api/v1/review/create` - Create a new review
- `GET /api/v1/review/technician/:technicianId` - Get technician reviews
- `GET /api/v1/review/technician/:technicianId/stats` - Get review statistics
- `PUT /api/v1/review/:reviewId` - Update a review
- `DELETE /api/v1/review/:reviewId` - Delete a review

### Leaderboard Endpoints
- `GET /api/v1/leaderboard/global` - Get global leaderboard
- `GET /api/v1/leaderboard/category/:category` - Get category-specific leaderboard
- `GET /api/v1/leaderboard/top-performers` - Get top performers
- `GET /api/v1/leaderboard/trending` - Get trending technicians
- `GET /api/v1/leaderboard/stats` - Get leaderboard statistics
- `GET /api/v1/leaderboard/technician/:technicianId` - Get technician ranking
- `POST /api/v1/leaderboard/update-rankings` - Update all rankings

## Frontend Components

### 1. ReviewModal (`ReviewModal.jsx`)
- Comprehensive review form with star ratings
- Category selection for detailed feedback
- Performance metrics evaluation
- Form validation and error handling

### 2. Leaderboard (`Leaderboard.jsx`)
- Global technician rankings
- Top performers showcase
- Trending technicians display
- Sorting and filtering options
- Pagination support

### 3. TechnicianProfile (`TechnicianProfile.jsx`)
- Enhanced profile with rating display
- Performance metrics visualization
- Review history with pagination
- Leaderboard ranking information

## Integration Points

### Job Completion Flow
1. Technician completes job → Status: "Done"
2. Recruiter reviews completion → Status: "Complete"
3. Recruiter makes payment → Status: "Paid"
4. Review button becomes available
5. Recruiter submits review
6. Technician stats and leaderboard update automatically

### Automatic Updates
- Review submission triggers technician stats update
- Leaderboard scores recalculate automatically
- Rankings update in real-time
- User model performance fields sync with leaderboard

## Scoring Algorithm

### Overall Score Calculation
```javascript
let score = 0;

// Job completion (40% weight)
score += jobCompletionRate * 0.4;

// On-time arrival (25% weight)
score += onTimeArrivalRate * 0.25;

// Total jobs completed bonus (20% weight)
score += Math.min(totalJobsCompleted * 2, 20);

// Penalty for ghosted jobs
score -= ghostedJobs * 10;

return Math.max(0, Math.round(score));
```

### Rating Calculation
- Average rating from all approved reviews
- Rounded to 1 decimal place
- Excludes pending/rejected reviews
- Updates automatically with new reviews

## Security Features

### Review Validation
- Only job poster or assigned client can review
- One review per job per reviewer
- Reviews only allowed for completed/paid jobs
- Comment length validation (10-1000 characters)

### Moderation System
- Review status tracking (pending/approved/rejected)
- Flagging system for inappropriate content
- Admin moderation capabilities
- Helpful vote system for community moderation

## Usage Examples

### Creating a Review
```javascript
const reviewData = {
  jobId: "job123",
  technicianId: "tech456",
  rating: 5,
  comment: "Excellent work, very professional and punctual.",
  categories: ["punctuality", "quality", "communication"],
  metrics: {
    onTimeArrival: true,
    jobCompletedOnTime: true,
    qualityOfWork: 5,
    communication: 5,
    professionalism: 5
  }
};

const response = await axios.post('/api/v1/review/create', reviewData);
```

### Getting Leaderboard
```javascript
const leaderboard = await axios.get('/api/v1/leaderboard/global?sortBy=overallScore&page=1&limit=20');
```

### Getting Technician Stats
```javascript
const stats = await axios.get('/api/v1/review/technician/tech456/stats');
```

## Initialization

### Setting Up Leaderboard
Run the initialization script to populate the leaderboard with existing data:

```bash
cd Backend
node initializeLeaderboard.js
```

This script will:
- Calculate performance metrics for all technicians
- Create leaderboard entries
- Calculate initial rankings
- Update user model performance fields

## Future Enhancements

### Planned Features
- **Review Response System**: Allow technicians to respond to reviews
- **Review Analytics**: Advanced analytics and insights
- **Achievement Badges**: Gamification system for top performers
- **Review Templates**: Predefined review templates for common scenarios
- **Review Verification**: Enhanced verification for review authenticity

### Performance Optimizations
- **Caching**: Redis caching for frequently accessed leaderboard data
- **Background Jobs**: Queue-based processing for score calculations
- **Database Indexing**: Optimized indexes for leaderboard queries
- **Real-time Updates**: WebSocket integration for live leaderboard updates

## Troubleshooting

### Common Issues
1. **Review Not Showing**: Check if review status is 'approved'
2. **Scores Not Updating**: Verify review submission was successful
3. **Rankings Out of Sync**: Run leaderboard update endpoint
4. **Performance Issues**: Check database indexes and query optimization

### Debug Commands
```javascript
// Check technician performance data
const user = await User.findById(technicianId);
console.log(user.performance);

// Check leaderboard entry
const leaderboard = await Leaderboard.findOne({ technicianId });
console.log(leaderboard);

// Check review statistics
const stats = await Review.aggregate([...]);
console.log(stats);
```

## Support

For technical support or questions about the review and rating system, please refer to the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team
