import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

const PendingPayment = () => {
  const [patients, setPatients] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [discounts, setDiscounts] = useState({});
  const [discountRemarks, setDiscountRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    axios
      .get(`${Milestonebaseurl}pendingPayment/`)
      .then((response) => {
        setPatients(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setError("Failed to load data");
        setLoading(false);
      });
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

  const handleMarkPaid = (billingNo, remainingAmount) => {
    const enteredAmount = parseFloat(paymentAmounts[billingNo] || 0);
    const discountAmount = parseFloat(discounts[billingNo] || 0);
    const remarks = discountRemarks[billingNo] || "";

    if (enteredAmount < 0 || enteredAmount > remainingAmount) {
      alert("Invalid payment amount");
      return;
    }

    if (discountAmount < 0 || discountAmount > remainingAmount) {
      alert("Invalid discount amount");
      return;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    axios
      .patch(`${Milestonebaseurl}updatePayment/`, {
        billing_no: billingNo,
        paid_amount: enteredAmount,
        discount: discountAmount,
        discount_remarks: discountAmount > 0 ? remarks : "", // Include remarks only if discount is applied
        date: today,
      })
      .then((response) => {
        alert("Payment updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating payment:", error);
        alert("Failed to update payment");
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const filteredPatients = patients.filter(
    (patient) => patient.remaining_amount > 0
  );

  return (
    <div>
      <h2>Patients with Pending Therapy Billing</h2>
      <br />
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
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Father Phone</TableCell>
                <TableCell>Mother Phone</TableCell>
                <TableCell>Therapy Charge (Rs.)</TableCell>
                <TableCell>Discount (Rs.)</TableCell>
                <TableCell>Adjusted Charge (Rs.)</TableCell>
                <TableCell>Amount Paid (Rs.)</TableCell>
                <TableCell>Remaining Amount (Rs.)</TableCell>
                <TableCell>Enter Amount (Rs.)</TableCell>
                <TableCell>Discount (Rs.)</TableCell>
                <TableCell>Discount Remarks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{patient.date.split(" ")[0]}</TableCell>
                  <TableCell>{patient.billing_no}</TableCell>
                  <TableCell>{patient.registration_number}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>
                    {patient.age
                      ? `${patient.age.year} y, ${patient.age.months} m, ${patient.age.days} d`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{patient.sex}</TableCell>
                  <TableCell>{patient.father_phone_number}</TableCell>
                  <TableCell>{patient.mother_phone_number}</TableCell>
                  <TableCell>{patient.therapy_charge}</TableCell>
                  <TableCell>{patient.discount}</TableCell>
                  <TableCell>{patient.adjusted_charge}</TableCell>
                  <TableCell>{patient.amount_paid}</TableCell>
                  <TableCell>{patient.remaining_amount}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      value={paymentAmounts[patient.billing_no] || ""}
                      onChange={(e) =>
                        handlePaymentChange(patient.billing_no, e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      value={discounts[patient.billing_no] || ""}
                      onChange={(e) =>
                        handleDiscountChange(patient.billing_no, e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {discounts[patient.billing_no] > 0 && (
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
                        placeholder="Enter remarks"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      variant="contained"
                      onClick={() =>
                        handleMarkPaid(
                          patient.billing_no,
                          patient.remaining_amount
                        )
                      }
                    >
                      Pay
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <center>
          <p>No patients with remaining billing.</p>
        </center>
      )}
    </div>
  );
};

export default PendingPayment;
