# S3 Configuration Setup

## Overview
The application is already configured to upload images directly to AWS S3. All uploaded images are stored in S3 and only the URLs are stored in the database.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Backend Configuration
BACKEND_PORT=3001
FRONTEND_URL=http://frontend:3000

# Frontend Configuration
VITE_BACKEND_URL=http://backend:3001
```

## S3 Bucket Setup

1. **Create an S3 Bucket** in your AWS account
2. **Configure CORS** for your S3 bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. **Set Bucket Policy** for public read access (if needed):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## How It Works

1. **Frontend**: User selects images and uploads them
2. **Backend**: Receives files via multer middleware (stored in memory)
3. **S3 Upload**: Files are immediately uploaded to S3 using AWS SDK
4. **Database**: Only S3 URLs are stored in the database
5. **Frontend**: Displays images using S3 URLs

## File Structure in S3

Images are stored with the following structure:
```
your-bucket/
└── jobs/
    ├── 1234567890-image1.jpg
    ├── 1234567891-image2.png
    └── 1234567892-image3.jpg
```

## Security Notes

- Ensure your AWS credentials have minimal required permissions
- Consider using IAM roles instead of access keys in production
- Regularly rotate your AWS credentials
- Monitor S3 usage and costs

## Testing

After setup, test the upload functionality:
1. Start the application with `docker-compose up`
2. Navigate to a job description page
3. Try uploading images
4. Check your S3 bucket to confirm files are uploaded
