
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import DownloadIcon from "@mui/icons-material/CloudDownload"; // Download icon
import PrintIcon from "@mui/icons-material/Print"; // Print icon
import * as XLSX from "xlsx"; // Import the XLSX library for Excel export
import mdcLogo from "./Images/mdcLogo.png";
import apiRequest from "./apiRequest";

const TherapyReports = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [discountFilter, setDiscountFilter] = useState(""); // State for manual discount filter
  const [searchQuery, setSearchQuery] = useState(""); // State for global search
  const employeeName = localStorage.getItem("name");
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
    setFromDate(currentDate);
    setToDate(currentDate);
    fetchData(currentDate, currentDate); // Fetch data for the current date initially
  }, []);

  // Fetch data from backend API
  const fetchData = async (fromDate, toDate) => {
    setLoading(true); // Set loading to true at the start

    // Build the URL with query parameters
    let url = `${Milestonebaseurl}therapy-reports/`;
    const params = new URLSearchParams();

    if (fromDate && toDate) {
      params.append("from_date", fromDate);
      params.append("to_date", toDate);
    }

    // Add query parameters to URL if they exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const result = await apiRequest(url, "GET");

    if (result.success) {
      setData(result.data);
      setFilteredData(result.data);
      setLoading(false);
    } else {
      console.error("Error fetching therapy reports:", result.error);
      setLoading(false);
    }
  };
  // Handle date range change
  const handleDateFilter = () => {
    fetchData(fromDate, toDate);
  };

  // Filter data by discount value > 0
  const handleDiscountAppliedFilter = () => {
    const filtered = data.filter((item) => item.discount > 0);
    setFilteredData(filtered);
  };

  // Update fromDate and toDate
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  // Filter data by custom discount value
  const handleDiscountFilter = () => {
    const filtered = data.filter((item) =>
      discountFilter ? item.discount >= parseFloat(discountFilter) : true
    );
    setFilteredData(filtered);
  };

  // Handle discount input change
  const handleDiscountChange = (e) => {
    setDiscountFilter(e.target.value);
  };

  // Handle Search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      const patientName = item.patient_info?.name_of_child?.toLowerCase() || "";
      const billingNo = item.billing_no?.toLowerCase() || "";
      const regNo = item.registration_number?.toLowerCase() || "";
      const paymentMethod = item.payment_method?.toLowerCase() || "";
      const paymentType = item.payment_type?.toLowerCase() || "";

      return (
        patientName.includes(query) ||
        billingNo.includes(query) ||
        regNo.includes(query) ||
        paymentMethod.includes(query) ||
        paymentType.includes(query)
      );
    });
    setFilteredData(filtered);
  };


  const formatTherapyName = (therapy) => {
    if (typeof therapy === "string") return therapy;
    if (typeof therapy === "object" && therapy !== null) {
      if (therapy.therapy_name) return therapy.therapy_name;
      return JSON.stringify(therapy);
    }
    return "";
  };

  const handleDownload = () => {
    // Format the data before exporting
    const formattedData = filteredData.map((item, index) => {
      const patient = item.patient_info || {};
      const attendance = item.attendance_info || {};
      const age = patient.age || {};
      const therapyDetails = attendance.therapy_details || [];
      const consultantDoctor = attendance.consultant_doctor || [];
      const totalAmount = attendance.total_amount ? parseFloat(attendance.total_amount) : 0;
      const totalPaid = attendance.total_amount_paid ? parseFloat(attendance.total_amount_paid) : 0;
      const remainingValue = totalAmount - totalPaid;

      const formattedAge =
        age.year || age.months || age.days
          ? `${age.year || 0} years, ${age.months || 0} months, ${age.days || 0
          } days`
          : "N/A";

      const therapyNames = Array.isArray(therapyDetails)
        ? therapyDetails.map(formatTherapyName).join(", ")
        : (therapyDetails || "N/A");

      const doctorNames = Array.isArray(consultantDoctor)
        ? consultantDoctor.join(", ")
        : (consultantDoctor || "N/A");

      return {
        "Sl. No": index + 1,
        "Billing No": item.billing_no,
        Date: item.bill_date ? new Date(item.bill_date).toLocaleDateString() : (item.date ? new Date(item.date).toLocaleDateString() : "N/A"),
        "Registration Number": item.registration_number,
        "Name of Child": patient.name_of_child || "N/A",
        Age: formattedAge,
        Sex: patient.sex || "N/A",
        "Father Phone Number": patient.father_phone_number || "N/A",
        "Mother Phone Number": patient.mother_phone_number || "N/A",
        "Name of Therapy": therapyNames,
        "Consultant Doctor": doctorNames,
        "Therapy Charge (Rs.)": attendance.therapy_charge || 0,
        "Discount (Rs.)": attendance.discount || 0,
        "Discount Remarks": attendance.discount_remarks || "",
        "Not attending (Rs.)": attendance.not_attending ||0,
        "Extra attending (Rs.)":attendance.extra_attending ||0,
        "Adjusted Charge (Rs.)": attendance.total_amount || 0,
        "Amount Paid (Rs.)": item.amount_paid || 0,
        "Remaining Amount (Rs.)": remainingValue > 0 ? remainingValue : (
          typeof item.remaining_amount === "object"
            ? `${item.remaining_amount.value} (${item.remaining_amount.status})`
            : (item.remaining_amount || 0)
        ),
        "Payment Type": item.payment_type || "N/A",
        "Payment Method": item.payment_method || "N/A",
      };
    });

    // Calculate grand totals
    const grandTotal = {
      "Sl. No": "Grand Total",
      "Billing No": "",
      Date: "",
      "Name of Child": "",
      Age: "",
      Sex: "",
      "Name of Therapy": "",
      "Consultant Doctor": "",
      Phone: "",
      "Therapy Charge (Rs.)": filteredData.reduce(
        (sum, item) => sum + parseFloat(item.attendance_info?.therapy_charge || 0),
        0
      ),
      "Discount (Rs.)": filteredData.reduce(
        (sum, item) => sum + parseFloat(item.attendance_info?.discount || 0),
        0
      ),
      "Discount Remarks": "",
      "Adjusted Charge (Rs.)": filteredData.reduce(
        (sum, item) => sum + parseFloat(item.attendance_info?.total_amount || 0),
        0
      ),
      "Amount Paid (Rs.)": filteredData.reduce(
        (sum, item) => sum + parseFloat(item.amount_paid || 0),
        0
      ),
      "Remaining Amount (Rs.)": filteredData.reduce(
        (sum, item) => {
          const att = item.attendance_info || {};
          const rem = (parseFloat(att.total_amount || 0) - parseFloat(att.total_amount_paid || 0));
          return sum + (rem > 0 ? rem : 0);
        },
        0
      ),
      "Payment Type": "",
      "Payment Method": "",
    };

    const dataWithTotal = [...formattedData, grandTotal];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataWithTotal);
    XLSX.utils.book_append_sheet(wb, ws, "Therapy Reports");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "therapy_reports.xlsx";
    link.click();
  };

  // Handle Print Click to print static data

  const handlePrint = () => {
    // Calculate grand totals to use in the print
    const grandTotal = {
      therapy_charge: filteredData.reduce(
        (sum, item) => sum + parseFloat(item.attendance_info?.therapy_charge || 0),
        0
      ),
      discount: filteredData.reduce((sum, item) => sum + parseFloat(item.attendance_info?.discount || 0), 0),
      adjusted_charge: filteredData.reduce(
        (sum, item) => sum + parseFloat(item.attendance_info?.total_amount || 0),
        0
      ),
      amount_paid: filteredData.reduce(
        (sum, item) => sum + parseFloat(item.amount_paid || 0),
        0
      ),
      remaining_amount: filteredData.reduce(
        (sum, item) => {
          const att = item.attendance_info || {};
          const rem = (parseFloat(att.total_amount || 0) - parseFloat(att.total_amount_paid || 0));
          return sum + (rem > 0 ? rem : 0);
        },
        0
      ),
    };

    const tableHTML = `
      <html>
        <head>
          <title> MDC Therapy Billing Report</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h2>Therapy Billing Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Billing No</th>
                <th>Date</th>
                <th>Registration Number</th>
                <th>Name of Child</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Father Phone Number</th>
                <th>Mother Phone Number</th>
                <th>Name of Therapy</th>
                <th>Number of Sessions</th>
                <th>Consultant Doctor</th>              
                <th>Therapy Charge (Rs.)</th>
                <th>Discount (Rs.)</th>
                <th>Discount Remarks</th>
                <th>Adjusted Charge (Rs.)</th>
                <th>Amount Paid (Rs.)</th>
                <th>Remaining Amount (Rs.)</th>
                <th>Payment Type</th>
                <th>Payment Method</th>                
              </tr>
            </thead>
            <tbody>
              ${filteredData
        .map(
          (item, index) => {
            const patient = item.patient_info || {};
            const attendance = item.attendance_info || {};
            const therapyDetails = attendance.therapy_details || [];
            const consultantDoctor = attendance.consultant_doctor || [];
            const age = patient.age || {};
            const totalAmount = attendance.total_amount ? parseFloat(attendance.total_amount) : 0;
            const totalPaid = attendance.total_amount_paid ? parseFloat(attendance.total_amount_paid) : 0;
            const remainingValue = totalAmount - totalPaid;

            const formattedAge = age.year || age.months || age.days
              ? `${age.year || 0} years, ${age.months || 0} months, ${age.days || 0} days`
              : "N/A";

            const dateStr = item.bill_date ? new Date(item.bill_date).toLocaleDateString() : (item.date ? new Date(item.date).toLocaleDateString() : "N/A");

            return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.billing_no}</td>
                    <td>${dateStr}</td>
                    <td>${item.registration_number}</td>
                    <td>${patient.name_of_child || "N/A"}</td>
                    <td>${formattedAge}</td>
                    <td>${patient.sex || "N/A"}</td>
                    <td>${patient.father_phone_number || "N/A"}</td>
                    <td>${patient.mother_phone_number || "N/A"}</td>
                     <td>
                         ${(Array.isArray(therapyDetails)
                ? therapyDetails.map(formatTherapyName)
                : (therapyDetails || "N/A")
              )}
                   </td>
                    <td style="text-align: center;">${attendance.session || item.number_of_sessions || 0
              }</td>

                    <td>
                      ${(Array.isArray(consultantDoctor)
                ? consultantDoctor.join(", ")
                : (consultantDoctor || "N/A")
              )}
                   </td>                    
                    <td style="text-align: right;">${attendance.therapy_charge || item.therapy_charge || 0}</td>
                    <td style="text-align: right;">${attendance.discount || item.discount || 0}</td>
                    <td>${attendance.discount_remarks || item.discount_remarks || ""}</td>
                    <td style="text-align: right;">${attendance.total_amount || item.adjusted_charge || 0}</td>
                    <td style="text-align: right;">${item.amount_paid || 0}</td>
                    <td style="text-align: right;">${remainingValue > 0 ? remainingValue : (
                typeof item.remaining_amount === "object"
                  ? `${item.remaining_amount.value} (${item.remaining_amount.status})`
                  : (item.remaining_amount || 0)
              )
              }</td>
                    <td>${item.payment_type || "N/A"}</td>
                    <td>${item.payment_method || "N/A"}</td>                   
                  </tr>
                `;
          }
        )
        .join("")}
              <tr>
                <td colspan="12"><strong>Grand Total</strong></td>
                <td style="text-align: right;">${grandTotal.therapy_charge}</td>
                <td style="text-align: right;">${grandTotal.discount}</td>
                <td colspan="2" style="text-align: right;">${grandTotal.adjusted_charge
      }</td>
                <td style="text-align: right;">${grandTotal.amount_paid}</td>
                <td style="text-align: right;">${grandTotal.remaining_amount
      }</td>
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const calculateGrandTotal = () => {
    return filteredData.reduce(
      (totals, item) => {
        const remainingAmount =
          typeof item.remaining_amount === "object"
            ? item.remaining_amount.value
            : item.remaining_amount;
        return {
          therapy_charge:
            totals.therapy_charge + parseFloat(item.therapy_charge || 0),
          discount: totals.discount + parseFloat(item.discount || 0),
          adjusted_charge:
            totals.adjusted_charge + parseFloat(item.adjusted_charge || 0),
          amount_paid: totals.amount_paid + parseFloat(item.amount_paid || 0),
          remaining_amount:
            totals.remaining_amount + parseFloat(remainingAmount || 0),
        };
      },
      {
        therapy_charge: 0,
        discount: 0,
        adjusted_charge: 0,
        amount_paid: 0,
        remaining_amount: 0,
      }
    );
  };

  const handlePrintRow = (item) => {
    const patient = item.patient_info || {};
    const attendance = item.attendance_info || {};
    const therapyDetails = attendance.therapy_details || [];
    const age = patient.age || {};
    const totalAmount = attendance.total_amount ? parseFloat(attendance.total_amount) : 0;
    const totalPaid = attendance.total_amount_paid ? parseFloat(attendance.total_amount_paid) : 0;
    const remainingValue = totalAmount - totalPaid;

    const printWindow = window.open("", "", "width=800,height=600");
    const rowHTML = `
     <html>
          <head>
          <title>Milestone Development Center - Receipt</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
              body {
                  font-family: 'Poppins', Arial, sans-serif;
                  margin: 20px;
                  background-color: #f5f5f5;
                  color: #333;
              }
              .container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #fff;
                  padding: 40px;
                  border-radius: 12px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                  position: relative;
              }
              .header {
                  display: flex;
                  align-items: flex-start;
                  justify-content: space-between;
                  margin-bottom: 20px;
                  border-bottom: 3px solid #406147;
                  padding-bottom: 20px;
              }                 
              .logo {
                  width: 120px;
                  height: auto;
              }
              .contact-details {
                  text-align: right;
                  font-size: 11px;
                  color: #555;
                  line-height: 1.4;
              }
              .receipt-title {
                text-align: center;
                margin: 20px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #406147;
                font-weight: 700;
                font-size: 18px;
              }
              
              .section-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #406147;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
                  margin-top: 20px;
              }

              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
              }
              table th, table td {
                  padding: 8px 12px;
                  font-size: 12px;
                  text-align: left;
                  border-bottom: 1px solid #eee;
              }
              table th {
                  background-color: #f8f9fa;
                  font-weight: 600;
                  color: #555;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                font-size: 12px;
                margin-bottom: 20px;
              }
              .info-item {
                display: flex;
                flex-direction: column;
              }
              .info-label {
                color: #888;
                font-size: 10px;
                margin-bottom: 2px;
              }
              .info-value {
                font-weight: 500;
                font-size: 13px;
              }
              
              .footer {
                  margin-top: 40px;
                  text-align: right;
                  font-size: 11px;
                  color: #555;
              }
              .signature-line {
                 border-top: 1px solid #ccc;
                 width: 200px;
                 margin-left: auto;
                 margin-top: 40px;
                 padding-top: 5px;
                 text-align: center;
              }

              @media print {                 
                  .container { box-shadow: none; padding: 20px; }
                  body { background-color: #fff; }
              }
          </style>
      </head>
           <body>
                <div class="container">
                <div class="header">
                     <img src="${mdcLogo}" alt="Logo" class="logo" />
                     <div class="contact-details">
                         <strong>Milestone Development Center</strong><br/>
                         59/37, Saradha College Road, Salem-636007<br/>
                         Tamil Nadu, India<br/>
                         Phone: +91 90470 33633<br/>
                         Email: info@milestonescenter.in
                     </div>
                 </div>

              <div class="receipt-title">Therapy Receipt</div>
              
              <div class="info-grid">
                  <div class="info-item"><span class="info-label">Date</span><span class="info-value">${item.bill_date ? new Date(item.bill_date).toLocaleDateString() : (item.date ? new Date(item.date).toLocaleDateString() : "N/A")}</span></div>
                  <div class="info-item"><span class="info-label">Bill Number</span><span class="info-value">${item.billing_no || "N/A"}</span></div>
                  <div class="info-item"><span class="info-label">Registration No</span><span class="info-value">${item.registration_number || "N/A"}</span></div>
                  <div class="info-item"><span class="info-label">Child Name</span><span class="info-value">${patient.name_of_child || "N/A"}</span></div>
                  <div class="info-item"><span class="info-label">Age/Sex</span><span class="info-value">${age.year || 0}Y ${age.months || 0}M / ${patient.sex || "-"}</span></div>
                  <div class="info-item"><span class="info-label">Payment Mode</span><span class="info-value">${item.payment_method || "-"}</span></div>
              </div>
              
              <div class="section-title">Therapy & Charges</div>
              <table>
                  <tr>                 
                    <th style="text-align: center;">Therapy</th>                                                            
                    <th style="text-align: center;">Sessions</th>                                                            
                    <th style="text-align: right;">Amount</th>
                  </tr>
                  ${Array.isArray(therapyDetails) && therapyDetails.length > 0
        ? therapyDetails.map((therapy, index) => `
                        <tr>
                            <td style="text-align: center;">${formatTherapyName(therapy)}</td>
                            ${index === 0 ? `<td rowspan="${therapyDetails.length}" style="text-align: center; vertical-align: middle;">${parseFloat(attendance.session || item.number_of_sessions || "0").toFixed(0)}</td>` : ''}
                            ${index === 0 ? `<td rowspan="${therapyDetails.length}" style="text-align: right; vertical-align: middle;">₹${parseFloat(attendance.therapy_charge || item.therapy_charge || "0").toFixed(2)}</td>` : ''}
                        </tr>
                    `).join("")
        : `<tr><td colspan="3" style="text-align: center;">No Details</td></tr>`
      }
      
      ${Number(attendance.discount || item.discount || 0) !== 0
        ? `
        <tr>
            <td colspan="2" style="text-align: right; color: #777;">Discount</td>
            <td style="text-align: right; color: #e74c3c;">- ₹${parseFloat(attendance.discount || item.discount || "0").toFixed(2)}</td>
        </tr>` : ""}
        <tr>
            <td colspan="2" style="text-align: right; font-weight: bold;">Not Attended</td>
            <td style="text-align: right; font-weight: bold;">₹${parseFloat(attendance.not_attending || item.not_attending || "0").toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: right; font-weight: bold;">Extra Attended</td>
            <td style="text-align: right; font-weight: bold;">₹${parseFloat(attendance.extra_attending || item.extra_attending || "0").toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: right; font-weight: bold;">Net Payble</td>
            <td style="text-align: right; font-weight: bold;">₹${parseFloat(attendance.total_amount || item.adjusted_charge || "0").toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: right;">Amount Paid</td>
            <td style="text-align: right; color: #27ae60;">₹${parseFloat(item.amount_paid || "0").toFixed(2)}</td>
        </tr>
        ${Number(remainingValue) > 0 ? `
        <tr>
            <td colspan="2" style="text-align: right; color: #c0392b;">Balance Due</td>
            <td style="text-align: right; color: #c0392b; font-weight: bold;">₹${parseFloat(remainingValue).toFixed(2)}</td>
        </tr>` : ""}
              </table>
              
              <div class="footer">
                  <div class="signature-line">
                      Auth. Signature<br/>
                      <span style="font-size: 10px; color: #888;">${employeeName || "Authorized Personnel"}</span>
                  </div>
              </div>
          </div>
      </body>
      </html>
  `;

    printWindow.document.write(rowHTML);
    setTimeout(() => {
      printWindow.document.close();
      printWindow.print();
    }, 1000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Therapy Billing Reports</h2>

      {/* Date Range Filters */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <TextField
          label="From Date"
          type="date"
          variant="outlined"
          value={fromDate}
          onChange={handleFromDateChange}
          InputLabelProps={{ shrink: true }}
          style={{ width: "200px" }}
        />
        <TextField
          label="To Date"
          type="date"
          variant="outlined"
          value={toDate}
          onChange={handleToDateChange}
          InputLabelProps={{ shrink: true }}
          style={{ width: "200px" }}
        />
        <button
          variant="contained"
          color="primary"
          onClick={handleDateFilter}
          style={{ alignSelf: "center", background: "#406147" }}
        >
          Filter
        </button>
      </div>

      {/* Discount Filters */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <TextField
          label="Discount Filter (Min Discount)"
          type="number"
          variant="outlined"
          value={discountFilter}
          onChange={handleDiscountChange}
          style={{ width: "300px" }}
        />
        <button
          variant="contained"
          color="white"
          onClick={handleDiscountFilter}
          style={{ alignSelf: "center", background: "#406147" }}
        >
          Apply Discount Filter
        </button>
        {/* Icon to filter patients with discount > 0 */}
        <button
          onClick={handleDiscountAppliedFilter}
          title="Discount only"
          style={{
            alignSelf: "center",
            background: "#406147",
            borderRadius: "50%",
            padding: "10px",
            color: "white",
          }}
        >
          <DiscountIcon />
        </button>
      </div>

      {/* Download and Print Icons */}
      {filteredData.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "20px",
          }}
        >
          <IconButton
            onClick={handleDownload}
            style={{ background: "#406147" }}
          >
            <DownloadIcon style={{ color: "white" }} />
          </IconButton>
          <IconButton onClick={handlePrint} style={{ background: "#406147" }}>
            <PrintIcon style={{ color: "white" }} />
          </IconButton>
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <CircularProgress />
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>No data available</p>
        </div>
      ) : (
        <TableContainer component={Paper} style={{ marginTop: "10px", borderRadius: "15px", overflow: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Sl. No", "Billing No", "Date", "Reg No", "Child Name", "Age", "Sex", "Phone", "Therapy", "Sessions", "Doctor", "Charge", "Discount", "Remarks","Not Attending","Extra Attending", "Total", "Paid", "Balance", "Type", "Method", "Action"].map((head) => (
                  <TableCell key={head} style={{ backgroundColor: "#406147", color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => {
                const patient = item.patient_info || {};
                const attendance = item.attendance_info || {};
                const therapyDetails = attendance.therapy_details || [];
                const consultantDoctor = attendance.consultant_doctor || [];
                const age = patient.age || {};
                const totalAmount = attendance.total_amount ? parseFloat(attendance.total_amount) : 0;
                const totalPaid = attendance.total_amount_paid ? parseFloat(attendance.total_amount_paid) : 0;
                const remainingValue = totalAmount - totalPaid;

                return (
                  <TableRow key={item.billing_no} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell style={{ fontWeight: "500" }}>{item.billing_no}</TableCell>
                    <TableCell>
                      {item.bill_date ? new Date(item.bill_date).toLocaleDateString() : (item.date ? new Date(item.date).toLocaleDateString() : "N/A")}
                    </TableCell>
                    <TableCell>{item.registration_number}</TableCell>
                    <TableCell style={{ fontWeight: "500", color: "#2c3e50" }}>{patient.name_of_child || "N/A"}</TableCell>
                    <TableCell>
                      {age.year || age.months || age.days
                        ? `${age.year}Y ${age.months}M`
                        : "-"}
                    </TableCell>
                    <TableCell>{patient.sex || "-"}</TableCell>
                    <TableCell>{patient.father_phone_number || patient.mother_phone_number || "-"}</TableCell>
                    <TableCell>
                      {Array.isArray(therapyDetails) ? therapyDetails.map((therapy, i) => (
                        <div key={i} style={{ fontSize: "13px", padding: "2px 0" }}>
                          {formatTherapyName(therapy)}
                        </div>
                      )) : (therapyDetails || "-")}
                    </TableCell>
                    <TableCell align="center">{attendance.session || item.number_of_sessions || 0}</TableCell>

                    <TableCell>
                      {Array.isArray(consultantDoctor) ? consultantDoctor.map((doctor, i) => (
                        <div key={i}>{doctor}</div>
                      )) : consultantDoctor}
                    </TableCell>
                    <TableCell align="right" style={{ color: "#7f8c8d" }}>
                      {attendance.therapy_charge || item.therapy_charge || 0}
                    </TableCell>
                    <TableCell align="right" style={{ color: "#e74c3c" }}>
                      {attendance.discount || item.discount || 0}
                    </TableCell>

                    <TableCell>{attendance.discount_remarks || item.discount_remarks || "-"}</TableCell>
                    <TableCell align="right" style={{ color: "#e74c3c" }}>
                      {attendance.not_attending || item.not_attending || 0}
                    </TableCell>                   
                    <TableCell align="right" style={{ color: "#27ae60" }}>
                      {attendance.extra_attending || item.extra_attending || 0}
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold" }}>
                      {attendance.total_amount || item.adjusted_charge || 0}
                    </TableCell>
                    <TableCell align="right" style={{ color: "#27ae60", fontWeight: "bold" }}>
                      {item.amount_paid || 0}
                    </TableCell>
                    <TableCell align="right">
                      {remainingValue > 0 ? (
                        <Chip label={`Due: ${remainingValue}`} color="error" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Paid" color="success" size="small" variant="outlined" />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.payment_type || "N/A"}
                        size="small"
                        style={{ backgroundColor: "#e3f2fd", color: "#1976d2", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.payment_method || "N/A"}
                        size="small"
                        style={{ backgroundColor: "#f3e5f5", color: "#7b1fa2", fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handlePrintRow(item)} style={{ color: "#34495e" }}>
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {/* Grand Total Row */}
            <tfoot style={{ backgroundColor: "#ecf0f1" }}>
              <TableRow>
                <TableCell colSpan={11} align="right" style={{ fontWeight: "bold", fontSize: "16px" }}>Grand Total:</TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.attendance_info?.therapy_charge || item.therapy_charge || 0)), 0).toFixed(2)}
                </TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.attendance_info?.discount || item.discount || 0)), 0).toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.attendance_info?.not_attending || item.not_attending || 0)), 0).toFixed(2)}
                </TableCell>               
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.attendance_info?.extra_attending || item.extra_attending || 0)), 0).toFixed(2)}
                </TableCell>
                
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.attendance_info?.total_amount || item.adjusted_charge || 0)), 0).toFixed(2)}
                </TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>
                  {filteredData.reduce((sum, item) => sum + parseFloat((item.amount_paid || 0)), 0).toFixed(2)}
                </TableCell>
                <TableCell align="right" style={{
                  color: filteredData.reduce((sum, item) => {
                    const att = item.attendance_info || {};
                    const rem = (parseFloat(att.total_amount || 0) - parseFloat(att.total_amount_paid || 0));
                    return sum + (rem > 0 ? rem : 0);
                  }, 0) > 0 ? "#c0392b" : "#27ae60", fontWeight: "bold"
                }}>
                  {filteredData.reduce((sum, item) => {
                    const att = item.attendance_info || {};
                    const rem = (parseFloat(att.total_amount || 0) - parseFloat(att.total_amount_paid || 0));
                    return sum + (rem > 0 ? rem : 0);
                  }, 0).toFixed(2)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </TableContainer>

      )}
    </div>
  );
};

export default TherapyReports;
