import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Parse .env from client-service directory
dotenv.config({ path: path.resolve('services/client-service/.env') });

console.log("--- AWS Configuration ---");
console.log("Region:", process.env.AWS_REGION);
console.log("Bucket:", process.env.AWS_S3_BUCKET_NAME);
console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? "Set (Length: " + process.env.AWS_ACCESS_KEY_ID.length + ")" : "NOT SET");
console.log("-------------------------\n");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

async function verify() {
    const bucketName = 'shiftsmate';
    console.log(`Checking bucket '${bucketName}'...`);

    try {
        const data = await s3.getBucketLocation({ Bucket: bucketName }).promise();
        console.log(`✅ Bucket '${bucketName}' exists!`);
        console.log(`Region: ${data.LocationConstraint || 'us-east-1'}`);
    } catch (err) {
        console.error("❌ Error checking bucket location:", err.message);
    }
}

verify();
