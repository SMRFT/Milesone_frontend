import React, { useState, useEffect } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import {
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  Check,
  X,
} from "react-feather";

const PRIMARY_COLOR = "#557153";
const ACCENT_COLOR = "#a1c181";
const LIGHT_ACCENT_BG = "rgba(161, 193, 129, 0.2)";
const LIGHTER_BG = "#f8fdf6";

const PendingPayment = () => {
  const [patients, setPatients] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [discounts, setDiscounts] = useState({});
  const [discountRemarks, setDiscountRemarks] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingPayments, setUpdatingPayments] = useState({});
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // Function to parse remaining amount
  const parseRemainingAmount = (remainingAmount) => {
    try {
      if (typeof remainingAmount === "object" && remainingAmount !== null) {
        return remainingAmount.value || 0;
      }
      if (typeof remainingAmount === "string") {
        const remainingAmountData = JSON.parse(remainingAmount);
        return remainingAmountData.value || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error parsing remaining amount:", error);
      return 0;
    }
  };

  // Function to get remaining amount status
  const getRemainingAmountStatus = (remainingAmount) => {
    try {
      if (typeof remainingAmount === "object" && remainingAmount !== null) {
        return remainingAmount.status || "Unknown";
      }
      if (typeof remainingAmount === "string") {
        const remainingAmountData = JSON.parse(remainingAmount);
        return remainingAmountData.status || "Unknown";
      }
      return "Unknown";
    } catch (error) {
      console.error("Error parsing remaining amount status:", error);
      return "Unknown";
    }
  };

  // Age calculation function
  const calculateAge = (dob) => {
    if (!dob) return "N/A";

    try {
      const today = new Date();
      const birthDate = new Date(dob);

      if (isNaN(birthDate.getTime())) {
        return "Invalid Date";
      }

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      if (years > 0) {
        if (months > 0 && days > 0) {
          return `${years}y ${months}m ${days}d`;
        } else if (months > 0) {
          return `${years}y ${months}m`;
        } else {
          return `${years}y`;
        }
      } else if (months > 0) {
        return days > 0 ? `${months}m ${days}d` : `${months}m`;
      } else {
        return `${days}d`;
      }
    } catch (error) {
      console.error("Error calculating age:", error);
      return "Error";
    }
  };

  // Convert formatted age string to object
  const convertFormattedAgeToObject = (formattedAge) => {
    if (!formattedAge || typeof formattedAge !== "string") {
      return { days: 0, months: 0, year: 0 };
    }

    let years = 0;
    let months = 0;
    let days = 0;

    const yearMatch = formattedAge.match(/(\d+)\s*y/i);
    if (yearMatch) years = parseInt(yearMatch[1], 10);

    const monthMatch = formattedAge.match(/(\d+)\s*m/i);
    if (monthMatch) months = parseInt(monthMatch[1], 10);

    const dayMatch = formattedAge.match(/(\d+)\s*d/i);
    if (dayMatch) days = parseInt(dayMatch[1], 10);

    return { days, months, year: years };
  };

  // Fetch patients data
  const fetchPatients = async () => {
    setLoading(true);
    const result = await apiRequest(`${Milestonebaseurl}pendingPayment/`, "GET");

    if (result.success) {
      setPatients(result.data);
      setLoading(false);
    } else {
      console.error("Error fetching patients:", result.error);
      setError(result.error || "Failed to load data");
      setLoading(false);
      toast.error(result.error || "Failed to load data");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePaymentChange = (billingNo, amount) => {
    setPaymentAmounts((prev) => ({ ...prev, [billingNo]: amount }));
  };

  const handleDiscountChange = (billingNo, discount) => {
    setDiscounts((prev) => ({ ...prev, [billingNo]: discount }));
  };

  const handleRemarksChange = (billingNo, remarks) => {
    setDiscountRemarks((prev) => ({ ...prev, [billingNo]: remarks }));
  };

  const handlePaymentMethodChange = (billingNo, method) => {
    setPaymentMethods((prev) => ({ ...prev, [billingNo]: method }));
  };

  const handleMarkPaid = async (billingNo, remainingAmountData, patientDob) => {
    const remainingAmount = parseRemainingAmount(remainingAmountData);
    const enteredAmount = parseFloat(paymentAmounts[billingNo] || 0);
    const discountAmount = parseFloat(discounts[billingNo] || 0);
    const remarks = discountRemarks[billingNo] || "";
    const paymentMethod = paymentMethods[billingNo] || "";

    // Validation
    if (enteredAmount < 0 || enteredAmount > remainingAmount) {
      toast.error("Invalid payment amount");
      return;
    }

    if (discountAmount < 0 || discountAmount > remainingAmount) {
      toast.error("Invalid discount amount");
      return;
    }

    if (enteredAmount + discountAmount > remainingAmount) {
      toast.error("Total payment + discount exceeds remaining balance");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (enteredAmount === 0 && discountAmount === 0) {
      toast.error("Please enter either a payment amount or discount");
      return;
    }

    const formattedAge = calculateAge(patientDob);
    const ageObject = convertFormattedAgeToObject(formattedAge);
    const today = new Date().toISOString().split("T")[0];

    setUpdatingPayments((prev) => ({ ...prev, [billingNo]: true }));

    try {
      const result = await apiRequest(`${Milestonebaseurl}updatePayment/`, "PATCH", {
        billing_no: billingNo,
        paid_amount: enteredAmount,
        discount: discountAmount,
        discount_remarks: discountAmount > 0 ? remarks : "",
        payment_method: paymentMethod,
        age: JSON.stringify(ageObject),
        date: today,
      });

      if (result.success) {
        setPaymentAmounts((prev) => {
          const newState = { ...prev };
          delete newState[billingNo];
          return newState;
        });
        setDiscounts((prev) => {
          const newState = { ...prev };
          delete newState[billingNo];
          return newState;
        });
        setDiscountRemarks((prev) => {
          const newState = { ...prev };
          delete newState[billingNo];
          return newState;
        });
        setPaymentMethods((prev) => {
          const newState = { ...prev };
          delete newState[billingNo];
          return newState;
        });

        toast.success(
          `Payment updated successfully! New bill number: ${result.data?.new_bill_no || "N/A"}`
        );
        await fetchPatients();
      } else {
        toast.error(result.error || "Failed to update payment");
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingPayments((prev) => {
        const newState = { ...prev };
        delete newState[billingNo];
        return newState;
      });
    }
  };

  // Filter patients with pending status and remaining amount > 0
  const filteredPatients = patients.filter((patient) => {
    const remainingAmount = parseRemainingAmount(patient.remaining_amount);
    const status = getRemainingAmountStatus(patient.remaining_amount);
    return remainingAmount > 0 && status === "Pending";
  });

  // Calculate total pending amount
  const totalPending = filteredPatients.reduce(
    (sum, patient) => sum + parseRemainingAmount(patient.remaining_amount),
    0
  );

  if (loading) return <LoadingText>Loading pending payments...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <DollarSign size={28} />
          </IconWrapper>
          <TitleContent>
            <Title>Pending Payments</Title>
            <Subtitle>Manage therapy billing and payments</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        {/* Summary Cards */}
        <SummaryGrid>
          <SummaryCard>
            <SummaryIcon $color="#f59e0b">
              <AlertCircle size={24} />
            </SummaryIcon>
            <SummaryContent>
              <SummaryLabel>Pending Bills</SummaryLabel>
              <SummaryValue>{filteredPatients.length}</SummaryValue>
            </SummaryContent>
          </SummaryCard>

          <SummaryCard>
            <SummaryIcon $color="#ef4444">
              <DollarSign size={24} />
            </SummaryIcon>
            <SummaryContent>
              <SummaryLabel>Total Pending Amount</SummaryLabel>
              <SummaryValue>₹{totalPending.toLocaleString()}</SummaryValue>
            </SummaryContent>
          </SummaryCard>
        </SummaryGrid>

        {filteredPatients.length > 0 ? (
          <TableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <Th>Sl</Th>
                  <Th>Date</Th>
                  <Th>Bill No</Th>
                  <Th>Reg No</Th>
                  <Th>Patient Name</Th>
                  <Th>DOB</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Contact</Th>
                  <Th>Charge</Th>
                  <Th>Discount</Th>
                  <Th>Adjusted</Th>
                  <Th>Paid</Th>
                  <Th>Remaining</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Discount</Th>
                  <Th>Remarks</Th>
                  <Th>Method</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => {
                  const remainingAmount = parseRemainingAmount(patient.remaining_amount);
                  const status = getRemainingAmountStatus(patient.remaining_amount);
                  const isUpdating = updatingPayments[patient.billing_no];

                  return (
                    <PatientRow key={patient.billing_no}>
                      <Td>{index + 1}</Td>
                      <Td>{new Date(patient.date).toLocaleDateString()}</Td>
                      <Td>
                        <BillNo>{patient.billing_no}</BillNo>
                      </Td>
                      <Td>{patient.registration_number}</Td>
                      <Td>
                        <PatientName>{patient.name}</PatientName>
                      </Td>
                      <Td>{new Date(patient.dob).toLocaleDateString()}</Td>
                      <Td>{calculateAge(patient.dob)}</Td>
                      <Td>{patient.sex}</Td>
                      <Td>
                        <ContactInfo>
                          <div>F: {patient.father_phone_number}</div>
                          <div>M: {patient.mother_phone_number}</div>
                        </ContactInfo>
                      </Td>
                      <Td>₹{patient.therapy_charge}</Td>
                      <Td>₹{patient.discount}</Td>
                      <Td>₹{patient.adjusted_charge}</Td>
                      <Td>₹{patient.amount_paid}</Td>
                      <Td>
                        <RemainingAmount>₹{remainingAmount}</RemainingAmount>
                      </Td>
                      <Td>
                        <StatusBadge $status={status}>{status}</StatusBadge>
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={paymentAmounts[patient.billing_no] || ""}
                          onChange={(e) =>
                            handlePaymentChange(patient.billing_no, e.target.value)
                          }
                          disabled={isUpdating}
                          min="0"
                          max={remainingAmount}
                          step="0.01"
                          placeholder="₹ Amount"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={discounts[patient.billing_no] || ""}
                          onChange={(e) =>
                            handleDiscountChange(patient.billing_no, e.target.value)
                          }
                          disabled={isUpdating}
                          min="0"
                          max={remainingAmount}
                          step="0.01"
                          placeholder="₹ Discount"
                        />
                      </Td>
                      <Td>
                        {(discounts[patient.billing_no] > 0 ||
                          discountRemarks[patient.billing_no]) && (
                          <Input
                            type="text"
                            value={discountRemarks[patient.billing_no] || ""}
                            onChange={(e) =>
                              handleRemarksChange(patient.billing_no, e.target.value)
                            }
                            disabled={isUpdating}
                            placeholder="Remarks"
                          />
                        )}
                      </Td>
                      <Td>
                        <Select
                          value={paymentMethods[patient.billing_no] || ""}
                          onChange={(e) =>
                            handlePaymentMethodChange(patient.billing_no, e.target.value)
                          }
                          disabled={isUpdating}
                        >
                          <option value="">Method</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank">Bank</option>
                        </Select>
                      </Td>
                      <Td>
                        <PayButton
                          onClick={() =>
                            handleMarkPaid(
                              patient.billing_no,
                              patient.remaining_amount,
                              patient.dob
                            )
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Spinner />
                              Processing
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              Pay
                            </>
                          )}
                        </PayButton>
                      </Td>
                    </PatientRow>
                  );
                })}
              </tbody>
            </StyledTable>
          </TableWrapper>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Check size={64} />
            </EmptyIcon>
            <EmptyTitle>All Clear!</EmptyTitle>
            <EmptyText>No pending payments at the moment.</EmptyText>
          </EmptyState>
        )}
      </ContentCard>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${ACCENT_COLOR} 0%, ${PRIMARY_COLOR} 100%);
  padding: clamp(1rem, 3vw, 2rem);
  width: 100%;
  overflow-x: hidden;
`;

const Header = styled.div`
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  color: white;
`;

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  svg {
    width: clamp(20px, 4vw, 28px);
    height: clamp(20px, 4vw, 28px);
  }
`;

const TitleContent = styled.div``;

const Title = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  margin: 0.35rem 0 0;
  opacity: 0.95;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: clamp(16px, 3vw, 24px);
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  overflow: hidden;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${LIGHTER_BG};
  border: 2px solid ${LIGHT_ACCENT_BG};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(85, 113, 83, 0.2);
  }
