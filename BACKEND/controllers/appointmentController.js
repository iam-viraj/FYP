// Add this new controller function
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    
    // Define all possible time slots
    const allTimeSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM",
      "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"
    ];

    // Find existing appointments for the given date and doctor
    const existingAppointments = await Appointment.find({
      doctorId: doctorId,
      appointment_date: new Date(date)
    });

    // Get booked times
    const bookedTimes = existingAppointments.map(app => app.appointment_time);

    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({
      success: true,
      availableSlots
    });

  } catch (error) {
    console.error("Error in getAvailableTimeSlots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available time slots"
    });
  }
};

// Modify your existing appointment creation to check time slot availability
export const postAppointments = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        anotherPhone,
        dob,
        gender,
        appointment_date,
        appointment_time,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !anotherPhone ||
        !dob ||
        !gender ||
        !appointment_date ||
        !appointment_time ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address 
    ) {
        return next(new ErrorHandler("Please fill in all fields!", 400));
    }

    // Find the doctor
    const doctor = await User.findOne({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department
    });

    if (!doctor) {
        return next(new ErrorHandler("Doctor not found!", 404));
    }

    // Check for existing appointments at the same time
    const existingAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        appointment_date: new Date(appointment_date),
        appointment_time: appointment_time,
        status: { $nin: ['Cancelled'] } // Exclude cancelled appointments
    });

    if (existingAppointment) {
        // Add this toast notification
        toast.error("This time slot is already booked!")
        // return next(new ErrorHandler("This time slot is already booked!", 400));
    }

    // If no collision, create the appointment
    const patientId = req.user._id;
    const appointment = await Appointment.create({
        patientId,
        doctorId: doctor._id,
        firstName,
        lastName,
        email,
        phone,
        anotherPhone,
        dob,
        gender,
        appointment_date,
        appointment_time,
        department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName
        },
        hasVisited,
        address,
        status: "Pending"
    });

    res.status(201).json({
        success: true,
        message: "Appointment booked successfully!",
        appointment
    });
});

// Add this controller function to check slot availability
export const checkSlotAvailability = async (req, res) => {
  try {
    const { date, doctorId, time } = req.query;

    // Check if appointment exists for this slot
    const existingAppointment = await Appointment.findOne({
      doctor_id: doctorId,
      appointment_date: date,
      appointment_time: time
    });

    res.json({
      success: true,
      isBooked: !!existingAppointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking slot availability"
    });
  }
};

// Add this controller function to get all booked slots for a day
export const getBookedSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.query;

    const appointments = await Appointment.find({
      doctor_id: doctorId,
      appointment_date: date
    });

    const bookedSlots = appointments.map(app => app.appointment_time);

    res.json({
      success: true,
      bookedSlots
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booked slots"
    });
  }
}; 