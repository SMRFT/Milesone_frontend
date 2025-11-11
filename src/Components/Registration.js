import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import mdcLogo from "./Images/mdcLogo.png";
import teddyBearImage from "./Images/Teddy.png";
import "./Registration.css"; // We will update the content of this file
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import apiRequest from "./apiRequest";

// Custom styles for the React-Select component
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: "0.25rem",
    borderColor: state.isFocused ? "#406147" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(64, 97, 71, 0.25)" : "none",
    "&:hover": {
      borderColor: "#406147",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#e6f0e6" // Light green on hover
      : state.isSelected
      ? "#a1c181" // Selected green
      : "white",
    color: "#333",
  }),
};

const Registration = () => {
  const employeeName = localStorage.getItem("name");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referralDoctorOptions, setReferralDoctorOptions] = useState([]); // This state seems unused after initial declaration, rely on `doctors` state.
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const options = [
    { value: "Language Delay", label: "Language Delay" },
    { value: "Development Delay", label: "Development Delay" },
    { value: "Learning Disability", label: "Learning Disability" },
    {
      value: "Genetic Disorder with Development Delay",
      label: "Genetic Disorder with Development Delay",
    },
    { value: "Inattention", label: "Inattention" },
    { value: "Screening of Development", label: "Screening of Development" },
    { value: "Others", label: "Others" },
  ];

  const [formData, setFormData] = useState({
    name_of_child: "",
    dob: "",
    age: { days: "", months: "", year: "" },
    sex: "",
    mother_name: "",
    father_name: "",
    guardian_name: "",
    address: "",
    mail_id: "",
    mother_phone_number: "",
    father_phone_number: "",
    reason_for_visit: {}, // Changed from [] to {} for object structure
    duration_of_symptoms: "",
    previous_treatment_done: "",
    source_of_referral: {
      ThroughDoctorwithName: "",
      ThroughMediaAdd: false,
      ThroughFriendsNeighbours: false,
      Others: "",
    },
  });

  const [referralDoctorData, setReferralDoctorData] = useState({
    doctorName: "",
    hospitalName: "",
    area: "",
    city: "",
    district: "",
    phoneNumber: "",
    sex: "",
    email: "",
  });

  const [registrationNumber, setRegistrationNumber] = useState("");
  useEffect(() => {
    const fetchRegistrationNumber = async () => {
      try {
        const response = await apiRequest(
          `${Milestonebaseurl}next-registration-number/`
        );
        setRegistrationNumber(response.data.registration_number);
      } catch (error) {
        console.error("Error fetching registration number:", error);
      }
    };
    fetchRegistrationNumber();
  }, [Milestonebaseurl]); // Added dependency

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("source_of_referral")) {
      const field = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        source_of_referral: {
          ...prevData.source_of_referral,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();

    let years = today.getFullYear() - selectedDate.getFullYear();
    let months = today.getMonth() - selectedDate.getMonth();
    let days = today.getDate() - selectedDate.getDate();

    if (days < 0) {
      months -= 1;
      const daysInLastMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += daysInLastMonth;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];

    setFormData((prevData) => ({
      ...prevData,
      dob: formattedDate,
      age: {
        days,
        months,
        year: years,
      },
    }));
  };

  const printReport = () => {
    const printWindow = window.open("", "", "width=800,height=600");

    // Helper function to format the reason_for_visit object into a comma-separated string of labels
    const formatReasonForVisit = (reasonObject) => {
      return Object.keys(reasonObject)
        .map((key) => options.find((o) => o.value === key)?.label || "")
        .filter(Boolean)
        .join(", ");
    };
    
    const printableContent = `
            <html>
            <head>
            <title>Milestone Development Center</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #F4F4F9;
                    color: black;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    border-bottom: 5px solid #406147; /* Modernized border color */
                    padding-bottom: 10px;
                }
                .logo {
                    width: 120px;
                    height: auto;
                }
                .header-title {
                    font-size: 26px;
                    color: #406147; /* Modernized header color */
                    text-align: center;
                    flex-grow: 1;
                    margin: 0;
                }
                .contact-details {
                    display: flex;
                    justify-content: space-between;
                    width: 400px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: black;
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                }
                .contact-info div {
                    margin: 2px 0;
                }
                .vertical-line {
                    border-left: 2px solid #a1c181; /* Accent line color */
                    margin: 0 10px;
                }
                .container {
                    width: 90%;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                table th, table td {
                    padding: 12px;
                    text-align: left;
                    border: 1px solid #ddd;
                    font-size: 16px;
                    color: black;
                }
                table th {
                    background-color: #e6f0e6; /* Light background for headers */
                    color: #406147;
                    font-weight: bold;
                }
                table tr:nth-child(even) {
                    background-color: #fafafa;
                }
                table tr:hover {
                    background-color: #f5f5f5;
                }
                .footer {
                    position: absolute; /* Changed to absolute for reliable positioning in print */
                    bottom: 20px;
                    right: 50px;
                    text-align: center;
                    font-size: 16px;
                    color: black;
                    width: 200px;
                }
                .signature-label {
                    font-weight: bold;
                    margin-bottom: 5px;
                    border-top: 1px dashed #333;
                    padding-top: 10px;
                }
                .employee-name {
                    font-size: 18px;
                    font-weight: normal;
                }
                @media print {
                    .container {
                        box-shadow: none;
                    }
                }
            </style>
        </head>
            <body>
                <div class="header">
                    <img src="${mdcLogo}" alt="Logo" class="logo" />
                    <div class="contact-details">
                        <div class="contact-info">
                            <div>59/37, Saradha College Road</div>
                            <div>Salem-636007</div>
                            <div>Tamil Nadu</div>
                        </div>
                        <div class="vertical-line"></div>
                        <div class="contact-info">
                            <div>M: 90470 33633</div>
                            <div>E: info@milestonescenter.in</div>
                            <div>W: www.milestonescenter.in</div>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <h2 class="header-title">Registration Receipt</h2>
                    <table>
                        <tr><th>Registration Number</th><td>${
                          registrationNumber || "N/A"
                        }</td></tr>
                        <tr><th>Name of the Child</th><td>${
                          formData.name_of_child || "N/A"
                        }</td></tr>
                        <tr><th>Age</th><td>${
                          formData.age.year ||
                          formData.age.months ||
                          formData.age.days
                            ? `${formData.age.year} years, ${formData.age.months} months, ${formData.age.days} days`
                            : "'N/A'"
                        }</td></tr>
                        <tr><th>Sex</th><td>${formData.sex || "N/A"}</td></tr>
                        <tr><th>Father Name</th><td>${
                          formData.father_name || "N/A"
                        }</td></tr>
                        <tr><th>Mother Name</th><td>${
                          formData.mother_name || "N/A"
                        }</td></tr>
                         <tr><th>Father Phone Number</th><td>${
                           formData.father_phone_number || "N/A"
                         }</td></tr>   
                        <tr><th>Mother Phone Number</th><td>${
                          formData.mother_phone_number || "N/A"
                        }</td></tr>                                           
                        <tr><th>Address</th><td>${
                          formData.address || "N/A"
                        }</td></tr>
                        <tr><th>Mail ID</th><td>${
                          formData.mail_id || "N/A"
                        }</td></tr>
                        <tr>
                        <th>Reason for Visit</th>
                        <td>
                            ${
                              formatReasonForVisit(formData.reason_for_visit) ||
                              "N/A"
                            }
                        </td>
                        </tr>
                        <tr><th>Duration of Symptoms</th><td>${
                          formData.duration_of_symptoms || "N/A"
                        }</td></tr>
                        <tr><th>Previous Treatment Done</th><td>${
                          formData.previous_treatment_done || "N/A"
                        }</td></tr>
                    </table>
                </div>
                <div class="footer">
                    <div class="signature-label">Signature of Employee</div>
                    <div class="employee-name">${employeeName}</div>
                </div>

            </body>
            </html>
        `;
    printWindow.document.write(printableContent);
    setTimeout(() => {
      printWindow.document.close();
      printWindow.print();
    }, 1000);
  };

  // Fetch doctors from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiRequest(
          `${Milestonebaseurl}referral-doctor/list/`
        );
        if (response.success) {
          setDoctors(response.data);
        } else {
          console.error("API Error:", response.error);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, [Milestonebaseurl]);

  // Handle option selection for Reason for Visit
  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !formData.reason_for_visit[value]) {
      setFormData((prevData) => ({
        ...prevData,
        reason_for_visit: {
          ...prevData.reason_for_visit,
          [value]: true,
        },
      }));
    }
  };

  // Handle removing selected item
  const handleRemove = (key) => {
    const updatedReasonForVisit = { ...formData.reason_for_visit };
    delete updatedReasonForVisit[key];
    setFormData((prevData) => ({
      ...prevData,
      reason_for_visit: updatedReasonForVisit,
    }));
  };

  // Update formData when selectedDoctor changes
  useEffect(() => {
    if (selectedDoctor) {
      setFormData((prevData) => ({
        ...prevData,
        source_of_referral: {
          ...prevData.source_of_referral,
          ThroughDoctorwithName: selectedDoctor.label,
        },
      }));
    } else {
      // Clear the doctor name if selection is cleared
       setFormData((prevData) => ({
        ...prevData,
        source_of_referral: {
          ...prevData.source_of_referral,
          ThroughDoctorwithName: "",
        },
      }));
    }
  }, [selectedDoctor]);

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.id,
    label: doctor.doctor_name,
  }));

  const handleDoctorChange = (selectedOption) => {
    setSelectedDoctor(selectedOption);
  };

  // Handles input changes for the referral doctor form
  const handleReferralChange = (e) => {
    const { name, value } = e.target;
    setReferralDoctorData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding a new doctor
  const handleAddDoctorReferral = () => {
    setIsModalOpen(true);
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();

    const snakeCaseData = {
      doctor_name: referralDoctorData.doctorName,
      hospital_name: referralDoctorData.hospitalName,
      area: referralDoctorData.area,
      city: referralDoctorData.city,
      district: referralDoctorData.district,
      phone_number: referralDoctorData.phoneNumber,
      sex: referralDoctorData.sex,
      email: referralDoctorData.email || "",
    };

    const result = await apiRequest(
      `${Milestonebaseurl}referral-doctor/register/`,
      "POST",
      snakeCaseData
    );

    if (result.success) {
      alert("Referral Doctor registered successfully!");

      // Update the main doctors list
      const newDoctor = {
        id: result.data.id, // Assuming the API returns the new doctor ID
        doctor_name: referralDoctorData.doctorName,
      };

      setDoctors((prev) => [...prev, newDoctor]);
      
      const newOption = {
        value: newDoctor.id,
        label: newDoctor.doctor_name,
      };
      setSelectedDoctor(newOption); // Select the newly added doctor
      setIsModalOpen(false);

      setReferralDoctorData({
        doctorName: "",
        hospitalName: "",
        area: "",
        city: "",
        district: "",
        phoneNumber: "",
        sex: "",
        email: "",
      });
    } else {
      console.error("Error:", result.error);
      alert("Error in registration.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation check (Bootstrap validation classes handle the rest)
    if (!e.target.checkValidity()) {
        e.stopPropagation();
        alert("Please fill out all required fields.");
        return;
    }

    try {
      const regNumberResult = await apiRequest(
        `${Milestonebaseurl}next-registration-number/`,
        "GET"
      );

      if (!regNumberResult.success) {
        throw new Error(
          regNumberResult.error || "Failed to get registration number"
        );
      }

      const newRegistrationNumber = regNumberResult.data.registration_number;

      const updatedFormData = {
        ...formData,
        registration_number: newRegistrationNumber,
        reason_for_visit: Object.keys(formData.reason_for_visit),
        source_of_referral: {
          ...formData.source_of_referral,
          ThroughDoctorwithName: selectedDoctor?.label || "",
        },
      };

      const submitResult = await apiRequest(
        `${Milestonebaseurl}register/`,
        "POST",
        updatedFormData
      );

      if (submitResult.success) {
        setFormData({
          name_of_child: "",
          dob: "",
          age: { year: "", months: "", days: "" },
          sex: "",
          mother_name: "",
          father_name: "",
          guardian_name: "",
          address: "",
          mail_id: "",
          mother_phone_number: "",
          father_phone_number: "",
          reason_for_visit: {}, // Reset to empty object
          duration_of_symptoms: "",
          previous_treatment_done: "",
          source_of_referral: {
            ThroughDoctorwithName: "",
            ThroughMediaAdd: false,
            ThroughFriendsNeighbours: false,
            Others: "",
          },
        });
        setSelectedDoctor(null); // Reset select component
        setSuccessMessage(
          `Registration successful! No: ${newRegistrationNumber}`
        );
        setErrorMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });

        setTimeout(() => {
          setSuccessMessage("");
          // For a clean state, reloading is acceptable here, but resetForm is cleaner
          window.location.reload(); 
        }, 5000);
      } else {
        throw new Error(submitResult.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSuccessMessage("");
      setErrorMessage(
        "There was an error processing your registration. " + error.message
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="registration-container mt-5">
      <div className="form-container">
        <h2 className="text-center mb-4 form-title">Registration Form</h2>
        <hr className="form-divider" />
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          {/* Section 1: Registration Number */}
          <div className="row mb-4 align-items-center">
            <div className="col-md-4">
              <label className="form-label">Registration Number</label>
              <div className="form-control-plaintext registration-number-display">
                {registrationNumber || "Generating..."}
              </div>
            </div>
          </div>

          {/* Section 2: Child's Information (4 Columns) */}
          <h5 className="section-title">Child Information</h5>
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="name_of_child"
                value={formData.name_of_child}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter child's name"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleDateChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Age</label>
              <input
                type="text"
                className="form-control age-display"
                value={
                  formData.age.year || formData.age.months || formData.age.days
                    ? `${formData.age.year} yrs, ${formData.age.months} mos, ${formData.age.days} days`
                    : ""
                }
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Gender <span className="text-danger">*</span></label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          
          {/* Section 3: Parent/Guardian Information (5 Columns, adjusted) */}
          <h5 className="section-title">Parent/Guardian Information</h5>
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Mother Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Mother Name"
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Father Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Father Name"
                required
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Guardian Name</label>
              <input
                type="text"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Guardian Name (if any)"
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Father Phone No.</label>
              <input
                type="text"
                name="father_phone_number"
                value={formData.father_phone_number}
                onChange={handleChange}
                className="form-control"
                placeholder="Father's phone"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Mother Phone No.</label>
              <input
                type="text"
                name="mother_phone_number"
                value={formData.mother_phone_number}
                onChange={handleChange}
                className="form-control"
                placeholder="Mother's phone"
              />
            </div>
          </div>

          {/* Section 4: Contact, Symptoms & Reason (4 Columns, adjusted) */}
          <h5 className="section-title">Visit Details & Contact</h5>
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Address <span className="text-danger">*</span></label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Enter address"
                required
              ></textarea>
            </div>
            <div className="col-md-3">
              <label className="form-label">E-Mail ID</label>
              <input
                type="email"
                name="mail_id"
                value={formData.mail_id}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter e-mail ID"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Duration of Symptoms</label>
              <textarea
                name="duration_of_symptoms"
                value={formData.duration_of_symptoms}
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Describe symptoms duration"
              ></textarea>
            </div>

            <div className="col-md-3">
              <label className="form-label">Previous Treatment Done</label>
              <textarea
                name="previous_treatment_done"
                value={formData.previous_treatment_done}
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Enter any previous treatments"
              ></textarea>
            </div>
          </div>
          
          {/* Section 5: Reason for Visit */}
          <div className="row mb-4">
            <div className="col-md-12">
              <label className="form-label">Reason for Visit</label>
              <select
                name="reason_for_visit"
                onChange={handleSelect}
                className="form-control"
                value="" // Control select state to allow repeated selection
              >
                <option value="" disabled>Select reasons (multiselect)</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Display Selected Options as Tags */}
              {Object.keys(formData.reason_for_visit).length > 0 && (
                <div className="mt-2 selected-reasons-container">
                  {Object.keys(formData.reason_for_visit).map(
                    (key, index) => (
                      <span key={index} className="reason-tag">
                        {options.find((o) => o.value === key)?.label}
                        <button
                          type="button"
                          onClick={() => handleRemove(key)}
                          className="remove-tag-btn"
                        >
                          &times;
                        </button>
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Source of Referral (4 Columns) */}
          <h5 className="section-title">Source of Referral</h5>
          <div className="row mb-4 align-items-center">
            <div className="col-md-4">
              <label className="form-label">Through Doctor (with Name)</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Select
                  options={doctorOptions}
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  isSearchable
                  placeholder="Select a doctor..."
                  styles={customSelectStyles}
                />

                <button 
                  type="button" 
                  onClick={handleAddDoctorReferral}
                 
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-md-2 form-check-container">
              <input
                type="checkbox"
                id="mediaAd"
                name="source_of_referral.ThroughMediaAdd"
                checked={formData.source_of_referral.ThroughMediaAdd}
                onChange={handleChange}
                className="form-check-input"
              />
              <label htmlFor="mediaAd" className="form-check-label">Through Media/Ad</label>
            </div>
            
            <div className="col-md-3 form-check-container">
              <input
                type="checkbox"
                id="friendsNeighbours"
                name="source_of_referral.ThroughFriendsNeighbours"
                checked={formData.source_of_referral.ThroughFriendsNeighbours}
                onChange={handleChange}
                className="form-check-input"
              />
              <label htmlFor="friendsNeighbours" className="form-check-label">
                Through Friends/Neighbours
              </label>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Others</label>
              <input
                type="text"
                name="source_of_referral.Others"
                value={formData.source_of_referral.Others}
                onChange={handleChange}
                className="form-control"
                placeholder="Specify if others"
              />
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button type="submit">
              Submit Registration
            </button>
            <button type="button"  onClick={printReport}>
              Print Receipt
            </button>
          </div>
        </form>
        
        {/* Referral Doctor Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Add Referral Doctor</h3>
              <form onSubmit={handleReferralSubmit}>
                <div className="input-group">
                  <label>Doctor Name: <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="doctorName"
                    value={referralDoctorData.doctorName}
                    onChange={handleReferralChange}
                    required
                  />
                </div>
                <div className="row">
                    <div className="col-md-6 input-group">
                      <label>Sex: <span className="text-danger">*</span></label>
                      <select
                        name="sex"
                        value={referralDoctorData.sex}
                        onChange={handleReferralChange}
                        
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                     <div className="col-md-6 input-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={referralDoctorData.email}
                        onChange={handleReferralChange}
                      />
                    </div>
                </div>

                <div className="input-group">
                  <label>Hospital Name: <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={referralDoctorData.hospitalName}
                    onChange={handleReferralChange}
                    required
                  />
                </div>

                <div className="row">
                    <div className="col-md-6 input-group">
                      <label>Area:</label>
                      <input
                        type="text"
                        name="area"
                        value={referralDoctorData.area}
                        onChange={handleReferralChange}
                      />
                    </div>

                    <div className="col-md-6 input-group">
                      <label>City:</label>
                      <input
                        type="text"
                        name="city"
                        value={referralDoctorData.city}
                        onChange={handleReferralChange}
                      />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 input-group">
                      <label>District:</label>
                      <input
                        type="text"
                        name="district"
                        value={referralDoctorData.district}
                        onChange={handleReferralChange}
                      />
                    </div>

                    <div className="col-md-6 input-group">
                      <label>Phone Number:</label>
                      <input
                        type="text" // Changed to text to allow for formatting/validation
                        name="phoneNumber"
                        value={referralDoctorData.phoneNumber}
                        onChange={handleReferralChange}
                        required
                      />
                    </div>
                </div>

                <div className="button-group">
                  <button type="submit" >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                   
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Image Container */}
      <div className="image-container">
        <img src={teddyBearImage} alt="Teddy Bear" />
      </div>
    </div>
  );
};
export default Registration;