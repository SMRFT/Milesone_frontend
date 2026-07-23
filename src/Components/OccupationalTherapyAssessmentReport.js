"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { Calendar, Eye, Printer, X, Download, Edit } from "lucide-react"
import apiRequest from "./apiRequest"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import mdcLogo from "./Images/mdcLogo.png"

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
    color: #ffffff !important;   /* <- ADD THIS */
  }
`;


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

const ListItems = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${THEME.colors.text};
  
  li {
    margin-bottom: 4px;
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

const SENSORY_PROFILE_CONFIG = {
  default: { // 86 box
    seeking: [14, 21, 22, 25, 27, 28, 30, 31, 32, 41, 48, 49, 50, 51, 55, 56, 60, 82, 83],
    avoiding: [1, 2, 5, 15, 18, 58, 59, 61, 63, 64, 65, 66, 67, 68, 70, 71, 72, 74, 75, 81],
    sensitivity: [3, 4, 6, 7, 9, 13, 16, 19, 20, 44, 45, 46, 47, 52, 69, 73, 77, 78, 84],
    registration: [8, 12, 23, 24, 26, 33, 34, 35, 36, 37, 38, 39, 40, 53, 54, 57, 62, 76, 79, 80, 85, 86]
  },
  toddler: { // 54 box (7m to 35m)
    seeking: [18, 19, 20, 32, 36, 37, 38],
    avoiding: [3, 10, 27, 28, 29, 33, 35, 42, 49, 53, 54],
    sensitivity: [1, 2, 13, 16, 26, 31, 34, 39, 41, 44, 46, 48, 52],
    registration: [9, 11, 12, 14, 15, 23, 24, 25, 30, 40, 45]
  }
};

const calculateQuadrantTotal = (scores, itemNumbers) => {
  if (!scores) return 0;
  return itemNumbers.reduce((sum, itemNum) => {
    const val = parseInt(scores[itemNum], 10);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};

const SensoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SensoryColumn = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.borderColor};
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
`;

const ColumnHeader = styled.div`
  background-color: ${props => props.bgColor};
  color: white;
  padding: 8px;
  font-weight: 700;
  text-align: center;
  font-size: 0.85rem;
`;

const ColumnSubHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.75rem;
  color: #64748b;
  padding: 4px 8px;
  text-align: center;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  padding: 4px 8px;
  
  &:nth-child(even) {
    background-color: #f8fafc;
  }
`;

const ItemNumber = styled.span`
  font-weight: 600;
  font-size: 0.8rem;
  color: #334155;
  text-align: center;
`;

const ScoreValue = styled.span`
  font-size: 0.8rem;
  color: #0f172a;
  text-align: center;
`;

const ColumnTotalRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background-color: #f8fafc;
  border-top: 2px solid ${props => props.borderColor};
  font-weight: 700;
  font-size: 0.75rem;
  padding: 6px 8px;
  align-items: center;
  margin-top: auto;
`;

const TotalLabel = styled.span`
  color: #334155;
  line-height: 1.2;
`;

