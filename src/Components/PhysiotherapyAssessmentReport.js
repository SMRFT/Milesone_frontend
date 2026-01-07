"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { Calendar, Eye, Printer, X } from "lucide-react"
import apiRequest from "./apiRequest";

const THEME = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    accent: "#4895ef",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: "#212529",
    textLight: "#6c757d",
    border: "#dee2e6",
    borderLight: "#e9ecef",
    success: "#4caf50",
    warning: "#ff9800",
    hovercolor: "#7a9c78",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
    medium: "0 4px 8px rgba(0,0,0,0.12)",
  },
  borderRadius: {
    medium: "8px",
    large: "12px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: ${THEME.colors.background};
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${THEME.spacing.xl};
  padding: ${THEME.spacing.lg};
  background-color: ${THEME.colors.surface};
  border-radius: ${THEME.borderRadius.medium};
  box-shadow: ${THEME.shadows.small};

  p {
    color: ${THEME.colors.textLight};
    margin: 0;
  }
`

const PageTitle = styled.h1`
  color: ${THEME.colors.primary};
  font-size: 2rem;
  margin: 0;
`

const FilterSection = styled.div`
  background-color: ${THEME.colors.surface};
  border-radius: ${THEME.borderRadius.medium};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${THEME.shadows.small};
`

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  label {
    font-weight: 500;
    color: ${THEME.colors.textLight};
    font-size: 0.875rem;
    display: block;
    margin-bottom: 8px;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid ${THEME.colors.border};
    border-radius: ${THEME.borderRadius.medium};
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      border-color: ${THEME.colors.primary};
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.1);
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: ${THEME.borderRadius.medium};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.primary {
    background-color: ${THEME.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${THEME.colors.hovercolor};
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: ${THEME.colors.primary};
    border: 1px solid ${THEME.colors.primary};
    
    &:hover {
      background-color: rgba(64, 97, 71, 0.1);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${THEME.colors.surface};
  border-radius: ${THEME.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${THEME.shadows.small};
  
  th {
    background-color: ${THEME.colors.primary};
    color: white;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid ${THEME.colors.borderLight};
    font-size: 0.95rem;
  }
  
  tbody tr:hover {
    background-color: ${THEME.colors.background};
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  button {
    padding: 8px 12px;
    border: none;
    border-radius: ${THEME.borderRadius.medium};
    background-color: ${THEME.colors.accent};
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: ${THEME.colors.secondary};
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${THEME.colors.textLight};
  background-color: ${THEME.colors.surface};
  border-radius: ${THEME.borderRadius.medium};
  box-shadow: ${THEME.shadows.small};
  
  p {
    font-size: 1rem;
    margin: 0;
  }
`

const ErrorAlert = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 16px;
  border-radius: ${THEME.borderRadius.medium};
  margin-bottom: 24px;
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background-color: ${THEME.colors.surface};
  border-radius: ${THEME.borderRadius.large};
  padding: 0;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${THEME.shadows.medium};
  position: relative;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.hovercolor} 100%);
  border-radius: ${THEME.borderRadius.large} ${THEME.borderRadius.large} 0 0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff !important;
  }
`

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${THEME.colors.surface};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

const ModalBody = styled.div`
  padding: 32px;
`

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h3`
  color: ${THEME.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${THEME.colors.primary};
`

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const DetailField = styled.div`
  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${THEME.colors.textLight};
    text-transform: uppercase;
    display: block;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 0;
    color: ${THEME.colors.text};
    font-size: 0.95rem;
    background-color: ${THEME.colors.background};
    padding: 10px 12px;
    border-radius: ${THEME.borderRadius.medium};
    border-left: 3px solid ${THEME.colors.primary};
  }
  
  &.full-width {
    grid-column: 1 / -1;
  }
`

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  
  th {
    background-color: ${THEME.colors.primary};
    color: white;
    padding: 10px;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  td {
    padding: 10px;
    border-bottom: 1px solid ${THEME.colors.borderLight};
    font-size: 0.95rem;
    background-color: ${THEME.colors.background};
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
`

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px 32px;
  border-top: 1px solid ${THEME.colors.border};
  background-color: ${THEME.colors.background};
  border-radius: 0 0 ${THEME.borderRadius.large} ${THEME.borderRadius.large};
