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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLVAtT1NCLVJXIiwiRVItUC1FUlBMLVIiLCJNREMtUC1SRUctUiIsIk1EQy1BUEktQUdQLVJXIiwiU1QtQVBJLUFNQy1SVyIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtR09QQk4tUiIsIk1EQy1BUEktUlRTLVIiLCJNREMtUC1BU00tUlciLCJNREMtUC1QTlAtUlciLCJNREMtUC1HQVAtUiIsIlNULUFQSS1FTVAtUiIsIlNULUFQSS1CUkQtUlciLCJFUi1QLUVSR05CTi1SIiwiTURDLUFQSS1BRE0tUlciLCJNREMtUC1TT1ItUiIsIk1EQy1BUEktVEhSLVIiLCJITVMtUC1HT1BTLVIiLCJTRC1QLVBIUi1SVyIsIlNELVAtR1BULVJXIiwiU1QtUC1ERVMtUlciLCJFUi1QLUVSREwtUiIsIk1EQy1BUEktQ0dQLVJXIiwiSE1TLVAtQ1MtUlciLCJTRC1QLVBPVi1SVyIsIkVSLVAtRVJCLVJXIiwiTURDLUFQSS1QREMtUlciLCJTVC1QLVRETC1SVyIsIkhNUy1QLUdQQlQtUiIsIkhNUy1QLVZMLVJXIiwiTURDLUFQSS1DRFItUiIsIkdQLVAtR0NOLVIiLCJNREMtQVBJLUFULVIiLCJFUi1SLUVSTiIsIlNELVItUEgiLCJTRC1QLVBIRC1SVyIsIkhNUy1SLVBIIiwiU0lOLUFQSS1GVS1SVyIsIk1EQy1BUEktTEJOLVIiLCJNREMtUC1UUkItUlciLCJTVC1QLU5URi1SVyIsIlNULVAtU05PLVJXIiwiU0lOLVAtR0lDLVIiLCJFUi1QLUVSUkVQLVJXIiwiTURDLVAtUE5QUi1SIiwiU0lOLUFQSS1PUi1SVyIsIlNJTi1BUEktU0YtUiIsIk1EQy1BUEktR0FTLVIiLCJTSU4tQVBJLU9SUi1SIiwiTURDLUFQSS1TR1AtUlciLCJTVC1QLUNNVC1SVyIsIlNULUFQSS1DUkQtUlciLCJNREMtUC1HUFAtUiIsIlNELUFQSS1UTS1SVyIsIkhNUy1QLVNPUEItUlciLCJNREMtQVBJLVBBVC1SIiwiTURDLVAtR09QLVIiLCJTVC1SLUhPRCIsIk1EQy1BUEktUEdQLVJXIiwiU1QtUC1OVEYtUiIsIk1EQy1BUEktUkRMLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1SLUFETSIsIkVSLVAtRVJQQi1SVyIsIlNULVAtVERMLVIiLCJNREMtUC1BQVUtUlciLCJTVC1QLUNNVC1SIiwiU0lOLVItQURNIiwiTURDLUFQSS1BVC1SVyIsIlNJTi1BUEktSUYtUlciLCJTVC1QLUJSRC1SIiwiSE1TLVAtSFNOLVJXIiwiTURDLVAtUE5QLVIiLCJNREMtUC1HQ1AtUiIsIk1EQy1QLVJFRy1SVyIsIk1EQy1BUEktUEFUIiwiTURDLVAtR1NQLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MTM5OTA5NSwiZXhwIjoxNzcxNDg2MDk1LCJqdGkiOiI3Yzk2ZmUyMi05MWJlLTQ3YTgtODIyOC0wMzU0MTRlNWMwMzAifQ.BTTcxrnK58lGhfUJwceOXZJB2MnzUhrEVjPAp02fgKO8kDY3d6ty9uhDxoPKX4jVHLFtycx_G4Gc_pzF_Sek98IEnFn_Y6w7UADi3PlapOV8AzLCWoGqS2VV4B3SVkIw1xkkq-8SSeuHtGwDwj2hTyF8k7ieAta98mWC_HjhejA5h3wt_2OE6NDO0vy2wChLST35s3pmJ0UJ6Q_E7NZMp7TnahVx-vwvENfRtAh_FU8Z-BaePQ_h7Ynk6m8M1pIP1e168D3ycIpLdVdvsmWVlZ8TLLs5bFOt8IXUczks5b5Z_TikzRBnJ5TAy-BhW2i2kf6JxgO0LhnZWLLLbUjE0A";
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
