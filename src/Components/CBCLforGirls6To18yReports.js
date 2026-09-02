import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import apiRequest from "./apiRequest";

const CBCLforGirls6To18yReports = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialChildName = location.state?.childName || queryParams.get("childName") || "";
    
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

    const [allReports, setAllReports] = useState([]);
    const [selectedChildName, setSelectedChildName] = useState(initialChildName);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all CBCL reports to allow selection and fallback
    useEffect(() => {
        const fetchAllCBCLReports = async () => {
            setLoading(true);
            try {
                const response = await apiRequest(`${Milestonebaseurl}get-cbcl/`, "GET");
                if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
                    setAllReports(response.data);
                    
                    // Determine which child to show
                    let targetChild = initialChildName;
                    if (!targetChild && response.data.length > 0) {
                        targetChild = response.data[0].childName || "";
                    }

                    if (targetChild) {
                        setSelectedChildName(targetChild);
                        const matchedReport = response.data.find(
                            (r) => r.childName && r.childName.toLowerCase() === targetChild.toLowerCase()
                        );
                        setReportData(matchedReport || response.data[0]);
                        setError(null);
                    } else {
                        setError("No child reports available.");
                    }
                } else {
                    setError("No CBCL reports found in the system.");
                }
            } catch (err) {
                console.error("Error fetching CBCL reports:", err);
                setError("Error fetching reports from server.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllCBCLReports();
    }, [Milestonebaseurl, initialChildName]);

    // Handle dropdown selection change
    const handleChildSelectChange = (e) => {
        const childName = e.target.value;
        setSelectedChildName(childName);
        if (childName && allReports.length > 0) {
            const matchedReport = allReports.find(
                (r) => r.childName && r.childName.toLowerCase() === childName.toLowerCase()
            );
            setReportData(matchedReport || null);
            // Update URL search param for consistency
            navigate(`/CBCLforGirls6To18yReports?childName=${encodeURIComponent(childName)}`, {
                replace: true,
                state: { childName },
            });
        }
    };

    // PDF Download Handler using html2pdf
    const handleDownloadPDF = () => {
        const reportElement = document.getElementById("cbcl-report-content");
        if (!reportElement) return;

        setIsGeneratingPDF(true);

        const childNameClean = (reportData?.childName || selectedChildName || "Child").replace(/[^a-zA-Z0-9_-]/g, "_");
        const options = {
            margin: 10,
            filename: `CBCL_Report_${childNameClean}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        html2pdf()
            .set(options)
            .from(reportElement)
            .save()
            .then(() => {
                setIsGeneratingPDF(false);
            })
            .catch((err) => {
                console.error("PDF Generation error:", err);
                setIsGeneratingPDF(false);
                alert("Error downloading PDF");
            });
    };

    // Function to format date as dd/MM/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return format(date, "dd/MM/yyyy");
    };

    // Function to format age from JSON format or string
    const formatAge = (age) => {
        if (!age) return "Age not available";
        let parsed = age;
        if (typeof age === "string") {
            try {
                parsed = JSON.parse(age.replace(/'/g, '"'));
            } catch (e) {
                return age;
            }
        }
        if (typeof parsed !== "object" || parsed === null) return "Age not available";

        const years = parsed.years ?? parsed.year ?? 0;
        const months = parsed.months ?? 0;
        const days = parsed.days ?? 0;
        return `${years} ${years === 1 ? "Year" : "Years"}, ${months} ${months === 1 ? "Month" : "Months"}, ${days} ${days === 1 ? "Day" : "Days"}`;
    };

    // Helper to calculate mean performance from table7
    const getMeanPerformance = (table7) => {
        if (!table7) return 0;
        if (table7.maxPerformance !== undefined && table7.maxPerformance !== null && table7.maxPerformance !== "") {
            return parseFloat(table7.maxPerformance) || 0;
        }
        const perfKeys = Object.keys(table7).filter((k) => k.startsWith("performance"));
        if (perfKeys.length > 0) {
            const sum = perfKeys.reduce((acc, k) => acc + (parseFloat(table7[k]) || 0), 0);
            return Math.round((sum / perfKeys.length) * 100) / 100;
        }
        return 0;
    };

    // Function to calculate the total score for relevant tables (I, II, IV)
    const calculateTotal = () => {
        if (!reportData) return 0;
        let total = 0;
        const relevantTables = ["table1", "table2", "table4"];

        relevantTables.forEach((tableName) => {
            const table = reportData[tableName];
            if (table) {
                total += parseFloat(table.A || 0) + parseFloat(table.B || 0);
            }
        });

        return total;
    };

    // Function to calculate total score for the "Social" table (III, V, VI)
    const calculateSocialTotal = () => {
        if (!reportData) return 0;
        let total = 0;
        const socialTables = ["table3", "table5", "table6"];

        socialTables.forEach((tableName) => {
            const table = reportData[tableName];
            if (table) {
                total += parseFloat(table.A || 0) + parseFloat(table.B || 0);
            }
        });

        return total;
    };

    // Function to calculate the total score for Social Table VII
    const calculateSocialVII = () => {
        if (!reportData) return 0;
        let total = 0;
        const table7 = reportData.table7 || {};

        const meanPerf = getMeanPerformance(table7);
        total += meanPerf;
        total += parseFloat(table7.specialClass || 0);
        total += parseFloat(table7.repeatedGrade || 0);
        total += parseFloat(table7.schoolProblems || 0);

        return Math.round(total * 100) / 100;
    };

    if (loading) {
        return (
            <div style={{ padding: "30px", textAlign: "center" }}>
                <p>Loading CBCL Report...</p>
            </div>
        );
    }

    // Unique list of children for dropdown
    const uniqueChildren = Array.from(
        new Set(allReports.map((r) => r.childName).filter(Boolean))
    );

    return (
        <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            {/* Top Navigation & Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <button
                    onClick={() => navigate("/FetchCBCLforGirls6To18yReports")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#406147",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    &larr; Back to Reports List
                </button>



                <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF || !reportData}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: isGeneratingPDF ? "#6c757d" : "#406147",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isGeneratingPDF || !reportData ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                </button>
            </div>

            {error && !reportData ? (
                <div style={{ padding: "20px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "6px", textAlign: "center" }}>
                    <p><strong>Notice:</strong> {error}</p>
                    <p style={{ marginTop: "10px" }}>
                        Please select a valid child or check <a href="/milestone/FetchCBCLforGirls6To18yReports">CBCL Reports List</a>.
                    </p>
                </div>
            ) : (
                <div id="cbcl-report-content" style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ color: "#406147", borderBottom: "2px solid #406147", paddingBottom: "8px", marginTop: 0 }}>
                        CBCL Report for {reportData?.childName || selectedChildName || "Child"}
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px", background: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                        <div><strong>Child Name:</strong> {reportData?.childName || selectedChildName}</div>
                        <div><strong>Age:</strong> {reportData?.age ? formatAge(reportData.age) : "N/A"}</div>
                        <div><strong>Gender:</strong> {reportData?.gender || "N/A"}</div>
                        <div><strong>Assessment Date:</strong> {formatDate(reportData?.dateOfAssessment)}</div>
                    </div>

                    {/* Section 1: Activities */}
                    <h3 style={{ color: "#333", marginTop: "20px" }}>I. Activities & Competence Scores:</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px" }} border="1" cellPadding="8">
                        <thead>
                            <tr style={{ backgroundColor: "#f1f3f5" }}>
                                <th style={{ width: "10%" }}>Section</th>
                                <th>Description</th>
                                <th style={{ width: "20%" }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Table I (Sports) */}
                            {reportData?.table1 && (
                                <React.Fragment>
                                    <tr>
                                        <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>I</td>
                                        <td>A. Number of sports</td>
                                        <td>{reportData.table1.A ?? 0}</td>
                                    </tr>
                                    <tr>
                                        <td>B. Mean of participation and skill in sports</td>
                                        <td>{reportData.table1.B ?? 0}</td>
                                    </tr>
                                </React.Fragment>
                            )}

                            {/* Table II (Other Activities) */}
                            {reportData?.table2 && (
                                <React.Fragment>
                                    <tr>
                                        <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>II</td>
                                        <td>A. Number of other activities</td>
                                        <td>{reportData.table2.A ?? 0}</td>
                                    </tr>
                                    <tr>
                                        <td>B. Mean of participation and skill in activities</td>
                                        <td>{reportData.table2.B ?? 0}</td>
                                    </tr>
                                </React.Fragment>
                            )}

                            {/* Table IV (Jobs) */}
                            {reportData?.table4 && (
                                <React.Fragment>
                                    <tr>
                                        <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>IV</td>
                                        <td>A. Number of jobs</td>
                                        <td>{reportData.table4.A ?? 0}</td>
                                    </tr>
                                    <tr>
                                        <td>B. Mean job quality</td>
                                        <td>{reportData.table4.B ?? 0}</td>
                                    </tr>
                                </React.Fragment>
                            )}

                            <tr style={{ backgroundColor: "#e9ecef", fontWeight: "bold" }}>
                                <td colSpan="2">Total Activities Score:</td>
                                <td>{calculateTotal()}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Section 2: Social */}
                    <h3 style={{ color: "#333", marginTop: "20px" }}>II. Social Competence:</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px" }} border="1" cellPadding="8">
                        <thead>
                            <tr style={{ backgroundColor: "#f1f3f5" }}>
                                <th style={{ width: "10%" }}>Section</th>
                                <th>Description</th>
                                <th style={{ width: "20%" }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>III</td>
                                <td>A. Number of organizations</td>
                                <td>{reportData?.table3?.A ?? 0}</td>
                            </tr>
                            <tr>
                                <td>B. Mean of participation in organizations</td>
                                <td>{reportData?.table3?.B ?? 0}</td>
                            </tr>
                            <tr>
                                <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>V</td>
                                <td>A. Number of friends</td>
                                <td>{reportData?.table5?.A ?? 0}</td>
                            </tr>
                            <tr>
                                <td>B. Frequency of contacts with friends</td>
                                <td>{reportData?.table5?.B ?? 0}</td>
                            </tr>
                            <tr>
                                <td rowSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>VI</td>
                                <td>A. Behavior with others</td>
                                <td>{reportData?.table6?.A ?? 0}</td>
                            </tr>
                            <tr>
                                <td>B. Behavior alone</td>
                                <td>{reportData?.table6?.B ?? 0}</td>
                            </tr>
                            <tr style={{ backgroundColor: "#e9ecef", fontWeight: "bold" }}>
                                <td colSpan="2">Total Social Score:</td>
                                <td>{calculateSocialTotal()}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Section 3: School */}
                    <h3 style={{ color: "#333", marginTop: "20px" }}>III. School Performance:</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px" }} border="1" cellPadding="8">
                        <thead>
                            <tr style={{ backgroundColor: "#f1f3f5" }}>
                                <th style={{ width: "10%" }}>Section</th>
                                <th>Description</th>
                                <th style={{ width: "20%" }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: "center", fontWeight: "bold" }}>VII.1</td>
                                <td>Mean performance</td>
                                <td>{getMeanPerformance(reportData?.table7)}</td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "center", fontWeight: "bold" }}>VII.2</td>
                                <td>Special class</td>
                                <td>{reportData?.table7?.specialClass ?? "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "center", fontWeight: "bold" }}>VII.3</td>
                                <td>Repeated grade</td>
                                <td>{reportData?.table7?.repeatedGrade ?? "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "center", fontWeight: "bold" }}>VII.4</td>
                                <td>School problems</td>
                                <td>{reportData?.table7?.schoolProblems ?? "N/A"}</td>
                            </tr>
                            <tr style={{ backgroundColor: "#e9ecef", fontWeight: "bold" }}>
                                <td colSpan="2">Total School Score:</td>
                                <td>{calculateSocialVII()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CBCLforGirls6To18yReports;
