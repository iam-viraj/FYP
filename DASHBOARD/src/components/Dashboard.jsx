import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch doctors since we know this endpoint works
        const doctorsRes = await axios.get(
          "http://localhost:4001/api/v1/user/doctors",
          { withCredentials: true }
        );
        
        // Update appointment endpoint to match backend route
        const appointmentsRes = await axios.get(
          "http://localhost:4001/api/v1/appointment/getall",
          { withCredentials: true }
        );

        // Set doctors count
        if (doctorsRes.data.doctors) {
          setTotalDoctors(doctorsRes.data.doctors.length);
        }

        // Set appointments
        if (appointmentsRes.data.success) {
          setAppointments(appointmentsRes.data.appointments);
          setTotalAppointments(appointmentsRes.data.appointments.length);
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error.response || error);
        toast.error(error.response?.data?.message || "Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4001/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Table rendering section
  const renderAppointmentsTable = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan="6">Loading...</td>
          </tr>
        </tbody>
      );
    }

    if (!appointments.length) {
      return (
        <tbody>
          <tr>
            <td colSpan="6">No Appointments Found!</td>
          </tr>
        </tbody>
      );
    }

    // Sort appointments by date in descending order
    const sortedAppointments = [...appointments].sort((a, b) => {
      return new Date(b.appointment_date) - new Date(a.appointment_date);
    });

    return (
      <tbody>
        {sortedAppointments.map((appointment) => (
          <tr key={appointment._id}>
            <td>{appointment.firstName} {appointment.lastName}</td>
            <td>{appointment.email}</td>
            <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
            <td>{appointment.appointment_time}</td>
            <td>{appointment.department}</td>
            <td>
              <select
                value={appointment.status}
                onChange={(e) => handleUpdateStatus(appointment._id, e.target.value)}
                className={`status-${appointment.status.toLowerCase()}`}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <>
      <section className="dashboard page">
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="docImg" />
            <div className="content">
              <div>
                <p>Hello ,</p>
                <h5>
                  {admin &&
                    `${admin.firstName} ${admin.lastName}`}{" "}
                </h5>
              </div>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Facilis, nam molestias. Eaque molestiae ipsam commodi neque.
                Assumenda repellendus necessitatibus itaque.
              </p>
            </div>
          </div>
          <div className="secondBox">
            <p>Total Appointments</p>
            <h3>{totalAppointments}</h3>
          </div>
          <div className="thirdBox">
            <p>Registered Doctors</p>
            <h3>{totalDoctors}</h3>
          </div>
        </div>
        <div className="banner">
          <h5>Appointments</h5>
          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              {renderAppointmentsTable()}
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
