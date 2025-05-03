// userController.js
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from 'cloudinary';
import Token from "../models/Token.js";
import crypto from "crypto";
import verifyEmail from "../utils/verifmail.js";

// Add a new Admin
export const addNewAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, dob, gender } = req.body;

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      dob,
      gender,
      role: "Admin",
    });

    generateToken(user, "Admin created successfully", 201, res);
  } catch (error) {
    next(error);
  }
};

// Add a new Doctor
export const addNewDoctor = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      nic,
      dob,
      gender,
      doctorDepartment,
      docAvatar
    } = req.body;

    console.log("Received docAvatar:", docAvatar); // Debug log

    const doctor = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      nic,
      dob,
      gender,
      doctorDepartment,
      role: "Doctor",
      docAvatar: docAvatar || "/doc.png" // Use the received path or default
    });

    console.log("Created doctor:", doctor); // Debug log

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully"
    });
  } catch (error) {
    console.error("Error creating doctor:", error); // Debug log
    next(error);
  }
};


// Get all Doctors
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Details (Admin/Doctor/Patient)
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email, password, or role", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(user, "Login successful", 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout Admin
export const logoutAdmin = (req, res) => {
  res
    .status(200)
    .clearCookie("adminToken", { httpOnly: true })
    .json({
      success: true,
      message: "Admin logged out successfully",
    });
};

// Logout Doctor
export const logoutDoctor = (req, res) => {
  res
    .status(200)
    .clearCookie("doctorToken", { httpOnly: true })
    .json({
      success: true,
      message: "Doctor logged out successfully",
    });
};

// Logout Patient
export const logoutPatient = (req, res) => {
  res
    .status(200)
    .clearCookie("patientToken", { httpOnly: true })
    .json({
      success: true,
      message: "Patient logged out successfully",
    });
};

// Patient Registration
export const patientRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, anotherPhone, dob, gender, password } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login instead.",
      });
    }

    // If email is not registered, create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      anotherPhone,
      dob,
      gender,
      password,
      role: "Patient",
    });

    //generate verification token
    const token = new Token({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    })

    await token.save();
    console.log("Verification token:", token.token);

    const link = `http://localhost:5173/verifyemail?token=${token.token}`;
    await verifyEmail(user.email, link);

    // Generate token and send response
    generateToken(user, "Email verification sent! check your inbox", 201, res);




  } catch (error) {
    next(error);
  }
};


// Verify Email Token
export const verifyEmailToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const foundToken = await Token.findOne({ token });
    if (!foundToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const user = await User.findById(foundToken.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    user.verified = true;
    await user.save();
    await Token.deleteOne({ _id: foundToken._id });

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    next(error);
  }
};

