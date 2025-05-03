import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all"); // all, today, upcoming, past

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4001/api/v1/appointment/doctor?filter=${filter}`,
          { withCredentials: true }
        );
        setAppointments(data.appointments);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };
    fetchAppointments();
  }, [filter]);

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4001/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      toast.success(data.message);
      
      // Update local state
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId ? {...app, status} : app
        )
      );
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="appointments-container">
      <h2>Appointments</h2>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Time</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
              <td>{appointment.email}</td>
              <td>
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </td>
              <td>
                {appointment.appointment_time || "Not specified"}
              </td>
              <td>{appointment.department}</td>
              <td>
                <select
                  value={appointment.status}
                  onChange={(e) => 
                    updateAppointmentStatus(appointment._id, e.target.value)
                  }
                  className={`status-${appointment.status.toLowerCase()}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                {/* Actions if any */}
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan="7" className="no-appointments">
                No appointments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments; 