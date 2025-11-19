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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiRVItUC1FUlJFRy1SVyIsIlNELVAtSE1TQ1MtUiIsIk1EQy1QLVJFRy1SVyIsIlNELVAtSE1TR1AtUiIsIlNELVAtSE1TU0QtUiIsIlNJTi1BUEktU0YtUiIsIk1EQy1BUEktQVQtUiIsIk1EQy1QLVNPUi1SIiwiRVItUC1FUlBCLVJXIiwiSE1TLVItUEgiLCJTVC1QLU5URi1SIiwiU0QtUC1ITVNQQi1SVyIsIlNULVAtU05PLVJXIiwiU0QtUC1UTS1SVyIsIk1EQy1BUEktUEFUIiwiU1QtUC1DTVQtUiIsIk1EQy1QLVBOUC1SVyIsIkVSLVAtRVJELVIiLCJTRC1QLUhNU0JELVJXIiwiU1QtUC1ERVMtUlciLCJTRC1QLUhNU1NQLVIiLCJTVC1QLU5URi1SVyIsIkhNUy1QLUNTLVJXIiwiU0QtUC1SRC1SVyIsIlNELVAtSE1TU1MtUlciLCJTVC1QLVRETC1SIiwiTURDLVAtUkVHLVIiLCJNREMtUC1PU0ItUlciLCJTRC1QLUhNU1RELVIiLCJITVMtUC1IU04tUlciLCJTRC1QLUhNU1VDLVJXIiwiU0QtUC1SRy1SVyIsIk1EQy1BUEktTEJOLVIiLCJFUi1QLUVSUC1SIiwiU0lOLVAtSUNFLVIiLCJTRC1SLUxUIiwiRVItUC1FUlJFLVJXIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtVkwtUlciLCJTVC1SLUEiLCJTRC1QLUhNU0xELVIiLCJNREMtUC1QTlAtUiIsIkVSLVAtRVJSLVJXIiwiU1QtUC1ERVMtUiIsIlNJTi1BUEktSUYtUlciLCJNREMtUC1QTlBSLVIiLCJNREMtUC1UUkItUlciLCJFUi1QLUVSUEQtUlciLCJTSU4tUC1HSUMtUiIsIkVSLVAtRVJCLVJXIiwiTURDLVItQURNIiwiTURDLUFQSS1SREwtUlciLCJTRC1QLUhNU1BTLVJXIiwiTURDLUFQSS1DRFItUiIsIlNELVAtSE1TR0MtUiIsIlNJTi1BUEktRlUtUlciLCJTVC1QLUNNVC1SVyIsIlNELVAtU0EtUlciLCJTSU4tQVBJLU9SLVJXIiwiTURDLUFQSS1QQVQtUiIsIlNELVAtVEUtUlciLCJFUi1QLUVSTkJOLVIiLCJTRC1QLVRERS1SVyIsIlNULVAtQlJELVIiLCJTSU4tQVBJLUlGLVIiLCJTVC1QLVRETC1SVyIsIk1EQy1BUEktVEhSLVIiLCJTVC1BUEktRU1QLVIiLCJFUi1SLUVSTiIsIk1EQy1BUEktUlRTLVIiLCJTVC1BUEktQ1JELVJXIiwiTURDLUFQSS1HQVMtUiIsIk1EQy1BUEktQURNLVJXIiwiTURDLUFQSS1BVC1SVyIsIlNULUFQSS1CUkQtUlciLCJTRC1QLUdELVIiLCJTVC1BUEktQU1DLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NjMzNTQ1MjUsImV4cCI6MTc2MzQ0MTUyNSwianRpIjoiZDg3MjJjYzItNjUwYy00ZGQ2LTkzNTUtNzJjOWJiOWI1Y2UwIn0.EDXVyxo2lXih5s8BHNp-7blmXpzowljAM2QHMmAFMZIteB6dNIvwKH-DYVmY5NenzN7ztqcfe873S5YjOsyVEZemXTUe540DQNfqy7Hrws8m529fC7j8F-xrcPklpR7qJaLC744e4BRlxHU0Stnqm92wB6Dro9SMzHDlTQq-jVDvhfObpxLu3zRjmyNGaFXKk1wOd-FOCGeKURml4SYV08ji5BW2n65gYoUFU4-sKicJjKfJQfmQFp2dXq4jZFi-puvYFuhRwE9_DTtbBEA5_vfCFtUB2SLzxX-2_UzzJNMejCUs1o4wNpC1oPZWeBRuzLYvctsgovioXDXfqxu9hg"; // Keep empty to force redirect in development
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
