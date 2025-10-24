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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJNREMtQVBJLUdBUy1SIiwiU1QtUC1OVEYtUlciLCJNREMtUC1QTlAtUlciLCJTVC1SLUNEUiIsIlNULUFQSS1FTVAtUiIsIk1EQy1BUEktUEFULVIiLCJTVC1QLVNOTy1SVyIsIk1EQy1QLVBOUC1SIiwiU1QtUC1ERVMtUiIsIk1EQy1BUEktUEFUIiwiU1QtUC1CUkQtUiIsIk1EQy1BUEktVEhSLVIiLCJTVC1SLUEiLCJTVC1QLUNNVC1SIiwiU1QtQVBJLUNSRC1SVyIsIlNULVAtQ01ULVJXIiwiTURDLUFQSS1SVFMtUiIsIk1EQy1BUEktTEJOLVIiLCJNREMtQVBJLUNEUi1SIiwiTURDLVAtQVNNLVJXIiwiU1QtUC1OVEYtUiIsIk1EQy1QLVRSQi1SVyIsIk1EQy1QLVJFRy1SVyIsIlNULVAtVERMLVIiLCJNREMtUC1TT1ItUiIsIlNULUFQSS1BTUMtUlciLCJTVC1QLURFUy1SVyIsIk1EQy1QLU9TQi1SVyIsIk1EQy1QLVJFRy1SIiwiU1QtUC1UREwtUlciLCJTVC1BUEktQlJELVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NjEyNzYxNTMsImV4cCI6MTc2MTM2MzE1MywianRpIjoiYjkxOGU5NDQtMDhhYi00Y2FhLThhNmEtOGVjZThkMTkxZjZhIn0.YzRK8_mIwPAlurO0ZX47O68hxV7CJpKTlh4lF_rp7i0KgGG_74jTEQDBw1dsJf8HSeZsMXClT8ArgAcM-9dZqLmBrF3WE4AmsLHND-XG9Vs4-iomUk6__JXrasLt6H82ui9XkIY-E0_VRFWVqK_XZgFrASlxBiAenIuVLdBFEdKrBey45wIZP_6UnZUq_Alq-lvxthSRkClQRE68znH6lG-g_WPJraS07qR_LRy0AFtq7UKZ04H90-cKhLVpri8lVxLUQPD_9NJ7uwcpgtqRGBMEnJ9yn2FcIDIwKtkckyt25_GfiMFbNE21BmDbptzjoQuItBKQxWOqge4_pMUlEA"; // Keep empty to force redirect in development
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
