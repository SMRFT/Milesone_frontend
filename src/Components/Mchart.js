import React, { useState } from 'react';
import styled from 'styled-components';
import { MCHAT_CONSTANTS } from './Mchartconstant'; // Assuming Mchartconstant.js contains the constants
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MChartReport from './MchartReport';

const Container = styled.div`
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  font-size: 24px;
`;

const Question = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const QuestionText = styled.p`
  font-size: 16px;
  color: #333;
`;

const ExampleText = styled.p`
  font-size: 14px;
  color: #555;
  margin-top: 5px;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
`;

const OptionLabel = styled.label`
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  margin-right: 20px; /* Spacing between Pass/Fail options */
`;

const Input = styled.input`
  margin-right: 5px; /* Adjust spacing between radio and label */
`;

const TotalScoreContainer = styled.div`
  display: flex;
  align-items: center;  /* Aligns the label and input vertically */
  gap: 10px;  /* Adds space between the label and input */
  margin-top: 20px;
`;

const TotalScoreInput = styled.input`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  width: 50px;
  padding: 5px;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin-top: 0;  /* Removed to ensure input is aligned with label */
`;

const RiskLevel = styled.p`
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  color: ${(props) => props.color || '#333'};
`;

const PatientDetailsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin: 10px auto 20px auto;
`;

const PatientDetailsRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 10px;
  background-color: #f0f8ff;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  flex-grow: 1; /* Allows the row to take up available space */
`;

const ReportIcon = styled.div`
  cursor: pointer;
  padding: 10px;
  background-color: #e0f7fa;
  border-radius: 50%;
  border: 1px solid #00796b;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #00796b;
  margin-left: 10px;

  &:hover {
    background-color: #b2dfdb;
  }
`;
const Mchart = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('');
  const location = useLocation(); // Get the state from the previous page
  const { patient } = location.state || {}; // Destructure patient data from state
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleScore = (event) => {
    // Get the selected value (Pass or Fail)
    const value = event.target.value;
    
    if (value === "Pass") {
      // Increment the score if "Pass" is selected
      setTotalScore((prevScore) => prevScore + 1);
    }

    // Determine the risk level based on the score
    if (totalScore <= 2) {
      setRiskLevel('Low Risk');
    } else if (totalScore >= 3 && totalScore <= 7) {
      setRiskLevel('Medium Risk');
    } else if (totalScore >= 8) {
      setRiskLevel('High Risk');
    }
  };
  const handleSubmit = async () => {
    // Prepare responses for the API call
    const responses = MCHAT_CONSTANTS.map((item) => {
      const answer = document.querySelector(`input[name="question${item.id}"]:checked`)?.value || '';
      return {
        question_no: item.id,
        question_text: item.question,
        answer: answer,
        score: answer === "Pass" ? 1 : 0,
      };
    });
  
    // Validate that every response has an answer
    const invalidResponses = responses.filter(response => !response.answer);
    if (invalidResponses.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }
  
    // Calculate total score based on individual scores
    const totalScore = responses.reduce((acc, response) => acc + response.score, 0);
    setTotalScore(totalScore);
  
    // Create the complete data object
    const dataToSend = {
      responses: responses,
      patient: {
        registration_number:patient?.registration_number|| "Unknown",
        name: patient?.patient_name || "Unknown",
        age: patient?.age || "Unknown",
        sex: patient?.sex || "Unknown",
      },
      totalScore: totalScore,  // Optional: If you want to include total score in the request
      riskLevel: riskLevel,  // Optional: Calculate the risk level based on total score
    };
  
    try {
      const response = await axios.post(`${Milestonebaseurl}save-mchat-response/`, dataToSend);
      console.log(response.data.message); // Success message
      alert("Responses saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error.response?.data);
      alert("Failed to save responses. Please try again.");
    }
  };
  
  
  

  return (
    <Container>
      <Title>M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised)</Title>
  
      <PatientDetailsWrapper>
        {patient ? (
          <PatientDetailsRow>
            <span>
              <strong>Registration No:</strong> {patient.registration_number}
            </span>
            <span>
              <strong>Name:</strong> {patient.patient_name}
            </span>
            <span>
              <strong>Age:</strong> {patient.age}
            </span>
            <span>
              <strong>Gender:</strong> {patient.sex}
            </span>
          </PatientDetailsRow>
        ) : (
          <PatientDetailsRow>
            <span>No patient details provided.</span>
          </PatientDetailsRow>
        )}
        <ReportIcon title="View Report" onClick={handleShowModal}>
  📝
</ReportIcon>

      </PatientDetailsWrapper>
      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          style={{ display: 'block' }}
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-body">
                <MChartReport registration_number={patient?.registration_number} />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {MCHAT_CONSTANTS.map((item) => (
        <Question key={item.id}>
          <QuestionText>{item.id}. {item.question}</QuestionText>
          {item.example && <ExampleText>{item.example}</ExampleText>}
          <OptionContainer>
            <OptionLabel>
              <Input type="radio" name={`question${item.id}`} value="Pass" onChange={handleScore} /> {item.passLabel}
            </OptionLabel>
            <OptionLabel>
              <Input type="radio" name={`question${item.id}`} value="Fail" onChange={handleScore} /> {item.failLabel}
            </OptionLabel>
          </OptionContainer>
        </Question>
      ))}
      <TotalScoreContainer>
  <label>Total Score:</label>
  <TotalScoreInput 
    type="text" 
    value={totalScore} 
    onChange={(e) => setTotalScore(e.target.value)} 
  />
</TotalScoreContainer>

      <TotalScoreContainer>
        <RiskLevel color={riskLevel === 'Low Risk' ? 'green' : riskLevel === 'Medium Risk' ? 'orange' : 'red'}>
          Risk Level: {riskLevel}
        </RiskLevel>
      </TotalScoreContainer>
      <center>
      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px',  color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Submit
      </button>
      </center>
      

    </Container>
  );
};

export default Mchart;
