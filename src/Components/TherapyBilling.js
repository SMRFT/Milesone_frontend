"use client";

import { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Label } from "reactstrap";
import {
  ArrowLeft,
  User,
  IndianRupee,
  Printer,
  Save,
  Activity,
  Tag,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import mdcLogo from "./Images/mdcLogo.png";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify"; // Ensure toast is imported

// Theme
const theme = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    accent: "#4895ef",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: "#212529",
    textLight: "#6c757d",
    border: "#406147",
    borderLight: "#e9ecef",
    highlight: "#f0f7ff",
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
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.background};
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  color: ${(props) => props.theme.colors.text};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
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
  gap: ${(props) => props.theme.spacing.sm};
  background-color: transparent;
  color: ${(props) => props.theme.colors.primary};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.default};

  &:hover {
    background-color: ${(props) => props.theme.colors.primary};
    color: white;
  }
`;

const AlertMessage = styled.div`
  background-color: ${(props) =>
    props.variant === "success"
      ? `${props.theme.colors.success}15`
      : `${props.theme.colors.error}15`};
  color: ${(props) =>
    props.variant === "success"
      ? props.theme.colors.success
      : props.theme.colors.error};
  border-left: 4px solid
    ${(props) =>
    props.variant === "success"
      ? props.theme.colors.success
      : props.theme.colors.error};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BillingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const FormSection = styled.section`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.small};
  padding: ${(props) => props.theme.spacing.lg};
  border-top: 4px solid ${(props) => props.color || props.theme.colors.primary};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding-bottom: ${(props) => props.theme.spacing.sm};
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;
// ... existing styled components

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${(props) => props.theme.spacing.sm};
  font-size: 0.9rem;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: 12px 8px;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.textLight};
  font-weight: 600;
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`;

