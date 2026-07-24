"use client";
import { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaUserPlus,
  FaFileInvoiceDollar,
  FaChartBar,
  FaCalculator,
  FaCaretDown,
  FaClipboardList,
  FaReceipt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

// Mobile Menu Button
const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background-color: #557153;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: #7a9c78;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Overlay for mobile
const Overlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    animation: ${fadeIn} 0.3s ease;
  }
`;

// Styled components
const SidebarContainer = styled.div`
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #dce2cb;
  padding: 2rem 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
  transition: all 0.3s ease;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
  }

  @media (max-width: 768px) {
    height: 100vh;
    max-height: 100vh;
    width: 280px;
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    z-index: 1000;
    animation: ${props => props.isOpen ? slideIn : 'none'} 0.3s ease;
    padding: 1.5rem 0;
  }

  @media (max-width: 480px) {
    width: 260px;
  }
`;

const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-family: "Baloo Tamma 2", cursive;
    font-size: 1.5rem;
    color: #557153;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #557153;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #7a9c78;
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
`;

const SidebarItem = styled.li`
  position: relative;
`;

const activeItemStyles = css`
  background-color: #a1c181;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  svg {
    color: white;
  }
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background-color: #557153;
    border-radius: 0 4px 4px 0;
  }
`;

const SidebarNavLink = styled(NavLink)`
  color: #333;
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1rem;
  font-family: "Baloo Tamma 2", cursive;
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  svg {
    margin-right: 12px;
    font-size: 1.2rem;
    color: #557153;
    transition: all 0.3s ease;
  }
  &:hover {
    background-color: rgba(161, 193, 129, 0.2);
    transform: translateX(5px);
  }
  &.active {
    ${activeItemStyles}
  }
`;

const DropdownButton = styled.div`
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  font-size: 1rem;
  font-family: "Baloo Tamma 2", cursive;
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  svg:first-child {
    margin-right: 12px;
    font-size: 1.2rem;
    color: #557153;
  }
  &:hover {
    background-color: rgba(161, 193, 129, 0.2);
    transform: translateX(5px);
  }
  ${(props) => props.active && activeItemStyles}
`;

const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  ${(props) =>
    props.open &&
    css`
      transform: rotate(180deg);
    `}
`;

const SubMenu = styled.div`
  margin-top: 0.5rem;
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  animation: ${fadeIn} 0.3s ease forwards;
`;

const SubLink = styled(NavLink)`
  color: #333;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  text-decoration: none;
  font-size: 0.95rem;
  display: block;
  border-radius: 8px;
  font-family: "Baloo Tamma 2", cursive;
  transition: all 0.3s ease;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #557153;
    opacity: 0.7;
  }
  &:hover {
    background-color: rgba(161, 193, 129, 0.2);
    transform: translateX(5px);
  }
  &.active {
    background-color: #a1c181;
    color: white;
    font-weight: 600;
    &::before {
      background-color: white;
      opacity: 1;
    }
  }
`;

const SignOutWrapper = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: auto;
`;

