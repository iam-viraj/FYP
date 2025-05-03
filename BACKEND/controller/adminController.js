import { User } from "../models/userSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First check if doctor exists
    const doctor = await User.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Verify it's actually a doctor
    if (doctor.role !== "Doctor") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a doctor"
      });
    }

    // Check for pending appointments
    const pendingAppointments = await Appointment.find({
      doctorId: id,
      status: { $in: ["Pending", "Confirmed"] }
    });

    if (pendingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete doctor with pending or confirmed appointments"
      });
    }

    // Delete all completed/cancelled appointments for this doctor
    await Appointment.deleteMany({
      doctorId: id,
      status: { $in: ["Completed", "Cancelled"] }
    });

    // Finally delete the doctor
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully"
    });

  } catch (error) {
    console.error("Delete doctor error:", error); // Add this for debugging
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting doctor"
    });
  }
}; 