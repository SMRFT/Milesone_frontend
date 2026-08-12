import React, { useEffect, useState } from "react";
import apiRequest from "./apiRequest";
import { jsPDF } from "jspdf";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { normalizePatient } from "./parseUtils";
import autoTable from 'jspdf-autotable';
import mdcLogo from "./Images/mdcLogo.png";
import { Printer, Download } from "lucide-react";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- THEME ---
const theme = {
  colors: {
    primary: "#406147",
    primaryLight: "#6b8a72",
    primaryDark: "#2d4532",
    secondary: "#3f37c9",
    background: "#f4f7f6", // Softer gray background
    surface: "#ffffff",
    text: "#2c3e50",
    textLight: "#7f8c8d",
    borderLight: "#e2e8f0",
    success: "#27ae60",
    successBg: "#e8f8f5",
    error: "#e74c3c",
    errorBg: "#fdedec",
    cardBg: "#ffffff",
  },
  shadows: {
    soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
    hover: "0 10px 25px rgba(0, 0, 0, 0.08)",
    card: "0 2px 8px rgba(0,0,0,0.04)",
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
  },
  font: "'Inter', 'Segoe UI', sans-serif",
  breakpoints: {
    mobile: "768px",
  },
};

// --- STYLED COMPONENTS ---

const Container = styled.div`
  padding: 1rem;
  background: ${p => p.theme.colors.background};
  min-height: 100vh;
  font-family: ${p => p.theme.font};
  color: ${p => p.theme.colors.text};
  
  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    padding: 2rem;
  }
`;

const Header = styled.h1`
  text-align: center;
  color: ${p => p.theme.colors.primaryDark};
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  
  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
`;

// Responsive Control Bar
const ControlsContainer = styled.div`
  background: ${p => p.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${p => p.theme.borderRadius.lg};
  box-shadow: ${p => p.theme.shadows.soft};
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out;

  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${p => p.theme.colors.textLight};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input {
    padding: 0.8rem;
    border-radius: ${p => p.theme.borderRadius.sm};
    border: 1px solid ${p => p.theme.colors.borderLight};
    background: #f8fafc;
    transition: all 0.2s;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: ${p => p.theme.colors.primary};
      background: #fff;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.1);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: auto;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${p => p.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.primary ? p.theme.colors.primary : "transparent"};
  color: ${p => p.primary ? "white" : p.theme.colors.textLight};
  border: ${p => p.primary ? "none" : `1px solid ${p.theme.colors.borderLight}`};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${p => p.primary ? "0 4px 12px rgba(64, 97, 71, 0.3)" : "0 2px 5px rgba(0,0,0,0.05)"};
    background: ${p => p.primary ? p.theme.colors.primaryDark : "#f1f1f1"};
    color: ${p => p.primary ? "white" : p.theme.colors.text};
  }
`;

// Responsive Table Wrapper
const TableWrapper = styled.div`
  background: white;
  border-radius: ${p => p.theme.borderRadius.lg};
  box-shadow: ${p => p.theme.shadows.soft};
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const TableScroll = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; // Ensures table doesn't squish too much on mobile

  th {
    background: #f8fafc;
    color: ${p => p.theme.colors.primaryDark};
    padding: 1.2rem;
    text-align: left;
    font-weight: 700;
    border-bottom: 2px solid ${p => p.theme.colors.borderLight};
  }
  
  td {
    padding: 1.2rem;
    color: ${p => p.theme.colors.text};
    border-bottom: 1px solid ${p => p.theme.colors.borderLight};
  }
  
  tr:last-child td { border-bottom: none; }
  tr:hover { background: #fdfdfd; }
`;

// --- REPORT VIEW STYLES ---

const ReportContainer = styled.div`
  width: 100%;
  max-width: 794px; // A4 width limit
  margin: 0 auto;
  background: white;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: ${p => p.theme.shadows.soft};
  min-height: 100vh;
  
  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    padding: 50px;
    margin: 20px auto;
    border-radius: ${p => p.theme.borderRadius.sm};
  }
`;

const ReportHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${p => p.theme.colors.borderLight};

  h1 {
    color: ${p => p.theme.colors.primary};
    font-size: 1.8rem;
    margin: 0 0 0.5rem 0;
    @media (min-width: ${p => p.theme.breakpoints.mobile}) { font-size: 2.2rem; }
  }
  
  p { margin: 0.2rem 0; color: ${p => p.theme.colors.textLight}; }
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionHeader = styled.h3`
  font-size: 1.2rem;
  color: ${p => p.theme.colors.primaryDark};
  padding: 0.8rem 1rem;
  background: rgba(64, 97, 71, 0.05); // Glass-like tint
  border-left: 4px solid ${p => p.theme.colors.primary};
  border-radius: 0 ${p => p.theme.borderRadius.md} ${p => p.theme.borderRadius.md} 0;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
`;

// Responsive Grid for Report Data
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr; // Stack on mobile
  gap: 1rem;

  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr); // 2 columns on desktop
  }