const SignOutButton = styled(SidebarNavLink)`
  background-color: #557153;
  color: white;
  margin: 0;
  &.active {
    background-color: #557153;
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    &::before {
      background-color: white;
    }
  }
  &:hover {
    background-color: #7a9c78;
    transform: translateX(5px);
  }
  svg {
    color: white;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportDropdown, setIsReportDropdown] = useState(false);
  const [isFrontOfficeDropdown, setIsFrontOfficeDropdown] = useState(false);
  const [isBillingDropdown, setIsBillingDropdown] = useState(false);
  const [isAttendanceDropdown, setIsAttendanceDropdown] = useState(false);
  const [isHistoryRecordDropdown, setIsHistoryRecordDropdown] = useState(false);
  const [isAssessmentDropdown, setIsAssessmentDropdown] = useState(false);
  const [isGoalsDropdown, setIsGoalsDropdown] = useState(false);
  const [isAppoinmentDropdown, setIsAppoinmentDropdown] = useState(false);
  const [isDevelopmentGoalsDropdown, setIsDevelopmentGoalsDropdown] = useState(false);
  const [isLeaveApprovalDropdown, setIsLeaveApprovalDropdown] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Get user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem("role") || "Receptionist";
    setUserRole(role);
    console.log("User role from localStorage:", role);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleReport = () => {
    setIsReportDropdown(!isReportDropdown);
  };

  const isReportActive =
    location.pathname === "/TherapyReports" ||
    location.pathname === "/OPReport" ||
    location.pathname === "/OthersReport" ||
    location.pathname === "/SourceOfReferral" ||
    location.pathname === "/PendingPaymentReport";

  const toggleAttendance = () => {
    setIsAttendanceDropdown(!isAttendanceDropdown);
  };
  
  const isAttendanceActive =
    location.pathname === "/Attendance" ||
    location.pathname === "/AttendanceReport" ||
    location.pathname === "/OldAttendanceReport" ||
    location.pathname === "/SessionAttendance" ||
    location.pathname === "/SessionAttendanceReport";

    const isGoals =
    location.pathname === "/Goals" ||
    location.pathname === "/GoalsView" ||
    location.pathname === "/GoalsReport";

    const toggleGoals = () => {
      setIsGoalsDropdown(!isGoalsDropdown);
    };

    const isAppoinment =
    location.pathname === "/AppoinmentScedule" ||
    location.pathname === "/Appointmentdashboard" ||
    location.pathname === "/AppointmentReport";

    const toggleAppoinment = () => {
      setIsAppoinmentDropdown(!isAppoinmentDropdown);
    };

    const isDevelopmentGoalsActive =
    location.pathname === "/DevelopmentGoalsView" ||
    location.pathname === "/DevelopmentGoals" ||
    location.pathname === "/DevelopmentGoalsReport";

    const toggleDevelopmentGoals = () => {
      setIsDevelopmentGoalsDropdown(!isDevelopmentGoalsDropdown);
    };

  const toggleHistoryRecord = () => {
    setIsHistoryRecordDropdown(!isHistoryRecordDropdown);
  };
  
  const isHistoryRecord =
    location.pathname === "/Historyrecordingsheetview" ||
    location.pathname === "/Historyrecordingsheetreport";

  const toggleAssessment = () => {
    setIsAssessmentDropdown(!isAssessmentDropdown);
  };
  
  const isAssessment =
    location.pathname === "/ClinicalPsychologyAssessment" ||
    location.pathname === "/OccupationalTherapyAssessment" ||
    location.pathname === "/PhysiotherapyAssessment" ||
    location.pathname === "/SpeechTherapyAssessment" ||
    location.pathname === "/ClinicalPsychologyReport" ||
    location.pathname === "/OccupationalTherapyReport" ||
    location.pathname === "/PhysiotherapyReport" ||
    location.pathname === "/SpeechTherapyReport" ||
    location.pathname === "/AssessmentAnalysis" ||
    location.pathname === "/AssessmentAnalysisReport";

  const toggleFrontOffice = () => {
    setIsFrontOfficeDropdown(!isFrontOfficeDropdown);
  };

  const isFrontOfficeActive =
    location.pathname === "/Registration" ||
    location.pathname === "/PatientEdit" ||
    location.pathname === "/ReferralDrEdit" ||
    location.pathname === "/ConsultantDrEdit";

  const toggleBilling = () => {
    setIsBillingDropdown(!isBillingDropdown);
  };

  const isBillingActive =
    location.pathname === "/PatientCardView/Assessments" ||
    location.pathname === "/Therapybillingview" ||
    location.pathname === "/PendingPayment" ||
    location.pathname === "/OthersView";

  const toggleLeaveApproval = () => {
    setIsLeaveApprovalDropdown(!isLeaveApprovalDropdown);
  };
  
  const isLeaveApproval = location.pathname === "/LeaveApprovalForm";
  const isLeaveApprovalReport = location.pathname === "/LeaveApprovalReport";

  const renderMenuItems = () => {
    switch (userRole) {
      case "Receptionist":
        return (
          <>
            <SidebarItem>
              <DropdownButton
                onClick={toggleFrontOffice}
                active={isFrontOfficeActive}
              >
                <FaClipboardList />
                <span>Front Office</span>
                <DropdownIcon open={isFrontOfficeDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isFrontOfficeDropdown && (
                <SubMenu>
                  <SubLink to="/Registration">
                    <span>Registration</span>
                  </SubLink>
                  <SubLink to="/PatientEdit">
                    <span>Patient Edit</span>
                  </SubLink>
                  <SubLink to="/ReferralDrEdit">
                    <span>Referral Dr Edit</span>
                  </SubLink>
                  <SubLink to="/ConsultantDrEdit">
                    <span>Consultant Dr Edit</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

              <SidebarItem>
              <DropdownButton
                onClick={toggleAppoinment}
                active={isAppoinment}
              >
                <FaClipboardList />
                <span>Appoinment</span>
                <DropdownIcon open={isAppoinmentDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAppoinmentDropdown && (
                <SubMenu>
                  <SubLink to="/AppoinmentScedule">
                    <span>Appoinment Scedule</span>
                  </SubLink>
                  <SubLink to="/Appointmentdashboard">
                    <span>Appointment dashboard</span>
                  </SubLink>
                  <SubLink to="/AppointmentReport">
                    <span>Appointment report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleAttendance}
                active={isAttendanceActive}
              >
                <FaClipboardList />
                <span>Attendance</span>
                <DropdownIcon open={isAttendanceDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAttendanceDropdown && (
                <SubMenu>
                  <SubLink to="/AttendanceEdit">
                    <span>Attendance Edit</span>
                  </SubLink>
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  <SubLink to="/OldAttendanceReport">
                    <span>Old Attendance Report</span>
                  </SubLink>
                  <SubLink to="/Attendance">
                    <span>Patient Attendance Management</span>
                  </SubLink>
                  <SubLink to="/SessionAttendance">
                    <span>Session Attendance</span>
                  </SubLink>
                  <SubLink to="/SessionAttendanceReport">
                    <span>Session Attendance Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton onClick={toggleBilling} active={isBillingActive}>
                <FaReceipt />
                <span>Billing</span>
                <DropdownIcon open={isBillingDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isBillingDropdown && (
                <SubMenu>
                  <SubLink to="/PatientCardView/Assessments">
                    <span>Assessment</span>
                  </SubLink>
                  <SubLink to="/Therapybillingview">
                    <span>Therapy</span>
                  </SubLink>
                  <SubLink to="/OthersView">
                    <span>Others</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton onClick={toggleReport} active={isReportActive}>
                <FaChartBar />
                <span>Reports</span>
                <DropdownIcon open={isReportDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isReportDropdown && (
                <SubMenu>
                  <SubLink to="/TherapyReports">
                    <span>Therapy Reports</span>
                  </SubLink>
                  <SubLink to="/OldTherapyReport">
                    <span>Old Therapy Report</span>
                  </SubLink>
                  <SubLink to="/OPReport">
                    <span>OP Report</span>
                  </SubLink>
                  <SubLink to="/SourceOfReferral">
                    <span>Referral Report</span>
                  </SubLink>
                  <SubLink to="/OthersReport">
                    <span>Others Report</span>
                  </SubLink>
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
            <SidebarItem>
              <SidebarNavLink to="/OldAccounts">
                <FaCalculator />
                Old Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );

      case "Admin":
        return (
          <>
          <SidebarItem>
              <DropdownButton
                onClick={toggleAppoinment}
                active={isAppoinment}
              >
                <FaClipboardList />
                <span>Appoinment</span>
                <DropdownIcon open={isAppoinmentDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAppoinmentDropdown && (
                <SubMenu>
                  {/* <SubLink to="/AppoinmentScedule">
                    <span>Appoinment Scedule</span>
                  </SubLink> */}
                  <SubLink to="/Appointmentdashboard">
                    <span>Appointment dashboard</span>
                  </SubLink>
                  <SubLink to="/AppointmentReport">
                    <span>Appointment report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleAttendance}
                active={isAttendanceActive}
              >
                <FaClipboardList />
                <span>Attendance</span>
                <DropdownIcon open={isAttendanceDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAttendanceDropdown && (
                <SubMenu>
                  <SubLink to="/AttendanceApprovalPage">
                    <span>Attendance Approval</span>
                  </SubLink>
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  <SubLink to="/OldAttendanceReport">
                    <span>Old Attendance Report</span>
                  </SubLink>
                  <SubLink to="/SessionAttendance">
                    <span>Session Attendance</span>
                  </SubLink>
                  <SubLink to="/SessionAttendanceReport">
                    <span>Session Attendance Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleHistoryRecord}
                active={isHistoryRecord}
              >
                <FaClipboardList />
                <span>History Recording</span>
                <DropdownIcon open={isHistoryRecordDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isHistoryRecordDropdown && (
                <SubMenu>
                  <SubLink to="/Historyrecordingsheetview">
                    <span>History Recording Sheet</span>
                  </SubLink>
                  <SubLink to="/HistoryrecordingsheetReport">
                    <span>History Recording Report</span>
                  </SubLink>
                  <SubLink to="/OverAllImpressionReport">
                    <span>Over All Impression Report</span>
                  </SubLink>                  
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleGoals}
                active={isGoals}
              >
                <FaClipboardList />
                <span>Therapeutic Goals</span>
                <DropdownIcon open={isGoalsDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isGoalsDropdown && (
                <SubMenu>
                  <SubLink to="/GoalsView">
                    <span>Goals View</span>
                  </SubLink>
                  <SubLink to="/GoalsReport">
                    <span>Goals Report</span>
                  </SubLink>
                  <SubLink to="/GoalsMasterData">
                    <span>Activity Library</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleDevelopmentGoals}
                active={isDevelopmentGoalsActive}
              >
                <FaChartBar />
                <span>Development Goals</span>
                <DropdownIcon open={isDevelopmentGoalsDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isDevelopmentGoalsDropdown && (
                <SubMenu>
                  <SubLink to="/DevelopmentGoalsView">
                    <span>Set Goals</span>
                  </SubLink>
                  <SubLink to="/DevelopmentGoalsReport">
                    <span>Goals Report</span>
                  </SubLink>
                  <SubLink to="/GoalsMasterData">
                    <span>Goal Library</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>
            <SidebarItem>
              <DropdownButton
                onClick={toggleLeaveApproval}
                active={isLeaveApproval}
              >
                <FaClipboardList />
                <span>Leave Approval</span>
                <DropdownIcon open={isLeaveApprovalDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isLeaveApprovalDropdown && (
                <SubMenu>
                  <SubLink to="/LeaveApprovalForm">
                    <span>Leave Approval Form</span>
                  </SubLink>
                  <SubLink to="/LeaveApprovalReport">
                    <span>Leave Approval Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>
            <SidebarItem>
              <DropdownButton
                onClick={toggleAssessment}
                active={isAssessment}
              >
                <FaClipboardList />
                <span>Assessment</span>
                <DropdownIcon open={isAssessmentDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAssessmentDropdown && (
                <SubMenu>
                  <SubLink to="/ClinicalPsychologyReport">
                    <span>Clinical Psychology Report</span>
                  </SubLink>
                  <SubLink to="/OccupationalTherapyReport">
                    <span>Occupational Therapy Report</span>
                  </SubLink>
                  <SubLink to="/PhysiotherapyReport">
                    <span>Physiotherapy Report</span>
                  </SubLink>
                  <SubLink to="/SpeechTherapyReport">
                    <span>Speech Therapy Report</span>
                  </SubLink>
                  <SubLink to="/AssessmentAnalysisReport">
                    <span>Assessment Analysis Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton onClick={toggleReport} active={isReportActive}>
                <FaChartBar />
                <span>Reports</span>
                <DropdownIcon open={isReportDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isReportDropdown && (
                <SubMenu>
                  <SubLink to="/TherapyReports">
                    <span>Therapy Reports</span>
                  </SubLink>
                  <SubLink to="/OldTherapyReport">
                    <span>Old Therapy Report</span>
                  </SubLink>
                  <SubLink to="/OPReport">
                    <span>OP Report</span>
                  </SubLink>
                  <SubLink to="/SourceOfReferral">
                    <span>Referral Report</span>
                  </SubLink>
                  <SubLink to="/OthersReport">
                    <span>Others Report</span>
                  </SubLink>
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
              <SidebarNavLink to="/OldAccounts">
                <FaCalculator />
                Old Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );

      case "Pediatrician":
        return (
          <>
          <SidebarItem>
              <DropdownButton
                onClick={toggleAppoinment}
                active={isAppoinment}
              >
                <FaClipboardList />
                <span>Appoinment</span>
                <DropdownIcon open={isAppoinmentDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAppoinmentDropdown && (
                <SubMenu>
                  {/* <SubLink to="/AppoinmentScedule">
                    <span>Appoinment Scedule</span>
                  </SubLink> */}
                  <SubLink to="/Appointmentdashboard">
                    <span>Appointment dashboard</span>
                  </SubLink>
                  <SubLink to="/AppointmentReport">
                    <span>Appointment report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleHistoryRecord}
                active={isHistoryRecord}
              >
                <FaClipboardList />
                <span>History Recording</span>
                <DropdownIcon open={isHistoryRecordDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isHistoryRecordDropdown && (
                <SubMenu>
                  <SubLink to="/Historyrecordingsheetview">
                    <span>History Recording Sheet</span>
                  </SubLink>
                  <SubLink to="/HistoryrecordingsheetReport">
                    <span>History Recording Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleGoals}
                active={isGoals}
              >
                <FaClipboardList />
                <span>Therapeutic Goals</span>
                <DropdownIcon open={isGoalsDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isGoalsDropdown && (
                <SubMenu>
                  <SubLink to="/GoalsView">
                    <span>Goals View</span>
                  </SubLink>
                  <SubLink to="/GoalsReport">
                    <span>Goals Report</span>
                  </SubLink>
                  <SubLink to="/GoalsMasterData">
                    <span>Activity Library</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleDevelopmentGoals}
                active={isDevelopmentGoalsActive}
              >
                <FaChartBar />
                <span>Development Goals</span>
                <DropdownIcon open={isDevelopmentGoalsDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isDevelopmentGoalsDropdown && (
                <SubMenu>
                  <SubLink to="/DevelopmentGoalsView">
                    <span>Set Goals</span>
                  </SubLink>
                  <SubLink to="/DevelopmentGoalsReport">
                    <span>Goals Report</span>
                  </SubLink>
                  <SubLink to="/GoalsMasterData">
                    <span>Goal Library</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleLeaveApproval}
                active={isLeaveApproval}
              >
                <FaClipboardList />
                <span>Leave Approval</span>
                <DropdownIcon open={isLeaveApprovalDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isLeaveApprovalDropdown && (
                <SubMenu>
                  <SubLink to="/LeaveApprovalForm">
                    <span>Leave Approval Form</span>
                  </SubLink>
                  <SubLink to="/LeaveApprovalReport">
                    <span>Leave Approval Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleAssessment}
                active={isAssessment}
              >
                <FaClipboardList />
                <span>Assessment</span>
                <DropdownIcon open={isAssessmentDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAssessmentDropdown && (
                <SubMenu>
                  <SubLink to="/ClinicalPsychologyAssessment">
                    <span>Clinical Psychology Assessment</span>
                  </SubLink>
                  <SubLink to="/OccupationalTherapyAssessment">
                    <span>Occupational Therapy Assessment</span>
                  </SubLink>
                  <SubLink to="/PhysiotherapyAssessment">
                    <span>Physiotherapy Assessment</span>
                  </SubLink>
                  <SubLink to="/SpeechTherapyAssessment">
                    <span>Speech Therapy Assessment</span>
                  </SubLink>
                  <SubLink to="/ClinicalPsychologyReport">
                    <span>Clinical Psychology Report</span>
                  </SubLink>
                  <SubLink to="/OccupationalTherapyReport">
                    <span>Occupational Therapy Report</span>
                  </SubLink>
                  <SubLink to="/PhysiotherapyReport">
                    <span>Physiotherapy Report</span>
                  </SubLink>
                  <SubLink to="/SpeechTherapyReport">
                    <span>Speech Therapy Report</span>
                  </SubLink>
                  <SubLink to="/AssessmentAnalysis">
                    <span>Assessment Analysis</span>
                  </SubLink>
                  <SubLink to="/AssessmentAnalysisReport">
                    <span>Assessment Analysis Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleAttendance}
                active={isAttendanceActive}
              >
                <FaClipboardList />
                <span>Attendance</span>
                <DropdownIcon open={isAttendanceDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isAttendanceDropdown && (
                <SubMenu>
                  <SubLink to="/SessionAttendanceReport">
                    <span>Session Attendance Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>
          </>
        );

      case "Accounts":
        return (
          <>
            <SidebarItem>
              <DropdownButton onClick={toggleReport} active={isReportActive}>
                <FaChartBar />
                <span>Reports</span>
                <DropdownIcon open={isReportDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isReportDropdown && (
                <SubMenu>
                  <SubLink to="/TherapyReports">
                    <span>Therapy Reports</span>
                  </SubLink>
                  <SubLink to="/OldTherapyReport">
                    <span>Old Therapy Report</span>
                  </SubLink>
                  <SubLink to="/OPReport">
                    <span>OP Report</span>
                  </SubLink>
                  <SubLink to="/SourceOfReferral">
                    <span>Referral Report</span>
                  </SubLink>
                  <SubLink to="/OthersReport">
                    <span>Others Report</span>
                  </SubLink>
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
            <SidebarItem>
              <SidebarNavLink to="/OldAccounts">
                <FaCalculator />
                Old Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );

      default:
        return (
          <>
            <SidebarItem>
              <DropdownButton
                onClick={toggleFrontOffice}
                active={isFrontOfficeActive}
              >
                <FaClipboardList />
                <span>Front Office</span>
                <DropdownIcon open={isFrontOfficeDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isFrontOfficeDropdown && (
                <SubMenu>
                  <SubLink to="/Registration">
                    <span>Registration</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton onClick={toggleBilling} active={isBillingActive}>
                <FaReceipt />
                <span>Billing</span>
                <DropdownIcon open={isBillingDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isBillingDropdown && (
                <SubMenu>
                  <SubLink to="/PatientCardView/Assessments">
                    <span>Assessment</span>
                  </SubLink>
                  <SubLink to="/Therapybillingview">
                    <span>Therapy</span>
                  </SubLink>
                  <SubLink to="/PendingPayment">
                    <span>Pending Payment</span>
                  </SubLink>
                  <SubLink to="/OthersView">
                    <span>Others</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton onClick={toggleReport} active={isReportActive}>
                <FaChartBar />
                <span>Reports</span>
                <DropdownIcon open={isReportDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isReportDropdown && (
                <SubMenu>
                  <SubLink to="/TherapyReports">
                    <span>Therapy Reports</span>
                  </SubLink>
                  <SubLink to="/OPReport">
                    <span>OP Report</span>
                  </SubLink>
                  <SubLink to="/SourceOfReferral">
                    <span>Referral Report</span>
                  </SubLink>
                  <SubLink to="/OthersReport">
                    <span>Others Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <DropdownButton
                onClick={toggleDevelopmentGoals}
                active={isDevelopmentGoalsActive}
              >
                <FaChartBar />
                <span>Development Goals</span>
                <DropdownIcon open={isDevelopmentGoalsDropdown}>
                  <FaCaretDown />
                </DropdownIcon>
              </DropdownButton>
              {isDevelopmentGoalsDropdown && (
                <SubMenu>
                  <SubLink to="/DevelopmentGoalsView">
                    <span>Set Goals</span>
                  </SubLink>
                  <SubLink to="/DevelopmentGoalsReport">
                    <span>Goals Report</span>
                  </SubLink>
                  <SubLink to="/GoalsMasterData">
                    <span>Goal Library</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );
    }
  };

  return (
    <>
      <MobileMenuButton onClick={toggleSidebar}>
        <FaBars />
      </MobileMenuButton>

      <Overlay isOpen={isOpen} onClick={toggleSidebar} />

      <SidebarContainer id="sidebar-container" isOpen={isOpen}>
        <Logo>
          <h1>Milestone Center</h1>
          <CloseButton onClick={toggleSidebar}>
            <FaTimes />
          </CloseButton>
        </Logo>
        <SidebarMenu>{renderMenuItems()}</SidebarMenu>
        <SignOutWrapper>
          <SignOutButton
            to="#"
            onClick={() => {
              window.location.href = "/secure";
            }}
          >
            <FaSignOutAlt />
            Sign Out
          </SignOutButton>
        </SignOutWrapper>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;