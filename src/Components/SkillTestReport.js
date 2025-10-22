import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SkillTestReport.css';
import { skillTestsData } from './SkillTestConst';
import { FaPrint, FaEye } from 'react-icons/fa'; // Importing FaEye for the view icon
import { BsChatTextFill } from "react-icons/bs";

const SkillTestReport = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [therapist, setTherapist] = useState('');
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  // Function to get question details based on selected question numbers
  const getQuestionDetails = (questionNumbers) => {
    const questionDetails = [];
    if (Array.isArray(questionNumbers)) {
      questionNumbers.forEach((q_no) => {
        for (const category in skillTestsData) {
          for (const skillType in skillTestsData[category]) {
            const question = skillTestsData[category][skillType].find((q) => q.q_no === q_no);
            if (question) {
              questionDetails.push({
                skill: question.Skill,
                description: question.Description,
              });
              break;
            }
          }
        }
      });
    }
    return questionDetails;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = new URLSearchParams();
        if (patientId) params.append("patient_id", patientId);
        if (date) params.append("date", date);
        if (therapist) params.append("therapist", therapist);  // Ensure therapist filter is passed
        
        // Log the URL to ensure correct query parameters are passed
        console.log(`Fetching with params: ${params.toString()}`);
        
        const response = await axios.get(`${Milestonebaseurl}save-patient-skill/?${params.toString()}`);
        const reportData = response.data.map((report) => {
          if (typeof report.data === 'string') report.data = JSON.parse(report.data);
          return report;
        });
        setReports(reportData);
      } catch (error) {
        setError("Error fetching reports");
        console.error(error);
      }
    };
  
    fetchReports();
  }, [patientId, date, therapist]);
  
  

  const printReport = () => {
    const actionColumns = document.querySelectorAll('#filtered-data td:last-child, #filtered-data th:last-child');
    actionColumns.forEach((col) => {
      col.style.display = 'none';
    });

    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = document.getElementById('filtered-data').innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Report</title>
          <style>
            /* Add your styles here */
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Filtered Skill Test Report</h2>
            ${printContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();

    actionColumns.forEach((col) => {
      col.style.display = '';
    });
  };

  const printRow = (entry, patient_name, age, sex, therapist) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const questionDetails = getQuestionDetails(entry.selected_questions);

    const rowContent = `
      <html>
        <head>
          <title>Print Row</title>
          <style>
            /* Add your styles here */
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Skill Test Report - ${patient_name}</h2>
            <div class="content">
              <table>
                <tr><th>Name:</th><td>${patient_name}</td></tr>
                <tr><th>Age:</th><td>${age}</td></tr>
                <tr><th>Sex:</th><td>${sex}</td></tr>
                <tr><th>Therapist:</th><td>${entry.therapist}</td></tr>
                <tr><th>Date:</th><td>${entry.date}</td></tr>
              </table>
            </div>
            <div class="content">
              <table>
                <tr><th>Status:</th><td>${entry.status}</td></tr>
                <tr><th>Category:</th><td>${entry.category}</td></tr>
              </table>
            </div>
            <div class="content">
              <table>
                <thead>
                  <tr><th>#</th><th>Skill</th><th>Description</th></tr>
                </thead>
                <tbody>
                  ${questionDetails
        .map(
          (question, index) =>
            `<tr><td>${index + 1}</td><td>${question.skill}</td><td>${question.description}</td></tr>`
        )
        .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(rowContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="background-container2">
      <div className="container">
        <h2>Goal Sheet</h2>
        <div className="filters">
          <div className="filter-group left">
            <label htmlFor="patientId">Patient ID: </label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID"
            />
          </div>
          <div className="filter-group center">
            <label htmlFor="date">Date: </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="filter-group right">
            <label htmlFor="therapist">Therapist: </label>
            <select
              id="therapist"
              value={therapist}
              onChange={(e) => setTherapist(e.target.value)} // Filter based on selected therapist
            >
              <option value="">Select Therapist</option>
              <option value="Occupational Therapist">Occupational Therapist</option>
              <option value="Speech Therapist">Speech Therapist</option>
              <option value="Psychologist">Psychologist</option>
            </select>
          </div>
          <button onClick={printReport} className="print-btn">
            <FaPrint /> Print Report
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div id="filtered-data">
          {reports.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Therapist</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Selected Questions</th>
                  <th>Comment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => {
                  return report.data.map((entry, i) => {
                    return (
                      <tr key={i}>
                        <td>{entry.date}</td>
                        <td>{report.patient_name}</td>
                        <td>{report.age}</td>
                        <td>{report.sex}</td>
                        <td>{entry.therapist}</td>
                        <td>{entry.status}</td>
                        <td>{entry.category}</td>
                        <td>
                          <div className="hover-icon">
                            <BsChatTextFill />
                            <div className="tooltip">
                              {getQuestionDetails(entry.selected_questions).map((question, index) => (
                                <div key={index}>
                                  <strong>{question.skill}:</strong> {question.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>{entry.comment}</td>
                        <td>
                          <button
                            className="print-button"
                            onClick={() =>
                              printRow(entry, report.patient_name, report.age, report.sex, report.therapist)
                            }
                          >
                            <FaEye /> Print Row
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          ) : (
            <p>No data available for the selected filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillTestReport;