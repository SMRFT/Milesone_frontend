import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import styled, { createGlobalStyle } from "styled-components";
import Sidebar from "./Components/Sidebar";
import Registration from "./Components/Registration";
import Assessments from "./Components/Assessments";
import PatientCardView from "./Components/PatientCardView";
import DevelopmentalScreening from "./Components/DevelopmentalScreening";
import FetchDevelopmentkids from "./Components/FetchDevelopmentkids";
import FetchMchart from "./Components/FetchMchart";
import Mchart from "./Components/Mchart";
import PediatricAssessmentForm from "./Components/PediatricAssessmentForm";
import DenverModel from "./Components/DenverModel";
import SkillTestReport from "./Components/SkillTestReport";
import "bootstrap/dist/css/bootstrap.min.css";
import HeightGraphForBoys from "./Components/HeightGraphForBoys";
import PediatricAssessmentReport from "./Components/PediatricAssessmentReport";
import WeightGraphForBoys from "./Components/WeightGraphForBoys";
import HeightGraphForGirls from "./Components/HeightGraphForGirls";
import WeightGraphForGirls from "./Components/WeightGraphForGirls";
import OPReport from "./Components/OPReport";
import TherapyBilling from "./Components/TherapyBilling";
import Therapybillingview from "./Components/Therapybillingview";
import PendingPayment from "./Components/PendingPayment";
import EmployeeRegistration from "./Components/EmployeeRegistration";
import TherapyReports from "./Components/TherapyReports";
import SourceOfReferral from "./Components/SourceOfReferral";
import "./App.css";
import MChartReport from "./Components/MchartReport";
import Accounts from "./Components/Accounts";
import ChildLanguageReport from "./Components/ChildLanguageReport";
import ChildLanguageAssessment from "./Components/ChildLanguageAssessment";
import FetchChildAssessment from "./Components/FetchChildAssessment";
import DevelopmentScreeningReport from "./Components/DevelopmentScreeningReport";
import FetchDevelopmentScreeningReport from "./Components/FetchDevelopmentScreeningReport";
import FetchCBCL from "./Components/FetchCBCL";
import CBCLforGirls6To18y from "./Components/CBCLforGirls6To18y";
import FetchCBCLforGirls6To18yReports from "./Components/FetchCBCLforGirls6To18yReports";
import CBCLforGirls6To18yReports from "./Components/CBCLforGirls6To18yReports";
import OthersView from "./Components/OthersView";
import OthersBilling from "./Components/OthersBilling";
import OthersReport from "./Components/OthersReport";
import PatientEdit from "./Components/PatientEdit";
import ReferralDrEdit from "./Components/ReferralDrEdit";
import ConsultantDrEdit from "./Components/ConsultantDrEdit";
import Attendance from "./Components/Attendance";
import AttendanceSessionEditor from "./Components/AttendanceEdit";
import PendingPaymentReport from "./Components/PendingPaymentReport";
import AttendanceReport from "./Components/AttendanceReport";
import OldAttendanceReport from "./Components/OldAttendanceReport"; 
import OldAccounts from "./Components/OldAccounts";
import AttendanceApprovalPage from "./Components/AttendanceApprovalPage"; 
import HistoryRecordingSheet from "./Components/Historyrecordingsheet";
import Historyrecordingsheetview from "./Components/Historyrecordingsheetview";
import Historyrecordingsheetreport from "./Components/Historyrecordingsheetreport";
import OldTherapyReport from "./Components/OldTherapyReport";
import OverAllImpressionReport from "./Components/OverAllImpressionReport";
import ClinicalPsychologyAssessment from "./Components/ClinicalPsychologyAssessment";
import OccupationalTherapyAssessment from "./Components/OccupationalTherapyAssessment";
import PhysiotherapyAssessment from "./Components/PhysiotherapyAssessment";
import SpeechTherapyAssessment from "./Components/SpeechTherapyAssessment";
import ClinicalPsychologyReport from "./Components/ClinicalPsychologyAssessmentReport";
import OccupationalTherapyReport from "./Components/OccupationalTherapyAssessmentReport";
import PhysiotherapyReport from "./Components/PhysiotherapyAssessmentReport";
import SpeechTherapyReport from "./Components/SpeechTherapyReport";
import AssessmentAnalysis from "./Components/AssessmentAnalysis";
import AssessmentAnalysisReport from "./Components/AssessmentAnalysisReport";
import Goals from "./Components/Goals"; // No curly braces
import GoalsView from "./Components/GoalsView";
import GoalsReport from "./Components/GoalsReport";

// Wrapper for the main content to shift it to the right of the sidebar
// --- 1. GLOBAL STYLE TO REMOVE BROWSER SCROLL ---
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden; /* This prevents the entire page from scrolling */
    font-family: 'Inter', sans-serif; /* Or your preferred font */
  }
  
  #root {
    height: 100%;
  }
