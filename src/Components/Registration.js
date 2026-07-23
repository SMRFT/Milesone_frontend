import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import mdcLogo from "./Images/mdcLogo.png";
import teddyBearImage from "./Images/Teddy.png";
import "./Registration.css"; // We will update the content of this file
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";

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
  const navigate = useNavigate();
  const location = useLocation();
  // When navigated here from the patient table's edit icon, PatientEdit.js
  // passes the full record via location.state.editItem. Its presence puts
  // this page into edit mode: the form is prefilled and Submit performs a
  // PATCH to update that record instead of creating a new registration.
  const editItem = location.state?.editItem || null;
  const isEditMode = Boolean(editItem);

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

  // Converts a stored reason_for_visit array (e.g. ["Language Delay",
  // "Others(Fever)"]) back into the {key: true} shape the form uses, plus
  // the free-text that followed "Others(...)" if present.
  const buildReasonForVisitState = (reasonArray) => {
    const reasonState = {};
    let otherText = "";
    (reasonArray || []).forEach((reason) => {
      const othersMatch = typeof reason === "string" && reason.match(/^Others\((.*)\)$/);
      if (othersMatch) {
        reasonState["Others"] = true;
        otherText = othersMatch[1];
      } else if (options.some((o) => o.value === reason)) {
        reasonState[reason] = true;
      } else {
        reasonState["Others"] = true;
        otherText = reason;
      }
    });
    return { reasonState, otherText };
  };

  const [formData, setFormData] = useState(() => {
    if (editItem) {
      const { reasonState, otherText } = buildReasonForVisitState(
        editItem.reason_for_visit
      );
      return {
        salutation: editItem.salutation || "",
        name_of_child: editItem.name_of_child || "",
        dob: editItem.dob || "",
        age: editItem.age || { days: "", months: "", year: "" },
        sex: editItem.sex || "",
        mother_name: editItem.mother_name || "",
        father_name: editItem.father_name || "",
        guardian_name: editItem.guardian_name || "",
        husband_name: editItem.husband_name || "",
        address: editItem.address || "",
        mail_id: editItem.mail_id || "",
        mother_phone_number: editItem.mother_phone_number || "",
        father_phone_number: editItem.father_phone_number || "",
        reason_for_visit: reasonState,
        other_reason_text: otherText,
        duration_of_symptoms: editItem.duration_of_symptoms || "",
        previous_treatment_done: editItem.previous_treatment_done || "",
        source_of_referral: {
          ThroughDoctorwithName:
            editItem.source_of_referral?.ThroughDoctorwithName || "",
          ThroughMediaAdd:
            editItem.source_of_referral?.ThroughMediaAdd || false,
          ThroughFriendsNeighbours:
            editItem.source_of_referral?.ThroughFriendsNeighbours || false,
          Others: editItem.source_of_referral?.Others || "",
        },
      };
    }
    return {
      salutation: "",
      name_of_child: "",
      dob: "",
      age: { days: "", months: "", year: "" },
      sex: "",
      mother_name: "",
      father_name: "",
      guardian_name: "",
      husband_name: "",
      address: "",
      mail_id: "",
      mother_phone_number: "",
      father_phone_number: "",
      reason_for_visit: {}, // Changed from [] to {} for object structure
      other_reason_text: "",
      duration_of_symptoms: "",
      previous_treatment_done: "",
      source_of_referral: {
        ThroughDoctorwithName: "",
        ThroughMediaAdd: false,
        ThroughFriendsNeighbours: false,
        Others: "",
      },
    };
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

  const [registrationNumber, setRegistrationNumber] = useState(
    editItem?.registration_number || ""
  );
  useEffect(() => {
    // In edit mode we're updating the existing record, so keep its
    // registration number instead of generating a new one.
    if (isEditMode) return;

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
  }, [Milestonebaseurl, isEditMode]); // Added dependency

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
    // Helper function for the receipt
    const formatReasonForVisit = (reasonObject) => {
      return Object.keys(reasonObject)
        .map((key) => {
          const label = options.find((o) => o.value === key)?.label || key;
          
          // Check if this is "Others" and we have text
          if (key === "Others" && formData.other_reason_text) {
            return `Others(${formData.other_reason_text})`;
          }
          return label;
        })
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

  // Once the doctor list loads, preselect the referral doctor for edit mode
  // so the dropdown reflects the record's existing source_of_referral.
  useEffect(() => {
    if (!isEditMode || selectedDoctor || doctors.length === 0) return;
    const existingDoctorName = editItem?.source_of_referral?.ThroughDoctorwithName;
    if (!existingDoctorName) return;
    const match = doctors.find((d) => d.doctor_name === existingDoctorName);
    if (match) {
      setSelectedDoctor({ value: match.id, label: match.doctor_name });
    }
  }, [doctors, isEditMode, editItem, selectedDoctor]);

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
    
    setFormData((prevData) => {
      const newState = {
        ...prevData,
        reason_for_visit: updatedReasonForVisit,
      };

      // If they removed "Others", clear the text input
      if (key === "Others") {
        newState.other_reason_text = "";
      }

      return newState;
    });
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
      // --- LOGIC TO FORMAT "Others(Reason)" ---
      // Convert the object keys (e.g., { "Language Delay": true }) into an array
      let formattedReasons = Object.keys(formData.reason_for_visit).map((key) => {
        // If the key is 'Others' AND the user typed something
        if (key === "Others" && formData.other_reason_text) {
          return `Others(${formData.other_reason_text})`; // Returns "Others(Fever)"
        }
        return key; // Returns normal value like "Language Delay"
      });

      if (isEditMode) {
        // --- UPDATE EXISTING REGISTRATION ---
        const updatedFormData = {
          ...formData,
          reason_for_visit: formattedReasons,
          source_of_referral: {
            ...formData.source_of_referral,
            ThroughDoctorwithName: selectedDoctor?.label || "",
          },
        };
        delete updatedFormData.other_reason_text;

        const updateResult = await apiRequest(
          `${Milestonebaseurl}update-patient/${registrationNumber}/`,
          "PATCH",
          updatedFormData
        );

        if (!updateResult.success) {
          throw new Error(updateResult.error || "Update failed");
        }

        toast.success(
          `Patient information updated! No: ${registrationNumber}`,
          {
            autoClose: 3000,
            position: "top-right",
            hideProgressBar: false,
          }
        );

        setErrorMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Return to the patient list so the updated row is visible.
        setTimeout(() => {
          navigate(-1);
        }, 1500);
        return;
      }

      // --- CREATE NEW REGISTRATION ---
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
        reason_for_visit: formattedReasons,
        source_of_referral: {
          ...formData.source_of_referral,
          ThroughDoctorwithName: selectedDoctor?.label || "",
        },
      };

      delete updatedFormData.other_reason_text;

      const submitResult = await apiRequest(
        `${Milestonebaseurl}register/`,
        "POST",
        updatedFormData
      );

      if (submitResult.success) {
        setFormData({
          salutation: "",
          name_of_child: "",
          dob: "",
          age: { year: "", months: "", days: "" },
          sex: "",
          mother_name: "",
          father_name: "",
          guardian_name: "",
          husband_name: "",
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
        toast.success(
          `Registration successful! No: ${newRegistrationNumber}`,
            {
            autoClose: 3000, // Sets the progress bar/timer on the toast
            position: "top-right", // Optional: ensures visibility
            hideProgressBar: false,
          }          
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
      
      const message = "There was an error processing your registration. " + error.message;

      // Update state (keeps your existing UI alert)
      setErrorMessage(message);

      // Add Toast Notification
      toast.error(message, {
        autoClose: 5000, // 5 seconds to read the error
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="registration-container mt-5">
      <div className="form-container">
        <h2 className="text-center mb-4 form-title">
          {isEditMode ? "Edit Patient Registration" : "Registration Form"}
        </h2>
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
          <h5 className="section-title">Information</h5>
          <div className="row mb-4">
            <div className="col-md-2">
              <label className="form-label">Salutation</label>
              <select
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select</option>
                <option value="Master">Master</option>
                <option value="Baby of">Baby of</option>
                <option value="Miss">Miss</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="name_of_child"
                value={formData.name_of_child}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter name"
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
              <label className="form-label">Husband Name</label>
              <input
                type="text"
                name="husband_name"
                value={formData.husband_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Husband Name (if any)"
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
      value=""
    >
      <option value="" disabled>Select reasons (multiselect)</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    {/* Display Selected Tags */}
    {Object.keys(formData.reason_for_visit).length > 0 && (
      <div className="mt-2 selected-reasons-container">
        {Object.keys(formData.reason_for_visit).map((key, index) => (
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
        ))}
      </div>
    )}

    {/* --- INPUT FIELD FOR OTHERS --- */}
    {/* Only show this input if 'Others' is in the reason_for_visit object */}
    {formData.reason_for_visit["Others"] && (
      <div className="mt-2">
        <label className="form-label text-muted small">Specify Other Reason:</label>
        <input
          type="text"
          name="other_reason_text"
          value={formData.other_reason_text}
          onChange={handleChange} // Uses your existing generic handleChange
          className="form-control"
          placeholder="Enter the reason"
          required // Optional: makes it mandatory if Others is selected
        />
      </div>
    )}
    {/* ----------------------------- */}
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
              {isEditMode ? "Update Registration" : "Submit Registration"}
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