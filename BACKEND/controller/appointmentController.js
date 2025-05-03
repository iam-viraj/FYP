import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Appointment } from "../models/appointmentSchema.js"
import { User } from "../models/userSchema.js"


export const postAppointments = catchAsyncErrors(async (req, res, next) => {
    try {
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

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !dob || !gender || 
            !appointment_date || !appointment_time || !department || 
            !doctor_firstName || !doctor_lastName || !address) {
            return next(new ErrorHandler("Please fill in all required fields!", 400));
        }

        // Find the doctor first
        const doctor = await User.findOne({
            firstName: doctor_firstName,
            lastName: doctor_lastName,
            role: "Doctor",
            doctorDepartment: department
        });

        if (!doctor) {
            return next(new ErrorHandler("Doctor not found!", 404));
        }

        // Check for existing appointment in the same time slot
        const existingAppointment = await Appointment.findOne({
            doctorId: doctor._id,
            appointment_date: new Date(appointment_date),
            appointment_time: appointment_time,
            status: { $nin: ['Cancelled'] } // Exclude cancelled appointments
        });

        if (existingAppointment) {
            return next(new ErrorHandler("This time slot is already booked!", 400));
        }

        // Create the appointment
        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId: doctor._id,
            firstName,
            lastName,
            email,
            phone,
            anotherPhone: anotherPhone || phone,
            dob: new Date(dob),
            gender,
            appointment_date: new Date(appointment_date),
            appointment_time,
            department,
            doctor: {
                firstName: doctor_firstName,
                lastName: doctor_lastName
            },
            hasVisited: hasVisited || false,
            address,
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment
        });

    } catch (error) {
        console.error('Server error:', error); // Add server-side logging
        return next(new ErrorHandler(error.message || "Internal server error", 500));
    }
});


export const getAllAppointments = catchAsyncErrors(async(req,res,next) =>{
    const appointments = await Appointment.find();
    res.status(200).json({
        success:true,
        appointments,
    });
});

export const updateAppointmentStatus = catchAsyncErrors(async(req, res, next) => {
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        appointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async(req,res,next)=>{
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
    });

});

export const checkPendingAppointments = async (req, res, next) => {
  try {
    const pendingAppointments = await Appointment.findOne({
      doctorId: req.params.doctorId,
      status: "Pending"
    });

    res.status(200).json({
      success: true,
      hasPendingAppointments: !!pendingAppointments
    });
  } catch (error) {
    next(error);
  }
};
