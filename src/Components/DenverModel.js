import React, { useState } from 'react';
import axios from 'axios';
import { skillTestsData } from './SkillTestConst';
import './DenverModel.css';

const DenverModel = () => {
  const [therapist, setTherapist] = useState(''); // New state for therapist
  const [status, setStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkillDetails, setSelectedSkillDetails] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [comment, setComment] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [patientDetails, setPatientDetails] = useState({ name_of_child: '', age: '', sex: '' });
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const handleTherapistChange = (event) => {
    setTherapist(event.target.value);
    // Reset dependent fields when therapist changes
    setStatus('');
    setSelectedCategory('');
    setSelectedSkillDetails(null);
    setSelectedQuestions([]);
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value;
    setStatus(selectedStatus);
    setSelectedCategory('');
    setSelectedSkillDetails(null);
    setSelectedQuestions([]);
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setSelectedCategory(selectedCategory);

    setSelectedSkillDetails(null);
    setSelectedQuestions([]);

    const skillDetails = skillTestsData[status] && skillTestsData[status][selectedCategory]
      ? skillTestsData[status][selectedCategory]
      : null;
    setSelectedSkillDetails(skillDetails);
  };

  const handleQuestionSelect = (questionNo) => {
    setSelectedQuestions((prevSelectedQuestions) => {
      if (prevSelectedQuestions.includes(questionNo)) {
        return prevSelectedQuestions.filter((q) => q !== questionNo);
      } else {
        return [...prevSelectedQuestions, questionNo];
      }
    });
  };

  const fetchPatientDetails = async (regNumber) => {
    try {
      const response = await axios.get(`${Milestonebaseurl}reg_no/${regNumber}/`);
      setPatientDetails(response.data || { name_of_child: '', age: '', sex: '' });
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setPatientDetails({ name_of_child: '', age: '', sex: '' });
    }
  };

  const handleRegistrationNumberChange = (event) => {
    const regNumber = event.target.value;
    setRegistrationNumber(regNumber);
    if (regNumber) fetchPatientDetails(regNumber);
    else setPatientDetails({ name_of_child: '', age: '', sex: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // const formattedDate = new Date().toISOString().split('T')[0];

    const payload = {
      registration_number: registrationNumber,
      patient_name: patientDetails.name_of_child,
      age: patientDetails.age,
      sex: patientDetails.sex,
      therapist: therapist, // Include therapist in the payload
      date: new Date(), 
      data: {
        therapist: therapist,
        status: status,
        category: selectedCategory,
        selected_questions: selectedQuestions,
        comment: comment,
      },
    };

    console.log('Payload to be sent:', payload);

    try {
      const response = await axios.post(`${Milestonebaseurl}save-patient-skill/`, payload);
      if (response.status === 201 || response.status === 200) {
        console.log('Data saved successfully!');
        alert('Data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again later.');
    }
  };

  return (
    <div >
      <div className="container1">
        <h2>Denver Model Curriculum Checklist</h2>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>

        <form onSubmit={handleSubmit}>
          <div className="roww">
            <div className="col-mde-6">
              <label htmlFor="registrationNumber">Register No:</label>
              <input
                type="text"
                id="registrationNumber"
                value={registrationNumber}
                onChange={handleRegistrationNumberChange}
                placeholder="Enter Registration Number"
              />
            </div>
            <div className="col-mde-6">
              <label htmlFor="patientName">Patient Name:</label>
              <input type="text" id="patientName" value={patientDetails.name_of_child} readOnly />
            </div>
          </div>

          <div className="roww">
            <div className="col-mde-6">
              <label htmlFor="age">Age:</label>
              <input type="text" id="age" value={patientDetails.age
                                ? `${patientDetails.age.year} years, ${patientDetails.age.months} months, ${patientDetails.age.days} days`
                                : ''} readOnly />
            </div>
            <div className="col-mde-6">
              <label htmlFor="sex">Sex:</label>
              <input type="text" id="sex" value={patientDetails.sex} readOnly />
            </div>
          </div>

          <div className="roww">
            <div className="col-mde-6">
              <label htmlFor="therapist">Therapist:</label>
              <select id="therapist" value={therapist} onChange={handleTherapistChange}>
                <option value="">Select Therapist</option>
                <option value="Occupational Therapist">Occupational Therapist</option>
                <option value="Speech Therapist">Speech Therapist</option>
                <option value="Psychologist">Psychologist</option>
              </select>
            </div>
            <div className="col-mde-6">
              <label htmlFor="status">Status:</label>
              <select id="status" value={status} onChange={handleStatusChange}>
                <option value="">Select Status</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
              </select>
            </div>
          </div>

          {status && (
            <div className="roww">
              <div className="col-md-12">
                <label htmlFor="category">Category:</label>
                <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
                  <option value="">Select Category</option>
                  {Object.keys(skillTestsData[status] || {}).map((category, idx) => (
                    <option key={idx} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedSkillDetails &&
            selectedSkillDetails.map((item, idx) => (
              <div key={idx} className="question-section">
                {item.subtitle && <h3>{item.subtitle}</h3>}
                {item.q_no && (
                  <div className="question-checkbox" style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id={`question-${item.q_no}`}
                      checked={selectedQuestions.includes(item.q_no)}
                      onChange={() => handleQuestionSelect(item.q_no)}
                      style={{ marginRight: '10px' }}
                    />
                    <label htmlFor={`question-${item.q_no}`} style={{ flex: 1 }}>
                      <strong>Question {item.q_no}:</strong> {item.Skill}
                    </label>
                  </div>
                )}
                {item.Description && <p><strong>Description:</strong> {item.Description}</p>}
              </div>
            ))}

          <div className="roww">
            <div className="col-md-12">
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment"
              />
            </div>
          </div>

          <button  >Submit</button>
        </form>
      </div>
    </div>
  );
};

export default DenverModel;