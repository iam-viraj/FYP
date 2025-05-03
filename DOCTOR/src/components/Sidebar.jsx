import { useContext, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Context } from "../main";
import { toast } from "react-toastify";
import axios from "axios";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { FaUserInjured } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaMessage } from "react-icons/fa6";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const { setIsAuthenticated, doctor } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4001/api/v1/user/doctor/logout",
        { withCredentials: true }
      );
      toast.success(data.message);
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img src="/logo.png" alt="Dr. Sathi" className="logo" />
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <TiHome /> Dashboard
        </NavLink>
        
        <NavLink to="/patients" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FaUserInjured /> My Patients
        </NavLink>
        
        <NavLink to="/chat" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FaMessage /> Chats
        </NavLink>
        
        <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link profile" : "nav-link"}>
          <CgProfile /> Profile
        </NavLink>
      </div>  
      
      <div className="logout-link" onClick={handleLogout}>
        <RiLogoutBoxFill /> Logout
      </div>
    </div>
  );
};

export default Sidebar; 