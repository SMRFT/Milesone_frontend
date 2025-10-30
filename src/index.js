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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1ERUxSQVctUlciLCJTSEktUC1SRUMtUlciLCJTSEktUC1FWFAtUlciLCJTVC1SLUNEUiIsIlNULUFQSS1FTVAtUiIsIk1EQy1BUEktQVQtUlciLCJNREMtQVBJLVBBVC1SIiwiU0hJLVAtRjJTUi1SVyIsIk1EQy1QLVBOUC1SIiwiU0hJLVAtU0lDVS1SVyIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1VUERSQVctUlciLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtTUlDVS1SVyIsIlNULVAtQlJELVIiLCJTVC1QLUNNVC1SVyIsIlNISS1QLVhSQVktUlciLCJTSEktUC1GT1JNLVJXIiwiU0hJLVAtQVZBSUwtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNULVAtTlRGLVIiLCJTSEktUC1MQUItUlciLCJTSEktUC1GMy1SVyIsIk1EQy1QLVNPUi1SIiwiU0hJLVAtQ1QtUlciLCJTSEktUC1GMi1SVyIsIlNISS1QLUYxUy1SVyIsIlNULVAtREVTLVJXIiwiTURDLUFQSS1HQVMtUiIsIlNISS1QLVRSQUlOUi1SVyIsIlNISS1QLVVQRC1SVyIsIlNISS1QLUYyUy1SVyIsIlNISS1QLUYzUi1SVyIsIlNISS1QLVBIWS1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtRjFSLVJXIiwiTURDLUFQSS1USFItUiIsIlNISS1QLUNIRU1PUi1SVyIsIk1EQy1BUEktUlRTLVIiLCJTSEktUC1OSUNVLVJXIiwiTURDLVAtQVNNLVJXIiwiU0hJLVAtSU5DIiwiU1QtQVBJLUFNQy1SVyIsIk1EQy1QLVJFRy1SIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLVBOUC1SVyIsIk1EQy1QLVBOUFItUiIsIlNISS1QLURFTC1SVyIsIlNISS1QLU9ULVJXIiwiTURDLUFQSS1BVC1SIiwiU0hJLVAtT1BELVJXIiwiU0hJLVAtRU1SLVJXIiwiTURDLUFQSS1MQk4tUiIsIlNISS1QLU1JQ1VSLVJXIiwiU0hJLVAtRjEtUlciLCJTSEktUC1IQU5ELVJXIiwiU0hJLVAtRjJSLVJXIiwiU0hJLVAtR0VUUkFXLVJXIiwiTURDLVAtT1NCLVJXIiwiU1QtUC1UREwtUlciLCJTVC1QLU5URi1SVyIsIlNISS1QLUZSTlQtUlciLCJTSEktUC1OSUNVUi1SVyIsIlNISS1QLURJQS1SVyIsIlNULVAtU05PLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1BUEktUEFUIiwiU0hJLVAtTVJELVJXIiwiU0hJLVAtUEhBUk0tUlciLCJTSEktUC1FTVJSLVJXIiwiU1QtUi1BIiwiU1QtUC1DTVQtUiIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1NUkktUlciLCJTSEktUC1SRUNSLVJXIiwiTURDLUFQSS1DRFItUiIsIlNISS1QLUNIRU1PLVJXIiwiTURDLVAtVFJCLVJXIiwiTURDLVAtUkVHLVJXIiwiU1QtUC1UREwtUiIsIlNISS1QLVNJQ1VSLVJXIiwiTURDLUFQSS1SREwtUlciLCJTSEktUC1IUi1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzYxODEyODAyLCJleHAiOjE3NjE4OTk4MDIsImp0aSI6Ijg4YjFjMzVjLWQzYTAtNGVmNi05MTUwLTEwMzkxNjQ4MDVjYyJ9.Gzvv-LFjy85P4UwuJ2GdoiW7Vd_TxuMfLddASpcfs1ayJsAXnNUoX9rGznASxbL-aRkhMOPBX_JbKnN6QB5ILboNR7LrUn9h691c4FtLgFnclFvHr00utTHHn5IJ3qM9h7rRo0a32Blbiy-rs_R67jzqOEaersqJ50H6DV2wOR71ozQK2wgS3VpVP_rwi4F7fY2xtd8FWQlLGEIcedzRiL5aCoR2QiJZ2ALKYlthCMYMlKsmrEFqLYq-wqvJ5ClVvj9udoclcJzKZWi2aQlLnhyq-HVXrSSQz9-ksKxlx6unRHKjavoW9r36qglu1GVoEJfW9BROCKtW8-W5fJILDw"; // Keep empty to force redirect in development
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
