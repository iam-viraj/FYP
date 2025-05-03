import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcrypt";

// Update Patient Password
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const patient = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, patient.password);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid old password", 400));
    }

    patient.password = newPassword;
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}; 