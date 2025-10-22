import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: auto;
`;


const Title = styled.h2`
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
`;

const PatientInfo = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const InfoRow = styled.div`
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;
`;
const PediatricAssessmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    concerns: '',
    antenatalHistory: '',
    antenatalComplications: '',
    birthDetails: '',
    neonatalDetails: '',
    familyHistory: '',
    developmentalHistory: [
        { grossMotorFineMotor: '', language: '', social: '', cognitive: '' },
        { grossMotorFineMotor: '', language: '', social: '', cognitive: '' },
      ],
    regression: '',
    generalExamination: '',
    builtNourishment: '',
    previousMedications: '',
    neonatalReflexes: '',
    cnsExamination: '',
    hearingVision: '',
    toneReflex: '',
    bowelBladder: '',
    specificConcerns: '',
    threeItems: '',
    threePoints: '',
    threeActivity: '',
    interpretationRecommendation: '',
  });
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const location = useLocation(); // Access navigation state
  const { patient } = location.state; // Extract passed patient data
  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    
    // If index is provided, we're updating the developmentalHistory array
    if (index !== null) {
      const updatedDevelopmentalHistory = [...formData.developmentalHistory];
      updatedDevelopmentalHistory[index][name] = value;
      setFormData({
        ...formData,
        developmentalHistory: updatedDevelopmentalHistory,
      });
    } else {
      // Otherwise, we're updating a regular field
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const addRow = () => {
    setFormData({
      ...formData,
      developmentalHistory: [
        ...formData.developmentalHistory,
        { grossMotorFineMotor: '', language: '', social: '', cognitive: '' },
      ],
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${Milestonebaseurl}pediatric-assessment/`, formData);
      console.log('Form submitted successfully', response);
      alert('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  return (
    <div className="container mt-4">
     
      <h3 className="text-center">Pediatric Assessment Form</h3>
      <br/>
      <PatientInfo>
        <InfoRow><strong>Registration Number:</strong> {patient.registration_number}</InfoRow>
        <InfoRow><strong>Name of Child:</strong> {patient.name_of_child}</InfoRow>
        <InfoRow><strong>Age:</strong> {patient.age}</InfoRow>
        <InfoRow><strong>Gender:</strong> {patient.sex}</InfoRow>
        <InfoRow><strong>Phone Number:</strong> {patient.phone_number}</InfoRow>
      </PatientInfo>
      <form onSubmit={handleSubmit}>
        {/* <div className="row mb-3">
           <div className="col-md-4">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Age</label>
            <input
              type="text"
              className="form-control"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
        </div>  */}

        <div className="mb-3">
          <label className="form-label">Concerns at Present</label>
          <textarea
            className="form-control"
            rows="2"
            name="concerns"
            value={formData.concerns}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Antenatal/Natal/Postnatal History</label>
          <textarea
            className="form-control"
            rows="2"
            name="antenatalHistory"
            value={formData.antenatalHistory}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Any Antenatal Complications</label>
          <textarea
            className="form-control"
            rows="2"
            name="antenatalComplications"
            value={formData.antenatalComplications}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Birth Cry/Birth Weight/NICU Admission</label>
          <textarea
            className="form-control"
            rows="2"
            name="birthDetails"
            value={formData.birthDetails}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Neonatal Jaundice/Seizures/Any Admission Post-Neonatal</label>
          <textarea
            className="form-control"
            rows="2"
            name="neonatalDetails"
            value={formData.neonatalDetails}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Family History</label>
          <textarea
            className="form-control"
            rows="2"
            name="familyHistory"
            value={formData.familyHistory}
            onChange={handleChange}
          />
        </div>


       {/* Developmental History Table */}
       <div className="mb-3">
      <center>   <label className="form-label">Developmental History</label></center> 
          <table className="table">
            <thead>
              <tr>
                <th>Gross Motor and Fine Motor</th>
                <th>Language</th>
                <th>Social</th>
                <th>Cognitive</th>
              </tr>
            </thead>
            <tbody>
              {formData.developmentalHistory.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="grossMotorFineMotor"
                      value={row.grossMotorFineMotor}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="language"
                      value={row.language}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="social"
                      value={row.social}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="cognitive"
                      value={row.cognitive}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addRow}
          >
            Add Row
          </button>
        </div>


        <div className="mb-3">
          <label className="form-label">Any Regression</label>
          <textarea
            className="form-control"
            rows="2"
            name="regression"
            value={formData.regression}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">General Examination</label>
          <textarea
            className="form-control"
            rows="2"
            name="generalExamination"
            value={formData.generalExamination}
            onChange={handleChange}
          />
        </div>
        {/* Added "Built/Nourishment/Abnormal facies/NCM" field after General Examination */}
        <div className="mb-3">
          <label className="form-label">Built/Nourishment/Abnormal Facies/NCM</label>
          <textarea
            className="form-control"
            rows="2"
            name="builtNourishment"
            value={formData.builtNourishment}
            onChange={handleChange}
          />
        </div>

    
        
        <div className="mb-3">
          <label className="form-label">Previous Medications, Sleep Issues, Allergies, Sensory Issues</label>
          <textarea
            className="form-control"
            rows="2"
            name="previousMedications"
            value={formData.previousMedications}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Neonatal Reflexes</label>
          <textarea
            className="form-control"
            rows="2"
            name="neonatalReflexes"
            value={formData.neonatalReflexes}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
  <label className="form-label">CNS Examination</label>
  <textarea
    className="form-control"
    rows="2"
    name="cnsExamination"
    value={formData.cnsExamination}
    onChange={handleChange}
  />
</div>

<div className="mb-3">
  <label className="form-label">Higher Function</label>
  <textarea
    className="form-control"
    rows="2"
    name="higherFunction"
    value={formData.higherFunction}
    onChange={handleChange}
  />
</div>


        <div className="mb-3">
          <label className="form-label">Hearing/Vision</label>
          <textarea
            className="form-control"
            rows="2"
            name="hearingVision"
            value={formData.hearingVision}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tone/Power/Reflex</label>
          <textarea
            className="form-control"
            rows="2"
            name="toneReflex"
            value={formData.toneReflex}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bowel/Bladder Involvement</label>
          <textarea
            className="form-control"
            rows="2"
            name="bowelBladder"
            value={formData.bowelBladder}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Specific Concerns</label>
          <textarea
            className="form-control"
            rows="2"
            name="specificConcerns"
            value={formData.specificConcerns}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">3 Items to Tell</label>
          <textarea
            className="form-control"
            rows="2"
            name="threeItems"
            value={formData.threeItems}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">3 Points to Identify</label>
          <textarea
            className="form-control"
            rows="2"
            name="threePoints"
            value={formData.threePoints}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">3 Activities to Do</label>
          <textarea
            className="form-control"
            rows="2"
            name="threeActivity"
            value={formData.threeActivity}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Interpretation & Recommendation</label>
          <textarea
            className="form-control"
            rows="3"
            name="interpretationRecommendation"
            value={formData.interpretationRecommendation}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default PediatricAssessmentForm;
