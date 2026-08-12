import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "./apiRequest";

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
    // Fetch patient details from backend using apiRequest helper
    const fetchPatientData = async () => {
      const response = await apiRequest(`${Milestonebaseurl}get-assessments/`, "GET");
      if (response && response.success) {
        console.log("Fetched data:", response.data);
        setPatients(response.data || []);
      } else {
        console.error("Error fetching patient data:", response?.error);
      }
    };

    fetchPatientData();
  }, [Milestonebaseurl]);

  const handleNavigateToTasks = (patient) => {
    // Navigate to Mchart and pass patient details via state
    navigate("/Mchart", { state: { patient } });
  };

  const colors = ["#FF512F", "#8224e3", "#4CAF50"];

  const filteredPatients = patients.filter((patient) => {
    if (!patient.assessments || !Array.isArray(patient.assessments)) return false;
    return patient.assessments.some((item) => {
      const val = item.assessment || item.name || item.category;
      if (!val) return false;
      const checkText = (text) => {
        if (typeof text !== "string") return false;
        const lower = text.toLowerCase();
        return lower.includes("m-chat") || lower.includes("mchat");
      };
      if (Array.isArray(val)) {
        return val.some(checkText);
      }
      return checkText(val);
    });
  });

  // Fall back to showing all patients if specific filter yields no matches
  const displayPatients = filteredPatients.length > 0 ? filteredPatients : patients;

  return (
    <div style={{ padding: "20px" }}>
      <h2>M-CHAT-R Patients</h2>

      {patients.length > 0 ? (
        <CardContainer>
          {displayPatients.map((patient, index) => (
            <Card key={patient.id || index}>
              <CardHeader color={colors[index % colors.length]} />
              <CardContent>
                <h3>{patient.registration_number}</h3>
                <h3>{patient.patient_name}</h3>
                <p>
                  Age: {patient.age?.year ?? 0}y {patient.age?.months ?? 0}m{" "}
                  {patient.age?.days ?? 0}d
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
          ))}
        </CardContainer>
      ) : (
        <p>Loading patient data...</p>
      )}
    </div>
  );
};

export default FetchMchart;
