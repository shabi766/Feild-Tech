import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http"; // Import http to wrap express with HTTP server
import { Server } from "socket.io"; // Import Server from socket.io
import connectDB from "./utils/db.js";
import userRoute from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import workorderRoute from "./Routes/workorder.route.js";
import applicationRoute from "./Routes/application.route.js";
import clientRoute from "./Routes/client.route.js";
import projectRoute from "./Routes/project.route.js";
import technicianRoute from "./Routes/technician.route.js";
import searchRoute from "./Routes/search.route.js";
import dashboardRoute from "./Routes/dashboard.route.js";
import notificationRoute from "./Routes/notification.route.js";
import chatRoute from "./Routes/chat.route.js"

dotenv.config({});

const app = express();
const server = http.createServer(app); 

// Initialize Socket.io with CORS settings
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"], 
        credentials: true 
    }
});



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Connect to Database
connectDB();

// Setup Socket.io connection
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join the user to a room based on their user ID
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room: ${userId}`);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io accessible to request handlers
app.set('io', io);

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/workorder", workorderRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/client", clientRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/technician", technicianRoute);
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/chat", chatRoute)
export {io};

export const emitClientCreationNotification = (userId, message) => {
    io.emit("clientCreated", { userId, message });
};

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
