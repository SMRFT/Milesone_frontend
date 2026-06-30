"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { Calendar, Eye, Printer, X, Download } from "lucide-react"
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

export default function OccupationalTherapyReport() {
  const today = new Date().toISOString().split("T")[0]
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0])
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

  // Helper function to check if data is displayable (not empty or N/A)
  const hasDisplayableContent = (obj) => {
    if (!obj) return false
    if (typeof obj !== "object") return !!obj && obj !== "" && obj !== "N/A"
    if (Array.isArray(obj)) return obj.length > 0 && obj.some(item => item && item !== "" && item !== "N/A")
    return Object.values(obj).some(val => val && val !== "" && val !== "N/A")
  }

  // Helper to display value only if not empty
  const displayValue = (value) => {
    if (!value || value === "" || value === "N/A") return null
    return value
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
    const sensoryEval = parseJSON(record.sensory_evaluation) || {}
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
        return `
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

          ${record.recommendations ? `
            <div class="section-header">Recommendations</div>
            <ul class="bullet-list">
              ${String(record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean).map(rec => `<li class="bullet-item">${rec}</li>`).join("")}
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
    const sensoryEval = parseJSON(record.sensory_evaluation) || {}
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

    // Sensory Evaluation Section
    if (Object.keys(sensoryEval).length > 0) {
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
    if (record.recommendations) {
      addSectionHeader("Recommendations");
      const recs = String(record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean);
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
    const sensoryEval = parseJSON(record.sensory_evaluation) || {}
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
            {hasDisplayableContent(record.registrationNumber) && (
              <DetailField>
                <label>Registration Number</label>
                <p>{record.registrationNumber}</p>
              </DetailField>
            )}
            {hasDisplayableContent(record.patientName) && (
              <DetailField>
                <label>Patient Name</label>
                <p>{record.patientName}</p>
              </DetailField>
            )}
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
              {hasDisplayableContent(handwritingSkills.positionOfChild) && (
                <DetailField>
                  <label>Position of Child</label>
                  <p>{handwritingSkills.positionOfChild}</p>
                </DetailField>
              )}
              {hasDisplayableContent(handwritingSkills.scribbling) && (
                <DetailField>
                  <label>Scribbling/Coloring</label>
                  <p>{handwritingSkills.scribbling}</p>
                </DetailField>
              )}
              {hasDisplayableContent(handwritingSkills.pencilGrasp) && (
                <DetailField>
                  <label>Pencil Grasp</label>
                  <p>{handwritingSkills.pencilGrasp}</p>
                </DetailField>
              )}
              {hasDisplayableContent(handwritingSkills.basicFigures) && (
                <DetailField>
                  <label>Basic Figures</label>
                  <p>{handwritingSkills.basicFigures}</p>
                </DetailField>
              )}
              {hasDisplayableContent(handwritingSkills.writingAlphabets) && (
                <DetailField className="full-width">
                  <label>Writing Alphabets & Numbers</label>
                  <p>{handwritingSkills.writingAlphabets}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {cognitiveConcepts && (
          <Section>
            <SectionTitle>Cognitive Concepts</SectionTitle>
            <DetailGrid>
              {hasDisplayableContent(cognitiveConcepts.attention) && (
                <DetailField>
                  <label>Attention</label>
                  <p>{cognitiveConcepts.attention}</p>
                </DetailField>
              )}
              {hasDisplayableContent(cognitiveConcepts.memory) && (
                <DetailField>
                  <label>Memory</label>
                  <p>{cognitiveConcepts.memory}</p>
                </DetailField>
              )}
              {hasDisplayableContent(cognitiveConcepts.planning) && (
                <DetailField>
                  <label>Planning</label>
                  <p>{cognitiveConcepts.planning}</p>
                </DetailField>
              )}
              {hasDisplayableContent(cognitiveConcepts.orientation) && (
                <DetailField>
                  <label>Orientation</label>
                  <p>{cognitiveConcepts.orientation}</p>
                </DetailField>
              )}
              {hasDisplayableContent(cognitiveConcepts.rtLtDiscrimination) && (
                <DetailField className="full-width">
                  <label>RT/LT Discrimination</label>
                  <p>{cognitiveConcepts.rtLtDiscrimination}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {visualSkills && (
          <Section>
            <SectionTitle>Visual Perceptual Skills</SectionTitle>
            <DetailGrid>
              {Object.entries(visualSkills)
                .filter(([key, value]) => hasDisplayableContent(value.answer) || hasDisplayableContent(value.notes))
                .map(([key, value]) => (
                <DetailField key={key} className="full-width">
                  <label>
                    {key === 'skill1' ? 'Puts together 2 pieces of puzzles' :
                      key === 'skill2' ? 'Completes 4-5 pieces of puzzles' :
                        key === 'skill3' ? 'Matches letters, shapes & numbers' :
                          key === 'skill4' ? 'Imitates block train & patterns' :
                            'Copies horizontal block patterns'}
                  </label>
                  <p>
                    {hasDisplayableContent(value.answer) && <strong>{value.answer}</strong>}
                    {hasDisplayableContent(value.answer) && hasDisplayableContent(value.notes) && ' - '}
                    {hasDisplayableContent(value.notes) && value.notes}
                  </p>
                </DetailField>
              ))}
            </DetailGrid>
          </Section>
        )}

        {sensoryEval && (
          <Section>
            <SectionTitle>Sensory Evaluation</SectionTitle>
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
          </Section>
        )}

        {adlEval && (
          <Section>
            <SectionTitle>ADL Evaluation</SectionTitle>
            {hasDisplayableContent(adlEval.overallLevel) && (
              <DetailGrid>
                <DetailField className="full-width">
                  <label>Overall Dependency Level</label>
                  <p><strong>{adlEval.overallLevel}</strong></p>
                </DetailField>
              </DetailGrid>
            )}
            <Table style={{ marginTop: "16px" }}>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(adlEval.activities || {})
                  .filter(([key, value]) => hasDisplayableContent(value.selected) || hasDisplayableContent(value.notes))
                  .map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                    <td>{value.selected && value.selected.trim() !== "" ? value.selected : "-"}</td>
                    <td>{value.notes && value.notes.trim() !== "" ? value.notes : "-"}</td>
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
              {hasDisplayableContent(assessments.sensoryEvaluation) && (
                <DetailField>
                  <label>Sensory Evaluation</label>
                  <p>{assessments.sensoryEvaluation}</p>
                </DetailField>
              )}
              {hasDisplayableContent(assessments.multisensoryProfile) && (
                <DetailField>
                  <label>Multisensory Profile</label>
                  <p>{assessments.multisensoryProfile}</p>
                </DetailField>
              )}
              {hasDisplayableContent(assessments.weefin) && (
                <DetailField>
                  <label>WeeFIM</label>
                  <p>{assessments.weefin}</p>
                </DetailField>
              )}
              {hasDisplayableContent(assessments.other) && (
                <DetailField>
                  <label>Other</label>
                  <p>{assessments.other}</p>
                </DetailField>
              )}
            </DetailGrid>
          </Section>
        )}

        {hasDisplayableContent(record.impression) && (
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

        {hasDisplayableContent(record.notes) && (
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