import React, { useState } from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";
import { useEffect } from "react";

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! Welcome to Dr.Sathi, How can we assist you today?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "http://localhost:4001/api/v1/user/doctor/getalldoctor"
        );
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

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const context = `Dr. Sathi is a healthcare provider that offers a wide range of services, including general medicine, pediatrics, gynecology, and more. We are dedicated to providing high-quality care to our patients. Answer the question in less than 50 words. We have doctors in all fields. Suggest the following doctors if needed: ${doctors
    .map(
      (doctor) =>
        `${doctor.firstName} ${doctor.lastName} (${doctor.doctorDepartment})`
    )
    .join(", ")}.`;

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    const modifiedInput = `${context} ${userInput}`; // Append context to user input

    try {
      // Replace with your Gemini API endpoint and API key
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCfNzQEhg1tjuH_SGsCrPanHlqRUwK92g0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: modifiedInput }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        sender: "Ai Sathi",
        text: data.candidates[0].content.parts[0].text || "No reply received.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, something went wrong. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      <Hero
        title={"Welcome to Dr. Sathi | Your Trusted Healthcare Provider"}
        imageUrl={"/hero.png"}
      />
      <Biography imageUrl={"/about.png"} />
      <Departments />
      <MessageForm />

      {/* Chat Bubble */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={toggleChat}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          💬
        </button>
      </div>

      {/* Chat Overlay */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "400px", // Increased width
            height: "500px", // Increased height
            backgroundColor: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: "15px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Chat with us</span>
            <button
              onClick={toggleChat}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: "15px",
              overflowY: "auto",
              backgroundColor: "#fff",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor:
                      msg.sender === "user" ? "#007bff" : "#e9ecef",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    wordWrap: "break-word",
                  }}
                >
                  <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #ccc",
              backgroundColor: "#f1f1f1",
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              style={{
                width: "calc(100% - 60px)",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginRight: "10px",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
