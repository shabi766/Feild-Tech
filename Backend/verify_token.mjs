
import jwt from 'jsonwebtoken';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTkyMWE4ZTdjMzliOTYyN2MwNzI3NWUiLCJyb2xlIjoiUmVjcnVpdGVyIiwicmVjcnVpdGVyVHlwZSI6IkluZGl2aWR1YWwiLCJpYXQiOjE3NzExODI3MzUsImV4cCI6MTc3MTc4NzUzNX0.7YXzXDXrnNB_3bpdlLLLfYCBSWlF4pPw9x3k2lj3QMY';
const secret = 'Shoaib@99';

console.log(`Verifying token with secret: '${secret}'`);

try {
    const decoded = jwt.verify(token, secret);
    console.log("✅ Verification SUCCESS!");
    console.log("Payload:", decoded);
} catch (err) {
    console.error("❌ Verification FAILED!");
    console.error("Error:", err.message);
}