const StyledTd = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  color: ${(props) => props.theme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${(props) => props.theme.colors.textLight};
  font-style: italic;
`;

// Add this new component with your other styled components
const ResponsiveGrid = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.md};

  /* Default (Mobile): 1 column */
  grid-template-columns: 1fr;

  /* Tablet (min-width: 600px): 2 columns */
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Desktop (min-width: 1100px): 4 columns */
  @media (min-width: 1100px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// ... existing code
const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textLight};
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  font-size: 0.95rem;
  color: ${(props) => props.theme.colors.text};
  background-color: ${(props) =>
    props.readOnly ? props.theme.colors.borderLight : "white"};
  transition: ${(props) => props.theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}25;
  }

  &:read-only {
    cursor: not-allowed;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  font-size: 0.95rem;
  color: ${(props) => props.theme.colors.text};
  background-color: white;
  transition: ${(props) => props.theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}25;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  background-color: ${(props) =>
    props.variant === "outline" ? "transparent" : props.theme.colors.primary};
  color: ${(props) =>
    props.variant === "outline" ? props.theme.colors.primary : "white"};
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.default};
  min-width: 150px;

  &:hover {
    background-color: ${(props) =>
    props.variant === "outline"
      ? props.theme.colors.primary + "15"
      : props.theme.colors.secondary};
  }
`;

const HighlightedValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) => props.color || props.theme.colors.primary};
  background-color: ${(props) => props.bgColor || props.theme.colors.highlight};
  padding: 0.75rem;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const TherapyBilling = () => {
  const employeeName = localStorage.getItem("name");
  const { state } = useLocation();
  const assessment = state?.assessment || {};
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  const parseDoctors = (value) => {
    try {
      if (!value) return [];
      return JSON.parse(value);
    } catch (e) {
      console.error("Error parsing consultant doctors:", e);
      return [];
    }
  };

  useEffect(() => {
    // Format current date
    const currentDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    setFormData((prevData) => ({
      ...prevData,
      currentDate: currentDate,
    }));
  }, []);
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

  // Helper: format the stored age object {year, months, days} from backend
  const formatStoredAge = (ageObj) => {
    if (!ageObj || typeof ageObj !== "object") return null;
    const parts = [];
    if (ageObj.year > 0) parts.push(`${ageObj.year} year${ageObj.year !== 1 ? "s" : ""}`);
    if (ageObj.months > 0) parts.push(`${ageObj.months} month${ageObj.months !== 1 ? "s" : ""}`);
    // if (ageObj.days   > 0) parts.push(`${ageObj.days} day${ageObj.days !== 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "0 days";
  };

  // Helper: format DOB ISO string to DD/MM/YYYY
  const formatDob = (dobString) => {
    if (!dobString) return "";
    try {
      const d = new Date(dobString);
      if (isNaN(d.getTime())) return dobString;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${d.getFullYear()}`;
    } catch {
      return dobString;
    }
  };

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const selectedAttendance =
    assessment.attendances && assessment.attendances.length > 0
      ? assessment.attendances[0]
      : null;
  // --- 1. CALCULATE INITIAL VALUES ---
  const initCharge = selectedAttendance?.therapy_charge || 0;
  const initDiscount = selectedAttendance?.discount || 0;
  const initNotAttending = selectedAttendance?.not_attending || 0;
  const initExtraAttending = selectedAttendance?.extra_attending || 0;
  const initPrevPaid = selectedAttendance?.total_amount_paid || 0;

  // Calculate the Total Bill Amount
  const initTotalAmount =
    initCharge - initDiscount - initNotAttending + initExtraAttending;
  const initAmountPaidInput = Math.max(0, initTotalAmount - initPrevPaid);

  const [formData, setFormData] = useState({
    registration_number: assessment.registration_number || "",
    name: assessment.name_of_child || "",
    age: convertFormattedAgeToObject(assessment.formattedAge), // Convert here
    dob: assessment.dob ? assessment.dob.split("T")[0] : "",
    sex: assessment.sex || "",
    father_phone_number: assessment.father_phone_number || "",
    mother_phone_number: assessment.mother_phone_number || "",
    therapy_details: selectedAttendance?.therapy_details || [],
    not_attending: selectedAttendance?.not_attending || 0,
    not_attending_remarks: selectedAttendance?.not_attending_remarks || "",
    extra_attending: selectedAttendance?.extra_attending || 0,
    extra_attending_remarks: selectedAttendance?.extra_attending_remarks || "",
    total_amount_paid: selectedAttendance?.total_amount_paid || 0,
    discount: selectedAttendance?.discount || 0,
    discount_remarks: selectedAttendance?.discount_remarks || "",
    therapy_charge: selectedAttendance?.therapy_charge || 0,
    number_of_sessions: selectedAttendance?.session || "",
    // 👉 Correct attendance date
    attendance_date: selectedAttendance?.attendance_date || "",

    // NEW: Auto-fill therapy names
    nameoftherapy: selectedAttendance?.therapy_details
      ? selectedAttendance.therapy_details.map((t) => t.therapy_name)
      : [],

    discount_remarks: "",
    // 👉 Set Total Amount (Display only)
    total_amount: initTotalAmount.toFixed(2),

    // 👉 AUTO-FILL AMOUNT PAID (Input field)
    amount_paid: 0,
    amount_pending: initAmountPaidInput,
    // 👉 Remaining Amount (Should be 0 if we auto-fill the full payment)
    remaining_amount: {
      value: 0,
      status: "Pending",
      paid_date: null,
      new_bill_no: null,
    },
    payment_type: "",
    payment_method: "",
    consultant_doctor: selectedAttendance
      ? parseDoctors(selectedAttendance.consultant_doctor)
      : [],

    billingNo: "",
  });

  useEffect(() => {
    // Fetch the latest billing number from the backend when the component mounts
    const fetchLatestBillingNumber = async () => {
      try {
        const result = await apiRequest(
          `${Milestonebaseurl}get-latest-billing-no/`,
          "GET"
        );

        if (result.success) {
          setFormData((prevData) => ({
            ...prevData,
            billing_no: result.data.billing_no,
          }));
        } else {
          console.error("Error fetching billing number:", result.error);
        }
      } catch (error) {
        console.error("Unexpected error fetching billing number:", error);
      }
    };

    fetchLatestBillingNumber();
  }, []);

  const fetchConsultingDoctors = async () => {
    try {
      const result = await apiRequest(
        `${Milestonebaseurl}get-consulting-doctors/`,
        "GET"
      );

      if (result.success) {
        setDoctors(result.data);
      } else {
        console.error("Error fetching doctors:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchConsultingDoctors();
  }, []);

  // --- UPDATED HANDLE CHANGE WITH VALIDATION ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Parse numeric fields to floats where needed
    if (
      name === "therapy_charge" ||
      name === "discount" ||
      name === "amount_paid" ||
      name === "not_attending" ||
      name === "extra_attending"
    ) {
      updatedValue = Number.parseFloat(value) || 0;
    }

    setFormData((prevData) => {
      // Create a temporary state to calculate totals
      const tempState = { ...prevData, [name]: updatedValue };

      // Helper to get value from Assessment (if fixed) or current Form Data
      const getVal = (key) => {
        if (
          assessment.attendances &&
          assessment.attendances.length > 0 &&
          assessment.attendances[0][key] !== undefined
        ) {
          return parseFloat(assessment.attendances[0][key] || 0);
        }
        return parseFloat(tempState[key] || 0);
      };

      // 1. Calculate Total Bill Amount
      const therapyCharge = parseFloat(tempState.therapy_charge || 0);
      const discount = getVal("discount");
      const notAttending = getVal("not_attending");
      const extraAttending = getVal("extra_attending");

      const totalAmount =
        therapyCharge - discount - notAttending + extraAttending;

      // 2. Calculate Max Allowable Payment for THIS transaction
      // Max = TotalBill - (Already Paid In Previous Bills)
      const previousTotalPaid = getVal("total_amount_paid");
      const maxPayable = Math.max(0, totalAmount - previousTotalPaid);

      // 3. Validation: Amount Paid cannot exceed Max Payable
      let currentAmountPaidInput = parseFloat(tempState.amount_paid || 0);

      if (currentAmountPaidInput > maxPayable) {
        currentAmountPaidInput = maxPayable; // Clamp the value
        if (name === "amount_paid") {
          // Only show toast if user is actively changing amount_paid
          toast.warning(
            `Amount paid cannot exceed the remaining balance of ₹${maxPayable}`
          );
        }
      }

      // Update the temp state with the clamped Amount Paid
      tempState.amount_paid = currentAmountPaidInput;

      // 4. Calculate Final Remaining Amount
      // Remaining = Total Bill - Current Input - Previously Paid
      const remainingAmountValue =
        totalAmount - currentAmountPaidInput - previousTotalPaid;

      // 5. Update derived fields in state
      tempState.total_amount = totalAmount.toFixed(2);
      tempState.remaining_amount = {
        value:
          remainingAmountValue > 0
            ? parseFloat(remainingAmountValue.toFixed(2))
            : 0,
        status: remainingAmountValue > 0 ? "Pending" : "Paid",
        paid_date:
          remainingAmountValue > 0
            ? null
            : new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
        new_bill_no: null,
      };

      return tempState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest(
        `${Milestonebaseurl}therapy_billing/`,
        "POST",
        formData
      );

      if (response.success) {
        const successText = `Therapy Billing for ${formData.name} generated successfully!`;

        setMessage(successText);
        setMessageType("success");
        toast.success(successText, {
          autoClose: 5000,
          position: "top-right"
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        // 2. Schedule Print after 5 Seconds (Calls the Iframe function)
        setTimeout(() => {
          printReport();
        }, 3000);

        // 3. Schedule Redirect after 10 Seconds
        setTimeout(() => {
          navigate("/Therapybillingview");
        }, 10000);

      } else {
        setMessage(response.error || "Submission Failed");
        setMessageType("danger");
        toast.error(response.error || "Submission Failed");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      setMessage("Server Error");
      setMessageType("danger");
      toast.error("Network or Server Error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.error(error);
    }
  };

  const printReport = () => {
    // 1. Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const { date, billing_no, registration_number } = formData;

    // 2. Prepare the content (Your existing HTML template)
    const printableContent = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Therapy Receipt</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          /* Global Reset */
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
          
          @page { 
              margin: 10mm;
          }

          body { 
              font-family: 'Poppins', Arial, sans-serif; 
              margin: 0; 
              background-color: #fff; 
              color: #333; 
              font-size: 10pt; 
          }

          .container { 
              width: 100%; 
              max-width: 100%;
              margin: 0 auto; 
          }

          /* Header Layout */
          .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 2px solid #406147; 
              padding-bottom: 10px; 
              margin-bottom: 15px;
          }

          .logo { 
              width: 80px; 
              height: auto; 
              object-fit: contain; 
          }

          .contact-details { 
              text-align: right; 
              font-size: 8pt; 
              color: #555; 
              line-height: 1.3; 
          }

          .receipt-title { 
              text-align: center; 
              margin: 10px 0 20px 0; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              color: #406147; 
              font-weight: 700; 
              font-size: 14pt; 
          }

          /* Info Grid - Adaptive */
          .info-grid { 
              display: flex; 
              flex-wrap: wrap; 
              gap: 10px; 
              margin-bottom: 20px;
          }

          .info-item { 
              flex: 1 1 22%; 
              min-width: 80px;
              display: flex; 
              flex-direction: column; 
          }

          .info-label { 
              color: #888; 
              font-size: 7pt; 
              text-transform: uppercase; 
              font-weight: 600;
          }

          .info-value { 
              font-weight: 500; 
              font-size: 9pt; 
              color: #222; 
              word-break: break-word;
          }

          /* Table Styling */
          .section-title { 
              font-size: 10pt; 
              font-weight: 600; 
              color: #406147; 
              margin-bottom: 5px; 
              border-bottom: 1px solid #ccc; 
              padding-bottom: 2px; 
          }

          table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 5px; 
              table-layout: fixed; 
          }

          th, td { 
              padding: 6px 4px; 
              text-align: left; 
              border-bottom: 1px solid #eee; 
              font-size: 9pt;
              vertical-align: top;
          }

          th { 
              background-color: #f8f9fa; 
              font-weight: 600; 
              color: #555; 
              text-transform: uppercase; 
              font-size: 8pt; 
          }

          /* Numeric columns alignment */
          .col-center { text-align: center; }
          .col-right { text-align: right; }
          .text-bold { font-weight: 600; }
          
          /* Colors */
          .text-red { color: #e74c3c; }
          .text-green { color: #27ae60; }
          .text-due { color: #c0392b; }

          /* Footer */
          .footer { 
              margin-top: 40px; 
              text-align: right; 
              font-size: 8pt; 
              color: #555; 
              page-break-inside: avoid;
          }

          .signature-line { 
              border-top: 1px solid #ccc; 
              width: 160px; 
              margin-left: auto; 
              padding-top: 5px; 
              text-align: center; 
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="${mdcLogo}" alt="Logo" class="logo" />
              <div class="contact-details">
                  <strong style="font-size: 10pt; color: #333;">Milestone Development Center</strong><br />
                  59/37, Saradha College Road,<br />
                  Salem-636007, Tamil Nadu, India<br />
                  Ph: +91 90470 33633<br />
                  Email: info@milestonescenter.in
                  
              </div>
          </div>
          
          <div class="receipt-title">Therapy Receipt</div>
          
          <div class="info-grid">
              <div class="info-item"><span class="info-label">Date</span><span class="info-value">${formData.currentDate || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Bill Number</span><span class="info-value">${billing_no || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Reg No</span><span class="info-value">${assessment.registration_number || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Name</span><span class="info-value">${assessment.name_of_child || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Age</span><span class="info-value">${formatStoredAge(assessment.age) || assessment.formattedAge || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Sex</span><span class="info-value">${formData.sex || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Type</span><span class="info-value">${formData.payment_type || "N/A"}</span></div>
              <div class="info-item"><span class="info-label">Method</span><span class="info-value">${formData.payment_method || "N/A"}</span></div>
          </div>

          <div class="section-title">Therapy Charges</div>
          
          <table>
              <thead>
                  <tr>
                      <th style="width: 50%;">Therapy</th>
                      <th class="col-center" style="width: 20%;">Sessions</th>
                      <th class="col-right" style="width: 30%;">Amount</th>
                  </tr>
              </thead>
              <tbody>
                  ${Array.isArray(formData.nameoftherapy) && formData.nameoftherapy.length > 0
        ? formData.nameoftherapy.map((therapy, index) => `
                          <tr>
                              <td>${therapy || "N/A"}</td>
                              ${index === 0 ? `
                              <td rowspan="${formData.nameoftherapy.length}" class="col-center" style="vertical-align: middle;">
                                  ${parseFloat(formData.number_of_sessions || "0").toFixed(0)}
                              </td>` : ""}
                              ${index === 0 ? `
                              <td rowspan="${formData.nameoftherapy.length}" class="col-right text-bold" style="vertical-align: middle;">
                                  ₹${parseFloat(formData.therapy_charge || "0").toFixed(0)}
                              </td>` : ""}
                          </tr>`).join("")
        : `<tr><td colspan="3" class="col-center">No details</td></tr>`
      }

                  <tr><td colspan="3" style="border-bottom: 2px solid #ddd; padding: 0;"></td></tr>

                  ${Number(formData.discount || 0) !== 0 ? `
                  <tr>
                      <td colspan="2" class="col-right">Discount</td>
                      <td class="col-right text-red">- ₹${parseFloat(formData.discount || "0").toFixed(0)}</td>
                  </tr>` : ""}
                  
                  ${Number(formData.not_attending || 0) !== 0 ? `
                  <tr>
                      <td colspan="2" class="col-right">Not Attended (Adj.)</td>
                      <td class="col-right text-red">- ₹${parseFloat(formData.not_attending || "0").toFixed(0)}</td>
                  </tr>` : ""}

                  ${Number(formData.extra_attending || 0) !== 0 ? `
                  <tr>
                      <td colspan="2" class="col-right">Extra Attended</td>
                      <td class="col-right text-green">+ ₹${parseFloat(formData.extra_attending || "0").toFixed(0)}</td>
                  </tr>` : ""}

                  <tr>
                      <td colspan="2" class="col-right text-bold">Net Payable</td>
                      <td class="col-right text-bold">₹${parseFloat(formData.total_amount || "0").toFixed(0)}</td>
                  </tr>
                  
                  <tr>
                      <td colspan="2" class="col-right">Amount Paid</td>
                      <td class="col-right text-green text-bold">₹${parseFloat(formData.amount_paid || "0").toFixed(0)}</td>
                  </tr>

                  ${Number(formData.remaining_amount?.value || 0) !== 0 ? `
                  <tr>
                      <td colspan="2" class="col-right text-due">Balance Due</td>
                      <td class="col-right text-due text-bold">₹${parseFloat(formData.remaining_amount?.value || "0").toFixed(0)}</td>
                  </tr>` : ""}
              </tbody>
          </table>

          <div class="footer">
              <div class="signature-line">
                  Auth. Signature<br />
                  <span style="font-size: 8pt; color: #888; font-weight: normal;">${employeeName}</span>
              </div>
          </div>
      </div>
  </body>
  </html>
`;

    // 3. Write content to iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printableContent);
    doc.close();

    // 4. Trigger print
    const triggerPrint = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Remove iframe after printing is initiated
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    };

    const img = doc.querySelector('.logo');
    if (img) {
      if (img.complete) {
        triggerPrint();
      } else {
        img.onload = triggerPrint;
        img.onerror = triggerPrint;
      }
    } else {
      setTimeout(triggerPrint, 500);
    }
  };

  const handleSelect = (event) => {
    const selectedValue = event.target.value;
    if (selectedValue && !formData.nameoftherapy.includes(selectedValue)) {
      setFormData((prev) => ({
        ...prev,
        nameoftherapy: [...prev.nameoftherapy, selectedValue],
      }));
    }
  };

  const handleRemove = (value) => {
    setFormData((prev) => ({
      ...prev,
      nameoftherapy: prev.nameoftherapy.filter((therapy) => therapy !== value),
    }));
  };

  // Handle selection
  const handleDoctorSelect = (e) => {
    const selectedDoctorName = e.target.value;
    if (!selectedDoctorName) return;

    setFormData((prevData) => {
      const updatedDoctors = prevData.consultant_doctor || [];
      if (!updatedDoctors.includes(selectedDoctorName)) {
        return {
          ...prevData,
          consultant_doctor: [...updatedDoctors, selectedDoctorName], // Store name instead of ID
        };
      }
      return prevData;
    });
  };

  // Handle removal
  const handleRemoveDoctor = (doctorId) => {
    setFormData((prevData) => ({
      ...prevData,
      consultant_doctor: prevData.consultant_doctor.filter(
        (id) => id !== doctorId
      ),
    }));
  };

  // --- LOGIC TO DISABLE AMOUNT PAID IF FULLY PAID ---
  // Calculate Final Amount dynamically based on the form/assessment values
  const currentTherapyCharge = parseFloat(formData.therapy_charge || 0);
  const currentDiscount =
    assessment.attendances?.[0]?.discount !== undefined
      ? parseFloat(assessment.attendances[0].discount || 0)
      : parseFloat(formData.discount || 0);
  const currentNotAttending =
    assessment.attendances?.[0]?.not_attending !== undefined
      ? parseFloat(assessment.attendances[0].not_attending || 0)
      : parseFloat(formData.not_attending || 0);
  const currentExtraAttending =
    assessment.attendances?.[0]?.extra_attending !== undefined
      ? parseFloat(assessment.attendances[0].extra_attending || 0)
      : parseFloat(formData.extra_attending || 0);

  const calculatedFinalAmount =
    currentTherapyCharge -
    currentDiscount -
    currentNotAttending +
    currentExtraAttending;

  const currentTotalAmountPaid =
    assessment.attendances?.[0]?.total_amount_paid !== undefined
      ? parseFloat(assessment.attendances[0].total_amount_paid || 0)
      : parseFloat(formData.total_amount_paid || 0);

  // Check condition: if Calculated Final Amount == Total Paid so far
  // Use a small epsilon for float comparison safety, or strict check if using integers
  const isFullyPaid = calculatedFinalAmount <= currentTotalAmountPaid;

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <PageTitle>Therapy Billing</PageTitle>
          <BackButton onClick={() => navigate("/Therapybillingview")}>
            <ArrowLeft size={16} />
            Back to List
          </BackButton>
        </Header>

        {message && (
          <AlertMessage
            variant={messageType === "success" ? "success" : "error"}
          >
            {messageType === "success" ? (
              <IndianRupee size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {message}
            <CloseButton onClick={() => setMessage(null)}>×</CloseButton>
          </AlertMessage>
        )}

        <BillingForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionHeader>
              <Tag size={20} color={theme.colors.primary} />
              <SectionTitle>Billing Information</SectionTitle>
            </SectionHeader>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="billingNo">Billing Number</FormLabel>
                <FormInput
                  id="billing_no"
                  type="text"
                  name="billing_no"
                  value={formData.billing_no || ""}
                  readOnly
                  placeholder="Billing Number"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="registration_number">
                  Registration Number
                </FormLabel>
                <FormInput
                  id="registration_number"
                  type="text"
                  name="registration_number"
                  value={assessment.registration_number || ""}
                  onChange={handleChange}
                  placeholder="Registration Number"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="date">Billing Date</FormLabel>
                <FormInput
                  id="date"
                  type="text"
                  name="date"
                  value={formData.currentDate}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="attendance_date">Attendance Date</FormLabel>
                <FormInput
                  id="attendance_date"
                  type="date"
                  name="attendance_date"
                  value={formData.attendance_date || ""}
                  readOnly
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection color={theme.colors.info}>
            <SectionHeader>
              <User size={20} color={theme.colors.info} />
              <SectionTitle>Personal Details</SectionTitle>
            </SectionHeader>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="name_of_child">Name</FormLabel>
                <FormInput
                  id="name_of_child"
                  type="text"
                  name="name_of_child"
                  value={assessment.name_of_child}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="age">Age</FormLabel>
                <FormInput
                  id="age"
                  type="text"
                  name="age"
                  value={formatStoredAge(assessment.age) || assessment.formattedAge || ""}
                  readOnly
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="sex">Gender</FormLabel>
                <FormInput
                  id="sex"
                  type="text"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="father_phone_number">
                  Father Phone No
                </FormLabel>
                <FormInput
                  id="father_phone_number"
                  type="text"
                  name="father_phone_number"
                  value={formData.father_phone_number}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="mother_phone_number">
                  Mother Phone No
                </FormLabel>
                <FormInput
                  id="mother_phone_number"
                  type="text"
                  name="mother_phone_number"
                  value={formData.mother_phone_number}
                  onChange={handleChange}
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection color={theme.colors.success}>
            <SectionHeader>
              <Activity size={20} color={theme.colors.success} />
              <SectionTitle>Therapy Details</SectionTitle>
            </SectionHeader>
            <FormRow>
              <FormGroup>
                {formData.nameoftherapy.length > 0 && (
                  <div className="mt-2">
                    <strong>Name of Therapies:</strong>
                    <ul style={{ marginTop: "6px", paddingLeft: "20px" }}>
                      {formData.nameoftherapy.map((therapy, index) => (
                        <li key={index} style={{ marginBottom: "4px" }}>
                          {therapy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                {formData.consultant_doctor.length > 0 && (
                  <div className="mt-2">
                    <strong>Consultant Doctors:</strong>
                    <ul>
                      {formData.consultant_doctor.map((doctor, idx) => (
                        <li key={idx}>{doctor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="therapy_charge">Therapy Charge</FormLabel>
                <FormInput
                  id="therapy_charge"
                  type="number"
                  name="therapy_charge"
                  value={formData.therapy_charge || ""}
                  onChange={handleChange}
                  placeholder="Enter therapy charge"
                  readOnly={!!assessment.total_therapy_charge}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="number_of_sessions">
                  Number of Sessions
                </FormLabel>
                <FormInput
                  id="number_of_sessions"
                  type="number"
                  name="number_of_sessions"
                  value={formData.number_of_sessions || ""}
                  onChange={handleChange}
                  placeholder="Enter Number of seesions"
                  readOnly={!!assessment.total_sessions} // Non-editable if auto-filled
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          {/* --- NEW SECTION: PREVIOUS BILL DETAILS --- */}
          <FormSection color={theme.colors.secondary}>
            <SectionHeader>
              <FileText size={20} color={theme.colors.secondary} />
              <SectionTitle>Previous Bill Details</SectionTitle>
            </SectionHeader>

            {selectedAttendance?.bills && selectedAttendance.bills.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <StyledTh>Bill No</StyledTh>
                      <StyledTh>Bill Date</StyledTh>
                      <StyledTh>Payment Type</StyledTh>
                      <StyledTh>Method</StyledTh>
                      <StyledTh style={{ textAlign: "right" }}>Total Bill</StyledTh>
                      <StyledTh style={{ textAlign: "right" }}>Paid Now</StyledTh>
                      <StyledTh style={{ textAlign: "right" }}>Pending</StyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAttendance.bills.map((bill, index) => {
                      // Calculate values
                      const total = parseFloat(bill.total_amount || 0);
                      const paidBefore = parseFloat(bill.total_amount_paid || 0);
                      const paidNow = parseFloat(bill.amount_paid || 0);

                      // Pending Balance after this specific transaction
                      const pending = Math.max(0, total - (paidBefore + paidNow));

                      return (
                        <tr key={index}>
                          <StyledTd>
                            <strong>{bill.billing_no}</strong>
                          </StyledTd>
                          <StyledTd>{bill.bill_date}</StyledTd>
                          <StyledTd>{bill.payment_type || "-"}</StyledTd>
                          <StyledTd>{bill.payment_method || "-"}</StyledTd>
                          <StyledTd style={{ textAlign: "right" }}>
                            ₹{total.toFixed(2)}
                          </StyledTd>
                          <StyledTd
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                              color: theme.colors.success,
                            }}
                          >
                            ₹{paidNow.toFixed(2)}
                          </StyledTd>
                          <StyledTd
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                              color: theme.colors.error, // Red color for pending
                            }}
                          >
                            ₹{pending.toFixed(2)}
                          </StyledTd>
                        </tr>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </div>
            ) : (
              <EmptyState>No previous billing records found for this session.</EmptyState>
            )}
          </FormSection>

          <FormSection color={theme.colors.warning}>
            <SectionHeader>
              <IndianRupee size={20} color={theme.colors.warning} />
              <SectionTitle>Payment Details</SectionTitle>
            </SectionHeader>

            <FormRow>
              <ResponsiveGrid>
                <FormGroup>
                  <FormLabel htmlFor="adjusted_charge">Final Amount</FormLabel>
                  <HighlightedValue color={theme.colors.primary}>
                    <IndianRupee size={18} />
                    {parseFloat(formData.total_amount || "0").toFixed(0)}
                  </HighlightedValue>
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="discount">Discount</FormLabel>
                  <FormInput
                    id="discount"
                    type="number"
                    name="discount"
                    value={
                      assessment.attendances?.[0]?.discount !== undefined
                        ? assessment.attendances[0].discount
                        : formData.discount || ""
                    }
                    readOnly // 🔒 Make it non-editable
                    style={{
                      backgroundColor: "#f1f3f5",
                      cursor: "not-allowed",
                    }}
                  />
                </FormGroup>
                {/* Conditionally render Remarks field if discount is entered */}
                {formData.discount > 0 && (
                  <FormGroup>
                    <Label for="discount_remarks">
                      Remarks (Discount Remarks)
                    </Label>
                    <Input
                      id="discount_remarks"
                      type="textarea" // Use Input with type="textarea"
                      name="discount_remarks"
                      value={
                        assessment.attendances?.[0]?.discount_remarks !==
                          undefined
                          ? assessment.attendances[0].discount_remarks
                          : formData.discount || ""
                      }
                      onChange={handleChange}
                      readOnly
                      placeholder="Enter remarks for the discount"
                    />
                  </FormGroup>
                )}

                <FormGroup>
                  <FormLabel htmlFor="discount">Not Attending</FormLabel>
                  <FormInput
                    id="discount"
                    type="number"
                    name="discount"
                    value={
                      assessment.attendances?.[0]?.not_attending !== undefined
                        ? assessment.attendances[0].not_attending
                        : formData.not_attending || ""
                    }
                    readOnly // 🔒 Make it non-editable
                    style={{
                      backgroundColor: "#f1f3f5",
                      cursor: "not-allowed",
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="discount">Extra Attending</FormLabel>
                  <FormInput
                    id="discount"
                    type="number"
                    name="discount"
                    value={
                      assessment.attendances?.[0]?.extra_attending !== undefined
                        ? assessment.attendances[0].extra_attending
                        : formData.extra_attending || ""
                    }
                    readOnly // 🔒 Make it non-editable
                    style={{
                      backgroundColor: "#f1f3f5",
                      cursor: "not-allowed",
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="discount">Total Amount Paid</FormLabel>
                  <FormInput
                    id="discount"
                    type="number"
                    name="discount"
                    value={
                      assessment.attendances?.[0]?.total_amount_paid !== undefined
                        ? assessment.attendances[0].total_amount_paid
                        : formData.total_amount_paid || ""
                    }
                    readOnly // 🔒 Make it non-editable
                    style={{
                      backgroundColor: "#f1f3f5",
                      cursor: "not-allowed",
                    }}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="amount_paid">Amount Paid</FormLabel>
                  <FormInput
                    id="amount_paid"
                    type="number"
                    name="amount_paid"
                    value={formData.amount_paid || ""}
                    onChange={handleChange}
                    placeholder="Enter amount paid"
                    readOnly={isFullyPaid} // DISABLE IF FULLY PAID
                    style={
                      isFullyPaid
                        ? { backgroundColor: "#f1f3f5", cursor: "not-allowed" }
                        : {}
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="remaining_amount">
                    Remaining Amount
                  </FormLabel>
                  <HighlightedValue
                    color={
                      Number.parseFloat(formData.remaining_amount?.value || 0) > 0
                        ? theme.colors.warning
                        : theme.colors.success
                    }
                    bgColor={
                      Number.parseFloat(formData.remaining_amount?.value || 0) > 0
                        ? `${theme.colors.warning}15`
                        : `${theme.colors.success}15`
                    }
                  >
                    {Number.parseFloat(formData.remaining_amount?.value || 0) >
                      0 ? (
                      <IndianRupee size={18} />
                    ) : (
                      <UserCheck size={18} />
                    )}
                    {parseFloat(
                      formData.remaining_amount?.value || "0"
                    ).toFixed(0)}
                  </HighlightedValue>
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="amount_pending">Amount Pending</FormLabel>
                  <FormInput
                    id="amount_pending"
                    type="number"
                    name="discount"
                    value={
                      assessment.attendances?.[0]?.amount_pending !== undefined
                        ? assessment.attendances[0].amount_pending
                        : formData.amount_pending || ""
                    }
                    readOnly // 🔒 Make it non-editable
                    style={{
                      backgroundColor: "#f1f3f5",
                      cursor: "not-allowed",
                    }}
                  />
                </FormGroup>
              </ResponsiveGrid>
            </FormRow>

            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="payment_type">Payment Type</FormLabel>
                <FormSelect
                  id="payment_type"
                  name="payment_type"
                  value={formData.payment_type || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Type</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="payment_method">Payment Method</FormLabel>
                <FormSelect
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank</option>
                </FormSelect>
              </FormGroup>
            </FormRow>

          </FormSection>

          <ButtonsContainer>
            <Button type="submit">
              <Save size={18} />
              Submit Billing
            </Button>
            <Button type="button" variant="outline" onClick={printReport}>
              <Printer size={18} />
              Print Receipt
            </Button>
          </ButtonsContainer>
        </BillingForm>
      </PageContainer>
    </ThemeProvider>
  );
};

export default TherapyBilling;