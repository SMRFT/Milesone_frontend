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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIk1EQy1BUEktQ0RSLVJXIiwiU0QtUC1ITVNTUC1SIiwiSE1TLVAtQlRELVJXIiwiTURDLVAtR1NQLVIiLCJTVC1QLUNNVC1SIiwiSE1TLVAtVklORS1SVyIsIkhNUy1QLVZJRS1SVyIsIkhNUy1QLUlUIiwiSE1TLUFQSS1JTVJJLVJXIiwiSE1TLVAtT1RTUyIsIlNELVAtSE1TTEQtUiIsIkhNUy1QLVZJLVIiLCJITVMtQVBJLUlDVC1SVyIsIkhNUy1QLVJTSEZUIiwiSE1TLVAtSVBFLVJXIiwiSE1TLVAtQlRFLVJXIiwiU1QtQVBJLUVNUC1SIiwiU0QtUC1URS1SVyIsIlNELVItTFQiLCJTRC1BUEktVE0tUiIsIkhNUy1QLVNBTSIsIkhNUy1QLVJFTlEiLCJTRC1QLVRELVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1WSU5SLVIiLCJNREMtUC1BRC1SIiwiSE1TLVAtQURNIiwiU0QtUC1TQS1SVyIsIlNELVAtSE1TVEQtUiIsIkhNUy1QLVBBQ0siLCJTVC1QLURFUy1SVyIsIkhNUy1QLUhNU0lOUyIsIkhNUy1BUEktVk0iLCJTVC1QLVNOTy1SVyIsIkdQLVAtR0NOLVIiLCJTVC1QLVRETC1SIiwiTURDLUFQSS1BVC1SVyIsIlNELVAtU1NVLVJXIiwiTURDLVAtR1BQLVIiLCJNREMtQVBJLUFHUC1SVyIsIlNELVAtSE1TR0MtUiIsIkhNUy1QLUNDQyIsIk1EQy1QLVBOUFItUiIsIkhNUy1BUEktRFJNIiwiSE1TLVAtSE1TUFMtUlciLCJTVC1SLUEiLCJTRC1QLVNTLVIiLCJTRC1BUEktUkItUiIsIkhNUy1QLVNSTSIsIkhNUy1QLVZJTkEtUlciLCJITVMtUC1EQiIsIlNELVAtSE1TU0QtUiIsIlNELVAtU1NVLVIiLCJITVMtUC1EREFTSCIsIkhNUy1QLVZJRC1SVyIsIkhNUy1QLUlOQSIsIkhNUy1QLURCVURSLVIiLCJTRC1BUEktVFYtUiIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtUC1ITVNVQy1SVyIsIkhNUy1QLUlQLVIiLCJNREMtQVBJLVBHUC1SVyIsIk1EQy1SLVBEQyIsIlNELVAtSE1TR1AtUiIsIkhNUy1QLUJUIiwiTURDLVAtR0NQLVIiLCJITVMtUC1ITVMiLCJITVMtUC1HUk4iLCJITVMtUC1WVkUtUlciLCJTRC1QLUhNU0JELVJXIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtSVBELVJXIiwiTURDLVAtR09QLVIiLCJITVMtQVBJLURTVU0iLCJITVMtUC1TSU5URU5UIiwiU0QtUC1ITVNDUy1SIiwiSE1TLVAtU0FNVCIsIkhNUy1QLUJVRCIsIkhNUy1QLU9QSCIsIlNULVAtREVTLVIiLCJITVMtUC1TR1JOIiwiSE1TLVAtQlQtUiIsIlNELVAtSE1TUEItUlciLCJITVMtUC1WVi1SIiwiSE1TLUFQSS1JVVNHLVJXIiwiSE1TLUFQSS1JQiIsIkhNUy1BUEktSVVTRyIsIkhNUy1QLUJMSyIsIlNULUFQSS1CUkQtUlciLCJITVMtQVBJLUlYUkFZIiwiU0QtQVBJLVRNLVJXIiwiSE1TLVAtSVBLRy1SIiwiSE1TLVAtT1RBTSIsIkhNUy1BUEktSUNUIiwiTURDLVAtR0FULVIiLCJTRC1QLURGLVJXIiwiU0QtUC1NQlBELVIiLCJITVMtUC1BSU4tUlciLCJTRC1BUEktQ04tUiIsIk1EQy1QLUFBVS1SVyIsIlNULVAtTlRGLVJXIiwiU0QtUC1ITVNTUy1SVyIsIkhNUy1QLVdSIiwiU0QtUC1ITVNQUy1SVyIsIkhNUy1QLVZWLVJXIiwiTURDLUFQSS1TR1AtUlciLCJITVMtUC1SQ0FUIiwiSE1TLVAtSE1TUFMiLCJTRC1QLVBPVi1SVyIsIlNELVAtTUJERi1SVyIsIkhNUy1BUEktSVhSQVktUlciLCJITVMtQVBJLUlNUkkiLCJTRC1BUEktTUJURC1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtVklOUiIsIkhNUy1QLVJFRy1SVyIsIlNELUFQSS1HRC1SIiwiU0QtUC1QRC1SVyIsIlNULVAtQlJELVIiLCJTRC1BUEktTUlTLVJXIiwiSE1TLVAtR1JOQSIsIlNELVAtUkQtUlciLCJITVMtUC1JUEtHLVJXIiwiSE1TLVAtSU5WUCIsIlNELVAtUE9WLVIiLCJTRC1QLVJHLVJXIiwiU1QtUC1UREwtUlciLCJITVMtUC1WSU4tUlciLCJNREMtQVBJLVBEQy1SVyIsIlNELVAtTUJUVi1SIiwiSE1TLVAtT1RNIiwiTURDLVAtR0FQLVIiLCJTRC1QLVNTLVJXIiwiSE1TLVAtVklOLVIiLCJITVMtUC1SQklMTCIsIlNULUFQSS1DUkQtUlciLCJTRC1QLU1JUy1SIiwiSE1TLVAtSVAtUlciLCJITVMtUC1JUEgiLCJTVC1QLUNNVC1SVyIsIlNELVAtVERFLVJXIiwiSE1TLVAtQURBU0giLCJNREMtQVBJLUwtUlciLCJNREMtUC1HT0EtUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtSVBLR0QtUlciLCJITVMtUC1STSIsIkhNUy1QLVNJREVCQVIiLCJNREMtQVBJLU9HUC1SVyIsIlNULVAtTlRGLVIiLCJITVMtUC1JUEtHRS1SVyIsIkhNUy1BUEktREFTSCJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDE4XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDEiLCJPTEVUMDAyIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4NTk4ODU5NiwiZXhwIjoxNzg2MDc1NTk2fQ.Oo2SdleUS5rEeuIb-i8lHNfziMRGIbS5VGZMl6ppzy-bnej1Jquv-oWQelBUHoTHESZmxsNn6S8AVqD7c1mrGEQDzztlcr9SMSSqLzNvsLuaO2ESk5uyRVJQUvxFkDSId65YrXcTut6196yfMVWBd8eL5Tb8U1L_N9eQVwCqYXzISLYTfH1JLIy6-zzx2bBh3ETQMjJ2WLe21vgIgBDUswzzx9g51vyvL_bytL77n__tPmv6zgBoQXUCpFQxmyjgjrdw6sPkwzT7FcuLrYv1CMW152ymc_giHR-FrfFn5FRaQUusqxhoAAGStm0-Hcgc0gJ0d4Z-LKjqTbOc4qbSWQ";
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