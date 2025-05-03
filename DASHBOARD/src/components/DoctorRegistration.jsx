import React, { useState } from 'react';

const DoctorRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    // ... other fields
  });
  const [avatar, setAvatar] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append the file
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      const response = await fetch('http://localhost:4001/api/v1/auth/register/doctor', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header - FormData will set it
      });

      const data = await response.json();
      if (data.success) {
        alert('Registration successful!');
        // Handle successful registration
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      <div>
        <label htmlFor="avatar">Profile Picture</label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default DoctorRegistration; 