import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import cloudinary from "cloudinary";
import rateLimit from 'express-rate-limit';
import doctorRouter from "./router/doctorRouter.js";
import patientRouter from "./router/patientRouter.js";
import adminRouter from "./router/adminRouter.js";
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: './config/config.env' });

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS with frontend and dashboard URLs
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DOCTOR_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/user/doctor", doctorRouter);
app.use("/api/v1/user/patient", patientRouter);
app.use("/api/v1/user", adminRouter);

// Connect to the database
dbConnection();

// Cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later'
});

app.use('/api/v1/user/login', loginLimiter);

// Error handling middleware
app.use(errorMiddleware);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export { app };
