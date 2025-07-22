import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import mdcLogo from "./Images/mdcLogo.png";
import teddyBearImage from "./Images/Teddy.png";
import "./Registration.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate at the top
import Select from "react-select";
import apiRequest from "./apiRequest";

const Registration = () => {
  const employeeName = localStorage.getItem("name");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [doctors, setDoctors] = useState([]); // State to store the list of doctors
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referralDoctorOptions, setReferralDoctorOptions] = useState([]);
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
    reason_for_visit: [], // Reset selection
    duration_of_symptoms: "",
    previous_treatment_done: "",
    // Amount: '',
    source_of_referral: {
      ThroughDoctorwithName: "",
      ThroughMediaAdd: false,
      ThroughFriendsNeighbours: false,
      Others: "",
    },
  });

  // State for referral doctor form (Separate DB Collection)
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
  }, []);
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
    const selectedDate = new Date(e.target.value); // Input value as Date object
    const today = new Date();

    // Calculate age
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

    // Format `selectedDate` to YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split("T")[0];

    setFormData((prevData) => ({
      ...prevData,
      dob: formattedDate, // Store dob as a properly formatted string
      age: {
        days,
        months,
        year: years,
      },
    }));
  };

  const printReport = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    // Assuming you have access to the logged-in employee's name (replace with your method of fetching it)
    <div>{employeeName}</div>; // Replace with the actual logged-in employee's name
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
                    border-bottom: 5px solid #2196F3;
                    padding-bottom: 10px;
                }
                .logo {
                    width: 120px;
                    height: auto;
                }
                .header-title {
                    font-size: 26px;
                    color: black;
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
                    border-left: 2px solid #005A37;
                    margin: 0 10px;
                }
                .container {
                    width: 80%;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
                    color: black; /* Changed to black */
                }
                table th {
                    background-color: #F2F2F2;
                    color: black;
                }
                table tr:nth-child(even) {
                    background-color: #F2F2F2;
                }
                table tr:hover {
                    background-color: #ddd;
                }
                .footer {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    text-align: center;
                    font-size: 16px;
                    color: black;
                    width: 200px;
                }

                .signature-label {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .employee-name {
                    font-size: 18px;
                    font-weight: normal;
                }


                .no-print {
                    display: none;
                }
                @media print {
                    .no-print {
                        display: none;
                    }
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
                    <h2 class="header-title">Registration Reciept</h2>
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
                              Object.keys(formData.reason_for_visit).length > 0
                                ? Object.keys(formData.reason_for_visit)
                                    .map(
                                      (key) =>
                                        options.find((o) => o.value === key)
                                          ?.label
                                    )
                                    .join(", ")
                                : "N/A"
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
                <!-- Footer with Employee Signature -->
                <div class="footer">
                    <div class="signature-label">Signature of Employee</div>
                    <div class="employee-name">${employeeName}</div>
                </div>

            </body>
            </html>
        `;
    // Write the content to the print window and trigger the print dialog
    printWindow.document.write(printableContent);
    // Ensure that the content is fully loaded before triggering print dialog
    setTimeout(() => {
      printWindow.document.close(); // Close the document to ensure it's fully loaded
      printWindow.print(); // Trigger the print dialog
    }, 1000); // Delay by 1 second to allow content to load
  };

  // Fetch doctors from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiRequest(
          `${Milestonebaseurl}referral-doctor/list/`
        );

        // Check if the API call was successful
        if (response.success) {
          setDoctors(response.data);
        } else {
          // Handle API errors
          console.error("API Error:", response.error);
          // You could set an error state here
          // setError(response.error);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        // You could set an error state here
        // setError("Network error occurred while fetching doctors");
      }
    };

    fetchDoctors();
  }, []);

  // Handle option selection
  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !formData.reason_for_visit[value]) {
      // Avoid duplicate selections
      setFormData((prevData) => ({
        ...prevData,
        reason_for_visit: {
          ...prevData.reason_for_visit,
          [value]: true, // Store as an object with key-value pair
        },
      }));
    }
  };

  // Handle removing selected item
  const handleRemove = (key) => {
    const updatedReasonForVisit = { ...formData.reason_for_visit };
    delete updatedReasonForVisit[key]; // Remove the key
    setFormData((prevData) => ({
      ...prevData,
      reason_for_visit: updatedReasonForVisit,
    }));
  };
  useEffect(() => {
    if (selectedDoctor) {
      setFormData((prevData) => ({
        ...prevData,
        source_of_referral: {
          ...prevData.source_of_referral,
          ThroughDoctorwithName: selectedDoctor.label, // Prefill doctor name
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

    // Ensure the selected doctor is stored in formData
    setFormData((prevData) => ({
      ...prevData,
      source_of_referral: {
        ...prevData.source_of_referral,
        ThroughDoctorwithName: selectedOption ? selectedOption.label : "",
      },
    }));
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
      email: referralDoctorData.email || "", // Optional field, can be empty
    };

    const result = await apiRequest(
      `${Milestonebaseurl}referral-doctor/register/`,
      "POST",
      snakeCaseData
    );

    if (result.success) {
      alert("Referral Doctor registered successfully!");

      const newDoctor = {
        value: referralDoctorData.doctorName,
        label: `${referralDoctorData.doctorName}`,
      };

      setReferralDoctorOptions((prev) => [...prev, newDoctor]);
      setSelectedDoctor(newDoctor);
      setIsModalOpen(false);

      setReferralDoctorData({
        doctorName: "",
        hospitalName: "",
        area: "",
        city: "",
        district: "",
        phoneNumber: "",
      });
    } else {
      console.error("Error:", result.error);
      alert("Error in registration.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting formData:", formData); // Debugging

    try {
      // Get registration number
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
          ThroughDoctorwithName:
            selectedDoctor?.label ||
            formData.source_of_referral.ThroughDoctorwithName ||
            "",
        },
      };

      console.log("Final data before submission:", updatedFormData); // Debugging

      // Submit registration
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
          reason_for_visit: [],
          duration_of_symptoms: "",
          previous_treatment_done: "",
          source_of_referral: {
            ThroughDoctorwithName: null, // Reset doctor selection
            ThroughMediaAdd: false,
            ThroughFriendsNeighbours: false,
            Others: null,
          },
        });

        setSuccessMessage("Registration successful!");
        setErrorMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast

        setTimeout(() => {
          setSuccessMessage("");
          window.location.reload();
        }, 5000);
      } else {
        throw new Error(submitResult.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSuccessMessage("");
      setErrorMessage("There was an error processing your registration.");
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
    }
  };

  return (
    <div className="registration-container mt-5">
      <div className="form-container">
        <h2 className="text-center mb-4">Child Registration Form</h2>
        <hr />
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
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Registration Number</label>
              <div className="form-control-plaintext">
                {registrationNumber || "Generating..."}
              </div>
            </div>
          </div>
          <br />

          {/* <h5 className="card-title">Child's Information</h5> */}
          <div className="row mb-3">
            <div className="col-md-3">
              <label>Name of the Child</label>
              <input
                type="text"
                name="name_of_child"
                onChange={handleChange}
                className="form-control"
                placeholder="Enter child's name"
                required
              />
            </div>

            <div className="col-md-3">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                onChange={handleDateChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-3">
              <label>Age</label>
              <input
                type="text"
                className="form-control"
                value={
                  formData.age.year || formData.age.months || formData.age.days
                    ? `${formData.age.year} years, ${formData.age.months} months, ${formData.age.days} days`
                    : ""
                }
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label>Gender</label>
              <select
                name="sex"
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <br />

          <div className="row mb-3">
            <div className="col-md-2">
              <label>Mother Name</label>
              <input
                type="text"
                name="mother_name"
                onChange={handleChange}
                className="form-control"
                placeholder="Mother Name"
                required
              />
            </div>

            <div className="col-md-2">
              <label>Father Name</label>
              <input
                type="text"
                name="father_name"
                onChange={handleChange}
                className="form-control"
                placeholder="Father Name"
                required
              />
            </div>

            <div className="col-md-2">
              <label>Guardian Name</label>
              <input
                type="text"
                name="guardian_name"
                onChange={handleChange}
                className="form-control"
                placeholder="Guardian Name"
              />
            </div>

            <div className="col-md-3">
              <label>Father Phone Number</label>
              <input
                type="text"
                name="father_phone_number"
                onChange={handleChange}
                className="form-control"
                placeholder="Enter phone number"
              />
            </div>
            <div className="col-md-3">
              <label>Mother Phone Number</label>
              <input
                type="text"
                name="mother_phone_number"
                onChange={handleChange}
                className="form-control"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <br />

          {/* <h5 className="card-title">Contact Information</h5> */}
          <div className="row mb-3">
            <div className="col-md-2">
              <label>Address</label>
              <textarea
                name="address"
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Enter address"
                required
              ></textarea>
            </div>
            <div className="col-md-3">
              <label>E-Mail ID</label>
              <input
                type="text"
                name="mail_id"
                onChange={handleChange}
                className="form-control"
                placeholder="Enter e-mail ID"
              />
            </div>
            <div className="col-md-2">
              <label>Duration of Symptoms</label>
              <textarea
                name="duration_of_symptoms"
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Describe symptoms duration"
              ></textarea>
            </div>

            <div className="col-md-3">
              <label>Previous Treatment Done</label>
              <textarea
                name="previous_treatment_done"
                onChange={handleChange}
                className="form-control"
                rows="2"
                placeholder="Enter any previous treatments"
              ></textarea>
            </div>
            <div className="col-md-2">
              <label>Reason for Visit</label>
              <select
                name="reason_for_visit"
                onChange={handleSelect}
                className="form-control"
              >
                <option value="">Select</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Display Selected Options */}
              {Object.keys(formData.reason_for_visit).length > 0 && (
                <div className="mt-2">
                  <strong>Selected:</strong>
                  <ul>
                    {Object.keys(formData.reason_for_visit).map(
                      (key, index) => (
                        <li key={index} className="d-flex align-items-center">
                          {options.find((o) => o.value === key)?.label}
                          <button
                            onClick={() => handleRemove(key)}
                            style={{
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "8px",
                            }}
                          >
                            -
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <br />

          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Through Doctor (with Name)</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "5px",
                  width: "270px",
                  backgroundColor: "white",
                }}
              >
                <Select
                  options={doctorOptions}
                  value={selectedDoctor}
                  onChange={handleDoctorChange} // Update formData when doctor is selected
                  isSearchable
                  placeholder="Select a doctor..."
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      flex: 1,
                    }),
                    control: (provided) => ({
                      ...provided,
                      border: "none",
                      boxShadow: "none",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: "200px",
                    }),
                  }}
                />

                <button type="button" onClick={handleAddDoctorReferral}>
                  +
                </button>
                {/* Referral Doctor Modal */}
                {isModalOpen && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h3>Add Referral Doctor</h3>
                      <form>
                        <div className="input-group">
                          <label>Doctor Name:</label>
                          <input
                            type="text"
                            name="doctorName"
                            value={referralDoctorData.doctorName}
                            onChange={handleReferralChange}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>Sex:</label>
                          <select
                            name="sex"
                            value={referralDoctorData.sex}
                            onChange={handleReferralChange}
                            required
                          >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div className="input-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={referralDoctorData.email}
                            onChange={handleReferralChange}
                          />
                        </div>

                        <div className="input-group">
                          <label>Hospital Name:</label>
                          <input
                            type="text"
                            name="hospitalName"
                            value={referralDoctorData.hospitalName}
                            onChange={handleReferralChange}
                            required
                          />
                        </div>

                        <div className="input-group">
                          <label>Area:</label>
                          <input
                            type="text"
                            name="area"
                            value={referralDoctorData.area}
                            onChange={handleReferralChange}
                          />
                        </div>

                        <div className="input-group">
                          <label>City:</label>
                          <input
                            type="text"
                            name="city"
                            value={referralDoctorData.city}
                            onChange={handleReferralChange}
                          />
                        </div>

                        <div className="input-group">
                          <label>District:</label>
                          <input
                            type="text"
                            name="district"
                            value={referralDoctorData.district}
                            onChange={handleReferralChange}
                          />
                        </div>

                        <div className="input-group">
                          <label>Phone Number:</label>
                          <input
                            type="number"
                            name="phoneNumber"
                            value={referralDoctorData.phoneNumber}
                            onChange={handleReferralChange}
                          />
                        </div>

                        <div className="button-group">
                          <button type="submit" onClick={handleReferralSubmit}>
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

                {/* Modal Styling */}
                <style>
                  {`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 10px;
      width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
    }
    .input-group label {
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
    }
    .input-group input,
    .input-group select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: #007bff;
    }
    .button-group {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    .button-group button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .button-group button[type="submit"] {
      background-color: #007bff;
      color: white;
    }
    .button-group button[type="button"] {
      background-color: #6c757d;
      color: white;
    }
    .button-group button:hover {
      opacity: 0.8;
    }
  `}
                </style>
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-center">
              <input
                style={{ borderColor: "black" }}
                type="checkbox"
                name="source_of_referral.ThroughMediaAdd"
                onChange={handleChange}
                className="form-check-input me-2"
              />
              <label className="form-check-label">Through Media/Ad</label>
            </div>
            <div className="col-md-3 d-flex align-items-center">
              <input
                style={{ borderColor: "black" }}
                type="checkbox"
                name="source_of_referral.ThroughFriendsNeighbours"
                onChange={handleChange}
                className="form-check-input me-2"
              />
              <label className="form-check-label">
                Through Friends/Neighbours
              </label>
            </div>
            <div className="col-md-3">
              <label className="form-label">Others</label>
              <input
                type="text"
                name="source_of_referral.Others"
                onChange={handleChange}
                className="form-control"
                placeholder="Specify if others"
              />
            </div>
          </div>
          <br />
          <div className="d-flex justify-content-center gap-3">
            <button type="submit" className="mb-3">
              Submit
            </button>
            <button type="button" className="mb-3 ms-2" onClick={printReport}>
              Print Report
            </button>
          </div>
        </form>
        <div className="image-container">
          <img src={teddyBearImage} alt="Teddy Bear" />
        </div>
      </div>
    </div>
  );
};
export default Registration;
