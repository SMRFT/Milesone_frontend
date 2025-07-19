import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import axios from "axios";

const PendingPayment = () => {
  const [patients, setPatients] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [discounts, setDiscounts] = useState({});
  const [discountRemarks, setDiscountRemarks] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingPayments, setUpdatingPayments] = useState({});
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // Function to parse remaining amount (handles both object and string)
  const parseRemainingAmount = (remainingAmount) => {
    try {
      // If it's already an object, use it directly
      if (typeof remainingAmount === "object" && remainingAmount !== null) {
        return remainingAmount.value || 0;
      }
      // If it's a string, parse it
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

  // Function to get remaining amount status (handles both object and string)
  const getRemainingAmountStatus = (remainingAmount) => {
    try {
      // If it's already an object, use it directly
      if (typeof remainingAmount === "object" && remainingAmount !== null) {
        return remainingAmount.status || "Unknown";
      }
      // If it's a string, parse it
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

  // Function to get paid date from remaining amount
  const getPaidDate = (remainingAmount) => {
    try {
      // If it's already an object, use it directly
      if (typeof remainingAmount === "object" && remainingAmount !== null) {
        return remainingAmount.paid_date || null;
      }
      // If it's a string, parse it
      if (typeof remainingAmount === "string") {
        const remainingAmountData = JSON.parse(remainingAmount);
        return remainingAmountData.paid_date || null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing paid date:", error);
      return null;
    }
  };

  // Age calculation function
  const calculateAge = (dob) => {
    if (!dob) return "N/A";

    try {
      const today = new Date();
      const birthDate = new Date(dob);

      // Check if the date is valid
      if (isNaN(birthDate.getTime())) {
        return "Invalid Date";
      }

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      // Adjust for negative days
      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }

      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }

      // Format the age display
      if (years > 0) {
        if (months > 0 && days > 0) {
          return `${years} years, ${months} months, ${days} days`;
        } else if (months > 0) {
          return `${years} years, ${months} months`;
        } else if (days > 0) {
          return `${years} years, ${days} days`;
        } else {
          return `${years} years`;
        }
      } else if (months > 0) {
        if (days > 0) {
          return `${months} months, ${days} days`;
        } else {
          return `${months} months`;
        }
      } else {
        return `${days} days`;
      }
    } catch (error) {
      console.error("Error calculating age:", error);
      return "Error calculating age";
    }
  };

  // Convert formatted age string to object
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
      year: years,
    };
  };

  // Fetch patients data
  const fetchPatients = async () => {
    setLoading(true);

    const result = await apiRequest(
      `${Milestonebaseurl}pendingPayment/`,
      "GET"
    );

    if (result.success) {
      setPatients(result.data);
      setLoading(false);
    } else {
      console.error("Error fetching patients:", result.error);
      setError(result.error || "Failed to load data");
      setLoading(false);

      // Optional: Show toast notification
      toast.error(result.error || "Failed to load data");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePaymentChange = (billingNo, amount) => {
    setPaymentAmounts((prev) => ({
      ...prev,
      [billingNo]: amount,
    }));
  };

  const handleDiscountChange = (billingNo, discount) => {
    setDiscounts((prev) => ({
      ...prev,
      [billingNo]: discount,
    }));
  };

  const handleRemarksChange = (billingNo, remarks) => {
    setDiscountRemarks((prev) => ({
      ...prev,
      [billingNo]: remarks,
    }));
  };

  const handlePaymentMethodChange = (billingNo, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [billingNo]: method,
    }));
  };

  const handleMarkPaid = async (billingNo, remainingAmountData, patientDob) => {
    const remainingAmount = parseRemainingAmount(remainingAmountData);
    const enteredAmount = parseFloat(paymentAmounts[billingNo] || 0);
    const discountAmount = parseFloat(discounts[billingNo] || 0);
    const remarks = discountRemarks[billingNo] || "";
    const paymentMethod = paymentMethods[billingNo] || "";

    // Validation
    if (enteredAmount < 0 || enteredAmount > remainingAmount) {
      setErrorMessage("Invalid payment amount");
      return;
    }

    if (discountAmount < 0 || discountAmount > remainingAmount) {
      setErrorMessage("Invalid discount amount");
      return;
    }

    if (enteredAmount + discountAmount > remainingAmount) {
      setErrorMessage("Total payment + discount exceeds remaining balance");
      return;
    }

    if (!paymentMethod) {
      setErrorMessage("Please select a payment method");
      return;
    }

    if (enteredAmount === 0 && discountAmount === 0) {
      setErrorMessage("Please enter either a payment amount or discount");
      return;
    }

    // Calculate age and convert to object format
    const formattedAge = calculateAge(patientDob);
    const ageObject = convertFormattedAgeToObject(formattedAge);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Set updating state for this specific payment
    setUpdatingPayments((prev) => ({
      ...prev,
      [billingNo]: true,
    }));

    try {
      // Using apiRequest instead of axios.patch
      const result = await apiRequest(
        `${Milestonebaseurl}updatePayment/`,
        "PATCH",
        {
          billing_no: billingNo,
          paid_amount: enteredAmount,
          discount: discountAmount,
          discount_remarks: discountAmount > 0 ? remarks : "",
          payment_method: paymentMethod,
          age: JSON.stringify(ageObject),
          date: today,
        }
      );

      if (result.success) {
        // Clear form fields for this billing number
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

        setSuccessMessage(
          `Payment updated successfully! New bill number: ${
            result.data?.new_bill_no || "N/A"
          }`
        );

        // Refresh the patient list
        await fetchPatients();
      } else {
        // Handle API error response
        console.error("API Error:", result.error);
        setErrorMessage(
          result.error || "Failed to update payment. Please try again."
        );
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      // Clear updating state
      setUpdatingPayments((prev) => {
        const newState = { ...prev };
        delete newState[billingNo];
        return newState;
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Filter patients with pending status and remaining amount > 0
  const filteredPatients = patients.filter((patient) => {
    const remainingAmount = parseRemainingAmount(patient.remaining_amount);
    const status = getRemainingAmountStatus(patient.remaining_amount);

    console.log(`Patient ${patient.name}:`, {
      remainingAmount,
      status,
      rawData: patient.remaining_amount,
    });

    return remainingAmount > 0 && status === "Pending";
  });

  console.log("Filtered patients count:", filteredPatients.length);
  console.log("All patients count:", patients.length);

  return (
    <div>
      <h2>Patients with Pending Therapy Billing</h2>
      <br />

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {filteredPatients.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ "& .MuiTableCell-root": { color: "white" } }}>
              <TableRow>
                <TableCell>Sl.No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Billing No</TableCell>
                <TableCell>Registration No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>D.O.B</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Father Phone</TableCell>
                <TableCell>Mother Phone</TableCell>
                <TableCell>Therapy Charge (Rs.)</TableCell>
                <TableCell>Discount (Rs.)</TableCell>
                <TableCell>Adjusted Charge (Rs.)</TableCell>
                <TableCell>Amount Paid (Rs.)</TableCell>
                <TableCell>Remaining Amount (Rs.)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Enter Amount (Rs.)</TableCell>
                <TableCell>Discount (Rs.)</TableCell>
                <TableCell>Discount Remarks</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient, index) => {
                const remainingAmount = parseRemainingAmount(
                  patient.remaining_amount
                );
                const status = getRemainingAmountStatus(
                  patient.remaining_amount
                );
                const isUpdating = updatingPayments[patient.billing_no];

                return (
                  <TableRow key={patient.billing_no}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {new Date(patient.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{patient.billing_no}</TableCell>
                    <TableCell>{patient.registration_number}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>
                      {new Date(patient.dob).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{calculateAge(patient.dob)}</TableCell>
                    <TableCell>{patient.sex}</TableCell>
                    <TableCell>{patient.father_phone_number}</TableCell>
                    <TableCell>{patient.mother_phone_number}</TableCell>
                    <TableCell>{patient.therapy_charge}</TableCell>
                    <TableCell>{patient.discount}</TableCell>
                    <TableCell>{patient.adjusted_charge}</TableCell>
                    <TableCell>{patient.amount_paid}</TableCell>
                    <TableCell>{remainingAmount}</TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: status === "Pending" ? "orange" : "green",
                          fontWeight: "bold",
                        }}
                      >
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={paymentAmounts[patient.billing_no] || ""}
                        onChange={(e) =>
                          handlePaymentChange(
                            patient.billing_no,
                            e.target.value
                          )
                        }
                        disabled={isUpdating}
                        inputProps={{
                          min: 0,
                          max: remainingAmount,
                          step: 0.01,
                        }}
                        placeholder="Enter amount"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={discounts[patient.billing_no] || ""}
                        onChange={(e) =>
                          handleDiscountChange(
                            patient.billing_no,
                            e.target.value
                          )
                        }
                        disabled={isUpdating}
                        inputProps={{
                          min: 0,
                          max: remainingAmount,
                          step: 0.01,
                        }}
                        placeholder="Enter discount"
                      />
                    </TableCell>
                    <TableCell>
                      {(discounts[patient.billing_no] > 0 ||
                        discountRemarks[patient.billing_no]) && (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={discountRemarks[patient.billing_no] || ""}
                          onChange={(e) =>
                            handleRemarksChange(
                              patient.billing_no,
                              e.target.value
                            )
                          }
                          disabled={isUpdating}
                          placeholder="Enter remarks"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={paymentMethods[patient.billing_no] || ""}
                          onChange={(e) =>
                            handlePaymentMethodChange(
                              patient.billing_no,
                              e.target.value
                            )
                          }
                          label="Payment Method"
                          disabled={isUpdating}
                        >
                          <MenuItem value="">Select payment method</MenuItem>
                          <MenuItem value="Cash">Cash</MenuItem>
                          <MenuItem value="Card">Card</MenuItem>
                          <MenuItem value="UPI">UPI</MenuItem>
                          <MenuItem value="Bank">Bank</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          handleMarkPaid(
                            patient.billing_no,
                            patient.remaining_amount,
                            patient.dob
                          )
                        }
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Processing..." : "Pay"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <center>
          <p>No patients with pending billing.</p>
        </center>
      )}
    </div>
  );
};

export default PendingPayment;
