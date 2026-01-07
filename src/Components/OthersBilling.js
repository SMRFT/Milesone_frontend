"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styled, { ThemeProvider } from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import apiRequest from "./apiRequest";
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
  Plus,
  Trash2,
} from "lucide-react";
import mdcLogo from "./Images/mdcLogo.png";

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

const AddItemRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: end;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  background-color: ${(props) => props.theme.colors.success};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: 0.75rem ${(props) => props.theme.spacing.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.default};
  white-space: nowrap;

  &:hover {
    background-color: ${(props) => props.theme.colors.success}dd;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  background-color: white;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadows.small};
`;

const TableHeader = styled.th`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  padding: ${(props) => props.theme.spacing.md};
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: ${(props) => props.theme.spacing.md};
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  font-size: 0.9rem;
`;

const DeleteButton = styled.button`
  background-color: transparent;
  color: ${(props) => props.theme.colors.error};
  border: none;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.xs};
  border-radius: ${(props) => props.theme.borderRadius.small};
  transition: ${(props) => props.theme.transitions.default};

  &:hover {
    background-color: ${(props) => props.theme.colors.error}15;
  }
`;

const TotalRow = styled.tr`
  background-color: ${(props) => props.theme.colors.highlight};
  font-weight: 600;
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

const OthersBilling = () => {
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
  const [currentOther, setCurrentOther] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [formData, setFormData] = useState({
    registration_number: assessment.registration_number || "",
    name: assessment.name_of_child || "",
    age: convertFormattedAgeToObject(assessment.formattedAge), // Convert here
    sex: assessment.sex || "",
    father_phone_number: assessment.father_phone_number || "",
    mother_phone_number: assessment.mother_phone_number || "",
    others_items: [], // Array to store {description, amount} objects
    total_amount: 0,
    amount_paid: "",
    payment_method: "",
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
  // Calculate total whenever others_items changes
  useEffect(() => {
    const total = formData.others_items.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );
    setFormData((prev) => ({
      ...prev,
      total_amount: total,
    }));
  }, [formData.others_items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOtherItem = () => {
    if (currentOther.trim() && currentAmount.trim()) {
      const newItem = {
        description: currentOther.trim(),
        amount: parseFloat(currentAmount),
      };

      setFormData((prev) => ({
        ...prev,
        others_items: [...prev.others_items, newItem],
      }));

      // Clear input fields
      setCurrentOther("");
      setCurrentAmount("");
    }
  };

  const removeOtherItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      others_items: prev.others_items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await apiRequest(
      `${Milestonebaseurl}others_billing/`,
      "POST",
      formData
    );

    if (result.success) {
      setMessage(`Others Billing for ${formData.name} generated successfully!`);
      setMessageType("success");
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset form data
      setFormData({
        registration_number: "",
        name: "",
        age: "",
        sex: "",
        father_phone_number: "",
        mother_phone_number: "",
        others_items: [],
        total_amount: 0,
        amount_paid: "",
        payment_method: "",
        billingNo: "",
      });
    } else {
      console.error("Error submitting payment data:", result.error);
      setMessage(
        result.error || "Error submitting payment data. Please try again."
      );
      setMessageType("danger");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const printReport = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    const { billingNo } = formData;

    const itemsTableRows = formData.others_items
      .map(
        (item) => `
      <tr>
        <td style="text-align: center;">${item.description}</td>
        <td style="text-align: right;">₹${item.amount.toFixed(0)}</td>
      </tr>
    `
      )
      .join("");

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
              .total-row {
                  font-weight: bold;
                  background-color: #E8F5E8;
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

              .no-print {
                  display: none;
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
              <h2>Others Billing Receipt</h2>
              <h3>Patient Information</h3>
              <table>
                  <tr><th>Date</th><td>${
                    formData.currentDate || "N/A"
                  }</td></tr>
                  <tr><th>Bill Number</th><td>${billingNo || "N/A"}</td></tr>
                  <tr><th>Registration Number</th><td>${
                    assessment.registration_number || "N/A"
                  }</td></tr>
                  <tr><th>Name</th><td>${
                    assessment.name_of_child || "N/A"
                  }</td></tr>
                  <tr><th>Age</th><td>${
                    assessment.formattedAge || "N/A"
                  }</td></tr>
                  <tr><th>Sex</th><td>${
                    formData.sex || "N/A"
                  }</td></tr>                
              </table>
              
              <h3>Billing Details</h3>
              <table>
                  <tr>                 
                      <th style="text-align: center;">Description</th>                                                            
                      <th style="text-align: right;">Amount</th>
                  </tr>
                  ${itemsTableRows}
                  <tr class="total-row">
                      <td style="text-align: right;"><strong>Total Amount</strong></td>
                      <td style="text-align: right;"><strong>₹${formData.total_amount.toFixed(
                        0
                      )}</strong></td>
                  </tr>
                  <tr>
                      <td style="text-align: right;"><strong>Amount Paid</strong></td>
                      <td style="text-align: right;"><strong>₹${parseFloat(
                        formData.amount_paid || "0"
                      ).toFixed(0)}</strong></td>
                  </tr>
                  <tr>
                      <td style="text-align: right;"><strong>Payment Method</strong></td>
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

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <PageTitle>Others Billing</PageTitle>
          <BackButton onClick={() => navigate("/OthersView")}>
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
                <FormLabel htmlFor="name_of_child">Name</FormLabel>
                <FormInput
                  id="name_of_child"
                  type="text"
                  name="name_of_child"
                  value={assessment.name_of_child}
                  onChange={handleChange}
                  placeholder="Enter child's name"
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
                  placeholder="Gender"
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
                  placeholder="Father Phone number"
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
                  placeholder="Mother Phone number"
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection color={theme.colors.success}>
            <SectionHeader>
              <Activity size={20} color={theme.colors.success} />
              <SectionTitle>Billing Details</SectionTitle>
            </SectionHeader>

            {/* Add Item Section */}
            <AddItemRow>
              <FormGroup style={{ flex: 2 }}>
                <FormLabel htmlFor="currentOther">Description</FormLabel>
                <FormInput
                  id="currentOther"
                  type="text"
                  value={currentOther}
                  onChange={(e) => setCurrentOther(e.target.value)}
                  placeholder="Enter description"
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <FormLabel htmlFor="currentAmount">Amount</FormLabel>
                <FormInput
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </FormGroup>
              <AddButton type="button" onClick={addOtherItem}>
                <Plus size={16} />
                Add Item
              </AddButton>
            </AddItemRow>

            {/* Items Table */}
            {formData.others_items.length > 0 && (
              <ItemsTable>
                <thead>
                  <tr>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Action</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {formData.others_items.map((item, index) => (
                    <tr key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <DeleteButton
                          type="button"
                          onClick={() => removeOtherItem(index)}
                        >
                          <Trash2 size={16} />
                        </DeleteButton>
                      </TableCell>
                    </tr>
                  ))}
                  <TotalRow>
                    <TableCell>
                      <strong>Total Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>₹{formData.total_amount.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell></TableCell>
                  </TotalRow>
                </tbody>
              </ItemsTable>
            )}

            {/* Payment Details */}
            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="amount_paid">Amount Paid</FormLabel>
                <FormInput
                  id="amount_paid"
                  type="number"
                  step="0.01"
                  name="amount_paid"
                  value={formData.amount_paid}
                  onChange={handleChange}
                  placeholder="Enter amount paid"
                />
              </FormGroup>
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

export default OthersBilling;
