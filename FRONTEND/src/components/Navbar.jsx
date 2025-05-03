import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4001/api/v1/user/patient/logout",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message);
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const navigateTo = useNavigate();

  const goToLogin = () => {
    navigateTo("/login");
  };

  return (
    <>
      <nav
        className={"container"}
        style={{
          position: "fixed",
          top: 0,
          zIndex: 1000,

          backdropFilter: "blur(10px)",
          backdropBrightness: "0.5",
        }}
      >
        <div className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
        </div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/appointment" onClick={() => setShow(!show)}>
                  Book Appointment
                </Link>
                <Link to="/chat" onClick={() => setShow(!show)}>
                   Chats
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() =>
                  toast.info("Please login to book an appointment")
                }
              >
                Book Appointment
              </Link>
            )}
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </Link>
            {isAuthenticated && (
              <Link to={"/profile"} onClick={() => setShow(!show)}>
                Profile
              </Link>
            )}
          </div>
          {isAuthenticated ? (
            <button className="logoutBtn btn" onClick={handleLogout}>
              LOGOUT
            </button>
          ) : (
            <button className="loginBtn btn" onClick={goToLogin}>
              LOGIN
            </button>
          )}
        </div>
        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
