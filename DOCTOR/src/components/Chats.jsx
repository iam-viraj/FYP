import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4001");

export default function DoctorChats() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null); // Track selected patient
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchDoctorAndPatients = async () => {
      try {
        // Step 1: Get doctor profile
        const doctorRes = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/me",
          { withCredentials: true }
        );
        const doctorData = doctorRes.data.user; // Assuming doctor is in `user`
        setDoctor(doctorData._id);
        console.log("doctor::", doctorData._id);

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
            id: appointment.patientId._id, // Patient ID
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

        const uniquePatients = Array.from(patientsMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPatients(uniquePatients);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDoctorAndPatients();
  }, []);

  // Join the socket room when the component mounts or when a new patient is selected
  useEffect(() => {
    if (doctor && selectedPatient) {
      // Emit 'join' event for the doctor and selected patient
      socket.emit("join", doctor, selectedPatient.id);

      // Listen for incoming messages from the selected patient
      socket.on("receive_message", ({ fromUserId, message }) => {
        console.log("Message received:", message); // Log received message
        setMessages((prev) => ({
          ...prev,
          [fromUserId]: [...(prev[fromUserId] || []), { sender: "Patient", message }],
        }));
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [doctor, selectedPatient]);

  // Send message to the selected patient
  const handleSend = () => {
    if (!newMessage.trim() || !selectedPatient) return;

    const newMsg = { sender: "You", message: newMessage };
    setMessages((prev) => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMsg],
    }));

    // Emit 'send_message' event with the message
    socket.emit("send_message", {
      fromUserId: doctor,
      toUserId: selectedPatient.id,
      message: newMessage,
    });

    setNewMessage("");
  };

  // Scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", color: "black" }}>
      {/* Sidebar */}
      <div style={{ width: "150px", backgroundColor: "#f3f3f3", padding: "16px", borderRight: "1px solid #ccc" , marginLeft:"304px"}}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Patients</h2>
        {patients.length === 0 ? (
          <p>No patients available</p>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)} // Set selected patient
              style={{
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "8px",
                backgroundColor: selectedPatient?.id === patient.id ? "#3b82f6" : "#bfdbfe",
                border: "1px solid #ddd",
              }}
            >
              {patient.accountName}
            </div>
          ))
        )}
      </div>

      {/* Chat Section */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
          Chat with {selectedPatient ? selectedPatient.accountName : "Select a patient"}
        </h2>
        {selectedPatient ? (
          <>
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {(messages[selectedPatient.id] || []).map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    maxWidth: "75%",
                    padding: "12px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "You" ? "#dbeafe" : "#f0f0f0",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#6b7280", display: "block" }}>
                    {msg.sender}:
                  </span>
                  <p style={{ margin: 0 }}>{msg.message}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flexGrow: 1,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px 12px",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Please select a patient to chat with.</p>
        )}
      </div>
    </div>
  );
}
