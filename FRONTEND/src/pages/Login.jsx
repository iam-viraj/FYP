import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate, Navigate } from "react-router-dom";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!email || !password) {
      toast.error("❌ Please fill all fields!");
      return;
    }

    setIsLoggingIn(true);

    try {
      const { data } = await axios.post(
        "http://localhost:4001/api/v1/user/login",
        { email, password, role: "Patient" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        if (data.user.verified) {
          setSuccess(true);
      toast.success("✅ Login successful! Welcome back!");
          setIsAuthenticated(true);
          
        } else {
          
          
          console.log("not authenticated");
          toast.error("Email not verified!");
          setIsAuthenticated(false);
        }
       
        
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
      toast.error("❌ " + (error.response?.data?.message || "Invalid email or password"));
      setIsAuthenticated(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Only redirect if successfully authenticated
  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="container form-component login-form">
      <h2>Sign In</h2>
      <p>Please Login To Continue</p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat culpa
        voluptas expedita itaque ex, totam ad quod error?
      </p>
      
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          Login successful! Redirecting...
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "error" : ""}
            disabled={isLoggingIn}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? "error" : ""}
            disabled={isLoggingIn}
            required
          />
        </div>

        <div className="form-links">
          <p>Not Registered?{" "}
            <Link to="/register" className="register-link">
              Register Now
            </Link>
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isLoggingIn}
          className={`login-button ${isLoggingIn ? 'loading' : ''}`}
        >
          {isLoggingIn ? (
            <>
              <span className="loading-spinner"></span>
              Logging in...
            </>
          ) : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
