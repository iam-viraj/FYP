import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Context } from "../main";
import { toast } from "react-toastify";

const DoctorDashboard = () => {
  const { doctor } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [profileImage, setProfileImage] = useState(doctor?.docAvatar || "/doc.png");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/appointments",
          { withCredentials: true }
        );
        setAppointments(data.appointments);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch appointments");
      }
    };

    const fetchDoctorProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/me",
          { withCredentials: true }
        );
        
        // Debug log to see the structure
        console.log("Received data:", data);
        
        // Check if data.user exists (based on your backend response)
        if (data.user && data.user.docAvatar) {
          setProfileImage(data.user.docAvatar);
        } else {
          setProfileImage("/doc.png");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile image");
        setProfileImage("/doc.png");
      }
    };

    fetchAppointments();
    fetchDoctorProfile();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:4001/api/v1/appointment/update/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      // Update local state
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId ? {...app, status: newStatus} : app
        )
      );
      
      toast.success("Appointment status updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="doctor-info">
            <img 
              src={profileImage} 
              alt="doctor profile" 
              className="doctor-avatar"
              onError={(e) => {
                e.target.src = "/doc.png";
              }}
            />
            <div className="welcome-text">
              <h1>Hello Dr. {doctor?.firstName} {doctor?.lastName},</h1>
              <p>Welcome to your dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="appointments-section">
        <div className="appointments-table">
          <h2>Appointments</h2>
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {doctor && appointments.filter((appointment) => appointment.department === doctor.doctorDepartment).length === 0 ? (
  <tr>
    <td colSpan="5" className="no-appointments">
      No Appointments Found!
    </td>
  </tr>
) : (
  doctor && appointments
    .filter((appointment) => appointment.department === doctor.doctorDepartment)
    .map((appointment) => (
      <tr key={appointment._id}>
        <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
        <td>{appointment.email}</td>
        <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
        <td>{appointment.department}</td>
        <td>
          <select 
            value={appointment.status}
            onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
            className={`status-select ${appointment.status.toLowerCase()}`}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </td>
      </tr>
    ))
)}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 