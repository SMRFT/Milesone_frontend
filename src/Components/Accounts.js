import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/CloudDownload";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import * as XLSX from "xlsx";
import apiRequest from "./apiRequest";

const Accounts = () => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [billingData, setBillingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    if (
      typeof value === "object" &&
      value !== null &&
      value.value !== undefined
    ) {
      const num = Number(value.value);
      return isNaN(num) ? 0 : num;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case "Cash":
        return <AccountBalanceWalletIcon sx={{ color: "#4CAF50" }} />;
      case "Card":
        return <CreditCardIcon sx={{ color: "#2196F3" }} />;
      case "UPI":
        return <PhoneAndroidIcon sx={{ color: "#FF9800" }} />;
      case "Bank":
        return <AccountBalanceIcon sx={{ color: "#9C27B0" }} />;
      case "Paid":
        return <TrendingUpIcon sx={{ color: "#4CAF50" }} />;
      case "Pending":
        return <TrendingUpIcon sx={{ color: "#f44336" }} />;
      default:
        return <TrendingUpIcon sx={{ color: "#607D8B" }} />;
    }
  };

  // Get payment method color
  const getPaymentColor = (method) => {
    switch (method) {
      case "Cash":
        return "#4CAF50";
      case "Card":
        return "#2196F3";
      case "UPI":
        return "#FF9800";
      case "Bank":
        return "#9C27B0";
      case "Paid":
        return "#4CAF50";
      case "Pending":
        return "#f44336";
      default:
        return "#607D8B";
    }
  };

  // Calculate payment method statistics
  const getPaymentStats = () => {
    const stats = {
      All: { count: billingData.length, amount: 0 },
      Cash: { count: 0, amount: 0 },
      Card: { count: 0, amount: 0 },
      UPI: { count: 0, amount: 0 },
      Bank: { count: 0, amount: 0 },
      Paid: { count: 0, amount: 0 },
      Pending: { count: 0, amount: 0 },
    };

    billingData.forEach((item) => {
      const method = item.payment_method || "Other";
      const amount = safeNumber(item.amount_paid);
      const remainingAmount = safeNumber(item.pending_payment);

      // Determine status properly
      const status =
        item.pending_payment?.status ||
        (remainingAmount > 0 ? "Pending" : "Paid");

      // Add to All total
      stats.All.amount += amount;

      // Add to payment method stats
      if (stats[method]) {
        stats[method].count += 1;
        stats[method].amount += amount;
      }

      // Add to status stats
      if (status === "Paid") {
        stats.Paid.count += 1;
        stats.Paid.amount += amount;
      } else if (status === "Pending") {
        stats.Pending.count += 1;
        stats.Pending.amount += amount + remainingAmount; // Include pending amount
      }
    });

    return stats;
  };
  useEffect(() => {
    if (fromDate && toDate) {
      fetchBillingData();
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    let filtered = billingData;

    // Filter by payment method
    if (paymentMethodFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.payment_method === paymentMethodFilter
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => {
        const remainingAmount = safeNumber(item.pending_payment);
        const status =
          item.pending_payment?.status ||
          (remainingAmount > 0 ? "Pending" : "Paid");
        return status === statusFilter;
      });
    }

    setFilteredData(filtered);
  }, [billingData, paymentMethodFilter, statusFilter]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      // Fetch therapy data using apiRequest
      const therapyResult = await apiRequest(
        `${Milestonebaseurl}therapy-reports/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

      // Fetch assessment data using apiRequest
      const assessmentResult = await apiRequest(
        `${Milestonebaseurl}get_patient_assessments/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

      // Fetch others data using apiRequest
      const othersResult = await apiRequest(
        `${Milestonebaseurl}others-reports/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

      // Check if all requests were successful
      if (
        !therapyResult.success ||
        !assessmentResult.success ||
        !othersResult.success
      ) {
        throw new Error("One or more API requests failed");
      }

      console.log("Therapy Data:", therapyResult.data);
      console.log("Assessment Data:", assessmentResult.data);
      console.log("Others Data:", othersResult.data);

      const therapyData = therapyResult.data.map((item) => ({
        billing_no: item.billing_no,
        date: item.date,
        registration_number: item.registration_number,
        name: item.name,
        consulting_fee: 0,
        assessment_charge: 0,
        therapy_charge: safeNumber(item.therapy_charge),
        others_charge: 0,
        discount_amount: safeNumber(item.discount),
        pending_payment: item.remaining_amount || 0, // Keep the full object
        amount_paid: safeNumber(item.amount_paid || 0),
        payment_method: item.payment_method || "",
      }));

      const assessmentData = assessmentResult.data.data.map((item) => {
        let totalAssessmentPrice = 0;
        let totalConsultantPrice = 0;

        item.assessments?.forEach((assess) => {
          if (assess.assessmentPrice) {
            totalAssessmentPrice += safeNumber(assess.assessmentPrice);
          }
          if (assess.consultantPrice) {
            totalConsultantPrice += safeNumber(assess.consultantPrice);
          }
        });

        return {
          billing_no: item.billing_no,
          date: item.date.split("T")[0],
          registration_number: item.registration_number,
          name: item.patient_name,
          consulting_fee: totalConsultantPrice,
          assessment_charge: totalAssessmentPrice,
          therapy_charge: 0,
          others_charge: 0,
          discount_amount: safeNumber(item.discounted_amount),
          amount_paid: safeNumber(item.finalAmount),
          pending_payment: 0,
          payment_method: item.paymentMethod || "",
        };
      });

      const othersData = othersResult.data.map((item) => ({
        billing_no: item.billing_no,
        date: item.date,
        registration_number: item.registration_number,
        name: item.name,
        consulting_fee: 0,
        assessment_charge: 0,
        therapy_charge: 0,
        others_charge: safeNumber(item.total_amount),
        amount_paid: safeNumber(item.amount_paid),
        discount_amount: safeNumber(item.discount || 0),
        pending_payment: 0,
        payment_method: item.payment_method || "",
      }));

      console.log("Processed Therapy Data:", therapyData);
      console.log("Processed Assessment Data:", assessmentData);
      console.log("Processed Others Data:", othersData);

      const mergedData = [
        ...therapyData,
        ...assessmentData,
        ...othersData,
      ].sort((a, b) => {
        const extractNumber = (billingNo) => {
          const match = billingNo.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        };
        return extractNumber(a.billing_no) - extractNumber(b.billing_no);
      });

      setBillingData(mergedData);
      console.log("Final Merged Data:", mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    const excelData = filteredData.map((row, index) => ({
      "Sl.No": index + 1,
      "Billing No": row.billing_no,
      Date: row.date.split(" ")[0],
      "Registration Number": row.registration_number,
      Name: row.name,
      "Consulting Fee": safeNumber(row.consulting_fee).toFixed(2),
      "Assessment Charge": safeNumber(row.assessment_charge).toFixed(2),
      "Therapy Charge": safeNumber(row.therapy_charge).toFixed(2),
      "Others Charge": safeNumber(row.others_charge).toFixed(2),
      "Discount Amount": safeNumber(row.discount_amount).toFixed(2),
      "Pending Payment": safeNumber(row.pending_payment).toFixed(2),
      "Payment Status":
        row.pending_payment?.status ||
        (safeNumber(row.pending_payment) > 0 ? "Pending" : "Paid"),
      "Status Bill No": row.pending_payment?.new_bill_no || "",
      "Paid Amount": safeNumber(row.amount_paid).toFixed(2),
      "Payment Method": row.payment_method || "",
    }));

    // Add grand total row
    const grandTotalRow = {
      "Sl.No": "",
      "Billing No": "",
      Date: "",
      "Registration Number": "",
      Name: "Grand Total:",
      "Consulting Fee": filteredData
        .reduce((sum, row) => sum + safeNumber(row.consulting_fee), 0)
        .toFixed(2),
      "Assessment Charge": filteredData
        .reduce((sum, row) => sum + safeNumber(row.assessment_charge), 0)
        .toFixed(2),
      "Therapy Charge": filteredData
        .reduce((sum, row) => sum + safeNumber(row.therapy_charge), 0)
        .toFixed(2),
      "Others Charge": filteredData
        .reduce((sum, row) => sum + safeNumber(row.others_charge), 0)
        .toFixed(2),
      "Discount Amount": filteredData
        .reduce((sum, row) => sum + safeNumber(row.discount_amount), 0)
        .toFixed(2),
      "Pending Payment": filteredData
        .reduce((sum, row) => sum + safeNumber(row.pending_payment), 0)
        .toFixed(2),
      "Payment Status": "",
      "Status Bill No": "",
      "Paid Amount": filteredData
        .reduce((sum, row) => sum + safeNumber(row.amount_paid), 0)
        .toFixed(2),
      "Payment Method": "",
    };

    excelData.push(grandTotalRow);

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MDC Accounts Summary");
    XLSX.writeFile(
      wb,
      `Accounts_Summary_${paymentMethodFilter}_${statusFilter}.xlsx`
    );
  };
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHtml = document.getElementById("billing-table").outerHTML;

    printWindow.document.write(`
      <html>
      <head>
          <title>MDC Accounts Summary</title>
          <style>
              table { width: 100%; border-collapse: collapse; }
              h2 { text-align: center; margin-bottom: 20px; }
              th, td { border: 1px solid black; padding: 3px; text-align: center;}
              td { border: 1px solid black; text-align: center;}
              th { background-color: #f2f2f2; }
               td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9), td:nth-child(10), td:nth-child(11), td:nth-child(12) { 
                  text-align: right;
              }
              td:nth-child(13) { 
                  text-align: center;
              }
             td:nth-child(1){ 
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <h2>Accounts Summary - ${paymentMethodFilter} - ${statusFilter} </h2>
          ${tableHtml}
      </body>
      </html>
  `);

    printWindow.document.close();
    printWindow.print();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB").split("/").reverse().join("-");
  };

  const paymentStats = getPaymentStats();

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: "#333",
          textAlign: "center",
          background: "linear-gradient(45deg, #406147, #5a8a61)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Accounts Summary
      </Typography>

      {/* Date Pickers and Filter */}
      {/* Date Pickers and Filter */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={2.5}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  From Date
                </Typography>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  customInput={
                    <input
                      style={{
                        padding: "16.5px 14px",
                        border: "1px solid rgba(0, 0, 0, 0.23)",
                        borderRadius: "4px",
                        fontSize: "16px",
                        width: "100%",
                        outline: "none",
                        transition: "border-color 0.3s",
                        fontFamily: "inherit",
                        backgroundColor: "transparent",
                        height: "56px",
                        boxSizing: "border-box",
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(0, 0, 0, 0.23)";
                        e.target.style.borderWidth = "1px";
                      }}
                    />
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  To Date
                </Typography>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  customInput={
                    <input
                      style={{
                        padding: "16.5px 14px",
                        border: "1px solid rgba(0, 0, 0, 0.23)",
                        borderRadius: "4px",
                        fontSize: "16px",
                        width: "100%",
                        outline: "none",
                        transition: "border-color 0.3s",
                        fontFamily: "inherit",
                        backgroundColor: "transparent",
                        height: "56px",
                        boxSizing: "border-box",
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(0, 0, 0, 0.23)";
                        e.target.style.borderWidth = "1px";
                      }}
                    />
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Method
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      height: "56px",
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#406147",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#406147",
                        },
                      },
                    }}
                  >
                    <MenuItem value="All">All Methods</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Bank">Bank</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    sx={{
                      height: "56px",
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#406147",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#406147",
                        },
                      },
                    }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Records
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    height: "56px",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label={`Records: ${filteredData.length}`}
                    sx={{
                      backgroundColor: "#406147",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "14px",
                      height: "40px",
                      minWidth: "120px",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Method Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {["All", "Cash", "Card", "UPI", "Bank", "Paid", "Pending"].map(
          (method) => (
            <Grid item xs={12} sm={6} md={1.7} key={method}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  background: `linear-gradient(135deg, ${getPaymentColor(
                    method
                  )}15, ${getPaymentColor(method)}25)`,
                  border: (
                    method === "Paid" || method === "Pending"
                      ? statusFilter === method
                      : paymentMethodFilter === method
                  )
                    ? `2px solid ${getPaymentColor(method)}`
                    : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => {
                  if (method === "Paid" || method === "Pending") {
                    setStatusFilter(statusFilter === method ? "All" : method);
                  } else {
                    setPaymentMethodFilter(
                      paymentMethodFilter === method ? "All" : method
                    );
                  }
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Box sx={{ mb: 1 }}>{getPaymentIcon(method)}</Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: getPaymentColor(method) }}
                  >
                    {paymentStats[method]?.count || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {method === "All" ? "Total Records" : method}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#333" }}
                  >
                    ₹{(paymentStats[method]?.amount || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>

      {/* Action Buttons */}
      {filteredData.length > 0 && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}
        >
          <button
            onClick={handleExportToExcel}
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "12px 24px",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(64, 97, 71, 0.3)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#5a8a61";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#406147";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <DownloadIcon />
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "12px 24px",
              fontSize: "16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(64, 97, 71, 0.3)",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#5a8a61";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#406147";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <PrintIcon />
            Print
          </button>
        </Box>
      )}

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <TableContainer>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                fontSize: "18px",
                color: "#666",
              }}
            >
              Loading...
            </Box>
          ) : filteredData.length > 0 ? (
            <Table id="billing-table">
              <TableHead sx={{ backgroundColor: "#406147" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Sl.No
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Billing No
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Registration Number
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Consulting Fee
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Assessment Charge
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Therapy Charge
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Others Charge
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Discount Amount
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Pending Payment
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Paid Amount
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Payment Method
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.billing_no}</TableCell>
                    <TableCell>{row.date.split(" ")[0]}</TableCell>
                    <TableCell>{row.registration_number}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">
                      {safeNumber(row.consulting_fee).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {safeNumber(row.assessment_charge).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {safeNumber(row.therapy_charge).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {safeNumber(row.others_charge).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {safeNumber(row.discount_amount).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {safeNumber(row.pending_payment).toFixed(2)}
                        </Typography>
                        {row.pending_payment?.status && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            {/* Only show Paid status if new_bill_no exists, always show Pending */}
                            {(row.pending_payment.status === "Paid" &&
                              row.pending_payment.new_bill_no) ||
                            row.pending_payment.status === "Pending" ? (
                              <Chip
                                label={
                                  row.pending_payment.status === "Paid"
                                    ? `${row.pending_payment.status} (${row.pending_payment.new_bill_no})`
                                    : "Pending"
                                }
                                size="small"
                                sx={{
                                  backgroundColor:
                                    row.pending_payment.status === "Paid"
                                      ? "#4CAF50"
                                      : "#f44336",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "10px",
                                  height: "20px",
                                  animation:
                                    row.pending_payment.status === "Pending"
                                      ? "blink 1s infinite"
                                      : "none",
                                  "@keyframes blink": {
                                    "0%": { opacity: 1 },
                                    "50%": { opacity: 0.5 },
                                    "100%": { opacity: 1 },
                                  },
                                }}
                              />
                            ) : null}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {safeNumber(row.amount_paid).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.payment_method || "N/A"}
                        size="small"
                        sx={{
                          backgroundColor: `${getPaymentColor(
                            row.payment_method
                          )}20`,
                          color: getPaymentColor(row.payment_method),
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Grand Total Row */}
                <TableRow
                  sx={{ backgroundColor: "#e8f5e8", fontWeight: "bold" }}
                >
                  <TableCell
                    colSpan={5}
                    align="right"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    Grand Total:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.consulting_fee),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.assessment_charge),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.therapy_charge),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.others_charge),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.discount_amount),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.pending_payment),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "#406147" }}
                  >
                    {filteredData
                      .reduce(
                        (sum, row) => sum + safeNumber(row.amount_paid),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {/* Empty cell for Payment Method column */}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            !loading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No Data Available
                </Typography>
              </Box>
            )
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Accounts;
