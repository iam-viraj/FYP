import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import "../Profile.css";

const Profile = () => {
  const { user, setUser } = useContext(Context);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [passwordError, setPasswordError] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [success, setSuccess] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

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
        
        if (data.success) {
          setUser(data.user);
        } else {
          toast.error("Failed to load user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const { data } = await axios.get(
        "http://localhost:4001/api/v1/user/doctor/appointments",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (data?.success) {
        // Assuming patientId is the ID of the logged-in user
        const filteredAppointments = data.appointments.filter(
          (appointment) => appointment.patientId._id === user._id // filter by the logged-in user's patientId
        );
  
        if (filteredAppointments.length > 0) {
          setAppointments(filteredAppointments); // Update state with filtered appointments
          console.log("Filtered Appointments:", filteredAppointments);
  
          setShowAppointments(true);
        } else {
          toast.info("No appointments found for this user.");
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    } finally {
      setIsLoadingAppointments(false);
    }
  };
  

  const validatePasswords = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };

    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm your new password";
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = "Passwords do not match";
    }

    setPasswordError(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validatePasswords()) {
      toast.error("❌ Please check all password fields!");
      return;
    }

    setIsUpdating(true);

    try {
      const { data } = await axios.put(
        "http://localhost:4001/api/v1/user/patient/updatepassword",
        {
          oldPassword: currentPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        setSuccess(true);
        toast.success("✅ Password updated successfully!");

        // Clear form after short delay
        setTimeout(() => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setError("");
          setPasswordError({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          });
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password");
      toast.error(
        "❌ " + (error.response?.data?.message || "Failed to update password")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="profile-title">My Profile</h1>
        <button
          onClick={fetchAppointments}
          disabled={isLoadingAppointments}
          style={{
            padding: "10px 70px",
            marginBottom: "70px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoadingAppointments ? "not-allowed" : "pointer",
            opacity: isLoadingAppointments ? 0.7 : 1,
          }}
        >
          {isLoadingAppointments ? "Loading..." : "View Appointments"}
        </button>
      </div>

      {isLoadingAppointments && (
        <div className="loading">Loading appointments...</div>
      )}

      {showAppointments && !isLoadingAppointments && (
        <div
          className="profile-card"
          style={{ marginBottom: "20px", marginTop: "32px", height: "500px" }}
        >
          <h2 className="section-title">Your Appointments</h2>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <div
                key={index}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Hello, {appointment?.firstName} {appointment?.lastName}, your
                appointment with Dr.{appointment?.doctorId?.firstName}{" "}
                {appointment?.doctorId?.lastName} is {appointment.status}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointment_date).toLocaleDateString()}
                <br />
                <strong>Time:</strong> {appointment.appointment_time}
                <br />
                <strong>Department:</strong> {appointment.department}
              </div>
            ))
          ) : (
            <p>No appointments found</p>
          )}
        </div>
      )}

      <div className="profile-card">
        <h2 className="section-title">Personal Information</h2>
        <div className="personal-info">
          <div className="info-row">
            <div className="info-group">
              <label>First Name</label>
              <p>{user?.firstName || "N/A"}</p>
            </div>
            <div className="info-group">
              <label>Last Name</label>
              <p>{user?.lastName || "N/A"}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-group">
              <label>Email</label>
              <p>{user?.email || "N/A"}</p>
            </div>
            <div className="info-group">
              <label>Phone</label>
              <p>{user?.phone || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h2 className="section-title">Change Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Password updated successfully!
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={passwordError.currentPassword ? "error" : ""}
              disabled={isUpdating}
            />
            {passwordError.currentPassword && (
              <span className="field-error">
                {passwordError.currentPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={passwordError.newPassword ? "error" : ""}
              disabled={isUpdating}
            />
            {passwordError.newPassword && (
              <span className="field-error">{passwordError.newPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={passwordError.confirmNewPassword ? "error" : ""}
              disabled={isUpdating}
            />
            {passwordError.confirmNewPassword && (
              <span className="field-error">
                {passwordError.confirmNewPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className={`update-button ${isUpdating ? "loading" : ""}`}
          >
            {isUpdating ? (
              <>
                <span className="loading-spinner"></span>
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
