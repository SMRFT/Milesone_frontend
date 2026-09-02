import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingMessage = styled.p`
  font-size: 1.2rem;
  color: #999;
  text-align: center;
`;

const FetchCBCL = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    // Fetch patient details from backend
    axios.get(`${Milestonebaseurl}get-assessments/`)
      .then(response => setPatients(response.data))
      .catch(error => console.error("Error fetching patient data:", error));
  }, []);

  const handleNavigateToTasks = (patient) => {
    // Navigate to DevelopmentalScreening and pass patient details via state
    navigate('/ChildLanguageAssessment', { state: { patient } });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yyyy'); // Customize this format as needed
  };

  return (
    <Container>
      <Title>Developmental Screening Patients</Title>
      {patients.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => {
              const hasDST = patient.assessments?.some((item) => {
                const val = item.assessment || item.name || item.category;
                if (!val) return false;
                const check = (text) => typeof text === 'string' && (text.includes("ALD") || text.includes("Language Development"));
                return Array.isArray(val) ? val.some(check) : check(val);
              });

              return hasDST ? (
                <tr key={patient.id || index}>
                   <td>{formatDate(patient.date)}</td>
                  <td>{patient.patient_name}</td>
                  <td>{patient.age
                ? `${patient.age.year ?? 0} years, ${patient.age.months ?? 0} months, ${patient.age.days ?? 0} days`
                : 'N/A'}</td>                  
                  <td>{patient.sex}</td>
                  <td>
                    <button onClick={() => handleNavigateToTasks(patient)}>Go to Tasks</button>
                  </td>
                </tr>
              ) : null;
            })}
          </tbody>
        </table>
      ) : (
        <LoadingMessage>Loading patient data...</LoadingMessage>
      )}
    </Container>
  );
};

export default FetchCBCL;
