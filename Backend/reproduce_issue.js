import axios from 'axios';
import FormData from 'form-data';

const AUTH_URL = 'http://localhost:8001/api/v1/auth/login';
const CLIENT_REGISTER_URL = 'http://localhost:8010/api/v1/client/register';

async function run() {
    try {
        console.log("1. Logging in...");
        // Use a test account - I need to know valid credentials.
        // I'll assume standard credentials or try to create a user first if I can.
        // Wait, I can't register a user easily without valid data.
        // I'll try to find a seed file or valid user.
        // Let's assume there is a user. If not, I'll have to register one.

        // I'll registering a new user first to be safe.
        const REGISTER_URL = 'http://localhost:8001/api/v1/auth/register';
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Registering user: ${email}`);
        // For register we need multipart/form-data as per auth.controller.js (singleUpload middleware)
        const regForm = new FormData();
        regForm.append('fullname', 'Test User');
        regForm.append('email', email);
        regForm.append('password', password);
        regForm.append('role', 'Recruiter');
        regForm.append('recruiterType', 'Individual');
        regForm.append('phoneNumber', '1234567890');

        await axios.post(REGISTER_URL, regForm, {
            headers: regForm.getHeaders()
        });
        console.log("User registered.");

        // Login
        const loginRes = await axios.post(AUTH_URL, {
            email,
            password
        });

        const cookies = loginRes.headers['set-cookie'];
        if (!cookies) {
            console.error("No cookies received!");
            return;
        }
        console.log("Logged in. Cookies:", cookies);

        // Extract token from cookie
        const tokenCookie = cookies.find(c => c.startsWith('token='));

        // Register Client
        console.log("2. Registering Client...");
        const clientForm = new FormData();
        clientForm.append('clientName', 'Test Client');
        clientForm.append('website', 'http://example.com');
        clientForm.append('description', 'Test Description');
        clientForm.append('location', 'Test Location');

        try {
            const clientRes = await axios.post(CLIENT_REGISTER_URL, clientForm, {
                headers: {
                    ...clientForm.getHeaders(),
                    'Cookie': tokenCookie // Send the cookie
                },
                withCredentials: true // Axios needs this? manually setting Cookie header covers it for node.
            });
            console.log("Client Registered Successfully:", clientRes.data);
        } catch (err) {
            console.error("Client Registration Failed:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 401) {
                console.log("Reproduced 401 error!");
            }
        }

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

run();
