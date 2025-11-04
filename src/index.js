import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

console.log("=== MILESTONE INDEX.JS DEBUG ===");
console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDA0NyIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiUyBLYXJ0aGljayIsImFsbG93ZWQtYWN0aW9ucyI6WyJTVC1QLUNNVC1SVyIsIlNULVItSE9EIiwiU1QtUC1DTVQtUiIsIk1EQy1BUEktUEFULVIiLCJNREMtUi1BQ1QiLCJTVC1QLUJSRC1SIiwiU1QtUC1UREwtUlciLCJTRC1QLUlOVi1SVyIsIlNULVAtREVTLVJXIiwiTURDLUFQSS1USFItUiIsIlNULVAtREVTLVIiLCJTVC1BUEktRU1QLVIiLCJTVC1QLU5URi1SVyIsIk1EQy1BUEktQVQtUiIsIk1EQy1QLVBOUFItUiIsIk1EQy1BUEktUlRTLVIiLCJTVC1QLVRETC1SIiwiU0QtUC1QUy1SIiwiTURDLVAtU09SLVIiLCJTRC1QLVJCLVJXIiwiU0QtUC1DQi1SVyIsIlNULUFQSS1DUkQtUlciLCJNREMtQVBJLUdBUy1SIiwiU1QtUC1OVEYtUiIsIk1EQy1BUEktQVQtUlciLCJTVC1BUEktQlJELVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNULVAtU05PLVJXIiwiU0QtUC1DVC1SIl0sImFsbG93ZWQtZGF0YSI6WyJbJ1NIQjAwMSddIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzYyMjQwODMzLCJleHAiOjE3NjIzMjc4MzMsImp0aSI6IjkzMDkxMThjLTcxMjMtNGNkMS1hNDIzLTVlZDQwMGQ2ZmJmMiJ9.LioCEGtrCur2I8j9uF-cmNMTOeMyjeFN-bT2eqOeeol7WhGSC1u2Lu0RqpvZpZFW2jGc_znlEYlgPxs9mb3QVknsdiWzhFRCcKKVxGYw4DnVlQR8qNYfXp63Y8gKZ9hP8RHtRFdUwWhkFhiJDt83L4yNVJAHEJhnkqyOldKDL1-HVToThxMapypZYnIiXBzjNUcgaHcyhqGT0-njNQ9KwFZLpZ4qb8ugDo3prArZC71Tqz0aO2BWTrGVBv4edOw6j9oeBFLgTP9aXH8Db9i0AChuVw7vrAt4j13tn8Fi_Kd0gb_0bOIQHZqCStmruU7Y235kc6Zu4-Hi9gvTJsmgXg"; // Keep empty to force redirect in development
  console.log("🔧 Development token is empty - will redirect to login");
  return dev_token;
}

// --- Function to redirect to login ---
function redirectToLogin() {
  if (REDIRECT_URL) {
    console.log("🔄 Redirecting to login URL:", REDIRECT_URL);
    window.location.href = REDIRECT_URL;
  } else {
    console.error("❌ REDIRECT_URL not configured");
    // Even if REDIRECT_URL is not configured, don't show error - just redirect to a fallback
    window.location.href = "https://shinova.in/login";
  }
}

// --- Validate JWT Token Locally ---
function validate(token) {
  if (!token || token.trim() === "") {
    throw new Error("Token is empty");
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// --- Function to determine user role based on allowed-actions ---
function getUserRole(allowedActions) {
  if (!allowedActions || !Array.isArray(allowedActions)) {
    return "Employee"; // Default role
  }

  if (allowedActions.includes("MDC-R-ADM")) {
    return "Admin";
  } else if (allowedActions.includes("MDC-R-REC")) {
    return "Receptionist";
  } else if (allowedActions.includes("MDC-R-DOC")) {
    return "Doctor";
  } else if (allowedActions.includes("MDC-R-ACT")) {
    return "Accounts";
  } else {
    return "Receptionist"; // Default role if none of the specific roles are found
  }
}

// --- Main execution ---
(function main() {
  try {
    console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token"
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    console.log("✅ Token validated successfully");
    console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;
    const userRole = getUserRole(userPayload["allowed-actions"]);

    console.log("Employee ID:", employeeId);
    console.log("Name:", name);
    console.log("Email:", userEmail);
    console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    console.log("Is logged in:", isLoggedIn);

    if (!isLoggedIn) {
      throw new Error(
        "Missing required user data (employeeId or employeeName)"
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("role", userRole);

    console.log("✅ User payload and extracted data stored in localStorage");
    console.log("Stored data:", {
      employeeId,
      name,
      userEmail,
      role: userRole,
    });

    // Token is valid, render app
    console.log("✅ Rendering milestone app...");
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    reportWebVitals();
  } catch (error) {
    console.error("❌ Token validation failed:", error.message);

    // Clean up invalid token
    localStorage.removeItem("access_token");

    // If validation fails, redirect to login instead of showing debug page
    console.log("❌ Redirecting to login due to validation failure");
    redirectToLogin();
  }
})();
