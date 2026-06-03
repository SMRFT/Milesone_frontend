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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNJTi1BUEktU0YtUiIsIlNELVAtTFRBLVJXIiwiTURDLVAtR1NQLVIiLCJTRC1QLVJHLVJXIiwiU0QtUC1SRC1SVyIsIk1EQy1QLUdBUC1SIiwiU0QtUC1TU1UtUlciLCJITVMtUC1PVEFNIiwiSE1TLVAtVkktUlciLCJTSU4tQVBJLUlGLVJXIiwiSE1TLVAtQURBU0giLCJITVMtUC1QQUNLIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtVklOUi1SVyIsIk1EQy1BUEktQ0RSLVJXIiwiSE1TLVAtQkxLIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtUkVOUSIsIlNELVAtU1ZGLVJXIiwiU0QtUC1CRy1SIiwiU0lOLVAtR0RMLVJXIiwiU0QtUC1DSEMtUlciLCJTVC1QLVRETC1SIiwiU0QtUC1NQlRWLVIiLCJTVC1QLURFUy1SIiwiSE1TLVAtSUItUlciLCJTRC1QLU1JUy1SIiwiSE1TLVAtVklOQS1SVyIsIlNULVItQSIsIlNULVAtQlJELVIiLCJITVMtUC1WSUUtUlciLCJITVMtUC1WSU5SIiwiSE1TLVAtR1JOIiwiU0QtUC1TQy1SVyIsIlNJTi1QLUdJQy1SIiwiU0QtUC1TQS1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtVklOLVIiLCJITVMtUC1PVFNTIiwiU0QtUC1QTy1SVyIsIlNULVAtQ01ULVJXIiwiTURDLUFQSS1QREMtUlciLCJTSU4tUC1DRi1SIiwiSE1TLVAtT1BIIiwiSE1TLVAtUkJJTEwiLCJFUi1QLUVSQVMtUlciLCJITVMtUC1WSU5FLVJXIiwiU0QtUC1ERi1SVyIsIkhNUy1QLVJFRy1SVyIsIlNELVAtUkVHLVJXIiwiU0QtUC1NQlBELVIiLCJITVMtUC1PVE0iLCJTRC1QLUxELVJXIiwiU1QtUC1OVEYtUiIsIlNELVAtU1MtUlciLCJTSU4tUi1BRE0iLCJITVMtUC1ITVNJTlMiLCJITVMtUC1TSU5URU5UIiwiSE1TLUFQSS1JTVJJIiwiSE1TLVAtSU5BIiwiU0QtUC1UUy1SVyIsIk1EQy1BUEktU0dQLVJXIiwiU0QtUC1DTi1SVyIsIkhNUy1BUEktSVhSQVkiLCJHTC1QLUVQTS1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1BUEktVk0iLCJITVMtUC1TR1JOIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1SU0hGVCIsIkhNUy1QLURCIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1QLVZJTi1SVyIsIlNELVAtQ1QtUlciLCJITVMtQVBJLUlVU0ctUlciLCJTVC1QLVRETC1SVyIsIlNELUFQSS1NQlRELVIiLCJITVMtUC1JVCIsIkhNUy1BUEktSUIiLCJTVC1QLURFUy1SVyIsIk1EQy1QLUFBVS1SVyIsIkhNUy1QLUFJTi1SVyIsIk1EQy1QLUdQUC1SIiwiSE1TLVAtVklELVJXIiwiTURDLUFQSS1BVC1SIiwiU1QtQVBJLUFNQy1SVyIsIlNELVAtTEEtUlciLCJITVMtUC1CVCIsIkhNUy1QLUJVRCIsIk1EQy1QLUdPUC1SIiwiU0QtUC1SQi1SVyIsIlNELVAtU1ZSTy1SVyIsIlNJTi1BUEktT1ItUlciLCJTSU4tQVBJLU9SUi1SIiwiU0QtQVBJLU1JUy1SVyIsIlNELVAtR1BELVIiLCJNREMtQVBJLUNHUC1SVyIsIlNULVAtU05PLVJXIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLVZWLVJXIiwiU0QtUC1CRy1SVyIsIkhNUy1QLVNSTSIsIkhNUy1QLVdSIiwiSE1TLUFQSS1JVVNHIiwiU0QtUC1SQS1SVyIsIkhNUy1QLUdSTkEiLCJITVMtQVBJLUlNUkktUlciLCJITVMtUC1ITVMiLCJITVMtUC1TSURFQkFSIiwiU0QtUC1DQi1SVyIsIlNELUFQSS1SQi1SIiwiU0QtUi1ET0MiLCJITVMtQVBJLUlDVC1SVyIsIkhNUy1QLUNDQyIsIlNELUFQSS1UVi1SIiwiU0QtUC1CSUxMLVJXIiwiU0QtUC1TVkQtUlciLCJTRC1QLVBPVi1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtQVBJLURBU0gtUlciLCJTRC1QLVVSLVJXIiwiTURDLVAtUE5QUi1SIiwiU0QtUC1PRC1SIiwiSE1TLVAtRExELVJXIiwiSE1TLVAtQURNIiwiU0QtQVBJLU1JUy1SIiwiSE1TLVAtU0FNVCIsIkhNUy1QLVZWRS1SVyIsIkhNUy1BUEktRFNVTSIsIlNULUFQSS1FTVAtUiIsIlNULVAtTlRGLVJXIiwiU0QtQVBJLUNOLVIiLCJTRC1BUEktVE0tUlciLCJTSU4tQVBJLUZVLVJXIiwiSE1TLVAtUkNBVCIsIk1EQy1QLUdDUC1SIiwiU0QtQVBJLVRELVIiLCJTRC1QLVBELVIiLCJTRC1QLVRERS1SVyIsIlNELVAtTUJERi1SVyIsIlNELVAtQlRELVJXIiwiU0QtUC1QRkUtUlciLCJITVMtUC1TQU0iLCJTRC1QLVNWUkktUlciLCJITVMtUC1BRE0tUlciLCJTRC1QLUlOVi1SVyIsIkVSLVItRVJBIiwiTURDLVItUERDIiwiSE1TLUFQSS1EUk0iLCJITVMtUC1EREFTSCIsIlNELVAtUEwtUiIsIkhNUy1QLUlOVlAiLCJITVMtUC1WSS1SIiwiSE1TLVAtVlYtUiIsIk1EQy1BUEktQUdQLVJXIiwiU0QtUC1NSVMtUlciLCJNREMtQVBJLU9HUC1SVyIsIlNULVAtQ01ULVIiLCJITVMtUC1STSIsIkhNUy1BUEktSUNUIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDUsNDYsNDcsNDgsNDldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMiIsIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODAzODA1MDUsImV4cCI6MTc4MDQ2NzUwNX0.MMrm7YuiJkLLY1-aTow79m0Kcy_B5nxY5ZiNI8NsyD6N2vvFgL1-UNb5RxxzzsMmb6HABVqLnpbroSYsg7YJ7kEputWRrNjmL4PQUVdz-1l8XS9vKRn2QEHQIxH2AOS-zTNgUJipkZiQ0kNWneBmA-0NfTH28NlEodxGSCXSHc2j6t-Jd-tNnMwPrgvaBIGlF1KRGHqApveDyce8YNcrECg3spX-ZY5GPKVpiKpyHI2ZGdl_yn-DX7edZiG4-ckI7nFztTQWzLtIf2DfaIMaNgviC-RCvtb-5gDSnkxX3yMh43ylYudsYPh8rzpL8VyBvAF7cJ3cSKAh2IHY0FkewQ";
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