`;

const SummaryIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$color}22;
  color: ${(props) => props.$color};
`;

const SummaryContent = styled.div``;

const SummaryLabel = styled.div`
  font-size: 0.85rem;
  color: ${ACCENT_COLOR};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${PRIMARY_COLOR};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${LIGHTER_BG};
  }

  &::-webkit-scrollbar-thumb {
    background: ${LIGHT_ACCENT_BG};
    border-radius: 4px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: clamp(0.75rem, 2vw, 1rem);
  text-align: left;
  background: ${LIGHTER_BG};
  border-bottom: 2px solid ${LIGHT_ACCENT_BG};
  font-weight: 700;
  color: ${PRIMARY_COLOR};
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PatientRow = styled.tr`
  &:nth-child(even) {
    background-color: ${LIGHTER_BG};
  }
  &:hover {
    background: ${LIGHT_ACCENT_BG};
    transition: background 0.2s ease;
  }
`;

const Td = styled.td`
  padding: clamp(0.75rem, 2vw, 1rem);
  border-bottom: 1px solid ${LIGHT_ACCENT_BG};
  color: ${PRIMARY_COLOR};
  font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  white-space: nowrap;
`;

const BillNo = styled.div`
  font-weight: 700;
  color: ${PRIMARY_COLOR};
  background: ${LIGHT_ACCENT_BG};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
