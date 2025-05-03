import axios from "axios";
import React, { useEffect } from "react";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
// import "../AppointmentForm.css";

const AppointmentForm = () => {
  const { isAuthenticated, user } = useContext(Context);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [timeSlots, setTimeSlots] = useState([
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
  ]);
  const [formErrors, setFormErrors] = useState({
    gender: "",
    appointmentDate: "",
    appointmentTime: "",
    department: "",
    doctorFirstName: "",
    doctorLastName: "",
    address: "",
  });

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
    "General",
  ];

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4001/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, [isAuthenticated, navigate]);

  const fetchAvailableTimeSlots = async (date, doctorId) => {
    if (!date || !doctorId) return;

    try {
      const { data } = await axios.get(
        `http://localhost:4001/api/v1/appointment/doctor-slots`,
        {
          params: {
            date,
            doctorId,
          },
          withCredentials: true,
        }
      );

      // Update booked slots from response
      setBookedSlots(data.bookedSlots || []);

      // Keep the time slots array but mark booked ones as disabled
      setTimeSlots([
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
      ]);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast.error("Ensure that the time slot is available");
    }
  };

  const handleTimeSlotChange = async (e) => {
    const newTime = e.target.value;
    setAppointmentTime(newTime);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!appointmentTime) {
      toast.error("Please select an appointment time");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:4001/api/v1/appointment/post",
        {
          firstName,
          lastName,
          email: user.email,
          phone,
          anotherPhone: phone,
          dob: new Date(dob).toISOString().split("T")[0],
          gender,
          appointment_date: new Date(appointmentDate)
            .toISOString()
            .split("T")[0],
          appointment_time: appointmentTime,
          department,
          doctor_firstName: doctorFirstName,
          doctor_lastName: doctorLastName,
          hasVisited: hasVisited || false,
          address,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        toast.success("✅ Appointment booked successfully!");

        // Reset form
        setFirstName("");
        setLastName("");
        setPhone("");
        setDob("");
        setGender("");
        setAppointmentDate("");
        setDepartment("Pediatrics");
        setDoctorFirstName("");
        setDoctorLastName("");
        setAddress("");
        setHasVisited(false);
        setAppointmentTime("");
      }
    } catch (error) {
      console.error("Appointment error:", error.response?.data || error);
      toast.error(
        "❌ " +
          (error.response?.data?.message ||
            "Failed to book appointment. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4001/api/v1/appointment/patient/appointments",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        setAppointments(data.appointments);
        setShowAppointments(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  };

  return (
    <div className="container form-component">
      <h2>Book Appointment</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled={true}
            className="disabled-input"
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Another Number"
            value={nic}
            onChange={(e) => setNic(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className="form-group">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={formErrors.gender ? "error" : ""}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {formErrors.gender && (
            <span className="error-message">{formErrors.gender}</span>
          )}
        </div>
        <div className="form-group">
          <input
            type="date"
            placeholder="Appointment Date"
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              if (doctorFirstName && doctorLastName) {
                fetchAvailableTimeSlots(e.target.value, selectedDoctorId);
              }
            }}
            min={new Date().toISOString().split("T")[0]}
            className={formErrors.appointmentDate ? "error" : ""}
          />
          {formErrors.appointmentDate && (
            <span className="error-message">{formErrors.appointmentDate}</span>
          )}
        </div>
        <div className="form-group">
          <select
            value={appointmentTime}
            onChange={(e) => {
              if (!appointmentDate) {
                toast.error("Please select appointment date first");
                return;
              }

              if (!selectedDoctorId) {
                toast.error("Please select a doctor first");
                return;
              }

              handleTimeSlotChange(e);
            }}
            disabled={!appointmentDate || !selectedDoctorId}
            required
            className={`time-slot-select ${
              formErrors.appointmentTime ? "error" : ""
            }`}
          >
            <option value="">Select Time Slot</option>
            {timeSlots.map((slot) => (
              <option
                key={slot}
                value={slot}
                disabled={bookedSlots.includes(slot)}
              >
                {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
              </option>
            ))}
          </select>
          {!appointmentDate && (
            <span className="helper-text">Please select a date first</span>
          )}
          {!selectedDoctorId && (
            <span className="helper-text">Please select a doctor first</span>
          )}
          {formErrors.appointmentTime && (
            <span className="error-message">{formErrors.appointmentTime}</span>
          )}
        </div>
        <div className="form-group">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctorFirstName("");
              setDoctorLastName("");
            }}
            className={formErrors.department ? "error" : ""}
          >
            <option value="">Select Department</option>
            {departmentsArray.map((depart, index) => {
              return (
                <option value={depart} key={index}>
                  {depart}
                </option>
              );
            })}
          </select>
          {formErrors.department && (
            <span className="error-message">{formErrors.department}</span>
          )}
        </div>
        <div className="form-group">
          <select
            value={`${doctorFirstName} ${doctorLastName}`}
            onChange={(e) => {
              const selectedDoc = doctors.find(
                (doc) => `${doc.firstName} ${doc.lastName}` === e.target.value
              );
              if (selectedDoc) {
                setDoctorFirstName(selectedDoc.firstName);
                setDoctorLastName(selectedDoc.lastName);
                setSelectedDoctorId(selectedDoc._id);

                if (appointmentDate) {
                  fetchAvailableTimeSlots(appointmentDate, selectedDoc._id);
                }
              }
            }}
            disabled={!department}
            className={
              formErrors.doctorFirstName || formErrors.doctorLastName
                ? "error"
                : ""
            }
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((doctor) => doctor.doctorDepartment === department)
              .map((doctor, index) => (
                <option
                  value={`${doctor.firstName} ${doctor.lastName}`}
                  key={index}
                >
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
          </select>
          {formErrors.doctorFirstName && (
            <span className="error-message">{formErrors.doctorFirstName}</span>
          )}
          {formErrors.doctorLastName && (
            <span className="error-message">{formErrors.doctorLastName}</span>
          )}
        </div>
        <textarea
          rows="10"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className={formErrors.address ? "error" : ""}
        />
        {formErrors.address && (
          <span className="error-message">{formErrors.address}</span>
        )}
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
