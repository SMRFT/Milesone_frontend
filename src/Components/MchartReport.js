import React, { useState, useEffect } from "react";
import axios from "axios";

const MChartReport = ({ registration_number}) => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    // Fetch M-CHAT-R response by registration number
    axios
      .get(`${Milestonebaseurl}get-mchat/${encodeURIComponent(registration_number)}/`)
      .then((response) => {
        setReportData(response.data);
      })
      .catch((err) => {
        setError("Failed to fetch the M-CHAT-R report.");
        console.error(err);
      });
  }, [registration_number]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!reportData) {
    return <p>Loading...</p>;
  }

  const { patient_name, age, sex, score, riskLevel } = reportData;

  return (
    <div className="report-container">
      <h1>M-CHAT-R Report</h1>
      <p>
        <strong>Patient Name:</strong> {patient_name}
      </p>
      <p>
        <strong>Age:</strong> {age}
      </p>
      <p>
        <strong>Sex:</strong> {sex}
      </p>
      <p>
        <strong>Score:</strong> {score} out of 20
      </p>
      <p>
        <strong>Risk Level:</strong> {riskLevel}
      </p>
      <div className="report-summary">
        <p>
          On M-CHAT-R, the child scored <strong>{score}</strong> out of 20 and is determined
          to be at <strong>{riskLevel}</strong> for Autism. (Note: The M-CHAT-R does not
          diagnose autism; it is a screener to identify risk factors.)
        </p>
      </div>
    </div>
  );
};

export default MChartReport;
