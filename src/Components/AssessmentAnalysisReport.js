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

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
`

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: ${props => props.checked ? '#e8f5e9' : THEME.colors.background};
  border-radius: ${THEME.borderRadius.medium};
  border: 2px solid ${props => props.checked ? THEME.colors.success : THEME.colors.border};
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    color: ${THEME.colors.text};
    margin: 0;
    cursor: pointer;
  }
`

const TherapyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  
  th, td {
    padding: 10px;
    text-align: center;
    border: 1px solid ${THEME.colors.border};
    font-size: 0.875rem;
  }
  
  th {
    background-color: ${THEME.colors.primary};
    color: white;
    font-weight: 600;
  }
  
  td {
    background-color: ${THEME.colors.surface};
  }
  
  .checked {
    background-color: #e8f5e9;
    font-weight: 600;
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

export default function AssessmentAnalysisReport() {
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
    navigate("/AssessmentAnalysis", { state: { editRecord: record } })
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

  // Helper function to check if a value has data
  const hasValue = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return true
    if (typeof value === 'object') return Object.keys(value).length > 0
    return false
  }

const fetchReportData = async (start, end) => {
  setLoading(true)
  setError("")

  try {
    const url = `${Milestonebaseurl}assessment-analysis/?from_date=${start}&to_date=${end}`

    const result = await apiRequest(url, "GET")

    if (!result?.success) {
      throw new Error(result?.error || "Failed to fetch data")
    }

    setData(Array.isArray(result.data) ? result.data : [])
  } catch (err) {
    console.error(err)
    setError("Failed to load report data. Please try again.")
    setData([])
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchReportData(fromDate, toDate)
  }, [])

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
    const preferredLanguage = parseJSON(record.preferred_language) || {}
    const mappingTherapy = parseJSON(record.mapping_therapy) || {}
    const sessionNumbers = parseJSON(record.session_numbers) || {}
    const therapyMethods = parseJSON(record.therapy_methods) || {}
    const assessmentDateStr = record.date ? new Date(record.date).toLocaleDateString() : "N/A";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Assessment Analysis Report - ${record.patient_name || "Patient"}</title>
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
          
          <div class="report-title">Assessment Analysis Report</div>
          
          <table class="demographics-table">
            <tbody>
              <tr>
                <td><strong>Name:</strong> ${record.patient_name || "N/A"}</td>
                <td><strong>Age:</strong> ${record.age || "—"}</td>
                <td><strong>Sex:</strong> ${record.sex || "—"}</td>
              </tr>
              <tr>
                <td><strong>Reg. No.:</strong> ${record.registration_number || "—"}</td>
                <td><strong>Billing No:</strong> ${record.billing_no || "—"}</td>
                <td><strong>Date:</strong> ${assessmentDateStr}</td>
              </tr>
            </tbody>
          </table>

          ${record.provisional_diagnosis ? `
            <div class="section-header">Provisional/Clinical Diagnosis</div>
            <div class="summary-box">${record.provisional_diagnosis}</div>
          ` : ""}

          ${(() => {
            const cards = Object.entries(preferredLanguage).map(([lang, checked]) => ({
              label: lang.toUpperCase(),
              value: checked ? "YES" : "NO"
            }));
            if (cards.length === 0) return "";
            return `
              <div class="section-header">Preferred Language</div>
              <div class="info-grid">
                ${cards.map(c => `
                  <div class="info-card">
                    <div class="info-card-label">${c.label}</div>
                    <div class="info-card-value">${c.value}</div>
                  </div>
                `).join("")}
              </div>
            `;
          })()}

          ${record.home_modification ? `
            <div class="section-header">Home Modification</div>
            <div class="summary-box">${record.home_modification}</div>
          ` : ""}

          ${record.parenting_modifications ? `
            <div class="section-header">Parenting Modifications</div>
            <div class="summary-box">${record.parenting_modifications}</div>
          ` : ""}

          ${mappingTherapy && Object.keys(mappingTherapy).length > 0 ? `
            <div class="section-header">Therapy Mapping</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Speech</th>
                  <th>OT</th>
                  <th>PT</th>
                  <th>EI</th>
                  <th>Group Therapy</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(mappingTherapy).map(([dept, therapies]) => `
                  <tr>
                    <td><strong>${dept}</strong></td>
                    <td>${therapies.SPEECH ? "✓" : "—"}</td>
                    <td>${therapies.OT ? "✓" : "—"}</td>
                    <td>${therapies.PT ? "✓" : "—"}</td>
                    <td>${therapies.EI ? "✓" : "—"}</td>
                    <td>${therapies.GROUP_T ? "✓" : "—"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}

          ${(() => {
            const cards = Object.entries(sessionNumbers)
              .filter(([_, val]) => val)
              .map(([therapy, count]) => ({
                label: therapy.toUpperCase(),
                value: `${count} Sessions`
              }));
            if (cards.length === 0) return "";
            return `
              <div class="section-header">Session Numbers</div>
              <div class="info-grid">
                ${cards.map(c => `
                  <div class="info-card">
                    <div class="info-card-label">${c.label}</div>
                    <div class="info-card-value">${c.value}</div>
                  </div>
                `).join("")}
              </div>
            `;
          })()}

          ${(() => {
            const cards = Object.entries(therapyMethods)
              .filter(([_, checked]) => checked)
              .map(([method]) => ({
                label: method.replace(/_/g, ' ').toUpperCase(),
                value: "RECOMMENDED"
              }));
            if (cards.length === 0) return "";
            return `
              <div class="section-header">Therapy Methods</div>
              <div class="info-grid">
                ${cards.map(c => `
                  <div class="info-card">
                    <div class="info-card-label">${c.label}</div>
                    <div class="info-card-value">${c.value}</div>
                  </div>
                `).join("")}
              </div>
            `;
          })()}

          ${record.impression || record.diagnosis ? `
            <div class="section-header">Impression</div>
            <div class="summary-box">
              ${record.impression || record.diagnosis}
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
            <div class="sig-column" style="text-align: right;">
              ${record.created_by_signature ? `<img src="${record.created_by_signature}" style="max-height: 40px; margin-bottom: 5px;" alt="Signature" /><br/>` : '<div class="sig-line"></div>'}
              <div class="sig-name">${record.created_by_name || "Ms. Sivashankari"}</div>
              <div class="sig-details">${record.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS"}</div>
              <div class="sig-details">${record.created_by_designation || "Clinical Director / Psychologist"}</div>
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
    const preferredLanguage = parseJSON(record.preferred_language) || {}
    const mappingTherapy = parseJSON(record.mapping_therapy) || {}
    const sessionNumbers = parseJSON(record.session_numbers) || {}
    const therapyMethods = parseJSON(record.therapy_methods) || {}

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
      pdf.text(`Patient: ${record.patient_name || "N/A"} | Reg: ${record.registration_number || "N/A"}`, pageWidth / 2, footerY, { align: "center" });
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
      pdf.text("ASSESSMENT ANALYSIS REPORT", pageWidth / 2, y, { align: "center" });

      const titleWidth = pdf.getTextWidth("ASSESSMENT ANALYSIS REPORT");
      pdf.setDrawColor(...textDark);
      pdf.setLineWidth(0.8);
      pdf.line(pageWidth / 2 - titleWidth / 2, y + 1.5, pageWidth / 2 + titleWidth / 2, y + 1.5);
      y += 8;

      // Patient Info Table Grid
      const dateStr = record.date ? new Date(record.date).toLocaleDateString() : "N/A";
      const patientDetails = [
        [`Name: ${record.patient_name || "N/A"}`, `Age: ${record.age || "—"}`, `Sex: ${record.sex || "—"}`],
        [`Reg. No.: ${record.registration_number || "—"}`, `Billing No: ${record.billing_no || "—"}`, `Date: ${dateStr}`]
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

    const addTextBlock = (text) => {
      checkPageBreak(15);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      const lines = pdf.splitTextToSize(text || "None recorded", contentWidth);
      pdf.text(lines, margin, y);
      y += lines.length * 4.5 + 4;
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

    const addBulletPoint = (text) => {
      checkPageBreak(8);
      pdf.setFillColor(...primary);
      pdf.triangle(margin, y - 2.5, margin + 2.5, y - 1.25, margin, y, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...textDark);
      const lines = pdf.splitTextToSize(text, contentWidth - 6);
      pdf.text(lines, margin + 5, y);
      y += lines.length * 4.5 + 1.5;
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
      pdf.text(record.created_by_designation || "Clinical Director / Psychologist", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Milestones Developmental Center", margin, y);
      pdf.text("Milestones Developmental Center", pageWidth - margin - 60, y);
      y += 10;
    };

    addPageHeader();
    addDocumentTitle();

    // Provisional Diagnosis
    if (record.provisional_diagnosis) {
      addSectionHeader("Provisional/Clinical Diagnosis");
      addSummaryBox(record.provisional_diagnosis);
    }

    // Preferred Language
    if (preferredLanguage && Object.keys(preferredLanguage).length > 0) {
      addSectionHeader("Preferred Language");
      const cards = Object.entries(preferredLanguage).map(([lang, checked]) => ({
        label: lang.toUpperCase(),
        value: checked ? "YES" : "NO"
      }));
      addTwoColumnCards(cards);
    }

    // Home Modification
    if (record.home_modification) {
      addSectionHeader("Home Modification");
      addTextBlock(record.home_modification);
    }

    // Parenting Modifications
    if (record.parenting_modifications) {
      addSectionHeader("Parenting Modifications");
      addTextBlock(record.parenting_modifications);
    }

    // Therapy Mapping
    if (mappingTherapy && Object.keys(mappingTherapy).length > 0) {
      addSectionHeader("Therapy Mapping");
      const headers = ["Department", "Speech", "OT", "PT", "EI", "Group Therapy"];
      const rows = Object.entries(mappingTherapy).map(([dept, therapies]) => [
        dept,
        therapies.SPEECH ? "✓" : "—",
        therapies.OT ? "✓" : "—",
        therapies.PT ? "✓" : "—",
        therapies.EI ? "✓" : "—",
        therapies.GROUP_T ? "✓" : "—"
      ]);
      addMilestoneTable(headers, rows);
    }

    // Session Numbers
    if (sessionNumbers && Object.keys(sessionNumbers).length > 0) {
      addSectionHeader("Session Numbers");
      const cards = Object.entries(sessionNumbers)
        .filter(([_, val]) => val)
        .map(([therapy, count]) => ({
          label: therapy.toUpperCase(),
          value: `${count} Sessions`
        }));
      addTwoColumnCards(cards);
    }

    // Therapy Methods
    if (therapyMethods && Object.keys(therapyMethods).length > 0) {
      addSectionHeader("Therapy Methods");
      const cards = Object.entries(therapyMethods)
        .filter(([_, checked]) => checked)
        .map(([method]) => ({
          label: method.replace(/_/g, ' ').toUpperCase(),
          value: "RECOMMENDED"
        }));
      addTwoColumnCards(cards);
    }

    // Impression inline
    if (record.impression || record.diagnosis) {
      addInlineSection("Impression", record.impression || record.diagnosis);
      y += 2;
    }

    // Recommendations
    if (record.recommendations) {
      addSectionHeader("Recommendations");
      const recs = String(record.recommendations).split(/[,\n]/).map(r => r.trim()).filter(Boolean);
      recs.forEach(rec => addBulletPoint(rec));
      y += 2;
    }

    // Additional Notes
    if (record.notes) {
      addInlineSection("Additional Notes", record.notes);
    }

    addSignatureBlock();
    addPageFooter();
    pdf.save(`${record.patient_name || "Patient"}_Assessment_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Assessment Analysis Report</PageTitle>
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
              <th>Billing Number</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{hasValue(item.registration_number) ? item.registration_number : "-"}</td>
                <td>{hasValue(item.patient_name) ? item.patient_name : "-"}</td>
                <td>{hasValue(item.billing_no) ? item.billing_no : "-"}</td>
                <td>{hasValue(item.date) ? new Date(item.date).toLocaleDateString() : "-"}</td>
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
              <h2>Analysis Details - {hasValue(selectedRecord.patient_name) ? selectedRecord.patient_name : 'Patient'}</h2>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalBody id="printable-report-content">
              <Section>
                <SectionTitle>Patient Information</SectionTitle>
                <DetailGrid>
                  <DetailField>
                    <label>Registration Number</label>
                    <p>{selectedRecord.registration_number || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Patient Name</label>
                    <p>{selectedRecord.patient_name || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Age</label>
                    <p>{selectedRecord.age || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Sex</label>
                    <p>{selectedRecord.sex || "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Date</label>
                    <p>{selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString() : "N/A"}</p>
                  </DetailField>
                  <DetailField>
                    <label>Billing Number</label>
                    <p>{selectedRecord.billing_no || "N/A"}</p>
                  </DetailField>
                </DetailGrid>
              </Section>

              {hasValue(selectedRecord.provisional_diagnosis) && (
                <Section>
                  <SectionTitle>Provisional/Clinical Diagnosis</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.provisional_diagnosis}</p>
                  </DetailField>
                </Section>
              )}

              {(() => {
                const preferredLanguage = parseJSON(selectedRecord.preferred_language)
                const filteredLanguages = preferredLanguage ? Object.entries(preferredLanguage).filter(([_, checked]) => checked) : []
                return filteredLanguages.length > 0 && (
                  <Section>
                    <SectionTitle>Preferred Language</SectionTitle>
                    <CheckboxGrid>
                      {filteredLanguages.map(([lang, checked]) => (
                        <CheckboxItem key={lang} checked={checked}>
                          <input type="checkbox" checked={checked} readOnly disabled />
                          <label>{lang.charAt(0).toUpperCase() + lang.slice(1)}</label>
                        </CheckboxItem>
                      ))}
                    </CheckboxGrid>
                  </Section>
                )
              })()}

              {hasValue(selectedRecord.home_modification) && (
                <Section>
                  <SectionTitle>Home Modification</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.home_modification}</p>
                  </DetailField>
                </Section>
              )}

              {hasValue(selectedRecord.parenting_modifications) && (
                <Section>
                  <SectionTitle>Parenting Modifications</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.parenting_modifications}</p>
                  </DetailField>
                </Section>
              )}

              {(() => {
                const mappingTherapy = parseJSON(selectedRecord.mapping_therapy)
                const filteredTherapy = mappingTherapy ? Object.entries(mappingTherapy).filter(([_, therapies]) => 
                  Object.values(therapies).some(val => val)
                ) : []
                return filteredTherapy.length > 0 && (
                  <Section>
                    <SectionTitle>Therapy Mapping</SectionTitle>
                    <TherapyTable>
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Speech</th>
                          <th>OT</th>
                          <th>PT</th>
                          <th>EI</th>
                          <th>Group Therapy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTherapy.map(([dept, therapies]) => (
                          <tr key={dept}>
                            <td><strong>{dept}</strong></td>
                            <td className={therapies.SPEECH ? 'checked' : ''}>{therapies.SPEECH ? '✓' : '—'}</td>
                            <td className={therapies.OT ? 'checked' : ''}>{therapies.OT ? '✓' : '—'}</td>
                            <td className={therapies.PT ? 'checked' : ''}>{therapies.PT ? '✓' : '—'}</td>
                            <td className={therapies.EI ? 'checked' : ''}>{therapies.EI ? '✓' : '—'}</td>
                            <td className={therapies.GROUP_T ? 'checked' : ''}>{therapies.GROUP_T ? '✓' : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </TherapyTable>
                  </Section>
                )
              })()}

              {(() => {
                const sessionNumbers = parseJSON(selectedRecord.session_numbers)
                const filteredSessions = sessionNumbers ? Object.entries(sessionNumbers).filter(([_, val]) => hasValue(val)) : []
                return filteredSessions.length > 0 && (
                  <Section>
                    <SectionTitle>Session Numbers</SectionTitle>
                    <DetailGrid>
                      {filteredSessions.map(([therapy, count]) => (
                        <DetailField key={therapy}>
                          <label>{therapy}</label>
                          <p>{count} Sessions</p>
                        </DetailField>
                      ))}
                    </DetailGrid>
                  </Section>
                )
              })()}

              {(() => {
                const therapyMethods = parseJSON(selectedRecord.therapy_methods)
                const filteredMethods = therapyMethods ? Object.entries(therapyMethods).filter(([_, checked]) => checked) : []
                return filteredMethods.length > 0 && (
                  <Section>
                    <SectionTitle>Therapy Methods</SectionTitle>
                    <CheckboxGrid>
                      {filteredMethods.map(([method]) => (
                        <CheckboxItem key={method} checked={true}>
                          <input type="checkbox" checked readOnly disabled />
                          <label>{method.replace(/_/g, ' ')}</label>
                        </CheckboxItem>
                      ))}
                    </CheckboxGrid>
                  </Section>
                )
              })()}
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