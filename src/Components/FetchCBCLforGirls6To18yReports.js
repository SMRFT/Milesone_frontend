import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import apiRequest from "./apiRequest";

const FetchCBCLforGirls6To18yReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    const navigate = useNavigate();

    const fetchReports = async (start = "", end = "") => {
        setLoading(true);
        setError(null);
        try {
            let url = `${Milestonebaseurl}get-cbcl/`;
            const params = [];
            if (start) params.push(`from_date=${encodeURIComponent(start)}`);
            if (end) params.push(`to_date=${encodeURIComponent(end)}`);
            if (params.length > 0) {
                url += `?${params.join("&")}`;
            }

            const response = await apiRequest(url, "GET");
            if (response && response.success) {
                setReports(response.data || []);
            } else {
                setError(response?.error || "Error fetching CBCL reports");
            }
        } catch (err) {
            setError(err.message || "Error fetching CBCL reports");
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchReports();
    }, [Milestonebaseurl]);

    const handleFilter = () => {
        fetchReports(fromDate, toDate);
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        fetchReports("", "");
    };

    const formatAge = (age) => {
        if (!age) {
            return "Age not available";
        }

        if (typeof age === "string") {
            try {
                age = JSON.parse(age.replace(/'/g, '"'));
            } catch (err) {
                return "Age not available";
            }
        }

        if (typeof age !== "object" || age === null) {
            return "Age not available";
        }

        const years = age.years ?? age.year ?? 0;
        const months = age.months ?? 0;
        const days = age.days ?? 0;

        return `${years} ${years === 1 ? "Year" : "Years"}, ${months} ${months === 1 ? "Month" : "Months"}, and ${days} ${days === 1 ? "Day" : "Days"}`;
    };

    const handleGoReport = (report) => {
        if (report?.childName) {
            navigate(`/CBCLforGirls6To18yReports?childName=${encodeURIComponent(report.childName)}`, { state: { childName: report.childName } });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No Date Available";

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        return format(date, 'dd/MM/yyyy');
    };

    // Client-side date filter as fallback
    const filteredReports = reports.filter((report) => {
        if (!report.dateOfAssessment) return true;
        const assessmentTime = new Date(report.dateOfAssessment).getTime();
        if (isNaN(assessmentTime)) return true;

        if (fromDate) {
            const start = new Date(fromDate).setHours(0, 0, 0, 0);
            if (assessmentTime < start) return false;
        }

        if (toDate) {
            const end = new Date(toDate).setHours(23, 59, 59, 999);
            if (assessmentTime > end) return false;
        }

        return true;
    });

    return (
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Segoe UI, sans-serif" }}>
            <h2 style={{ color: "#406147", marginBottom: "20px" }}>CBCL Reports for Girls (6-18 Years)</h2>

            {/* Date Range Filter Controls */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "15px",
                    backgroundColor: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "25px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#495057" }}>From Date (Assessment):</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={{ padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#495057" }}>To Date (Assessment):</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={{ padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px" }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", marginTop: "20px" }}>
                    <button
                        onClick={handleFilter}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#406147",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Filter
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>Loading CBCL reports...</div>
            ) : error ? (
                <div style={{ padding: "15px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px" }}>
                    Error: {error}
                </div>
            ) : filteredReports.length === 0 ? (
                <p>No records found matching the selected date criteria.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="10">
                    <thead>
                        <tr style={{ backgroundColor: "#406147", color: "white" }}>
                            <th>Date of Assessment</th>
                            <th>Child Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((report, index) => (
                            <tr key={report._id || index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa" }}>
                                <td>{formatDate(report.dateOfAssessment)}</td>
                                <td style={{ fontWeight: "bold" }}>{report.childName}</td>
                                <td>{formatAge(report.age)}</td>
                                <td>{report.gender}</td>
                                <td>
                                    <button
                                        onClick={() => handleGoReport(report)}
                                        style={{
                                            padding: "6px 14px",
                                            backgroundColor: "#406147",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Go Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FetchCBCLforGirls6To18yReports;
