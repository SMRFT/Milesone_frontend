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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtU1VNRC1SVyIsIlNELVAtQkEtUlciLCJITVMtUC1QUEQtUlciLCJNREMtUC1QTlAtUiIsIkhNUy1QLUNDU1BTRC1SVyIsIk1EQy1BUEktUEFUIiwiSE1TLVAtQ0NHU1JEX1JXIiwiSE1TLVAtUFNSQkQtUlciLCJITVMtUC1HT1BCTi1SIiwiU0QtUC1MR0UtUlciLCJITVMtUC1QREItUlciLCJTRC1QLUdTUC1SIiwiTURDLVAtR0RUUy1SVyIsIkhNUy1QLVBHU1JELVJXIiwiTURDLVAtQUQtUlciLCJITVMtUC1TT1BCLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1TVkYtUlciLCJITVMtUC1DT1BQLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJTRC1QLUxSQy1SIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1QR1BCVC1SIiwiU0QtQVBJLVRNLVJXIiwiSE1TLVAtUFBELVIiLCJNREMtQVBJLVBBVC1SIiwiSE1TLVAtQURNTC1SVyIsIk1EQy1QLVVBUy1SVyIsIlNELVAtTFBJLVIiLCJITVMtUC1PUy1SVyIsIkhNUy1QLVNVTUUtUlciLCJTRC1QLVVQQi1SVyIsIkhNUy1QLUJMSy1SIiwiSE1TLVAtUFNPUEItUlciLCJNREMtQVBJLVJETC1SVyIsIkhNUy1BUEktRExELVJXIiwiSE1TLVAtUENPUFAtUlciLCJNREMtUC1SRUctUlciLCJTRC1BUEktQ04tUiIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLUNDTy1SVyIsIk1EQy1BUEktUlRTLVIiLCJITVMtUC1QU00tUlciLCJITVMtUC1SQ0FULVIiLCJITVMtUC1QR0FTLVIiLCJITVMtUC1DVElBLVJXIiwiTURDLUFQSS1BVC1SIiwiTURDLVAtVFJCLVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLVAtR0FFLVIiLCJITVMtUC1QQ0NTRF9SVyIsIk1EQy1QLUFTTS1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiTURDLVItUkVDIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtRFJNLVIiLCJITVMtUC1QSVBBLVJXIiwiSE1TLVAtTlNELVJXIiwiTURDLVAtRUYtUlciLCJTRC1BUEktU1MtUlciLCJITVMtUC1DQ0dBSC1SIiwiSE1TLVAtU1VNLVJXIiwiTURDLVAtQ0RFLVJXIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1QRERTLVJXIiwiSE1TLVAtQ0NHUEItUlciLCJITVMtUC1QQVMtUlciLCJITVMtUC1QU0lQLVJXIiwiSE1TLVAtREIiLCJITVMtUC1JQi1SIiwiTURDLVAtUkRFLVJXIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtU1VNQS1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1SLVBIIiwiU0QtUC1TSEYtUlciLCJTRC1BUEktVEQtUiIsIlNELVAtUEYtUlciLCJITVMtUC1QRkItUlciLCJNREMtQVBJLUdBUy1SIiwiSE1TLVAtV1JRLVJXIiwiR1AtUC1HQ04tUiIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1PUFBCLVIiLCJITVMtUC1QT1BTUkJELVJXIiwiU0QtUC1SQi1SVyIsIlNELVAtU1MtUlciLCJNREMtUC1QTlBSLVIiLCJTRC1QLUxCRi1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtU1VNLVIiLCJITVMtUC1QT1BQREItUlciLCJITVMtUC1HTEJVLVIiLCJITVMtUC1DQ0dSQi1SVyIsIkhNUy1QLVNSQkQtUlciLCJTRC1QLUJURC1SVyIsIlNELVAtU0lSLVJXIiwiU0QtUC1HUEItUiIsIkhNUy1QLU9QSCIsIk1EQy1BUEktQVQtUlciLCJNREMtUC1QTlAtUlciLCJTRC1QLVNDLVIiLCJITVMtUC1DQ0dBSC1SVyIsIlNELUFQSS1SQi1SIiwiU0QtUC1QRy1SVyIsIk1EQy1QLUdBRC1SVyIsIk1EQy1QLU9TQi1SVyIsIk1EQy1QLVJFRy1SIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1QU0ItUlciLCJITVMtUC1QR0xCVS1SIiwiU0QtUC1TR0FDLVIiLCJTRC1QLUxDQy1SVyIsIkhNUy1QLVBDQl9SVyIsIlNELVAtQkctUlciLCJITVMtUC1HT1BTLVIiLCJITVMtUC1HUEJULVIiLCJITVMtUC1DRERTLVJXIiwiU0QtUi1TRSIsIlNELVAtR1BELVIiLCJNREMtQVBJLUxCTi1SIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLVBDQi1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLVAtSE1TIiwiTURDLVAtUFRFLVJXIiwiU0QtUC1QT1YtUlciLCJITVMtUC1PUFNSQkQtUlciLCJITVMtUC1HTEJULVIiLCJITVMtUC1QR0VCLVJXIiwiSE1TLVAtR1dMLVIiLCJTRC1QLUxCTi1SIiwiSE1TLVAtUEdFQi1SIiwiSE1TLVAtU09QRS1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiTURDLVAtR0FULVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLVZMLVJXIiwiSE1TLVAtQURNLVJXIiwiU0QtUC1MQkwtUlciLCJITVMtUC1QT1BTUi1SVyIsIk1EQy1QLVNPUi1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtUEhWU0ItUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUNDQ1JCLVJXIiwiU0QtUC1QQi1SVyIsIk1EQy1QLUNBLVJXIiwiSE1TLVAtRExELVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEyOSwzLDEwMSw1LDEwMiwxMCw0Myw0NCwxMTMsMTgsMTksMTE0LDU1LDEyNyw0NSw1MF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA0Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg0NTE3MDg0LCJleHAiOjE3ODQ2MDQwODR9.WIpqVlgwLnCu7ClNM60MA5vcij1QKtQZ2EJq0gjc9r5P60y9d6qPZ5o90XWWzFqD5BWlb3gkY7wgA4iEm2B8hLWF4tEZHXyMQ5l2Ms5wTizM1Uv-NoK4gy879ctxWECLK0rkHjd8nxFUMLyOn4kl75V_QOiK4T5rrrw4qTnBeLxirKuVywk1rY2b8uwVFygM47GTyMl3MzlOYMQs9fEaqav4wi2IiAyFBFcBMLypndg5QtOpIXa5S-o0h6tZDw4npH5ompCBwHrYdpF8wlulWoEpbRK5gLnARxBHHjJDfWn6TF8DKwgxYyJXu03XyZ37FHrVpNkBMdFY045oavz17g";
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
