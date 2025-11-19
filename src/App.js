import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import styled from "styled-components";
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
import PendingPaymentReport from "./Components/PendingPaymentReport";
import AttendanceReport from "./Components/AttendanceReport"; 
import AttendanceApprovalPage from "./Components/AttendanceApprovalPage"; 
import HistoryRecordingSheet from "./Components/Historyrecordingsheet";



// Wrapper for the main content to shift it to the right of the sidebar
const ContentWrapper = styled.div`
  margin-left: 200px; /* Same width as the sidebar */
  padding: 20px 80px;
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
  } else if (allowedActions.includes("MDC-R-DOC")) {
    role = "Doctor";
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
    case "Doctor":
      setDefaultPath("/Assessments");
      break;
    case "Accounts":
      setDefaultPath("/Accounts");
      break;
    default:
      setDefaultPath("/AttendanceReport");
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

            <Route path="/Accounts" element={<Accounts />} />
            <Route path="/Attendance" element={<Attendance />} />
            <Route path="/PendingPaymentReport" element={<PendingPaymentReport />} />

            {/* Catch all route - redirect to Registration */}
            {/* <Route path="*" element={<Navigate to="/Registration" replace />} /> */}
            <Route path="/AttendanceReport" element={<AttendanceReport />} />
            <Route path="/AttendanceApprovalPage" element={<AttendanceApprovalPage />} />
            <Route path="/HistoryRecordingSheet" element={<HistoryRecordingSheet />} />

           
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
