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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1DRFItUlciLCJNREMtUC1HU1AtUiIsIlNULVAtQ01ULVIiLCJTSU4tUi1BRE0iLCJTRC1BUEktUkItUlciLCJTVC1QLU5URi1SIiwiRVItUC1FUkItUlciLCJTRC1QLUJBLVJXIiwiU1QtQVBJLUVNUC1SIiwiTURDLUFQSS1QQVQtUiIsIlNJTi1QLVJULVJXIiwiU0QtUC1MQkwtUlciLCJFUi1QLUVSUEwtUiIsIkhNUy1QLVZJTlItUiIsIk1EQy1QLUFELVIiLCJTRC1QLVNDLVIiLCJNREMtUC1HQ0JDTC1SVyIsIk1EQy1BUEktUkRMLVJXIiwiTURDLVAtUkVHLVIiLCJTRC1QLVVQQi1SVyIsIk1EQy1QLU9TQi1SVyIsIk1EQy1QLVBOUC1SVyIsIlNJTi1BUEktT1ItUlciLCJNREMtUC1QTlAtUiIsIlNULVAtREVTLVJXIiwiU1QtQVBJLUNSRC1SIiwiU0lOLVAtQ0hFQS1SVyIsIlNULUFQSS1BTUMtUiIsIlNELVAtTFJDLVIiLCJTRC1QLVBGLVJXIiwiU0lOLUFQSS1TRi1SIiwiRVItUC1FUlBCLVJXIiwiTURDLVAtR01DLVJXIiwiU1QtUC1TTk8tUlciLCJTSU4tUC1DSEUtUlciLCJTVC1QLVRETC1SIiwiTURDLUFQSS1BVC1SVyIsIlNJTi1BUEktR0lDLVIiLCJTRC1QLVNTVS1SVyIsIk1EQy1QLUdQUC1SIiwiTURDLUFQSS1BR1AtUlciLCJNREMtUC1QTlBSLVIiLCJTSU4tQVBJLUlGLVJXIiwiU0lOLVAtR0RMLVJXIiwiU0QtUC1CVEQtUlciLCJTRC1QLVNTLVIiLCJTRC1BUEktVEQtUiIsIlNJTi1QLVJUQS1SVyIsIk1EQy1BUEktVEhSLVIiLCJFUi1QLUVSUkVQLVJXIiwiTURDLUFQSS1DR1AtUlciLCJFUi1SLUVSTiIsIk1EQy1QLVNDRC1SVyIsIk1EQy1BUEktUEdQLVJXIiwiU0lOLUFQSS1GVS1SVyIsIk1EQy1SLUFETSIsIk1EQy1QLUdDUC1SIiwiU0QtUC1QQi1SVyIsIkhNUy1QLVZWUCIsIk1EQy1QLUdPUC1SIiwiU0lOLUFQSS1PUlItUiIsIk1EQy1BUEktQ0RSLVIiLCJTVC1QLURFUy1SIiwiU1QtUi1FTVAiLCJNREMtUC1SRUctUlciLCJNREMtUC1TT1ItUiIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1TTUNILVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1QQVQiLCJTRC1BUEktVE0tUlciLCJNREMtQVBJLUxCTi1SIiwiTURDLVAtR0FULVIiLCJTRC1QLUdTUC1SIiwiTURDLUFQSS1HQVMtUiIsIlNELVAtTEJGLVJXIiwiTURDLVAtR0EtUlciLCJTRC1BUEktU1MtUlciLCJTRC1QLVNQLVIiLCJNREMtUC1BQVUtUlciLCJTVC1QLU5URi1SVyIsIlNELVAtQkctUlciLCJNREMtQVBJLVJUUy1SIiwiTURDLUFQSS1TR1AtUlciLCJTRC1QLVJCLVJXIiwiU0QtUC1QT1YtUlciLCJTRC1QLVBHLVJXIiwiRVItUC1FUkdOQk4tUiIsIlNULVAtQlJELVIiLCJTRC1QLUxCTi1SIiwiU0QtUC1MQ0MtUlciLCJTSU4tUC1DRi1SIiwiTURDLUFQSS1BVC1SIiwiU0QtUC1MQkMtUlciLCJTRC1QLUdQRC1SIiwiU0QtUi1TTUMiLCJTVC1QLVRETC1SVyIsIlNELVAtR1BCLVIiLCJNREMtQVBJLVBEQy1SVyIsIkVSLVAtRVJETC1SIiwiTURDLVAtR0FQLVIiLCJTRC1QLVNTLVJXIiwiU0QtUC1MVE0tUlciLCJTVC1BUEktQ1JELVJXIiwiU0QtQVBJLUNOLVJXIiwiU1QtUC1DTVQtUlciLCJNREMtQVBJLUwtUlciLCJNREMtUC1DQkNMLVJXIiwiU1QtUi1IT0QiLCJNREMtUC1HT0EtUlciLCJNREMtUC1UUkItUlciLCJTRC1QLUxHRS1SVyIsIlNULUFQSS1BTUMtUlciLCJTSU4tUC1FTlEtUlciLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1BUEktQURNLVJXIiwiU0QtUC1MUEktUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzQ2XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODY1MzE3NzAsImV4cCI6MTc4NjYxODc3MH0.MXCSgFEmcxWjUZOXj5PALb9Qrxgy4xKT27gU88EStFY-PZ8qBDfZX_iqBS_xbWSkASjMqKHiD4jPo7K2RamILE_oFHh7Hkq7my_n67MfI1OH0U57z_EgUsu5XQah3HUt6vI8Hk5W5ap2AWExwO1IanR6X7J9V6QnKlEerbXCDXp2fbwv-G4TrpIYEzdTFCNrzu3ekWtmXe84uONcZfB_TFB7KG-oMOfF-cHBuFtUh1L7RC7Y7uAcpFG1u8xXr1Ex5Bc_YOARDfw6kj479oinBD8rE0tIgR7qwuWcRZSNhEwRwt2MPY8EdR5BC2c3ZuwSYfDJNybn-H3KEfN1SxNZhg";
  console.log("🔧 Development token is empty - will redirect to login");
  return dev_token;
}
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
  console.log("allowedActions", allowedActions)
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
    const devToken = setforlocaldev();

    // If no token found or development token changed, use development token
    if (!accessToken || (devToken && accessToken !== devToken)) {
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