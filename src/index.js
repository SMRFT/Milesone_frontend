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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEgQi4sIE1TLiwgRE5CLiwiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1ITVNQQi1SVyIsIkhNUy1QLVZJLVIiLCJITVMtUC1JUEUtUlciLCJTVC1QLUNNVC1SVyIsIlNELVAtU0EtUlciLCJTRC1QLUhNU1RELVIiLCJITVMtUC1TVU1ELVJXIiwiSE1TLVAtVlYtUiIsIlNUUi1BUEktVElOLVIiLCJITVMtUC1DVEUtUlciLCJITVMtQVBJLURMRC1SIiwiU0QtUC1NQlBELVIiLCJITVMtUC1DVC1SVyIsIkhNUy1QLUhSSU4tUlciLCJTRC1QLUhNU1NQLVIiLCJTVFItUC1USU5SLVJXIiwiU0QtQVBJLUdELVIiLCJTVC1SLUEiLCJTVFItQVBJLVRSTC1SVyIsIk1EQy1SLVBEQyIsIkhNUy1QLVZWRC1SVyIsIlNUUi1BUEktVFJMLVIiLCJTVC1QLURFUy1SVyIsIk1EQy1BUEktU0dQLVJXIiwiSE1TLVAtTVJJQS1SVyIsIk1EQy1QLUFELVJXIiwiTURDLVAtR1BQLVIiLCJTVC1QLU5URi1SIiwiU1QtUC1TTk8tUlciLCJITVMtUC1YUkFZLVIiLCJTRC1BUEktVE0tUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1SU0hGVCIsIkhNUy1QLVVTR0EtUlciLCJITVMtUC1TVU1FLVJXIiwiTURDLUFQSS1MLVJXIiwiU0QtUC1ITVNVQy1SVyIsIkhNUy1QLVZTRS1SVyIsIlNELUFQSS1DTi1SIiwiSE1TLVAtUkVHLVJXIiwiU0QtQVBJLVRNLVIiLCJITVMtUC1DVElBLVJXIiwiTURDLUFQSS1BVC1SIiwiU1RSLUFQSS1JTC1SIiwiU0QtUC1ITVNCRC1SVyIsIkhNUy1QLVVTR0QtUlciLCJTRC1QLVJELVJXIiwiU0QtUC1ITVNDUy1SIiwiSE1TLVAtSFJJTkUtUiIsIkhNUy1QLVZDQy1SVyIsIkhNUy1QLVZDRS1SVyIsIkhNUy1QLU1SSUQtUlciLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtSUNULVJXIiwiU0QtUC1ITVNHUC1SIiwiTURDLVAtR09BLVJXIiwiU0QtQVBJLU1CVEQtUlciLCJITVMtQVBJLUVNTC1SVyIsIkhNUy1QLVdSIiwiU1RSLVAtVElOUi1SIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLVhSQVlFLVJXIiwiTURDLVAtQUFVLVJXIiwiTURDLUFQSS1QREMtUlciLCJTRC1QLUhNU1NTLVJXIiwiSE1TLVAtU1VNLVJXIiwiU0QtUC1ITVNQUy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiU1QtQVBJLVRSTFItUlciLCJNREMtQVBJLUFHUC1SVyIsIlNELVAtSE1TR0MtUiIsIlNELVAtU1NVLVJXIiwiSE1TLVAtUEREUy1SVyIsIkhNUy1QLUlCLVIiLCJTRC1QLU1JUy1SIiwiU0QtUC1ITVNTRC1SIiwiSE1TLVAtVklOLVJXIiwiSE1TLVAtSU1SSS1SVyIsIkhNUy1QLVNVTUEtUlciLCJNREMtUC1HQ1AtUiIsIkhNUy1QLUlYUkFZLVJXIiwiU0QtUC1TU1UtUiIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtTVJJLVIiLCJTRC1QLVRELVJXIiwiSE1TLVAtVlMtUiIsIlNULVAtQ01ULVIiLCJTVC1QLURFUy1SIiwiU1RSLUFQSS1WTC1SIiwiSE1TLVAtVkNDLVIiLCJITVMtUC1WSUUtUlciLCJTVFItQVBJLVRJTi1SVyIsIkhNUy1QLVVTR0UtUlciLCJTVFItUi1BIiwiSE1TLVAtSVBELVJXIiwiU0QtUC1SRy1SVyIsIlNELVAtUE9WLVIiLCJITVMtUC1YUkFZLVJXIiwiU0QtQVBJLU1JUy1SVyIsIlNELVAtU1MtUlciLCJTRC1QLU1CREYtUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1TVU0tUiIsIlNELVAtVEUtUlciLCJITVMtUC1WQ0QtUlciLCJITVMtUC1DVC1SIiwiU1RSLUFQSS1UUkxSLVIiLCJITVMtUC1WUy1SVyIsIkhNUy1QLVZQUCIsIkhNUy1QLUhSSU4tUiIsIlNULVAtVERMLVJXIiwiSE1TLVAtVlZFLVJXIiwiSE1TLVAtVVNHLVJXIiwiU0QtQVBJLVJCLVIiLCJITVMtUC1NUkktUlciLCJNREMtQVBJLUNHUC1SVyIsIkhNUy1QLUNERFMtUlciLCJITVMtUC1JVVNHLVJXIiwiU0QtUC1ITVNMRC1SIiwiSE1TLVAtVklORS1SVyIsIk1EQy1QLUdTUC1SIiwiU0QtUC1UREUtUlciLCJITVMtUC1IUklOQS1SVyIsIkhNUy1QLUlQLVIiLCJITVMtUC1YUkFZRC1SVyIsIlNELVAtUEQtUlciLCJTVFItUC1JQ1MtUiIsIkhNUy1QLVZWLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtQi1SVyIsIkhNUy1QLUlQLVJXIiwiSE1TLVAtVklOQS1SVyIsIlNELVAtUE9WLVJXIiwiSE1TLVAtSFJJTkQtUlciLCJTVFItQVBJLVZMLVJXIiwiSE1TLVAtVVNHLVIiLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtVkVWIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtSFJJTlAtUlciLCJITVMtUC1DVEQtUlciLCJTRC1BUEktVFYtUiIsIk1EQy1QLUdBUC1SIiwiSE1TLVAtVkktUlciLCJTVC1SLUNEUiIsIlNULUFQSS1CUkQtUlciLCJTRC1QLVNTLVIiLCJITVMtUC1BRE0tUlciLCJTRC1QLU1CVFYtUiIsIlNELVAtREYtUlciLCJITVMtUC1WSUQtUlciLCJITVMtUC1WSU5SLVIiLCJITVMtUC1WU0QtUlciLCJITVMtUC1ITVNJTlMiLCJTVC1QLUJSRC1SIiwiU1QtUC1UREwtUiIsIlNULVAtTlRGLVJXIiwiTURDLVAtR09QLVIiLCJTVFItQVBJLUlMLVJXIiwiSE1TLVAtRExELVJXIiwiU1QtQVBJLUVNUC1SIiwiU0QtUi1MVCJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwzLDUsNDAsNDEsMTAsNDIsMTQwLDE0MSwxNDIsNDYsMTIsMTQzLDE0NCwyMywyNCwyNSwxMjddLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODQ3MDQyODYsImV4cCI6MTc4NDc5MTI4Nn0.H_zf18IVPYqpF5RA3alsco4OWZrnjmosUca3LecYF_PVslTxjGNCVywuf4FF4-mQ65RCseFMFV6CRD8ReMXRWbh24w0D5VulXKkzLWSw4gEvKUvyXrv4luhNS6NVaDelgXTItgF0DPGb8bYHLNfi0pcweNs5eQOxeZdhMOUHuQ1uIYgMmfGRTkwKTkRc4jzxsmOuiQFgcRsWCX3ca0ticiSDRp0o9zaHMG2uOolMCUp3gPsrGgA2SK_0AqioS0LBJ4dpo0CAmjIeOJEVhjADGLcrhP8j0pfKr_Ygj8ZJrPbtFmht71RBkULJzpTyN1PLkz5HXJfHa7cVczfWOsCVkQ";
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
    const devToken = setforlocaldev();
    
    // If no token found or development token changed, use development token
    if (!accessToken || (devToken && accessToken !== devToken)) {
      console.log(
        "🔄 Using or updating to the development token"
      );
      accessToken = devToken;
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
