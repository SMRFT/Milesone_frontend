import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from 'date-fns';

const FetchCBCLforGirls6To18yReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${Milestonebaseurl}get-cbcl/`);
                console.log("Full API Response Data:", response.data); // Debug API response
                setReports(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Error fetching CBCL reports");
                setLoading(false);
            }
        };
    
        fetchReports();
    }, []);
    
    const formatAge = (age) => {
        if (!age) {
            return "Age not available";
        }
    
        // Parse age if it's a string
        if (typeof age === "string") {
            try {
                age = JSON.parse(age.replace(/'/g, '"'));
            } catch (err) {
                console.error("Failed to parse age:", age);
                return "Age not available";
            }
        }
    
        if (typeof age !== "object") {
            return "Age not available";
        }
    
        const years = age.year ?? 0;
        const months = age.months ?? 0;
        const days = age.days ?? 0;
    
        return `${years} ${years === 1 ? "Year" : "Years"}, ${months} ${months === 1 ? "Month" : "Months"}, and ${days} ${days === 1 ? "Day" : "Days"}`;
    };

    const handleGoReport = (report) => {
        navigate(`/CBCLforGirls6To18yReports`, { state: { childName: report.childName } });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const formatDate = (dateString) => {
        if (!dateString) return "No Date Available"; // Handle missing date
    
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateString); // Debugging
            return "Invalid Date"; // Handle invalid dates
        }
    
        return format(date, 'MM/dd/yyyy'); // Format valid dates
    };
    

    return (
        <div style={{ padding: "20px" }}>
            <h2>CBCL Reports for Girls (6-18 Years)</h2>
            {reports.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report, index) => {
                            console.log("Processing Report:", report); // Debug individual report
                            return (
                                <tr key={index}>
                                    <td>{formatDate(report.dateOfAssessment)}</td>
                                    <td>{report.childName}</td>
                                    <td>{formatAge(report.age)}</td>
                                    <td>{report.gender}</td>
                                    <td>
                                        <button onClick={() => handleGoReport(report)}>
                                            Go Report
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FetchCBCLforGirls6To18yReports;
