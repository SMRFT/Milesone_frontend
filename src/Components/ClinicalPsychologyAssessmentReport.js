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

export default function ClinicalPsychologyReport() {
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

  const handlePrint = (record) => {
    const behaviourProblems = parseJSON(record.behaviour_problems) || []
    const temperament = parseJSON(record.general_temperament) || {}
    const observation = parseJSON(record.behavioral_observation) || {}
    const assessments = parseJSON(record.assessments_used) || {}

    const printWindow = window.open("", "_blank")
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clinical Psychology Assessment - ${record.patientName}</title>
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
            <h1>Clinical Psychology Assessment Report</h1>
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

          ${behaviourProblems.length > 0 ? `
          <div class="section">
            <div class="section-title">Behaviour Problems</div>
            <div class="section-content">
              <ul class="list-items">
                ${behaviourProblems.map(problem => `<li>${problem}</li>`).join('')}
              </ul>
            </div>
          </div>
          ` : ''}

          ${Object.keys(temperament).length > 0 ? `
          <div class="section">
            <div class="section-title">General Temperament</div>
            <div class="section-content">
              <div class="detail-grid">
                ${Object.entries(temperament).map(([key, value]) => `
                  <div class="detail-item">
                    <label>${key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <p>${value || "N/A"}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          ${Object.keys(observation).length > 0 ? `
          <div class="section">
            <div class="section-title">Behavioral Observation</div>
            <div class="section-content">
              <div class="detail-grid">
                ${Object.entries(observation).map(([key, value]) => `
                  <div class="detail-item">
                    <label>${key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <p>${value || "N/A"}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          ${Object.keys(assessments).length > 0 ? `
          <div class="section">
            <div class="section-title">Assessments Used</div>
            <div class="section-content">
              <div class="detail-grid">
                ${assessments.dst ? `
                  <div class="detail-item">
                    <label>DST (Developmental Screening Test)</label>
                    <p>DA: ${assessments.dst.da || "N/A"}, DQ: ${assessments.dst.dq || "N/A"}</p>
                  </div>
                ` : ''}
                ${assessments.vsms ? `
                  <div class="detail-item">
                    <label>VSMS (Vineland Social Maturity Scale)</label>
                    <p>SA: ${assessments.vsms.sa || "N/A"}, SQ: ${assessments.vsms.sq || "N/A"}</p>
                  </div>
                ` : ''}
                ${assessments.sfbt ? `
                  <div class="detail-item">
                    <label>SFBT (Seguin Form Board Test)</label>
                    <p>MA: ${assessments.sfbt.ma || "N/A"}, IQ: ${assessments.sfbt.iq || "N/A"}</p>
                  </div>
                ` : ''}
                ${assessments.adhd ? `
                  <div class="detail-item">
                    <label>ADHD Assessment</label>
                    <p>${assessments.adhd}</p>
                  </div>
                ` : ''}
                ${assessments.isaa ? `
                  <div class="detail-item">
                    <label>ISAA (Indian Scale for Assessment of Autism)</label>
                    <p>${assessments.isaa}</p>
                  </div>
                ` : ''}
                ${assessments.otherAssessments ? `
                  <div class="detail-item" style="grid-column: 1 / -1;">
                    <label>Other Assessments</label>
                    <p>${assessments.otherAssessments}</p>
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
            <p>© Clinical Psychology Assessment System</p>
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

              {parseJSON(selectedRecord.behaviour_problems)?.length > 0 && (
                <Section>
                  <SectionTitle>Behaviour Problems</SectionTitle>
                  <ListItems>
                    {parseJSON(selectedRecord.behaviour_problems).map((problem, idx) => (
                      <li key={idx}>{problem}</li>
                    ))}
                  </ListItems>
                </Section>
              )}

              {parseJSON(selectedRecord.general_temperament) && (
                <Section>
                  <SectionTitle>General Temperament</SectionTitle>
                  <DetailGrid>
                    {Object.entries(parseJSON(selectedRecord.general_temperament)).map(([key, value]) => (
                      <DetailField key={key}>
                        <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <p>{value || "N/A"}</p>
                      </DetailField>
                    ))}
                  </DetailGrid>
                </Section>
              )}

              {parseJSON(selectedRecord.behavioral_observation) && (
                <Section>
                  <SectionTitle>Behavioral Observation</SectionTitle>
                  <DetailGrid>
                    {Object.entries(parseJSON(selectedRecord.behavioral_observation)).map(([key, value]) => (
                      <DetailField key={key}>
                        <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <p>{value || "N/A"}</p>
                      </DetailField>
                    ))}
                  </DetailGrid>
                </Section>
              )}

              {parseJSON(selectedRecord.assessments_used) && (
                <Section>
                  <SectionTitle>Assessments Used</SectionTitle>
                  <DetailGrid>
                    {(() => {
                      const assessments = parseJSON(selectedRecord.assessments_used)
                      return (
                        <>
                          {assessments.dst && (
                            <DetailField>
                              <label>DST (Developmental Screening Test)</label>
                              <p>DA: {assessments.dst.da || "N/A"}, DQ: {assessments.dst.dq || "N/A"}</p>
                            </DetailField>
                          )}
                          {assessments.vsms && (
                            <DetailField>
                              <label>VSMS (Vineland Social Maturity Scale)</label>
                              <p>SA: {assessments.vsms.sa || "N/A"}, SQ: {assessments.vsms.sq || "N/A"}</p>
                            </DetailField>
                          )}
                          {assessments.sfbt && (
                            <DetailField>
                              <label>SFBT (Seguin Form Board Test)</label>
                              <p>MA: {assessments.sfbt.ma || "N/A"}, IQ: {assessments.sfbt.iq || "N/A"}</p>
                            </DetailField>
                          )}
                          {assessments.adhd && (
                            <DetailField>
                              <label>ADHD Assessment</label>
                              <p>{assessments.adhd}</p>
                            </DetailField>
                          )}
                          {assessments.isaa && (
                            <DetailField>
                              <label>ISAA (Indian Scale for Assessment of Autism)</label>
                              <p>{assessments.isaa}</p>
                            </DetailField>
                          )}
                          {assessments.otherAssessments && (
                            <DetailField className="full-width">
                              <label>Other Assessments</label>
                              <p>{assessments.otherAssessments}</p>
                            </DetailField>
                          )}
                        </>
                      )
                    })()}
                  </DetailGrid>
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