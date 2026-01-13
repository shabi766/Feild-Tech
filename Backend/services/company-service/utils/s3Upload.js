import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

export const uploadToS3 = async (file, folder = 'uploads') => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${folder}/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw error;
    }
};
