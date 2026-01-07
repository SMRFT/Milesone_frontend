import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
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
  // New State for Category Filter
  const [categoryFilter, setCategoryFilter] = useState("All"); 
  
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  const safeNumber = (value) => {
    if (!value) return 0;
    if (typeof value === "object" && value !== null && value.value !== undefined) {
      const num = Number(value.value);
      return isNaN(num) ? 0 : num;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "Cash": return <AccountBalanceWalletIcon sx={{ color: "#4CAF50" }} />;
      case "Card": return <CreditCardIcon sx={{ color: "#2196F3" }} />;
      case "UPI": return <PhoneAndroidIcon sx={{ color: "#FF9800" }} />;
      case "Bank": return <AccountBalanceIcon sx={{ color: "#9C27B0" }} />;
      case "Paid": return <TrendingUpIcon sx={{ color: "#4CAF50" }} />;
      case "Pending": return <TrendingUpIcon sx={{ color: "#f44336" }} />;
      default: return <TrendingUpIcon sx={{ color: "#607D8B" }} />;
    }
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case "Cash": return "#4CAF50";
      case "Card": return "#2196F3";
      case "UPI": return "#FF9800";
      case "Bank": return "#9C27B0";
      case "Paid": return "#4CAF50";
      case "Pending": return "#f44336";
      default: return "#607D8B";
    }
  };

  // --- STATS CALCULATION ---
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
      const status = remainingAmount > 0 ? "Pending" : "Paid";

      stats.All.amount += amount;

      if (stats[method]) {
        stats[method].count += 1;
        stats[method].amount += amount;
      } else {
        if (!stats[method]) {
           stats[method] = { count: 1, amount: amount };
        } else {
           stats[method].count += 1;
           stats[method].amount += amount;
        }
      }

      if (status === "Paid") {
        stats.Paid.count += 1;
        stats.Paid.amount += amount;
      } else if (status === "Pending") {
        stats.Pending.count += 1;
        stats.Pending.amount += amount + remainingAmount;
      }
    });

    return stats;
  };

