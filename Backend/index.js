import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import { User } from "./Models/user.model.js"; // ✅ Import User model for status updates
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
import chatRoute from "./Routes/chat.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io with CORS settings
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ✅ Track online users in a Map
const onlineUsers = new Map();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// ✅ Connect to Database
connectDB();

// ✅ Handle Socket.io Connections
io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    /** 
     * ✅ User joins a room (chat or app session)
     */
    socket.on('joinRoom', async (userId) => {
        socket.join(userId);
        onlineUsers.set(socket.id, userId); // Track user

        // ✅ Update user status to online
        await User.findByIdAndUpdate(userId, { status: "online", lastSeen: new Date() });

        // ✅ Emit updated status to all clients
        io.emit("update_status", { userId, status: "online" });

        console.log(`✅ User ${userId} is now online`);
    });

    /** 
     * ✅ User manually sets "Away" status
     */
    socket.on("setAway", async (userId) => {
        await User.findByIdAndUpdate(userId, { status: "away" });

        io.emit("update_status", { userId, status: "away" });

        console.log(`⚠️ User ${userId} is away`);
    });

    /** 
     * ✅ User disconnects (Closes browser/tab)
     */
    socket.on('disconnect', async () => {
        const userId = onlineUsers.get(socket.id);
        if (userId) {
            onlineUsers.delete(socket.id); // Remove user from tracking

            // ✅ Update last seen and set offline status
            await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });

            io.emit("update_status", { userId, status: "offline", lastSeen: new Date() });

            console.log(`❌ User ${userId} disconnected`);
        }
    });
});

// ✅ Make io accessible in routes
app.set('io', io);

// ✅ API Routes
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
app.use("/api/v1/chat", chatRoute);

// ✅ Export io for use in controllers
export { io };

// ✅ Start the Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at port ${PORT}`);
});
