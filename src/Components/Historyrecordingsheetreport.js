import React, { useEffect, useState } from "react";
import apiRequest from "./apiRequest";
import { jsPDF } from "jspdf";
import styled, { ThemeProvider } from "styled-components";
import autoTable from 'jspdf-autotable';

const theme = {
  colors: {
    primary: "#406147",
    primaryLight: "#6b8a72",
    primaryDark: "#2d4532",
    secondary: "#3f37c9",
    accent: "#4895ef",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: "#212529",
    textLight: "#6c757d",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    purple: "#9c27b0",
    border: "#406147",
    borderLight: "#e9ecef",
    cardBg: "#f0f5f1",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
    medium: "0 4px 8px rgba(0,0,0,0.12)",
    large: "0 8px 16px rgba(0,0,0,0.15)",
    hover: "0 8px 20px rgba(0,0,0,0.2)",
  },
  borderRadius: { small: "4px", medium: "8px", large: "12px", xl: "16px", round: "50%" },
  transitions: { default: "all 0.3s ease" },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", xxl: "48px" },
  font: "'Inter', 'Segoe UI', sans-serif",
};

const Container = styled.div`
  padding: 2rem;
  background: ${p => p.theme.colors.background};
  min-height: 100vh;
  font-family: ${p => p.theme.font};
  color: ${p => p.theme.colors.text};
`;

const Header = styled.h1`
  text-align: center;
  color: transparent;
  background: linear-gradient(90deg, ${p => p.theme.colors.primary}, ${p => p.theme.colors.primaryLight});
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.9rem 2rem;
  border: none;
  border-radius: ${p => p.theme.borderRadius.large};
  font-weight: 600;
  cursor: pointer;
  transition: ${p => p.theme.transitions.default};
  background: ${p => p.primary ? p.theme.colors.primary : p.theme.colors.borderLight};
  color: ${p => p.primary ? "white" : p.theme.colors.primaryDark};
  &:hover { transform: translateY(-3px); box-shadow: ${p => p.theme.shadows.hover}; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: ${p => p.theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${p => p.theme.shadows.medium};
  th { background: ${p => p.theme.colors.primary}; color: white; padding: 1.2rem; text-align: left; }
  td { padding: 1.2rem; }
  tr:hover { background: ${p => p.theme.colors.cardBg}; }
  button {
    background: ${p => p.theme.colors.primary};
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: ${p => p.theme.borderRadius.medium};
    cursor: pointer;
    transition: ${p => p.theme.transitions.default};
    &:hover { background: ${p => p.theme.colors.primaryDark}; }
  }
`;

const ReportHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 5px double ${p => p.theme.colors.primary};
`;

const Section = styled.div`
  margin-bottom: 40px;
  page-break-inside: avoid;
`;

const SectionTitle = styled.h3`
  color: ${p => p.theme.colors.primaryDark};
  font-size: 21px;
  margin: 35px 0 18px;
  padding-bottom: 10px;
  border-bottom: 3px solid ${p => p.theme.colors.primaryLight};
  font-weight: 700;
`;

const ReportWrapper = styled.div`
  width: 794px;
  min-height: 100%;
  margin: auto;
  background: white;
  padding: 40px 50px;
  box-sizing: border-box;
  color: ${p => p.theme.colors.text};
  h1, h2, h3, h4 { text-align: center; width: 100%; margin: 0 0 15px 0; }
`;

const PDFGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

const PDFCard = styled.div`
  width: calc(50% - 7px);
  background: ${p => p.theme.colors.cardBg};
  padding: 14px;
  border-radius: ${p => p.theme.borderRadius.medium};
  border-left: 6px solid ${p => p.theme.colors.primary};
  font-size: 14px;
  strong { color: ${p => p.theme.colors.primaryDark}; }
