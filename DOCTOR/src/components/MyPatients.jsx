import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null); // doctor is null initially

  // Fetch doctor first, then patients
  useEffect(() => {
    const fetchDoctorAndPatients = async () => {
      try {
        // Step 1: Get doctor profile
        const doctorRes = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/me",
          { withCredentials: true }
        );
        const doctorData = doctorRes.data.user; // Assuming doctor is in `user`
        setDoctor(doctorData);

        // Step 2: Get appointments
        const appointmentsRes = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/appointments",
          { withCredentials: true }
        );

        // Step 3: Filter appointments based on doctor's department
        const filteredAppointments = appointmentsRes.data.appointments.filter(
          (appointment) => appointment.department === doctorData.doctorDepartment
        );

        const patientsMap = new Map();

        filteredAppointments.forEach((appointment) => {
          const patientInfo = {
            id: appointment._id,
            accountName: appointment.patientId?.firstName + ' ' + appointment.patientId?.lastName,
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            email: appointment.email,
            phone: appointment.phone,
            dob: appointment.dob || 'Not provided',
            address: appointment.address || 'Not provided',
            createdAt: appointment.createdAt
          };

          if (!patientsMap.has(patientInfo.id)) {
            patientsMap.set(patientInfo.id, patientInfo);
          }
        });

        const uniquePatients = Array.from(patientsMap.values())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPatients(uniquePatients);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndPatients();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h1>My Patients</h1>
      </div>

      <div className="patients-grid">
        {patients.length === 0 ? (
          <div className="no-patients">No patients found</div>
        ) : (
          patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div className="patient-details">
                <div className="patient-header">
                  <div className="name-section">
                    <h3>Patient: <br />{patient.firstName} {patient.lastName}</h3>
                    <p className="account-name">Account Name: {patient.accountName}</p>
                  </div>
                  <span className="account-id">ID: {patient.id}</span>
                </div>
                <div className="patient-info">
                  <div className="info-group">
                    <label>Email:</label>
                    <p>{patient.email}</p>
                  </div>
                  <div className="info-group">
                    <label>Phone:</label>
                    <p>{patient.phone}</p>
                  </div>
                  <div className="info-group">
                    <label>Date of Birth:</label>
                    <p>{typeof patient.dob === 'string' ? patient.dob : 
                       patient.dob instanceof Date ? patient.dob.toLocaleDateString() : 
                       'Not provided'}</p>
                  </div>
                  <div className="info-group">
                    <label>Address:</label>
                    <p>{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPatients;
