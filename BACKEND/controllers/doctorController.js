import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import { generateToken } from "../utils/jwtToken.js";

// Doctor Login
export const doctorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const doctor = await User.findOne({ email, role: "Doctor" }).select(
      "+password"
    );

    if (!doctor) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(doctor, "Logged in successfully", 200, res);
  } catch (error) {
    next(error);
  }
};

// Get Doctor Stats
export const getDoctorStats = async (req, res, next) => {
  try {
    // Get total patients (unique patients from appointments)
    const totalPatients = await Appointment.distinct('patientId', { doctorId: req.user._id });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      appointmentDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      status: "Pending"
    });

    // Get completed appointments
    const completedAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      status: "Completed"
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPatients: totalPatients.length, // Use length instead of count
        todayAppointments,
        pendingAppointments,
        completedAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Doctor's Appointments with Patient Details
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .select('firstName lastName email phone appointment_date appointment_time department status')
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// Update Appointment Status
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found", 404));
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("Unauthorized access", 403));
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update Doctor Password
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const doctor = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, doctor.password);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Doctor Logout
export const doctorLogout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    next(error);
  }
};

// Get Doctor Profile
export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// Update Doctor Profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, doctorDepartment } = req.body;
    const doctor = await User.findById(req.user._id);

    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (phone) doctor.phone = phone;
    if (doctorDepartment) doctor.doctorDepartment = doctorDepartment;

    if (req.file) {
      // Add image upload logic here using cloudinary or similar service
      doctor.docAvatar = {
        public_id: "temp_id",
        url: "temp_url",
      };
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


// Get All Doctors Information
export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "Doctor" }).select("-password");

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};