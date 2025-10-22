import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import kidsplayimage from "./Images/5913.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// Styled components
const LoginWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  background-image: url(${kidsplayimage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f2f2f2;
`;
const FormContainer = styled.div`
  flex: 1;
  padding: 2rem;
  backdrop-filter: blur(12px);
  background-color: transparent;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  color: black;
  max-width: 400px;
  margin-left: 900px;
`;
const Label = styled.label`
  color: #28b9e3;
`;
const Title = styled.label`
  color: #28b9e3;
  text-align: center; /* Centers the text */
  display: block; /* Ensures it's treated as a block for centering */
  font-family: "Arial", sans-serif; /* Change this to your desired font */
  font-size: 1.5rem; /* Adjust font size as needed */
  margin-top: 10px; /* Optional: Add spacing above */
`;
const StyledInputContainer = styled.div`
  position: relative;
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
const TogglePasswordIcon = styled.span`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6b728e;
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
const ErrorMessage = styled.p`
  color: #dc3545;
  text-align: center;
`;
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const location = useLocation();
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }
    try {
      const response = await axios.post(`${Milestonebaseurl}login/`, {
        email: email,
        password: password,
      });
      if (response.status === 200) {
        const { name } = response.data;
        localStorage.setItem("name", name);
        navigate("/Registration");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 404)
      ) {
        setError("Invalid credentials or user does not exist.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };
  return (
    <LoginWrapper>
      <FormContainer>
        <Title>Login</Title>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <StyledInput
              type="email"
              id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <StyledInputContainer>
              <StyledInput
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <TogglePasswordIcon onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePasswordIcon>
            </StyledInputContainer>
          </div>
          <center>
            <StyledButton type="submit">Sign in</StyledButton>
          </center>
        </form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div className="mt-3 text-center">
          <p>
            If not registered please,{" "}
            <Link to="/EmployeeRegistration">Register</Link>
          </p>
        </div>
      </FormContainer>
    </LoginWrapper>
  );
};
export default Login;
