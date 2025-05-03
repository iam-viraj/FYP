import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Context } from "../main";

const VerifyMail = () => {
  const location = useLocation();
  const [message, setMessage] = useState("Verifying your email...");
  const { setIsAuthenticated } = useContext(Context);
  const hasRequested = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search); // Parse the query string
    const token = queryParams.get("token"); // Extract the token using the correct key
    console.log("Token from URL:", token); // Log the token for debugging

    const verifyEmail = async () => {
      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4001/api/v1/user/verify/${token}`
        );

        if (response.data.success) {
          setMessage(response.data.message || "Email verified successfully.");
          setIsAuthenticated(true);
        } else {
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setMessage("Invalid or expired verification link.");
        } else {
          setMessage(
            "An error occurred during verification. Please try again."
          );
        }
      }
    };

    if (!hasRequested.current) {
      hasRequested.current = true;
      verifyEmail();
    }
  }, [location.search, setIsAuthenticated]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <h1>Email Verification</h1>
      <p>{message}</p>
    </div>
  );
};

export default VerifyMail;
