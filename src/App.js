import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
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

// Wrapper for the main content to shift it to the right of the sidebar
const ContentWrapper = styled.div`
  margin-left: 200px; /* Same width as the sidebar */
  padding: 20px 80px;
`;

const App = () => {
  const location = useLocation(); // Get the current route

  // Check token on app initialization
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Token not available, redirect to external login
      const REDIRECT_URL =
        process.env.REACT_APP_LOGIN_REDIRECT_URL ||
        "https://loginshanmuga.netlify.app/";
      window.location.href = REDIRECT_URL;
      return;
    }
  }, []);

  // Paths where you don't want the sidebar to be displayed
  const noSidebarPaths = ["/EmployeeRegistration"];

  return (
    <>
      {/* Conditionally render the Sidebar only on routes that don't match the paths in noSidebarPaths */}
      {!noSidebarPaths.includes(location.pathname) && <Sidebar />}
      {noSidebarPaths.includes(location.pathname) ? (
        <Routes>
          <Route path="/" element={<Navigate to="/Registration" replace />} />
          <Route
            path="/EmployeeRegistration"
            element={<EmployeeRegistration />}
          />
          {/* Redirect any other path to Registration when no sidebar */}
          <Route path="*" element={<Navigate to="/Registration" replace />} />
        </Routes>
      ) : (
        <ContentWrapper>
          <Routes>
            {/* Default route redirects to Registration */}
            <Route path="/" element={<Navigate to="/Registration" replace />} />
            <Route path="/Registration" element={<Registration />} />
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

            <Route path="Accounts" element={<Accounts />} />

            {/* Catch all route - redirect to Registration */}
            <Route path="*" element={<Navigate to="/Registration" replace />} />
          </Routes>
        </ContentWrapper>
      )}
    </>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
