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
import apiRequest from "./apiRequest";

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

    // Build URL with query parameters
    const url = `${Milestonebaseurl}get_patient_assessments/?from_date=${fromDate}&to_date=${toDate}`;

    const result = await apiRequest(url, "GET");

    if (result.success) {
      // Check if the response has the expected structure
      if (result.data && result.data.status === "success") {
        setAssessments(result.data.data);
        setFilteredAssessments(result.data.data); // Update filtered data as well

        // Calculate total assessments count
        const totalAssessments = result.data.data.reduce((acc, assessment) => {
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
      } else {
        console.error("Unexpected response structure:", result.data);
      }
    } else {
      console.error("Error fetching patient assessments:", result.error);
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
<!DOCTYPE html>
<html>
<head>
    <title>Assessment Receipt</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        /* Global Reset */
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        
        @page { 
            margin: 10mm;
        }

        body { 
            font-family: 'Poppins', Arial, sans-serif; 
            margin: 0; 
            background-color: #fff; 
            color: #333; 
            font-size: 10pt; 
        }

        .container { 
            width: 100%; 
            max-width: 100%;
            margin: 0 auto; 
        }

        /* Header Layout */
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            border-bottom: 2px solid #406147; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
        }

        .logo { 
            width: 80px; 
            height: auto; 
            object-fit: contain; 
        }

        .contact-details { 
            text-align: right; 
            font-size: 8pt; 
            color: #555; 
            line-height: 1.3; 
        }

        .receipt-title { 
            text-align: center; 
            margin: 10px 0 20px 0; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            color: #406147; 
            font-weight: 700; 
            font-size: 14pt; 
        }

        /* Info Grid - Adaptive */
        .info-grid { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
            margin-bottom: 20px;
        }

        .info-item { 
            flex: 1 1 22%; 
            min-width: 80px;
            display: flex; 
            flex-direction: column; 
        }

        .info-label { 
            color: #888; 
            font-size: 7pt; 
            text-transform: uppercase; 
            font-weight: 600; 
        }

        .info-value { 
            font-weight: 500; 
            font-size: 9pt; 
            color: #222; 
            word-break: break-word;
        }

        /* Table Styling */
        .section-title { 
            font-size: 10pt; 
            font-weight: 600; 
            color: #406147; 
            margin-bottom: 5px; 
            border-bottom: 1px solid #ccc; 
            padding-bottom: 2px; 
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 5px; 
            table-layout: fixed; 
        }

        th, td { 
            padding: 6px 4px; 
            text-align: left; 
            border-bottom: 1px solid #eee; 
            font-size: 9pt;
            vertical-align: top;
        }

        th { 
            background-color: #f8f9fa; 
            font-weight: 600; 
            color: #555; 
            text-transform: uppercase; 
            font-size: 8pt; 
        }

        /* Numeric columns alignment */
        .col-center { text-align: center; }
        .col-right { text-align: right; }
        .text-bold { font-weight: 600; }
        
        /* Footer */
        .footer { 
            margin-top: 40px; 
            text-align: right; 
            font-size: 8pt; 
            color: #555; 
            page-break-inside: avoid;
        }

        .signature-line { 
            border-top: 1px solid #ccc; 
            width: 160px; 
            margin-left: auto; 
            padding-top: 5px; 
            text-align: center; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${mdcLogo}" alt="Logo" class="logo" />
            <div class="contact-details">
                <strong style="font-size: 10pt; color: #333;">Milestone Development Center</strong><br />
                59/37, Saradha College Road,<br />
                Salem-636007, Tamil Nadu<br />
                Ph: +91 90470 33633<br />
                Email: info@milestonescenter.in
            </div>
        </div>
        
        <div class="receipt-title">Assessment Receipt</div>
        
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Date</span>
                <span class="info-value">${
                  assessment.date
                    ? new Date(assessment.date).toLocaleDateString()
                    : "N/A"
                }</span>
            </div>
            <div class="info-item">
                <span class="info-label">Bill Number</span>
                <span class="info-value">${assessment.billing_no || "N/A"}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Reg No</span>
                <span class="info-value">${
                  assessment.registration_number || "N/A"
                }</span>
            </div>
            <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">${
                  assessment.patient_name || "N/A"
                }</span>
            </div>
            <div class="info-item">
                <span class="info-label">Age</span>
                <span class="info-value">${
                  assessment.age
                    ? `${assessment.age.year || 0} Y, ${
                        assessment.age.months || 0
                      } M`
                    : "N/A"
                }</span>
            </div>
            <div class="info-item">
                <span class="info-label">Sex</span>
                <span class="info-value">${assessment.sex || "N/A"}</span>
            </div>
        </div>

        <div class="section-title">Assessment Details</div>
        
        <table>
            <thead>
                <tr>
                    <th>Particulars</th>
                    <th class="col-center">Charge</th>
                </tr>
            </thead>
            <tbody>
                ${simplifiedTable}
                ${summaryRow}
            </tbody>
        </table>

        <div class="footer">
            <div class="signature-line">
                Signature of Employee<br />
                <span style="font-size: 8pt; color: #888; font-weight: normal;">${employeeName}</span>
            </div>
        </div>
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
