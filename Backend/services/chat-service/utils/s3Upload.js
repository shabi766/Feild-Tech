import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Upload single file to S3
export const uploadToS3 = (file, folder = 'general') => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`, // Sanitize filename
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Adjust ACL as needed
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error("Error uploading to S3:", err);
                reject(err);
            } else {
                resolve(data.Location); // Return the S3 URL
            }
        });
    });
};

// Upload multiple files to S3
export const uploadMultipleToS3 = async (files, folder = 'general') => {
    const uploadPromises = files.map(file => uploadToS3(file, folder));
    return Promise.all(uploadPromises);
};

// Delete file from S3 (if needed)
export const deleteFromS3 = (fileUrl) => {
    return new Promise((resolve, reject) => {
        // Extract key from URL
        const urlParts = fileUrl.split('/');
        const key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error("Error deleting from S3:", err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
