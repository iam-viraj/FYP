import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AddNewAdmin = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");

  const navigateTo = useNavigate();

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();

    try {
      const formattedDob = new Date(dob).toISOString();

      const adminData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone,
        password: password,
        dob: formattedDob,
        gender: gender,
        role: "Admin",
        ...(nic && { anotherPhone: nic })
      };

      console.log("Sending admin data:", adminData);

      const response = await axios.post(
        "http://localhost:4001/api/v1/user/admin/addnew",
        adminData,
        {
          withCredentials: true,
          headers: { 
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setIsAuthenticated(true);
        navigateTo("/");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setNic("");
        setDob("");
        setGender("");
        setPassword("");
      }
    } catch (error) {
      console.error("Full error:", error);
      const errorMessage = error.response?.data?.message || "Failed to add admin";
      if (Array.isArray(errorMessage)) {
        errorMessage.forEach(msg => toast.error(msg));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img 
          src="/logo.png" 
          alt="logo" 
          className="logo"
        />
        <h1 className="form-title">Register New Admin</h1>
        <form onSubmit={handleAddNewAdmin}>
          <div className="first-wrapper">
            <div className="form-group">
              <h3>Admin Information</h3>
              <p>Fill in the details to register a new admin</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => {
                  if (e.target.value.length <= 10) {
                    setPhone(e.target.value);
                  }
                }}
                required
                pattern="\d{10}"
              />
              <input
                type="number"
                placeholder="Alternative Number"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => {
                  console.log("Selected date:", e.target.value);
                  setDob(e.target.value);
                }}
                required
              />
              <select
                value={gender}
                onChange={(e) => {
                  console.log("Selected gender:", e.target.value);
                  setGender(e.target.value);
                }}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="password"
                placeholder="Set Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Register New Admin</button>
            </div>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewAdmin;
