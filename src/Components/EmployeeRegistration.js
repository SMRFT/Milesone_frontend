import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import kidsregister from "./Images/Emp.jpg";

// Background wrapper for the Employee Registration page
const RegistrationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url(${kidsregister});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f2f2f2;
`;

// Form container with similar styling as Login.js
const FormContainer = styled.div`
  flex: 1;
  padding: 2rem;
  backdrop-filter: blur(12px);
  background-color: transparent;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  color: black;
  max-width: 500px;
  margin: auto;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: white;
`;

const Label = styled.label`
  color: black;
`;

const StyledInput = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 5px;
  width: 100%;
  font-size: 1rem;
  background-color: white;
  color: #333;

  &:focus {
    outline: none;
    background-color: #f0f0f0;
  }
`;

const StyledSelect = styled.select`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 5px;
  width: 100%;
  font-size: 1rem;
  background-color: white;
  color: #333;

  &:focus {
    outline: none;
    background-color: #f0f0f0;
  }
`;

const StyledButton = styled.button`
  background-color: #6b728e;
  color: white;
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: #697565;
  }
`;

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    empid: "",
    name: "",
    role: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const roles = [
    "Receptionist",
    "Psychological Assessments",
    "Speech Assessments",
    "OT Assessments",
    "PhysioTherapy Assessments",
    "Consulting Services",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmpassword) {
      setMessage({ type: "danger", text: "Passwords do not match!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return;
    }

    try {
      const response = await axios.post(
        `${Milestonebaseurl}employeeregistration/`,
        formData
      );
      setMessage({ type: "success", text: response.data.message || "Registration successful!" });
      setFormData({
        empid: "",
        name: "",
        role: "",
        email: "",
        password: "",
        confirmpassword: "",
      });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Failed to register employee. Please try again.",
      });
    }

    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  return (
    <RegistrationWrapper>
      <FormContainer>
        <Title>Employee Registration</Title>

        {message.text && (
          <div className={`alert alert-${message.type} text-center`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <Label htmlFor="empid">Employee ID</Label>
            <StyledInput
              type="text"
              id="empid"
              name="empid"
              value={formData.empid}
              onChange={handleChange}
              required
              autoComplete="new-password" // Prevent autofill
            />
          </div>
          <div className="form-group">
            <Label htmlFor="name">Name</Label>
            <StyledInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="new-password" // Prevent autofill
            />
          </div>
          <div className="form-group">
            <Label htmlFor="role">Role</Label>
            <StyledSelect
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </StyledSelect>
          </div>
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <StyledInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="new-password" // Prevent autofill
            />
          </div>
          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <StyledInput
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password" // Prevent autofill
            />
          </div>
          <div className="form-group">
            <Label htmlFor="confirmpassword">Confirm Password</Label>
            <StyledInput
              type={showPassword ? "text" : "password"}
              id="confirmpassword"
              name="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              required
              autoComplete="new-password" // Prevent autofill
            />
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              id="showPassword"
              onChange={() => setShowPassword(!showPassword)}
              className="form-check-input"
            />
            <Label htmlFor="showPassword">Show Password</Label>
          </div>
          <StyledButton type="submit">Register</StyledButton>
        </form>
      </FormContainer>
    </RegistrationWrapper>
  );
};

export default EmployeeRegistration;
