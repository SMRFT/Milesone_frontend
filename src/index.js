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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1ERUxSQVctUlciLCJTSEktUC1SRUMtUlciLCJTSEktUC1FWFAtUlciLCJTVC1SLUNEUiIsIlNULUFQSS1FTVAtUiIsIk1EQy1BUEktQVQtUlciLCJNREMtQVBJLVBBVC1SIiwiU0hJLVAtRjJTUi1SVyIsIk1EQy1QLVBOUC1SIiwiU0hJLVAtU0lDVS1SVyIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1VUERSQVctUlciLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtTUlDVS1SVyIsIlNULVAtQlJELVIiLCJHTC1QLUFORC1SVyIsIlNULVAtQ01ULVJXIiwiU0hJLVAtWFJBWS1SVyIsIlNISS1QLUZPUk0tUlciLCJTSEktUC1BVkFJTC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiU1QtUC1OVEYtUiIsIlNISS1QLUxBQi1SVyIsIlNISS1QLUYzLVJXIiwiTURDLVAtU09SLVIiLCJTSEktUC1DVC1SVyIsIlNISS1QLUYyLVJXIiwiU0hJLVAtRjFTLVJXIiwiU1QtUC1ERVMtUlciLCJHTC1QLUVQLVJXIiwiTURDLUFQSS1HQVMtUiIsIlNISS1QLVRSQUlOUi1SVyIsIlNISS1QLVVQRC1SVyIsIkdMLVAtUC1SVyIsIlNISS1QLUYyUy1SVyIsIlNISS1QLUYzUi1SVyIsIlNISS1QLVBIWS1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtRjFSLVJXIiwiTURDLUFQSS1USFItUiIsIlNISS1QLUNIRU1PUi1SVyIsIk1EQy1BUEktUlRTLVIiLCJTSEktUC1OSUNVLVJXIiwiTURDLVAtQVNNLVJXIiwiU0hJLVAtSU5DIiwiR0wtUC1FQlQtUlciLCJTVC1BUEktQU1DLVJXIiwiTURDLVAtUkVHLVIiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUE5QLVJXIiwiR0wtUC1FQUQtUlciLCJNREMtUC1QTlBSLVIiLCJTSEktUC1ERUwtUlciLCJTSEktUC1PVC1SVyIsIkdMLVAtRUwtUlciLCJNREMtQVBJLUFULVIiLCJTSEktUC1PUEQtUlciLCJTSEktUC1FTVItUlciLCJHTC1QLU5EQy1SVyIsIk1EQy1BUEktTEJOLVIiLCJTSEktUC1NSUNVUi1SVyIsIlNISS1QLUYxLVJXIiwiU0hJLVAtSEFORC1SVyIsIlNISS1QLUYyUi1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIk1EQy1QLU9TQi1SVyIsIlNULVAtVERMLVJXIiwiU1QtUC1OVEYtUlciLCJTSEktUC1GUk5ULVJXIiwiU0hJLVAtTklDVVItUlciLCJHTC1QLVJTRS1SVyIsIlNISS1QLURJQS1SVyIsIk1EQy1SLVJFQyIsIlNULVAtU05PLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1BUEktUEFUIiwiU0hJLVAtTVJELVJXIiwiU0hJLVAtUEhBUk0tUlciLCJTSEktUC1FTVJSLVJXIiwiU1QtUi1BIiwiU1QtUC1DTVQtUiIsIlNULUFQSS1DUkQtUlciLCJHTC1QLUVELVJXIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtUkVDUi1SVyIsIk1EQy1BUEktQ0RSLVIiLCJTSEktUC1DSEVNTy1SVyIsIk1EQy1QLVRSQi1SVyIsIk1EQy1QLVJFRy1SVyIsIlNULVAtVERMLVIiLCJTSEktUC1TSUNVUi1SVyIsIk1EQy1BUEktUkRMLVJXIiwiU0hJLVAtSFItUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc2Mjg0MTU2MywiZXhwIjoxNzYyOTI4NTYzLCJqdGkiOiI1ZDJlNjZjYS00MGEwLTQzZjQtOGU4NS0zNzI4YzdiZWQ1YWQifQ.WNuTDsO9MvrDxHPyT3NxFzDIZEH1fWvQabOCGNgCDOhhywpfKsi3wifXK_a9i1RqRXsg6xxdWV3t6MFH_jSwKO8JZXbbKzH2l_BVmz1Qo3hpENiWXufDtAWpvNIVodck3XWRJukxR5DDYwqY45UvkLOqCfCsn8jpb90FCGnP3nnZhryFIKihvKKUjwKDnKn2x-NvYKOPvwtyEBfuLg8UkbIsNjeX9Dh93PLDfX5xB-IeTJraZMtfv_1WR5ZNfiIqAWwjO6t_EFI30auYgeqGZo2mt5YmJrpsMPqCQ8NZYb0STLzzA5r3JnVBHwqhiwYBzJvqtV8cAImwIwu0THcnSA"; // Keep empty to force redirect in development
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
