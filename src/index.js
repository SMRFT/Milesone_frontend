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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJFUi1SLUVSU0EiLCJTSU4tQVBJLVNGLVIiLCJHTC1QLUFORC1SVyIsIlNISS1QLUVNUlItUlciLCJNREMtQVBJLUFULVJXIiwiU0hJLVAtRjNSLVJXIiwiU1RSLUFQSS1UUkwtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNISS1QLUVNUi1SVyIsIlNJTi1BUEktSUYtUlciLCJHTC1QLVJTRS1SVyIsIkdMLVAtRUQtUlciLCJTSEktUC1GMlNSLVJXIiwiU0hJLVAtTVJELVJXIiwiR1AtUC1HQ04tUiIsIlNISS1QLU1JQ1VSLVJXIiwiU0hJLVAtREVMLVJXIiwiU0hJLVAtRjFTLVJXIiwiU1RSLUFQSS1USU4tUlciLCJNREMtQVBJLVRIUi1SIiwiU1RSLUFQSS1WTC1SIiwiU0hJLVAtRlJOVC1SVyIsIlNULUFQSS1UUkxSLVJXIiwiU0hJLVAtQVZBSUwtUlciLCJTSU4tUC1HREwtUlciLCJNREMtQVBJLVBBVC1SIiwiU1QtUC1UREwtUiIsIlNULVAtREVTLVIiLCJNREMtQVBJLVJETC1SIiwiTURDLVAtUE5QLVJXIiwiTURDLUFQSS1MQk4tUiIsIlNULVAtQlJELVIiLCJTSEktUC1HRVRSQVctUlciLCJTSU4tUC1HSUMtUiIsIlNUUi1BUEktSUwiLCJNREMtQVBJLVJUUy1SIiwiU1RSLUFQSS1UUkwtUiIsIlNULVAtQ01ULVJXIiwiTURDLVAtUkRFLVJXIiwiRVItUC1FUkItUlciLCJNREMtUC1TT1ItUiIsIkVSLVAtRVJSRVAtUlciLCJTSEktUC1IQU5ELVJXIiwiU1RSLVAtSUNTLVIiLCJFUi1QLUVSQVMtUlciLCJTSEktUC1TSUNVUi1SVyIsIlNISS1QLURJQS1SVyIsIlNISS1QLU5JQ1UtUlciLCJFUi1BUEktRVJVQi1SVyIsIk1EQy1QLVRSQi1SVyIsIlNJLVItSU5EIiwiRVItUC1FUlZCLVJXIiwiTURDLUFQSS1HQVMtUiIsIlNUUi1QLVRJTlItUlciLCJTSEktUC1ERUxSQVctUlciLCJTVC1QLU5URi1SIiwiU0hJLVAtTUlDVS1SVyIsIkdMLVAtRUFELVJXIiwiRVItUC1FUkdBUy1SVyIsIlNISS1QLU9ULVJXIiwiTURDLVAtUFRFLVJXIiwiU1RSLVAtVElOUi1SIiwiU0hJLVAtVVBELVJXIiwiR0wtUC1FUC1SVyIsIlNISS1QLVNJQ1UtUlciLCJTVC1QLVRETC1SVyIsIlNISS1QLVBIWS1SVyIsIlNULVAtREVTLVJXIiwiU0hJLVAtRjJSLVJXIiwiU1RSLUFQSS1WTC1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtRjMtUlciLCJTVFItQVBJLVRJTi1SIiwiU0hJLVAtRjEtUlciLCJTSEktUC1OSUNVUi1SVyIsIlNULUFQSS1BTUMtUlciLCJNREMtUC1SRUctUlciLCJNREMtQVBJLUFULVIiLCJNREMtUC1BU00tUlciLCJNREMtUC1DREUtUlciLCJTSEktUC1GMi1SVyIsIlNISS1QLUlOQyIsIlNJTi1BUEktT1ItUlciLCJTSU4tQVBJLU9SUi1SIiwiU1RSLUFQSS1UUkxSLVIiLCJTVC1QLVNOTy1SVyIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLU9QRC1SVyIsIkdMLVAtTkRDLVJXIiwiU0hJLVAtWFJBWS1SVyIsIlNISS1QLUNIRU1PLVJXIiwiU0hJLVAtUkVDUi1SVyIsIkVSLVAtRVJHUFItUlciLCJHTC1QLVAtUlciLCJTSEktUC1GMlMtUlciLCJTSEktUC1GMVItUlciLCJHTC1QLUVCVC1SVyIsIlNISS1QLUZPUk0tUlciLCJTSEktUC1MQUItUlciLCJTVFItUi1BIiwiU1QtQVBJLUJSRC1SVyIsIlNISS1QLUYxU1ItUlciLCJNREMtUC1QTlBSLVIiLCJNREMtUC1QTlAtUiIsIlNISS1QLVJFQy1SVyIsIlNISS1QLVBIQVJNLVJXIiwiU0hJLVAtRVhQLVJXIiwiR0wtUC1FTC1SVyIsIlNULUFQSS1FTVAtUiIsIlNISS1QLUNIRU1PUi1SVyIsIlNULVAtTlRGLVJXIiwiTURDLVAtT1NCLVJXIiwiU0lOLUFQSS1GVS1SVyIsIlNISS1QLU1PQ0stUlciLCJTSU4tUi1TVEEiLCJTSEktUC1VUERSQVctUlciLCJTSEktUC1UUkFJTlItUlciLCJTVC1SLUhPRCIsIlNISS1QLU1SSS1SVyIsIlNUUi1BUEktSUwtUiIsIlNISS1QLUNULVJXIiwiU1RSLUFQSS1JTC1SVyIsIk1EQy1QLVJFRy1SIiwiTURDLUFQSS1DRFItUiIsIlNULVAtQ01ULVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOltdLCJhbGxvd2VkLW91dGxldHMiOltdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3OTE5MTYwNywiZXhwIjoxNzc5Mjc4NjA3fQ.Ix5LQtGt9rhUz3YD-7VQp8_rt275U90zwr9uablidV-7exIhQw-cLyI-5dYbrXaYOhfWlW1zha4zD0i8pw4s1UHocgqHXaGBDduG7hVR7e7EIjdrAmz6spxxgxwWqaOKMPwcXmw3vkY-qAmvEreRAzdHE-4hNOTskR2yFMsKjwldg6-ukpw_vmgVqad8zZP-A0FAW4R7UrGw9oGhpEJhMLNTI2vLsQY0z193fWWz7spUYLbhSOEageSDyFA59zbiyIAOHGpJQeu8NmjNPKEKiMjcxY7CPW1bEV0oLfB-1hljHgbyzogFaSOMWppPKzdxK1KU_kumtiF8sXOnpvwUNQ";
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
