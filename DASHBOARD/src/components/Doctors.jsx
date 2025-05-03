import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4001/api/v1/user/doctors",
        { withCredentials: true }
      );
      setDoctors(data.doctors);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDeleteDoctor = async (doctorId, doctorName) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctorName}?`)) {
      try {
        const { data } = await axios.delete(
          `http://localhost:4001/api/v1/user/admin/doctor/delete/${doctorId}`,
          { withCredentials: true }
        );

        if (data.success) {
          toast.success(data.message);
          fetchDoctors();
        }
      } catch (error) {
        console.error("Delete error details:", error.response?.data);
        
        const errorMessage = error.response?.data?.message || "Failed to delete doctor";
        toast.error(errorMessage);
        
        if (errorMessage.includes("pending")) {
          toast.info("Please handle all pending appointments before deleting the doctor", {
            autoClose: 5000
          });
        }
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((element) => {
            return (
              <div className="card" key={element._id}>
                <div className="avatar-container">
                  <img
                    src={element.docAvatar || "/doc.png"}
                    alt={`Dr. ${element.firstName} ${element.lastName}`}
                    className="doctor-avatar"
                    onError={(e) => {
                      e.target.src = "/doc.png";
                    }}
                  />
                </div>
                <h4>{`${element.firstName} ${element.lastName}`}</h4>
                <div className="details">
                  <p>
                    Email: <span>{element.email}</span>
                  </p>
                  <p>
                    Phone: <span>{element.phone}</span>
                  </p>
                  <p>
                    DOB: <span>{element.dob.substring(0, 10)}</span>
                  </p>
                  <p>
                    Department: <span>{element.doctorDepartment}</span>
                  </p>
                  <p>
                    Gender: <span>{element.gender}</span>
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDoctor(element._id, `${element.firstName} ${element.lastName}`)}
                  >
                    <FaTrash /> Delete Doctor
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>
    </section>
  );
};

export default Doctors;
