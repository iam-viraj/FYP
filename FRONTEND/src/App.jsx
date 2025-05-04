import { useContext, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Register from "./Pages/Register";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import VerifyMail from "./pages/VerifyMail";
import Chats from "./components/Chats";

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4001/api/v1/user/patient/me",
          {
            withCredentials: true,
          }
        );
        if (response.data.user.verified) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          setIsAuthenticated(false);
          setUser({});
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [setIsAuthenticated, setUser]);

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/appointment"
            element={
              isAuthenticated ? <Appointment /> : <Navigate to="/login" />
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verifyemail" element={<VerifyMail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chats />} />
          
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
       
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
