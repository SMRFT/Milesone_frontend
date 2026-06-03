"use client"


import { useState, useEffect } from "react"
import styled from "styled-components"
import { Calendar, Eye, Printer, X } from "lucide-react"
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
    color: #ffffff;
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

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px 32px;
  border-top: 1px solid ${THEME.colors.border};
  background-color: ${THEME.colors.background};
  border-radius: 0 0 ${THEME.borderRadius.large} ${THEME.borderRadius.large};
`

const ListItems = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${THEME.colors.text};
  
  li {
    margin-bottom: 4px;
  }
`

export default function SpeechTherapyReport() {
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
                `${Milestonebaseurl}speech/?from_date=${start}&to_date=${end}`,
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
        const oralPeripheralMechanism = parseJSON(record.oral_peripheral_mechanism) || {}
        const vegetativeSkills = parseJSON(record.vegetative_skills) || {}
        const speechParameters = parseJSON(record.speech_parameters) || {}
        const communicationProfile = parseJSON(record.communication_profile) || {}
        const linguisticProfile = parseJSON(record.linguistic_profile) || {}

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
            pdf.text("SPEECH THERAPY REPORT", pageWidth / 2, y, { align: "center" });

            const titleWidth = pdf.getTextWidth("SPEECH THERAPY REPORT");
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
            pdf.text("Ms. Sivashankari", pageWidth - margin - 60, y);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(...textLight);

            y += 4;
            pdf.text("Dch, DNB (paed)", margin, y);
            pdf.text("M.sc Clinical Psychology, B.sc PJCS", pageWidth - margin - 60, y);

            y += 4;
            pdf.text("Paediatrician and play therapist", margin, y);
            pdf.text("Speech Therapist", pageWidth - margin - 60, y);

            y += 4;
            pdf.text("Milestones Developmental Center", margin, y);
            pdf.text("Milestones Developmental Center", pageWidth - margin - 60, y);
            y += 10;
        };

        addPageHeader();
        addDocumentTitle();

        // Oral Peripheral Mechanism
        if (oralPeripheralMechanism && Object.keys(oralPeripheralMechanism).length > 0) {
            addSectionHeader("Oral Peripheral Mechanism");
            const headers = ["Structure", "Appearance", "Function"];
            const rows = Object.entries(oralPeripheralMechanism).map(([key, val]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
                return [label, val.appearance || "-", val.function || "-"];
            });
            addMilestoneTable(headers, rows);
        }

        // Oral Impression
        if (record.oral_impression) {
            addInlineSection("Oral Impression", record.oral_impression);
        }

        // Vegetative Skills
        if (vegetativeSkills && Object.keys(vegetativeSkills).length > 0) {
            addSectionHeader("Vegetative Skills");
            const headers = ["Skill", "Selected", "Notes"];
            const rows = Object.entries(vegetativeSkills).map(([key, val]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
                return [label, val.selected ? "Yes" : "No", val.notes || "-"];
            });
            addMilestoneTable(headers, rows);
        }

        // Speech Parameters
        if (speechParameters && Object.keys(speechParameters).length > 0) {
            addSectionHeader("Speech Parameters");
            checkPageBreak(30);
            const spRows = Object.entries(speechParameters).map(([key, value]) => [
                key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
                String(value || "—")
            ]);
            autoTable(pdf, {
                head: [["Parameter", "Value"]],
                body: spRows,
                startY: y,
                margin: { left: margin, right: margin },
                styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
                headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
                columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70 } },
                didDrawPage: (data) => { y = data.cursor.y + 6; }
            });
        }

        // Communication Profile
        if (communicationProfile && Object.keys(communicationProfile).length > 0) {
            addSectionHeader("Communication Profile");
            checkPageBreak(30);
            const cpRows = Object.entries(communicationProfile).map(([key, value]) => [
                key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
                String(value || "—")
            ]);
            autoTable(pdf, {
                head: [["Domain", "Status"]],
                body: cpRows,
                startY: y,
                margin: { left: margin, right: margin },
                styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
                headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
                columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70 } },
                didDrawPage: (data) => { y = data.cursor.y + 6; }
            });
        }

        // Linguistic Profile
        if (linguisticProfile && Object.keys(linguisticProfile).length > 0) {
            addSectionHeader("Linguistic Profile");
            checkPageBreak(30);
            const lpRows = Object.entries(linguisticProfile).map(([key, value]) => [
                key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
                String(value || "—")
            ]);
            autoTable(pdf, {
                head: [["Domain", "Level"]],
                body: lpRows,
                startY: y,
                margin: { left: margin, right: margin },
                styles: { fontSize: 8.5, cellPadding: 3, textColor: textDark, lineColor: [180, 180, 180], lineWidth: 0.2 },
                headStyles: { fillColor: bgLight, textColor: textDark, fontStyle: "bold" },
                columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70 } },
                didDrawPage: (data) => { y = data.cursor.y + 6; }
            });
        }

        // Speech Assessment
        if (record.speech_assessment_articulation || record.speech_assessment_other) {
            addSectionHeader("Speech Assessment");
            if (record.speech_assessment_articulation) {
                addInlineSection("Articulation Assessment", record.speech_assessment_articulation);
            }
            if (record.speech_assessment_other) {
                addInlineSection("Other Assessment", record.speech_assessment_other);
            }
        }

        // Final Impression
        if (record.final_impression) {
            addSectionHeader("Summary / Final Impression");
            addSummaryBox(record.final_impression);
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
        pdf.save(`${record.patientName || "Patient"}_Speech_Therapy_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    }

    const renderDetailView = (record) => {
        const oralPeripheralMechanism = parseJSON(record.oral_peripheral_mechanism) || {}
        const vegetativeSkills = parseJSON(record.vegetative_skills) || {}
        const speechParameters = parseJSON(record.speech_parameters) || {}
        const communicationProfile = parseJSON(record.communication_profile) || {}
        const linguisticProfile = parseJSON(record.linguistic_profile) || {}

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
                            <p>{record.assessment_date ? new Date(record.assessment_date).toLocaleDateString() : "N/A"}</p>
                        </DetailField>
                    </DetailGrid>
                </Section>

                {oralPeripheralMechanism && Object.keys(oralPeripheralMechanism).length > 0 && (
                    <Section>
                        <SectionTitle>Oral Peripheral Mechanism</SectionTitle>
                        <Table style={{ marginTop: "16px" }}>
                            <thead>
                                <tr>
                                    <th>Structure</th>
                                    <th>Appearance</th>
                                    <th>Function</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(oralPeripheralMechanism).map(([key, val]) => (
                                    <tr key={key}>
                                        <td>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</strong>
                                        </td>
                                        <td>{val.appearance || "-"}</td>
                                        <td>{val.function || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Section>
                )}

                {record.oral_impression && (
                    <Section>
                        <SectionTitle>Oral Impression</SectionTitle>
                        <DetailGrid>
                            <DetailField className="full-width">
                                <label>Overall Impression</label>
                                <p>{record.oral_impression}</p>
                            </DetailField>
                        </DetailGrid>
                    </Section>
                )}

                {vegetativeSkills && Object.keys(vegetativeSkills).length > 0 && (
                    <Section>
                        <SectionTitle>Vegetative Skills</SectionTitle>
                        <Table style={{ marginTop: "16px" }}>
                            <thead>
                                <tr>
                                    <th>Skill</th>
                                    <th>Selected</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(vegetativeSkills).map(([key, val]) => (
                                    <tr key={key}>
                                        <td>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</strong>
                                        </td>
                                        <td>{val.selected ? "Yes" : "No"}</td>
                                        <td>{val.notes || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Section>
                )}

                {speechParameters && Object.keys(speechParameters).length > 0 && (
                    <Section>
                        <SectionTitle>Speech Parameters</SectionTitle>
                        <DetailGrid>
                            {Object.entries(speechParameters).map(([key, value]) => (
                                <DetailField key={key}>
                                    <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</label>
                                    <p>{value}</p>
                                </DetailField>
                            ))}
                        </DetailGrid>
                    </Section>
                )}

                {communicationProfile && Object.keys(communicationProfile).length > 0 && (
                    <Section>
                        <SectionTitle>Communication Profile</SectionTitle>
                        <DetailGrid>
                            {Object.entries(communicationProfile).map(([key, value]) => (
                                <DetailField key={key}>
                                    <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</label>
                                    <p>{value}</p>
                                </DetailField>
                            ))}
                        </DetailGrid>
                    </Section>
                )}

                {linguisticProfile && Object.keys(linguisticProfile).length > 0 && (
                    <Section>
                        <SectionTitle>Linguistic Profile</SectionTitle>
                        <DetailGrid>
                            {Object.entries(linguisticProfile).map(([key, value]) => (
                                <DetailField key={key} className={key === "notes" ? "full-width" : ""}>
                                    <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</label>
                                    <p>{value}</p>
                                </DetailField>
                            ))}
                        </DetailGrid>
                    </Section>
                )}

                {(record.speech_assessment_articulation || record.speech_assessment_other) && (
                    <Section>
                        <SectionTitle>Speech Assessment</SectionTitle>
                        <DetailGrid>
                            {record.speech_assessment_articulation && (
                                <DetailField className="full-width">
                                    <label>Articulation Assessment</label>
                                    <p>{record.speech_assessment_articulation}</p>
                                </DetailField>
                            )}
                            {record.speech_assessment_other && (
                                <DetailField className="full-width">
                                    <label>Other Assessment</label>
                                    <p>{record.speech_assessment_other}</p>
                                </DetailField>
                            )}
                        </DetailGrid>
                    </Section>
                )}

                {record.final_impression && (
                    <Section>
                        <SectionTitle>Final Impression</SectionTitle>
                        <DetailGrid>
                            <DetailField className="full-width">
                                <label>Clinical Summary</label>
                                <p>{record.final_impression}</p>
                            </DetailField>
                        </DetailGrid>
                    </Section>
                )}
            </>
        )
    }

    return (
        <Container>
            <PageHeader>
                <PageTitle>Speech Therapy Assessment Report</PageTitle>
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
                    <p>Select dates and click "Generate Report" to view patient data</p>
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
                                <td>{item.assessment_date ? new Date(item.assessment_date).toLocaleDateString() : "-"}</td>
                                <td>
                                    <ActionButtons>
                                        <Button className="primary" onClick={() => handleView(item)} title="View Details">
                                            <Eye size={16} />
                                            View
                                        </Button>
                                        <Button className="primary" onClick={() => handlePrint(item)} title="Print Report">
                                            <Printer size={16} />
                                            Print
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
                            <h2>Speech Therapy Report - {selectedRecord.patientName}</h2>
                            <CloseButton onClick={() => setShowModal(false)}>
                                X
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>{renderDetailView(selectedRecord)}</ModalBody>
                        <ModalFooter>
                            <Button className="secondary" onClick={() => setShowModal(false)}>
                                Close
                            </Button>
                            <Button
                                className="primary"
                                onClick={() => {
                                    handlePrint(selectedRecord)
                                    setShowModal(false)
                                }}
                            >
                                <Printer size={16} />
                                Print Report
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    )
}
