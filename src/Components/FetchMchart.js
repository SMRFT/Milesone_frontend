import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow wrapping to the next row */
  gap: 20px; /* Space between cards */
  justify-content: flex-start; /* Align cards to the left */
  align-items: flex-start; /* Align items at the top */
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
      .then((response) => setPatients(response.data))
      .catch((error) => console.error("Error fetching patient data:", error));
  }, []);

  const handleNavigateToTasks = (patient) => {
    // Navigate to Mchart and pass patient details via state
    navigate("/Mchart", { state: { patient } });
  };

  const colors = ["#FF512F", "#8224e3", "#4CAF50"]; // Colors for each step

  return (
    <div>
      <h2> M-Chart Patient's</h2>
      {patients.length > 0 ? (
        <CardContainer>
          {patients.map((patient, index) => {
            // Check if the patient has the specific assessment
            const hasDST = patient.assessments.some(
              (assessment) => assessment.name === "M-CHAT-R"
            );

            // Only display the patient if they have this assessment
            return hasDST ? (
              <Card key={patient.id}>
                <CardHeader color={colors[index % colors.length]} />
                <CardContent>
                 <h3>{patient.registration_number}</h3>
                  <h3>{patient.patient_name}</h3>
                  <p>Age: {patient.age}</p>
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