`;

const PatientName = styled.div`
  font-weight: 600;
  color: ${PRIMARY_COLOR};
`;

const ContactInfo = styled.div`
  font-size: 0.7rem;
  line-height: 1.4;

  div {
    white-space: nowrap;
  }
`;

const RemainingAmount = styled.div`
  font-weight: 700;
  color: #ef4444;
  font-size: 0.95rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: ${(props) => (props.$status === "Pending" ? "#f59e0b" : "#10b981")};
  background: ${(props) =>
    props.$status === "Pending" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"};
  border: 1px solid
    ${(props) => (props.$status === "Pending" ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)")};
`;

const Input = styled.input`
  width: 100%;
  min-width: 100px;
  padding: 0.5rem;
  border: 2px solid ${LIGHT_ACCENT_BG};
  border-radius: 8px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  background: ${LIGHTER_BG};
  color: ${PRIMARY_COLOR};

  &:focus {
    outline: none;
    border-color: ${ACCENT_COLOR};
    background: white;
    box-shadow: 0 0 0 3px ${LIGHT_ACCENT_BG};
  }

  &::placeholder {
    color: ${ACCENT_COLOR};
    opacity: 0.6;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  min-width: 120px;
  padding: 0.5rem;
  border: 2px solid ${LIGHT_ACCENT_BG};
  border-radius: 8px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  background: ${LIGHTER_BG};
  color: ${PRIMARY_COLOR};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${ACCENT_COLOR};
    background: white;
    box-shadow: 0 0 0 3px ${LIGHT_ACCENT_BG};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${ACCENT_COLOR} 100%);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(85, 113, 83, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: clamp(3rem, 8vw, 5rem) clamp(1rem, 3vw, 2rem);
`;

const EmptyIcon = styled.div`
  color: ${ACCENT_COLOR};
  margin-bottom: 1.5rem;
  opacity: 0.5;

  svg {
    width: clamp(48px, 10vw, 64px);
    height: clamp(48px, 10vw, 64px);
  }
`;

const EmptyTitle = styled.h3`
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  color: ${PRIMARY_COLOR};
  margin: 0 0 0.5rem;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: ${ACCENT_COLOR};
  font-size: clamp(0.9rem, 2vw, 1rem);
  margin: 0;
`;

const LoadingText = styled.div`
  text-align: center;
  color: white;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  padding: 3rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${ACCENT_COLOR} 0%, ${PRIMARY_COLOR} 100%);
`;

const ErrorText = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 1.1rem;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  margin: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

export default PendingPayment;
