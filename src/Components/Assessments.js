import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import mdcLogo from "./Images/mdcLogo.png";
import { useNavigate } from "react-router-dom";
import { Row, Col, Toast, ToastContainer, Modal } from "react-bootstrap";
import styled, { ThemeProvider } from "styled-components";
import { User, ArrowLeft } from "lucide-react";
import {
  speechAssessments,
  psychologicalAssessments,
  drsConsulting,
  otAssessments,
  physioTherapyAssessments,
} from "./milestoneBilling"; // Import constants

// Theme
const theme = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    accent: "#4895ef",
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#555",
    textLight: "#6c757d",
    success: "#4caf50",
    error: "#f44336",
    border: "#dee2e6",
    borderLight: "#e9ecef",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
    medium: "0 4px 8px rgba(0,0,0,0.12)",
    large: "0 8px 16px rgba(0,0,0,0.15)",
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px",
    round: "50%",
  },
  transitions: {
    default: "all 0.3s ease",
  },
};
// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) => props.theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;
const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.default};

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: white;
  }
`;

const PatientCard = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  box-shadow: ${(props) => props.theme.shadows.small};
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid ${(props) => props.theme.colors.primary};
`;

const PatientCardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  margin-top: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PatientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const PatientInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const PatientInfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: 0.25rem;
  text-transform: uppercase;
`;

const PatientInfoValue = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  border-color: #557153; /* Change color on focus */
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const RadioLabel = styled.label`
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  input {
    margin-right: 8px;
  }
`;

// Styled Toast for bigger size
const CustomToast = styled(Toast)`
  max-width: 100%;
  font-size: 1.1em;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #557153;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const AssessmentRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-start;
`;

const AssessmentCol = styled.div`
  flex: 1;
