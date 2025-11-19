import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px;
`;

const Card = styled.div`
  width: 300px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  padding: 20px;
  overflow: hidden;
  text-align: center;
`;

const CardHeader = styled.div`
  height: 40px;
  background: ${(props) => props.color || "#FF512F"};
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const CardContent = styled.div`
  margin-top: 60px;
`;

const Button = styled.button`
  background-color: ${(props) => props.color || "#FF512F"};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#DD2476"};
  }
`;

const FetchMchart = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    // Fetch patient details from backend
    axios
      .get(`${Milestonebaseurl}get-assessments/`)
      .then((response) => {
        console.log("Fetched data:", response.data);
        setPatients(response.data);
      })
      .catch((error) => console.error("Error fetching patient data:", error));
  }, [Milestonebaseurl]);

  const handleNavigateToTasks = (patient) => {
    // Navigate to Mchart and pass patient details via state
    navigate("/Mchart", { state: { patient } });
  };

  const colors = ["#FF512F", "#8224e3", "#4CAF50"];

  return (
    <div style={{ padding: "20px" }}>
      <h2>M-CHAT-R Patients</h2>

      {patients.length > 0 ? (
        <CardContainer>
          {patients.map((patient, index) => {
            // ✅ Check if patient has "M-CHAT-R" in any assessment array
            const hasMCHAT = patient.assessments?.some(
              (assessment) =>
                Array.isArray(assessment.assessment) &&
                assessment.assessment.includes("M-CHAT-R")
            );

            // Only display those who have M-CHAT-R
            return hasMCHAT ? (
              <Card key={index}>
                <CardHeader color={colors[index % colors.length]} />
                <CardContent>
                  <h3>{patient.registration_number}</h3>
                  <h3>{patient.patient_name}</h3>
                  <p>
                    Age: {patient.age?.year}y {patient.age?.months}m{" "}
                    {patient.age?.days}d
                  </p>
                  <p>Gender: {patient.sex}</p>

                  <Button
                    color={colors[index % colors.length]}
                    hoverColor="#DD2476"
                    onClick={() => handleNavigateToTasks(patient)}
                  >
                    M-CHAT-R
                  </Button>
                </CardContent>
              </Card>
            ) : null;
          })}
        </CardContainer>
      ) : (
        <p>Loading patient data...</p>
      )}
    </div>
  );
};

export default FetchMchart;
