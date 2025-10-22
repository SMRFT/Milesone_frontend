import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from 'date-fns';

const FetchDevelopmentScreeningReport = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${Milestonebaseurl}get-tasks/`);
                console.log("Full API Response Data:", response.data); // Inspect the API response
                setReports(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Error fetching reports");
                setLoading(false);
            }
        };
    
        fetchReports();
    }, []);

    const formatAge = (age) => {
        if (!age) {
            return "Age not available";
        }
    
        // Check if `age` is a string and parse it into an object
        if (typeof age === "string") {
            try {
                age = JSON.parse(age.replace(/'/g, '"')); // Replace single quotes with double quotes for valid JSON
            } catch (err) {
                console.error("Failed to parse age:", age);
                return "Age not available";
            }
        }
    
        // Ensure `age` is an object
        if (typeof age !== "object") {
            return "Age not available";
        }
    
        const years = age.year ?? 0;
        const months = age.months ?? 0;
        const days = age.days ?? 0;
    
        return `${years} ${years === 1 ? "Year" : "Years"}, ${months} ${months === 1 ? "Month" : "Months"}, and ${days} ${days === 1 ? "Day" : "Days"}`;
    };

    const handleGoReport = (report) => {
            navigate(`/DevelopmentScreeningReport`, { state: { patient_name: report.patient_name } });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'MM/dd/yyyy'); // Customize this format as needed
      };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Development Screening Reports</h2>
            {reports.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report, index) => {
                            console.log("Processing Report:", report); // Debug individual report
                            return (
                                <tr key={index}>
                                    <td>{formatDate(report.date)}</td>
                                    <td>{report.patient_name}</td>
                                    <td>{formatAge(report.age)}</td>
                                    <td>
                                        <button
                                            onClick={() => handleGoReport(report)}
                                        >
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

export default FetchDevelopmentScreeningReport;
