import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import mdcLogo from "./Images/mdcLogo.png";
import { useNavigate } from "react-router-dom";
import { Row, Col, Toast, ToastContainer, Modal } from "react-bootstrap";
import styled, { ThemeProvider, keyframes } from "styled-components";
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
    primary: "#557153",
    secondary: "#a1c181",
    accent: "#a1c181",
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
// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Enhanced PageContainer with new gradient background
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #dce2cb 0%, ##a1c181 100%);
  padding: 2rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;

  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 20% 80%,
        rgba(161, 193, 129, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%
      );
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

// Enhanced Header with glassmorphism effect
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.6s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a1c181 0%, #557153 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 0 30px rgba(161, 193, 129, 0.3);
`;

// Enhanced PatientCard with modern design
const PatientCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #a1c181, #557153, #a1c181);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const PatientCardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PatientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const PatientInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: rgba(161, 193, 129, 0.05);
  border-radius: 12px;
  border-left: 4px solid #a1c181;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(161, 193, 129, 0.15);
  }
`;

const PatientInfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #557153;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PatientInfoValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
`;

// Enhanced Form Elements
const Select = styled.select`
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:focus {
    outline: none;
    border-color: #a1c181;
    box-shadow: 0 0 0 3px rgba(161, 193, 129, 0.1);
  }

  &:hover {
    border-color: #a1c181;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;

  &:hover {
    border-color: #a1c181;
    background: rgba(161, 193, 129, 0.05);
  }

  input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #a1c181;
  }

  input[type="radio"]:checked + & {
    border-color: #a1c181;
    background: rgba(161, 193, 129, 0.1);
    color: #557153;
    font-weight: 600;
  }
`;

// Enhanced Table
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  th,
  td {
    padding: 1.25rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: linear-gradient(135deg, #a1c181 0%, #557153 100%);
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.875rem;
  }

  tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(161, 193, 129, 0.05);
      transform: scale(1.01);
    }
  }

  tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.5);
  }
`;

const AssessmentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideIn} 0.5s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const AssessmentCol = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }
`;

// Enhanced Buttons with #557153 as primary button color
const Button = styled.button`
  background: #557153;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(85, 113, 83, 0.3);

  &:hover {
    background: #4a5e47;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(85, 113, 83, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RemoveButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ff5252 0%, #d73a32 100%);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #a1c181 0%, #557153 100%);
  box-shadow: 0 4px 15px rgba(161, 193, 129, 0.3);
  margin-right: 1rem;
  margin-bottom: 1rem;

  &:hover {
    background: linear-gradient(135deg, #94b574 0%, #4a5e47 100%);
    box-shadow: 0 8px 25px rgba(161, 193, 129, 0.4);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #557153 0%, #a1c181 100%);
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  box-shadow: 0 8px 30px rgba(85, 113, 83, 0.4);

  &:hover {
    background: linear-gradient(135deg, #4a5e47 0%, #94b574 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(85, 113, 83, 0.5);
  }
`;

const PrintButton = styled(Button)`
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #2d3748;
  margin-left: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 50px;
  box-shadow: 0 8px 30px rgba(253, 203, 110, 0.4);

  &:hover {
    background: linear-gradient(135deg, #fdd835 0%, #fb8c00 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(253, 203, 110, 0.5);
  }
`;

// Enhanced Input Elements
const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:focus {
    outline: none;
    border-color: #a1c181;
    box-shadow: 0 0 0 3px rgba(161, 193, 129, 0.1);
  }

  &:hover {
    border-color: #a1c181;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Enhanced Section Headers
const SectionHeader = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 4px solid #a1c181;
  background: rgba(161, 193, 129, 0.05);
  padding: 1rem;
  border-radius: 12px;
`;

// Enhanced Card for Summary
const SummaryCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .summary-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    align-items: end;
  }

  .summary-item {
    padding: 1rem;
    background: rgba(161, 193, 129, 0.05);
    border-radius: 12px;
    border-left: 4px solid #a1c181;
  }

  .summary-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #557153;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .summary-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
  }
`;

// Loading animation component
const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Styled Toast for bigger size
const CustomToast = styled(Toast)`
  max-width: 100%;
  font-size: 1.1em;
`;

export {
  PageContainer,
  Header,
  PageTitle,
  PatientCard,
  PatientCardTitle,
  PatientInfoGrid,
  PatientInfoItem,
  PatientInfoLabel,
  PatientInfoValue,
  Select,
  RadioGroup,
  RadioLabel,
  Table,
  AssessmentRow,
  AssessmentCol,
  Button,
  RemoveButton,
  AddButton,
  SubmitButton,
  PrintButton,
  Input,
  Label,
  FormGroup,
  SectionHeader,
  SummaryCard,
  LoadingSpinner,
  CustomToast,
};

const Assessments = () => {
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const employeeName = localStorage.getItem("name");
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = location.state;
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
  // Replace the existing assessmentSelections state
  const [assessmentRows, setAssessmentRows] = useState([]);
  const [currentRowId, setCurrentRowId] = useState(0);
  const assessmentRowRefs = useRef({});

  // Modified addAssessmentRow function
  const addAssessmentRow = (category) => {
    const newRow = {
      id: currentRowId,
      category: category,
      assessment: [],
      price: 0,
      consultant: "",
      consultantPrice: 0,
      doctor: null,
    };
    setAssessmentRows((prev) => [...prev, newRow]);

    // Store the new row ID to scroll to it after render
    const newRowId = currentRowId;
    setCurrentRowId((prev) => prev + 1);

    // Use setTimeout to ensure the DOM is updated before scrolling
    setTimeout(() => {
      scrollToAndFocusRow(newRowId);
    }, 100);
  };

  // Function to scroll to and focus on a specific row
  const scrollToAndFocusRow = (rowId) => {
    const rowElement = assessmentRowRefs.current[rowId];
    if (rowElement) {
      // Scroll the row into view with smooth animation
      rowElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Focus on the first select element in the row
      const firstSelect = rowElement.querySelector("select");
      if (firstSelect) {
        // Small delay to ensure scroll is complete
        setTimeout(() => {
          firstSelect.focus();
          // Add visual highlight
          rowElement.style.boxShadow = "0 0 10px rgba(0, 123, 255, 0.5)";
          rowElement.style.transition = "box-shadow 0.3s ease";

          // Remove highlight after 2 seconds
          setTimeout(() => {
            rowElement.style.boxShadow = "";
          }, 2000);
        }, 300);
      }
    }
  };

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
    const fetchBillingNumber = async () => {
      const result = await apiRequest(
        `${Milestonebaseurl}get-latest-billing-no/`,
        "GET"
      );

      // Debug: Log the entire result
      console.log("Billing API Result:", result);

      if (result.success) {
        console.log(result.data); // Debugging
        if (result.data.billing_no) {
          setFormData((prevData) => ({
            ...prevData,
            billingNo: result.data.billing_no,
          }));
        }
      } else {
        console.error("Error fetching billing number:", result);

        // Handle 403 Forbidden specifically
        if (result.status === 403) {
          toast.error("You are unauthorized to do this action");
        } else {
          toast.error(result.error || "Failed to fetch billing number");
        }
      }
    };

    fetchBillingNumber();
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
  const handleAssessmentChange = (rowId, event) => {
    const selectElement = event.target;
    const selectedOptions = Array.from(selectElement.options)
      .filter((option) => option.selected && option.value !== "")
      .map((option) => option.value);

    // Find the row's category to get the correct assessment data
    const row = assessmentRows.find((r) => r.id === rowId);
    if (!row) return;

    let totalPrice = 0;
    selectedOptions.forEach((optionName) => {
      const selectedItem = assessmentCategories[row.category]?.find(
        (item) => item.name === optionName
      );
      if (selectedItem && typeof selectedItem.rate === "number") {
        totalPrice += selectedItem.rate;
      }
    });

    setAssessmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, assessment: selectedOptions, price: totalPrice }
          : row
      )
    );
  };

  // Handle consultant selection
  const handleConsultantChange = (rowId, value) => {
    const selectedItem = assessmentCategories.Consultant?.find(
      (item) => item.name === value
    );
    let itemPrice =
      selectedItem && typeof selectedItem.rate === "number"
        ? selectedItem.rate
        : 0;

    setAssessmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, consultant: value, consultantPrice: itemPrice }
          : row
      )
    );
  };
  // Handle Doctor selection
  const handleDoctorChange = (rowId, value) => {
    const selectedDoctor = doctors.find((item) => item.name === value);
    setAssessmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, doctor: selectedDoctor } : row
      )
    );
  };

  // Handle consultant price selection (for radio buttons)
  const handleConsultantPriceChange = (rowId, price) => {
    setAssessmentRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, consultantPrice: price } : row
      )
    );
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
    const result = await apiRequest(
      `${Milestonebaseurl}get-consulting-doctors/`,
      "GET"
    );

    // Debug: Log the entire result
    console.log("Doctors API Result:", result);

    if (result.success) {
      setDoctors(result.data); // Assuming you have a state variable `doctors`
    } else {
      console.error("Error fetching doctors:", result);

      // Handle 403 Forbidden specifically
      if (result.status === 403) {
        toast.error("You are unauthorized to do this action");
      } else {
        toast.error(result.error || "Failed to fetch consulting doctors");
      }
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
  const handleRemoveRow = (rowId) => {
    setAssessmentRows((prev) => prev.filter((row) => row.id !== rowId));
  };
  // Calculate total price

  useEffect(() => {
    let total = 0;

    // Sum all assessment rows
    assessmentRows.forEach((row) => {
      total += (row.price || 0) + (row.consultantPrice || 0);
    });

    // Sum all additional consultations
    additionalConsultations.forEach((consultation) => {
      total += consultation.consultantPrice || 0;
    });

    const discountedPrice = total - (discount ? Number(discount) : 0);
    setTotalPrice(total);
    setFinalAmount(discountedPrice);
  }, [assessmentRows, additionalConsultations, discount]);
  const handlePrintBill = (category, selection) => {
    const printWindow = window.open("", "", "width=800,height=600");

    // Calculate total assessment price
    let totalAssessmentPrice = 0;
    Object.values(assessmentRows).forEach((selection) => {
      if (selection.assessment) {
        totalAssessmentPrice += selection.price || 0;
      }
    });

    // Calculate total consultant price
    let totalConsultantPrice = 0;
    Object.values(assessmentRows).forEach((selection) => {
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
                 <tr><th>Age</th><td>${patient.formattedAge || "N/A"}</td></tr>
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
  // Modified handleSubmit function with apiRequest integration
  const handleSubmit = async () => {
    // Function to convert formatted age string to JSON object
    const convertFormattedAgeToObject = (formattedAge) => {
      if (!formattedAge || typeof formattedAge !== "string") {
        return { days: 0, months: 0, year: 0 };
      }

      // Initialize default values
      let years = 0;
      let months = 0;
      let days = 0;

      // Extract years
      const yearMatch = formattedAge.match(/(\d+)\s*years?/i);
      if (yearMatch) {
        years = parseInt(yearMatch[1], 10);
      }

      // Extract months
      const monthMatch = formattedAge.match(/(\d+)\s*months?/i);
      if (monthMatch) {
        months = parseInt(monthMatch[1], 10);
      }

      // Extract days
      const dayMatch = formattedAge.match(/(\d+)\s*days?/i);
      if (dayMatch) {
        days = parseInt(dayMatch[1], 10);
      }

      return {
        days: days,
        months: months,
        year: years, // Note: using 'year' as per your requirement (not 'years')
      };
    };

    let isValid = true;
    let rowErrors = {}; // Store errors for each selected row separately

    // Validate payment method
    if (!paymentMethod) {
      alert("Please select a Payment Method.");
      return;
    }

    // Create assessment array for payload
    const assessmentsArray = [];

    assessmentRows.forEach((row) => {
      if (row.consultant || row.doctor?.name) {
        let missingFields = [];
        if (!row.assessment.length) {
          missingFields.push("assessment");
        }
        if (!row.consultant) {
          missingFields.push("Consultant");
        }
        if (!row.doctor?.name) {
          missingFields.push("Consulting Doctor");
        }
        if (
          (row.consultant === "Online" ||
            [
              "Pediatrician",
              "OT",
              "Speech",
              "Clinical Psychology",
              "Physio Therapy",
              "Special Education",
            ].includes(row.consultant)) &&
          !row.consultantPrice
        ) {
          missingFields.push("Consultant Price");
        }

        if (missingFields.length > 0) {
          rowErrors[`${row.category}-${row.id}`] = missingFields;
        } else {
          assessmentsArray.push({
            category: row.category,
            assessment: row.assessment,
            assessmentPrice: row.price || 0,
            consultant: row.consultant,
            consultantPrice: row.consultantPrice || 0,
            doctor: row.doctor ? row.doctor.name : null,
            totalPrice: (row.price || 0) + (row.consultantPrice || 0),
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
      age: convertFormattedAgeToObject(patient.formattedAge),
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

    try {
      // Using apiRequest function signature from your first handleSubmit
      const result = await apiRequest(
        `${Milestonebaseurl}save-assessments/`,
        "POST",
        payload
      );

      if (result.success) {
        setShowSuccess(true);
        setShowError(false);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
        // Redirect to PatientCardView.js after 5 seconds
        setTimeout(() => {
          navigate("/PatientCardView/Assessments", { state: { patient } });
        }, 5000);
      } else {
        // Handle API error response
        console.error("API Error:", result.error);
        alert(result.error || "An error occurred while saving the assessment.");
        setShowError(true);
        setShowSuccess(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      alert("An unexpected error occurred. Please try again.");
      setShowError(true);
      setShowSuccess(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <PageTitle>Assessment Billing</PageTitle>
          <Button
            onClick={() =>
              navigate("/PatientCardView/Assessments", { state: { patient } })
            }
          >
            <ArrowLeft size={16} />
            Back
          </Button>
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
                {/* Use the formatted age if available, otherwise fallback to the old format */}
                {patient.formattedAge || "N/A"}
              </PatientInfoValue>
            </PatientInfoItem>
            <PatientInfoItem>
              <PatientInfoLabel>Sex</PatientInfoLabel>
              <PatientInfoValue>{patient.sex}</PatientInfoValue>
            </PatientInfoItem>
          </PatientInfoGrid>
        </PatientCard>
        <br />
        {/* Add buttons to add new assessment rows */}
        <div>
          {/* Add buttons to add new assessment rows */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Assessments:</h3>
            {Object.keys(assessmentCategories)
              .filter((cat) => cat !== "Consultant")
              .map((category) => (
                <button
                  key={category}
                  onClick={() => addAssessmentRow(category)}
                  style={{ marginRight: "10px", marginBottom: "10px" }}
                >
                  Add {category} Assessment
                </button>
              ))}
          </div>

          {/* Dynamic assessment rows with ref assignment */}
          {assessmentRows.map((row) => (
            <AssessmentRow
              key={row.id}
              ref={(el) => (assessmentRowRefs.current[row.id] = el)}
              style={{
                transition: "box-shadow 0.3s ease",
                marginBottom: "20px",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <AssessmentCol>
                <h3>{row.category} Assessment</h3>
                <Select
                  style={{
                    maxHeight: "80px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                  value={row.assessment}
                  onChange={(e) => handleAssessmentChange(row.id, e)}
                  required
                  multiple
                >
                  {assessmentCategories[row.category]?.map((item) => (
                    <option key={item.s_no} value={item.name} title={item.name}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <small>Hold Ctrl/Cmd to select multiple options</small>
              </AssessmentCol>

              <AssessmentCol>
                <h3>Consultant</h3>
                <Select
                  value={row.consultant}
                  onChange={(e) =>
                    handleConsultantChange(row.id, e.target.value)
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
                {row.consultant === "Online" && (
                  <RadioGroup>
                    <fieldset required>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="500"
                          checked={row.consultantPrice === 500}
                          onChange={() =>
                            handleConsultantPriceChange(row.id, 500)
                          }
                          required
                        />
                        500
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="750"
                          checked={row.consultantPrice === 750}
                          onChange={() =>
                            handleConsultantPriceChange(row.id, 750)
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
                ].includes(row.consultant) && (
                  <RadioGroup>
                    <fieldset required>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="350"
                          checked={row.consultantPrice === 350}
                          onChange={() =>
                            handleConsultantPriceChange(row.id, 350)
                          }
                        />
                        350
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="500"
                          checked={row.consultantPrice === 500}
                          onChange={() =>
                            handleConsultantPriceChange(row.id, 500)
                          }
                        />
                        500
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="750"
                          checked={row.consultantPrice === 750}
                          onChange={() =>
                            handleConsultantPriceChange(row.id, 750)
                          }
                        />
                        750
                      </RadioLabel>
                    </fieldset>
                  </RadioGroup>
                )}
              </AssessmentCol>

              <AssessmentCol>
                <h3>Consulting Doctor</h3>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Select
                    value={row.doctor?.name || ""}
                    onChange={(e) => handleDoctorChange(row.id, e.target.value)}
                  >
                    <option value="">Select Consulting Doctor</option>
                    {doctors.map((doctor, index) => (
                      <option key={index} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </Select>
                  {assessmentRows[0]?.id === row.id && (
                    <button
                      type="button"
                      onClick={() => handleOpenDoctorModal(row.category)}
                      style={{
                        position: "relative",
                        top: "-10px",
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
        </div>

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
        {(Object.keys(assessmentRows).some(
          (key) =>
            assessmentRows[key].assessment || assessmentRows[key].consultant
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
                {assessmentRows.map((row) => {
                  if (!row.assessment.length && !row.consultant) return null;

                  const rowTotal = row.price + row.consultantPrice;

                  return (
                    <tr key={row.id}>
                      <td>
                        {row.assessment.length > 0
                          ? `${row.assessment.join(", ")} (${row.price})`
                          : "Nil"}
                      </td>
                      <td>
                        {row.consultant
                          ? `${row.consultant} (${row.consultantPrice})`
                          : "Nil"}
                      </td>
                      <td>{row.doctor ? row.doctor.name : "Nil"}</td>
                      <td>{rowTotal}</td>
                      <td>
                        <button onClick={() => handleRemoveRow(row.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Keep the additional consultations rows as they are */}
                {additionalConsultations.map((consultation, index) => (
                  <tr key={`additional-${index}`}>
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
        {/* Fixed Toast Notifications */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{
            zIndex: 9999,
            position: "fixed",
            top: "20px",
            right: "20px",
          }}
        >
          <CustomToast
            show={showSuccess}
            onClose={() => setShowSuccess(false)}
            delay={5000}
            autohide
            style={{
              backgroundColor: "white",
              borderLeft: "5px solid green",
              color: "green",
              minWidth: "300px",
            }}
          >
            <Toast.Header closeButton={false}>
              <strong className="me-auto" style={{ color: "green" }}>
                ✅ Success
              </strong>
            </Toast.Header>
            <Toast.Body>
              Bill generated successfully for {patient.name_of_child}!
            </Toast.Body>
          </CustomToast>

          <CustomToast
            show={showError}
            onClose={() => setShowError(false)}
            delay={5000}
            autohide
            style={{
              backgroundColor: "white",
              borderLeft: "5px solid red",
              color: "red",
              minWidth: "300px",
            }}
          >
            <Toast.Header closeButton={false}>
              <strong className="me-auto" style={{ color: "red" }}>
                ❌ Error
              </strong>
            </Toast.Header>
            <Toast.Body>Error saving assessments. Please try again.</Toast.Body>
          </CustomToast>
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
