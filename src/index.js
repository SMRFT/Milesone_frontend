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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTVFItQVBJLVRJTi1SIiwiU0hJLVAtU0lDVS1SVyIsIlNULVAtQ01ULVIiLCJNREMtQVBJLVJETC1SIiwiU0ktUi1JTkQiLCJTSEktUC1PVC1SVyIsIk1EQy1QLUdBVC1SVyIsIkVSLVAtRVJCLVJXIiwiU1QtQVBJLUVNUC1SIiwiR0wtUC1FTC1SVyIsIlNISS1QLUZPUk0tUlciLCJTSEktUC1IQU5ELVJXIiwiTURDLUFQSS1QQVQtUiIsIlNUUi1BUEktSUwtUiIsIlNISS1QLU1PQ0stUlciLCJHTC1QLUVBRC1SVyIsIkVSLVAtRVJHQVMtUlciLCJTSEktUC1JTkMtUlciLCJNREMtUC1SRUctUiIsIlNISS1QLUYxUy1SVyIsIlNJTi1QLUVOUUwtUlciLCJTSEktUC1GMVItUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1QTlAtUlciLCJTSU4tQVBJLU9SLVJXIiwiU0hJLVAtT1BELVJXIiwiR0wtUC1FRC1SVyIsIk1EQy1QLVBOUC1SIiwiU1QtUC1ERVMtUlciLCJTVFItQVBJLVZMLVJXIiwiU0hJLVAtTVJJLVJXIiwiU0lOLVItU1RBIiwiU0hJLVAtQ0hFTU9SLVJXIiwiU1RSLUFQSS1UUkxSLVIiLCJTSEktUC1DVC1SVyIsIk1EQy1QLVJERS1SVyIsIlNISS1QLUZSTlQtUlciLCJFUi1QLUVSVkItUlciLCJTSU4tQVBJLVNGLVIiLCJTSEktUC1YUkFZLVJXIiwiU1QtUC1TTk8tUlciLCJHUC1QLUdDTi1SIiwiU1QtUC1UREwtUiIsIk1EQy1BUEktQVQtUlciLCJTSU4tQVBJLUdJQy1SIiwiTURDLVAtUE5QUi1SIiwiU0lOLUFQSS1JRi1SVyIsIkVSLVItRVJTQSIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtTklDVVItUlciLCJTSEktUC1GMi1SVyIsIlNISS1QLURJQS1SVyIsIlNJTi1QLUdETC1SVyIsIk1EQy1QLUdEVFMtUiIsIlNULVItQSIsIkdMLVAtUlNFLVJXIiwiU0hJLVAtRjJTLVJXIiwiU0hJLVAtUkVDUi1SVyIsIlNISS1QLUYzLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTVFItQVBJLVRSTC1SIiwiU0hJLVAtRjEtUlciLCJTSEktUC1GMlNSLVJXIiwiTURDLUFQSS1USFItUiIsIkVSLVAtRVJSRVAtUlciLCJTSEktUC1DSEVNTy1SVyIsIlNJTi1BUEktRlUtUlciLCJTVFItUC1USU5SLVIiLCJTSEktUC1QSEFSTS1SVyIsIlNUUi1BUEktSUwiLCJNREMtUC1VQVMtUlciLCJTSEktUC1QSFktUlciLCJTVFItUC1USU5SLVJXIiwiU0lOLUFQSS1PUlItUiIsIk1EQy1BUEktQ0RSLVIiLCJHTC1QLVAtUlciLCJTVC1QLURFUy1SIiwiU1RSLUFQSS1USU4tUlciLCJFUi1BUEktRVJVQi1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIk1EQy1QLVJFRy1SVyIsIlNISS1QLVNVUElOVi1SVyIsIk1EQy1QLVNPUi1SIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLUFTTS1SVyIsIlNISS1QLVJFQy1SVyIsIk1EQy1QLUVGLVJXIiwiTURDLUFQSS1MQk4tUiIsIk1EQy1QLUNERS1SVyIsIlNISS1QLU1SRC1SVyIsIk1EQy1QLUNBLVJXIiwiU1RSLVAtSUNTLVIiLCJNREMtQVBJLUdBUy1SIiwiU0hJLVAtRjNSLVJXIiwiU0hJLVAtU0lDVVItUlciLCJTVC1QLU5URi1SVyIsIk1EQy1BUEktUlRTLVIiLCJHTC1QLUFORC1SVyIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1NSUNVUi1SVyIsIlNISS1QLUVYUC1SVyIsIkdMLVAtTkRDLVJXIiwiU0hJLVAtQVZBSUwtUlciLCJTSEktUC1FTVJSLVJXIiwiU0hJLVAtREVMUkFXLVJXIiwiU1QtUC1CUkQtUiIsIlNISS1QLURFTC1SVyIsIlNUUi1BUEktVkwtUiIsIkdMLVAtRVAtUlciLCJNREMtQVBJLUFULVIiLCJFUi1QLUVSR1BSLVJXIiwiRVItUC1FUkFTLVJXIiwiTURDLVAtUFRFLVJXIiwiU1QtUC1UREwtUlciLCJTSEktUC1HRVRSQVctUlciLCJTSEktUC1GMlItUlciLCJTSEktUC1VUEQtUlciLCJTSEktUC1JTkMiLCJTSEktUC1UUkFJTlItUlciLCJTSEktUC1MQUItUlciLCJTSEktUC1NSUNVLVJXIiwiU1QtQVBJLUNSRC1SVyIsIk1EQy1QLUdBRC1SVyIsIlNISS1QLUdJLVIiLCJTVC1QLUNNVC1SVyIsIlNISS1QLUhSLVJXIiwiU1RSLVItQSIsIlNISS1QLUVNUi1SVyIsIlNISS1QLUlOQ0MtUlciLCJNREMtUC1UUkItUlciLCJNREMtUC1BRC1SVyIsIlNULUFQSS1UUkxSLVJXIiwiU1RSLUFQSS1JTC1SVyIsIlNULUFQSS1BTUMtUlciLCJHTC1QLUVCVC1SVyIsIlNJTi1QLUVOUS1SVyIsIlNULVAtTlRGLVIiLCJTSEktUC1OSUNVLVJXIiwiU1RSLUFQSS1UUkwtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOltdLCJhbGxvd2VkLW91dGxldHMiOltdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4NDc5MjkzNywiZXhwIjoxNzg0ODc5OTM3fQ.SvEL1hrJTRyRpgvxzLdUsfdqJfOphxQDEhbLkDbQFDz3sFg_2COQ1_1VK-6USqtMmvhqhtAn138OfDubQZ4kY71Ut-SASRbFyWXzeUYIYg_NUozOOfJH_pcBsw7axtSpGyvirOvsRMDKhKsEHiEthXq0kShKmaLKKTrrMkC3qkSvdkglo_XU5R1mKsx1ffRBlqgfDdxgY7Uy_STqfiz5ZyeyhA7IutJ5IfkCd9A9TredJXfN3dUjwJk_oJXExx2E0GzjQnwSnzfDSpMZd4kCoPTHynuGb7dOw1-H7osGvOequxmwIwYDyctnGaSRUCFUD5uMBbjf8Hu7Ai_2VtJshw";
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
  console.log("allowedActions", allowedActions)
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