const TotalValue = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${props => props.color};
  text-align: center;
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 1px 4px;
`;

export default function OccupationalTherapyReport() {
  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleEdit = (record) => {
    navigate("/OccupationalTherapyAssessment", { state: { editRecord: record } })
  }

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
        `${Milestonebaseurl}ot/?from_date=${start}&to_date=${end}`,
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


  const handlePrintHTML = (record) => {
    const motorSkills = parseJSON(record.motor_skills) || {}
    const handwritingSkills = parseJSON(record.handwriting_skills) || {}
    const cognitiveConcepts = parseJSON(record.cognitive_concepts) || {}
    const visualSkills = parseJSON(record.visual_perceptual_skills) || {}
    const sensoryEval = parseJSON(record.sensory_profile) || {}
    const adlEval = parseJSON(record.adl_evaluation) || {}
    const assessments = parseJSON(record.assessments_used) || {}
    const assessmentDateStr = record.assessment_date ? new Date(record.assessment_date).toLocaleDateString() : "N/A";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Occupational Therapy Assessment Report - ${record.patientName || "Patient"}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1e293b; 
              background: white; 
              line-height: 1.5;
              font-size: 9.5pt;
            }
            .clinic-brand {
              display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #406147;
              padding-bottom: 15px; margin-bottom: 25px;
            }
            .logo { height: 70px; object-fit: contain; }
            .contact-details { text-align: right; font-size: 8.5pt; color: #334155; line-height: 1.4; }
            
            .report-title {
              text-align: center;
              font-size: 13pt;
              font-weight: 700;
              margin-bottom: 20px;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 1px;
              text-decoration: underline;
            }
            
            .demographics-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .demographics-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              font-size: 9pt;
              width: 33.33%;
              color: #334155;
            }
            .demographics-table td strong {
              color: #0f172a;
              font-weight: 600;
            }

            .section-header {
              font-size: 10.5pt;
              font-weight: 700;
              color: #1e293b;
              margin-top: 25px;
              margin-bottom: 10px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              text-transform: uppercase;
            }
            
            .bullet-list {
              margin: 8px 0;
              padding-left: 20px;
            }
            .bullet-item {
              margin-bottom: 5px;
              color: #334155;
            }

            .info-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-bottom: 15px;
            }
            .info-card {
              flex: 1 1 calc(50% - 10px);
              background: #f8fafc;
              border-left: 3px solid #406147;
              padding: 8px 12px;
              border-radius: 4px;
              box-sizing: border-box;
            }
            .info-card-label {
              font-size: 8pt;
              font-weight: 600;
              color: #406147;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .info-card-value {
              font-size: 9pt;
              color: #334155;
            }

            .summary-box {
              background: #f8faf0;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 12px;
              margin: 10px 0;
              font-size: 9.5pt;
              color: #334155;
            }

            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .data-table th, .data-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              text-align: left;
              font-size: 9pt;
              color: #334155;
            }
            .data-table th {
              background: #f1f5f9;
              font-weight: 600;
              color: #0f172a;
            }

            .print-signature {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 9pt;
              page-break-inside: avoid;
            }
            .sig-column {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              width: 220px;
            }
            .sig-line {
              width: 100%;
              border-top: 1px solid #cbd5e1;
              margin-bottom: 6px;
              margin-top: 30px;
            }
            .sig-name {
              font-weight: 700;
              color: #0f172a;
            }
            .sig-details {
              font-size: 8pt;
              color: #64748b;
            }
            
            @media print {
              body { padding: 0; margin: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="clinic-brand">
            <img src="${mdcLogo}" alt="Logo" class="logo" />
            <div class="contact-details">
              <strong style="font-size: 10pt; color: #333;">Milestone Development Center</strong><br />
              59/37, Saradha College Road,<br />
              Salem-636007, Tamil Nadu, India<br />
              Ph: +91 90470 33633<br />
              Email: info@milestonescenter.in
            </div>
          </div>
          
          <div class="report-title">Occupational Therapy Report</div>
          
          <table class="demographics-table">
            <tbody>
              <tr>
                <td><strong>Name:</strong> ${record.patientName || "N/A"}</td>
                <td><strong>DOB:</strong> ${record.dob || "—"}</td>
                <td><strong>Date of Evaluation:</strong> ${assessmentDateStr}</td>
              </tr>
              <tr>
                <td><strong>Father:</strong> ${record.father || "—"}</td>
                <td><strong>Age:</strong> ${record.age || "—"}</td>
                <td><strong>Reg. No.:</strong> ${record.registrationNumber || "—"}</td>
              </tr>
              <tr>
                <td><strong>Mother:</strong> ${record.mother || "—"}</td>
                <td><strong>Mobile:</strong> ${record.mobile || "—"}</td>
                <td><strong>Address:</strong> ${record.address || "—"}</td>
              </tr>
            </tbody>
          </table>

          ${Object.keys(motorSkills).length > 0 && ((motorSkills.grossMotor && motorSkills.grossMotor.length > 0) || (motorSkills.fineMotor && motorSkills.fineMotor.length > 0)) ? `
            <div class="section-header">Motor Skills</div>
            ${motorSkills.grossMotor && motorSkills.grossMotor.length > 0 ? `
              <div style="font-weight:600; margin-bottom:8px; font-size:9pt; color:#1e293b;">Gross Motor Skills:</div>
              <ul class="bullet-list">
                ${motorSkills.grossMotor.map(skill => `<li class="bullet-item">${skill}</li>`).join("")}
              </ul>
            ` : ""}
            ${motorSkills.fineMotor && motorSkills.fineMotor.length > 0 ? `
              <div style="font-weight:600; margin-top:15px; margin-bottom:8px; font-size:9pt; color:#1e293b;">Fine Motor Skills:</div>
              <ul class="bullet-list">
                ${motorSkills.fineMotor.map(skill => `<li class="bullet-item">${skill}</li>`).join("")}
              </ul>
            ` : ""}
          ` : ""}

          ${Object.keys(handwritingSkills).length > 0 ? `
            <div class="section-header">Handwriting Skills</div>
            <div class="info-grid">
              ${handwritingSkills.positionOfChild ? `<div class="info-card"><div class="info-card-label">Position of Child</div><div class="info-card-value">${handwritingSkills.positionOfChild}</div></div>` : ""}
              ${handwritingSkills.scribbling ? `<div class="info-card"><div class="info-card-label">Scribbling/Coloring</div><div class="info-card-value">${handwritingSkills.scribbling}</div></div>` : ""}
              ${handwritingSkills.pencilGrasp ? `<div class="info-card"><div class="info-card-label">Pencil Grasp</div><div class="info-card-value">${handwritingSkills.pencilGrasp}</div></div>` : ""}
              ${handwritingSkills.basicFigures ? `<div class="info-card"><div class="info-card-label">Basic Figures</div><div class="info-card-value">${handwritingSkills.basicFigures}</div></div>` : ""}
              ${handwritingSkills.writingAlphabets ? `<div class="info-card"><div class="info-card-label">Writing Alphabets & Numbers</div><div class="info-card-value">${handwritingSkills.writingAlphabets}</div></div>` : ""}
            </div>
          ` : ""}

          ${Object.keys(cognitiveConcepts).length > 0 ? `
            <div class="section-header">Cognitive Concepts</div>
            <div class="info-grid">
              ${cognitiveConcepts.attention ? `<div class="info-card"><div class="info-card-label">Attention</div><div class="info-card-value">${cognitiveConcepts.attention}</div></div>` : ""}
              ${cognitiveConcepts.memory ? `<div class="info-card"><div class="info-card-label">Memory</div><div class="info-card-value">${cognitiveConcepts.memory}</div></div>` : ""}
              ${cognitiveConcepts.planning ? `<div class="info-card"><div class="info-card-label">Planning</div><div class="info-card-value">${cognitiveConcepts.planning}</div></div>` : ""}
              ${cognitiveConcepts.orientation ? `<div class="info-card"><div class="info-card-label">Orientation</div><div class="info-card-value">${cognitiveConcepts.orientation}</div></div>` : ""}
              ${cognitiveConcepts.rtLtDiscrimination ? `<div class="info-card"><div class="info-card-label">Rt/Lt Discrimination</div><div class="info-card-value">${cognitiveConcepts.rtLtDiscrimination}</div></div>` : ""}
            </div>
          ` : ""}

          ${(() => {
        if (Object.keys(visualSkills).length === 0) return "";
        const rows = Object.entries(visualSkills).map(([key, value]) => {
          const skillName = key === 'skill1' ? 'Puts together 2 pieces of puzzles' :
            key === 'skill2' ? 'Completes 4-5 pieces of puzzles' :
              key === 'skill3' ? 'Matches letters, shapes & numbers' :
                key === 'skill4' ? 'Imitates block train & patterns' :
                  'Copies horizontal block patterns';
          return [skillName, value.answer || "N/A", value.notes || "N/A"];
        });
        return `
              <div class="section-header">Visual Perceptual Skills</div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Response</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}
                </tbody>
              </table>
            `;
      })()}

          ${(() => {
            if (Object.keys(sensoryEval).length === 0) return "";
            let htmlContent = "";


            if (sensoryEval.scores) {
              const isToddler = sensoryEval.is7mTo35m || false;
              const config = isToddler ? SENSORY_PROFILE_CONFIG.toddler : SENSORY_PROFILE_CONFIG.default;
              const scores = sensoryEval.scores || {};
              
              const seekingTotal = calculateQuadrantTotal(scores, config.seeking);
              const avoidingTotal = calculateQuadrantTotal(scores, config.avoiding);
              const sensitivityTotal = calculateQuadrantTotal(scores, config.sensitivity);
              const registrationTotal = calculateQuadrantTotal(scores, config.registration);

              const maxLength = Math.max(
                config.seeking.length,
                config.avoiding.length,
                config.sensitivity.length,
                config.registration.length
              );

              let tableRowsHtml = "";
              for (let i = 0; i < maxLength; i++) {
                const seekItem = config.seeking[i] || "";
                const seekScore = seekItem !== "" ? (scores[seekItem] || "") : "";
                
                const avoidItem = config.avoiding[i] || "";
                const avoidScore = avoidItem !== "" ? (scores[avoidItem] || "") : "";
                
                const sensItem = config.sensitivity[i] || "";
                const sensScore = sensItem !== "" ? (scores[sensItem] || "") : "";
                
                const regItem = config.registration[i] || "";
                const regScore = regItem !== "" ? (scores[regItem] || "") : "";

                tableRowsHtml += `
                  <tr>
                    <td style="text-align: center; font-weight: bold; background: #fffbeb;">${seekItem}</td>
                    <td style="text-align: center;">${seekScore}</td>
                    <td style="text-align: center; font-weight: bold; background: #eff6ff;">${avoidItem}</td>
                    <td style="text-align: center;">${avoidScore}</td>
                    <td style="text-align: center; font-weight: bold; background: #ecfdf5;">${sensItem}</td>
                    <td style="text-align: center;">${sensScore}</td>
                    <td style="text-align: center; font-weight: bold; background: #fdf2f8;">${regItem}</td>
                    <td style="text-align: center;">${regScore}</td>
                  </tr>
                `;
              }

              htmlContent += `
                <div class="section-header">Sensory Profile (${isToddler ? "7m to 35m - 54 box" : "Default - 86 box"})</div>
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="color: white; font-weight: bold; text-align: center;">
                      <th colspan="2" style="background: #f59e0b; color: white; text-align: center;">Seeking/Seeker</th>
                      <th colspan="2" style="background: #3b82f6; color: white; text-align: center;">Avoiding/Avoider</th>
                      <th colspan="2" style="background: #10b981; color: white; text-align: center;">Sensitivity/Sensor</th>
                      <th colspan="2" style="background: #db2777; color: white; text-align: center;">Registration/Bystander</th>
                    </tr>
                    <tr style="background: #f8fafc; font-size: 8pt;">
                      <th style="text-align: center; width: 10%;">Item</th><th style="text-align: center; width: 15%;">Raw Score</th>
                      <th style="text-align: center; width: 10%;">Item</th><th style="text-align: center; width: 15%;">Raw Score</th>
                      <th style="text-align: center; width: 10%;">Item</th><th style="text-align: center; width: 15%;">Raw Score</th>
                      <th style="text-align: center; width: 10%;">Item</th><th style="text-align: center; width: 15%;">Raw Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                    <tr style="font-weight: bold; background: #f1f5f9; font-size: 8.5pt;">
                      <td style="background: #fef3c7;">Total</td>
                      <td style="text-align: center; background: #fef3c7; color: #d97706; font-weight: 800;">${seekingTotal}</td>
                      <td style="background: #dbeafe;">Total</td>
                      <td style="text-align: center; background: #dbeafe; color: #1d4ed8; font-weight: 800;">${avoidingTotal}</td>
                      <td style="background: #d1fae5;">Total</td>
                      <td style="text-align: center; background: #d1fae5; color: #047857; font-weight: 800;">${sensitivityTotal}</td>
                      <td style="background: #fce7f3;">Total</td>
                      <td style="text-align: center; background: #fce7f3; color: #be185d; font-weight: 800;">${registrationTotal}</td>
                    </tr>
                  </tbody>
                </table>
              `;
            } else {
              const rows = Object.entries(sensoryEval).map(([key, value]) => {
                const label = key === 'tactile' ? 'Tactile' :
                  key === 'vestibular' ? 'Vestibular' :
                    key === 'proprioception' ? 'Proprioception' :
                      key === 'auditory' ? 'Auditory' :
                        key === 'visual' ? 'Visual' :
                          key === 'oral' ? 'Oral – Peri & Intra' :
                            key.charAt(0).toUpperCase() + key.slice(1);
                return [label, value.hyper || "-", value.hypo || "-", value.both || "-"];
              });

              htmlContent += `
                <div class="section-header">Sensory Evaluation</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Modality</th>
                      <th>Hypersensitivity</th>
                      <th>Hyposensitivity</th>
                      <th>Both</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows.map(row => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("")}
                  </tbody>
                </table>
              `;
            }

            return htmlContent;
          })()}

          ${Object.keys(adlEval).length > 0 ? `
            <div class="section-header">ADL Evaluation</div>
            ${adlEval.overallLevel ? `<div style="font-weight:600; margin-bottom:8px; font-size:9.5pt; color:#1e293b;">Overall Dependency Level: ${adlEval.overallLevel}</div>` : ""}
            ${adlEval.activities && Object.keys(adlEval.activities).length > 0 ? `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(adlEval.activities).map(([key, value]) => {
        const activityName = key === 'toileting' ? 'Toileting' :
          key === 'brushing' ? 'Brushing' :
            key === 'bathing' ? 'Bathing' :
              key === 'dressing' ? 'Dressing & Undressing' :
                key === 'buttoning' ? 'Buttoning & Unbuttoning' :
                  key === 'grooming' ? 'Grooming' :
                    key === 'eating' ? 'Eating' :
                      key.charAt(0).toUpperCase() + key.slice(1);

        let statusStyle = "";
        const val = String(value.selected || '').trim().toLowerCase();
        if (val.includes('independent')) {
          statusStyle = "color: #2e7d32; font-weight: bold;";
        } else if (val.includes('partial') || val.includes('assisted')) {
          statusStyle = "color: #ed6c02; font-weight: bold;";
        } else if (val.includes('dependent')) {
          statusStyle = "color: #d32f2f; font-weight: bold;";
        }

        return `
                      <tr>
                        <td><strong>${activityName}</strong></td>
                        <td style="${statusStyle}">${value.selected || "N/A"}</td>
                        <td>${value.notes || "-"}</td>
                      </tr>
                    `;
      }).join("")}
                </tbody>
              </table>
            ` : ""}
          ` : ""}

          ${Object.keys(assessments).length > 0 && (assessments.sensoryEvaluation || assessments.multisensoryProfile || assessments.weefin || assessments.other) ? `
            <div class="section-header">Assessments Used</div>
            <div class="info-grid">
              ${assessments.sensoryEvaluation ? `<div class="info-card"><div class="info-card-label">Sensory Evaluation</div><div class="info-card-value">${assessments.sensoryEvaluation}</div></div>` : ""}
              ${assessments.multisensoryProfile ? `<div class="info-card"><div class="info-card-label">Multisensory Profile</div><div class="info-card-value">${assessments.multisensoryProfile}</div></div>` : ""}
              ${assessments.weefin ? `<div class="info-card"><div class="info-card-label">WeeFIM</div><div class="info-card-value">${assessments.weefin}</div></div>` : ""}
              ${assessments.other ? `<div class="info-card"><div class="info-card-label">Other</div><div class="info-card-value">${assessments.other}</div></div>` : ""}
            </div>
          ` : ""}

          ${record.impression ? `
            <div class="section-header">Summary / Clinical Impression</div>
            <div class="summary-box">
              ${record.impression}
            </div>
          ` : ""}

          ${record.diagnosis || record.overall_impression ? `
            <div class="section-header">Impression</div>
            <div class="summary-box">
              ${record.diagnosis || record.overall_impression}
            </div>
          ` : ""}

          ${record.recommendation || record.recommendations ? `
            <div class="section-header">Recommendations</div>
            <ul class="bullet-list">
              ${String(record.recommendation || record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean).map(rec => `<li class="bullet-item">${rec}</li>`).join("")}
            </ul>
          ` : ""}

          ${record.notes ? `
            <div class="section-header">Additional Notes</div>
            <div class="summary-box">
              ${record.notes}
            </div>
          ` : ""}

          <div class="print-signature">
            <div class="sig-column">
              <div class="sig-line"></div>
              <div class="sig-name">Dr. D. Priyadharshni</div>
              <div class="sig-details">Dch, DNB (paed)</div>
              <div class="sig-details">Paediatrician and play therapist</div>
              <div class="sig-details">Milestones Developmental Center</div>
            </div>
            <div class="sig-column">
              <div class="sig-line"></div>
              <div class="sig-name">${record.created_by_name || "Ms. Sivashankari"}</div>
              <div class="sig-details">${record.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS"}</div>
              <div class="sig-details">${record.created_by_designation || "Occupational Therapist"}</div>
              <div class="sig-details">Milestones Developmental Center</div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleDownloadPDF = (record) => {
    const motorSkills = parseJSON(record.motor_skills) || {}
    const handwritingSkills = parseJSON(record.handwriting_skills) || {}
    const cognitiveConcepts = parseJSON(record.cognitive_concepts) || {}
    const visualSkills = parseJSON(record.visual_perceptual_skills) || {}
    const sensoryEval = parseJSON(record.sensory_profile) || {}
    const adlEval = parseJSON(record.adl_evaluation) || {}
    const assessments = parseJSON(record.assessments_used) || {}

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;
    let pageNum = 1;

    // Colors
    const primary = [64, 97, 71];
    const primaryDark = [45, 69, 50];
    const bgLight = [240, 245, 241];
    const textDark = [33, 37, 41];
    const textLight = [108, 117, 125];

    // Helper: Add Letterhead Header
    const addPageHeader = () => {
      pdf.setFontSize(14);
      pdf.setTextColor(...primary);
      pdf.setFont("helvetica", "bold");
      pdf.text("MILESTONES DEVELOPMENTAL CENTER", pageWidth / 2, 15, { align: "center" });

      pdf.setFontSize(8.5);
      pdf.setTextColor(...textLight);
      pdf.setFont("helvetica", "normal");
      pdf.text("59 / 37, SARADHA COLLEGE ROAD, SALEM - 636007 | Ph: 9047033633", pageWidth / 2, 21, { align: "center" });

      pdf.setDrawColor(...primary);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 24, pageWidth - margin, 24);

      y = 32;
    };

    const addPageFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      pdf.setFontSize(8);
      pdf.setTextColor(...textLight);
      pdf.setFont("helvetica", "normal");
      const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      pdf.text(`Generated: ${dateStr}`, margin, footerY);
      pdf.text(`Patient: ${record.patientName || "N/A"} | Reg: ${record.registrationNumber || "N/A"}`, pageWidth / 2, footerY, { align: "center" });
      pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
    };

    const checkPageBreak = (neededSpace) => {
      if (y + neededSpace > pageHeight - 25) {
        addPageFooter();
        pdf.addPage();
        pageNum++;
        addPageHeader();
      }
    };

    const addDocumentTitle = () => {
      pdf.setFontSize(12);
      pdf.setTextColor(...textDark);
      pdf.setFont("helvetica", "bold");
      pdf.text("OCCUPATIONAL THERAPY REPORT", pageWidth / 2, y, { align: "center" });

      const titleWidth = pdf.getTextWidth("OCCUPATIONAL THERAPY REPORT");
      pdf.setDrawColor(...textDark);
      pdf.setLineWidth(0.8);
      pdf.line(pageWidth / 2 - titleWidth / 2, y + 1.5, pageWidth / 2 + titleWidth / 2, y + 1.5);
      y += 8;

      // Patient Info Table Grid (exactly like screenshots)
      const assessmentDateStr = record.assessment_date ? new Date(record.assessment_date).toLocaleDateString() : "N/A";
      const patientDetails = [
        [`Name: ${record.patientName || "N/A"}`, `DOB: ${record.dob || "—"}`, `Date of Evaluation: ${assessmentDateStr}`],
        [`Father: ${record.father || "—"}`, `Age: ${record.age || "—"}`, `Reg. No.: ${record.registrationNumber || "—"}`],
        [`Mother: ${record.mother || "—"}`, `Mobile: ${record.mobile || "—"}`, `Address: ${record.address || "—"}`]
      ];

      autoTable(pdf, {
        body: patientDetails,
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: {
          fontSize: 8.5,
          cellPadding: 3.5,
          textColor: textDark,
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
          fillColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 55 },
          2: { cellWidth: 60 }
        },
        didDrawPage: (data) => {
          y = data.cursor.y + 6;
        }
      });
    };

    const addSectionHeader = (title) => {
      checkPageBreak(15);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(...textDark);
      pdf.text(title + ":", margin, y);

      const textWidth = pdf.getTextWidth(title + ":");
      pdf.setDrawColor(...textDark);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y + 1, margin + textWidth, y + 1);
      y += 7;
    };

    const addBulletPoint = (text) => {
      checkPageBreak(8);

      // Draw a small filled triangle pointing right
      pdf.setFillColor(...primary);
      pdf.triangle(margin, y - 2.5, margin + 2.5, y - 1.25, margin, y, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      const lines = pdf.splitTextToSize(text, contentWidth - 6);
      pdf.text(lines, margin + 5, y);
      y += lines.length * 4.5 + 1.5;
    };

    const addInfoCardAt = (x, yPos, width, label, value) => {
      pdf.setFillColor(...bgLight);
      pdf.roundedRect(x, yPos, width, 10, 1.5, 1.5, "F");
      pdf.setFillColor(...primary);
      pdf.rect(x, yPos, 1.5, 10, "F");
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primary);
      pdf.text(label, x + 4, yPos + 4);
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textDark);
      pdf.text(String(value || "—").substring(0, 45), x + 4, yPos + 8);
    };

    const addTwoColumnCards = (cards) => {
      for (let i = 0; i < cards.length; i += 2) {
        checkPageBreak(14);
        const cardWidth = contentWidth / 2 - 4;
        addInfoCardAt(margin, y, cardWidth, cards[i].label, cards[i].value);
        if (cards[i + 1]) {
          addInfoCardAt(margin + cardWidth + 8, y, cardWidth, cards[i + 1].label, cards[i + 1].value);
        }
        y += 13;
      }
      y += 2;
    };

    const addSummaryBox = (text) => {
      checkPageBreak(25);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      const lines = pdf.splitTextToSize(text || "None recorded", contentWidth - 10);
      const boxHeight = lines.length * 4.5 + 8;

      pdf.setFillColor(248, 249, 240);
      pdf.setDrawColor(220, 225, 215);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");

      pdf.text(lines, margin + 5, y + 5.5);
      y += boxHeight + 6;
    };

    const addInlineSection = (label, text) => {
      checkPageBreak(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      pdf.text(label + ": ", margin, y);

      const labelWidth = pdf.getTextWidth(label + ": ");
      pdf.setFont("helvetica", "normal");

      const fullText = text || "None recorded";
      const firstLineMaxWidth = contentWidth - labelWidth;
      const firstLineWords = fullText.split(" ");
      let firstLineText = "";
      let wordIndex = 0;

      while (wordIndex < firstLineWords.length) {
        const testText = firstLineText + (firstLineText ? " " : "") + firstLineWords[wordIndex];
        if (pdf.getTextWidth(testText) < firstLineMaxWidth) {
          firstLineText = testText;
          wordIndex++;
        } else {
          break;
        }
      }

      const remainingText = firstLineWords.slice(wordIndex).join(" ");
      pdf.text(firstLineText, margin + labelWidth, y);

      if (remainingText) {
        y += 4.5;
        const remainingLines = pdf.splitTextToSize(remainingText, contentWidth);
        pdf.text(remainingLines, margin, y);
        y += remainingLines.length * 4.5 + 2;
      } else {
        y += 6.5;
      }
    };

    const addMilestoneTable = (headers, rows) => {
      checkPageBreak(30);
      autoTable(pdf, {
        head: [headers],
        body: rows,
        startY: y,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          textColor: textDark,
          lineColor: [180, 180, 180],
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: bgLight,
          textColor: textDark,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: bgLight,
        },
        didDrawPage: (data) => {
          y = data.cursor.y + 8;
        }
      });
    };

    const addSignatureBlock = () => {
      checkPageBreak(35);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...textLight);
      pdf.text("Reported by", pageWidth / 2, y, { align: "center" });
      y += 2.5;

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      pdf.setFont("helvetica", "bold");
      pdf.text("Dr. D. Priyadharshni", margin, y);
      pdf.text(record.created_by_name || "Ms. Sivashankari", pageWidth - margin - 60, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...textLight);

      y += 4;
      pdf.text("Dch, DNB (paed)", margin, y);
      pdf.text(record.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Paediatrician and play therapist", margin, y);
      pdf.text(record.created_by_designation || "Occupational Therapist", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Milestones Developmental Center", margin, y);
      pdf.text("Milestones Developmental Center", pageWidth - margin - 60, y);
      y += 10;
    };

    addPageHeader();
    addDocumentTitle();

    // Motor Skills Section
    if (Object.keys(motorSkills).length > 0 && (motorSkills.grossMotor?.length > 0 || motorSkills.fineMotor?.length > 0)) {
      addSectionHeader("Motor Skills");

      const grossList = motorSkills.grossMotor || [];
      if (grossList.length > 0) {
        checkPageBreak(12);
        pdf.setFontSize(9.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryDark);
        pdf.text("Gross Motor Skills:", margin, y);
        y += 4.5;
        grossList.forEach(skill => addBulletPoint(skill));
      }
      y += 2;

      const fineList = motorSkills.fineMotor || [];
      if (fineList.length > 0) {
        checkPageBreak(12);
        pdf.setFontSize(9.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryDark);
        pdf.text("Fine Motor Skills:", margin, y);
        y += 4.5;
        fineList.forEach(skill => addBulletPoint(skill));
      }
      y += 2;
    }

    // Handwriting Skills Section
    if (Object.keys(handwritingSkills).length > 0) {
      addSectionHeader("Handwriting Skills");
      const cards = [];
      if (handwritingSkills.positionOfChild) cards.push({ label: "POSITION OF CHILD", value: handwritingSkills.positionOfChild });
      if (handwritingSkills.scribbling) cards.push({ label: "SCRIBBLING/COLORING", value: handwritingSkills.scribbling });
      if (handwritingSkills.pencilGrasp) cards.push({ label: "PENCIL GRASP", value: handwritingSkills.pencilGrasp });
      if (handwritingSkills.basicFigures) cards.push({ label: "BASIC FIGURES", value: handwritingSkills.basicFigures });
      if (handwritingSkills.writingAlphabets) cards.push({ label: "WRITING ALPHABETS & NUMBERS", value: handwritingSkills.writingAlphabets });
      addTwoColumnCards(cards);
    }

    // Cognitive Concepts Section
    if (Object.keys(cognitiveConcepts).length > 0) {
      addSectionHeader("Cognitive Concepts");
      const cards = [];
      if (cognitiveConcepts.attention) cards.push({ label: "ATTENTION", value: cognitiveConcepts.attention });
      if (cognitiveConcepts.memory) cards.push({ label: "MEMORY", value: cognitiveConcepts.memory });
      if (cognitiveConcepts.planning) cards.push({ label: "PLANNING", value: cognitiveConcepts.planning });
      if (cognitiveConcepts.orientation) cards.push({ label: "ORIENTATION", value: cognitiveConcepts.orientation });
      if (cognitiveConcepts.rtLtDiscrimination) cards.push({ label: "RT/LT DISCRIMINATION", value: cognitiveConcepts.rtLtDiscrimination });
      addTwoColumnCards(cards);
    }

    // Visual Perceptual Skills Section
    if (Object.keys(visualSkills).length > 0) {
      addSectionHeader("Visual Perceptual Skills");
      const headers = ["Skill", "Response", "Notes"];
      const rows = Object.entries(visualSkills).map(([key, value]) => {
        const skillName = key === 'skill1' ? 'Puts together 2 pieces of puzzles' :
          key === 'skill2' ? 'Completes 4-5 pieces of puzzles' :
            key === 'skill3' ? 'Matches letters, shapes & numbers' :
              key === 'skill4' ? 'Imitates block train & patterns' :
                'Copies horizontal block patterns';
        return [skillName, value.answer || "N/A", value.notes || "N/A"];
      });
      addMilestoneTable(headers, rows);
    }

    // Sensory Profile / Sensory Evaluation Section
    if (Object.keys(sensoryEval).length > 0) {


      if (sensoryEval.scores) {
        const isToddler = sensoryEval.is7mTo35m || false;
        addSectionHeader(`Sensory Profile (${isToddler ? "7m to 35m - 54 box" : "Default - 86 box"})`);
        
        const config = isToddler ? SENSORY_PROFILE_CONFIG.toddler : SENSORY_PROFILE_CONFIG.default;
        const scores = sensoryEval.scores || {};
        
        const seekingTotal = calculateQuadrantTotal(scores, config.seeking);
        const avoidingTotal = calculateQuadrantTotal(scores, config.avoiding);
        const sensitivityTotal = calculateQuadrantTotal(scores, config.sensitivity);
        const registrationTotal = calculateQuadrantTotal(scores, config.registration);

        const maxLength = Math.max(
          config.seeking.length,
          config.avoiding.length,
          config.sensitivity.length,
          config.registration.length
        );

        const headers = [
          "Seeking Item", "Score",
          "Avoiding Item", "Score",
          "Sensitivity Item", "Score",
          "Registration Item", "Score"
        ];
        
        const rows = [];
        for (let i = 0; i < maxLength; i++) {
          rows.push([
            config.seeking[i] !== undefined ? String(config.seeking[i]) : "",
            config.seeking[i] !== undefined ? String(scores[config.seeking[i]] || "") : "",
            config.avoiding[i] !== undefined ? String(config.avoiding[i]) : "",
            config.avoiding[i] !== undefined ? String(scores[config.avoiding[i]] || "") : "",
            config.sensitivity[i] !== undefined ? String(config.sensitivity[i]) : "",
            config.sensitivity[i] !== undefined ? String(scores[config.sensitivity[i]] || "") : "",
            config.registration[i] !== undefined ? String(config.registration[i]) : "",
            config.registration[i] !== undefined ? String(scores[config.registration[i]] || "") : ""
          ]);
        }
        
        rows.push([
          "Total", String(seekingTotal),
          "Total", String(avoidingTotal),
          "Total", String(sensitivityTotal),
          "Total", String(registrationTotal)
        ]);

        checkPageBreak(30);
        autoTable(pdf, {
          head: [headers],
          body: rows,
          startY: y,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 7.5,
            cellPadding: 2,
            textColor: textDark,
            lineColor: [180, 180, 180],
            lineWidth: 0.2
          },
          headStyles: {
            fillColor: [64, 97, 71],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          didParseCell: (data) => {
            if (data.row.index === rows.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [240, 240, 240];
            }
          },
          didDrawPage: (data) => {
            y = data.cursor.y + 8;
          }
        });
      } else {
        addSectionHeader("Sensory Evaluation");
        const headers = ["Modality", "Hypersensitivity", "Hyposensitivity", "Both"];
        const rows = Object.entries(sensoryEval).map(([key, value]) => {
          const label = key === 'tactile' ? 'Tactile' :
            key === 'vestibular' ? 'Vestibular' :
              key === 'proprioception' ? 'Proprioception' :
                key === 'auditory' ? 'Auditory' :
                  key === 'visual' ? 'Visual' :
                    key === 'oral' ? 'Oral – Peri & Intra' :
                      key.charAt(0).toUpperCase() + key.slice(1);
          return [label, value.hyper || "-", value.hypo || "-", value.both || "-"];
        });
        addMilestoneTable(headers, rows);
      }
    }

    // ADL Evaluation Section
    if (Object.keys(adlEval).length > 0) {
      addSectionHeader("ADL Evaluation");
      if (adlEval.overallLevel) {
        checkPageBreak(12);
        pdf.setFontSize(9.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryDark);
        pdf.text(`Overall Dependency Level: ${adlEval.overallLevel}`, margin, y);
        y += 6;
      }
      if (adlEval.activities && Object.keys(adlEval.activities).length > 0) {
        const headers = ["Activity", "Status", "Notes"];
        const rows = Object.entries(adlEval.activities).map(([key, value]) => {
          const activityName = key === 'toileting' ? 'Toileting' :
            key === 'brushing' ? 'Brushing' :
              key === 'bathing' ? 'Bathing' :
                key === 'dressing' ? 'Dressing & Undressing' :
                  key === 'buttoning' ? 'Buttoning & Unbuttoning' :
                    key === 'grooming' ? 'Grooming' :
                      key === 'eating' ? 'Eating' :
                        key.charAt(0).toUpperCase() + key.slice(1);
          return [activityName, value.selected || "N/A", value.notes || "-"];
        });
        checkPageBreak(30);
        autoTable(pdf, {
          head: [headers],
          body: rows,
          startY: y,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
          headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
              const val = String(data.cell.raw || '').trim().toLowerCase();
              if (val.includes('independent')) {
                data.cell.styles.textColor = [46, 125, 50];
                data.cell.styles.fontStyle = 'bold';
              } else if (val.includes('partial') || val.includes('assisted')) {
                data.cell.styles.textColor = [237, 108, 2];
                data.cell.styles.fontStyle = 'bold';
              } else if (val.includes('dependent')) {
                data.cell.styles.textColor = [211, 47, 47];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          },
          didDrawPage: (data) => { y = data.cursor.y + 8; }
        });
      }
    }

    // Assessments Used Section
    if (Object.keys(assessments).length > 0 && (assessments.sensoryEvaluation || assessments.multisensoryProfile || assessments.weefin || assessments.other)) {
      addSectionHeader("Assessments Used");
      const cards = [];
      if (assessments.sensoryEvaluation) cards.push({ label: "SENSORY EVALUATION", value: assessments.sensoryEvaluation });
      if (assessments.multisensoryProfile) cards.push({ label: "MULTISENSORY PROFILE", value: assessments.multisensoryProfile });
      if (assessments.weefin) cards.push({ label: "WEEFIM", value: assessments.weefin });
      if (assessments.other) cards.push({ label: "OTHER", value: assessments.other });
      addTwoColumnCards(cards);
    }

    // Clinical Impression Section
    if (record.impression) {
      addSectionHeader("Summary / Clinical Impression");
      addSummaryBox(record.impression);
    }

    // Impression inline
    if (record.diagnosis || record.overall_impression) {
      addInlineSection("Impression", record.diagnosis || record.overall_impression);
      y += 2;
    }

    // Recommendations
    if (record.recommendation || record.recommendations) {
      addSectionHeader("Recommendations");
      const recs = String(record.recommendation || record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean);
      recs.forEach(rec => addBulletPoint(rec));
      y += 2;
    }

    // Notes Section
    if (record.notes) {
      addInlineSection("Additional Notes", record.notes);
    }

    addSignatureBlock();
    addPageFooter();
    pdf.save(`${record.patientName || "Patient"}_Occupational_Therapy_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const renderDetailView = (record) => {
    console.log('Rendering detail view for record:', record)

    const motorSkills = parseJSON(record.motor_skills) || {}
    const handwritingSkills = parseJSON(record.handwriting_skills) || {}
    const cognitiveConcepts = parseJSON(record.cognitive_concepts) || {}
    const visualSkills = parseJSON(record.visual_perceptual_skills) || {}
    const sensoryEval = parseJSON(record.sensory_profile) || {}
    const adlEval = parseJSON(record.adl_evaluation) || {}
    const assessments = parseJSON(record.assessments_used) || {}

    console.log('Modal - motorSkills:', motorSkills)
    console.log('Modal - handwritingSkills:', handwritingSkills)
    console.log('Modal - sensoryEval:', sensoryEval)

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

        {motorSkills && (
          <Section>
            <SectionTitle>Motor Skills</SectionTitle>
            <DetailGrid>
              <DetailField>
                <label>Gross Motor Skills</label>
                <ListItems>
                  {motorSkills.grossMotor?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  )) || <li>Not assessed</li>}
                </ListItems>
              </DetailField>
              <DetailField>
                <label>Fine Motor Skills</label>
                <ListItems>
                  {motorSkills.fineMotor?.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  )) || <li>Not assessed</li>}
                </ListItems>
              </DetailField>
            </DetailGrid>
          </Section>
        )}

        {handwritingSkills && (
          <Section>
            <SectionTitle>Handwriting Skills</SectionTitle>
            <DetailGrid>
              <DetailField>
                <label>Position of Child</label>
                <p>{handwritingSkills.positionOfChild || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Scribbling/Coloring</label>
                <p>{handwritingSkills.scribbling || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Pencil Grasp</label>
                <p>{handwritingSkills.pencilGrasp || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Basic Figures</label>
                <p>{handwritingSkills.basicFigures || "N/A"}</p>
              </DetailField>
              <DetailField className="full-width">
                <label>Writing Alphabets & Numbers</label>
                <p>{handwritingSkills.writingAlphabets || "N/A"}</p>
              </DetailField>
            </DetailGrid>
          </Section>
        )}

        {cognitiveConcepts && (
          <Section>
            <SectionTitle>Cognitive Concepts</SectionTitle>
            <DetailGrid>
              <DetailField>
                <label>Attention</label>
                <p>{cognitiveConcepts.attention || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Memory</label>
                <p>{cognitiveConcepts.memory || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Planning</label>
                <p>{cognitiveConcepts.planning || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Orientation</label>
                <p>{cognitiveConcepts.orientation || "N/A"}</p>
              </DetailField>
              <DetailField className="full-width">
                <label>RT/LT Discrimination</label>
                <p>{cognitiveConcepts.rtLtDiscrimination || "N/A"}</p>
              </DetailField>
            </DetailGrid>
          </Section>
        )}

        {visualSkills && (
          <Section>
            <SectionTitle>Visual Perceptual Skills</SectionTitle>
            <DetailGrid>
              {Object.entries(visualSkills).map(([key, value]) => (
                <DetailField key={key} className="full-width">
                  <label>
                    {key === 'skill1' ? 'Puts together 2 pieces of puzzles' :
                      key === 'skill2' ? 'Completes 4-5 pieces of puzzles' :
                        key === 'skill3' ? 'Matches letters, shapes & numbers' :
                          key === 'skill4' ? 'Imitates block train & patterns' :
                            'Copies horizontal block patterns'}
                  </label>
                  <p><strong>{value.answer || "N/A"}</strong> - {value.notes || "No notes"}</p>
                </DetailField>
              ))}
            </DetailGrid>
          </Section>
        )}

        {sensoryEval && (
          <Section>
            <SectionTitle>Sensory Profile</SectionTitle>

            {sensoryEval.scores ? (() => {
              const isToddler = sensoryEval.is7mTo35m || false;
              const config = isToddler ? SENSORY_PROFILE_CONFIG.toddler : SENSORY_PROFILE_CONFIG.default;
              const scores = sensoryEval.scores || {};
              
              const seekingTotal = calculateQuadrantTotal(scores, config.seeking);
              const avoidingTotal = calculateQuadrantTotal(scores, config.avoiding);
              const sensitivityTotal = calculateQuadrantTotal(scores, config.sensitivity);
              const registrationTotal = calculateQuadrantTotal(scores, config.registration);

              return (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', color: THEME.colors.text }}>
                    Profile Type: {isToddler ? "7m to 35m (54 box)" : "Default (86 box)"}
                  </div>
                  <SensoryGrid>
                    {/* Seeking column */}
                    <SensoryColumn borderColor="#f59e0b">
                      <ColumnHeader bgColor="#f59e0b">Seeking/Seeker</ColumnHeader>
                      <ColumnSubHeader>
                        <span>Item</span>
                        <span>Raw Score</span>
                      </ColumnSubHeader>
                      <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                        {config.seeking.map(itemNum => (
                          <ItemRow key={itemNum}>
                            <ItemNumber>{itemNum}</ItemNumber>
                            <ScoreValue>{scores[itemNum] || "-"}</ScoreValue>
                          </ItemRow>
                        ))}
                      </div>
                      <ColumnTotalRow borderColor="#f59e0b">
                        <TotalLabel>Seeking Quadrant Total</TotalLabel>
                        <TotalValue color="#f59e0b">{seekingTotal}</TotalValue>
                      </ColumnTotalRow>
                    </SensoryColumn>

                    {/* Avoiding column */}
                    <SensoryColumn borderColor="#3b82f6">
                      <ColumnHeader bgColor="#3b82f6">Avoiding/Avoider</ColumnHeader>
                      <ColumnSubHeader>
                        <span>Item</span>
                        <span>Raw Score</span>
                      </ColumnSubHeader>
                      <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                        {config.avoiding.map(itemNum => (
                          <ItemRow key={itemNum}>
                            <ItemNumber>{itemNum}</ItemNumber>
                            <ScoreValue>{scores[itemNum] || "-"}</ScoreValue>
                          </ItemRow>
                        ))}
                      </div>
                      <ColumnTotalRow borderColor="#3b82f6">
                        <TotalLabel>Avoiding Quadrant Total</TotalLabel>
                        <TotalValue color="#3b82f6">{avoidingTotal}</TotalValue>
                      </ColumnTotalRow>
                    </SensoryColumn>

                    {/* Sensitivity column */}
                    <SensoryColumn borderColor="#10b981">
                      <ColumnHeader bgColor="#10b981">Sensitivity/Sensor</ColumnHeader>
                      <ColumnSubHeader>
                        <span>Item</span>
                        <span>Raw Score</span>
                      </ColumnSubHeader>
                      <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                        {config.sensitivity.map(itemNum => (
                          <ItemRow key={itemNum}>
                            <ItemNumber>{itemNum}</ItemNumber>
                            <ScoreValue>{scores[itemNum] || "-"}</ScoreValue>
                          </ItemRow>
                        ))}
                      </div>
                      <ColumnTotalRow borderColor="#10b981">
                        <TotalLabel>Sensitivity Quadrant Total</TotalLabel>
                        <TotalValue color="#10b981">{sensitivityTotal}</TotalValue>
                      </ColumnTotalRow>
                    </SensoryColumn>

                    {/* Registration column */}
                    <SensoryColumn borderColor="#db2777">
                      <ColumnHeader bgColor="#db2777">Registration/Bystander</ColumnHeader>
                      <ColumnSubHeader>
                        <span>Item</span>
                        <span>Raw Score</span>
                      </ColumnSubHeader>
                      <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                        {config.registration.map(itemNum => (
                          <ItemRow key={itemNum}>
                            <ItemNumber>{itemNum}</ItemNumber>
                            <ScoreValue>{scores[itemNum] || "-"}</ScoreValue>
                          </ItemRow>
                        ))}
                      </div>
                      <ColumnTotalRow borderColor="#db2777">
                        <TotalLabel>Registration Quadrant Total</TotalLabel>
                        <TotalValue color="#db2777">{registrationTotal}</TotalValue>
                      </ColumnTotalRow>
                    </SensoryColumn>
                  </SensoryGrid>
                </div>
              );
            })() : (
              <Table>
                <thead>
                  <tr>
                    <th>Modality</th>
                    <th>Hypersensitivity</th>
                    <th>Hyposensitivity</th>
                    <th>Both</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sensoryEval).map(([key, value]) => (
                    <tr key={key}>
                      <td><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                      <td>{value.hyper || "-"}</td>
                      <td>{value.hypo || "-"}</td>
                      <td>{value.both || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Section>
        )}

        {adlEval && (
          <Section>
            <SectionTitle>ADL Evaluation</SectionTitle>
            <DetailGrid>
              <DetailField className="full-width">
                <label>Overall Dependency Level</label>
                <p><strong>{adlEval.overallLevel || "N/A"}</strong></p>
              </DetailField>
            </DetailGrid>
            <Table style={{ marginTop: "16px" }}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(adlEval.activities || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                    <td>{value.selected || "N/A"}</td>
                    <td>{value.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        )}

        {assessments && (
          <Section>
            <SectionTitle>Assessments Used</SectionTitle>
            <DetailGrid>
              <DetailField>
                <label>Sensory Evaluation</label>
                <p>{assessments.sensoryEvaluation || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Multisensory Profile</label>
                <p>{assessments.multisensoryProfile || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>WeeFIM</label>
                <p>{assessments.weefin || "N/A"}</p>
              </DetailField>
              <DetailField>
                <label>Other</label>
                <p>{assessments.other || "N/A"}</p>
              </DetailField>
            </DetailGrid>
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

        {(record.recommendation || record.recommendations) && (
          <Section>
            <SectionTitle>Recommendations</SectionTitle>
            <DetailField className="full-width">
              <p style={{
                backgroundColor: "#d4edda",
                border: "2px solid #28a745",
                borderRadius: THEME.borderRadius.medium,
                padding: "16px"
              }}>
                {record.recommendation || record.recommendations}
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
        <PageTitle>Occupational Therapy Assessment Report</PageTitle>
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
                    <Button className="primary" onClick={() => handleEdit(item)}>
                      <Edit size={16} /> Edit
                    </Button>
                    <Button className="primary" onClick={() => handleDownloadPDF(item)}>
                      <Download size={16} /> Download
                    </Button>
                    <Button className="primary" onClick={() => handlePrintHTML(item)}>
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
            <ModalBody id="printable-report-content">
              {renderDetailView(selectedRecord)}
            </ModalBody>
            <ModalFooter>
              <Button className="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button className="primary" onClick={() => { handleEdit(selectedRecord); setShowModal(false); }}>
                <Edit size={18} /> Edit
              </Button>
              <Button className="primary" onClick={() => handleDownloadPDF(selectedRecord)}>
                <Download size={18} /> Download PDF
              </Button>
              <Button className="primary" onClick={() => handlePrintHTML(selectedRecord)}>
                <Printer size={18} /> Print Report
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  )
}