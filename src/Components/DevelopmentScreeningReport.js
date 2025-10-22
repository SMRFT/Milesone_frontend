import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";

// Add some custom CSS to improve styling
const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
    },
    heading: {
        textAlign: "center",
        fontSize: "2rem",
        marginBottom: "1rem",
        color: "#333",
    },
    card: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px",
    },
    textCenter: {
        textAlign: "center",
    },
    textLeft: {
        textAlign: "left",
    },
    paragraph: {
        fontSize: "1.3rem",
        lineHeight: "1.5",
        marginBottom: "0.5rem",
    },
};

const DevelopmentScreeningReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const patient_name = location.state?.patient_name;
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    // Fetch reports from backend
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${Milestonebaseurl}get-tasks/${patient_name}/`);
                setReports(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Error fetching reports");
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // For formatting the age field
    const formatAge = (age) => {
        if (!age) return "N/A"; // Handle case where age is not available

        try {
            const parsedAge = JSON.parse(age.replace(/'/g, '"')); // Parse the string into an object
            const { year, months, days } = parsedAge;

            // Return the formatted string
            return `${year} Years, ${months} Months, and ${days} Days`;
        } catch (error) {
            console.error("Error parsing age:", error);
            return age; // Fallback to the original age value if there was an error
        }
    };

    const handleDownload = () => {
        const doc = new jsPDF();
    
        // Set fonts and styles for the PDF
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black color for text
    
        // Add title
        doc.text("Developmental Screening Report", 105, 20, null, null, "center");
        let yOffset = 30; // Starting Y position
    
        // Loop through the reports and add content for each report
        reports.forEach((report) => {
            // Patient Name Section
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(`Patient Name: ${report.patient_name}`, 20, yOffset);
            yOffset += 10;
    
            // Age, Gender, Chronological Age, Developmental Age, DQ, DQ Classification
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Age: ${formatAge(report.age)}`, 20, yOffset);
            yOffset += 6;
            doc.text(`Gender: ${report.gender}`, 20, yOffset);
            yOffset += 6;
            doc.text(`Chronological Age (CA): ${report.CA}`, 20, yOffset);
            yOffset += 6;
            doc.text(`Developmental Age (DA): ${report.DA}`, 20, yOffset);
            yOffset += 6;
            doc.text(`Developmental Quotient (DQ): ${report.dq_value}`, 20, yOffset);
            yOffset += 6;
            doc.text(`DQ Classification: ${report.dq_classify}`, 20, yOffset);
            yOffset += 10;
    
            // Test Interpretation Section
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Test Interpretation:", 20, yOffset);
            yOffset += 6;
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const interpretation = `On Developmental Screening Test (DST), the child’s developmental Age (DA) is ${report.DA}, Chronological age (CA) is ${report.CA}, and Developmental Quotient (DQ) is ${report.dq_value}, which is suggestive of ${report.dq_classify}.`;
    
            // Split text if it's too long
            const splitText = doc.splitTextToSize(interpretation, 180); // Wrap text within 180mm width
            doc.text(splitText, 20, yOffset);
            yOffset += splitText.length * 6; // Adjust Y offset after adding interpretation
    
            // Add some space between reports
            yOffset += 15;
    
            // Check if we need to add a new page
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 20;
            }
        });
    
        // Save the PDF
        doc.save("development_screening_report.pdf");
    };
    

    const handlePrint = () => {
        // Format data to be printed
        const printData = reports.map((report) => ({
            PatientName: report.patient_name,
            Age: formatAge(report.age),
            Gender: report.gender,
            CA: report.CA,
            DA: report.DA,
            DQ: report.dq_value,
            DQClassification: report.dq_classify,
            TestInterpretation: `On Developmental Screening Test (DST), the child’s developmental Age (DA) is <strong>${report.DA}</strong>, Chronological age(CA) <strong>${report.CA}</strong> and Developmental Quotient (DQ) is <strong>${report.dq_value}</strong>, which is suggestive of <strong>${report.dq_classify}</strong>.`,
        }));

        // Create content in a more structured format
        const printContent = printData.map((report) => `
            <div style="margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 15px;">
                <h2 style="font-size: 20px; margin-bottom: 10px;">Patient Name: ${report.PatientName}</h2>
                <p><strong>Age:</strong> ${report.Age}</p>
                <p><strong>Gender:</strong> ${report.Gender}</p>
                <p><strong>Chronological Age (CA):</strong> ${report.CA}</p>
                <p><strong>Developmental Age (DA):</strong> ${report.DA}</p>
                <p><strong>Developmental Quotient (DQ):</strong> ${report.DQ}</p>
                <p><strong>DQ Classification:</strong> ${report.DQClassification}</p>
                
            
                <p style=" font-size: 18px; margin-top: 20px;">
    <strong style="text-align: center;text-decoration: underline; font-size: 20px; margin-bottom: 10px;">Test Interpretation:</strong><br />
    <span style="display: block; margin-top: 10px; text-align: justify;">${report.TestInterpretation}</span>
</p>


            </div>
        `).join('');

        // Open a new window and print the content
        const printWindow = window.open("", "_blank");
        printWindow.document.write("<html><head><title>Developmental Screening Report</title>");
        printWindow.document.write("<style> body { font-family: Arial, sans-serif; margin: 20px; } h1 { font-size: 24px; text-align: center; margin-bottom: 30px; } p { font-size: 16px; } </style>");
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h1>Developmental Screening Report</h1>");
        printWindow.document.write(printContent);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.print();
    };




    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Development Screening Report</h2>

            {/* Download and Print Icons */}
            {reports.length > 0 && (
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    <IconButton onClick={handleDownload} style={{ background: '#406147' }}>
                        <DownloadIcon style={{ color: 'white' }} />
                    </IconButton>
                    <IconButton onClick={handlePrint} style={{ background: '#406147' }}>
                        <PrintIcon style={{ color: 'white' }} />
                    </IconButton>
                </div>
            )}

            {reports.length === 0 ? (
                <p>No records found.</p>
            ) : (
                reports.map((report, index) => (
                    <div key={index} style={styles.card}>
                        {/* Patient Info */}
                        <div style={styles.textLeft}>
                            <p style={styles.paragraph}><strong>Patient Name:</strong> {report.patient_name}</p>
                            <p style={styles.paragraph}>
                                <strong>Age:</strong>{" "}
                                {(() => {
                                    try {
                                        const parsedAge = JSON.parse(report.age.replace(/'/g, '"'));
                                        return `${parsedAge.year} Years, ${parsedAge.months} Months, and ${parsedAge.days} Days`;
                                    } catch (error) {
                                        return report.age;
                                    }
                                })()}
                            </p>
                            <p style={styles.paragraph}><strong>Gender:</strong> {report.gender}</p>
                        </div>

                        {/* Tasks Table */}
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Age Group</th>
                                    <th style={styles.th}>Task</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(report.tasks || {}).map(([ageGroup, tasks], index) => (
                                    tasks.map((task, taskIndex) => (
                                        <tr key={`${ageGroup}-${taskIndex}`}>
                                            {taskIndex === 0 ? (
                                                <td style={styles.td} rowSpan={tasks.length}>{ageGroup}</td>
                                            ) : null}
                                            <td style={styles.td}>{task.task}</td>
                                            <td style={styles.td}>{task.action}</td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>

                        {/* Display CA, DA, DQ, and DQ Classification */}
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ textAlign: "left", padding: "10px" }}>
                                <p><strong>CA:</strong> {report.CA}</p>
                                <p><strong>DA:</strong> {report.DA}</p>
                                <p><strong>DQ:</strong> {report.dq_value}</p>
                                <p><strong>DQ Classification:</strong> {report.dq_classify}</p>
                            </div>
                        </div>

                        {/* Test Interpretation */}
                        <div style={styles.textCenter}>
                            <p style={styles.paragraph}>
                                <strong style={{ textDecoration: "underline" }}>Test Interpretation:</strong><br />
                                On Developmental Screening Test (DST), the child’s developmental Age (DA)
                                is <strong>{report.DA}</strong>, Chronological age(CA) <strong>{report.CA}</strong> and Developmental
                                Quotient (DQ) is <strong>{report.dq_value}</strong>, which is suggestive of <strong>{report.dq_classify}</strong>.
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default DevelopmentScreeningReport;