// --- SPECIAL CALCULATION FOR GRAND TOTAL (THERAPY & PENDING) ---
  const calculateUniqueTotals = (data) => {
    const uniqueTherapyMap = new Map();
    let totalConsulting = 0;
    let totalAssessment = 0;
    let totalOthers = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalTherapyCharge = 0;
    
    // New variables for requested totals
    let totalNotAttending = 0;
    let totalExtraAttending = 0;
    let totalTherapyTotalAmount = 0;

    data.forEach((row) => {
      // 1. Sum standard transactional columns (these are always additive)
      totalConsulting += safeNumber(row.consulting_fee);
      totalAssessment += safeNumber(row.assessment_charge);
      totalOthers += safeNumber(row.others_charge);
      totalDiscount += safeNumber(row.discount_amount);
      totalPaid += safeNumber(row.amount_paid);

      // 2. Handle Unique Logic for Therapy Charges & Pending Amounts
      if (row.category === "Therapy") {
        // Use attendance_id if available (most accurate), otherwise fallback to RegNo+Date
        const key = row.attendance_id || `${row.registration_number}_${row.attendance_date}`;

        // Set the map. Since we corrected the row data to show the TRUE outstanding balance,
        // we can safely overwrite. The last record processed for an ID holds the correct state.
        uniqueTherapyMap.set(key, {
          therapy_charge: safeNumber(row.therapy_charge),
          pending_payment: safeNumber(row.pending_payment),
          // Store these specific therapy fields in the unique map
          not_attending: safeNumber(row.not_attending),
          extra_attending: safeNumber(row.extra_attending),
          total_amount: safeNumber(row.total_amount),
        });
      } else {
        // For non-therapy, add pending directly
        totalPending += safeNumber(row.pending_payment);
      }
    });

    // 3. Sum up the unique totals from the Map
    uniqueTherapyMap.forEach((value) => {
      totalTherapyCharge += value.therapy_charge;
      totalPending += value.pending_payment;
      // Add the new sums
      totalNotAttending += value.not_attending;
      totalExtraAttending += value.extra_attending;
      totalTherapyTotalAmount += value.total_amount;
    });

    return {
      totalConsulting,
      totalAssessment,
      totalTherapyCharge,
      totalOthers,
      totalDiscount,
      totalPaid,
      totalPending,
      totalNotAttending,
      totalExtraAttending,
      totalTherapyTotalAmount,
    };
  };

  const grandTotals = calculateUniqueTotals(filteredData);


  useEffect(() => {
    if (fromDate && toDate) {
      fetchBillingData();
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    let filtered = billingData;

    // Filter by Category
    if (categoryFilter !== "All") {
        filtered = filtered.filter(
            (item) => item.category === categoryFilter
        );
    }

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
        const status = remainingAmount > 0 ? "Pending" : "Paid";
        return status === statusFilter;
      });
    }

    setFilteredData(filtered);
  }, [billingData, paymentMethodFilter, statusFilter, categoryFilter]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      const therapyResult = await apiRequest(
        `${Milestonebaseurl}therapy-reports/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

      const assessmentResult = await apiRequest(
        `${Milestonebaseurl}get_patient_assessments/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

      const othersResult = await apiRequest(
        `${Milestonebaseurl}others-reports/?from_date=${formattedFromDate}&to_date=${formattedToDate}`,
        "GET"
      );

// --- MAPPING THERAPY DATA ---
      const therapyData = (therapyResult.data || []).map((item) => {
        const totalAmount = safeNumber(item.total_amount);
        const currentPaid = safeNumber(item.amount_paid); // Paid in this specific bill
        
        // FIX: Use total_amount_paid (cumulative) from backend to calc Pending
        const cumulativePaid = safeNumber(item.total_amount_paid); 
        
        // Calculate true pending balance (Total Cost - Total Ever Paid)
        const realPending = totalAmount - cumulativePaid - currentPaid;

        return {
          category: "Therapy",
          billing_no: item.billing_no,
          date: item.bill_date,
          // Capture ID for unique grouping calculation
          attendance_id: item.attendance_info?.attendance_id, 
          attendance_date: item.attendance_date || "",
          registration_number: item.registration_number,
          name: item.patient_info?.name_of_child || "Unknown",
          consulting_fee: 0,
          assessment_charge: 0,
          therapy_charge: safeNumber(item.attendance_info?.therapy_charge),
          not_attending:safeNumber(item.attendance_info?.not_attending),
          extra_attending:safeNumber(item.attendance_info?.extra_attending),
          total_amount:safeNumber(item.attendance_info?.total_amount),

          others_charge: 0,
          discount_amount: safeNumber(item.attendance_info?.discount || item.discount),
          // Fix: Ensure pending is never negative
          pending_payment: realPending > 0 ? realPending : 0, 
          amount_paid: currentPaid,
          payment_method: item.payment_method || "",
        };
      });

      // --- MAPPING ASSESSMENT DATA ---
      const assessmentData = (assessmentResult.data.data || []).map((item) => {
        let totalAssessmentPrice = 0;
        let totalConsultantPrice = 0;

        item.assessments?.forEach((assess) => {
          if (assess.assessmentPrice) totalAssessmentPrice += safeNumber(assess.assessmentPrice);
          if (assess.consultantPrice) totalConsultantPrice += safeNumber(assess.consultantPrice);
        });

        const finalAmount = safeNumber(item.finalAmount);
        const totalCalculated = totalAssessmentPrice + totalConsultantPrice;
        const discount = safeNumber(item.discounted_amount);
        const pending = totalCalculated - discount - finalAmount;

        return {
          category: "Assessment", // Added Tag
          billing_no: item.billing_no,
          date: item.date ? item.date.split("T")[0] : "",
          attendance_date: "",
          registration_number: item.registration_number,
          name: item.patient_name,
          consulting_fee: totalConsultantPrice,
          assessment_charge: totalAssessmentPrice,
          therapy_charge: 0,
          others_charge: 0,
          discount_amount: discount,
          amount_paid: finalAmount,
          pending_payment: pending > 0 ? pending : 0,
          payment_method: item.paymentMethod || "",
        };
      });

      // --- MAPPING OTHERS DATA ---
      const othersData = (othersResult.data || []).map((item) => {
        const total = safeNumber(item.total_amount);
        const paid = safeNumber(item.amount_paid);

        return {
          category: "Others", // Added Tag
          billing_no: item.billing_no,
          date: item.date ? item.date.split("T")[0] : "",
          attendance_date: "",
          registration_number: item.registration_number,
          name: item.name,
          consulting_fee: 0,
          assessment_charge: 0,
          therapy_charge: 0,
          others_charge: total,
          amount_paid: paid,
          discount_amount: safeNumber(item.discount || 0),
          pending_payment: total - paid > 0 ? total - paid : 0,
          payment_method: item.payment_method || "",
        };
      });

      const mergedData = [
        ...therapyData,
        ...assessmentData,
        ...othersData,
      ].sort((a, b) => {
        const extractNumber = (billingNo) => {
          if (!billingNo) return 0;
          const match = billingNo.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        };
        return extractNumber(a.billing_no) - extractNumber(b.billing_no);
      });

      setBillingData(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

const handleExportToExcel = () => {
    // ... existing excelData mapping ... 
    const excelData = filteredData.map((row, index) => ({
      // ... (keep your existing mapping here) ...
      "Sl.No": index + 1,
      "Category": row.category,
      "Billing No": row.billing_no,
      Date: row.date ? row.date.split(" ")[0] : "",
      "Registration Number": row.registration_number,
      Name: row.name,
      "Consulting Fee": safeNumber(row.consulting_fee).toFixed(2),
      "Assessment Charge": safeNumber(row.assessment_charge).toFixed(2),
      "Therapy Charge": safeNumber(row.total_amount).toFixed(2),
      "Others Charge": safeNumber(row.others_charge).toFixed(2),
      "Paid Amount": safeNumber(row.amount_paid).toFixed(2),
      "Payment Method": row.payment_method || "",
    }));

    // Add grand total row using the special logic
    const grandTotalRow = {
      "Sl.No": "",
      "Category": "",
      "Billing No": "",
      Date: "",
      "Registration Number": "",
      Name: "Grand Total:",
      "Consulting Fee": grandTotals.totalConsulting.toFixed(2),
      "Assessment Charge": grandTotals.totalAssessment.toFixed(2),
      "Therapy Charge": grandTotals.totalTherapyTotalAmount.toFixed(2),
      "Others Charge": grandTotals.totalOthers.toFixed(2),
      "Paid Amount": grandTotals.totalPaid.toFixed(2),
      "Payment Method": "",
    };

    excelData.push(grandTotalRow);
    // ... rest of the function (XLSX writing) ...
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MDC Accounts Summary");
    XLSX.writeFile(wb, `Accounts_Summary_${paymentMethodFilter}_${statusFilter}.xlsx`);
  };

const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHtml = document.getElementById("billing-table").outerHTML;

    // Calculate payment method totals for "All" filter
    const calculatePaymentMethodTotals = () => {
        const totals = {
            Cash: { count: 0, amount: 0 },
            Card: { count: 0, amount: 0 },
            UPI: { count: 0, amount: 0 },
            Bank: { count: 0, amount: 0 },
            Other: { count: 0, amount: 0 },
        };

        filteredData.forEach((item) => {
            const method = item.payment_method || "Other";
            const amount = safeNumber(item.amount_paid);

            if (totals[method]) {
                totals[method].count += 1;
                totals[method].amount += amount;
            } else {
                totals.Other.count += 1;
                totals.Other.amount += amount;
            }
        });

        return totals;
    };

    // Generate payment method summary table
    const generatePaymentMethodSummary = () => {
        if (paymentMethodFilter !== "All") return "";

        const totals = calculatePaymentMethodTotals();
        let summaryHtml = `
      <div style="margin-top: 30px; page-break-inside: avoid;">
        <h3 style="text-align: center; margin-bottom: 15px; color: Black;">Payment Method Summary</h3>
        <table style="width: 60%; margin: 0 auto; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #406147;">
              <th style="border: 1px solid black; padding: 8px; color: Black; text-align: left;">Payment Method</th>
              <th style="border: 1px solid black; padding: 8px; color: Black; text-align: center;">Count</th>
              <th style="border: 1px solid black; padding: 8px; color: Black; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
    `;

        // Add rows for each payment method that has transactions
        Object.entries(totals).forEach(([method, data]) => {
            if (data.count > 0) {
                summaryHtml += `
          <tr>
            <td style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">${method}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${data.count}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right;">₹${data.amount.toFixed(2)}</td>
          </tr>
        `;
            }
        });

        // Add grand total row
        const grandTotal = Object.values(totals).reduce(
            (sum, data) => sum + data.amount,
            0
        );
        const grandCount = Object.values(totals).reduce(
            (sum, data) => sum + data.count,
            0
        );

        summaryHtml += `
          <tr style="background-color: #e8f5e8; font-weight: bold;">
            <td style="border: 1px solid black; padding: 8px; text-align: left; font-weight: bold;">GRAND TOTAL</td>
            <td style="border: 1px solid black; padding: 8px; text-align: center; font-weight: bold;">${grandCount}</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold; color: #406147;">₹${grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    `;

        return summaryHtml;
    };

    const paymentMethodSummary = generatePaymentMethodSummary();

    printWindow.document.write(`
    <html>
    <head>
        <title>MDC Accounts Summary</title>
        <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
            
            table { width: 100%; border-collapse: collapse; }
            h2, h3 { text-align: center; margin-bottom: 20px; }
            th, td { border: 1px solid black; padding: 3px; text-align: center;}
            td { border: 1px solid black; text-align: center;}
            th { background-color: #f2f2f2; }
            
            /* Main table alignment */
            td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9), td:nth-child(10), td:nth-child(11), td:nth-child(12) { 
                text-align: right;
            }
            td:nth-child(13) { 
                text-align: center;
            }
            td:nth-child(1){ 
                text-align: center;
            }
            
            /* Print header styling */
            .print-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #406147;
                padding-bottom: 10px;
            }
            
            .print-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                font-size: 14px;
                color: #666;
            }
            
            /* Summary table styling */
            .summary-section {
                margin-top: 30px;
                page-break-inside: avoid;
            }
        </style>
    </head>
    <body>
        <div class="print-header">
            <h2>MDC Accounts Summary</h2>
            <div class="print-info">
                <span><strong>Payment Method:</strong> ${paymentMethodFilter} ${statusFilter !== "All" ? `, ${statusFilter} Status` : ""
        }</span>
                <span><strong>Records:</strong> ${filteredData.length}</span>
                <span><strong>Date:</strong> ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}</span>
            </div>
        </div>
        
        ${tableHtml}
        
        ${paymentMethodSummary}
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
  `);
    
    printWindow.document.close();
    // Allow images/styles to load before printing (optional, but good practice)
    setTimeout(() => {
        printWindow.print();
    }, 500);
};

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB").split("/").reverse().join("-");
  };

  const paymentStats = getPaymentStats();

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
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

      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">From Date</Typography>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  customInput={
                    <input style={{ padding: "16.5px 14px", border: "1px solid rgba(0, 0, 0, 0.23)", borderRadius: "4px", fontSize: "16px", width: "100%", outline: "none", height: "56px", boxSizing: "border-box" }} />
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">To Date</Typography>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  customInput={
                    <input style={{ padding: "16.5px 14px", border: "1px solid rgba(0, 0, 0, 0.23)", borderRadius: "4px", fontSize: "16px", width: "100%", outline: "none", height: "56px", boxSizing: "border-box" }} />
                  }
                />
              </Box>
            </Grid>
            
            {/* CATEGORY FILTER */}
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <FormControl fullWidth>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    displayEmpty
                    sx={{ height: "56px", "&:hover fieldset": { borderColor: "#406147" }, "&.Mui-focused fieldset": { borderColor: "#406147" } }}
                  >
                    <MenuItem value="All">All Categories</MenuItem>
                    <MenuItem value="Therapy">Therapy</MenuItem>

                    <MenuItem value="Assessment">Assessment</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Payment Method</Typography>
                <FormControl fullWidth>
                  <Select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    displayEmpty
                    sx={{ height: "56px", "&:hover fieldset": { borderColor: "#406147" }, "&.Mui-focused fieldset": { borderColor: "#406147" } }}
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
            {/* <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    sx={{ height: "56px", "&:hover fieldset": { borderColor: "#406147" }, "&.Mui-focused fieldset": { borderColor: "#406147" } }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid> */}
            <Grid item xs={12} md={2}>
                <Box sx={{ display: "flex", justifyContent: "center", height: "56px", alignItems: "center" }}>
                  <Chip label={`Records: ${filteredData.length}`} sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold", fontSize: "14px", height: "40px", minWidth: "120px" }} />
                </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Method Stats Cards - Kept as is */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {["All", "Cash", "Card", "UPI", "Bank"].map(
          (method) => (
            <Grid item xs={15} sm={8} md={2.4} key={method}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  background: `linear-gradient(135deg, ${getPaymentColor(method)}15, ${getPaymentColor(method)}25)`,
                  border: (method === "Paid" || method === "Pending" ? statusFilter === method : paymentMethodFilter === method) ? `2px solid ${getPaymentColor(method)}` : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
                onClick={() => {
                  if (method === "Paid" || method === "Pending") {
                    setStatusFilter(statusFilter === method ? "All" : method);
                  } else {
                    setPaymentMethodFilter(paymentMethodFilter === method ? "All" : method);
                  }
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Box sx={{ mb: 1 }}>{getPaymentIcon(method)}</Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: getPaymentColor(method) }}>
                    {paymentStats[method]?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {method === "All" ? "Total Records" : method}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
          <button onClick={handleExportToExcel} style={{ backgroundColor: "#406147", color: "white", padding: "12px 24px", fontSize: "16px", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(64, 97, 71, 0.3)" }}>
            <DownloadIcon /> Export Excel
          </button>
          <button onClick={handlePrint} style={{ backgroundColor: "#406147", color: "white", padding: "12px 24px", fontSize: "16px", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(64, 97, 71, 0.3)" }}>
            <PrintIcon /> Print
          </button>
        </Box>
      )}

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", fontSize: "18px", color: "#666" }}>
              Loading...
            </Box>
          ) : filteredData.length > 0 ? (
            <Table id="billing-table">
              <TableHead sx={{ backgroundColor: "#406147" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Billing No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Bill Date</TableCell>
                  {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>Attendance Date</TableCell> */}
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Reg Number</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Consulting</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Assessment</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Therapy</TableCell>
                  {/* <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Not Attended</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Extra Attended</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Total Therapy Amount</TableCell> */}
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Others</TableCell>
                  {/* <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Discount</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Pending</TableCell> */}
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Paid</TableCell>
                  <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row, index) => (
                  <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.billing_no}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    {/* <TableCell>{row.attendance_date}</TableCell> */}
                    <TableCell>{row.registration_number}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{safeNumber(row.consulting_fee).toFixed(2)}</TableCell>
                    <TableCell align="right">{safeNumber(row.assessment_charge).toFixed(2)}</TableCell>
                    <TableCell align="right">{safeNumber(row.total_amount).toFixed(2)}</TableCell>
                    {/* <TableCell align="right">{safeNumber(row.not_attending).toFixed(2)}</TableCell>
                    <TableCell align="right">{safeNumber(row.extra_attending).toFixed(2)}</TableCell>
                    <TableCell align="right">{safeNumber(row.total_amount).toFixed(2)}</TableCell> */}
                    <TableCell align="right">{safeNumber(row.others_charge).toFixed(2)}</TableCell>
                    {/* <TableCell align="right">{safeNumber(row.discount_amount).toFixed(2)}</TableCell> */}
                    {/* <TableCell align="right">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {safeNumber(row.pending_payment).toFixed(2)}
                            </Typography>

                        </Box>
                    </TableCell> */}
                    <TableCell align="right">{safeNumber(row.amount_paid).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip label={row.payment_method || "N/A"} size="small" sx={{ backgroundColor: `${getPaymentColor(row.payment_method)}20`, color: getPaymentColor(row.payment_method), fontWeight: "bold" }} />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Grand Total Row */}

                <TableRow sx={{ backgroundColor: "#e8f5e8", fontWeight: "bold" }}>
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold", fontSize: "16px" }}>
                    Grand Total:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalConsulting.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalAssessment.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalTherapyTotalAmount.toFixed(2)}
                  </TableCell>
                  
                  {/* --- NEW COLUMNS START --- */}
                  {/* <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalNotAttending.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalExtraAttending.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalTherapyTotalAmount.toFixed(2)}
                  </TableCell> */}
                  {/* --- NEW COLUMNS END --- */}

                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalOthers.toFixed(2)}
                  </TableCell>
                  {/* <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {grandTotals.totalDiscount.toFixed(2)}
                  </TableCell> */}
                  {/* <TableCell align="right" sx={{ fontWeight: "bold", color: "#f44336" }}>
                    {grandTotals.totalPending.toFixed(2)}
                  </TableCell> */}
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "#406147" }}>
                    {grandTotals.totalPaid.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            !loading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">No Data Available</Typography>
              </Box>
            )
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Accounts;