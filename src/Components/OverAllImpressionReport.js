import React, { useEffect, useState } from "react";
import apiRequest from "./apiRequest"; // Ensure this path is correct
import { jsPDF } from "jspdf";
import styled, { ThemeProvider, keyframes } from "styled-components";
import autoTable from 'jspdf-autotable';
import mdcLogo from "./Images/mdcLogo.png"; // Ensure this returns the path or base64 based on your bundler

// --- ANIMATIONS & THEME ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const theme = {
  colors: {
    primary: "#406147",
    primaryLight: "#6b8a72",
    primaryDark: "#2d4532",
    background: "#f4f7f6",
    surface: "#ffffff",
    text: "#2c3e50",
    textLight: "#7f8c8d",
    borderLight: "#e2e8f0",
    accent: "#3f37c9",
    highlight: "#e8f5e9",
  },
  shadows: {
    soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
    card: "0 2px 8px rgba(0,0,0,0.04)",
  },
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
  },
  breakpoints: {
    mobile: "768px",
  },
};

// --- STYLED COMPONENTS ---

const Container = styled.div`
  padding: 1rem;
  background: ${p => p.theme.colors.background};
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
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
  }
`;

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
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${p => p.theme.colors.textLight};
    text-transform: uppercase;
  }

  input {
    padding: 0.8rem;
    border-radius: ${p => p.theme.borderRadius.sm};
    border: 1px solid ${p => p.theme.colors.borderLight};
    background: #f8fafc;
    &:focus { outline: none; border-color: ${p => p.theme.colors.primary}; }
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: ${p => p.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.primary ? p.theme.colors.primary : "transparent"};
  color: ${p => p.primary ? "white" : p.theme.colors.textLight};
  border: ${p => p.primary ? "none" : `1px solid ${p.theme.colors.borderLight}`};
  
  &:hover {
    transform: translateY(-2px);
    background: ${p => p.primary ? p.theme.colors.primaryDark : "#f1f1f1"};
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: ${p => p.theme.borderRadius.lg};
  box-shadow: ${p => p.theme.shadows.soft};
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  
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
    border-bottom: 1px solid ${p => p.theme.colors.borderLight};
  }
  tr:hover { background: #fdfdfd; }
`;

// --- DETAIL VIEW STYLES ---

const DetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: ${p => p.theme.borderRadius.lg};
  box-shadow: ${p => p.theme.shadows.soft};
  animation: ${fadeIn} 0.3s ease-out;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background: rgba(244, 247, 246, 0.95);
  backdrop-filter: blur(5px);
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  z-index: 10;
`;

const SectionHeader = styled.h3`
  font-size: 1.2rem;
  color: ${p => p.theme.colors.primaryDark};
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${p => p.theme.colors.primaryLight};
  margin: 2rem 0 1rem 0;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media (min-width: ${p => p.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const DetailItem = styled.div`
  background: #f9f9f9;
  padding: 1rem;
  border-radius: ${p => p.theme.borderRadius.md};
  
  label {
    display: block;
    font-size: 0.75rem;
    color: ${p => p.theme.colors.textLight};
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  span {
    font-weight: 600;
    color: ${p => p.theme.colors.primaryDark};
    font-size: 1rem;
  }
`;

const ImpressionBox = styled.div`
  background: ${p => p.theme.colors.highlight};
  border: 1px solid ${p => p.theme.colors.primaryLight};
  padding: 1.5rem;
  border-radius: ${p => p.theme.borderRadius.md};
  font-size: 1.05rem;
  line-height: 1.6;
  white-space: pre-wrap;
  color: ${p => p.theme.colors.primaryDark};
`;

const OverAllImpressionReport = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await apiRequest(`${process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL}GetHistoryRecordingSheet/`, "GET");
      const data = Array.isArray(res?.data) ? res.data : [];
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  const filterByDate = () => {
    const filtered = patients.filter(p => {
      const date = new Date(p.identification_data?.date_of_assessment);
      return date >= new Date(fromDate) && date <= new Date(toDate);
    });
    setFilteredPatients(filtered);
  };

  const handleSearch = (val) => {
    setSearchText(val);
    if (!val) {
      setFilteredPatients(patients);
      return;
    }
    const lower = val.toLowerCase();
    const filtered = patients.filter(p => {
      const id = p.identification_data || {};
      return (
        id.name?.toLowerCase().includes(lower) ||
        id.reg_no?.toLowerCase().includes(lower)
      );
    });
    setFilteredPatients(filtered);
  };

  const resetFilter = () => {
    setFromDate(new Date().toISOString().split("T")[0]);
    setToDate(new Date().toISOString().split("T")[0]);
    setSearchText("");
    setFilteredPatients(patients);
  };

// --- UPDATED PDF GENERATION WITH NEW HEADER ---
  const downloadPDF = () => {
    if (!selectedPatient) return;
    const p = selectedPatient;
    const id = p.identification_data || {};

    // 1. Define Content Sections
    const contentSections = [
      {
        title: "PRESENTING COMPLAINTS",
        body: p.presenting_complaints || "No complaints recorded.",
      },
      {
        title: "OVERALL IMPRESSION / SUMMARY",
        body: p.OverAllImpression || "No impression recorded.",
      },
      {
        title: "RECOMMENDATION",
        body: p.Recommendation || "No specific recommendations recorded.",
      },
      {
        title: "OVERALL SUMMARY",
        body: p.OverAllSummary || "No summary recorded.",
      },
    ];

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 0;
    let pageNum = 1;

    // Colors
    const primary = [64, 97, 71]; // Green for Section Headers
    const textDark = [51, 51, 51]; // #333 for Header Text

    // --- Helper: Add New Letterhead Header ---
    const addPageHeader = () => {
      // 1. Logo (Left Side)
      // Ensure 'mdcLogo' is imported/defined as a Base64 string or valid URL
      if (typeof mdcLogo !== "undefined" && mdcLogo) {
        try {
          // x, y, width, height (Adjust size as needed)
          pdf.addImage(mdcLogo, "PNG", margin, 10, 65, 25);
        } catch (e) {
          console.warn("Logo not loaded:", e);
        }
      }

      // 2. Contact Details (Right of Logo)
      const textX = margin + 100; // Margin + Logo Width + Gap
      let textY = 15;

      // Title
      pdf.setFontSize(14); // 14pt (~18px)
      pdf.setTextColor(...textDark); // #333
      pdf.setFont("helvetica", "bold");
      pdf.text("Milestone Development Center", textX, textY);

      // Address Block
      pdf.setFontSize(10); // 10pt
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

      y = 50; // Set Y position for body content
    };

    // --- Helper: Add Page Footer ---
    const addPageFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");

      const dateStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      pdf.text(`Generated: ${dateStr}`, margin, footerY);
      pdf.text(
        `Patient: ${id.name || "N/A"} | Reg: ${id.reg_no || "N/A"}`,
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
      pdf.text(`Page ${pageNum}`, pageWidth - margin, footerY, {
        align: "right",
      });
    };

    // --- Helper: Add New Page ---
    const addNewPage = () => {
      addPageFooter();
      pdf.addPage();
      pageNum++;
      addPageHeader();
    };

    // --- Helper: Print Section ---
    const printSection = (title, bodyText) => {
      if (y + 15 > pageHeight - 25) addNewPage();

      // Section Title
      pdf.setFontSize(12);
      pdf.setTextColor(...primary);
      pdf.setFont("helvetica", "bold");
      pdf.text(title.toUpperCase(), margin, y);

      // Underline
      pdf.setDrawColor(...primary);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;

      // Body Text
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");

      const splitText = pdf.splitTextToSize(bodyText, contentWidth);

      splitText.forEach((line) => {
        if (y + 6 > pageHeight - 20) {
          addNewPage();
        }
        pdf.text(line, margin, y);
        y += 5; // Line spacing
      });

      y += 8; // Spacing after section
    };

    // --- EXECUTE GENERATION ---

    // 1. First Page Header
    addPageHeader();

    // 2. Report Title
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text("CLINICAL IMPRESSION REPORT", pageWidth / 2, y + 5, {
      align: "center",
    });
    y += 15;

    // 3. Patient Details Table
    autoTable(pdf, {
      startY: y,
      head: [["Patient Details", ""]],
      body: [
        ["Name:", id.name || "—"],
        ["Reg No:", id.reg_no || "—"],
        ["Age / Sex:", id.age_sex || "—"],
        ["Date of Assessment:", id.date_of_assessment || "—"],
        ["Informant:", id.informant_a || "—"],
      ],
      theme: "plain", // Cleaner look for letterhead
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", width: 45 },
      },
      margin: { left: margin, right: margin },
    });

    y = pdf.lastAutoTable.finalY + 10;

    // 4. Print All Sections
    contentSections.forEach((section) => {
      printSection(section.title, section.body);
    });

    // 5. Final Footer
    addPageFooter();

    pdf.save(`${id.name}_Impression_Report.pdf`);
  };

  // === RENDER DETAIL VIEW ===
  if (selectedPatient) {
    const id = selectedPatient.identification_data || {};
    
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <StickyHeader>
            <Button onClick={() => setSelectedPatient(null)}>← Back to List</Button>
            <Button primary onClick={downloadPDF}>Download Report PDF</Button>
          </StickyHeader>

          <DetailContainer>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ color: theme.colors.primary, margin: 0 }}>Clinical Impression Report</h2>
              <p style={{ color: theme.colors.textLight }}>Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <SectionHeader>Patient Identification</SectionHeader>
            <DetailGrid>
              <DetailItem>
                <label>Patient Name</label>
                <span>{id.name || "—"}</span>
              </DetailItem>
              <DetailItem>
                <label>Registration No</label>
                <span>{id.reg_no || "—"}</span>
              </DetailItem>
              <DetailItem>
                <label>Age / Sex</label>
                <span>{id.age_sex || "—"}</span>
              </DetailItem>
              <DetailItem>
                <label>Date of Assessment</label>
                <span>{id.date_of_assessment || "—"}</span>
              </DetailItem>
              <DetailItem>
                <label>Informant</label>
                <span>{id.informant_a || "—"}</span>
              </DetailItem>
            </DetailGrid>

            <SectionHeader>Presenting Complaints</SectionHeader>
            <ImpressionBox>
              {selectedPatient.presenting_complaints || "No specific impression recorded for this patient."}
            </ImpressionBox>
            <SectionHeader>Overall Impression</SectionHeader>
            <ImpressionBox>
              {selectedPatient.OverAllImpression || "No specific impression recorded for this patient."}
            </ImpressionBox>
            <SectionHeader>Recommendation</SectionHeader>
            <ImpressionBox>
              {selectedPatient.Recommendation || "No specific Recommendation recorded for this patient."}
            </ImpressionBox>
            <SectionHeader>Overall Summary</SectionHeader>
            <ImpressionBox>
              {selectedPatient.OverAllSummary || "No specific Summary recorded for this patient."}
            </ImpressionBox>
                        
          </DetailContainer>
        </Container>
      </ThemeProvider>
    );
  }

  // === RENDER LIST VIEW ===
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>Overall Impression Reports</Header>

        <ControlsContainer>
          <InputGroup>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </InputGroup>
          <InputGroup style={{ flex: 1.5 }}>
            <label>Search Patient</label>
            <input 
              type="text" 
              placeholder="Search by Name or Reg No..." 
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
            />
          </InputGroup>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <Button primary onClick={filterByDate}>Filter</Button>
            <Button onClick={resetFilter}>Reset</Button>
          </div>
        </ControlsContainer>

        <TableWrapper>
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>DOB</th>
                  <th>Assessment Date</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p, i) => {
                    const id = p.identification_data || {};
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{id.name}</td>
                        <td>{id.reg_no}</td>
                        <td>{id.dob || "—"}</td>
                        <td>{id.date_of_assessment}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Button 
                            style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }} 
                            onClick={() => setSelectedPatient(p)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: theme.colors.textLight }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </TableWrapper>
      </Container>
    </ThemeProvider>
  );
};

export default OverAllImpressionReport;