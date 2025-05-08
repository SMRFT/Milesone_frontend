import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import expand/collapse icons
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
import DownloadIcon from "@mui/icons-material/CloudDownload"; // Import the download icon
import DiscountIcon from "@mui/icons-material/LocalOffer"; // Example icon for filtering
import PrintIcon from "@mui/icons-material/Print"; // Import the print icon
import * as XLSX from "xlsx"; // Import the xlsx library
import "./OPReport.css"; // Import custom CSS file for styling
import mdcLogo from "./Images/mdcLogo.png";
const OPReports = () => {
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];
  const [assessments, setAssessments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(currentDate); // Set initial fromDate to current date
  const [toDate, setToDate] = useState(currentDate); // Set initial toDate to current date
  const [expandedRows, setExpandedRows] = useState({}); // Track which patient row is expanded
  const employeeName = localStorage.getItem("name");
  const [discountFilter, setDiscountFilter] = useState("");
  const [filteredAssessments, setFilteredAssessments] = useState(assessments);
  const [filteredData, setFilteredData] = useState([]);
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    setFromDate(formattedToday);
    setToDate(formattedToday);
    fetchData(formattedToday, formattedToday);
  }, []);

  // Fetch patient assessments data from the API
  const fetchData = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${Milestonebaseurl}get_patient_assessments/?from_date=${fromDate}&to_date=${toDate}`
      );
      const data = await response.json();
      if (data.status === "success") {
        setAssessments(data.data);
        setFilteredAssessments(data.data); // Update filtered data as well
        const totalAssessments = data.data.reduce((acc, assessment) => {
          let assessmentsData;
          try {
            assessmentsData =
              typeof assessment.assessments === "string"
                ? JSON.parse(assessment.assessments)
                : assessment.assessments;
          } catch (e) {
            console.error("Error parsing assessments data:", e);
            assessmentsData = [];
          }
          return acc + assessmentsData.length;
        }, 0);
        setTotalCount(totalAssessments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };
  // Function to toggle the row expansion for a particular patient
  const toggleRowExpansion = (patientIndex) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [patientIndex]: !prevState[patientIndex], // Toggle expansion for the clicked patient
    }));
  };
  const handleExportToExcel = () => {
    let totalPriceSum = 0;
    let discountedAmountSum = 0;
    let finalAmountSum = 0;
    let formattedData = [];
    let patientMap = new Map();

    assessments.forEach((assessment) => {
      let assessmentsData;
      try {
        assessmentsData =
          typeof assessment.assessments === "string"
            ? JSON.parse(assessment.assessments)
            : assessment.assessments;
      } catch (e) {
        console.error("Error parsing assessments data:", e);
        assessmentsData = [];
      }

      // Clean and filter assessments
      assessmentsData = Array.isArray(assessmentsData)
        ? assessmentsData.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              Object.keys(item).length > 0 &&
              item.category
          )
        : [];

      const formattedAge = assessment.age
        ? `${assessment.age.year || 0} years, ${
            assessment.age.months || 0
          } months, ${assessment.age.days || 0} days`
        : "N/A";

      const formattedDate = assessment.date
        ? new Date(assessment.date).toLocaleDateString("en-GB")
        : "N/A";

      const actualPrice = parseFloat(assessment.total_price) || 0;
      const discountAmount = parseFloat(assessment.discounted_amount) || 0;
      const totalAmount = parseFloat(assessment.finalAmount) || 0;

      totalPriceSum += actualPrice;
      discountedAmountSum += discountAmount;
      finalAmountSum += totalAmount;

      const patientKey = `${formattedDate}|${assessment.billing_no}|${assessment.registration_number}|${assessment.patient_name}|${formattedAge}|${assessment.sex}|${assessment.father_phone_number}|${assessment.mother_phone_number}|${actualPrice}|${discountAmount}|${assessment.discount_remarks}|${totalAmount}`;

      if (patientMap.has(patientKey)) {
        let existingEntry = patientMap.get(patientKey);
        assessmentsData.forEach((item) => {
          const addUnique = (arr, val) => {
            if (val && !arr.includes(val)) arr.push(val);
          };

          addUnique(existingEntry.Assessment, item.assessment || "");
          addUnique(
            existingEntry["Assessment Cost (Rs.)"],
            item.assessmentPrice ? `Rs.${item.assessmentPrice}` : ""
          );
          addUnique(existingEntry.Consultant, item.doctor || "N/A");
          addUnique(
            existingEntry["Consultant Cost (Rs.)"],
            item.consultantPrice ? `Rs.${item.consultantPrice}` : "N/A"
          );
          addUnique(existingEntry.Category, item.consultant || "N/A");
        });
      } else {
        patientMap.set(patientKey, {
          Date: formattedDate,
          "Bill No": assessment.billing_no || "N/A",
          "Register Number": assessment.registration_number || "N/A",
          "Patient Name": assessment.patient_name || "N/A",
          Age: formattedAge,
          Sex: assessment.sex || "N/A",
          "Father Phone Number": assessment.father_phone_number || "N/A",
          "Mother Phone Number": assessment.mother_phone_number || "N/A",
          Category: assessmentsData.map((item) => item.consultant || "N/A"),
          Assessment: assessmentsData.map((item) => item.assessment || ""),
          "Assessment Cost (Rs.)": assessmentsData.map((item) =>
            item.assessmentPrice ? `Rs.${item.assessmentPrice}` : ""
          ),
          Consultant: assessmentsData.map((item) => item.doctor || "N/A"),
          "Consultant Cost (Rs.)": assessmentsData.map((item) =>
            item.consultantPrice ? `Rs.${item.consultantPrice}` : "N/A"
          ),
          "Actual Price (Rs.)": actualPrice.toFixed(2),
          "Discount (Rs.)": discountAmount.toFixed(2),
          "Discount Remarks": assessment.discount_remarks || "N/A",
          "Total Price (Rs.)": totalAmount.toFixed(2),
        });
      }
    });

    // Format values for Excel (convert arrays to comma-separated)
    formattedData = Array.from(patientMap.values()).map((entry) => ({
      ...entry,
      Category: entry.Category.join(", "),
      Assessment: entry.Assessment.join(", "),
      "Assessment Cost (Rs.)": entry["Assessment Cost (Rs.)"].join(", "),
      Consultant: entry.Consultant.join(", "),
      "Consultant Cost (Rs.)": entry["Consultant Cost (Rs.)"].join(", "),
    }));

    // Add total row
    formattedData.push({
      Date: "TOTAL",
      "Bill No": "",
      "Register Number": "",
      "Patient Name": "",
      Age: "",
      Sex: "",
      "Father Phone Number": "",
      "Mother Phone Number": "",
      Category: "",
      Assessment: "",
      "Assessment Cost (Rs.)": "",
      Consultant: "",
      "Consultant Cost (Rs.)": "",
      "Actual Price (Rs.)": totalPriceSum.toFixed(2),
      "Discount (Rs.)": discountedAmountSum.toFixed(2),
      "Discount Remarks": "",
      "Total Price (Rs.)": finalAmountSum.toFixed(2),
    });

    // Export to Excel using SheetJS
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PatientAssessments");
    XLSX.writeFile(wb, "PatientAssessments.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
          .amount {
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h2 style="text-align: center;">Patient Assessments</h2>
        <table>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Date</th>
              <th>Bill No</th>
              <th>Registration Number</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Father Phone Number</th>
              <th>Mother Phone Number</th>
              <th>Category</th>
              <th>Assessment</th>
              <th>Assessment Cost</th>
              <th>Consultant</th>
              <th>Consultant Cost</th>
              <th class="amount">Actual Price (Rs.)</th>
              <th class="amount">Discount (Rs.)</th>
              <th>Discount Remarks (Rs.)</th>
              <th class="amount">Total Price (Rs.)</th>
            </tr>
          </thead>
          <tbody>
  `);

    let totalPriceSum = 0;
    let discountedAmountSum = 0;
    let finalAmountSum = 0;

    assessments.forEach((assessment, index) => {
      let assessmentsData;
      try {
        assessmentsData =
          typeof assessment.assessments === "string"
            ? JSON.parse(assessment.assessments)
            : assessment.assessments;
      } catch (e) {
        console.error("Error parsing assessments data:", e);
        assessmentsData = [];
      }

      assessmentsData = Array.isArray(assessmentsData)
        ? assessmentsData.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              Object.keys(item).length > 0 &&
              item.category
          )
        : [];

      console.log("Cleaned assessment data:", assessmentsData);
      const formattedDate = new Date(assessment.date).toLocaleDateString(
        "en-GB"
      );

      // Calculate totals
      totalPriceSum += parseFloat(assessment.total_price) || 0;
      discountedAmountSum += parseFloat(assessment.discounted_amount) || 0;
      finalAmountSum += parseFloat(assessment.finalAmount) || 0;

      printWindow.document.write(`
      <tr>
        <td>${index + 1}</td>
        <td>${formattedDate}</td>
        <td>${assessment.billing_no}</td>
        <td>${assessment.registration_number}</td>
        <td>${assessment.patient_name}</td>
        <td>${
          assessment.age
            ? `${assessment.age.year} years, ${assessment.age.months} months, ${assessment.age.days} days`
            : "N/A"
        }</td>
        <td>${assessment.sex}</td>
        <td>${assessment.father_phone_number}</td>
        <td>${assessment.mother_phone_number}</td>
        <td>${assessmentsData
          .map((item) => `${item.consultant}`)
          .join(", ")}</td>
       <td>${assessmentsData
         .map((item) => item.assessment || "")
         .join(", ")}</td>

          <td>${assessmentsData
            .map((item) =>
              item.assessmentPrice !== undefined
                ? `Rs.${item.assessmentPrice}`
                : ""
            )
            .join(", ")}</td>
          <td>${assessmentsData.map((item) => `${item.doctor}`).join(", ")}</td>
        <td>${assessmentsData
          .map((item) =>
            item.consultantPrice !== undefined
              ? `Rs.${item.consultantPrice}`
              : ""
          )
          .join(", ")}</td>          
        <td class="amount">${assessment.total_price}</td>
        <td class="amount">${assessment.discounted_amount}</td>
        <td>${assessment.discount_remarks}</td>
        <td class="amount">${assessment.finalAmount}</td>
      </tr>
    `);
    });

    // Add total row
    printWindow.document.write(`
    <tr style="font-weight: bold;">
      <td colspan="14" style="text-align: right;">Total:</td>
      <td class="amount">${totalPriceSum.toFixed(2)}</td>
      <td class="amount">${discountedAmountSum.toFixed(2)}</td>
      <td></td>
      <td class="amount">${finalAmountSum.toFixed(2)}</td>
    </tr>
  `);

    printWindow.document.write(`
          </tbody>
        </table>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintRow = (assessment) => {
    const printWindow = window.open("", "", "width=800,height=600");

    let assessmentsData;
    try {
      assessmentsData =
        typeof assessment.assessments === "string"
          ? JSON.parse(assessment.assessments)
          : assessment.assessments || [];
    } catch (e) {
      console.error("Error parsing assessments data:", e);
      assessmentsData = [];
    }

    // Calculate total assessment price and total consultation price
    let totalAssessmentPrice = 0;
    let totalConsultantPrice = 0;

    assessmentsData.forEach((item) => {
      // Add all assessmentPrice values to totalAssessmentPrice
      totalAssessmentPrice += parseFloat(item.assessmentPrice) || 0;

      // Add all consultantPrice values to totalConsultantPrice
      totalConsultantPrice += parseFloat(item.consultantPrice) || 0;
    });

    // Create simplified table with just Assessment and Consultation rows
    const simplifiedTable = `
      <tr>
        <td style="text-align: center;">Assessment</td>
        <td style="text-align: right;"><strong>₹${totalAssessmentPrice}</strong></td>
      </tr>
      <tr>
        <td style="text-align: center;">Consultation</td>
        <td style="text-align: right;"><strong>₹${totalConsultantPrice}</strong></td>
      </tr>
    `;

    // Summary row similar to handlePrintBill
    const summaryRow = `
  <tr>
    <td style="text-align: right;"><strong>Total Price</strong></td>
    <td style="text-align: right;"><strong>₹${
      Math.round(assessment.total_price) || 0
    }</strong></td>
  </tr>
  ${
    Number(assessment.discounted_amount || 0) !== 0
      ? `
      <tr>
        <td style="text-align: right;"><strong>Discount</strong></td>
        <td style="text-align: right;">₹${
          Math.round(assessment.discounted_amount) || 0
        }</td>
      </tr>
      <tr>
        <td style="text-align: right;"><strong>Final Amount</strong></td>
        <td style="text-align: right;"><strong>₹${
          Math.round(assessment.finalAmount) || 0
        }</strong></td>
      </tr>
      `
      : ""
  }
  <tr>
    <td style="text-align: right;"><strong>Payment Method</strong></td>
    <td style="text-align: right;">${assessment.paymentMethod || "N/A"}</td>
  </tr>
`;

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
              <h2>Assessment Receipt</h2>
              <h3>Patient Information</h3>
              <table>
                  <tr><th>Date</th><td>${
                    new Date(assessment.date).toLocaleDateString() || "N/A"
                  }</td></tr>
                  <tr><th>Bill Number</th><td>${
                    assessment.billing_no || "N/A"
                  }</td></tr>
                  <tr><th>Registration Number</th><td>${
                    assessment.registration_number || "N/A"
                  }</td></tr>
                  <tr><th>Name of the Child</th><td>${
                    assessment.patient_name || "N/A"
                  }</td></tr>
                  <tr><th>Age</th><td>${
                    assessment.age
                      ? `${assessment.age.year || 0} years, ${
                          assessment.age.months || 0
                        } months, ${assessment.age.days || 0} days`
                      : "N/A"
                  }</td></tr>
                  <tr><th>Sex</th><td>${
                    assessment.sex || "N/A"
                  }</td></tr>                
              </table>
              <h3>Assessment Details</h3>
              <table>
                  <tr>                 
                      <th style="text-align: center;">Particulars</th>                                                            
                      <th style="text-align: center;">Charge</th>
                  </tr>
                  ${simplifiedTable}
                  ${summaryRow}
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
  // Handle date filter on button click
  const handleDateFilter = () => {
    fetchData(fromDate, toDate);
  };

  // Handle discount filter
  const handleDiscountFilter = () => {
    const filtered = assessments.filter((assessment) =>
      discountFilter
        ? parseFloat(assessment.discounted_amount) >= parseFloat(discountFilter)
        : true
    );
    setFilteredAssessments(filtered);
  };

  // Handle discount input change
  const handleDiscountChange = (e) => {
    setDiscountFilter(e.target.value);
  };

  // Filter data by discount value > 0
  const handleDiscountAppliedFilter = () => {
    const filtered = assessments.filter(
      (assessment) => parseFloat(assessment.discounted_amount) > 0
    );
    setFilteredAssessments(filtered);
  };

  return (
    <div className="container">
      <h2>Patient Assessments Report</h2>
      {/* Date Filter Inputs */}
      <div
        className="filters"
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
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ width: "200px" }}
        />
        <TextField
          label="To Date"
          type="date"
          variant="outlined"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
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

      {/* Total Assessments */}
      <div className="total-count">
        <p>Total Assessments: {totalCount}</p>
      </div>
      {/* Only show Download and Print buttons if there are assessments */}
      {assessments.length > 0 && (
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <button
            onClick={handleExportToExcel}
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
              marginRight: "10px",
            }}
          >
            <DownloadIcon style={{ marginRight: "5px" }} />
          </button>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            <PrintIcon style={{ marginRight: "5px" }} />
          </button>
        </div>
      )}
      {/* Show "No records available" message if there is no data */}
      {assessments.length === 0 ? (
        <div
          className="no-records"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <p>No records available</p>
        </div>
      ) : (
        // Table Display
        <TableContainer className="data-table">
          <Table>
            <TableHead sx={{ "& .MuiTableCell-root": { color: "white" } }}>
              <TableRow>
                <TableCell>Sl.No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Bill No</TableCell>
                <TableCell>Registration No</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Father Phone Number</TableCell>
                <TableCell>Mother Phone Number</TableCell>
                <TableCell>Assessment Details</TableCell>{" "}
                {/* Expand button column */}
                <TableCell>Actual Price (Rs.)</TableCell>
                <TableCell>Discount (Rs.)</TableCell>
                <TableCell>Discount Remarks</TableCell>
                <TableCell>Total Price (Rs.)</TableCell>
                <TableCell>Print</TableCell> {/* Expand button column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssessments.map((assessment, index) => {
                let assessmentsData;
                try {
                  assessmentsData =
                    typeof assessment.assessments === "string"
                      ? JSON.parse(assessment.assessments)
                      : assessment.assessments;
                } catch (e) {
                  console.error("Error parsing assessments data:", e);
                  assessmentsData = [];
                }

                const formattedDate = new Date(
                  assessment.date
                ).toLocaleDateString("en-GB");

                return (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{assessment.billing_no}</TableCell>
                      <TableCell>{assessment.registration_number}</TableCell>
                      <TableCell>{assessment.patient_name}</TableCell>
                      <TableCell>
                        {assessment.age
                          ? `${assessment.age.year} years, ${assessment.age.months} months, ${assessment.age.days} days`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{assessment.sex}</TableCell>
                      <TableCell>{assessment.father_phone_number}</TableCell>
                      <TableCell>{assessment.mother_phone_number}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleRowExpansion(index)}>
                          {expandedRows[index] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>{assessment.total_price}</TableCell>
                      <TableCell>{assessment.discounted_amount}</TableCell>
                      <TableCell>{assessment.discount_remarks}</TableCell>
                      <TableCell>{assessment.finalAmount}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handlePrintRow(assessment)}>
                          <PrintIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {/* Render expanded assessment details */}
                    {expandedRows[index] && (
                      <TableRow>
                        <TableCell colSpan="12">
                          <div className="assessment-details">
                            {assessmentsData.map((item, i) => (
                              <p key={i}>
                                {item.assessment
                                  ? `${item.assessment} (Rs. ${item.assessmentPrice}) - ${item.doctor} (Rs. ${item.consultantPrice})`
                                  : `${item.consultant} - ${item.doctor} (Rs. ${item.consultantPrice})`}
                              </p>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Calculate and display totals */}
              <TableRow
                style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}
              >
                <TableCell colSpan={10} align="right">
                  Total:
                </TableCell>
                <TableCell>
                  {assessments.reduce(
                    (sum, a) => sum + (parseFloat(a.total_price) || 0),
                    0
                  )}
                </TableCell>
                <TableCell>
                  {assessments.reduce(
                    (sum, a) => sum + (parseFloat(a.discounted_amount) || 0),
                    0
                  )}
                </TableCell>
                <TableCell></TableCell>{" "}
                {/* Empty column for discount remarks */}
                <TableCell>
                  {assessments.reduce(
                    (sum, a) => sum + (parseFloat(a.finalAmount) || 0),
                    0
                  )}
                </TableCell>
                <TableCell></TableCell> {/* Empty column for actions */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {loading && <CircularProgress />}
    </div>
  );
};
export default OPReports;
