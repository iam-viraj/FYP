import { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import DoctorDashboard from "./components/DoctorDashboard";
import MyPatients from "./components/MyPatients";
import Profile from "./components/Profile";
import Appointments from "./components/Appointments";
import Chats from "./components/Chats";

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setDoctor } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4001/api/v1/user/doctor/me",
          {
            withCredentials: true,
          }
        );
        setIsAuthenticated(true);
        setDoctor(response.data.user);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
        setIsAuthenticated(false);
        setDoctor({});
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [setDoctor, setIsAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Sidebar />}
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/" element={
          isAuthenticated ? <DoctorDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/patients" element={
          isAuthenticated ? <MyPatients /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          isAuthenticated ? <Profile /> : <Navigate to="/login" />
        } />
        <Route path="/appointments" element={
          isAuthenticated ? <Appointments /> : <Navigate to="/login" />
        } />
        <Route path="/chat" element={
          isAuthenticated ? <Chats/> : <Navigate to="/login" />
        } />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
