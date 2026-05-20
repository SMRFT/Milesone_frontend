import React, { useEffect, useState } from "react";
import apiRequest from "./apiRequest";
import { jsPDF } from "jspdf";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { normalizePatient } from "./parseUtils";
import autoTable from 'jspdf-autotable';
import mdcLogo from "./Images/mdcLogo.png";

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

  // --- PDF GENERATION LOGIC (UNCHANGED FOR FUNCTIONALITY) ---
  const downloadPDF = async () => {
    if (!selectedPatient) return;
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
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;
    let pageNum = 1;

    // Colors
    const primary = [64, 97, 71];
    const primaryLight = [107, 138, 114];
    const primaryDark = [45, 69, 50];
    const bgLight = [240, 245, 241];
    const white = [255, 255, 255];
    const textDark = [33, 37, 41];
    const textLight = [108, 117, 125];

// --- Helper: Add Letterhead Header ---
    const addPageHeader = () => {
      // 1. Logo (Left Side)
      if (typeof mdcLogo !== "undefined" && mdcLogo) {
        try {
          // x, y, width, height
          pdf.addImage(mdcLogo, "PNG", margin, 10, 65, 25);
        } catch (e) {
          console.warn("Logo not loaded:", e);
        }
      }

      // 2. Contact Details (Right of Logo)
      const textX = margin + 100;
      let textY = 15;
      const titleColor = [51, 51, 51]; // #333

      // Title
      pdf.setFontSize(14);
      pdf.setTextColor(...titleColor);
      pdf.setFont("helvetica", "bold");
      pdf.text("Milestone Development Center", textX, textY);

      // Address Block
      pdf.setFontSize(10);
      pdf.setTextColor(...titleColor);
      pdf.setFont("helvetica", "normal");

      textY += 6;
      pdf.text("59/37, Saradha College Road,", textX, textY);

      textY += 5;
      pdf.text("Salem-636007, Tamil Nadu", textX, textY);

      textY += 5;
      pdf.text("Ph: +91 90470 33633", textX, textY);

      textY += 5;
      pdf.text("Email: info@milestonescenter.in", textX, textY);

      // Decorative Divider Line
      pdf.setDrawColor(200, 200, 200); // Light Grey
      pdf.setLineWidth(0.5);
      pdf.line(margin, 42, pageWidth - margin, 42);

      y = 50; // Reset Y position for body content
    };
    
    const addPageFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      pdf.setFontSize(8);
      pdf.setTextColor(...textLight);
      pdf.setFont("helvetica", "normal");
      const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      pdf.text(`Generated: ${dateStr}`, margin, footerY);
      pdf.text(`Patient: ${id.name || "N/A"} | Reg: ${id.reg_no || "N/A"}`, pageWidth / 2, footerY, { align: "center" });
      pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
      pdf.setFillColor(...primary);
      pdf.rect(0, pageHeight - 5, pageWidth, 5, "F");
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
      checkPageBreak(50);
      pdf.setFillColor(...primary);
      pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, "F");
      pdf.setFontSize(22);
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.text("PEDIATRIC HISTORY RECORDING SHEET", pageWidth / 2, y + 15, { align: "center" });
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Comprehensive Developmental & Clinical Assessment Report", pageWidth / 2, y + 25, { align: "center" });
      y += 45;
      
      pdf.setFillColor(...bgLight);
      pdf.roundedRect(margin, y, contentWidth, 20, 2, 2, "F");
      pdf.setDrawColor(...primary);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, y, contentWidth, 20, 2, 2, "S");
      pdf.setFontSize(10);
      pdf.setTextColor(...primaryDark);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Patient: ${id.name || "N/A"}`, margin + 8, y + 8);
      pdf.text(`Reg No: ${id.reg_no || "N/A"}`, margin + 80, y + 8);
      pdf.text(`DOB: ${id.dob || "N/A"}`, margin + 130, y + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textLight);
      pdf.text(`Assessment Date: ${id.date_of_assessment || "N/A"}`, margin + 8, y + 15);
      pdf.text(`Age/Sex: ${id.age_sex || "N/A"}`, margin + 80, y + 15);
      y += 30;
    };

    const addSectionHeader = (number, title) => {
      checkPageBreak(20);
      pdf.setFillColor(...primary);
      pdf.circle(margin + 5, y + 3, 5, "F");
      pdf.setFontSize(10);
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(number), margin + 5, y + 5, { align: "center" });
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryDark);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 15, y + 5);
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(1);
      pdf.line(margin, y + 10, pageWidth - margin, y + 10);
      y += 18;
    };

    const addInfoCardAt = (x, yPos, width, label, value) => {
      pdf.setFillColor(...bgLight);
      pdf.roundedRect(x, yPos, width, 12, 2, 2, "F");
      pdf.setFillColor(...primary);
      pdf.rect(x, yPos, 2, 12, "F");
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primary);
      pdf.text(label, x + 6, yPos + 5);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textDark);
      pdf.text(String(value || "—").substring(0, 40), x + 6, yPos + 10);
    };

    const addTwoColumnCards = (cards) => {
      for (let i = 0; i < cards.length; i += 2) {
        checkPageBreak(16);
        const cardWidth = contentWidth / 2 - 5;
        addInfoCardAt(margin, y, cardWidth, cards[i].label, cards[i].value);
        if (cards[i + 1]) {
          addInfoCardAt(margin + cardWidth + 10, y, cardWidth, cards[i + 1].label, cards[i + 1].value);
        }
        y += 16;
      }
    };

    const addTextBlock = (text) => {
      checkPageBreak(20);
      pdf.setFillColor(...bgLight);
      pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
      pdf.setFillColor(...primary);
      pdf.rect(margin, y, 3, 18, "F");
      pdf.setFontSize(10);
      pdf.setTextColor(...textDark);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(text || "None recorded", contentWidth - 15);
      pdf.text(lines.slice(0, 2), margin + 8, y + 8);
      y += 22;
    };

    const addMilestoneTable = (title, data) => {
      if (!data || !data.length) return;
      checkPageBreak(15);
      pdf.setFillColor(...primaryDark);
      pdf.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
      pdf.setFontSize(10);
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 5, y + 5.5);
      y += 12;

      const tableData = data.map(row => {
        const isDelayed = row.impression?.toLowerCase().includes("delay");
        return [
          row.skill || "—",
          row.expected || "—",
          row.achieved || "—",
          { content: row.impression || "Normal", styles: { textColor: isDelayed ? [220, 38, 38] : primary, fontStyle: isDelayed ? "bold" : "normal" } }
        ];
      });

      autoTable(pdf, {
        startY: y,
        head: [["Milestone/Skill", "Expected Age", "Achieved Age", "Status"]],
        body: tableData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 4, lineColor: primaryLight, lineWidth: 0.2 },
        headStyles: { fillColor: bgLight, textColor: primaryDark, fontStyle: "bold", halign: "center" },
        columnStyles: {
          0: { cellWidth: 55, halign: "left" },
          1: { cellWidth: 35, halign: "center" },
          2: { cellWidth: 35, halign: "center" },
          3: { cellWidth: 35, halign: "center" }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        tableLineColor: primaryLight,
        tableLineWidth: 0.1,
      });
      y = pdf.lastAutoTable.finalY + 8;
    };

    addPageHeader();
    addDocumentTitle();

    addSectionHeader(1, "IDENTIFICATION DATA");
    addTwoColumnCards([
      { label: "Patient Name", value: id.name },
      { label: "Registration No", value: id.reg_no },
      { label: "Date of Birth", value: id.dob },
      { label: "Assessment Date", value: id.date_of_assessment },
      { label: "Age / Sex", value: id.age_sex },
      { label: "Informant(s)", value: [id.informant_a, id.informant_b].filter(Boolean).join(" & ") },
      { label: "Info Reliability", value: id.information_reliability },
      { label: "Adequacy", value: id.adequacy },
    ]);

    addSectionHeader(2, "DEMOGRAPHIC DATA");
    addTwoColumnCards([
      { label: "Father's Name", value: `${demo.father || "—"} (${demo.father_occupation || "—"})` },
      { label: "Mother's Name", value: `${demo.mother || "—"} (${demo.mother_occupation || "—"})` },
      { label: "Father's Age", value: demo.father_age },
      { label: "Mother's Age", value: demo.mother_age },
      { label: "Address", value: demo.address_city },
      { label: "Mobile Number", value: demo.mobile_number },
      { label: "Religion / Language", value: demo.religion_language },
    ]);

    addSectionHeader(3, "PRESENTING COMPLAINTS");
    const complaintsText = Array.isArray(p.presenting_complaints)
      ? p.presenting_complaints.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : (p.presenting_complaints || "None recorded");
    addTextBlock(complaintsText);

    addSectionHeader(4, "HISTORY OF PRESENT ILLNESS");
    addTwoColumnCards([
      { label: "Mode of Onset", value: hpi.mode_of_onset?.join(", ") },
      { label: "Course of Illness", value: hpi.course_of_illness?.join(", ") },
      { label: "Progress", value: hpi.progress?.join(", ") },
    ]);

    addSectionHeader(5, "FAMILY HISTORY");
    addTwoColumnCards([
      { label: "Family Type", value: fam.type_of_family?.join(", ") },
      { label: "Consanguinity", value: fam.consanguinity },
      { label: "Family Genogram", value: fam.family_genogram },
      { label: "Mental/Medical History", value: fam.mental_medical_history?.selected },
    ]);
    if (fam.mental_medical_history?.selected === "Yes") {
      addTextBlock(`Details: ${fam.mental_medical_history.details}`);
    }

    addSectionHeader(6, "PRENATAL HISTORY");
    addTwoColumnCards([
      { label: "Prenatal History", value: pers.prenatal_history },
      { label: "Mother's Age at Conception", value: pers.conceptual_age || pers.conceptual_age_of_mother },
      { label: "Reaction to Pregnancy", value: pers.reaction_to_pregnancy || pers.reaction_towards_pregnancy },
      { label: "Abortion Attempt", value: pers.abortion_attempt?.selected },
      { label: "Maternal Health Issues", value: pers.mother_health_during_pregnancy?.selected_options?.join(", ") },
      { label: "Medications Used", value: pers.medications_used || pers.medications_used_during_pregnancy },
      { label: "Other Complaints", value: pers.other_complaints },
    ]);

    addSectionHeader(7, "NATAL & NEONATAL HISTORY");
    addTwoColumnCards([
      { label: "Term", value: natal.term },
      { label: "Delivery Place", value: natal.delivery_place },
      { label: "Type of Delivery", value: natal.type_of_delivery },
      { label: "Birth Weight", value: natal.birth_weight },
      { label: "Birth Cry", value: natal.birth_cry },
      { label: "Caesarean Reason", value: natal.caesarean_reason },
    ]);

    addSectionHeader(8, "POSTNATAL HISTORY");
    addTwoColumnCards([
      { label: "Conditions", value: post.selected_conditions?.join(", ") },
      { label: "Other Details", value: post.other_details },
    ]);

    addPageFooter();
    pdf.addPage();
    pageNum++;
    addPageHeader();
    
    addSectionHeader(9, "DEVELOPMENTAL MILESTONES");
    addMilestoneTable("Gross Motor Development", dev.gross_motor);
    addMilestoneTable("Fine Motor Development", dev.fine_motor);
    addMilestoneTable("Language Development", dev.language);
    addMilestoneTable("Social Development", dev.social);

    addSectionHeader(10, "SCHOLASTIC HISTORY");
    addTwoColumnCards([
      { label: "School Status", value: schol.school_status },
      { label: "Type of School", value: schol.type_of_school },
      { label: "Age of Entry", value: schol.age_of_entry },
      { label: "Present Class", value: schol.present_class },
      { label: "Medium of Instruction", value: schol.medium_of_instruction?.join(", ") },
      { label: "Scholastic Performance", value: schol.scholastic_performance || schol.performance },
      { label: "Regularity", value: schol.regularity?.selected },
      { label: "Peer Group Adjustment", value: schol.peer_group_adjustment || schol.peer_adjustment },
      { label: "Relation with Authorities", value: schol.relation_with_authorities || schol.relation_authorities },
    ]);

    addSectionHeader(11, "PLAY & GENERAL HISTORY");
    addTwoColumnCards([
      { label: "Play Behaviour", value: play.play_behaviour },
      { label: "Play Preferences", value: play.play_preferences },
      { label: "Rule Knowledge", value: play.rule_knowledge },
      { label: "Group Behaviour", value: play.group_behaviour },
      { label: "Leisure Time", value: play.leisure_time },
      { label: "Likes", value: play.likes || play.likes_dislikes },
      { label: "Dislikes", value: play.dislikes },
      { label: "Sleep History", value: play.sleep_history },
      { label: "Screen Time", value: play.screen_time },
      { label: "Treatment History", value: p.treatment_history },
      { label: "Dysmorphic Features", value: gen.dysmorphic_features },
      { label: "CNS Examination", value: gen.cns_examination },
    ]);
    
    addSectionHeader(12,"Over All Impression");
    addTextBlock(p.OverAllImpression)
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
            <Button primary onClick={downloadPDF}>📄 Download PDF</Button>
          </StickyNav>

          <ReportContainer>
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
                <InfoCard><strong>School Status:</strong> <span>{schol.school_status || "—"}</span></InfoCard>
                <InfoCard><strong>School:</strong> <span>{schol.type_of_school || "—"}</span></InfoCard>
                <InfoCard><strong>Class:</strong> <span>{schol.present_class || "—"}</span></InfoCard>
                <InfoCard><strong>Performance:</strong> <span>{schol.scholastic_performance || schol.performance || "—"}</span></InfoCard>
                <InfoCard><strong>Peer Adjustment:</strong> <span>{schol.peer_group_adjustment || schol.peer_adjustment || "—"}</span></InfoCard>
                <InfoCard><strong>Relation w/ Authorities:</strong> <span>{schol.relation_with_authorities || schol.relation_authorities || "—"}</span></InfoCard>
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