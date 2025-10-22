"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";
import mdcLogo from "./Images/mdcLogo.png";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";

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

const therapyOptions = [
  { value: "Speech Therapy", label: "Speech Therapy" },
  { value: "Behaviour Therapy", label: "Behaviour Therapy" },
  { value: "OT Therapy", label: "OT Therapy" },
  { value: "PT Therapy", label: "PT Therapy" },
  { value: "Online Therapy", label: "Online Therapy" },
  { value: "Special Education", label: "Special Education" },
  { value: "Group Therapy", label: "Group Therapy" },
  { value: "Early Intervention", label: "Early Intervention" },
  { value: "Applied Behavior Analysis", label: "Applied Behavior Analysis" },
  { value: "Art Therapy", label: "Art Therapy" },
];

const TherapyBilling = () => {
  const employeeName = localStorage.getItem("name");
  const { state } = useLocation();
  const assessment = state?.assessment || {};
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

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

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [formData, setFormData] = useState({
    registration_number: assessment.registration_number || "",
    name: assessment.name_of_child || "",
    age: convertFormattedAgeToObject(assessment.formattedAge), // Convert here
    dob: assessment.dob || "",
    sex: assessment.sex || "",
    father_phone_number: assessment.father_phone_number || "",
    mother_phone_number: assessment.mother_phone_number || "",
    therapy_charge: assessment.total_therapy_charge || "",       // Auto-fill therapy charge
    number_of_sessions: assessment.total_sessions|| "", 
    nameoftherapy: [],
    discount: "0",
    adjusted_charge: "",
    discount_remarks: "",
    amount_paid: "",
    remaining_amount: {
      value: 0,
      status: "Pending",
      paid_date: null,
      new_bill_no: null,
    },
    payment_type: "",
    payment_method: "",
    consultant_doctor: [],
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
            billingNo: result.data.billing_no,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Parse numeric fields to floats where needed
    let updatedValue = value;
    if (
      name === "therapy_charge" ||
      name === "discount" ||
      name === "amount_paid"
    ) {
      updatedValue = Number.parseFloat(value) || 0;
    }
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: updatedValue,
      };
      // Calculate adjusted therapy charge and remaining amount
      const therapyCharge = Number.parseFloat(updatedData.therapy_charge) || 0;
      const discount = Number.parseFloat(updatedData.discount) || 0;
      const amountPaid = Number.parseFloat(updatedData.amount_paid) || 0;
      const adjustedTherapyCharge = therapyCharge - discount;
      const remainingAmountValue = adjustedTherapyCharge - amountPaid;

      updatedData.adjusted_charge = adjustedTherapyCharge.toFixed(2);

      // Update remaining_amount as JSON object
      updatedData.remaining_amount = {
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

      return updatedData;
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
        setMessage(
          `Therapy Billing for ${formData.name} generated successfully!`
        );
        setMessageType("success");
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
        setFormData({
          registration_number: "",
          name: "",
          age: "",
          sex: "",
          father_phone_number: "",
          mother_phone_number: "",
          therapy_charge: "",
          number_of_sessions: "",
          nameoftherapy: [],
          discount: "0",
          adjusted_charge: "",
          discount_remarks: "",
          amount_paid: "",
          remaining_amount: {
            value: 0,
            status: "Pending",
            paid_date: null,
            new_bill_no: null,
          }, // Reset as object
          payment_type: "",
          payment_method: "",
          consultant_doctor: [],
          billingNo: "",
        });
      } else {
        setMessage(
          response.error || "Error submitting payment data. Please try again."
        );
        setMessageType("danger");
        window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
        console.error("Error submitting payment data:", response.error);
      }
    } catch (error) {
      setMessage("Error submitting payment data. Please try again.");
      setMessageType("danger");
      window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to show toast
      console.error("Error submitting payment data:", error);
    }
  };

  const printReport = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    const { date, billingNo, registration_number } = formData;

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
                padding: 4px;
                font-size: 10px;
                line-height: 1.0;
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
                page-break-after: avoid;
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
            <h2>Therapy Receipt</h2>
            <h3>Patient Information</h3>
            <table>
                <tr><th>Date</th><td>${formData.currentDate || "N/A"}</td></tr>
                <tr><th>Bill Number</th><td>${billingNo || "N/A"}</td></tr>
                <tr><th>Registration Number</th><td>${
                  assessment.registration_number || "N/A"
                }</td></tr>
                <tr><th>Name of the Child</th><td>${
                  assessment.name_of_child || "N/A"
                }</td></tr>
                <tr><th>Age</th><td>${
                  assessment.formattedAge || "N/A"
                }</td></tr>
                <tr><th>Sex</th><td>${
                  formData.sex || "N/A"
                }</td></tr>                
            </table>
            
            <h3>Therapy Details</h3>
           <table>
<tr>                 
  <th style="text-align: center;">Therapy</th>
  <th style="text-align: center;">Number of Sessions</th>                                                         
  <th style="text-align: center;">Charge</th>
</tr>
${
  Array.isArray(formData.nameoftherapy) && formData.nameoftherapy.length > 0
    ? `
      ${formData.nameoftherapy
        .map(
          (therapy, index) => `
            <tr>
              <td style="text-align: center;">${therapy || "N/A"}</td>
              ${
                index === 0
                  ? `<td rowspan="${
                      formData.nameoftherapy.length
                    }" style="text-align: center; vertical-align: middle;">
                      ${parseFloat(formData.number_of_sessions || "0").toFixed(
                        0
                      )}
                    </td>`
                  : ""
              }
              ${
                index === 0
                  ? `<td rowspan="${
                      formData.nameoftherapy.length
                    }" style="text-align: right; vertical-align: middle;">
                      <strong>₹${parseFloat(
                        formData.therapy_charge || "0"
                      ).toFixed(0)}</strong>
                    </td>`
                  : ""
              }
            </tr>
          `
        )
        .join("")}
    `
    : `
      <tr>
        <td>N/A</td>
        <td style="text-align: right;"><strong>₹0</strong></td>
      </tr>
    `
}

