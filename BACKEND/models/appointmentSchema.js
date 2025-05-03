import mongoose from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Phone number must contain at least 10 digits!"],
    maxLength: [10, "Phone number must contain a maximum of 10 digits!"],
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits!"],
  },
  anotherPhone: {
    type: String,
    minLength: [10, "Phone number must contain at least 10 digits!"],
    maxLength: [10, "Phone number must contain a maximum of 10 digits!"],
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits!"],
  },
  dob: {
    type: Date,
    required: [true, "DOB is required!"],
  },
  gender: {
    type: String,
    required: [true, "Gender is required!"],
    enum: ["Male", "Female", "Other"],
  },
  appointment_date: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
    default: "Pending",
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  appointment_time: {
    type: String,
    required: true
  },
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);