import { app } from "./app.js";
import { dbConnection } from "./database/dbConnection.js";
import cloudinary from 'cloudinary';
import { Server } from "socket.io"; // Import socket.io
import chats from "./models/chats.js";


// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: 'CLOUDINARY_CLOUD_NAME',
  api_key: 'CLOUDINARY_API_KEY',
  api_secret: 'CLOUDINARY_API_SECRET',
});

dbConnection();  // Connect to database first

const PORT =  4001;

// Initialize server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5174","http://localhost:5173"], // Add the new origin here
    methods: ["GET", "POST"],
  },
});


// Set up the online users map
let onlineUsers = new Map();

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ID ${socket.id}`);
  });

  // Handle sending messages
  socket.on("send_message", async ({ fromUserId, toUserId, message }) => {
    // Here you can save the message to the database (assuming you have a message model)
    const newMessage = await chats.create({
      from: fromUserId,
      to: toUserId,
      message,
    });

    // Emit the message to the intended recipient
    const toSocketId = onlineUsers.get(toUserId);
    if (toSocketId) {
      io.to(toSocketId).emit("receive_message", {
        fromUserId,
        message,
        timestamp: new Date(),
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from the online users map when they disconnect
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

