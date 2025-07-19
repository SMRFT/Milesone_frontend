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
} from "@mui/material";
import DiscountIcon from "@mui/icons-material/LocalOffer"; // Example icon for filtering
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

  const handleDownload = () => {
    // Format the data before exporting
    const formattedData = filteredData.map((item, index) => {
      const formattedAge =
        item.age?.year || item.age?.months || item.age?.days
          ? `${item.age.year || 0} years, ${item.age.months || 0} months, ${
              item.age.days || 0
            } days`
          : "N/A";

      return {
        "Sl. No": index + 1,
        "Billing No": item.billing_no,
        Date: new Date(item.date).toLocaleDateString(),
        "Registration Number": item.registration_number,
        "Name of Child": item.name,
        Age: formattedAge,
        Sex: item.sex,
        "Father Phone Number": item.father_phone_number,
        "Mother Phone Number": item.mother_phone_number,
        "Name of Therapy":
          typeof item.nameoftherapy === "string"
            ? JSON.parse(item.nameoftherapy).join(", ")
            : item.nameoftherapy.join(", "),
        "Consultant Doctor":
          typeof item.consultant_doctor === "string"
            ? JSON.parse(item.consultant_doctor).join(", ")
            : item.consultant_doctor.join(", "),
        "Therapy Charge (Rs.)": item.therapy_charge,
        "Discount (Rs.)": item.discount,
        "Discount Remarks": item.discount_remarks,
        "Adjusted Charge (Rs.)": item.adjusted_charge,
        "Amount Paid (Rs.)": item.amount_paid,
        "Remaining Amount (Rs.)":
          typeof item.remaining_amount === "object"
            ? `${item.remaining_amount.value} (${item.remaining_amount.status})`
            : item.remaining_amount,
        "Payment Type": item.payment_type,
        "Payment Method": item.payment_method,
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
        (sum, item) => sum + item.therapy_charge,
        0
      ),
      "Discount (Rs.)": filteredData.reduce(
        (sum, item) => sum + item.discount,
        0
      ),
      "Discount Remarks": "",
      "Adjusted Charge (Rs.)": filteredData.reduce(
        (sum, item) => sum + item.adjusted_charge,
        0
      ),
      "Amount Paid (Rs.)": filteredData.reduce(
        (sum, item) => sum + item.amount_paid,
        0
      ),
      "Remaining Amount (Rs.)": filteredData.reduce(
        (sum, item) =>
          sum +
          (typeof item.remaining_amount === "object"
            ? item.remaining_amount.value
            : item.remaining_amount),
        0
      ),
      "Payment Type": "",
      "Payment Method": "",
    };

    // Add the grand total row
    const dataWithTotal = [...formattedData, grandTotal];

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert dataWithTotal to a worksheet
    const ws = XLSX.utils.json_to_sheet(dataWithTotal);

    // Add the sheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Therapy Reports");

    // Write the workbook to a Blob
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Create a Blob from the array
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Create an anchor element to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "therapy_reports.xlsx"; // Set the filename for the download
    link.click(); // Trigger the download
  };

  // Handle Print Click to print static data
  const handlePrint = () => {
    // Calculate grand totals
    const grandTotal = {
      therapy_charge: filteredData.reduce(
        (sum, item) => sum + item.therapy_charge,
        0
      ),
      discount: filteredData.reduce((sum, item) => sum + item.discount, 0),
      adjusted_charge: filteredData.reduce(
        (sum, item) => sum + item.adjusted_charge,
        0
      ),
      amount_paid: filteredData.reduce(
        (sum, item) => sum + item.amount_paid,
        0
      ),
      remaining_amount: filteredData.reduce(
        (sum, item) =>
          sum +
          (typeof item.remaining_amount === "object"
            ? item.remaining_amount.value
            : item.remaining_amount),
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
                  (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.billing_no}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.registration_number}</td>
                    <td>${item.name}</td>
                    <td>${
                      item.age.year || item.age.months || item.age.days
                        ? `${item.age.year} years, ${item.age.months} months, ${item.age.days} days`
                        : "'N/A'"
                    }</td>
                    <td>${item.sex}</td>
                    <td>${item.father_phone_number}</td>
                    <td>${item.mother_phone_number}</td>
                     <td>
                         ${(typeof item.nameoftherapy === "string"
                           ? JSON.parse(item.nameoftherapy)
                           : item.nameoftherapy
                         ).join(", ")}
                   </td>
                    <td style="text-align: center;">${
                      item.number_of_sessions
                    }</td>

                    <td>
                      ${(typeof item.consultant_doctor === "string"
                        ? JSON.parse(item.consultant_doctor)
                        : item.consultant_doctor
                      ).join(", ")}
                   </td>                    
                    <td style="text-align: right;">${item.therapy_charge}</td>
                    <td style="text-align: right;">${item.discount}</td>
                    <td>${item.discount_remarks}</td>
                    <td style="text-align: right;">${item.adjusted_charge}</td>
                    <td style="text-align: right;">${item.amount_paid}</td>
                    <td style="text-align: right;">${
                      typeof item.remaining_amount === "object"
                        ? `${item.remaining_amount.value} (${item.remaining_amount.status})`
                        : item.remaining_amount
                    }</td>
                    <td>${item.payment_type}</td>
                    <td>${item.payment_method}</td>                   
                  </tr>
                `
                )
                .join("")}
              <tr>
                <td colspan="12"><strong>Grand Total</strong></td>
                <td style="text-align: right;">${grandTotal.therapy_charge}</td>
                <td style="text-align: right;">${grandTotal.discount}</td>
                <td colspan="2" style="text-align: right;">${
                  grandTotal.adjusted_charge
                }</td>
                <td style="text-align: right;">${grandTotal.amount_paid}</td>
                <td style="text-align: right;">${
                  grandTotal.remaining_amount
                }</td>d
                <td colspan="4"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the HTML to the print window
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write(tableHTML);

    // Trigger the print dialog
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
    const printWindow = window.open("", "", "width=800,height=600");
    const rowHTML = `
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
              <h2>Therapy Receipt</h2>
              <h3>Patient Information</h3>
              <table>
                  <tr><th>Date</th><td>${
                    new Date(item.date).toLocaleDateString() || "N/A"
                  }</td></tr>
                  <tr><th>Bill Number</th><td>${
                    item.billing_no || "N/A"
                  }</td></tr>
                  <tr><th>Registration Number</th><td>${
                    item.registration_number || "N/A"
                  }</td></tr>
                  <tr><th>Name of the Child</th><td>${
                    item.name || "N/A"
                  }</td></tr>
                  <tr><th>Age</th><td>${item.age.year || 0} years, ${
      item.age.months || 0
    } months, ${item.age.days || 0} days</td></tr>
                  <tr><th>Sex</th><td>${
                    item.sex || "N/A"
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
    Array.isArray(item.nameoftherapy) && item.nameoftherapy.length > 0
      ? `
        ${item.nameoftherapy
          .map(
            (therapy, index) => `
              <tr>
                <td style="text-align: center;">${therapy || "N/A"}</td>
                 ${
                   index === 0
                     ? `<td rowspan="${
                         item.nameoftherapy.length
                       }" style="text-align: center; vertical-align: middle;">
                        ${parseFloat(item.number_of_sessions || "0").toFixed(0)}
                      </td>`
                     : ""
                 }
                ${
                  index === 0
                    ? `<td rowspan="${
                        item.nameoftherapy.length
                      }" style="text-align: right; vertical-align: middle;">
                        <strong>₹${parseFloat(
                          item.therapy_charge || "0"
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
    Number(item.discount || 0) !== 0
      ? `
      <tr>
        <td colspan="2 style="text-align: right;"><strong>Discount</strong></td>
        <td style="text-align: right;">₹${parseFloat(
          item.discount || "0"
        ).toFixed(0)}</td>
      </tr>
      <tr>
        <td colspan="2" style="text-align: right;"><strong>Final Amount</strong></td>
        <td style="text-align: right;"><strong>₹${parseFloat(
          item.adjusted_charge || "0"
        ).toFixed(0)}</strong></td>
      </tr>
      `
      : ""
  }
  <tr>
    <td colspan="2" style="text-align: right;"><strong>Amount Paid</strong></td>
    <td style="text-align: right;"><strong>₹${parseFloat(
      item.amount_paid || "0"
    ).toFixed(0)}</strong></td>
  </tr>
  ${
    Number(
      typeof item.remaining_amount === "object"
        ? item.remaining_amount.value
        : item.remaining_amount || 0
    ) !== 0
      ? `
    <tr>
      <td colspan="2" style="text-align: right;"><strong>Remaining Amount</strong></td>
      <td style="text-align: right;">₹${parseFloat(
        typeof item.remaining_amount === "object"
          ? item.remaining_amount.value
          : item.remaining_amount || "0"
      ).toFixed(0)}</td>
    </tr>
    `
      : ""
  }
                  <tr>
                      <td colspan="2" style="text-align: right;"><strong>Payment Type</strong></td>
                      <td style="text-align: right;">${
                        item.payment_type || "N/A"
                      }</td>
                  </tr>
                  <tr>
                      <td colspan="2" style="text-align: right;"><strong>Payment Method</strong></td>
                      <td style="text-align: right;">${
                        item.payment_method || "N/A"
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
        <TableContainer component={Paper} style={{ marginTop: "30px" }}>
          <Table>
            <TableHead sx={{ "& .MuiTableCell-root": { color: "white" } }}>
              <TableRow>
                <TableCell>
                  <strong>Sl. No</strong>
                </TableCell>
                <TableCell>
                  <strong>Billing No</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Register Number</strong>
                </TableCell>
                <TableCell>
                  <strong>Name of Child</strong>
                </TableCell>
                <TableCell>
                  <strong>Age</strong>
                </TableCell>
                <TableCell>
                  <strong>Sex</strong>
                </TableCell>
                <TableCell>
                  <strong>Phone</strong>
                </TableCell>
                <TableCell>
                  <strong>Name of Therapy</strong>
                </TableCell>
                <TableCell>
                  <strong>Number of sessions</strong>
                </TableCell>
                <TableCell>
                  <strong>Consultant Doctor</strong>
                </TableCell>
                <TableCell>
                  <strong>Therapy Charge (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Discount (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Discount Remarks</strong>
                </TableCell>
                <TableCell>
                  <strong>Adjusted Charge (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Amount Paid (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Remaining Amount (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Payment Type (Rs.)</strong>
                </TableCell>
                <TableCell>
                  <strong>Payment Method (Rs.)</strong>
                </TableCell>

                <TableCell>
                  <strong>Print</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.billing_no}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.billing_no}</TableCell>
                  <TableCell>
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{item.registration_number}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.age
                      ? `${item.age.year} years, ${item.age.months} months, ${item.age.days} days`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{item.sex}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>
                    {(typeof item.nameoftherapy === "string"
                      ? JSON.parse(item.nameoftherapy)
                      : item.nameoftherapy
                    ).map((therapy, i) => (
                      <div key={i}>{therapy}</div>
                    ))}
                  </TableCell>
                  <TableCell>{item.number_of_sessions}</TableCell>

                  <TableCell>
                    {(typeof item.consultant_doctor === "string"
                      ? JSON.parse(item.consultant_doctor)
                      : item.consultant_doctor
                    ).map((doctor, i) => (
                      <div key={i}>{doctor}</div>
                    ))}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.therapy_charge}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.discount}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.discount_remarks}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.adjusted_charge}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.amount_paid}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {typeof item.remaining_amount === "object"
                      ? `${item.remaining_amount.value} (${item.remaining_amount.status})`
                      : item.remaining_amount}
                  </TableCell>

                  <TableCell style={{ textAlign: "right" }}>
                    {item.payment_type}
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {item.payment_method}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handlePrintRow(item)}>
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {/* Grand Total Row */}
            <tfoot>
              <TableRow>
                <TableCell
                  colSpan={11}
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Grand Total:
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold" }}>
                  {calculateGrandTotal().therapy_charge}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold" }}>
                  {calculateGrandTotal().discount}
                </TableCell>
                <TableCell></TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold" }}>
                  {calculateGrandTotal().adjusted_charge}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold" }}>
                  {calculateGrandTotal().amount_paid}
                </TableCell>
                <TableCell style={{ textAlign: "right", fontWeight: "bold" }}>
                  {calculateGrandTotal().remaining_amount}
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
