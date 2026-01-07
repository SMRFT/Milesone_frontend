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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1DR1AtUlciLCJTRC1QLUhNU0NTLVIiLCJNREMtUC1SRUctUlciLCJTRC1QLVNTVS1SVyIsIlNELVAtSE1TR1AtUiIsIlNELVAtSE1TU0QtUiIsIlNJTi1BUEktU0YtUiIsIk1EQy1BUEktQVQtUiIsIk1EQy1QLVNPUi1SIiwiRVItUC1FUlBCLVJXIiwiSE1TLVItUEgiLCJNREMtUC1HUFAtUiIsIlNULVAtTlRGLVIiLCJFUi1QLUVSREwtUiIsIlNELVAtSE1TUEItUlciLCJTRC1QLVNTLVJXIiwiTURDLUFQSS1TR1AtUlciLCJTVC1QLVNOTy1SVyIsIk1EQy1QLUdPUC1SIiwiTURDLUFQSS1QQVQiLCJTVC1QLUNNVC1SIiwiTURDLVAtUE5QLVJXIiwiRVItUC1FUkdOQk4tUiIsIlNELVAtSE1TQkQtUlciLCJTRC1QLVBPVi1SIiwiTURDLVAtQUFVLVJXIiwiU0QtQVBJLVJCLVIiLCJTVC1QLURFUy1SVyIsIlNELVAtSE1TU1AtUiIsIk1EQy1BUEktUEdQLVJXIiwiU1QtUC1OVEYtUlciLCJITVMtUC1DUy1SVyIsIlNELVAtUkQtUlciLCJTRC1QLUhNU1NTLVJXIiwiU1QtUC1UREwtUiIsIk1EQy1QLVJFRy1SIiwiTURDLVAtT1NCLVJXIiwiTURDLUFQSS1PR1AtUlciLCJTRC1QLUhNU1RELVIiLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLUhTTi1SVyIsIlNELVAtSE1TVUMtUlciLCJTRC1QLVJHLVJXIiwiTURDLUFQSS1MQk4tUiIsIlNJTi1QLUlDRS1SIiwiU0QtUi1MVCIsIk1EQy1QLUFTTS1SVyIsIkhNUy1QLVZMLVJXIiwiU0QtQVBJLVRNLVJXIiwiU0QtQVBJLVRNLVIiLCJTRC1BUEktR0QtUiIsIlNULVItQSIsIkdQLVAtR0NOLVIiLCJTRC1QLUhNU0xELVIiLCJNREMtUC1QTlAtUiIsIk1EQy1QLUdBUC1SIiwiU1QtUC1ERVMtUiIsIlNJTi1BUEktSUYtUlciLCJNREMtUC1HQ1AtUiIsIk1EQy1QLVBOUFItUiIsIk1EQy1QLVRSQi1SVyIsIlNELUFQSS1DTi1SIiwiTURDLUFQSS1BR1AtUlciLCJFUi1QLUVSUkVQLVIiLCJTSU4tUC1HSUMtUiIsIkVSLVAtRVJCLVJXIiwiTURDLVItQURNIiwiTURDLUFQSS1SREwtUlciLCJTRC1QLUhNU1BTLVJXIiwiTURDLUFQSS1DRFItUiIsIlNELVAtSE1TR0MtUiIsIlNJTi1BUEktRlUtUlciLCJTVC1QLUNNVC1SVyIsIlNELVAtU0EtUlciLCJTSU4tQVBJLU9SLVJXIiwiTURDLUFQSS1QQVQtUiIsIlNELVAtVEUtUlciLCJTRC1QLVRERS1SVyIsIlNELVAtU1MtUiIsIlNULVAtQlJELVIiLCJTSU4tQVBJLUlGLVIiLCJTRC1QLVRELVJXIiwiU1QtUC1UREwtUlciLCJNREMtQVBJLVRIUi1SIiwiU1QtQVBJLUVNUC1SIiwiRVItUi1FUk4iLCJNREMtQVBJLVJUUy1SIiwiU0QtUC1TU1UtUiIsIlNULUFQSS1DUkQtUlciLCJNREMtQVBJLUdBUy1SIiwiTURDLUFQSS1BRE0tUlciLCJNREMtQVBJLUFULVJXIiwiRVItUC1FUlBMLVIiLCJTRC1QLVBELVJXIiwiU1QtQVBJLUJSRC1SVyIsIlNULUFQSS1BTUMtUlciLCJNREMtUC1HU1AtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzY3Njk2MzU1LCJleHAiOjE3Njc3ODMzNTUsImp0aSI6IjkzYWU1MGYwLTcwYWYtNDVjZS04OWU3LTBkNDBjYmYzNTRiNSJ9.MEVZfB7Wsw84cJlPF8lG6dV-l7E7RjirNIv4QsJOEgUZiAtPqUYbzZJVmAtoYGYuSC9gvg1gpF6LwMbr4203VG1kZkoSpOtp_3tksGqDISzwPA1b-o7HhmmxJxxpMaDFoLg4xDm3c_OIGCnjM5B54gttdArFfyriCBXo98hqyvp32jGNkLTNh7Dvzx5Korj_wYxGB4tJynOq-1XPnQ3IQ8ffXELiTtOOPCFCi--q2Na-hLOVLp0ot2iDvUkceUi-ZfxgiiX-sdpRNvObQC-AHv21TiIG2S88IvvcX_-1RGuJWi5yNIYVGdw0A7VPpOkuueDemBwOeT_cWdSLPtT9TA";
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
