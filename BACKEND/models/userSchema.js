import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
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
    required: [true, "Please enter your email"],
    unique: true,
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
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits!"]
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
  password: {
    type: String,
    required: [true, "Password is required!"],
    minLength: [8, "Password must be at least 8 characters long!"],
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin", "Patient", "Doctor"],
  },
  doctorDepartment: {
    type: String,
  },
  docAvatar: {
    type: String,
    default: "/doc.png"  // default image from public folder
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

// Password Hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.generateJsonWebToken = function () {
  // Ensure JWT_EXPRIES is a valid string or fallback to '7d'
  const expiresIn = process.env.JWT_EXPRIES ? process.env.JWT_EXPRIES.trim() : '7d';

  // console.log("JWT_EXPRIES value being used:", expiresIn);  // Log for debugging
  // console.log("Expires In:", expiresIn);  // Log the value being used

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn,  // Pass the valid expiresIn value
  });
};








export const User = mongoose.model("User", userSchema);
