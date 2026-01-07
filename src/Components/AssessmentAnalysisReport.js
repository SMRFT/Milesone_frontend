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

  const handlePrint = (record) => {
    const preferredLanguage = parseJSON(record.preferred_language) || {}
    const mappingTherapy = parseJSON(record.mapping_therapy) || {}
    const sessionNumbers = parseJSON(record.session_numbers) || {}
    const therapyMethods = parseJSON(record.therapy_methods) || {}

    const printWindow = window.open("", "_blank")
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assessment Analysis - ${record.patient_name}</title>
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
            
            .checkbox-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              margin-top: 8px;
            }
            
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 6px 8px;
              background-color: white;
              border-radius: 4px;
              border: 1px solid #dee2e6;
              font-size: 10px;
            }
            
            .checkbox-item.checked {
              background-color: #e8f5e9;
              border-color: #4caf50;
              font-weight: 600;
            }
            
            .therapy-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            
            .therapy-table th,
            .therapy-table td {
              padding: 8px;
              border: 1px solid #dee2e6;
              text-align: center;
              font-size: 9px;
            }
            
            .therapy-table th {
              background-color: #406147;
              color: white;
              font-weight: 600;
            }
            
            .therapy-table td.checked {
              background-color: #e8f5e9;
              font-weight: 600;
            }
            
            .detail-field {
              background-color: white;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 8px;
              border-left: 3px solid #4895ef;
            }
            
            .detail-field label {
              font-size: 9px;
              font-weight: 600;
              color: #6c757d;
              text-transform: uppercase;
              display: block;
              margin-bottom: 4px;
            }
            
            .detail-field p {
              font-size: 10px;
              color: #212529;
              line-height: 1.5;
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
            <h1>Assessment Analysis Report</h1>
            <p>Comprehensive Therapy Planning & Analysis Document</p>
          </div>
          
          <div class="patient-info">
            <div class="info-grid">
              <div class="info-field">
                <label>Registration Number</label>
                <p>${record.registration_number || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Patient Name</label>
                <p>${record.patient_name || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Age</label>
                <p>${record.age || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Sex</label>
                <p>${record.sex || "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Date</label>
                <p>${record.date ? new Date(record.date).toLocaleDateString() : "N/A"}</p>
              </div>
              <div class="info-field">
                <label>Billing Number</label>
                <p>${record.billing_no || "N/A"}</p>
              </div>
            </div>
          </div>

          ${record.provisional_diagnosis ? `
          <div class="section">
            <div class="section-title">Provisional/Clinical Diagnosis</div>
            <div class="detail-field">
              <p>${record.provisional_diagnosis}</p>
            </div>
          </div>
          ` : ''}

          ${Object.keys(preferredLanguage).length > 0 ? `
          <div class="section">
            <div class="section-title">Preferred Language</div>
            <div class="section-content">
              <div class="checkbox-grid">
                ${Object.entries(preferredLanguage).map(([lang, checked]) => `
                  <div class="checkbox-item ${checked ? 'checked' : ''}">
                    <span>${checked ? '☑' : '☐'}</span>
                    <span>${lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          ${record.home_modification ? `
          <div class="section">
            <div class="section-title">Home Modification</div>
            <div class="detail-field">
              <p>${record.home_modification}</p>
            </div>
          </div>
          ` : ''}

          ${record.parenting_modifications ? `
          <div class="section">
            <div class="section-title">Parenting Modifications</div>
            <div class="detail-field">
              <p>${record.parenting_modifications}</p>
            </div>
          </div>
          ` : ''}

          ${Object.keys(mappingTherapy).length > 0 ? `
          <div class="section">
            <div class="section-title">Therapy Mapping</div>
            <div class="section-content">
              <table class="therapy-table">
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
                      <td class="${therapies.SPEECH ? 'checked' : ''}">${therapies.SPEECH ? '✓' : '—'}</td>
                      <td class="${therapies.OT ? 'checked' : ''}">${therapies.OT ? '✓' : '—'}</td>
                      <td class="${therapies.PT ? 'checked' : ''}">${therapies.PT ? '✓' : '—'}</td>
                      <td class="${therapies.EI ? 'checked' : ''}">${therapies.EI ? '✓' : '—'}</td>
                      <td class="${therapies.GROUP_T ? 'checked' : ''}">${therapies.GROUP_T ? '✓' : '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}

          ${Object.keys(sessionNumbers).length > 0 ? `
          <div class="section">
            <div class="section-title">Session Numbers</div>
            <div class="section-content">
              <div class="checkbox-grid">
                ${Object.entries(sessionNumbers).filter(([_, val]) => val).map(([therapy, count]) => `
                  <div class="detail-field">
                    <label>${therapy}</label>
                    <p>${count} Sessions</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          ${Object.keys(therapyMethods).length > 0 ? `
          <div class="section">
            <div class="section-title">Therapy Methods</div>
            <div class="section-content">
              <div class="checkbox-grid">
                ${Object.entries(therapyMethods).filter(([_, checked]) => checked).map(([method]) => `
                  <div class="checkbox-item checked">
                    <span>☑</span>
                    <span>${method.replace(/_/g, ' ')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()}</p>
            <p>© Assessment Analysis System</p>
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
                <td>{item.registration_number || "-"}</td>
                <td>{item.patient_name || "-"}</td>
                <td>{item.billing_no || "-"}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
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
              <h2>Analysis Details - {selectedRecord.patient_name}</h2>
              <CloseButton onClick={() => setShowModal(false)}>
                X
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
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

              {selectedRecord.provisional_diagnosis && (
                <Section>
                  <SectionTitle>Provisional/Clinical Diagnosis</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.provisional_diagnosis}</p>
                  </DetailField>
                </Section>
              )}

              {parseJSON(selectedRecord.preferred_language) && (
                <Section>
                  <SectionTitle>Preferred Language</SectionTitle>
                  <CheckboxGrid>
                    {Object.entries(parseJSON(selectedRecord.preferred_language)).map(([lang, checked]) => (
                      <CheckboxItem key={lang} checked={checked}>
                        <input type="checkbox" checked={checked} readOnly disabled />
                        <label>{lang.charAt(0).toUpperCase() + lang.slice(1)}</label>
                      </CheckboxItem>
                    ))}
                  </CheckboxGrid>
                </Section>
              )}

              {selectedRecord.home_modification && (
                <Section>
                  <SectionTitle>Home Modification</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.home_modification}</p>
                  </DetailField>
                </Section>
              )}

              {selectedRecord.parenting_modifications && (
                <Section>
                  <SectionTitle>Parenting Modifications</SectionTitle>
                  <DetailField className="full-width">
                    <p>{selectedRecord.parenting_modifications}</p>
                  </DetailField>
                </Section>
              )}

              {parseJSON(selectedRecord.mapping_therapy) && Object.keys(parseJSON(selectedRecord.mapping_therapy)).length > 0 && (
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
                      {Object.entries(parseJSON(selectedRecord.mapping_therapy)).map(([dept, therapies]) => (
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
              )}

              {parseJSON(selectedRecord.session_numbers) && Object.keys(parseJSON(selectedRecord.session_numbers)).length > 0 && (
                <Section>
                  <SectionTitle>Session Numbers</SectionTitle>
                  <DetailGrid>
                    {Object.entries(parseJSON(selectedRecord.session_numbers))
                      .filter(([_, val]) => val)
                      .map(([therapy, count]) => (
                        <DetailField key={therapy}>
                          <label>{therapy}</label>
                          <p>{count} Sessions</p>
                        </DetailField>
                      ))}
                  </DetailGrid>
                </Section>
              )}

              {parseJSON(selectedRecord.therapy_methods) && Object.keys(parseJSON(selectedRecord.therapy_methods)).length > 0 && (
                <Section>
                  <SectionTitle>Therapy Methods</SectionTitle>
                  <CheckboxGrid>
                    {Object.entries(parseJSON(selectedRecord.therapy_methods))
                      .filter(([_, checked]) => checked)
                      .map(([method]) => (
                        <CheckboxItem key={method} checked={true}>
                          <input type="checkbox" checked readOnly disabled />
                          <label>{method.replace(/_/g, ' ')}</label>
                        </CheckboxItem>
                      ))}
                  </CheckboxGrid>
                </Section>
              )}
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