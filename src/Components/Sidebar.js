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
  FaSignOutAlt, // New icon for Sign Out
} from "react-icons/fa";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
`;

const Logo = styled.div`
  padding: 0 1.5rem 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  h1 {
    font-family: "Baloo Tamma 2", cursive;
    font-size: 1.5rem;
    color: #557153;
    margin: 0;
  }
`;

const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1; /* Allows the menu to push the sign-out button to the bottom */
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
  margin-top: auto; /* Pushes the sign-out button to the bottom */
`;

const SignOutButton = styled(SidebarNavLink)`
  background-color: #557153; /* Darker, contrasting color */
  color: white;
  margin: 0;
  &.active {
    background-color: #557153; /* Prevent active state override */
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    &::before {
        background-color: white;
    }
  }
  &:hover {
    background-color: #7a9c78; /* Lighter hover */
    transform: translateX(5px);
  }
  svg {
    color: white; /* Ensure icon is white */
  }
`;


const Sidebar = () => {
  const [isReportDropdown, setIsReportDropdown] = useState(false);
  const [isFrontOfficeDropdown, setIsFrontOfficeDropdown] = useState(false);
  const [isBillingDropdown, setIsBillingDropdown] = useState(false);
  const [isAttendanceDropdown, setIsAttendanceDropdown] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  // Get user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem("role") || "Receptionist"; // Default to Receptionist
    setUserRole(role);
    console.log("User role from localStorage:", role);
  }, []);

  const toggleReport = () => {
    setIsReportDropdown(!isReportDropdown);
  };

  // Check if any report route is active
  const isReportActive =
    location.pathname === "/TherapyReports" ||
    location.pathname === "/OPReport" ||
    location.pathname === "/OthersReport" ||
    location.pathname === "/SourceOfReferral" ||
    location.pathname === "/PendingPaymentReport"; // Added missing report route

  const toggleAttendance = () => {
    setIsAttendanceDropdown(!isAttendanceDropdown);
  };
  const isAttendanceActive =
    location.pathname === "/Attendance" ||
    location.pathname === "/AttendanceReport"; // Added missing report route

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

  // Function to render menu items based on user role
  const renderMenuItems = () => {
    switch (userRole) {
      case "Receptionist":
        return (
          <>
            {/* Front Office */}
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

            {/* Attendance */}
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
                  <SubLink to="/Attendance">
                    <span>Attendance Sheet</span>
                  </SubLink>
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  {/* <SubLink to="/AttendanceApprovalPage">
                    <span>Attendance Approvel</span>
                  </SubLink> */}
                  
                </SubMenu>
              )}
            </SidebarItem>

            {/* Billing */}
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

            {/* Reports */}
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
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            {/* Accounts */}
            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );
case "Admin":
        return (
          <>

            {/* Attendance */}
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
                  {/* <SubLink to="/Attendance">
                    <span>Attendance Sheet</span>
                  </SubLink> */}
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  <SubLink to="/AttendanceApprovalPage">
                    <span>Attendance Approvel</span>
                  </SubLink>
                  
                </SubMenu>
              )}
            </SidebarItem>

            {/* Reports */}
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
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            {/* Accounts */}
            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );

      case "Accounts":
        return (
          <>
          
            {/* Reports */}
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
                  <SubLink to="/AttendanceReport">
                    <span>Attendance Report</span>
                  </SubLink>
                  <SubLink to="/PendingPaymentReport">
                    <span>Pending Payment Report</span>
                  </SubLink>
                </SubMenu>
              )}
            </SidebarItem>

            {/* Accounts */}
            <SidebarItem>
              <SidebarNavLink to="/Accounts">
                <FaCalculator />
                Accounts
              </SidebarNavLink>
            </SidebarItem>
          </>
        );

      default:
        // Default case - show a restricted view (same as original default, but without Home)
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
    <SidebarContainer>
      <Logo>
        <h1>Milestone Center</h1>
      </Logo>
      <SidebarMenu>
        {/* Render role-specific menu items */}
        {renderMenuItems()}
      </SidebarMenu>
      {/* Sign Out Button */}
      <SignOutWrapper>
        {/* Using NavLink for navigation. Note: If sign-out involves API logic, 
            you'd typically use a regular button with an onClick handler that 
            performs the action and then navigates programmatically. 
            Here, I use NavLink as requested for navigation to /secure. */}
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
  );
};

export default Sidebar;