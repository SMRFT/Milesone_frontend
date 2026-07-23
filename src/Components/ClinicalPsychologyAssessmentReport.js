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

export default function ClinicalPsychologyReport() {
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
    navigate("/ClinicalPsychologyAssessment", { state: { editRecord: record } })
  }

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

  const parseJSON = (value) => {
    if (!value) return null
    if (typeof value === "object") return value
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  // 🔹 Common fetch function
  const fetchReportData = async (start, end) => {
    setLoading(true)
    setError("")

    try {
      const response = await apiRequest(
        `${Milestonebaseurl}clinical/?from_date=${start}&to_date=${end}`,
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
    const gt = parseJSON(record.general_temperament) || {}
    const bo = parseJSON(record.behavioral_observation) || []
    const au = parseJSON(record.assessments_used) || {}
    const assessmentDateStr = record.assessment_date ? new Date(record.assessment_date).toLocaleDateString() : "N/A";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Clinical Psychology Assessment Report - ${record.patientName || "Patient"}</title>
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
            
            .text-block {
              background: #fdfdfd;
              border: 1px solid #e2e8f0;
              padding: 12px;
              border-radius: 6px;
              margin-bottom: 15px;
              font-size: 9.5pt;
              color: #334155;
              white-space: pre-line;
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
              font-size: 7.5pt;
              font-weight: 700;
              color: #406147;
              text-transform: uppercase;
              margin-bottom: 3px;
            }
            .info-card-value {
              font-size: 8.5pt;
              color: #1e293b;
            }
            
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 15px;
            }
            .report-table th, .report-table td {
              border: 1px solid #e2e8f0;
              padding: 8px 10px;
              font-size: 9pt;
              text-align: left;
            }
            .report-table th {
              background: #f1f5f9;
              color: #0f172a;
              font-weight: 600;
            }
            
            .print-signature {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sig-column {
              text-align: left;
              font-size: 9.5pt;
            }
            .sig-line {
              border-top: 1px solid #cbd5e1;
              margin-top: 40px;
              padding-top: 5px;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="clinic-brand">
            <div>
              <div style="font-size: 16pt; font-weight: 700; color: #406147;">MILESTONES DEVELOPMENTAL CENTER</div>
              <div style="font-size: 8.5pt; color: #64748b; font-weight: 500; margin-top: 2px;">SPECIAL EDUCATION & THERAPY SERVICES</div>
            </div>
            <div class="contact-details">
              59 / 37, SARADHA COLLEGE ROAD, SALEM - 636007<br/>
              Ph: 9047033633 | Email: milestonesalem@gmail.com
            </div>
          </div>
          
          <div class="report-title">Clinical Psychology Report</div>
          
          <table class="demographics-table">
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
          </table>

          ${gt.clinical_psychology ? `
            <div class="section-header">Clinical Psychology Domains</div>
            <div class="text-block">${gt.clinical_psychology}</div>
          ` : ""}

          ${["communication", "daily_living_skill", "social_skill", "cognition", "fine_gross_motor"].some(k => gt[k]) ? `
            <div style="font-weight:600; margin-top:15px; margin-bottom:8px; font-size:9pt; color:#1e293b;">Developmental Skills:</div>
            <div class="info-grid">
              ${[
                { k: "communication", l: "Communication" },
                { k: "daily_living_skill", l: "Daily Living Skill" },
                { k: "social_skill", l: "Social Skill" },
                { k: "cognition", l: "Cognition" },
                { k: "fine_gross_motor", l: "Fine Motor & Gross Motor" }
              ].map(item => gt[item.k] ? `
                <div class="info-card">
                  <div class="info-card-label">${item.l}</div>
                  <div class="info-card-value">${gt[item.k]}</div>
                </div>
              ` : "").join("")}
            </div>
          ` : ""}

          ${(() => {
            const bo = parseJSON(selectedRecord.behavioral_observation);
            if (!bo) return "";
            if (typeof bo === "string") {
              return `
                <div class="section-header">Behavioral Observation & Assessments</div>
                <div class="text-block">${bo}</div>
              `;
            }
            if (typeof bo === "object" && !Array.isArray(bo) && "notes" in bo) {
              return `
                <div class="section-header">Behavioral Observation & Assessments</div>
                <div class="text-block">${bo.notes}</div>
              `;
            }
            if (Array.isArray(bo) && bo.length > 0 && bo.some(item => item.key || item.value)) {
              return `
                <div class="section-header">Behavioral Observation & Assessments</div>
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Score / Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bo.map(row => `
                      <tr>
                        <td><strong>${row.key || "—"}</strong></td>
                        <td>${row.value || "—"}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `;
            }
            return "";
          })()}

          ${(() => {
            const ta = parseJSON(selectedRecord.assessments_used)?.test_administration;
            if (!ta) return "";
            if (typeof ta === "string") {
              return `
                <div class="section-header">Test Administration</div>
                <div class="text-block">${ta}</div>
              `;
            }
            if (Array.isArray(ta) && ta.length > 0 && ta.some(item => item.key || item.value)) {
              return `
                <div class="section-header">Test Administration</div>
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>Assessment Name</th>
                      <th>Score / Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ta.map(row => `
                      <tr>
                        <td><strong>${row.key || "—"}</strong></td>
                        <td>${row.value || "—"}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `;
            }
            return "";
          })()}

          ${(() => {
            const ti = au.test_interpretation;
            if (!ti) return "";
            let html = '<div class="section-header">Test Interpretation</div>';
            if (typeof ti === "string") {
              html += `<div class="text-block">${ti}</div>`;
            } else {
              html += `<div class="text-block" style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px;">`;
              html += Object.entries(ti).map(([name, val]) => val ? `
                <div style="margin-bottom:10px;">
                  <strong style="color:#406147; text-transform:uppercase; font-size:8.5pt;">${name}:</strong>
                  <div style="margin-top:4px; font-size:9.5pt; color:#334155; white-space:pre-line;">${val}</div>
                </div>
              ` : "").join("");
              html += '</div>';
            }
            return html;
          })()}

          ${au.summary ? `
            <div class="section-header">Summary</div>
            <div class="text-block">${au.summary}</div>
          ` : ""}

          ${record.impression ? `
            <div class="section-header">Impression</div>
            <div class="text-block">${record.impression}</div>
          ` : ""}

          ${record.recommendation || record.recommendations ? `
            <div class="section-header">Recommendations</div>
            <ul style="margin: 8px 0; padding-left: 20px;">
              ${String(record.recommendation || record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean).map(rec => `
                <li style="margin-bottom: 5px; color: #334155;">${rec}</li>
              `).join("")}
            </ul>
          ` : ""}

          ${record.notes ? `
            <div class="section-header">Additional Notes</div>
            <div class="text-block">${record.notes}</div>
          ` : ""}

          <div class="print-signature">
            <div class="sig-column">
              <div class="sig-line"></div>
              <div class="sig-name">Dr. D. Priyadharshni</div>
              <div class="sig-details">Dch, DNB (paed)</div>
              <div class="sig-details">Paediatrician and play therapist</div>
              <div class="sig-details">Milestones Developmental Center</div>
            </div>
            <div class="sig-column" style="text-align: right;">
              <div class="sig-line"></div>
              <div class="sig-name">${record.created_by_name || "Ms. Sivashankari"}</div>
              <div class="sig-details">${record.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS"}</div>
              <div class="sig-details">${record.created_by_designation || "Psychologist"}</div>
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
    const gt = parseJSON(record.general_temperament) || {}
    const bo = parseJSON(record.behavioral_observation)
    const au = parseJSON(record.assessments_used) || {}

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;
    let pageNum = 1;

    // Colors
    const primary = [64, 97, 71];
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
      pdf.text("CLINICAL PSYCHOLOGY REPORT", pageWidth / 2, y, { align: "center" });

      const titleWidth = pdf.getTextWidth("CLINICAL PSYCHOLOGY REPORT");
      pdf.setDrawColor(...textDark);
      pdf.setLineWidth(0.8);
      pdf.line(pageWidth / 2 - titleWidth / 2, y + 1.5, pageWidth / 2 + titleWidth / 2, y + 1.5);
      y += 8;

      // Patient Info Table Grid
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
      pdf.text(record.created_by_designation || "Psychologist", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Milestones Developmental Center", margin, y);
      pdf.text("Milestones Developmental Center", pageWidth - margin - 60, y);
      y += 10;
    };

    addPageHeader();
    addDocumentTitle();

    if (gt.clinical_psychology) {
      addSectionHeader("Clinical Psychology Domains");
      addInlineSection("General Evaluation", gt.clinical_psychology);
    }

    const devSkills = [
      { k: "communication", l: "Communication" },
      { k: "daily_living_skill", l: "Daily Living Skill" },
      { k: "social_skill", l: "Social Skill" },
      { k: "cognition", l: "Cognition" },
      { k: "fine_gross_motor", l: "Fine Motor & Gross Motor" }
    ].filter(item => gt[item.k]).map(item => ({ label: item.l, value: gt[item.k] }));

    if (devSkills.length > 0) {
      addSectionHeader("Developmental Skills");
      addTwoColumnCards(devSkills);
    }

    const boVal = bo;
    if (boVal) {
      if (typeof boVal === "string") {
        addSectionHeader("Behavioral Observation & Assessments");
        addInlineSection("Details", boVal);
      } else if (typeof boVal === "object" && !Array.isArray(boVal) && "notes" in boVal) {
        addSectionHeader("Behavioral Observation & Assessments");
        addInlineSection("Details", boVal.notes);
      } else if (Array.isArray(boVal) && boVal.length > 0 && boVal.some(item => item.key || item.value)) {
        addSectionHeader("Behavioral Observation & Assessments");
        checkPageBreak(30);
        const boRows = boVal.map(row => [row.key || "—", row.value || "—"]);
        autoTable(pdf, {
          head: [["Assessment", "Score / Observations"]],
          body: boRows,
          startY: y,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
          headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } },
          didDrawPage: (data) => { y = data.cursor.y + 6; }
        });
      }
    }

    const ta = au.test_administration;
    if (ta) {
      if (typeof ta === "string") {
        addSectionHeader("Test Administration");
        addInlineSection("Details", ta);
      } else if (Array.isArray(ta) && ta.length > 0 && ta.some(item => item.key || item.value)) {
        addSectionHeader("Test Administration");
        checkPageBreak(30);
        const taRows = ta.map(row => [row.key || "—", row.value || "—"]);
        autoTable(pdf, {
          head: [["Assessment Name", "Score / Observations"]],
          body: taRows,
          startY: y,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
          headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
          columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } },
          didDrawPage: (data) => { y = data.cursor.y + 6; }
        });
      }
    }

    if (au.test_interpretation) {
      const ti = au.test_interpretation;
      if (typeof ti === "string") {
        addSectionHeader("Test Interpretation");
        addInlineSection("Details", ti);
      } else if (Object.values(ti).some(Boolean)) {
        addSectionHeader("Test Interpretation");
        Object.entries(ti).forEach(([name, val]) => {
          if (val) {
            addInlineSection(name, val);
          }
        });
      }
    }

    if (au.summary) {
      addSectionHeader("Summary");
      addInlineSection("Details", au.summary);
    }

    if (record.impression) {
      addSectionHeader("Summary / Clinical Impression");
      addInlineSection("Impression", record.impression);
    }

    if (record.recommendation || record.recommendations) {
      addSectionHeader("Recommendations");
      const recs = String(record.recommendation || record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean);
      recs.forEach(rec => addBulletPoint(rec));
      y += 2;
    }

    if (record.notes) {
      addInlineSection("Additional Notes", record.notes);
    }

    addSignatureBlock();
    addPageFooter();
    pdf.save(`${record.patientName || "Patient"}_Clinical_Psychology_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Clinical Psychology Assessment Report</PageTitle>
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
              <Section>
                <SectionTitle>Patient Information</SectionTitle>
                <DetailGrid>
                  <DetailField>
                    <label>Registration Number</label>
                    <p>{selectedRecord.registrationNumber || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Patient Name</label>
                    <p>{selectedRecord.patientName || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Assessment Date</label>
                    <p>{new Date(selectedRecord.assessment_date).toLocaleDateString()}</p>
                  </DetailField>
                </DetailGrid>
              </Section>

              {parseJSON(selectedRecord.general_temperament) && (
                <Section>
                  <SectionTitle>Clinical Psychology Domains</SectionTitle>
                  <DetailGrid>
                    {(() => {
                      const gt = parseJSON(selectedRecord.general_temperament) || {}
                      return (
                        <>
                          {gt.clinical_psychology && (
                            <DetailField className="full-width">
                              <label>Clinical Psychology Notes / General Evaluation</label>
                              <p>{gt.clinical_psychology}</p>
                            </DetailField>
                          )}
                          {gt.communication && (
                            <DetailField>
                              <label>Communication</label>
                              <p>{gt.communication}</p>
                            </DetailField>
                          )}
                          {gt.daily_living_skill && (
                            <DetailField>
                              <label>Daily Living Skill</label>
                              <p>{gt.daily_living_skill}</p>
                            </DetailField>
                          )}
                          {gt.social_skill && (
                            <DetailField>
                              <label>Social Skill</label>
                              <p>{gt.social_skill}</p>
                            </DetailField>
                          )}
                          {gt.cognition && (
                            <DetailField>
                              <label>Cognition</label>
                              <p>{gt.cognition}</p>
                            </DetailField>
                          )}
                          {gt.fine_gross_motor && (
                            <DetailField>
                              <label>Fine Motor & Gross Motor</label>
                              <p>{gt.fine_gross_motor}</p>
                            </DetailField>
                          )}
                        </>
                      )
                    })()}
                  </DetailGrid>
                </Section>
              )}

              {(() => {
                const bo = parseJSON(selectedRecord.behavioral_observation);
                if (!bo) return null;
                if (typeof bo === "string") {
                  return (
                    <Section>
                      <SectionTitle>Behavioral Observation & Assessments</SectionTitle>
                      <DetailField className="full-width">
                        <p>{bo}</p>
                      </DetailField>
                    </Section>
                  );
                }
                if (typeof bo === "object" && !Array.isArray(bo) && "notes" in bo) {
                  return (
                    <Section>
                      <SectionTitle>Behavioral Observation & Assessments</SectionTitle>
                      <DetailField className="full-width">
                        <p>{bo.notes}</p>
                      </DetailField>
                    </Section>
                  );
                }
                if (Array.isArray(bo) && bo.length > 0 && bo.some(item => item.key || item.value)) {
                  return (
                    <Section>
                      <SectionTitle>Behavioral Observation & Assessments</SectionTitle>
                      <DetailGrid>
                        {bo.filter(item => item && (item.key || item.value)).map((item, idx) => (
                          <DetailField key={idx}>
                            <label>{item.key || "Assessment"}</label>
                            <p>{item.value || "—"}</p>
                          </DetailField>
                        ))}
                      </DetailGrid>
                    </Section>
                  );
                }
                return null;
              })()}

              {(() => {
                const ta = parseJSON(selectedRecord.assessments_used)?.test_administration;
                if (!ta) return null;
                if (typeof ta === "string") {
                  return (
                    <Section>
                      <SectionTitle>Test Administration</SectionTitle>
                      <DetailField className="full-width">
                        <p>{ta}</p>
                      </DetailField>
                    </Section>
                  );
                }
                if (Array.isArray(ta) && ta.length > 0 && ta.some(item => item.key || item.value)) {
                  return (
                    <Section>
                      <SectionTitle>Test Administration</SectionTitle>
                      <DetailGrid>
                        {ta.filter(item => item && (item.key || item.value)).map((item, idx) => (
                          <DetailField key={idx}>
                            <label>{item.key || "Assessment Name"}</label>
                            <p>{item.value || "—"}</p>
                          </DetailField>
                        ))}
                      </DetailGrid>
                    </Section>
                  );
                }
                return null;
              })()}

              {(() => {
                const au = parseJSON(selectedRecord.assessments_used) || {};
                const ti = au.test_interpretation;
                if (!ti) return null;
                const hasValue = typeof ti === "string" ? !!ti : Object.values(ti).some(Boolean);
                if (!hasValue) return null;

                return (
                  <Section>
                    <SectionTitle>Test Interpretation</SectionTitle>
                    <DetailField className="full-width">
                      {typeof ti === "string" ? (
                        <p>{ti}</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {Object.entries(ti).map(([assessmentName, val]) => val && (
                            <div key={assessmentName} style={{ background: "#f8fafc", padding: "10px", borderRadius: "4px", borderLeft: "3px solid #406147" }}>
                              <strong style={{ color: "#406147", fontSize: "0.9rem" }}>{assessmentName}</strong>
                              <p style={{ marginTop: "4px", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{val}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </DetailField>
                  </Section>
                );
              })()}

              {parseJSON(selectedRecord.assessments_used)?.summary && (
                <Section>
                  <SectionTitle>Summary</SectionTitle>
                  <DetailField className="full-width">
                    <p>{parseJSON(selectedRecord.assessments_used).summary}</p>
                  </DetailField>
                </Section>
              )}

              {selectedRecord.impression && (
                <Section>
                  <SectionTitle>Clinical Impression</SectionTitle>
                  <DetailField className="full-width">
                    <p style={{
                      backgroundColor: "#fff3cd",
                      border: "2px solid #ff9800",
                      borderRadius: THEME.borderRadius.medium,
                      padding: "16px"
                    }}>
                      {selectedRecord.impression}
                    </p>
                  </DetailField>
                </Section>
              )}

              {(selectedRecord.recommendation || selectedRecord.recommendations) && (
                <Section>
                  <SectionTitle>Recommendations</SectionTitle>
                  <DetailField className="full-width">
                    <p style={{
                      backgroundColor: "#d4edda",
                      border: "2px solid #28a745",
                      borderRadius: THEME.borderRadius.medium,
                      padding: "16px"
                    }}>
                      {selectedRecord.recommendation || selectedRecord.recommendations}
                    </p>
                  </DetailField>
                </Section>
              )}

              {selectedRecord.notes && (
                <Section>
                  <SectionTitle>Additional Notes</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.notes}</p>
                  </DetailField>
                </Section>
              )}
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