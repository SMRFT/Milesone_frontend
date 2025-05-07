import React, { useEffect, useState } from 'react';
import './ChildLanguageReport.css'; // Import the CSS file for styling
import * as XLSX from 'xlsx'; // Import xlsx library

const ChildLanguageReport = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        let url = `${Milestonebaseurl}child_language_reports/`;

        // If the fromDate and toDate are set, include them in the query params
        if (fromDate && toDate) {
          url += `?fromDate=${fromDate}&toDate=${toDate}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [fromDate, toDate]); // Depend on fromDate and toDate to refetch the data when they change

  const handleDateChange = (e) => {
    if (e.target.name === 'fromDate') {
      setFromDate(e.target.value);
    } else if (e.target.name === 'toDate') {
      setToDate(e.target.value);
    }
  };

  // Function to render nested data with label-value pairs
  const renderNestedData = (data, parentKey = '') => {
    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).map((key) => {
        const value = data[key];
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'); // Format label

        // Render recursively if the value is an object, otherwise just render the value
        return (
          <div key={key} className="nested-data">
            <strong>{label}:</strong> {renderNestedData(value, key)}
          </div>
        );
      });
    } else {
      // Return the value if it's a primitive type
      return data ? <span>{data}</span> : 'N/A';
    }
  };

  // Download report as Excel
  const handleDownload = () => {
    // Prepare data in a format suitable for Excel
    const formattedData = assessments.map((assessment) => {
      let formattedAssessment = {};
      Object.keys(assessment).forEach((key) => {
        formattedAssessment[key] = renderNestedData(assessment[key], key);
      });
      return formattedAssessment;
    });

    // Create a workbook and add the sheet with the data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, 'Child Language Report');

    // Download the Excel file
    XLSX.writeFile(wb, 'child_language_report.xlsx');
  };

  // Print the report
  const handlePrint = () => {
    const content = document.getElementById('report-container').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Report</title></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="loading">Error: {error}</div>;
  }

  // Check if there are no assessments
  const noDataAvailable = assessments.length === 0;

  return (
    <div className="report-container" id="report-container">
      <h1>Child Language Assessments Report</h1>

      {/* Date Filter Inputs */}
      <div className="date-filters">
        <label>
          From Date:
          <input
            type="date"
            name="fromDate"
            value={fromDate}
            onChange={handleDateChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={toDate}
            onChange={handleDateChange}
          />
        </label>
      </div>

      {/* Download and Print Icons, only show if there's data */}
      {!noDataAvailable && (
        <div className="actions">
          <button onClick={handleDownload} className="icon-button">
            <i className="fas fa-download"></i> Download as Excel
          </button>
          <button onClick={handlePrint} className="icon-button">
            <i className="fas fa-print"></i> Print
          </button>
        </div>
      )}

      {/* Show "No records available" if there is no data */}
      {noDataAvailable ? (
        <div className="no-data-message">No records available</div>
      ) : (
        // Render each assessment in the report format
        assessments.map((assessment, index) => (
          <div key={assessment.childName} className="assessment-report">
            <h2>Sl.No: {index + 1}</h2>
            {Object.keys(assessment)
              .filter((key) => key !== 'id') // Exclude 'id' field
              .map((key) => (
                <div key={key} className="assessment-field">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
                  {renderNestedData(assessment[key])}
                </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default ChildLanguageReport;