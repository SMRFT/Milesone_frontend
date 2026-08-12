import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import apiRequest from './apiRequest';

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
    // Fetch patient details from backend using apiRequest helper
    const fetchPatientData = async () => {
      const response = await apiRequest(`${Milestonebaseurl}get-assessments/`, "GET");
      if (response && response.success) {
        setPatients(response.data || []);
      } else {
        console.error("Error fetching patient data:", response?.error);
      }
    };

    fetchPatientData();
  }, [Milestonebaseurl]);

  const handleNavigateToTasks = (patient) => {
    // Navigate to DevelopmentalScreening and pass patient details via state
    navigate('/CBCLforGirls6To18y', { state: { patient } });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yyyy'); // Customize this format as needed
  };

  const isMatchingPatient = (patient) => {
    if (!patient.assessments || !Array.isArray(patient.assessments)) return false;
    return patient.assessments.some((item) => {
      const val = item.assessment || item.name || item.category;
      if (!val) return false;
      const checkText = (text) => {
        if (typeof text !== "string") return false;
        const lower = text.toLowerCase();
        return (
          lower.includes("child behavior checklist") ||
          lower.includes("cbcl") ||
          lower.includes("developmental screening")
        );
      };
      if (Array.isArray(val)) {
        return val.some(checkText);
      }
      return checkText(val);
    });
  };

  const filteredPatients = patients.filter(isMatchingPatient);
  // Fall back to all patients if filtering yields no results (to ensure data displays if naming varies)
  const displayPatients = filteredPatients.length > 0 ? filteredPatients : patients;

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
            {displayPatients.map((patient, index) => (
              <tr key={patient.id || index}>
                <td>{formatDate(patient.date)}</td>
                <td>{patient.patient_name}</td>
                <td>
                  {patient.age
                    ? `${patient.age.year ?? 0} years, ${patient.age.months ?? 0} months, ${patient.age.days ?? 0} days`
                    : "N/A"}
                </td>
                <td>{patient.sex}</td>
                <td>
                  <button onClick={() => handleNavigateToTasks(patient)}>Go to Tasks</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <LoadingMessage>Loading patient data...</LoadingMessage>
      )}
    </Container>
  );
};

export default FetchCBCL;
