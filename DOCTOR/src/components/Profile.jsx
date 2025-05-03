import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Profile = () => {
  const { doctor } = useContext(Context);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "http://localhost:4001/api/v1/user/doctor/updatepassword",
        { oldPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      toast.success(data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        {/* Personal Information Card */}
        <div className="profile-card">
          <h2>Personal Information</h2>
          <div className="profile-info">
            {/* <div className="profile-avatar">
              <img 
                src={doctor.docAvatar?.url || "/default-avatar.png"} 
                alt="profile" 
              />
            </div> */}
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                <p>{doctor.firstName}</p>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <p>{doctor.lastName}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{doctor.email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{doctor.phone}</p>
              </div>
              <div className="info-item">
                <label>Department</label>
                <p>{doctor.doctorDepartment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="profile-card">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="update-password-btn">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 