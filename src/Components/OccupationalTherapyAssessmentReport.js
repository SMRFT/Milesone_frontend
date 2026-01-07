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


  const handlePrint = (record) => {
    console.log('Full record:', record)
    
    const motorSkills = parseJSON(record.motor_skills) || {}
    const handwritingSkills = parseJSON(record.handwriting_skills) || {}
    const cognitiveConcepts = parseJSON(record.cognitive_concepts) || {}
    const visualSkills = parseJSON(record.visual_perceptual_skills) || {}
    const sensoryEval = parseJSON(record.sensory_evaluation) || {}
    const adlEval = parseJSON(record.adl_evaluation) || {}
    const assessments = parseJSON(record.assessments_used) || {}
    
    const printWindow = window.open("", "_blank")
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OT Assessment - ${record.patientName}</title>
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
            
            .list-items {
              list-style: none;
              padding-left: 0;
            }
            
            .list-items li {
              padding: 4px 8px;
              margin-bottom: 3px;
              background-color: white;
              border-radius: 4px;
              font-size: 10px;
              border-left: 3px solid #4caf50;
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
            <h1>Occupational Therapy Assessment Report</h1>
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
          
          ${Object.keys(motorSkills).length > 0 && (motorSkills.grossMotor?.length > 0 || motorSkills.fineMotor?.length > 0) ? `
          <div class="section">
            <div class="section-title">Motor Skills</div>
            <div class="section-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Gross Motor Skills</label>
                  <ul class="list-items">
                    ${motorSkills.grossMotor && motorSkills.grossMotor.length > 0 ? motorSkills.grossMotor.map(skill => `<li>${skill}</li>`).join('') : '<li>Not assessed</li>'}
                  </ul>
                </div>
                <div class="detail-item">
                  <label>Fine Motor Skills</label>
                  <ul class="list-items">
                    ${motorSkills.fineMotor && motorSkills.fineMotor.length > 0 ? motorSkills.fineMotor.map(skill => `<li>${skill}</li>`).join('') : '<li>Not assessed</li>'}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(handwritingSkills).length > 0 ? `
          <div class="section">
            <div class="section-title">Handwriting Skills</div>
            <div class="section-content">
              <div class="detail-grid">
                ${handwritingSkills.positionOfChild ? `
                <div class="detail-item">
                  <label>Position of Child</label>
                  <p>${handwritingSkills.positionOfChild}</p>
                </div>
                ` : ''}
                ${handwritingSkills.scribbling ? `
                <div class="detail-item">
                  <label>Scribbling/Coloring</label>
                  <p>${handwritingSkills.scribbling}</p>
                </div>
                ` : ''}
                ${handwritingSkills.pencilGrasp ? `
                <div class="detail-item">
                  <label>Pencil Grasp</label>
                  <p>${handwritingSkills.pencilGrasp}</p>
                </div>
                ` : ''}
                ${handwritingSkills.basicFigures ? `
                <div class="detail-item">
                  <label>Basic Figures</label>
                  <p>${handwritingSkills.basicFigures}</p>
                </div>
                ` : ''}
                ${handwritingSkills.writingAlphabets ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>Writing Alphabets & Numbers</label>
                  <p>${handwritingSkills.writingAlphabets}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(cognitiveConcepts).length > 0 ? `
          <div class="section">
            <div class="section-title">Cognitive Concepts</div>
            <div class="section-content">
              <div class="detail-grid">
                ${cognitiveConcepts.attention ? `
                <div class="detail-item">
                  <label>Attention</label>
                  <p>${cognitiveConcepts.attention}</p>
                </div>
                ` : ''}
                ${cognitiveConcepts.memory ? `
                <div class="detail-item">
                  <label>Memory</label>
                  <p>${cognitiveConcepts.memory}</p>
                </div>
                ` : ''}
                ${cognitiveConcepts.planning ? `
                <div class="detail-item">
                  <label>Planning</label>
                  <p>${cognitiveConcepts.planning}</p>
                </div>
                ` : ''}
                ${cognitiveConcepts.orientation ? `
                <div class="detail-item">
                  <label>Orientation</label>
                  <p>${cognitiveConcepts.orientation}</p>
                </div>
                ` : ''}
                ${cognitiveConcepts.rtLtDiscrimination ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                  <label>RT/LT Discrimination</label>
                  <p>${cognitiveConcepts.rtLtDiscrimination}</p>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(visualSkills).length > 0 ? `
          <div class="section">
            <div class="section-title">Visual Perceptual Skills</div>
            <div class="section-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Response</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(visualSkills).map(([key, value]) => {
                    const skillName = key === 'skill1' ? 'Puts together 2 pieces of puzzles' :
                                     key === 'skill2' ? 'Completes 4-5 pieces of puzzles' :
                                     key === 'skill3' ? 'Matches letters, shapes & numbers' :
                                     key === 'skill4' ? 'Imitates block train & patterns' :
                                     'Copies horizontal block patterns';
                    return `
                    <tr>
                      <td>${skillName}</td>
                      <td><strong>${value.answer || "N/A"}</strong></td>
                      <td>${value.notes || "N/A"}</td>
                    </tr>
                  `}).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(sensoryEval).length > 0 ? `
          <div class="section">
            <div class="section-title">Sensory Evaluation</div>
            <div class="section-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Modality</th>
                    <th>Hypersensitivity</th>
                    <th>Hyposensitivity</th>
                    <th>Both</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(sensoryEval).map(([key, value]) => `
                    <tr>
                      <td><strong>${key === 'tactile' ? 'Tactile' : 
                                     key === 'vestibular' ? 'Vestibular' : 
                                     key === 'proprioception' ? 'Proprioception' : 
                                     key === 'auditory' ? 'Auditory' : 
                                     key === 'visual' ? 'Visual' : 
                                     key === 'oral' ? 'Oral – Peri & Intra' : 
                                     key.charAt(0).toUpperCase() + key.slice(1)}</strong></td>
                      <td>${value.hyper || "-"}</td>
                      <td>${value.hypo || "-"}</td>
                      <td>${value.both || "-"}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(adlEval).length > 0 ? `
          <div class="section">
            <div class="section-title">ADL Evaluation</div>
            <div class="section-content">
              ${adlEval.overallLevel ? `
              <div class="detail-item" style="margin-bottom: 12px;">
                <label>Overall Dependency Level</label>
                <p><strong>${adlEval.overallLevel}</strong></p>
              </div>
              ` : ''}
              ${adlEval.activities && Object.keys(adlEval.activities).length > 0 ? `
              <table class="table">
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
                    return `
                    <tr>
                      <td><strong>${activityName}</strong></td>
                      <td>${value.selected || "N/A"}</td>
                      <td>${value.notes || "-"}</td>
                    </tr>
                  `}).join('')}
                </tbody>
              </table>
              ` : ''}
            </div>
          </div>
          ` : ''}
          
          ${Object.keys(assessments).length > 0 && (assessments.sensoryEvaluation || assessments.multisensoryProfile || assessments.weefin || assessments.other) ? `
          <div class="section">
            <div class="section-title">Assessments Used</div>
            <div class="section-content">
              <div class="detail-grid">
                ${assessments.sensoryEvaluation ? `
                <div class="detail-item">
                  <label>Sensory Evaluation</label>
                  <p>${assessments.sensoryEvaluation}</p>
                </div>
                ` : ''}
                ${assessments.multisensoryProfile ? `
                <div class="detail-item">
                  <label>Multisensory Profile</label>
                  <p>${assessments.multisensoryProfile}</p>
                </div>
                ` : ''}
                ${assessments.weefin ? `
                <div class="detail-item">
                  <label>WeeFIM</label>
                  <p>${assessments.weefin}</p>
                </div>
                ` : ''}
                ${assessments.other ? `
                <div class="detail-item">
                  <label>Other</label>
                  <p>${assessments.other}</p>
                </div>
                ` : ''}
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
            <p>© Occupational Therapy Assessment System</p>
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