`

export default function PhysiotherapyReport() {
  const today = new Date().toISOString().split("T")[0]

  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

  const parseJSON = (value) => {
    if (!value) return null
    if (typeof value === "object") return value
    try {
      return JSON.parse(value)
    } catch (e) {
      console.error("JSON parse error:", e, value)
      return null
    }
  }

  // 🔹 Common fetch function
  const fetchReportData = async (start, end) => {
    setLoading(true)
    setError("")

    try {
      const response = await apiRequest(
        `${Milestonebaseurl}physio/?from_date=${start}&to_date=${end}`,
        "GET"
      )

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch data")
      }

      setData(response.data || [])
    } catch (err) {
      console.error(err)
      setError("Failed to load report data. Please try again.")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Load TODAY data on first render
  useEffect(() => {
    fetchReportData(fromDate, toDate)
  }, []) // 👈 only once

  // 🔹 Filter button
  const handleFilter = () => {
    if (!fromDate || !toDate) {
      setError("Please select both start and end dates")
      return
    }
    fetchReportData(fromDate, toDate)
  }

  const handleReset = () => {
    setFromDate(today)
    setToDate(today)
    fetchReportData(today, today)
  }

  const handleView = (record) => {
    setSelectedRecord(record)
    setShowModal(true)
  }

  const handlePrint = (record) => {
    const observation = parseJSON(record.on_observation) || {}
    const tone = parseJSON(record.tone) || {}
    const motorSystem = parseJSON(record.motor_system) || {}
    const clonus = parseJSON(record.clonus) || {}
    const coordination = parseJSON(record.coordination) || {}
    const pattern = parseJSON(record.pattern_and_position) || {}
    const limbLength = parseJSON(record.limb_length_discrepancy) || {}
    const balance = parseJSON(record.balance) || {}
    const sensation = parseJSON(record.sensation) || {}
    const assessments = parseJSON(record.assessments_used) || {}
    
    const printWindow = window.open("", "_blank")
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Physiotherapy Assessment - ${record.patientName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #212529;
              background-color: white;
              padding: 20px;
              font-size: 11px;
              line-height: 1.4;
            }
            
            .header {
              background: linear-gradient(135deg, #406147 0%, #3f37c9 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            
            .header h1 {
              font-size: 20px;
              margin-bottom: 6px;
              font-weight: 600;
            }
            
            .header p {
              font-size: 10px;
              opacity: 0.9;
            }
            
            .patient-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #406147;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
            }
            
            .info-field {
              margin-bottom: 8px;
            }
            
            .info-field label {
              font-size: 9px;
              font-weight: 600;
              color: #6c757d;
              text-transform: uppercase;
              display: block;
              margin-bottom: 4px;
              letter-spacing: 0.3px;
            }
            
            .info-field p {
              font-size: 11px;
              color: #212529;
              font-weight: 500;
            }
            
            .section {
              margin-bottom: 18px;
              page-break-inside: avoid;
            }
            
            .section-title {
              background-color: #406147;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .section-content {
              background-color: #f8f9fa;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            
            .detail-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            
            .detail-item {
              background-color: white;
              padding: 8px 10px;
              border-radius: 4px;
              border-left: 3px solid #4895ef;
            }
            
            .detail-item label {
              font-size: 9px;
              font-weight: 600;
              color: #6c757d;
              text-transform: uppercase;
              display: block;
              margin-bottom: 4px;
            }
            
            .detail-item p {
              font-size: 10px;
              color: #212529;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            
            .table th {
              background-color: #406147;
              color: white;
              padding: 6px 8px;
              text-align: left;
              font-size: 9px;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            .table td {
              padding: 6px 8px;
              border-bottom: 1px solid #e9ecef;
              font-size: 10px;
              background-color: white;
            }
            
            .impression-box {
              background-color: #fff3cd;
              border: 2px solid #ff9800;
              border-radius: 6px;
              padding: 12px;
              margin-top: 10px;
            }
            
            .impression-box p {
              font-size: 10px;
              line-height: 1.5;
              color: #212529;
            }
            
            .footer {
              margin-top: 20px;
              padding-top: 12px;
              border-top: 2px solid #dee2e6;
              text-align: center;
              color: #6c757d;
              font-size: 9px;
            }
            
            @media print {
              body {
                padding: 10px;
              }
              
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Physiotherapy Assessment Report</h1>
            <p>Comprehensive Patient Evaluation Document</p>
          </div>
          
          <div class="patient-info">
            <div class="info-grid">
              <div class="info-field">
                <label>Registration Number</label>
                <p>${record.registrationNumber || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Patient Name</label>
                <p>${record.patientName || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Assessment Date</label>
                <p>${new Date(record.assessment_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          ${Object.keys(observation).length > 0 ? `
          <div class="section">
            <div class="section-title">On Observation</div>
            <div class="section-content">
              <div class="detail-grid">
                ${observation.restingPosture ? `
                <div class="detail-item">
                  <label>Resting Posture</label>
                  <p>${observation.restingPosture}</p>
                </div>
                ` : ''}
                ${observation.gait ? `
                <div class="detail-item">
                  <label>Gait</label>
                  <p>${observation.gait}</p>
                </div>
                ` : ''}
                ${observation.deformity ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>Deformity & Contracture</label>
                  <p>${observation.deformity}</p>
                </div>
                ` : ''}
                ${observation.appliances ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>External Appliances</label>
                  <p>${observation.appliances}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(tone).length > 0 ? `
          <div class="section">
            <div class="section-title">On Examination - Tone</div>
            <div class="section-content">
              <div class="detail-grid">
                ${tone.upperLimb ? `
                <div class="detail-item">
                  <label>Upper Limb</label>
                  <p><strong>${tone.upperLimb}</strong>${tone.upperLimbInput ? ` - ${tone.upperLimbInput}` : ''}</p>
                </div>
                ` : ''}
                ${tone.lowerLimb ? `
                <div class="detail-item">
                  <label>Lower Limb</label>
                  <p><strong>${tone.lowerLimb}</strong>${tone.lowerLimbInput ? ` - ${tone.lowerLimbInput}` : ''}</p>
                </div>
                ` : ''}
                ${tone.unableToAssess ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>Unable to Assess</label>
                  <p>${tone.unableToAssess}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(motorSystem).length > 0 ? `
          <div class="section">
            <div class="section-title">Motor System</div>
            <div class="section-content">
              <div class="detail-grid">
                ${motorSystem.upperLimb ? `
                <div class="detail-item">
                  <label>Upper Limb</label>
                  <p><strong>${motorSystem.upperLimb}</strong>${motorSystem.upperLimbInput ? ` - ${motorSystem.upperLimbInput}` : ''}</p>
                </div>
                ` : ''}
                ${motorSystem.lowerLimb ? `
                <div class="detail-item">
                  <label>Lower Limb</label>
                  <p><strong>${motorSystem.lowerLimb}</strong>${motorSystem.lowerLimbInput ? ` - ${motorSystem.lowerLimbInput}` : ''}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(clonus).length > 0 ? `
          <div class="section">
            <div class="section-title">Clonus Assessment</div>
            <div class="section-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${clonus.walking ? `<tr><td><strong>Walking</strong></td><td>${clonus.walking}</td></tr>` : ''}
                  ${clonus.running ? `<tr><td><strong>Running</strong></td><td>${clonus.running}</td></tr>` : ''}
                  ${clonus.kicking ? `<tr><td><strong>Kicking</strong></td><td>${clonus.kicking}</td></tr>` : ''}
                  ${clonus.throwing ? `<tr><td><strong>Throwing</strong></td><td>${clonus.throwing}</td></tr>` : ''}
                  ${clonus.catching ? `<tr><td><strong>Catching</strong></td><td>${clonus.catching}</td></tr>` : ''}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(coordination).length > 0 ? `
          <div class="section">
            <div class="section-title">Co-ordination</div>
            <div class="section-content">
              <div class="detail-grid">
                ${coordination.upperLimb ? `
                <div class="detail-item">
                  <label>Upper Limb</label>
                  <p><strong>${coordination.upperLimb}</strong>${coordination.upperLimbInput ? ` - ${coordination.upperLimbInput}` : ''}</p>
                </div>
                ` : ''}
                ${coordination.lowerLimb ? `
                <div class="detail-item">
                  <label>Lower Limb</label>
                  <p><strong>${coordination.lowerLimb}</strong>${coordination.lowerLimbInput ? ` - ${coordination.lowerLimbInput}` : ''}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(pattern).length > 0 ? `
          <div class="section">
            <div class="section-title">Pattern and Position</div>
            <div class="section-content">
              <div class="detail-grid">
                ${pattern.pattern ? `
                <div class="detail-item">
                  <label>Pattern</label>
                  <p>${pattern.pattern}</p>
                </div>
                ` : ''}
                ${pattern.headPosition ? `
                <div class="detail-item">
                  <label>Head Position</label>
                  <p>${pattern.headPosition}</p>
                </div>
                ` : ''}
                ${pattern.trunkPosition ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>Trunk Position</label>
                  <p>${pattern.trunkPosition}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(limbLength).length > 0 ? `
          <div class="section">
            <div class="section-title">Limb Length Discrepancy</div>
            <div class="section-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Limb</th>
                    <th>Right</th>
                    <th>Left</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Hand</strong></td>
                    <td>${limbLength.handRight || "N/A"}</td>
                    <td>${limbLength.handLeft || "N/A"}</td>
                  </tr>
                  <tr>
                    <td><strong>Leg</strong></td>
                    <td>${limbLength.legRight || "N/A"}</td>
                    <td>${limbLength.legLeft || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(balance).length > 0 ? `
          <div class="section">
            <div class="section-title">Balance</div>
            <div class="section-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Static</th>
                    <th>Dynamic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sitting</strong></td>
                    <td>${balance.sittingStatic || "N/A"}</td>
                    <td>${balance.sittingDynamic || "N/A"}</td>
                  </tr>
                  <tr>
                    <td><strong>Standing</strong></td>
                    <td>${balance.standingStatic || "N/A"}</td>
                    <td>${balance.standingDynamic || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(sensation).length > 0 ? `
          <div class="section">
            <div class="section-title">Sensation</div>
            <div class="section-content">
              <div class="detail-grid">
                ${sensation.lightTouch ? `
                <div class="detail-item">
                  <label>Light Touch</label>
                  <p>${sensation.lightTouch}</p>
                </div>
                ` : ''}
                ${sensation.pain ? `
                <div class="detail-item">
                  <label>Pain</label>
                  <p>${sensation.pain}</p>
                </div>
                ` : ''}
                ${sensation.proprioception ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>Proprioception</label>
                  <p>${sensation.proprioception}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(assessments).length > 0 && assessments.physiotherapyAssessment ? `
          <div class="section">
            <div class="section-title">Assessments Used</div>
            <div class="section-content">
              <div class="detail-item">
                <label>Physiotherapy Assessment</label>
                <p>${assessments.physiotherapyAssessment}</p>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${record.impression ? `
          <div class="section">
            <div class="section-title">Clinical Impression</div>
            <div class="impression-box">
              <p>${record.impression}</p>
            </div>
          </div>
          ` : ''}
          
          ${record.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes</div>
            <div class="section-content">
              <p style="font-size: 10px; line-height: 1.5;">${record.notes}</p>
            </div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>© Physiotherapy Assessment System</p>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const renderDetailView = (record) => {
    const observation = parseJSON(record.on_observation) || {}
    const tone = parseJSON(record.tone) || {}
    const motorSystem = parseJSON(record.motor_system) || {}
    const clonus = parseJSON(record.clonus) || {}
    const coordination = parseJSON(record.coordination) || {}
    const pattern = parseJSON(record.pattern_and_position) || {}
    const limbLength = parseJSON(record.limb_length_discrepancy) || {}
    const balance = parseJSON(record.balance) || {}
    const sensation = parseJSON(record.sensation) || {}
    const assessments = parseJSON(record.assessments_used) || {}

    return (
      <>
        <Section>
          <SectionTitle>Patient Information</SectionTitle>
          <DetailGrid>
            <DetailField>
              <label>Registration Number</label>
              <p>{record.registrationNumber || "N/A"}</p>
            </DetailField>
            <DetailField>
              <label>Patient Name</label>
              <p>{record.patientName || "N/A"}</p>
            </DetailField>
            <DetailField>
              <label>Assessment Date</label>
              <p>{new Date(record.assessment_date).toLocaleDateString()}</p>
            </DetailField>
          </DetailGrid>
        </Section>

        {Object.keys(observation).length > 0 && (
          <Section>
            <SectionTitle>On Observation</SectionTitle>
            <DetailGrid>
              {observation.restingPosture && (
                <DetailField>
                  <label>Resting Posture</label>
                  <p>{observation.restingPosture}</p>
                </DetailField>
              )}
              {observation.gait && (
                <DetailField>
                  <label>Gait</label>
                  <p>{observation.gait}</p>
                </DetailField>
              )}
              {observation.deformity && (
                <DetailField className="full-width">
                  <label>Deformity & Contracture</label>
                  <p>{observation.deformity}</p>
                </DetailField>
              )}
              {observation.appliances && (
                <DetailField className="full-width">
                  <label>External Appliances</label>
                  <p>{observation.appliances}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(tone).length > 0 && (
          <Section>
            <SectionTitle>On Examination - Tone</SectionTitle>
            <DetailGrid>
              {tone.upperLimb && (
                <DetailField>
                  <label>Upper Limb</label>
                  <p>
                    <strong>{tone.upperLimb}</strong>
                    {tone.upperLimbInput && ` - ${tone.upperLimbInput}`}
                  </p>
                </DetailField>
              )}
              {tone.lowerLimb && (
                <DetailField>
                  <label>Lower Limb</label>
                  <p>
                    <strong>{tone.lowerLimb}</strong>
                    {tone.lowerLimbInput && ` - ${tone.lowerLimbInput}`}
                  </p>
                </DetailField>
              )}
              {tone.unableToAssess && (
                <DetailField className="full-width">
                  <label>Unable to Assess</label>
                  <p>{tone.unableToAssess}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(motorSystem).length > 0 && (
          <Section>
            <SectionTitle>Motor System</SectionTitle>
            <DetailGrid>
              {motorSystem.upperLimb && (
                <DetailField>
                  <label>Upper Limb</label>
                  <p>
                    <strong>{motorSystem.upperLimb}</strong>
                    {motorSystem.upperLimbInput && ` - ${motorSystem.upperLimbInput}`}
                  </p>
                </DetailField>
              )}
              {motorSystem.lowerLimb && (
                <DetailField>
                  <label>Lower Limb</label>
                  <p>
                    <strong>{motorSystem.lowerLimb}</strong>
                    {motorSystem.lowerLimbInput && ` - ${motorSystem.lowerLimbInput}`}
                  </p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(clonus).length > 0 && (
          <Section>
            <SectionTitle>Clonus Assessment</SectionTitle>
            <DataTable>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clonus.walking && (
                  <tr>
                    <td><strong>Walking</strong></td>
                    <td>{clonus.walking}</td>
                  </tr>
                )}
                {clonus.running && (
                  <tr>
                    <td><strong>Running</strong></td>
                    <td>{clonus.running}</td>
                  </tr>
                )}
                {clonus.kicking && (
                  <tr>
                    <td><strong>Kicking</strong></td>
                    <td>{clonus.kicking}</td>
                  </tr>
                )}
                {clonus.throwing && (
                  <tr>
                    <td><strong>Throwing</strong></td>
                    <td>{clonus.throwing}</td>
                  </tr>
                )}
                {clonus.catching && (
                  <tr>
                    <td><strong>Catching</strong></td>
                    <td>{clonus.catching}</td>
                  </tr>
                )}
              </tbody>
            </DataTable>
          </Section>
        )}

        {Object.keys(coordination).length > 0 && (
          <Section>
            <SectionTitle>Co-ordination</SectionTitle>
            <DetailGrid>
              {coordination.upperLimb && (
                <DetailField>
                  <label>Upper Limb</label>
                  <p>
                    <strong>{coordination.upperLimb}</strong>
                    {coordination.upperLimbInput && ` - ${coordination.upperLimbInput}`}
                  </p>
                </DetailField>
              )}
              {coordination.lowerLimb && (
                <DetailField>
                  <label>Lower Limb</label>
                  <p>
                    <strong>{coordination.lowerLimb}</strong>
                    {coordination.lowerLimbInput && ` - ${coordination.lowerLimbInput}`}
                  </p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(pattern).length > 0 && (
          <Section>
            <SectionTitle>Pattern and Position</SectionTitle>
            <DetailGrid>
              {pattern.pattern && (
                <DetailField>
                  <label>Pattern</label>
                  <p>{pattern.pattern}</p>
                </DetailField>
              )}
              {pattern.headPosition && (
                <DetailField>
                  <label>Head Position</label>
                  <p>{pattern.headPosition}</p>
                </DetailField>
              )}
              {pattern.trunkPosition && (
                <DetailField className="full-width">
                  <label>Trunk Position</label>
                  <p>{pattern.trunkPosition}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(limbLength).length > 0 && (
          <Section>
            <SectionTitle>Limb Length Discrepancy</SectionTitle>
            <DataTable>
              <thead>
                <tr>
                  <th>Limb</th>
                  <th>Right</th>
                  <th>Left</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Hand</strong></td>
                  <td>{limbLength.handRight || "N/A"}</td>
                  <td>{limbLength.handLeft || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Leg</strong></td>
                  <td>{limbLength.legRight || "N/A"}</td>
                  <td>{limbLength.legLeft || "N/A"}</td>
                </tr>
              </tbody>
            </DataTable>
          </Section>
        )}

        {Object.keys(balance).length > 0 && (
          <Section>
            <SectionTitle>Balance</SectionTitle>
            <DataTable>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Static</th>
                  <th>Dynamic</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Sitting</strong></td>
                  <td>{balance.sittingStatic || "N/A"}</td>
                  <td>{balance.sittingDynamic || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Standing</strong></td>
                  <td>{balance.standingStatic || "N/A"}</td>
                  <td>{balance.standingDynamic || "N/A"}</td>
                </tr>
              </tbody>
            </DataTable>
          </Section>
        )}

        {Object.keys(sensation).length > 0 && (
          <Section>
            <SectionTitle>Sensation</SectionTitle>
            <DetailGrid>
              {sensation.lightTouch && (
                <DetailField>
                  <label>Light Touch</label>
                  <p>{sensation.lightTouch}</p>
                </DetailField>
              )}
              {sensation.pain && (
                <DetailField>
                  <label>Pain</label>
                  <p>{sensation.pain}</p>
                </DetailField>
              )}
              {sensation.proprioception && (
                <DetailField className="full-width">
                  <label>Proprioception</label>
                  <p>{sensation.proprioception}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {Object.keys(assessments).length > 0 && assessments.physiotherapyAssessment && (
          <Section>
            <SectionTitle>Assessments Used</SectionTitle>
            <DetailField className="full-width">
              <label>Physiotherapy Assessment</label>
              <p>{assessments.physiotherapyAssessment}</p>
            </DetailField>
          </Section>
        )}

        {record.impression && (
          <Section>
            <SectionTitle>Clinical Impression</SectionTitle>
            <DetailField className="full-width">
              <p style={{ 
                backgroundColor: "#fff3cd", 
                border: "2px solid #ff9800", 
                borderRadius: THEME.borderRadius.medium,
                padding: "16px"
              }}>
                {record.impression}
              </p>
            </DetailField>
          </Section>
        )}

        {record.notes && (
          <Section>
            <SectionTitle>Additional Notes</SectionTitle>
            <DetailField className="full-width">
              <p>{record.notes}</p>
            </DetailField>
          </Section>
        )}
      </>
    )
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Physiotherapy Assessment Report</PageTitle>
        <p>Current Date: {new Date().toLocaleDateString()}</p>
      </PageHeader>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <FilterSection>
        <FilterGroup>
          <div>
            <label>Start Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </FilterGroup>
        <ButtonGroup>
          <Button className="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button className="primary" onClick={handleFilter} disabled={loading}>
            <Calendar size={18} />
            {loading ? "Loading..." : "Generate Report"}
          </Button>
        </ButtonGroup>
      </FilterSection>

      {data.length === 0 ? (
        <EmptyState>
          <p>Select dates and click "Generate Report" to view data</p>
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Registration Number</th>
              <th>Patient Name</th>
              <th>Assessment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.registrationNumber || "-"}</td>
                <td>{item.patientName || "-"}</td>
                <td>{new Date(item.assessment_date).toLocaleDateString()}</td>
                <td>
                  <ActionButtons>
                    <Button className="primary" onClick={() => handleView(item)}>
                      <Eye size={16} /> View
                    </Button>
                    <Button className="primary" onClick={() => handlePrint(item)}>
                      <Printer size={16} /> Print
                    </Button>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && selectedRecord && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Assessment Details - {selectedRecord.patientName}</h2>
              <CloseButton onClick={() => setShowModal(false)}>
                X
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {renderDetailView(selectedRecord)}
            </ModalBody>
            <ModalFooter>
              <Button className="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button className="primary" onClick={() => handlePrint(selectedRecord)}>
                <Printer size={18} /> Print Report
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  )
}