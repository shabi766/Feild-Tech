
import jwt from 'jsonwebtoken';
import { Blob } from 'buffer'; // Node 18+ global, but explicit import if needed, actually global in recent node.

const CLIENT_SERVICE_URL = 'http://localhost:8010/api/v1/client';
const SECRET_KEY = 'Shoaib@99';

async function reproduce() {
    console.log("🚀 Starting reproduction script (S3 Upload Verification)...");

    // 1. Generate Token Locally (Bypass auth service)
    const tokenData = {
        userId: '507f1f77bcf86cd799439011',
        role: 'Recruiter',
        recruiterType: 'Individual'
    };
    const token = jwt.sign(tokenData, SECRET_KEY, { expiresIn: '7d' });
    const cookieHeader = `token=${token}`;

    const clientName = `Test Client S3 ${Date.now()}`;
    console.log(`\nRegistering Client: ${clientName}`);

    const formData = new FormData();
    formData.append('clientName', clientName);
    formData.append('website', 'https://example.com');
    formData.append('description', 'A test client description');
    formData.append('location', 'New York');

    // Add file
    // Multer usually looks for 'file' or specific name. 
    // I will check multer.js, but standard is often 'file' or 'logo'.
    // Placeholder field name 'file' for now, will update if multer.js differs.
    const fileContent = "Dummy PDF content";
    const blob = new Blob([fileContent], { type: 'application/pdf' });
    formData.append('file', blob, 'dummy.pdf');

    const res = await fetch(`${CLIENT_SERVICE_URL}/register`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader },
        body: formData
    });

    console.log(`Response: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));

    if (res.ok) {
        console.log("\n✅ SUCCESS: Client registered with file upload!");
    } else {
        console.log("\n❌ FAILED: S3 upload likely failed.");
    }
}

reproduce().catch(err => console.error("Script Error:", err));
