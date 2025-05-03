import axios from "axios";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4001"); // Adjust if needed

export default function Chats() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [patientId, setPatientId] = useState(null); // State to store patient ID
  const chatEndRef = useRef(null);

  // Fetch patient ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4001/api/v1/user/patient/me",
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log(data)
        setPatientId(data.user._id);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        
      } 
    };

    fetchUserData();
  }, []);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:4001/api/v1/user/doctor/getalldoctor");
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.status}`);
        }
        const data = await response.json();
        setDoctors(data.doctors);
        console.log("Fetched doctors:", data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  // Join a doctor and start listening for messages
  useEffect(() => {
    if (patientId && selectedDoctorId) {
      socket.emit("join", patientId, selectedDoctorId); // Patient joins the chat with the selected doctor

      socket.on("receive_message", ({ fromUserId, message }) => {
        setMessages((prev) => ({
          ...prev,
          [fromUserId]: [...(prev[fromUserId] || []), { sender: "Doctor", message }],
        }));
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [patientId, selectedDoctorId]);

  const handleSend = () => {
    if (!newMessage.trim() || !patientId || !selectedDoctorId) return;

    const newMsg = { sender: "You", message: newMessage };
    setMessages((prev) => ({
      ...prev,
      [selectedDoctorId]: [...(prev[selectedDoctorId] || []), newMsg],
    }));

    socket.emit("send_message", {
      fromUserId: patientId, // Sending the patient ID
      toUserId: selectedDoctorId,
      message: newMessage,
    });

    setNewMessage("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        position: "fixed",
        top: "64px", // Push below navbar
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        height: "calc(100vh - 64px)",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          padding: "16px",
          borderRight: "1px solid #e0e0e0",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#4a4a4a" }}>
          Doctors
        </h2>
        {doctors.map((doctor) => (
          <div
            key={doctor._id} // Using doctor ID as the key
            onClick={() => setSelectedDoctorId(doctor._id)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "12px",
              backgroundColor: selectedDoctorId === doctor._id ? "#e3f2fd" : "#ffffff",
              border: "1px solid #ddd",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s, transform 0.2s",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#1976d2",
                display: "block",
              }}
            >
              Dr. {doctor.firstName} {doctor.lastName} {/* Display first and last name */}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#333",
            textAlign: "center",
          }}
        >
          {selectedDoctorId
            ? `Chat with Dr. ${doctors.find((doctor) => doctor._id === selectedDoctorId)?.firstName} ${
                doctors.find((doctor) => doctor._id === selectedDoctorId)?.lastName
              }`
            : "Select a Doctor"}
        </h2>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            gap: "16px",
            marginBottom: "24px",
            paddingRight: "10px",
          }}
        >
          {(messages[selectedDoctorId] || []).map((msg, idx) => (
            <div
              key={idx}
              style={{
                maxWidth: "80%",
                padding: "14px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "You" ? "#dbeafe" : "#f5f5f5",
                border: msg.sender === "You" ? "1px solid #3b82f6" : "1px solid #ccc",
                fontSize: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#777",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                {msg.sender}
              </span>
              <p style={{ margin: 0 }}>{msg.message}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Section */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flexGrow: 1,
              border: "1px solid #ccc",
              borderRadius: "20px",
              padding: "12px 20px",
              fontSize: "14px",
              backgroundColor: "#f9f9f9",
              transition: "all 0.3s",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
