import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const isDoctorAuthenticated = async (req, res, next) => {
  try {
    const { doctorToken } = req.cookies;

    if (!doctorToken) {
      return next(new ErrorHandler("Please login first", 401));
    }

    const decoded = jwt.verify(doctorToken, process.env.JWT_SECRET);
    const doctor = await User.findById(decoded._id);

    if (!doctor || doctor.role !== "Doctor") {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    req.user = doctor;
    next();
  } catch (error) {
    next(new ErrorHandler("Invalid token", 401));
  }
}; 