`;

const PDFTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  thead tr { background: ${p => p.theme.colors.cardBg}; }
  th { color: ${p => p.theme.colors.primaryDark}; font-weight: 700; padding: 10px; text-align: center; border: 1px solid ${p => p.theme.colors.primaryLight}; white-space: nowrap; }
  td { border: 1px solid ${p => p.theme.colors.primaryLight}; padding: 10px; vertical-align: middle; font-size: 14px; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  th:nth-child(1), td:nth-child(1) { width: 40%; text-align: left; }
  th:nth-child(2), td:nth-child(2), th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { width: 20%; text-align: center; }
  .delayed { color: ${p => p.theme.colors.error}; font-weight: bold; }
  .normal { color: ${p => p.theme.colors.primary}; }
`;

const HardPageBreak = styled.div`
  height: 40px;
`;

const SectionHeader = styled.h3`
  font-size: 20px;
  color: ${p => p.theme.colors.primaryDark};
  border-bottom: 3px solid ${p => p.theme.colors.primaryLight};
  padding-bottom: 10px;
  margin-top: 40px;
  margin-bottom: 20px;
  text-align: left !important;
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
      const data = Array.isArray(res?.data) ? res.data : [];
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

  // PROFESSIONAL PDF GENERATION
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

    // Add page header
    const addPageHeader = () => {
      // Top decorative bar
      pdf.setFillColor(...primary);
      pdf.rect(0, 0, pageWidth, 8, "F");
      
      // Gradient effect with lighter bar
      pdf.setFillColor(...primaryLight);
      pdf.rect(0, 8, pageWidth, 2, "F");
      
      // Logo/Title area
      pdf.setFillColor(...bgLight);
      pdf.rect(0, 10, pageWidth, 25, "F");
      
      // Hospital/Clinic name
      pdf.setFontSize(16);
      pdf.setTextColor(...primary);
      pdf.setFont("helvetica", "bold");
      pdf.text("PEDIATRIC DEVELOPMENTAL CENTER", pageWidth / 2, 20, { align: "center" });
      
      pdf.setFontSize(9);
      pdf.setTextColor(...textLight);
      pdf.setFont("helvetica", "normal");
      pdf.text("Comprehensive Child Development & Assessment Services", pageWidth / 2, 27, { align: "center" });
      
      // Decorative line
      pdf.setDrawColor(...primary);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      y = 42;
    };

    // Add page footer
    const addPageFooter = () => {
      const footerY = pageHeight - 15;
      
      // Footer line
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      // Footer text
      pdf.setFontSize(8);
      pdf.setTextColor(...textLight);
      pdf.setFont("helvetica", "normal");
      
      const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      pdf.text(`Generated: ${dateStr}`, margin, footerY);
      pdf.text(`Patient: ${id.name || "N/A"} | Reg: ${id.reg_no || "N/A"}`, pageWidth / 2, footerY, { align: "center" });
      pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
      
      // Bottom decorative bar
      pdf.setFillColor(...primary);
      pdf.rect(0, pageHeight - 5, pageWidth, 5, "F");
    };

    // Check page break
    const checkPageBreak = (neededSpace) => {
      if (y + neededSpace > pageHeight - 25) {
        addPageFooter();
        pdf.addPage();
        pageNum++;
        addPageHeader();
      }
    };

    // Add document title section
    const addDocumentTitle = () => {
      checkPageBreak(50);
      
      // Title box
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
      
      // Patient summary box
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

    // Add section header
    const addSectionHeader = (number, title, icon = "●") => {
      checkPageBreak(20);
      
      // Section number circle
      pdf.setFillColor(...primary);
      pdf.circle(margin + 5, y + 3, 5, "F");
      pdf.setFontSize(10);
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(number), margin + 5, y + 5, { align: "center" });
      
      // Section title
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryDark);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 15, y + 5);
      
      // Underline
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(1);
      pdf.line(margin, y + 10, pageWidth - margin, y + 10);
      
      y += 18;
    };

    // Add info row (two columns)
    const addInfoRow = (label1, value1, label2, value2) => {
      checkPageBreak(10);
      const colWidth = contentWidth / 2 - 5;
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primary);
      pdf.text(label1, margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textDark);
      pdf.text(String(value1 || "—"), margin + 35, y);
      
      if (label2) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primary);
        pdf.text(label2, margin + colWidth + 10, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...textDark);
        pdf.text(String(value2 || "—"), margin + colWidth + 45, y);
      }
      
      y += 6;
    };

    // Add info card
    const addInfoCard = (label, value, fullWidth = false) => {
      checkPageBreak(14);
      const cardWidth = fullWidth ? contentWidth : contentWidth / 2 - 5;
      
      pdf.setFillColor(...bgLight);
      pdf.roundedRect(margin, y, cardWidth, 12, 2, 2, "F");
      pdf.setDrawColor(...primaryLight);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, margin, y + 12);
      pdf.setFillColor(...primary);
      pdf.rect(margin, y, 2, 12, "F");
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primary);
      pdf.text(label, margin + 6, y + 5);
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textDark);
      const valueText = String(value || "—").substring(0, 50);
      pdf.text(valueText, margin + 6, y + 10);
      
      return cardWidth;
    };

    // Add two column cards
    const addTwoColumnCards = (cards) => {
      for (let i = 0; i < cards.length; i += 2) {
        checkPageBreak(16);
        const cardWidth = contentWidth / 2 - 5;
        
        // First card
        addInfoCardAt(margin, y, cardWidth, cards[i].label, cards[i].value);
        
        // Second card (if exists)
        if (cards[i + 1]) {
          addInfoCardAt(margin + cardWidth + 10, y, cardWidth, cards[i + 1].label, cards[i + 1].value);
        }
        
        y += 16;
      }
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

    // Add text block
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

    // Add milestone table
    const addMilestoneTable = (title, data) => {
      if (!data || !data.length) return;
      
      checkPageBreak(15);
      
      // Sub-header
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

    // === BUILD PDF ===
    addPageHeader();
    addDocumentTitle();

    // 1. Identification Data
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

    // 2. Demographic Data
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

    // 3. Presenting Complaints
    addSectionHeader(3, "PRESENTING COMPLAINTS");
    addTextBlock(p.presenting_complaints);

    // 4. History of Present Illness
    addSectionHeader(4, "HISTORY OF PRESENT ILLNESS");
    addTwoColumnCards([
      { label: "Mode of Onset", value: hpi.mode_of_onset?.join(", ") },
      { label: "Course of Illness", value: hpi.course_of_illness?.join(", ") },
      { label: "Progress", value: hpi.progress?.join(", ") },
    ]);

    // 5. Family History
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

    // 6. Prenatal History
    addSectionHeader(6, "PRENATAL HISTORY");
    addTwoColumnCards([
      { label: "Mother's Age at Conception", value: pers.conceptual_age || pers.conceptual_age_of_mother },
      { label: "Reaction to Pregnancy", value: pers.reaction_to_pregnancy || pers.reaction_towards_pregnancy },
      { label: "Abortion Attempt", value: pers.abortion_attempt?.selected },
      { label: "Maternal Health Issues", value: pers.mother_health_during_pregnancy?.selected_options?.join(", ") },
      { label: "Medications Used", value: pers.medications_used || pers.medications_used_during_pregnancy },
      { label: "Other Complaints", value: pers.other_complaints },
    ]);

    // 7. Natal & Neonatal History
    addSectionHeader(7, "NATAL & NEONATAL HISTORY");
    addTwoColumnCards([
      { label: "Term", value: natal.term },
      { label: "Delivery Place", value: natal.delivery_place },
      { label: "Type of Delivery", value: natal.type_of_delivery },
      { label: "Birth Weight", value: natal.birth_weight },
      { label: "Birth Cry", value: natal.birth_cry },
      { label: "Caesarean Reason", value: natal.caesarean_reason },
    ]);

    // 8. Postnatal History
    addSectionHeader(8, "POSTNATAL HISTORY");
    addTwoColumnCards([
      { label: "Conditions", value: post.selected_conditions?.join(", ") },
      { label: "Other Details", value: post.other_details },
    ]);

    // 9. Developmental Milestones - New Page
    addPageFooter();
    pdf.addPage();
    pageNum++;
    addPageHeader();
    
    addSectionHeader(9, "DEVELOPMENTAL MILESTONES");
    addMilestoneTable("Gross Motor Development", dev.gross_motor);
    addMilestoneTable("Fine Motor Development", dev.fine_motor);
    addMilestoneTable("Language Development", dev.language);
    addMilestoneTable("Social Development", dev.social);

    // 10. Scholastic History
    addSectionHeader(10, "SCHOLASTIC HISTORY");
    addTwoColumnCards([
      { label: "Type of School", value: schol.type_of_school },
      { label: "Age of Entry", value: schol.age_of_entry },
      { label: "Present Class", value: schol.present_class },
      { label: "Medium of Instruction", value: schol.medium_of_instruction?.join(", ") },
      { label: "Scholastic Performance", value: schol.performance || schol.scholastic_performance },
      { label: "Regularity", value: schol.regularity?.selected },
      { label: "Peer Group Adjustment", value: schol.peer_adjustment || schol.peer_group_adjustment },
    ]);

    // 11. Play & General History
    addSectionHeader(11, "PLAY & GENERAL HISTORY");
    addTwoColumnCards([
      { label: "Play Behaviour", value: play.play_behaviour },
      { label: "Treatment History", value: p.treatment_history },
      { label: "Dysmorphic Features", value: gen.dysmorphic_features },
      { label: "CNS Examination", value: gen.cns_examination },
    ]);

    // Final footer
    addPageFooter();

    // Save
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
        <Container>
          <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", marginBottom: "20px" }}>
            <Button onClick={() => setSelectedPatient(null)}>← Back to List</Button>
            <Button primary onClick={downloadPDF}>📄 Download PDF</Button>
          </div>

          <ReportWrapper id="pdf-report">
            <ReportHeader>
              <h1 style={{ fontSize: "34px", margin: 0, color: theme.colors.primary }}>Pediatric History Recording Sheet</h1>
              <p style={{ fontSize: "19px", color: theme.colors.primary, margin: "12px 0" }}>Comprehensive Developmental & Clinical Assessment</p>
              <p style={{ color: theme.colors.textLight }}>Report Generated: {new Date().toLocaleDateString()}</p>
            </ReportHeader>

            <Section>
              <SectionHeader>1. Identification Data</SectionHeader>
              <PDFGrid>
                <PDFCard><strong>Name:</strong> {id.name || "—"}</PDFCard>
                <PDFCard><strong>Reg No:</strong> {id.reg_no || "—"}</PDFCard>
                <PDFCard><strong>Date of Birth:</strong> {id.dob || "—"}</PDFCard>
                <PDFCard><strong>Assessment Date:</strong> {id.date_of_assessment || "—"}</PDFCard>
                <PDFCard><strong>Age / Sex:</strong> {id.age_sex || "—"}</PDFCard>
                <PDFCard><strong>Informant:</strong> {id.informant_a} {id.informant_b && `& ${id.informant_b}`}</PDFCard>
                <PDFCard><strong>Reliability:</strong> {id.information_reliability || "—"}</PDFCard>
                <PDFCard><strong>Adequacy:</strong> {id.adequacy || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionHeader>2. Demographic Data</SectionHeader>
              <PDFGrid>
                <PDFCard><strong>Father:</strong> {demo.father} ({demo.father_occupation})</PDFCard>
                <PDFCard><strong>Mother:</strong> {demo.mother} ({demo.mother_occupation})</PDFCard>
                <PDFCard><strong>Father Age:</strong> {demo.father_age}</PDFCard>
                <PDFCard><strong>Mother Age:</strong> {demo.mother_age}</PDFCard>
                <PDFCard><strong>Address:</strong> {demo.address_city}</PDFCard>
                <PDFCard><strong>Mobile:</strong> {demo.mobile_number}</PDFCard>
                <PDFCard><strong>Religion / Language:</strong> {demo.religion_language}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>3. Presenting Complaints</SectionTitle>
              <div style={{ background: theme.colors.cardBg, padding: "20px", borderRadius: "12px", borderLeft: `6px solid ${theme.colors.primary}` }}>
                <p style={{ margin: 0, fontSize: "16px" }}>{p.presenting_complaints || "None recorded"}</p>
              </div>
            </Section>

            <Section>
              <SectionTitle>4. History of Present Illness</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Mode of Onset:</strong> {hpi.mode_of_onset?.join(", ") || "—"}</PDFCard>
                <PDFCard><strong>Course:</strong> {hpi.course_of_illness?.join(", ") || "—"}</PDFCard>
                <PDFCard><strong>Progress:</strong> {hpi.progress?.join(", ") || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>5. Family History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Family Type:</strong> {fam.type_of_family?.join(", ") || "—"}</PDFCard>
                <PDFCard><strong>Consanguinity:</strong> {fam.consanguinity || "—"}</PDFCard>
                <PDFCard><strong>Genogram:</strong> {fam.family_genogram || "—"}</PDFCard>
                <PDFCard><strong>Mental/Medical Hx:</strong> {fam.mental_medical_history?.selected || "—"}</PDFCard>
                {fam.mental_medical_history?.selected === "Yes" && <PDFCard><strong>Details:</strong> {fam.mental_medical_history.details}</PDFCard>}
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>6. Prenatal History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Mother's Age at Conception:</strong> {pers.conceptual_age || pers.conceptual_age_of_mother || "—"}</PDFCard>
                <PDFCard><strong>Pregnancy:</strong> {pers.reaction_to_pregnancy || pers.reaction_towards_pregnancy || "—"}</PDFCard>
                <PDFCard><strong>Abortion Attempt:</strong> {pers.abortion_attempt?.selected || "—"}</PDFCard>
                {pers.abortion_attempt?.selected === "Yes" && <PDFCard><strong>Details:</strong> {pers.abortion_attempt.details}</PDFCard>}
                <PDFCard><strong>Maternal Health Issues:</strong> {pers.mother_health_during_pregnancy?.selected_options?.join(", ") || "—"}</PDFCard>
                <PDFCard><strong>Medications:</strong> {pers.medications_used || pers.medications_used_during_pregnancy || "—"}</PDFCard>
                <PDFCard><strong>Other Complaints:</strong> {pers.other_complaints || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>7. Natal & Neonatal History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Term:</strong> {natal.term || "—"}</PDFCard>
                <PDFCard><strong>Place:</strong> {natal.delivery_place || "—"}</PDFCard>
                <PDFCard><strong>Type:</strong> {natal.type_of_delivery || "—"}</PDFCard>
                {natal.type_of_delivery === "Caesarean" && <PDFCard><strong>Reason:</strong> {natal.caesarean_reason}</PDFCard>}
                <PDFCard><strong>Birth Weight:</strong> {natal.birth_weight || "—"}</PDFCard>
                <PDFCard><strong>Birth Cry:</strong> {natal.birth_cry || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>8. Postnatal History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Conditions:</strong> {post.selected_conditions?.join(", ") || "None"}</PDFCard>
                <PDFCard><strong>Other Details:</strong> {post.other_details || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>9. Developmental Milestones</SectionTitle>
              {["gross_motor", "fine_motor", "language", "social"].map(area => {
                const title = area.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
                const data = dev[area] || [];
                return data.length > 0 ? (
                  <div key={area} style={{ marginBottom: "30px" }}>
                    <h4 style={{ color: theme.colors.primary, fontSize: "19px", margin: "20px 0 12px" }}>{title}</h4>
                    <PDFTable>
                      <thead><tr><th>Skill</th><th>Expected</th><th>Achieved</th><th>Impression</th></tr></thead>
                      <tbody>
                        {data.map((m, i) => (
                          <tr key={i}>
                            <td>{m.skill}</td>
                            <td>{m.expected}</td>
                            <td>{m.achieved}</td>
                            <td className={m.impression?.toLowerCase().includes("delay") ? "delayed" : "normal"}>{m.impression || "Normal"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </PDFTable>
                  </div>
                ) : null;
              })}
            </Section>

            <HardPageBreak />

            <Section>
              <SectionTitle>10. Scholastic History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>School Type:</strong> {schol.type_of_school || "—"}</PDFCard>
                <PDFCard><strong>Age of Entry:</strong> {schol.age_of_entry || "—"}</PDFCard>
                <PDFCard><strong>Current Class:</strong> {schol.present_class || "—"}</PDFCard>
                <PDFCard><strong>Medium:</strong> {schol.medium_of_instruction?.join(", ") || "—"}</PDFCard>
                <PDFCard><strong>Performance:</strong> {schol.performance || schol.scholastic_performance || "—"}</PDFCard>
                <PDFCard><strong>Regularity:</strong> {schol.regularity?.selected || "—"}</PDFCard>
                <PDFCard><strong>Peer Relations:</strong> {schol.peer_adjustment || schol.peer_group_adjustment || "—"}</PDFCard>
              </PDFGrid>
            </Section>

            <Section>
              <SectionTitle>11. Play & General History</SectionTitle>
              <PDFGrid>
                <PDFCard><strong>Play Behavior:</strong> {play.play_behaviour || "—"}</PDFCard>
                <PDFCard><strong>Treatment History:</strong> {p.treatment_history || "None"}</PDFCard>
                <PDFCard><strong>Dysmorphic Features:</strong> {gen.dysmorphic_features || "None"}</PDFCard>
                <PDFCard><strong>CNS Exam:</strong> {gen.cns_examination || "Normal"}</PDFCard>
              </PDFGrid>
            </Section>
          </ReportWrapper>
        </Container>
      </ThemeProvider>
    );
  }

  // === VIEW: Patient List ===
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>Patient History Records</Header>
        <div style={{ background: "white", padding: "1.5rem", borderRadius: theme.borderRadius.xl, boxShadow: theme.shadows.medium, marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text }}>From Date</label><br />
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: "0.8rem", borderRadius: theme.borderRadius.medium, border: `2px solid ${theme.colors.primaryLight}` }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, color: theme.colors.text }}>To Date</label><br />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: "0.8rem", borderRadius: theme.borderRadius.medium, border: `2px solid ${theme.colors.primaryLight}` }} />
          </div>
<div style={{ position: "relative" }}>
  <label style={{ fontWeight: 600, color: theme.colors.text }}>Search</label><br />

  <input
    type="text"
    placeholder="Search by name / reg no..."
    value={searchText}
    onChange={(e) => handleSearch(e.target.value)}
    style={{
      padding: "0.8rem 2.5rem 0.8rem 0.8rem",
      borderRadius: theme.borderRadius.medium,
      border: `2px solid ${theme.colors.primaryLight}`,
      minWidth: "220px"
    }}
  />

  {searchText && (
    <button
      onClick={() => clearSearch()}
      style={{
        position: "absolute",
        right: "10px",
        top: "40px",
        border: "none",
        background: "transparent",
        color: theme.colors.primary,
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "18px",
        lineHeight: "1"
      }}
    >
      ×
    </button>
  )}
</div>

          <div>
            <Button primary onClick={filterByDate}>Filter</Button>{' '}
            <Button onClick={resetFilter}>Reset</Button>
          </div>
        </div>

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
                  <td><strong>{d.name || "—"}</strong></td>
                  <td>{d.reg_no || "—"}</td>
                  <td>{d.dob || "—"}</td>
                  <td>{d.date_of_assessment || "—"}</td>
                  <td><button onClick={() => setSelectedPatient(p)}>View Full Report</button></td>
                </tr>
              );
            }) : (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem" }}>No records found</td></tr>
            )}
          </tbody>
        </Table>
      </Container>
    </ThemeProvider>
  );
};

export default Historyrecordingsheetreport;