${
  Number(formData.discount || 0) !== 0
    ? `
    <tr>
      <td colspan="2" style="text-align: right;"><strong>Discount</strong></td>
      <td style="text-align: right;">₹${parseFloat(
        formData.discount || "0"
      ).toFixed(0)}</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: right;"><strong>Final Amount</strong></td>
      <td style="text-align: right;"><strong>₹${parseFloat(
        formData.adjusted_charge || "0"
      ).toFixed(0)}</strong></td>
    </tr>
    `
    : ""
}
<tr>
  <td colspan="2" style="text-align: right;"><strong>Amount Paid</strong></td>
  <td style="text-align: right;"><strong>₹${parseFloat(
    formData.amount_paid || "0"
  ).toFixed(0)}</strong></td>
</tr>
${
  Number(formData.remaining_amount?.value || 0) !== 0
    ? `
    <tr>
      <td colspan="2" style="text-align: right;"><strong>Remaining Amount</strong></td>
      <td style="text-align: right;">₹${parseFloat(
        formData.remaining_amount?.value || "0"
      ).toFixed(0)}</td>
    </tr>
    `
    : ""
}
                <tr>
                    <td colspan="2" style="text-align: right;"><strong>Payment Type</strong></td>
                    <td style="text-align: right;">${
                      formData.payment_type || "N/A"
                    }</td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: right;"><strong>Payment Method</strong></td>
                    <td style="text-align: right;">${
                      formData.payment_method || "N/A"
                    }</td>
                </tr>
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
                  id="billingNo"
                  type="text"
                  name="billingNo"
                  value={formData.billingNo || ""}
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
            </FormRow>
          </FormSection>

          <FormSection color={theme.colors.info}>
            <SectionHeader>
              <User size={20} color={theme.colors.info} />
              <SectionTitle>Personal Details</SectionTitle>
            </SectionHeader>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="name_of_child">Name of the Child</FormLabel>
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
                  value={assessment.formattedAge}
                  onChange={handleChange}
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
                <FormLabel>Name of Therapy</FormLabel>
                <FormSelect onChange={handleSelect}>
                  <option value="">Select</option>
                  {therapyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>

                {/* Display Selected Therapies */}
                {formData.nameoftherapy.length > 0 && (
                  <div className="mt-2">
                    <strong>Selected Therapies:</strong>
                    <ul>
                      {formData.nameoftherapy.map((therapy) => (
                        <li key={therapy} className="d-flex align-items-center">
                          {
                            therapyOptions.find((o) => o.value === therapy)
                              ?.label
                          }
                          <button
                            onClick={() => handleRemove(therapy)}
                            style={{
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "8px",
                              cursor: "pointer",
                            }}
                          >
                            -
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                <FormLabel>Consultant Doctor</FormLabel>
                <FormSelect onChange={handleDoctorSelect}>
                  <option value="">Select</option>
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor.name}>
                      {" "}
                      {/* Use `doctor.name` as value */}
                      {doctor.name}
                    </option>
                  ))}
                </FormSelect>

                {/* Display Selected Doctors */}
                {formData.consultant_doctor.length > 0 && (
                  <div className="mt-2">
                    <strong>Selected Doctors:</strong>
                    <ul>
                      {formData.consultant_doctor.map((doctorName, index) => (
                        <li key={index} className="d-flex align-items-center">
                          {doctorName} {/* Directly show name */}
                          <button
                            onClick={() => handleRemoveDoctor(doctorName)}
                            style={{
                              borderRadius: "50%",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "8px",
                              cursor: "pointer",
                            }}
                          >
                            -
                          </button>
                        </li>
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
              <FormGroup>
                <FormLabel htmlFor="payment_type">Payment Type</FormLabel>
                <FormSelect
                  id="payment_type"
                  name="payment_type"
                  value={formData.payment_type || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Type</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </FormSelect>
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection color={theme.colors.warning}>
            <SectionHeader>
              <IndianRupee size={20} color={theme.colors.warning} />
              <SectionTitle>Payment Details</SectionTitle>
            </SectionHeader>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="amount_paid">Amount Paid</FormLabel>
                <FormInput
                  id="amount_paid"
                  type="number"
                  name="amount_paid"
                  value={formData.amount_paid || ""}
                  onChange={handleChange}
                  placeholder="Enter amount paid"
                />
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="discount">Discount</FormLabel>
                <FormInput
                  id="discount"
                  type="number"
                  name="discount"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  placeholder="Enter discount"
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
                    value={formData.discount_remarks || ""}
                    onChange={handleChange}
                    placeholder="Enter remarks for the discount"
                  />
                </FormGroup>
              )}
              <FormGroup>
                <FormLabel htmlFor="adjusted_charge">Final Amount</FormLabel>
                <HighlightedValue color={theme.colors.primary}>
                  <IndianRupee size={18} />
                  {parseFloat(formData.adjusted_charge || "0").toFixed(0)}
                </HighlightedValue>
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
                  {parseFloat(formData.remaining_amount?.value || "0").toFixed(
                    0
                  )}
                </HighlightedValue>
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="payment_method">Payment Method</FormLabel>
                <FormSelect
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method || ""}
                  onChange={handleChange}
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