`;

// --- 2. LAYOUT STYLED COMPONENTS ---

const AppContainer = styled.div`
  display: flex;
  height: 100vh; /* Takes full viewport height */
  width: 100vw;
  background-color: #f8f9fa;
  overflow: hidden; /* Ensures nothing spills out of the main app container */
`;

const ContentWrapper = styled.div`
  flex: 1; /* Takes remaining width */
  height: 100vh; /* Full height */
  overflow-y: auto; /* SCROLL IS HERE: Only this area scrolls vertically */
  transition: margin-left 0.3s ease-in-out;

  /* --- DESKTOP VIEW --- */
  /* Sidebar is fixed 250px. We push content 250px right to avoid overlap */
  margin-left: 250px; 
  padding: 2rem;

  /* Smooth scrolling for internal content */
  scroll-behavior: smooth;

  /* Custom Scrollbar for Content */
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; }
  &::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

  /* --- MOBILE VIEW --- */
  @media (max-width: 768px) {
    margin-left: 0; /* Sidebar becomes overlay, so margin is removed */
    padding: 1rem;
    padding-top: 5rem; /* Space for Hamburger button */
    
    /* Ensure scrolling works smoothly on touch devices */
    -webkit-overflow-scrolling: touch; 
  }
`;

const App = () => {
  const location = useLocation(); // Get the current route

  
const [defaultPath, setDefaultPath] = React.useState("");


  // Check token on app initialization
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Token not available, redirect to external login
      const REDIRECT_URL =
        process.env.REACT_APP_LOGIN_REDIRECT_URL || "https://shinova.in/login";
      window.location.href = REDIRECT_URL;
      return;
    }
  // Parse the stored allowed actions (assuming they’re stored in localStorage or token payload)
  const storedActions = localStorage.getItem("allowedActions");
  console.log("action",storedActions)
  let allowedActions = [];
  try {
    allowedActions = JSON.parse(storedActions) || [];
  } catch {
    allowedActions = [];
  }

  // Determine role
  const role = "";
  if (allowedActions.includes("MDC-R-ADM")) {
    role = "Admin";
  } else if (allowedActions.includes("MDC-R-REC")) {
    role = "Receptionist";
  } else if (allowedActions.includes("MDC-R-PDC")) {
    role = "Pediatrician";
  } else if (allowedActions.includes("MDC-R-ACT")) {
    role = "Accounts";
  }
console.log(role,"role")
  // Set default route by role
  switch (role) {
    case "Admin":
      setDefaultPath("/AttendanceReport");
      break;
    case "Receptionist":
      setDefaultPath("/Registration");
      break;
    case "Pediatrician":
      setDefaultPath("/Historyrecordingsheetview");
      break;
    case "Accounts":
      setDefaultPath("/Accounts");
      break;
    default:
      setDefaultPath("/Registration");
  }
}, []);

  // Paths where you don't want the sidebar to be displayed
  const noSidebarPaths = ["/EmployeeRegistration"];

  return (
    <>
    
      {/* Conditionally render the Sidebar only on routes that don't match the paths in noSidebarPaths */}
      {!noSidebarPaths.includes(location.pathname) && <Sidebar />}
        <ToastContainer
    position="top-right"
    autoClose={2000} // 2 seconds
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
  
      {noSidebarPaths.includes(location.pathname) ? (
        <Routes>
          <Route path="/" element={<Navigate to={defaultPath} replace />} />
          <Route
            path="/EmployeeRegistration"
            element={<EmployeeRegistration />}
          />
          {/* Redirect any other path to Registration when no sidebar */}
          <Route path="/" element={<Navigate to={defaultPath} replace />} />

        </Routes>
      ) : (
        <ContentWrapper>
          <Routes>
            {/* Default route redirects to Registration */}
            <Route path="/" element={<Navigate to={defaultPath} replace />} />

            <Route path="/Registration" element={<Registration />} />
            <Route path="/PatientEdit" element={<PatientEdit />} />
            <Route path="/ReferralDrEdit" element={<ReferralDrEdit />} />
            <Route path="/ConsultantDrEdit" element={<ConsultantDrEdit />} />
            <Route
              path="/PatientCardView/:type"
              element={<PatientCardView />}
            />
            <Route path="/assessments" element={<Assessments />} />

            <Route path="/FetchMchart" element={<FetchMchart />} />
            <Route path="/Mchart" element={<Mchart />} />
            <Route path="MChartReport" element={<MChartReport />} />

            <Route
              path="/PediatricAssessmentForm"
              element={<PediatricAssessmentForm />}
            />

            <Route
              path="/WeightGraphForBoys"
              element={<WeightGraphForBoys />}
            />
            <Route
              path="/HeightGraphForBoys"
              element={<HeightGraphForBoys />}
            />
            <Route
              path="/HeightGraphForGirls"
              element={<HeightGraphForGirls />}
            />
            <Route
              path="/WeightGraphForGirls"
              element={<WeightGraphForGirls />}
            />

            <Route path="/TherapyBilling" element={<TherapyBilling />} />
            <Route
              path="/Therapybillingview"
              element={<Therapybillingview />}
            />
            <Route path="/PendingPayment" element={<PendingPayment />} />

            <Route path="/OthersView" element={<OthersView />} />
            <Route path="/OthersBilling" element={<OthersBilling />} />
            <Route path="/OthersReport" element={<OthersReport />} />

            <Route path="/TherapyReports" element={<TherapyReports />} />
            <Route path="/OPReport" element={<OPReport />} />
            <Route path="/SourceOfReferral" element={<SourceOfReferral />} />

            <Route path="/DenverModel" element={<DenverModel />} />
            <Route path="/SkillTestReport" element={<SkillTestReport />} />

            <Route
              path="FetchChildAssessment"
              element={<FetchChildAssessment />}
            />
            <Route
              path="ChildLanguageAssessment"
              element={<ChildLanguageAssessment />}
            />
            <Route
              path="ChildLanguageReport"
              element={<ChildLanguageReport />}
            />

            <Route
              path="/FetchDevelopmentkids"
              element={<FetchDevelopmentkids />}
            />
            <Route
              path="/DevelopmentalScreening"
              element={<DevelopmentalScreening />}
            />
            <Route
              path="FetchDevelopmentScreeningReport"
              element={<FetchDevelopmentScreeningReport />}
            />
            <Route
              path="DevelopmentScreeningReport"
              element={<DevelopmentScreeningReport />}
            />

            <Route path="FetchCBCL" element={<FetchCBCL />} />
            <Route path="CBCLforGirls6To18y" element={<CBCLforGirls6To18y />} />
            <Route
              path="FetchCBCLforGirls6To18yReports"
              element={<FetchCBCLforGirls6To18yReports />}
            />
            <Route
              path="CBCLforGirls6To18yReports"
              element={<CBCLforGirls6To18yReports />}
            />
            <Route path="/Mchart" element={<Mchart />} />
            <Route path="/OldAccounts" element={<OldAccounts />} />
            <Route path="/Accounts" element={<Accounts />} />
            <Route path="/Attendance" element={<Attendance />} />
            <Route path="/PendingPaymentReport" element={<PendingPaymentReport />} />

            {/* Catch all route - redirect to Registration */}
            {/* <Route path="*" element={<Navigate to="/Registration" replace />} /> */}
            <Route path="/AttendanceReport" element={<AttendanceReport />} />
            <Route path="/AttendanceEdit" element={<AttendanceSessionEditor />} />

            <Route path="/AttendanceApprovalPage" element={<AttendanceApprovalPage />} />
            <Route path="/HistoryRecordingSheet" element={<HistoryRecordingSheet />} />
            <Route path="/Historyrecordingsheetview" element={<Historyrecordingsheetview />} />
            <Route path="/Historyrecordingsheetreport" element={<Historyrecordingsheetreport />} />

            <Route path="/OldAttendanceReport" element={<OldAttendanceReport />} />
            
            <Route path="/OldTherapyReport" element={<OldTherapyReport />} />
            <Route path="/OverAllImpressionReport" element={<OverAllImpressionReport />} />
            <Route path="/ClinicalPsychologyAssessment" element={<ClinicalPsychologyAssessment />} />
            <Route path="/OccupationalTherapyAssessment" element={<OccupationalTherapyAssessment />} />
            <Route path="/PhysiotherapyAssessment" element={<PhysiotherapyAssessment />} />
            <Route path="/SpeechTherapyAssessment" element={<SpeechTherapyAssessment />} />
            <Route path="/ClinicalPsychologyReport" element={<ClinicalPsychologyReport />} />
            <Route path="/OccupationalTherapyReport" element={<OccupationalTherapyReport />} />
            <Route path="/PhysiotherapyReport" element={<PhysiotherapyReport />} />
            <Route path="/SpeechTherapyReport" element={<SpeechTherapyReport />} />
            <Route path="/AssessmentAnalysis" element={<AssessmentAnalysis />} />
            <Route path="/AssessmentAnalysisReport" element={<AssessmentAnalysisReport />} />
            <Route path="/Goals" element={<Goals />} />
            <Route path="/GoalsView" element={<GoalsView />} />
            <Route path="/GoalsReport" element={<GoalsReport />} /> 

          </Routes>
        </ContentWrapper>
      )}
    </>
  );
};

const AppWithRouter = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <App />
  </Router>
);

export default AppWithRouter;
