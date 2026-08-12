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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1ITVNQQi1SVyIsIlNULVAtQ01ULVJXIiwiU0QtUC1TQS1SVyIsIlNELVAtSE1TVEQtUiIsIkhNUy1QLVZORC1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtUlNELVJXIiwiSE1TLUFQSS1ETEQtUiIsIk1EQy1BUEktUEFUIiwiU0QtUC1NQlBELVIiLCJTRC1QLUhNU1NQLVIiLCJITVMtUC1JQkQtUlciLCJTRC1BUEktR0QtUiIsIkhNUy1QLVJDQVRELVJXIiwiTURDLUFQSS1TR1AtUlciLCJITVMtUC1QSUQtUlciLCJNREMtUC1BRC1SVyIsIk1EQy1QLUdQUC1SIiwiU1QtUC1OVEYtUiIsIlNULVAtU05PLVJXIiwiU0QtQVBJLVRNLVJXIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUFETUwtUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLVBPTC1SIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1TUk0tUlciLCJNREMtQVBJLUwtUlciLCJTRC1QLUhNU1VDLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJNLVJXIiwiTURDLUFQSS1SREwtUlciLCJNREMtUC1SRUctUlciLCJTRC1BUEktQ04tUiIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtUE8tUlciLCJITVMtUC1SU0hGVC1SVyIsIk1EQy1BUEktUlRTLVIiLCJITVMtUC1HUk4tUlciLCJITVMtQVBJLVVISUQtUiIsIlNELUFQSS1UTS1SIiwiSE1TLVAtQ1RJQS1SVyIsIk1EQy1BUEktQVQtUiIsIlNELVAtSE1TQkQtUlciLCJTRC1QLVJELVJXIiwiU1QtUi1FTVAiLCJTRC1QLUhNU0NTLVIiLCJITVMtUC1QQ0QtUlciLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtVk5ERC1SVyIsIk1EQy1QLVRSQi1SVyIsIkhNUy1QLVBTRy1SVyIsIlNELVAtSE1TR1AtUiIsIk1EQy1QLUdPQS1SVyIsIk1EQy1QLUFTTS1SVyIsIlNELUFQSS1NQlRELVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1NUi1SVyIsIk1EQy1QLUFBVS1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLUdQUkEtUlciLCJNREMtQVBJLVBEQy1SVyIsIlNELVAtSE1TU1MtUlciLCJITVMtUC1SRU5RLVJXIiwiU0QtUC1ITVNQUy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtUkNBVC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiU0QtUC1ITVNHQy1SIiwiU0QtUC1TU1UtUlciLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtREIiLCJITVMtUC1PQ1ItUlciLCJITVMtUC1SQ0xOLVJXIiwiU0QtUC1NSVMtUiIsIlNELVAtSE1TU0QtUiIsIkhNUy1QLVJLSVRELVJXIiwiTURDLVAtR0NQLVIiLCJITVMtUC1HUFItUlciLCJITVMtUC1QSS1SVyIsIlNELVAtU1NVLVIiLCJITVMtUC1STUQtUlciLCJNREMtQVBJLU9HUC1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLVNUQS1SVyIsIlNELVAtVEQtUlciLCJTVC1QLUNNVC1SIiwiU1QtQVBJLUNSRC1SIiwiU1QtUC1ERVMtUiIsIk1EQy1BUEktR0FTLVIiLCJTRC1QLVJHLVJXIiwiR1AtUC1HQ04tUiIsIlNELVAtUE9WLVIiLCJNREMtQVBJLUNEUi1SIiwiSE1TLVAtQkxLRC1SVyIsIlNELUFQSS1NSVMtUlciLCJITVMtUC1TQURNLVJXIiwiU0QtUC1TUy1SVyIsIlNELVAtTUJERi1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLUNDRC1SVyIsIlNELVAtVEUtUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1ITVNQUyIsIk1EQy1BUEktQVQtUlciLCJITVMtUC1JQkUtUlciLCJNREMtUC1QTlAtUlciLCJTRC1BUEktUkItUiIsIk1EQy1QLU9TQi1SVyIsIk1EQy1BUEktQURNLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiTURDLVAtUkVHLVIiLCJITVMtUC1SS0lULVJXIiwiTURDLUFQSS1DR1AtUlciLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLU1SQS1SVyIsIlNELVAtSE1TTEQtUiIsIk1EQy1BUEktTEJOLVIiLCJNREMtUC1HU1AtUiIsIlNELVAtVERFLVJXIiwiSE1TLUFQSS1WTSIsIlNELVAtUEQtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLVBSTC1SVyIsIlNELVAtUE9WLVJXIiwiSE1TLVAtQ0MtUlciLCJNREMtUC1HQVQtUlciLCJITVMtUC1NVC1SVyIsIlNELUFQSS1UVi1SIiwiTURDLVAtR0FQLVIiLCJNREMtQVBJLVRIUi1SIiwiU1QtUi1DRFIiLCJTVC1BUEktQlJELVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtUFNILVJXIiwiTURDLVItQURNIiwiU1QtQVBJLUFNQy1SIiwiSE1TLVAtQkxLLVJXIiwiTURDLVAtU09SLVIiLCJITVMtUC1HUk5SLVJXIiwiU0QtUC1NQlRWLVIiLCJTRC1QLURGLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1QQy1SVyIsIlNULVAtQlJELVIiLCJTVC1QLVRETC1SIiwiU1QtUC1OVEYtUlciLCJNREMtUC1HT1AtUiIsIkhNUy1QLU1STC1SVyIsIlNELVItTFQiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMiw1LDEzNCwxMzUsMTM2LDEwLDE0LDE1LDE2LDI2LDI3LDI4LDI5LDMwLDQ0LDUwLDUxLDUyLDU1LDU4LDU5LDExNCwxMjEsMTIyLDEyNywyMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg2MDExMjM3LCJleHAiOjE3ODYwOTgyMzd9.DNjAvbY8eKD0EXwcSadNnf0bCsX5ukH1h1F2EK8E38oHUQdQHAibX3GFx9RTvhiG6QJD3nr9nsl01smHi_kL-iHrWufxmiAoY5oXHc4anCjNXZgo0nifRFYnCO2QI19NVxmZfBnZYKGAwu4WWy4EtKXv6DADfqOnvjcbwh2i9mvvTgRSRsexeXKc09sa9ddYV0pscXJn58JmfPzzS3cCFnbGn0a36_dfNEb0XomblVTZxh-vPTFsph5oP1ZsPxI6pKbtXKz08K0ES2AWhtRJqAsqf84hJ7QQ_7Z5SSsMqgvCahpHGsAmi5Gwr-o4patpgkME1craJGFwjOvhxuxifA";
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
 console.log("allowedActions",allowedActions)
  if (allowedActions.includes("MDC-R-ADM")) {
    return "Admin";
  } else if (allowedActions.includes("MDC-R-REC")) {
    return "Receptionist";
  } else if (allowedActions.includes("MDC-R-PDC")) {
    return "Pediatrician";
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