`;

const InfoCard = styled.div`
  background: #fff;
  padding: 1rem;
  border: 1px solid ${p => p.theme.colors.borderLight};
  border-radius: ${p => p.theme.borderRadius.md};
  
  strong {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: ${p => p.theme.colors.primaryLight};
    margin-bottom: 0.3rem;
    letter-spacing: 0.5px;
  }
  
  span {
    font-size: 1rem;
    font-weight: 500;
    color: ${p => p.theme.colors.text};
    word-break: break-word;
  }
`;

const TextBlock = styled.div`
  background: #fcfcfc;
  padding: 1.5rem;
  border-radius: ${p => p.theme.borderRadius.md};
  border: 1px dashed ${p => p.theme.colors.borderLight};
  line-height: 1.6;
  color: ${p => p.theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${p => p.isDelayed ? p.theme.colors.errorBg : p.theme.colors.successBg};
  color: ${p => p.isDelayed ? p.theme.colors.error : p.theme.colors.success};
`;

const StickyNav = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-bottom: 1px solid ${p => p.theme.colors.borderLight};
  display: flex;
  justify-content: space-between;
  margin: -1rem -1rem 1rem -1rem; // Negative margin to stretch full width
  
  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    position: static;
    background: transparent;
    padding: 0 0 1.5rem 0;
    margin: 0;
    border: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 1.2rem;
  color: ${p => p.theme.colors.textLight};
  cursor: pointer;
  &:hover { color: ${p => p.theme.colors.error}; }
`;


const Historyrecordingsheetreport = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [searchText, setSearchText] = useState("");

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res = await apiRequest(`${process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL}GetHistoryRecordingSheet/`, "GET");
      const rawData = Array.isArray(res?.data) ? res.data : [];
      const data = rawData.map(normalizePatient);
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) { console.error("Failed to fetch patients", err); }
  };

  const filterByDate = () => {
    const filtered = patients.filter(p => {
      const assessDate = new Date(p.identification_data?.date_of_assessment);
      return assessDate >= new Date(fromDate) && assessDate <= new Date(toDate);
    });
    setFilteredPatients(filtered);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const text = value.toLowerCase();
    const filtered = patients.filter((p) => {
      const d = p.identification_data || {};
      return (
        d.name?.toLowerCase().includes(text) ||
        d.reg_no?.toLowerCase().includes(text) ||
        d.mobile_number?.toLowerCase().includes(text)
      );
    });
    setFilteredPatients(filtered);
  };

  const clearSearch = () => {
    setSearchText("");
    setFilteredPatients(patients);
  };

  const resetFilter = () => {
    setFilteredPatients(patients);
    setFromDate(today);
    setToDate(today);
  };

  const handlePrintHTML = (record) => {
    const id = record.identification_data || {};
    const demo = record.demographic_data || {};
    const hpi = record.history_of_present_illness || {};
    const fam = record.family_history || {};
    const pers = record.personal_history?.prenatal || {};
    const natal = record.natalandneanatal_history || {};
    const post = record.postnatal_history || {};
    const dev = record.developmental_history || {};
    const schol = record.scholastic_history || {};
    const play = record.play_history || {};
    const assessmentDateStr = id.date_of_assessment || "—";

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Pediatric History Record - ${id.name || "Patient"}</title>
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
          
          <div class="report-title">Pediatric History Record</div>
          
          <table class="demographics-table">
            <tbody>
              <tr>
                <td><strong>Name:</strong> ${id.name || "N/A"}</td>
                <td><strong>DOB:</strong> ${id.dob || "—"}</td>
                <td><strong>Date of Evaluation:</strong> ${assessmentDateStr}</td>
              </tr>
              <tr>
                <td><strong>Father:</strong> ${demo.father || "—"}</td>
                <td><strong>Age / Sex:</strong> ${id.age_sex || "—"}</td>
                <td><strong>Reg. No.:</strong> ${id.reg_no || "—"}</td>
              </tr>
              <tr>
                <td><strong>Mother:</strong> ${demo.mother || "—"}</td>
                <td><strong>Mobile:</strong> ${demo.mobile_number || "—"}</td>
                <td><strong>Address:</strong> ${demo.address_city || "—"}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom:20px; font-size:9.5pt; color:#334155;">
            <strong>Informant:</strong> ${[id.informant_a, id.informant_b].filter(Boolean).join(" & ") || "—"} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Reliability:</strong> ${id.information_reliability || "—"} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Adequacy:</strong> ${id.adequacy || "—"}
          </div>

          ${(() => {
            const complaints = Array.isArray(record.presenting_complaints)
              ? record.presenting_complaints
              : (record.presenting_complaints || "").split("\n").filter(Boolean);
            if (complaints.length === 0) return "";
            return `
              <div class="section-header">Presenting Complaints</div>
              <ul class="bullet-list">
                ${complaints.map(c => `<li class="bullet-item">${c}</li>`).join("")}
              </ul>
            `;
          })()}

          ${(() => {
            const onsetVal = Array.isArray(hpi.mode_of_onset) ? hpi.mode_of_onset.join(", ") : hpi.mode_of_onset || "—";
            const courseVal = Array.isArray(hpi.course_of_illness) ? hpi.course_of_illness.join(", ") : hpi.course_of_illness || "—";
            const progressVal = Array.isArray(hpi.progress) ? hpi.progress.join(", ") : hpi.progress || "—";
            if (onsetVal === "—" && courseVal === "—" && progressVal === "—") return "";
            return `
              <div class="section-header">History of Present Illness</div>
              <div class="summary-box">
                <strong>Mode of onset:</strong> ${onsetVal}<br/>
                <strong>Course:</strong> ${courseVal}<br/>
                <strong>Progress:</strong> ${progressVal}
              </div>
            `;
          })()}

          <div class="section-header">Birth History and Developmental History</div>
          <div class="summary-box">
            ${(() => {
              const consangVal = fam.consanguinity || "—";
              return `The child is born out of ${consangVal.toLowerCase().includes("non") ? "non-consanguineous" : "consanguineous"} parents.`;
            })()}<br/>
            <strong>Pre-natal:</strong> ${pers.prenatal_history || "No significant prenatal history."}<br/>
            <strong>Peri-natal:</strong> Born at ${natal.term || "full term"}. Delivery at ${natal.delivery_place || "Hospital"}. ${natal.type_of_delivery || "Normal"} delivery. Birth weight: ${natal.birth_weight || "—"}. Birth cry: ${natal.birth_cry || "—"}.<br/>
            <strong>Postnatal:</strong> ${post.other_details || "There are no complications."}
          </div>

          ${(() => {
            const table1Rows = [
              ...(dev.gross_motor || []),
              ...(dev.language || [])
            ];
            if (table1Rows.length === 0) return "";
            return `
              <div class="section-header">Gross Motor & Language Milestones</div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Development</th>
                    <th>Normal Dev.</th>
                    <th>Child Achieved</th>
                    <th>Impression</th>
                  </tr>
                </thead>
                <tbody>
                  ${table1Rows.map((item, index) => {
                    let statusStyle = "";
                    const val = String(item.impression || '').trim().toLowerCase();
                    if (val.includes('achieved') && !val.includes('not')) {
                      statusStyle = "color: #2e7d32; font-weight: bold;";
                    } else if (val.includes('delay')) {
                      statusStyle = "color: #ed6c02; font-weight: bold;";
                    } else if (val.includes('not achieved')) {
                      statusStyle = "color: #d32f2f; font-weight: bold;";
                    }
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.skill || "—"}</td>
                        <td>${item.expected || "—"}</td>
                        <td>${item.achieved || "—"}</td>
                        <td style="${statusStyle}">${item.impression || "Normal"}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            `;
          })()}

          ${(() => {
            const fineMotorData = dev.fine_motor || [];
            const socialData = dev.social || [];
            const maxLen = Math.max(fineMotorData.length, socialData.length);
            if (maxLen === 0) return "";
            const rows = [];
            for (let i = 0; i < maxLen; i++) {
              const fm = fineMotorData[i] || {};
              const soc = socialData[i] || {};
              rows.push([
                fm.skill || "—",
                fm.expected || "—",
                fm.impression || "—",
                soc.skill || "—",
                soc.expected || "—",
                soc.impression || "—"
              ]);
            }
            return `
              <div class="section-header">Fine Motor & Social Milestones</div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Fine / Gross Motor</th>
                    <th>Expected</th>
                    <th>Impression</th>
                    <th>Social</th>
                    <th>Expected</th>
                    <th>Impression</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row => {
                    const styleCell = (val) => {
                      const lower = String(val || '').trim().toLowerCase();
                      if (lower.includes('achieved') && !lower.includes('not')) return 'color: #2e7d32; font-weight: bold;';
                      if (lower.includes('delay')) return 'color: #ed6c02; font-weight: bold;';
                      if (lower.includes('not achieved')) return 'color: #d32f2f; font-weight: bold;';
                      return '';
                    };
                    return `
                      <tr>
                        <td>${row[0]}</td>
                        <td>${row[1]}</td>
                        <td style="${styleCell(row[2])}">${row[2]}</td>
                        <td>${row[3]}</td>
                        <td>${row[4]}</td>
                        <td style="${styleCell(row[5])}">${row[5]}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            `;
          })()}

          ${(() => {
            const consangVal = fam.consanguinity || "—";
            const familyTypeVal = fam.type_of_family?.join(", ") || "—";
            const familyHistoryText = `The child is born out of ${consangVal.toLowerCase().includes("non") ? "non-consanguineous" : "consanguineous"} parents. The family is a ${familyTypeVal.toLowerCase()} family. Father: ${demo.father || "—"}. Mother: ${demo.mother || "—"}. ${fam.mental_medical_history?.selected === "Yes" ? "Family history of medical/mental issues: " + fam.mental_medical_history.details : "No significant family history of intellectual disability and mental illness."}`;
            return `
              <div class="section-header">Family History</div>
              <div class="summary-box">${familyHistoryText}</div>
            `;
          })()}

          ${(() => {
            const schoolStatusVal = schol.school_status || "—";
            const schoolHistoryText = schoolStatusVal.toLowerCase().includes("not") || schoolStatusVal.toLowerCase().includes("no") 
              ? `The child has not yet started school${schol.not_started_reason ? ` (${schol.not_started_reason})` : ""}.`
              : `The child attends ${schol.type_of_school || "school"} entered at age ${schol.age_of_entry || "—"}. Present class: ${schol.present_class || "—"}. Performance: ${schol.scholastic_performance || "—"}. Regularity: ${schol.regularity?.selected || "—"}.`;
            return `
              <div class="section-header">School History</div>
              <div class="summary-box">${schoolHistoryText}</div>
            `;
          })()}

          <div class="section-header">Play History</div>
          <div class="summary-box">
            <strong>Play Behaviour:</strong> ${play.play_behaviour || "—"}<br/>
            <strong>Play Preferences:</strong> ${play.play_preferences || "—"}<br/>
            <strong>Rule Knowledge:</strong> ${play.rule_knowledge || "—"}<br/>
            <strong>Group Behaviour:</strong> ${play.group_behaviour || "—"}<br/>
            <strong>Leisure Time Activities:</strong> ${play.leisure_time || "—"}<br/>
            <strong>Dislikes:</strong> ${play.dislikes || "—"}<br/>
            <strong>Screen Time:</strong> ${play.screen_time || "—"}<br/>
            <strong>Sleep History:</strong> ${play.sleep_history || "—"}<br/>
            <div style="margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 8px;">
              <strong>Reinforcement:</strong><br/>
              &bull; <strong>Physical:</strong> ${play.reinforcement_physical || "—"}<br/>
              &bull; <strong>Food:</strong> ${play.reinforcement_food || "—"}<br/>
              &bull; <strong>Toys:</strong> ${play.reinforcement_toys || "—"}<br/>
              &bull; <strong>Others:</strong> ${play.reinforcement_others || play.likes || play.likes_dislikes || "—"}
            </div>
          </div>

          ${record.treatment_history ? `
            <div class="section-header">Treatment History</div>
            <div class="summary-box">${record.treatment_history}</div>
          ` : ""}

          ${record.OverAllSummary ? `
            <div class="section-header">Summary</div>
            <div class="summary-box">${record.OverAllSummary}</div>
          ` : ""}

          ${record.OverAllImpression ? `
            <div class="section-header">Impression</div>
            <div class="summary-box">${record.OverAllImpression}</div>
          ` : ""}

          ${record.Recommendation ? `
            <div class="section-header">Recommendations</div>
            <ul class="bullet-list">
              ${record.Recommendation.split(/[,\n]/).map(r => r.trim()).filter(Boolean).map(rec => `<li class="bullet-item">${rec}</li>`).join("")}
            </ul>
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

  // --- PDF GENERATION LOGIC (UNCHANGED FOR FUNCTIONALITY) ---
  const downloadPDF = async () => {
    if (!selectedPatient) return;
    const p = selectedPatient;
    const id = p.identification_data || {};
    const demo = p.demographic_data || {};
    const hpi = p.history_of_present_illness || {};
    const fam = p.family_history || {};
    const pers = p.personal_history?.prenatal || p.personal_history || {};
    const natal = p.natalandneanatal_history || {};
    const post = p.postnatal_history || {};
    const dev = p.developmental_history || {};
    const schol = p.scholastic_history || {};
    const play = p.play_history || {};
    const gen = p.general_history || {};
    
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
      pdf.text(`Patient: ${id.name || "N/A"} | Reg: ${id.reg_no || "N/A"}`, pageWidth / 2, footerY, { align: "center" });
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
      pdf.text("PSYCHOLOGICAL REPORT", pageWidth / 2, y, { align: "center" });

      const titleWidth = pdf.getTextWidth("PSYCHOLOGICAL REPORT");
      pdf.setDrawColor(...textDark);
      pdf.setLineWidth(0.8);
      pdf.line(pageWidth / 2 - titleWidth / 2, y + 1.5, pageWidth / 2 + titleWidth / 2, y + 1.5);
      y += 8;

      // Patient Info Table Grid (exactly like screenshots)
      const assessmentDateStr = id.date_of_assessment || "—";
      const patientDetails = [
        [`Name: ${id.name || "—"}`, `DOB: ${id.dob || "—"}`, `Date of Evaluation: ${assessmentDateStr}`],
        [`Father: ${demo.father || "—"}`, `Age: ${id.age_sex || "—"}`, `Reg. No.: ${id.reg_no || "—"}`],
        [`Mother: ${demo.mother || "—"}`, `Mobile: ${demo.mobile_number || "—"}`, `Address: ${demo.address_city || "—"}`]
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

    const addMilestoneTable1 = (headers, rows) => {
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
          fontStyle: "bold"
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 55 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = String(data.cell.raw || '').trim().toLowerCase();
            if (val.includes('achieved') && !val.includes('not')) {
              data.cell.styles.textColor = [46, 125, 50];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('delay')) {
              data.cell.styles.textColor = [237, 108, 2];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('not achieved')) {
              data.cell.styles.textColor = [211, 47, 47];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [120, 120, 120];
            }
          }
        },
        didDrawPage: (data) => {
          y = data.cursor.y + 8;
        }
      });
    };

    const addMilestoneTable2 = (headers, rows) => {
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
          fontStyle: "bold"
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 45 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && (data.column.index === 2 || data.column.index === 5)) {
            const val = String(data.cell.raw || '').trim().toLowerCase();
            if (val.includes('achieved') && !val.includes('not')) {
              data.cell.styles.textColor = [46, 125, 50];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('delay')) {
              data.cell.styles.textColor = [237, 108, 2];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('not achieved')) {
              data.cell.styles.textColor = [211, 47, 47];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [120, 120, 120];
            }
          }
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
      pdf.text(p.created_by_name || "Ms. Sivashankari", pageWidth - margin - 60, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...textLight);

      y += 4;
      pdf.text("Dch, DNB (paed)", margin, y);
      pdf.text(p.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Paediatrician and play therapist", margin, y);
      pdf.text(p.created_by_designation || "Clinical Director / Psychologist", pageWidth - margin - 60, y);

      y += 4;
      pdf.text("Milestones Developmental Center", margin, y);
      pdf.text("Milestones Developmental Center", pageWidth - margin - 60, y);
      y += 10;
    };

    addPageHeader();
    addDocumentTitle();

    // Informant line
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...textDark);
    
    let currentX = margin;
    pdf.text("Informant: ", currentX, y);
    currentX += pdf.getTextWidth("Informant: ");
    pdf.setFont("helvetica", "normal");
    const informantVal = [id.informant_a, id.informant_b].filter(Boolean).join(" & ") || "—";
    pdf.text(informantVal, currentX, y);
    currentX += pdf.getTextWidth(informantVal) + 12;

    pdf.setFont("helvetica", "bold");
    pdf.text("Reliability: ", currentX, y);
    currentX += pdf.getTextWidth("Reliability: ");
    pdf.setFont("helvetica", "normal");
    const reliabilityVal = id.information_reliability || "—";
    pdf.text(reliabilityVal, currentX, y);
    currentX += pdf.getTextWidth(reliabilityVal) + 12;

    pdf.setFont("helvetica", "bold");
    pdf.text("Adequacy: ", currentX, y);
    currentX += pdf.getTextWidth("Adequacy: ");
    pdf.setFont("helvetica", "normal");
    const adequacyVal = id.adequacy || "—";
    pdf.text(adequacyVal, currentX, y);
    
    y += 8;

    // Presenting Complaints
    addSectionHeader("Presenting Complaints");
    const complaints = Array.isArray(p.presenting_complaints)
      ? p.presenting_complaints
      : (p.presenting_complaints || "").split("\n").filter(Boolean);
    if (complaints.length > 0) {
      complaints.forEach(c => {
        addBulletPoint(c);
      });
    } else {
      addTextBlock("None recorded");
    }
    y += 2;

    // History of Present Illness
    addSectionHeader("History of Present Illness");
    const onsetVal = Array.isArray(hpi.mode_of_onset) ? hpi.mode_of_onset.join(", ") : hpi.mode_of_onset || "—";
    const courseVal = Array.isArray(hpi.course_of_illness) ? hpi.course_of_illness.join(", ") : hpi.course_of_illness || "—";
    const progressVal = Array.isArray(hpi.progress) ? hpi.progress.join(", ") : hpi.progress || "—";
    const hpiText = `Mode of onset: ${onsetVal}. Course: ${courseVal}. Progress: ${progressVal}.`;
    addTextBlock(hpiText);

    // Birth History and Developmental History
    addSectionHeader("Birth History and Developmental History");
    const consangVal = fam.consanguinity || "—";
    const birthLine = `The child is born out of ${consangVal.toLowerCase().includes("non") ? "non-consanguineous" : "consanguineous"} parents.`;
    addTextBlock(birthLine);
    
    // Prenatal
    checkPageBreak(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...textDark);
    pdf.text("Pre-natal: ", margin, y);
    let startX = margin + pdf.getTextWidth("Pre-natal: ");
    pdf.setFont("helvetica", "normal");
    const prenatalVal = pers.prenatal_history || "No significant prenatal history.";
    const prenatalLines = pdf.splitTextToSize(prenatalVal, contentWidth - (startX - margin));
    pdf.text(prenatalLines, startX, y);
    y += prenatalLines.length * 4.5 + 2;

    // Perinatal
    checkPageBreak(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...textDark);
    pdf.text("Peri-natal: ", margin, y);
    startX = margin + pdf.getTextWidth("Peri-natal: ");
    pdf.setFont("helvetica", "normal");
    const perinatalVal = `Born at ${natal.term || "full term"}. Delivery at ${natal.delivery_place || "Hospital"}. ${natal.type_of_delivery || "Normal"} delivery. Birth weight: ${natal.birth_weight || "—"}. Birth cry: ${natal.birth_cry || "—"}.`;
    const perinatalLines = pdf.splitTextToSize(perinatalVal, contentWidth - (startX - margin));
    pdf.text(perinatalLines, startX, y);
    y += perinatalLines.length * 4.5 + 2;

    // Postnatal
    checkPageBreak(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...textDark);
    pdf.text("Postnatal: ", margin, y);
    startX = margin + pdf.getTextWidth("Postnatal: ");
    pdf.setFont("helvetica", "normal");
    const postnatalVal = post.other_details || "There are no complications.";
    const postnatalLines = pdf.splitTextToSize(postnatalVal, contentWidth - (startX - margin));
    pdf.text(postnatalLines, startX, y);
    y += postnatalLines.length * 4.5 + 4;

    // Developmental History
    addSectionHeader("Developmental History");

    // Subtitle 1: Gross Motor & Language Milestones
    checkPageBreak(30);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...textLight);
    pdf.text("Gross Motor & Language Milestones", margin, y);
    y += 4;

    const table1Rows = [
      ...(dev.gross_motor || []),
      ...(dev.language || [])
    ].map((item, index) => [
      index + 1,
      item.skill || "—",
      item.expected || "—",
      item.achieved || "—",
      item.impression || "Normal"
    ]);

    addMilestoneTable1(
      ["S.No", "Development", "Normal Dev.", "Child Achieved", "Impression"],
      table1Rows
    );

    // Subtitle 2: Fine Motor & Social Milestones
    checkPageBreak(30);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...textLight);
    pdf.text("Fine Motor & Social Milestones", margin, y);
    y += 4;

    const fineMotorData = dev.fine_motor || [];
    const socialData = dev.social || [];
    const maxLen = Math.max(fineMotorData.length, socialData.length);
    const table2Rows = [];
    for (let i = 0; i < maxLen; i++) {
      const fm = fineMotorData[i] || {};
      const soc = socialData[i] || {};
      table2Rows.push([
        fm.skill || "—",
        fm.expected || "—",
        fm.impression || "—",
        soc.skill || "—",
        soc.expected || "—",
        soc.impression || "—"
      ]);
    }

    addMilestoneTable2(
      ["Fine / Gross Motor", "Expected", "Impression", "Social", "Expected", "Impression"],
      table2Rows
    );

    // Family history inline
    const familyTypeVal = fam.type_of_family?.join(", ") || "—";
    const familyHistoryText = `The child is born out of ${consangVal.toLowerCase().includes("non") ? "non-consanguineous" : "consanguineous"} parents. The family is a ${familyTypeVal.toLowerCase()} family. Father: ${demo.father || "—"}. Mother: ${demo.mother || "—"}. ${fam.mental_medical_history?.selected === "Yes" ? "Family history of medical/mental issues: " + fam.mental_medical_history.details : "No significant family history of intellectual disability and mental illness."}`;
    addInlineSection("Family history", familyHistoryText);

    // School history inline
    const schoolStatusVal = schol.school_status || "—";
    const schoolHistoryText = schoolStatusVal.toLowerCase().includes("not") || schoolStatusVal.toLowerCase().includes("no") 
      ? `The child has not yet started school${schol.not_started_reason ? ` (${schol.not_started_reason})` : ""}.`
      : `The child attends ${schol.type_of_school || "school"} entered at age ${schol.age_of_entry || "—"}. Present class: ${schol.present_class || "—"}. Performance: ${schol.scholastic_performance || "—"}. Regularity: ${schol.regularity?.selected || "—"}.`;
    addInlineSection("School history", schoolHistoryText);

    // Play history inline
    const playHistoryText = `Play behaviour: ${play.play_behaviour || "—"}. Play Preferences: ${play.play_preferences || "—"}. Screen time: ${play.screen_time || "—"}. Sleep: ${play.sleep_history || "—"}. Reinforcement - Physical: ${play.reinforcement_physical || "—"}, Food: ${play.reinforcement_food || "—"}, Toys: ${play.reinforcement_toys || "—"}, Others: ${play.reinforcement_others || play.likes || play.likes_dislikes || "—"}.`;
    addInlineSection("Play history", playHistoryText);

    // Treatment history inline
    const treatmentHistoryText = p.treatment_history || "None";
    addInlineSection("Treatment history", treatmentHistoryText);

    // Summary box
    if (p.OverAllSummary) {
      addSectionHeader("Summary");
      addSummaryBox(p.OverAllSummary);
    }

    // Impression inline
    if (p.OverAllImpression) {
      addInlineSection("Impression", p.OverAllImpression);
      y += 2;
    }

    // Recommendations list
    if (p.Recommendation) {
      addSectionHeader("Recommendations");
      const recs = p.Recommendation.split(/[,\n]/).map(r => r.trim()).filter(Boolean);
      recs.forEach(rec => {
        addBulletPoint(rec);
      });
    }

    addSignatureBlock();
    addPageFooter();

    pdf.save(`${id.name || "Patient"}_Pediatric_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // === VIEW: Selected Patient Report ===
  if (selectedPatient) {
    const p = selectedPatient;
    const id = p.identification_data || {};
    const demo = p.demographic_data || {};
    const hpi = p.history_of_present_illness || {};
    const fam = p.family_history || {};
    const pers = p.personal_history?.prenatal || {};
    const natal = p.natalandneanatal_history || {};
    const post = p.postnatal_history || {};
    const dev = p.developmental_history || {};
    const schol = p.scholastic_history || {};
    const play = p.play_history || {};
    const gen = p.general_history || {};

    return (
      <ThemeProvider theme={theme}>
        <Container style={{background: "#eef2f5"}}>
          <StickyNav>
            <Button onClick={() => setSelectedPatient(null)}>← Back to List</Button>
            <Button primary onClick={downloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Download size={16} /> Download PDF
            </Button>
            <Button primary onClick={() => handlePrintHTML(selectedPatient)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Printer size={16} /> Print Report
            </Button>
          </StickyNav>

          <ReportContainer id="printable-report-content">
            <ReportHeader>
              <h1>Pediatric History Record</h1>
              <p>Comprehensive Developmental & Clinical Assessment</p>
              <StatusBadge>{new Date().toLocaleDateString()}</StatusBadge>
            </ReportHeader>

            <Section>
              <SectionHeader>1. Identification Data</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Name:</strong> <span>{id.name || "—"}</span></InfoCard>
                <InfoCard><strong>Reg No:</strong> <span>{id.reg_no || "—"}</span></InfoCard>
                <InfoCard><strong>DOB:</strong> <span>{id.dob || "—"}</span></InfoCard>
                <InfoCard><strong>Assessment Date:</strong> <span>{id.date_of_assessment || "—"}</span></InfoCard>
                <InfoCard><strong>Age / Sex:</strong> <span>{id.age_sex || "—"}</span></InfoCard>
                <InfoCard><strong>Informant:</strong> <span>{id.informant_a} {id.informant_b && `& ${id.informant_b}`}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>2. Demographic Data</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Father:</strong> <span>{demo.father} <small>({demo.father_occupation})</small></span></InfoCard>
                <InfoCard><strong>Mother:</strong> <span>{demo.mother} <small>({demo.mother_occupation})</small></span></InfoCard>
                <InfoCard><strong>Address:</strong> <span>{demo.address_city}</span></InfoCard>
                <InfoCard><strong>Mobile:</strong> <span>{demo.mobile_number}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>3. Presenting Complaints</SectionHeader>
              <TextBlock>
                {Array.isArray(p.presenting_complaints)
                  ? p.presenting_complaints.map((c, i) => <div key={i}>• {c}</div>)
                  : (p.presenting_complaints || "None recorded")}
              </TextBlock>
            </Section>

            <Section>
              <SectionHeader>4. History of Present Illness</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Mode of Onset:</strong> <span>{hpi.mode_of_onset?.join(", ") || "—"}</span></InfoCard>
                <InfoCard><strong>Course:</strong> <span>{hpi.course_of_illness?.join(", ") || "—"}</span></InfoCard>
                <InfoCard><strong>Progress:</strong> <span>{hpi.progress?.join(", ") || "—"}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>5. Family History</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Family Type:</strong> <span>{fam.type_of_family?.join(", ") || "—"}</span></InfoCard>
                <InfoCard><strong>Consanguinity:</strong> <span>{fam.consanguinity || "—"}</span></InfoCard>
                <InfoCard><strong>Medical Hx:</strong> <span>{fam.mental_medical_history?.selected || "—"}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>6. Prenatal History</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Prenatal History:</strong> <span>{pers.prenatal_history || "—"}</span></InfoCard>
                <InfoCard><strong>Conception Age:</strong> <span>{pers.conceptual_age || pers.conceptual_age_of_mother || "—"}</span></InfoCard>
                <InfoCard><strong>Pregnancy:</strong> <span>{pers.reaction_to_pregnancy || pers.reaction_towards_pregnancy || "—"}</span></InfoCard>
                <InfoCard><strong>Issues:</strong> <span>{pers.mother_health_during_pregnancy?.selected_options?.join(", ") || "None"}</span></InfoCard>
                <InfoCard><strong>Medications:</strong> <span>{pers.medications_used || pers.medications_used_during_pregnancy || "None"}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>7. Natal & Neonatal</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Term:</strong> <span>{natal.term || "—"}</span></InfoCard>
                <InfoCard><strong>Delivery:</strong> <span>{natal.type_of_delivery || "—"}</span></InfoCard>
                <InfoCard><strong>Weight:</strong> <span>{natal.birth_weight || "—"}</span></InfoCard>
                <InfoCard><strong>Birth Cry:</strong> <span>{natal.birth_cry || "—"}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>9. Developmental Milestones</SectionHeader>
              {["gross_motor", "fine_motor", "language", "social"].map(area => {
                const title = area.replace("_", " ").toUpperCase();
                const data = dev[area] || [];
                return data.length > 0 ? (
                  <div key={area} style={{ marginBottom: "30px" }}>
                    <h4 style={{ color: theme.colors.primary, fontSize: "16px", marginBottom: "12px", borderBottom: `1px solid ${theme.colors.borderLight}` }}>{title}</h4>
                    <TableScroll>
                      <Table>
                        <thead><tr><th>Skill</th><th>Expected</th><th>Achieved</th><th>Impression</th></tr></thead>
                        <tbody>
                          {data.map((m, i) => (
                            <tr key={i}>
                              <td>{m.skill}</td>
                              <td>{m.expected}</td>
                              <td>{m.achieved}</td>
                              <td>
                                <StatusBadge isDelayed={m.impression?.toLowerCase().includes("delay")}>
                                  {m.impression || "Normal"}
                                </StatusBadge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableScroll>
                  </div>
                ) : null;
              })}
            </Section>

            <Section>
              <SectionHeader>10. Scholastic History</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>School Status:</strong> <span>{schol.school_status || "—"}{schol.not_started_reason ? ` (${schol.not_started_reason})` : ""}</span></InfoCard>
                <InfoCard><strong>School:</strong> <span>{schol.type_of_school || "—"}</span></InfoCard>
                <InfoCard><strong>Class:</strong> <span>{schol.present_class || "—"}</span></InfoCard>
                <InfoCard><strong>Performance:</strong> <span>{schol.scholastic_performance || schol.performance || "—"}</span></InfoCard>
                <InfoCard><strong>Peer Adjustment:</strong> <span>{schol.peer_group_adjustment || schol.peer_adjustment || "—"}</span></InfoCard>
                <InfoCard><strong>Relation w/ Authorities:</strong> <span>{schol.relation_with_authorities || schol.relation_authorities || "—"}</span></InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>11. Play History</SectionHeader>
              <InfoGrid>
                <InfoCard><strong>Play Behaviour:</strong> <span>{play.play_behaviour || "—"}</span></InfoCard>
                <InfoCard><strong>Play Preferences:</strong> <span>{play.play_preferences || "—"}</span></InfoCard>
                <InfoCard><strong>Rule Knowledge:</strong> <span>{play.rule_knowledge || "—"}</span></InfoCard>
                <InfoCard><strong>Group Behaviour:</strong> <span>{play.group_behaviour || "—"}</span></InfoCard>
                <InfoCard><strong>Leisure Activities:</strong> <span>{play.leisure_time || "—"}</span></InfoCard>
                <InfoCard><strong>Dislikes:</strong> <span>{play.dislikes || "—"}</span></InfoCard>
                <InfoCard><strong>Screen Time:</strong> <span>{play.screen_time || "—"}</span></InfoCard>
                <InfoCard><strong>Sleep History:</strong> <span>{play.sleep_history || "—"}</span></InfoCard>
                <InfoCard style={{ gridColumn: "1 / -1" }}>
                  <strong style={{ color: theme.colors.primary, display: 'block', marginBottom: '8px' }}>Reinforcement:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div><strong style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>PHYSICAL:</strong> <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 500 }}>{play.reinforcement_physical || "—"}</span></div>
                    <div><strong style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>FOOD:</strong> <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 500 }}>{play.reinforcement_food || "—"}</span></div>
                    <div><strong style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>TOYS:</strong> <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 500 }}>{play.reinforcement_toys || "—"}</span></div>
                    <div><strong style={{ fontSize: '0.8rem', color: theme.colors.textLight }}>OTHERS:</strong> <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 500 }}>{play.reinforcement_others || play.likes || play.likes_dislikes || "—"}</span></div>
                  </div>
                </InfoCard>
              </InfoGrid>
            </Section>

            <Section>
              <SectionHeader>12. Over All Impression</SectionHeader>
              <TextBlock>{p.OverAllImpression || "Normal"}</TextBlock>
            </Section>
            <Section>
              <SectionHeader>13. Over All Summary</SectionHeader>
              <TextBlock>{p.OverAllSummary || "Normal"}</TextBlock>
            </Section>            
            <Section>
              <SectionHeader>14. Recommendation</SectionHeader>
              <TextBlock>{p.Recommendation || "Normal"}</TextBlock>
            </Section>
                        
          </ReportContainer>
        </Container>
      </ThemeProvider>
    );
  }

  // === VIEW: Patient List ===
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>Patient History Records</Header>
        
        <ControlsContainer>
          <InputGroup>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </InputGroup>
          
          <InputGroup>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </InputGroup>

          <SearchContainer>
             <InputGroup style={{width: '100%'}}>
              <label>Search Patient</label>
              <input
                type="text"
                placeholder="Name / Reg No..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </InputGroup>
            {searchText && <ClearButton onClick={clearSearch}>×</ClearButton>}
          </SearchContainer>

          <ButtonGroup>
            <Button primary onClick={filterByDate}>Filter</Button>
            <Button onClick={resetFilter}>Reset</Button>
          </ButtonGroup>
        </ControlsContainer>

        <TableWrapper>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>DOB</th>
                  <th>Assessment Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? filteredPatients.map((p, i) => {
                  const d = p.identification_data || {};
                  return (
                    <tr key={i}>
                      <td><span style={{ fontWeight: 600, color: theme.colors.primaryDark }}>{d.name || "—"}</span></td>
                      <td>{d.reg_no || "—"}</td>
                      <td>{d.dob || "—"}</td>
                      <td>{d.date_of_assessment || "—"}</td>
                      <td>
                        <Button style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setSelectedPatient(p)}>
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: theme.colors.textLight }}>No records found</td></tr>
                )}
              </tbody>
            </Table>
          </TableScroll>
        </TableWrapper>
      </Container>
    </ThemeProvider>
  );
};

export default Historyrecordingsheetreport;