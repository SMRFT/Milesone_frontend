import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PediatricAssessmentReport = () => {
  const [assessmentData, setAssessmentData] = useState([]);
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    // Fetch the data from the Django API
    axios.get(`${Milestonebaseurl}pediatric_assessment_list/`)
      .then(response => {
        setAssessmentData(response.data); // Set the retrieved data
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  return (
    <div>
      <h1>Pediatric Assessment Report</h1>
      {assessmentData.length > 0 ? (
        assessmentData.map((item, index) => (
          <div key={index} className="assessment-card">
            <h2>Name: {item.name}</h2>
            <p>Age: {item.age}</p>
            <p>Date of Birth: {new Date(item.dob).toLocaleDateString()}</p>
            <p>Concerns: {item.concerns}</p>
            <p>Antenatal History: {item.antenatalHistory}</p>
            <p>Antenatal Complications: {item.antenatalComplications}</p>
            <p>Birth Details: {item.birthDetails}</p>
            <p>Neonatal Details: {item.neonatalDetails}</p>
            <p>Family History: {item.familyHistory}</p>

            {/* <h3>Developmental History</h3>
            {item.developmentalHistory && item.developmentalHistory.map((history, idx) => (
              <div key={idx}>
                <p>Gross Motor/Fine Motor: {history.grossMotorFineMotor}</p>
                <p>Language: {history.language}</p>
                <p>Social: {history.social}</p>
                <p>Cognitive: {history.cognitive}</p>
              </div>
            ))} */}

            <p>Regression: {item.regression}</p>
            <p>General Examination: {item.generalExamination}</p>
            <p>Built & Nourishment: {item.builtNourishment}</p>
            <p>Previous Medications: {item.previousMedications}</p>
            <p>Neonatal Reflexes: {item.neonatalReflexes}</p>
            <p>CNS Examination: {item.cnsExamination}</p>
            <p>Hearing & Vision: {item.hearingVision}</p>
            <p>Tone Reflex: {item.toneReflex}</p>
            <p>Bowel & Bladder: {item.bowelBladder}</p>
            <p>Specific Concerns: {item.specificConcerns}</p>
            <p>Three Items: {item.threeItems}</p>
            <p>Three Points: {item.threePoints}</p>
            <p>Three Activity: {item.threeActivity}</p>
            <p>Interpretation & Recommendation: {item.interpretationRecommendation}</p>
          </div>
        ))
      ) : (
        <p>No assessments available</p>
      )}
    </div>
  );
};

export default PediatricAssessmentReport;
