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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMjM0NTY3IiwiZW1haWwiOiJwYXJ0aGliYW4ubUBzaGlub3ZhLmluIiwibmFtZSI6InRlc3RpbmcgbWFpbCIsImFsbG93ZWQtYWN0aW9ucyI6WyJTVC1QLUNNVC1SVyIsIlNISS1QLUhBTkQtUlciLCJTSEktUC1IQU5EUi1SVyIsIlNELVAtQ1QtUiIsIlNULVItQSIsIk1EQy1SLVBEQyIsIlNULVAtREVTLVJXIiwiTURDLUFQSS1TR1AtUlciLCJTSEktUC1UUkFJTlItUlciLCJTSEktUC1GM1ItUlciLCJNREMtUC1BRC1SVyIsIk1EQy1QLUdQUC1SIiwiU1QtUC1OVEYtUiIsIlNULVAtU05PLVJXIiwiU0hJLVAtQ0hFTU9SLVJXIiwiTURDLVAtVUFTLVJXIiwiU0hJLVAtTklDVVItUlciLCJNREMtQVBJLUwtUlciLCJTSEktUC1GMlNSLVJXIiwiU0hJLVAtR0ktUiIsIk1EQy1BUEktQVQtUiIsIlNISS1QLUxBQi1SVyIsIlNISS1QLVRSQUlOLVJXIiwiU1QtQVBJLUNSRC1SVyIsIk1EQy1QLUdPQS1SVyIsIlNISS1QLUNIRU1PLVJXIiwiU0hJLVAtVVBELVJXIiwiU0hJLVAtT1QtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLVJFQ1ItUlciLCJTSEktUC1GMVNSLVJXIiwiTURDLVAtQUFVLVJXIiwiTURDLUFQSS1QREMtUlciLCJTRC1QLUlOVi1SVyIsIk1EQy1BUEktUEdQLVJXIiwiU0hJLVAtTVJJLVJXIiwiTURDLUFQSS1BR1AtUlciLCJTSEktUC1GMVItUlciLCJTSEktUC1OSUNVLVJXIiwiU0QtUC1JVk0tUlciLCJNREMtUC1HQ1AtUiIsIk1EQy1BUEktT0dQLVJXIiwiU0hJLVAtRjMtUlciLCJTVC1QLUNNVC1SIiwiU0hJLVAtUEhBUk0tUlciLCJTVC1QLURFUy1SIiwiR1AtUC1HQ04tUiIsIlNELVAtUkItUlciLCJTSEktUC1JTkNDLVJXIiwiTURDLVAtUE5QUi1SIiwiU0hJLVAtU1VQSU5WLVJXIiwiU0hJLVAtRElBLVJXIiwiU0hJLVAtRjJTLVJXIiwiU0hJLVAtSU5DIiwiU0hJLVAtU0lDVVItUlciLCJTSEktUC1ERUxSQVctUlciLCJTSEktUC1NUkQtUlciLCJTVC1QLVRETC1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNISS1QLURFTC1SVyIsIlNISS1QLUVNUi1SVyIsIlNISS1QLUFWQUlMLVJXIiwiTURDLUFQSS1DR1AtUlciLCJTSEktUC1TSUNVLVJXIiwiTURDLVAtR1NQLVIiLCJTSEktUC1YUkFZLVJXIiwiU0hJLVAtRjFTLVJXIiwiU0hJLVAtRjEtUlciLCJTSEktUC1NSUNVLVJXIiwiU0hJLVAtRU1SUi1SVyIsIlNULUFQSS1BTUMtUlciLCJTSEktUC1QSFktUlciLCJTSEktUC1GT1JNLVJXIiwiU0hJLVAtT1BELVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtSU5DLVJXIiwiTURDLVAtR0FQLVIiLCJTVC1SLUNEUiIsIlNISS1QLU1JQ1VSLVJXIiwiU1QtQVBJLUJSRC1SVyIsIlNISS1QLUZSTlQtUlciLCJTSEktUC1TVVBJTkMtUlciLCJTSEktUC1FWFAtUlciLCJTSS1SLUlORCIsIlNISS1QLUNULVJXIiwiU0hJLVAtRjItUlciLCJTSEktUC1SRUMtUlciLCJTVC1QLUJSRC1SIiwiU0hJLVAtTU9DSy1SVyIsIlNULVAtVERMLVIiLCJTVC1QLU5URi1SVyIsIk1EQy1QLUdPUC1SIiwiU0hJLVAtRjJSLVJXIiwiU1QtQVBJLUVNUC1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbXSwiYWxsb3dlZC1vdXRsZXRzIjpbXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODQ4Nzg5MDAsImV4cCI6MTc4NDk2NTkwMH0.ZokQTSrftJ-E_32jDYcAfYsFAdQdnS_-BjOO80uy7GB0ixoqGyecFHDmMmqlFYYID9QS7XhCYDK0w7YkKENgjjcQl0CJDbO5IJWcFwZpx_uZCN3GSJJzNZeDilNi7678mfo9K6xEbI5K82iiJZBheKZN-K7P1BhCfU7THYXJtx2E1Jq4yCLbL6lgDmFglPygtr9HvA1ydZ2PeskFKupl12PVkzY1JuRmsb9nRL4GHOA8tszSQQyjK50XuWCINgmSu3NAeaoCNwplWKgWyfmSb7N5_-zE1BHIMrSh4M4z7_IUL6Q60g-5o4iRZiyn2J3Y1mQ-HFvCjO1Xl12N4cOvEw";
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
