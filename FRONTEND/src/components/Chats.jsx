import axios from "axios";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4001");

export default function Chats() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/user/patient/me", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setPatientId(data.user._id);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:4001/api/v1/user/doctor/getalldoctor");
        if (!response.ok) throw new Error(`Failed to fetch doctors: ${response.status}`);
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (patientId && selectedDoctorId) {
      socket.emit("join", patientId, selectedDoctorId);

      const fetchMessages = async () => {
        try {
          const res = await axios.get(
            `http://localhost:4001/api/chats/${patientId}/${selectedDoctorId}`,
            { withCredentials: true }
          );
          if (res.data.success) {
            const formatted = res.data.messages.map((msg) => ({
              sender: msg.from === patientId ? "You" : "Doctor",
              message: msg.message,
            }));
            setMessages((prev) => ({
              ...prev,
              [selectedDoctorId]: formatted,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch chat history:", err);
        }
      };
      fetchMessages();

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
      fromUserId: patientId,
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
        top: "90px", // Leave space for navbar
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        height: "calc(100vh - 90px)",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          padding: "16px",
          borderRight: "1px solid #e0e0e0",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "20px", color: "#4a4a4a" }}>
          Doctors
        </h2>
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            onClick={() => setSelectedDoctorId(doctor._id)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "12px",
              backgroundColor: selectedDoctorId === doctor._id ? "#e3f2fd" : "#ffffff",
              border: "1px solid #ddd",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "500", color: "#1976d2" }}>
              Dr. {doctor.firstName} {doctor.lastName}
            </span>
          </div>
        ))}
      </div>

      <div
  style={{
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    height: "100%", // Important
    minHeight: 0,   // Crucial for flex scroll behavior
  }}
>



        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            padding: "16px",
            color: "#333",
            borderBottom: "1px solid #ddd",
            textAlign: "center",
          }}
        >
          {selectedDoctorId
            ? `Chat with Dr. ${doctors.find((d) => d._id === selectedDoctorId)?.firstName} ${
                doctors.find((d) => d._id === selectedDoctorId)?.lastName
              } ${doctors.find((d) => d._id === selectedDoctorId)?.doctorDepartment || ""}`
            : "Select a Doctor"}
        </h2>

    <div
  style={{
    flexGrow: 1,
    overflowY: "auto",
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // Makes overflowY work inside flexbox
    maxHeight: "100%", // Enforce container height
  }}
>
  {(messages[selectedDoctorId] || []).map((msg, idx) => (
   <div
   key={idx}
   style={{
     maxWidth: "80%",
     overflow: "hidden", // Keeps scroll issue fixed
     padding: "14px",
     borderRadius: "12px",
     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
     alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
     backgroundColor: msg.sender === "You" ? "#dbeafe" : "#f5f5f5",
     border: msg.sender === "You" ? "1px solid #3b82f6" : "1px solid #ccc",
     wordBreak: "break-word",
     marginBottom: "12px",
     
     display: "flex",  // Enable flexbox for centering text
     justifyContent: "center", // Horizontally center the text
     alignItems: "center", // Vertically center the text
     textAlign: "center", // Ensure text inside is centered
   }}
 >
   {/* <span style={{ fontSize: "12px", color: "#777", display: "block", marginBottom: "8px" }}>
     {msg.sender}
   </span> */}
   <p style={{ margin: 0, textAlign: "center" }}>{msg.message}</p>
 </div>
 
  ))}
  <div ref={chatEndRef} />
</div>



        {/* Message Input */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "16px",
            borderTop: "1px solid #ddd",
            backgroundColor: "#fafafa",
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
 