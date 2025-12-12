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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1GMi1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtTU9DSy1SVyIsIk1EQy1QLVJFRy1SVyIsIlNISS1QLUZSTlQtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNISS1QLVhSQVktUlciLCJTSEktUC1DVC1SVyIsIlNISS1QLUxBQi1SVyIsIlNISS1QLUVNUi1SVyIsIk1EQy1BUEktQVQtUiIsIk1EQy1QLVNPUi1SIiwiU1QtUC1OVEYtUiIsIlNISS1QLURFTC1SVyIsIlNISS1QLVRSQUlOUi1SVyIsIlNISS1QLU1JQ1VSLVJXIiwiU0hJLVAtRVhQLVJXIiwiU0hJLVAtRjFTUi1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiU1QtUC1TTk8tUlciLCJTVC1QLUNNVC1SIiwiU0hJLVAtREVMUkFXLVJXIiwiTURDLVAtUE5QLVJXIiwiU0hJLVAtTUlDVS1SVyIsIlNJLVItSU5EIiwiU1QtUC1ERVMtUlciLCJNREMtUC1DREUtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLU9ULVJXIiwiU1QtUC1OVEYtUlciLCJTSEktUC1JTkMiLCJTVC1QLVRETC1SIiwiU0hJLVAtRjFTLVJXIiwiTURDLVAtUkVHLVIiLCJTSEktUC1IQU5ELVJXIiwiTURDLVAtT1NCLVJXIiwiU0hJLVAtR0VUUkFXLVJXIiwiU0hJLVAtRk9STS1SVyIsIk1EQy1BUEktTEJOLVIiLCJTSEktUC1PUEQtUlciLCJTSEktUC1GMS1SVyIsIlNISS1QLUYyUy1SVyIsIlNISS1QLUYyUi1SVyIsIlNISS1QLUVNUlItUlciLCJTSEktUC1GM1ItUlciLCJNREMtUC1SREUtUlciLCJNREMtUC1BU00tUlciLCJTSEktUC1GMy1SVyIsIlNISS1QLUNIRU1PUi1SVyIsIlNULVItQSIsIkdQLVAtR0NOLVIiLCJNREMtUC1QTlAtUiIsIlNISS1QLUFWQUlMLVJXIiwiU0hJLVAtU0lDVVItUlciLCJTVC1QLURFUy1SIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtTVJJLVJXIiwiTURDLVAtUFRFLVJXIiwiTURDLVAtUE5QUi1SIiwiTURDLVAtVFJCLVJXIiwiU0hJLVAtUEhZLVJXIiwiU0hJLVAtVVBELVJXIiwiU0hJLVAtRjFSLVJXIiwiTURDLUFQSS1DRFItUiIsIlNISS1QLVBIQVJNLVJXIiwiU1QtUC1DTVQtUlciLCJTSEktUC1ESUEtUlciLCJTSEktUC1GMlNSLVJXIiwiTURDLUFQSS1QQVQtUiIsIlNULVAtQlJELVIiLCJTVC1QLVRETC1SVyIsIlNISS1QLVJFQy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiU0hJLVAtTklDVS1SVyIsIk1EQy1BUEktVEhSLVIiLCJTVC1BUEktRU1QLVIiLCJNREMtQVBJLVJETC1SIiwiTURDLUFQSS1SVFMtUiIsIlNULUFQSS1DUkQtUlciLCJNREMtQVBJLUdBUy1SIiwiTURDLUFQSS1BVC1SVyIsIlNISS1QLVNJQ1UtUlciLCJTVC1BUEktQlJELVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNISS1QLVJFQ1ItUlciLCJTSEktUC1NUkQtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc2NTUxNjQyMiwiZXhwIjoxNzY1NjAzNDIyLCJqdGkiOiIzZjU4ODA3ZC03M2JlLTQ0NzYtYjY2OS1iYjZjNjJkOGU1MzgifQ.G95M6Pw-U7aGlvvRgIpjPtZbCJAB2c0LbTAhuNWA1K98Wh72rhx9q0g9BZZWDn-rRRs3lJwBqyEx19qZLtStmne3z20Co9LUvWdnCtmsVSpoqtO-gLVQ95oY_jXT6xaG9g1XqZ0JgZHwY1YR8W8xuxQ4Gw4lHdlpwj-OlYaQSDJVXJqoTCo_4g4ghHuB09rIDokORHgfJQq8_rNpHj4NtaMz8u1ltuLhwdltinr7EIwoFJQb-l_L0Rtph4VMaBAfjGr7qR_f2q9c6tHBEp30xbtI6ukfT_GO1pennbJljMj3PhyIhas0hUwZCYVtvfgqnXMz12PxxfjsHvtJXLE7Dw";
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
