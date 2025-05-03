import express from 'express';
import { isPatientAuthenticated } from "../middlewares/auth.js";
import { Appointment } from "../models/appointmentSchema.js";
import { getAvailableTimeSlots, checkSlotAvailability, getBookedSlots, postAppointments, getPatientAppointments } from "../controllers/appointmentController.js";

const router = express.Router();

// Add all your routes here
router.get('/available-slots', getAvailableTimeSlots);
router.get('/check-slot', checkSlotAvailability);
router.get('/booked-slots', getBookedSlots);

// Add the new route for patient appointments
router.get('/patient/appointments', isPatientAuthenticated, getPatientAppointments);

router.get('/doctor-slots', async (req, res) => {
  try {
    const { date, doctorId } = req.query;

    // Find all appointments for this doctor on this date
    const appointments = await Appointment.find({
      doctorId,
      appointment_date: new Date(date),
    });

    // Extract the booked time slots
    const bookedSlots = appointments.map(app => app.appointment_time);

    res.status(200).json({
      success: true,
      bookedSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching time slots"
    });
  }
});

router.post('/post', postAppointments);

export default router; 