`;

const Assessments = () => {
  const employeeName = localStorage.getItem("name");
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = location.state;
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  // State for assessments and billing
  const [assessmentSelections, setAssessmentSelections] = useState({
    Speech: {
      assessment: "",
      price: 0,
      consultant: "",
      consultantPrice: 0,
      doctor: null,
    },
    Psychological: {
      assessment: "",
      price: 0,
      consultant: "",
      consultantPrice: 0,
      doctor: null,
    },
    OT: {
      assessment: "",
      price: 0,
      consultant: "",
      consultantPrice: 0,
      doctor: null,
    },
    PT: {
      assessment: "",
      price: 0,
      consultant: "",
      consultantPrice: 0,
      doctor: null,
    },
  });

  const [discountRemarks, setDiscountRemarks] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [doctors, setDoctors] = useState([]);

  // Toast and modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [doctorSuccessMessage, setDoctorSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorModalSuccess, setDoctorModalSuccess] = useState(false);

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    designation: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Format current date
    const currentDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setFormData((prevData) => ({
      ...prevData,
      currentDate: currentDate,
    }));
  }, []);

  const [formData, setFormData] = useState({ billingNo: "" });

  useEffect(() => {
    axios
      .get(`${Milestonebaseurl}get-latest-billing-no/`)
      .then((response) => {
        console.log(response.data); // Debugging
        if (response.data.billing_no) {
          setFormData((prevData) => ({
            ...prevData,
            billingNo: response.data.billing_no,
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching billing number:", error);
      });
  }, []);

  // First, add this to your state declarations
  const [additionalConsultation, setAdditionalConsultation] = useState({
    consultant: "",
    consultantPrice: 0,
    doctor: null,
  });

  const [additionalConsultations, setAdditionalConsultations] = useState([]);
  // Add these handler functions
  const handleAdditionalConsultantChange = (value) => {
    const selectedItem = assessmentCategories.Consultant?.find(
      (item) => item.name === value
    );
    let itemPrice =
      selectedItem && typeof selectedItem.rate === "number"
        ? selectedItem.rate
        : 0;

    setAdditionalConsultation((prev) => ({
      ...prev,
      consultant: value,
      consultantPrice: itemPrice,
    }));
  };

  const handleAddAdditionalConsultation = () => {
    if (!additionalConsultation.consultant || !additionalConsultation.doctor) {
      alert("Please select both consultant and doctor.");
      return;
    }

    setAdditionalConsultations((prev) => [...prev, additionalConsultation]);
  };
  const handleAdditionalConsultantPriceChange = (price) => {
    setAdditionalConsultation((prev) => ({
      ...prev,
      consultantPrice: price,
    }));
  };

  const handleAdditionalDoctorChange = (value) => {
    const selectedDoctor = doctors.find((item) => item.name === value);

    setAdditionalConsultation((prev) => ({
      ...prev,
      doctor: selectedDoctor,
    }));
  };

  // Add this function to handle removing the additional consultation
  const handleRemoveAdditionalConsultation = (index) => {
    setAdditionalConsultations((prev) => prev.filter((_, i) => i !== index));
  };

  // Current category for adding doctor
  const [currentCategory, setCurrentCategory] = useState("");

  // Assessment categories
  const assessmentCategories = {
    Speech: speechAssessments,
    Psychological: psychologicalAssessments,
    OT: otAssessments,
    PT: physioTherapyAssessments,
    Consultant: drsConsulting,
  };

  // Handle assessment selection
  const handleAssessmentChange = (category, value) => {
    const selectedItem = assessmentCategories[category]?.find(
      (item) => item.name === value
    );
    const itemPrice =
      selectedItem && typeof selectedItem.rate === "number"
        ? selectedItem.rate
        : 0;

    setAssessmentSelections((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        assessment: value,
        price: itemPrice,
      },
    }));
  };

  // Handle consultant selection
  const handleConsultantChange = (category, value) => {
    const selectedItem = assessmentCategories.Consultant?.find(
      (item) => item.name === value
    );
    let itemPrice =
      selectedItem && typeof selectedItem.rate === "number"
        ? selectedItem.rate
        : 0;

    setAssessmentSelections((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        consultant: value,
        consultantPrice: itemPrice,
      },
    }));
  };
  // Handle Doctor selection
  const handleDoctorChange = (category, value) => {
    const selectedDoctor = doctors.find((item) => item.name === value); // Use doctors instead of assessmentCategories.doctor

    setAssessmentSelections((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        doctor: selectedDoctor, // Store doctor separately from consultant
      },
    }));
  };

  // Handle consultant price selection (for radio buttons)
  const handleConsultantPriceChange = (category, price) => {
    setAssessmentSelections((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        consultantPrice: price,
      },
    }));
  };

  // Open doctor modal
  const handleOpenDoctorModal = (category) => {
    setCurrentCategory(category);
    setDoctorForm({
      name: "",
      designation: "",
      phone: "",
      address: "",
    });
    setShowDoctorModal(true);
  };

  // Handle doctor form input changes
  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchConsultingDoctors = async () => {
    try {
      const response = await axios.get(
        `${Milestonebaseurl}get-consulting-doctors/`
      );
      setDoctors(response.data); // Assuming you have a state variable `doctors`
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchConsultingDoctors();
  }, []);

  // Save doctor
  const handleSaveDoctor = async () => {
    try {
      const response = await axios.post(
        `${Milestonebaseurl}save-consulting-doctor/`,
        doctorForm,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        setDoctorSuccessMessage("Doctor Added Successfully"); // Show success message

        fetchConsultingDoctors(); // Refresh doctor list after adding

        // Hold modal open for 5 seconds before closing
        setTimeout(() => {
          setShowDoctorModal(false); // Close modal after 5 seconds
          setDoctorSuccessMessage(""); // Clear success message
        }, 5000);
      }
    } catch (error) {
      console.error("Error saving doctor:", error);
      setShowError(true); // Show error message
    }
  };

  // Remove assessment row
  const handleRemoveRow = (category) => {
    setAssessmentSelections((prev) => ({
      ...prev,
      [category]: {
        assessment: "",
        price: 0,
        consultant: "",
        consultantPrice: 0,
        doctor: null,
      },
    }));
  };

  // Calculate total price

  useEffect(() => {
    let total = 0;

    // Sum all selected assessments prices
    Object.values(assessmentSelections).forEach((row) => {
      total += (row.price || 0) + (row.consultantPrice || 0);
    });

    // Sum all additional consultations
    additionalConsultations.forEach((consultation) => {
      total += consultation.consultantPrice || 0;
    });

    const discountedPrice = total - (discount ? Number(discount) : 0);
    setTotalPrice(total);
    setFinalAmount(discountedPrice);
  }, [assessmentSelections, additionalConsultations, discount]);

  const handlePrintBill = (category, selection) => {
    const printWindow = window.open("", "", "width=800,height=600");

    // Calculate total assessment price
    let totalAssessmentPrice = 0;
    Object.values(assessmentSelections).forEach((selection) => {
      if (selection.assessment) {
        totalAssessmentPrice += selection.price || 0;
      }
    });

    // Calculate total consultant price
    let totalConsultantPrice = 0;
    Object.values(assessmentSelections).forEach((selection) => {
      if (selection.consultant) {
        totalConsultantPrice += selection.consultantPrice || 0;
      }
    });

    // Add additional consultations to total consultant price
    additionalConsultations.forEach((consultation) => {
      totalConsultantPrice += consultation.consultantPrice || 0;
    });

    // Create the simplified assessments table with just two rows
    const simplifiedTable = `
      <tr>
        <td style="text-align: center;">Assessment</td>
        <td style="text-align: right;"><strong>₹${totalAssessmentPrice}</strong></td>
      </tr>
      <tr>
        <td style="text-align: center;">Consultation</td>
        <td style="text-align: right;"><strong>₹${totalConsultantPrice}</strong></td>
      </tr>
    `;

    // Display Discount, Final Amount, and Payment Method in a single row
    const summaryRow = `
      <tr>
        <td style="text-align: right;"><strong>Total Price</strong></td>
        <td style="text-align: right;"><strong>₹${totalPrice}</strong></td>
      </tr>
      ${
        Number(discount) !== 0
          ? `
        <tr>
          <td style="text-align: right;"><strong>Discount</strong></td>
          <td style="text-align: right;">₹${discount}</td>
        </tr>
        <tr>
          <td style="text-align: right;"><strong>Final Amount</strong></td>
          <td style="text-align: right;"><strong>₹${finalAmount}</strong></td>
        </tr>
        `
          : ""
      }
      <tr>
        <td style="text-align: right;"><strong>Payment Method</strong></td>
        <td style="text-align: right;">${paymentMethod}</td>
      </tr>
    `;

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
                  margin-bottom: 5px;
                  border-bottom: 2px solid #2196F3;
                  padding-bottom: 5px;
              }                 
              .logo {
                  width: 100px;
                  height: 40px;
              }
              .header-title {
                  font-size: 10px;
                  color: black;
                  text-align: center;
                  flex-grow: 1;
                  margin: 0;
              }
              .contact-details {
                  display: flex;
                  justify-content: space-between;
                  width: 400px;
                  font-size: 10px;
                  line-height: 1.0;
                  color: black;
              }
              .contact-info {
                  display: flex;
                  flex-direction: column;
              }
              .contact-info div {
                  margin: 5px 16px;
              }
              .vertical-line {
                  border-left: 2px solid #005A37;            
              }
              .container {
                  width: 100%;
                  margin: 0 auto;
                  background-color: #FFFFFF;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
  
              h2 {
                  font-size: 14px;
                  text-align: center;
                  margin-top: 0;
                  margin-bottom: 5px;
              }
              h3 {
                  font-size: 12px;                 
              }
                  
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
              }
              table th, table td {
                  padding: 4px; /* Reduce padding to minimize row height */
                  font-size: 10px; /* Reduce font size */
                  line-height: 1.0; /* Adjust line height to reduce spacing */
                  text-align: left;
                  border: 1px solid #ddd;
                  color: black;
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
                  font-size: 10px;
                  color: black;
                  width: 200px;
                  page-break-after: avoid; /* Prevents breaking after */
              }
  
              .signature-label {
                  font-weight: bold;
                  margin-bottom: 5px;
              }
  
              .employee-name {
                  font-size: 10px;
                  font-weight: normal;
              }
                  .footer:not(:last-of-type) {
                    display: none;
                  }
  
  
              .no-print {
                  display: none;
              }
              @media print {                 
                  .container {
                      box-shadow: none;
                  }
                      .footer {   
                    
                  }             
                  /* Hide the footer on all pages except the last */
                  
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
              <h2> Assessment Receipt</h2>
              <h3>Patient Information</h3>
              <table>
              <tr><th>Date</th><td>${formData.currentDate || "N/A"}</td></tr>
                  <tr><th>Bill Number</th><td>${
                    formData.billingNo || "N/A"
                  }</td></tr>
                  <tr><th>Registration Number</th><td>${
                    patient.registration_number || "N/A"
                  }</td></tr>
                  <tr><th>Name of the Child</th><td>${
                    patient.name_of_child || "N/A"
                  }</td></tr>
                  <tr><th>Age</th><td>${patient.age?.year || 0} years, ${
      patient.age?.months || 0
    } months, ${patient.age?.days || 0} days</td></tr>
                  <tr><th>Sex</th><td>${
                    patient.sex || "N/A"
                  }</td></tr>                
              </table>
              <h3>Assessment Details</h3>
              <table>
                  <tr>                 
                      <th style="text-align: center;">Particulars</th>                                                            
                      <th style="text-align: center;">Charge</th>
                  </tr>
                  ${simplifiedTable}
                  ${summaryRow}
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

  // Modify your handleSubmit function to include additional consultation
  const handleSubmit = () => {
    let isValid = true;
    let rowErrors = {}; // Store errors for each selected row separately

    // Validate payment method
    if (!paymentMethod) {
      alert("Please select a Payment Method.");
      return;
    }

    // Create assessment array for payload
    const assessmentsArray = [];

    Object.entries(assessmentSelections).forEach(([category, selection]) => {
      // Only validate rows that have at least one field selected
      if (selection.consultant || selection.doctor?.name) {
        let missingFields = [];
        if (!selection.assessment) {
          missingFields.push("assessment");
        }

        if (!selection.consultant) {
          missingFields.push("Consultant");
        }
        if (!selection.doctor?.name) {
          missingFields.push("Consulting Doctor");
        }
        if (
          (selection.consultant === "Online" ||
            [
              "Pediatrician",
              "OT",
              "Speech",
              "Clinical Psychology",
              "Physio Therapy",
              "Special Education",
            ].includes(selection.consultant)) &&
          !selection.consultantPrice
        ) {
          missingFields.push("Consultant Price");
        }

        if (missingFields.length > 0) {
          rowErrors[category] = missingFields; // Store missing fields per row
        } else {
          // If row is valid, add it to the assessment array
          assessmentsArray.push({
            category,
            assessment: selection.assessment,
            assessmentPrice: selection.price || 0, // Ensure it's not undefined
            consultant: selection.consultant,
            consultantPrice: selection.consultantPrice || 0, // Ensure it's not undefined
            doctor: selection.doctor ? selection.doctor.name : null,
            totalPrice:
              (selection.price || 0) + (selection.consultantPrice || 0),
          });
        }
      }
    });

    // Process additional consultations (Fix: Include all additional consultations)
    const additionalConsultationsArray = additionalConsultations
      .map((consultation) => {
        let missingFields = [];

        if (!consultation.consultant) {
          missingFields.push("Additional Consultant");
        }
        if (!consultation.doctor?.name) {
          missingFields.push("Additional Consulting Doctor");
        }
        if (
          (consultation.consultant === "Online" ||
            [
              "Pediatrician",
              "OT",
              "Speech",
              "Clinical Psychology",
              "Physio Therapy",
              "Special Education",
            ].includes(consultation.consultant)) &&
          !consultation.consultantPrice
        ) {
          missingFields.push("Additional Consultant Price");
        }
        if (missingFields.length > 0) {
          rowErrors[`Additional Consultation ${consultation.consultant}`] =
            missingFields;
          return null; // Exclude invalid consultations
        }

        return {
          category: "Consultation",
          consultant: consultation.consultant,
          consultantPrice: consultation.consultantPrice || 0,
          doctor: consultation.doctor ? consultation.doctor.name : null,
          totalPrice: consultation.consultantPrice || 0,
        };
      })
      .filter(Boolean); // Remove null values

    // Merge additional consultations into assessments array
    const finalAssessmentsArray = [
      ...assessmentsArray,
      ...additionalConsultationsArray,
    ];

    // Display alerts row by row (only for selected rows with missing fields)
    if (Object.keys(rowErrors).length > 0) {
      isValid = false;
      Object.entries(rowErrors).forEach(([category, fields]) => {
        alert(
          `Please fill out the required fields for ${category}:\n- ${fields.join(
            "\n- "
          )}`
        );
      });
      return;
    }

    // If valid, proceed with form submission
    const payload = {
      billing_no: formData.billingNo,
      registration_number: patient.registration_number,
      patient_name: patient.name_of_child,
      age: patient.age,
      sex: patient.sex,
      father_phone_number: patient.father_phone_number,
      mother_phone_number: patient.mother_phone_number,
      paymentMethod: paymentMethod,
      assessments: finalAssessmentsArray, // Now includes additional consultations
      total_price: totalPrice,
      discounted_amount: discount || 0,
      discount_remarks: discountRemarks,
      finalAmount: finalAmount,
    };

    axios
      .post(`${Milestonebaseurl}save-assessments/`, payload)
      .then(() => {
        setShowSuccess(true);
        setShowError(false);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
        // Redirect to PatientCardView.js after 5 seconds
        setTimeout(() => {
          navigate("/PatientCardView/Assessments", { state: { patient } });
        }, 5000);
      })
      .catch(() => {
        setShowError(true);
        setShowSuccess(false);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <PageTitle>Assessment Billing</PageTitle>
          <BackButton
            onClick={() =>
              navigate("/PatientCardView/Assessments", { state: { patient } })
            }
          >
            <ArrowLeft size={16} />
            Back
          </BackButton>
        </Header>

        <PatientCard>
          <PatientCardTitle>
            <User size={18} />
            Patient Information
          </PatientCardTitle>
          <PatientInfoGrid>
            <PatientInfoItem>
              <PatientInfoLabel>Date</PatientInfoLabel>
              <PatientInfoValue>{formData.currentDate}</PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Bill number</PatientInfoLabel>
              <PatientInfoValue>{formData.billingNo}</PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Registration No</PatientInfoLabel>
              <PatientInfoValue>{patient.registration_number}</PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Name</PatientInfoLabel>
              <PatientInfoValue>{patient.name_of_child}</PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Age</PatientInfoLabel>
              <PatientInfoValue>
                {patient.age
                  ? `${patient.age.year} Y, ${patient.age.months} M, ${patient.age.days} D`
                  : "N/A"}
              </PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Sex</PatientInfoLabel>
              <PatientInfoValue>{patient.sex}</PatientInfoValue>
            </PatientInfoItem>
          </PatientInfoGrid>
        </PatientCard>

        <br />

        {/* Assessment selection rows */}
        {Object.keys(assessmentSelections).map((category) => (
          <AssessmentRow key={category}>
            <AssessmentCol>
              <h3>{category} Assessment</h3>
              <Select
                value={assessmentSelections[category].assessment}
                onChange={(e) =>
                  handleAssessmentChange(category, e.target.value)
                }
                required
              >
                <option value="">Select Assessment</option>
                {assessmentCategories[category]?.map((item) => (
                  <option key={item.s_no} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </AssessmentCol>

            <AssessmentCol>
              <h3>Consultant</h3>
              <Select
                value={assessmentSelections[category].consultant}
                onChange={(e) =>
                  handleConsultantChange(category, e.target.value)
                }
                required
              >
                <option value="">Select Consultant</option>
                {assessmentCategories.Consultant?.map((item) => (
                  <option key={item.s_no} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>

              {/* Radio options for selected consultant types */}
              {assessmentSelections[category].consultant === "Online" && (
                <RadioGroup>
                  <fieldset required>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="500"
                        checked={
                          assessmentSelections[category].consultantPrice === 500
                        }
                        onChange={() =>
                          handleConsultantPriceChange(category, 500)
                        }
                        required
                      />
                      500
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="750"
                        checked={
                          assessmentSelections[category].consultantPrice === 750
                        }
                        onChange={() =>
                          handleConsultantPriceChange(category, 750)
                        }
                      />
                      750
                    </RadioLabel>
                  </fieldset>
                </RadioGroup>
              )}

              {[
                "Pediatrician",
                "OT",
                "Speech",
                "Clinical Psychology",
                "Physio Therapy",
                "Special Education",
              ].includes(assessmentSelections[category].consultant) && (
                <RadioGroup>
                  <fieldset required>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="350"
                        checked={
                          assessmentSelections[category].consultantPrice === 350
                        }
                        onChange={() =>
                          handleConsultantPriceChange(category, 350)
                        }
                      />
                      350
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="500"
                        checked={
                          assessmentSelections[category].consultantPrice === 500
                        }
                        onChange={() =>
                          handleConsultantPriceChange(category, 500)
                        }
                      />
                      500
                    </RadioLabel>
                  </fieldset>
                </RadioGroup>
              )}
            </AssessmentCol>

            <AssessmentCol>
              <h3>Consulting Doctor</h3>
              {/* Wrapper for dropdown and "+" button */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Select
                  value={assessmentSelections[category].doctor?.name || ""}
                  onChange={(e) => handleDoctorChange(category, e.target.value)}
                >
                  <option value="">Select Consulting Doctor</option>
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor.name}>
                      {doctor.name}
                    </option>
                  ))}
                </Select>

                {/* Show button only for the first category */}
                {Object.keys(assessmentSelections)[0] === category && (
                  <button
                    type="button"
                    onClick={() => handleOpenDoctorModal(category)}
                    style={{
                      position: "relative",
                      top: "-10px", // Moves the button up slightly
                      marginLeft: "2px",
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            </AssessmentCol>
          </AssessmentRow>
        ))}
        {/* Additional consultation row */}
        <AssessmentRow key="additional-consultation">
          <AssessmentCol>
            <h3
              style={{
                position: "relative",
                top: "35px", // Moves the button up slightly
                marginLeft: "2px",
              }}
            >
              Consultation
            </h3>
          </AssessmentCol>

          <AssessmentCol>
            <h3>Consultant</h3>
            <Select
              value={additionalConsultation.consultant}
              onChange={(e) => handleAdditionalConsultantChange(e.target.value)}
            >
              <option value="">Select Consultant</option>
              {assessmentCategories.Consultant?.map((item) => (
                <option key={item.s_no} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>

            {/* Radio options for selected consultant types */}
            {additionalConsultation.consultant === "Online" && (
              <RadioGroup>
                <fieldset>
                  <RadioLabel>
                    <input
                      type="radio"
                      value="500"
                      checked={additionalConsultation.consultantPrice === 500}
                      onChange={() =>
                        handleAdditionalConsultantPriceChange(500)
                      }
                    />
                    500
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      value="750"
                      checked={additionalConsultation.consultantPrice === 750}
                      onChange={() =>
                        handleAdditionalConsultantPriceChange(750)
                      }
                    />
                    750
                  </RadioLabel>
                </fieldset>
              </RadioGroup>
            )}

            {[
              "Pediatrician",
              "OT",
              "Speech",
              "Clinical Psychology",
              "Physio Therapy",
              "Special Education",
            ].includes(additionalConsultation.consultant) && (
              <RadioGroup>
                <fieldset>
                  <RadioLabel>
                    <input
                      type="radio"
                      value="350"
                      checked={additionalConsultation.consultantPrice === 350}
                      onChange={() =>
                        handleAdditionalConsultantPriceChange(350)
                      }
                    />
                    350
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      value="500"
                      checked={additionalConsultation.consultantPrice === 500}
                      onChange={() =>
                        handleAdditionalConsultantPriceChange(500)
                      }
                    />
                    500
                  </RadioLabel>
                </fieldset>
              </RadioGroup>
            )}
          </AssessmentCol>

          <AssessmentCol>
            <h3>Consulting Doctor</h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Select
                value={additionalConsultation.doctor?.name || ""}
                onChange={(e) => handleAdditionalDoctorChange(e.target.value)}
              >
                <option value="">Select Consulting Doctor</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
            </div>
          </AssessmentCol>
          <AssessmentCol>
            <button
              style={{
                position: "relative",
                top: "35px", // Moves the button up slightly
                marginLeft: "2px",
              }}
              onClick={handleAddAdditionalConsultation}
            >
              Add Consultation
            </button>
          </AssessmentCol>
        </AssessmentRow>

        {/* Display selected assessments in table */}
        {(Object.keys(assessmentSelections).some(
          (key) =>
            assessmentSelections[key].assessment ||
            assessmentSelections[key].consultant
        ) ||
          additionalConsultation.consultant) && ( // Ensure table appears when additional consultation exists
          <div>
            <Table>
              <thead>
                <tr>
                  <th>Assessment (Price)</th>
                  <th>Consultant (Price)</th>
                  <th>Doctor</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(assessmentSelections).map(
                  ([category, selection]) => {
                    // Only show rows with at least an assessment or consultant selected
                    if (!selection.assessment && !selection.consultant)
                      return null;

                    const rowTotal =
                      selection.price + selection.consultantPrice;

                    return (
                      <tr key={category}>
                        <td>
                          {selection.assessment
                            ? `${selection.assessment} (${selection.price})`
                            : "Nil"}
                        </td>
                        <td>
                          {selection.consultant
                            ? `${selection.consultant} (${selection.consultantPrice})`
                            : "Nil"}
                        </td>
                        <td>
                          {selection.doctor ? selection.doctor.name : "Nil"}
                        </td>
                        <td>{rowTotal}</td>
                        <td>
                          <button onClick={() => handleRemoveRow(category)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}

                {/* Additional consultation row */}
                {additionalConsultations.length > 0 &&
                  additionalConsultations.map((consultation, index) => (
                    <tr key={index}>
                      <td>Consultation</td>
                      <td>
                        {consultation.consultant
                          ? `${consultation.consultant} (${consultation.consultantPrice})`
                          : "Nil"}
                      </td>
                      <td>
                        {consultation.doctor ? consultation.doctor.name : "Nil"}
                      </td>
                      <td>{consultation.consultantPrice}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleRemoveAdditionalConsultation(index)
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                <tr>
                  <td colSpan="3">
                    <strong>Total</strong>
                  </td>
                  <td colSpan="2">
                    <strong>{totalPrice}</strong>
                  </td>
                </tr>
              </tbody>
            </Table>

            <br />

            <Row className="bg-white p-3 rounded-lg shadow-sm my-4 items-center">
              <Col sm={4}>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        const value = e.target.value
                          ? Number(e.target.value)
                          : 0;
                        setDiscount(value);
                      }}
                      className="pl-8 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </Col>

              <Col sm={4}>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Final Amount
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
                    <span className="font-semibold text-lg">
                      ₹{finalAmount}
                    </span>
                  </div>
                </div>
              </Col>

              <Col sm={4}>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none bg-white transition-colors"
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </Col>
            </Row>

            {/* Display Remarks field only if discount is entered */}
            {discount > 0 && (
              <Row className="bg-white p-3 rounded-lg shadow-sm my-4 items-center">
                <Col sm={12}>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Remarks (Discount Remarks)
                    </label>
                    <textarea
                      value={discountRemarks}
                      onChange={(e) => setDiscountRemarks(e.target.value)}
                      rows="3"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter remarks for the discount..."
                    />
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}

        <br />
        <br />
        <center>
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={handlePrintBill} style={{ marginLeft: "10px" }}>
            Print Bill
          </button>
        </center>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ zIndex: 9999 }}
        >
          {showSuccess && (
            <CustomToast
              style={{
                backgroundColor: "white",
                borderLeft: "5px solid green",
                color: "green",
              }}
              autohide
            >
              <Toast.Body>
                ✅ <strong>Success:</strong> Bill generated successfully for{" "}
                {patient.name_of_child}!
              </Toast.Body>
            </CustomToast>
          )}
          {showError && (
            <CustomToast
              style={{
                backgroundColor: "white",
                borderLeft: "5px solid red",
                color: "red",
              }}
              autohide
            >
              <Toast.Body>
                ❌ <strong>Error:</strong> Error saving assessments.
              </Toast.Body>
            </CustomToast>
          )}
        </ToastContainer>

        {/* Doctor Modal */}
        <Modal show={showDoctorModal} onHide={() => setShowDoctorModal(false)}>
          {doctorSuccessMessage && (
            <div className="alert alert-success">{doctorSuccessMessage}</div>
          )}
          <Modal.Header closeButton>
            <Modal.Title>Add Consulting Doctor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {doctorModalSuccess ? (
              <div className="alert alert-success">
                Doctor added successfully!
              </div>
            ) : (
              <form>
                <FormGroup>
                  <Label>Doctor Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={doctorForm.name}
                    onChange={handleDoctorFormChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Designation</Label>
                  <Input
                    type="text"
                    name="designation"
                    value={doctorForm.designation}
                    onChange={handleDoctorFormChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    name="phone"
                    value={doctorForm.phone}
                    onChange={handleDoctorFormChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <Input
                    type="text"
                    name="address"
                    value={doctorForm.address}
                    onChange={handleDoctorFormChange}
                  />
                </FormGroup>
              </form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              variant="secondary"
              onClick={() => setShowDoctorModal(false)}
            >
              Close
            </button>
            <button
              variant="primary"
              onClick={handleSaveDoctor}
              disabled={!doctorForm.name || doctorModalSuccess}
            >
              Save
            </button>
          </Modal.Footer>
        </Modal>
      </PageContainer>
    </ThemeProvider>
  );
};

export default Assessments;
