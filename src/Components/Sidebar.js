"use client"
import { useState } from "react"
import styled, { css, keyframes } from "styled-components"
import { NavLink, useLocation } from "react-router-dom"
import {
  FaHome,
  FaUserPlus,
  FaIdCard,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaChartBar,
  FaCalculator,
  FaCaretDown,
} from "react-icons/fa"
// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`
// Styled components
const SidebarContainer = styled.div`
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #DCE2CB;
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
`
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
`
const SidebarMenu = styled.ul`
  list-style-type: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
const SidebarItem = styled.li`
  position: relative;
`
const activeItemStyles = css`
  background-color: #A1C181;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  svg {
    color: white;
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background-color: #557153;
    border-radius: 0 4px 4px 0;
  }
`
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
`
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
`
const DropdownIcon = styled.div`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  ${(props) =>
    props.open &&
    css`
    transform: rotate(180deg);
  `}
`
const SubMenu = styled.div`
  margin-top: 0.5rem;
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  animation: ${fadeIn} 0.3s ease forwards;
`
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
    content: '';
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
    background-color: #A1C181;
    color: white;
    font-weight: 600;
    &::before {
      background-color: white;
      opacity: 1;
    }
  }
`
const Sidebar = () => {
  const [isReportDropdown, setIsReportDropdown] = useState(false)
  const location = useLocation()
  const toggleReport = () => {
    setIsReportDropdown(!isReportDropdown)
  }
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  // Check if any report route is active
  const isReportActive =
    location.pathname === "/TherapyReports" ||
    location.pathname === "/OPReport" ||
    location.pathname === "/SourceOfReferral"
  return (
    <SidebarContainer>
      <Logo>
        <h1>Milestone Center</h1>
      </Logo>
      <SidebarMenu>
        <SidebarItem>
          <SidebarNavLink to="/" exact>
            <FaHome />
            Home
          </SidebarNavLink>
        </SidebarItem>
        <SidebarItem>
          <SidebarNavLink to="/Registration">
            <FaUserPlus />
            Registration
          </SidebarNavLink>
        </SidebarItem>
        <SidebarItem>
          <SidebarNavLink to="/PatientCardView/Assessments">
            <FaIdCard />
            Patient Card View
          </SidebarNavLink>
        </SidebarItem>
        <SidebarItem>
          <SidebarNavLink to="/Therapybillingview">
            <FaFileInvoiceDollar />
            Therapy Billing
          </SidebarNavLink>
        </SidebarItem>
        <SidebarItem>
          <SidebarNavLink to="/PendingPayment">
            <FaMoneyBillWave />
            Pending Payment
          </SidebarNavLink>
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
            </SubMenu>
          )}
        </SidebarItem>
        <SidebarItem>
          <SidebarNavLink to="/Accounts">
            <FaCalculator />
            Accounts
          </SidebarNavLink>
        </SidebarItem>
      </SidebarMenu>
    </SidebarContainer>
  )
}
export default Sidebar