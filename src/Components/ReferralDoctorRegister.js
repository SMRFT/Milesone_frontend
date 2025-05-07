import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ReferralDoctorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctorName: "",
    hospitalName: "",
    area: "",
    city: "",
    district: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const snakeCaseData = {
      doctor_name: formData.doctorName,
      hospital_name: formData.hospitalName,
      area: formData.area,
      city: formData.city,
      district: formData.district,
      phone_number: formData.phoneNumber,
    };

    try {
      const response = await fetch(`${Milestonebaseurl}referral-doctor/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snakeCaseData),
      });
      if (response.ok) {
        alert("Referral Doctor registered successfully!");
        setFormData({
          doctorName: "",
          hospitalName: "",
          area: "",
          city: "",
          district: "",
          phoneNumber: "",
        });
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Error in registration.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleBack = () => {
    navigate("/Registration"); // Navigate back
};



  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
    <button
    type="button"
    onClick={handleBack} // Use the new function
    style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        cursor: "pointer",
    }}
>
    Back
</button>


      <h2>Referral Doctor Registration</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>Doctor Name:</label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>Hospital Name:</label>
          <input
            type="text"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>Area:</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>District:</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "150px" }}>Phone Number:</label>
          <input
            type="number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            style={{ flex: "1" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default ReferralDoctorRegister;