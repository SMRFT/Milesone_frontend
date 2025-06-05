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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/CloudDownload"; // Import the download icon
import PrintIcon from "@mui/icons-material/Print"; // Import the print icon
import * as XLSX from "xlsx"; // Import the xlsx library

const Accounts = () => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  // console.log(Milestonebaseurl);

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchBillingData();
    }
  }, [fromDate, toDate]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      // Fetch therapy data
      const therapyResponse = await axios.get(
        `${Milestonebaseurl}therapy-reports/`,
        {
          params: { from_date: formattedFromDate, to_date: formattedToDate },
        }
      );

      // Fetch assessment data
      const assessmentResponse = await axios.get(
        `${Milestonebaseurl}get_patient_assessments/`,
        {
          params: { from_date: formattedFromDate, to_date: formattedToDate },
        }
      );

      // Fetch others data
      const othersResponse = await axios.get(
        `${Milestonebaseurl}others-reports/`,
        {
          params: { from_date: formattedFromDate, to_date: formattedToDate },
        }
      );

      console.log("Therapy Data:", therapyResponse.data);
      console.log("Assessment Data:", assessmentResponse.data);
      console.log("Others Data:", othersResponse.data);

      const therapyData = therapyResponse.data.map((item) => ({
        billing_no: item.billing_no,
        date: item.date,
        registration_number: item.registration_number,
        name: item.name,
        consulting_fee: 0, // Default to 0 if not present
        assessment_charge: 0, // Default to 0 if not present
        therapy_charge: safeNumber(item.amount_paid),
        others_charge: 0, // Default to 0 if not present
      }));

      const assessmentData = assessmentResponse.data.data.map((item) => {
        // Sum all consultant and assessment prices
        let totalAssessmentPrice = 0;
        let totalConsultantPrice = 0;

        // Make sure item.assessments exists before looping
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
          others_charge: 0, // Default to 0 if not present
          total: totalConsultantPrice + totalAssessmentPrice,
        };
      });

      const othersData = othersResponse.data.map((item) => ({
        billing_no: item.billing_no,
        date: item.date,
        registration_number: item.registration_number,
        name: item.name,
        consulting_fee: 0, // Default to 0 if not present
        assessment_charge: 0, // Default to 0 if not present
        therapy_charge: 0, // Default to 0 if not present
        others_charge: safeNumber(item.amount_paid),
      }));

      console.log("Processed Therapy Data:", therapyData);
      console.log("Processed Assessment Data:", assessmentData);
      console.log("Processed Others Data:", othersData);

      const mergedData = [...therapyData, ...assessmentData, ...othersData]
        .map((item) => ({
          ...item,
          total:
            safeNumber(item.consulting_fee) +
            safeNumber(item.therapy_charge) +
            safeNumber(item.assessment_charge) +
            safeNumber(item.others_charge),
        }))
        .sort((a, b) => {
          const extractNumber = (billingNo) => {
            const match = billingNo.match(/\d+$/); // Extracts the numeric part at the end
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
    // Prepare data with proper column order matching the table
    const excelData = billingData.map((row, index) => ({
      "Sl.No": index + 1,
      "Billing No": row.billing_no,
      Date: row.date.split(" ")[0],
      "Registration Number": row.registration_number,
      Name: row.name,
      "Consulting Fee": safeNumber(row.consulting_fee).toFixed(2),
      "Assessment Charge": safeNumber(row.assessment_charge).toFixed(2),
      "Therapy Charge": safeNumber(row.therapy_charge).toFixed(2),
      "Others Charge": safeNumber(row.others_charge).toFixed(2),
      Total: safeNumber(row.total).toFixed(2),
    }));

    // Add grand total row
    const grandTotalRow = {
      "Sl.No": "",
      "Billing No": "",
      Date: "",
      "Registration Number": "",
      Name: "Grand Total:",
      "Consulting Fee": billingData
        .reduce((sum, row) => sum + safeNumber(row.consulting_fee), 0)
        .toFixed(2),
      "Assessment Charge": billingData
        .reduce((sum, row) => sum + safeNumber(row.assessment_charge), 0)
        .toFixed(2),
      "Therapy Charge": billingData
        .reduce((sum, row) => sum + safeNumber(row.therapy_charge), 0)
        .toFixed(2),
      "Others Charge": billingData
        .reduce((sum, row) => sum + safeNumber(row.others_charge), 0)
        .toFixed(2),
      Total: billingData
        .reduce((sum, row) => sum + safeNumber(row.total), 0)
        .toFixed(2),
    };

    excelData.push(grandTotalRow);

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MDC Accounts Summary");
    XLSX.writeFile(wb, "Accounts_Summary.xlsx");
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
              h2 { text-align: center; margin-bottom: 20px; } /* Centers Accounts Summary */
              th, td { border: 1px solid black; padding: 8px; text-align: center;}
              td { border: 1px solid black; padding: 8px; text-align: right;}
              th { background-color: #f2f2f2; }
               td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9), td:nth-child(10) { 
                  text-align: right;  /* Align Consulting Fee, Assessment Charge, Therapy Charge, Others Charge, and Total */
              }
             td:nth-child(1){ 
                  text-align: center;  /* Align Serial Number */
              }
          </style>
      </head>
      <body>
          <h2>Accounts Summary</h2>
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

  return (
    <div>
      <h2>Accounts Summary</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label>From Date:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
          />
        </div>
        <div>
          <label>To Date:</label>
          <DatePicker selected={toDate} onChange={(date) => setToDate(date)} />
        </div>
      </div>
      {/* Only show Download and Print buttons if there are assessments */}
      {billingData.length > 0 && (
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

      <TableContainer>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              fontSize: "18px",
              color: "#666",
            }}
          >
            Loading...
          </div>
        ) : billingData.length > 0 ? (
          <Table id="billing-table">
            <TableHead sx={{ "& .MuiTableCell-root": { color: "white" } }}>
              <TableRow>
                <TableCell>Sl.No</TableCell>
                <TableCell>Billing No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Consulting Fee</TableCell>
                <TableCell align="right">Assessment Charge</TableCell>
                <TableCell align="right">Therapy Charge</TableCell>
                <TableCell align="right">Others Charge</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingData.map((row, index) => (
                <TableRow key={index}>
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
                    {safeNumber(row.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Grand Total Row */}
              <TableRow
                style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}
              >
                <TableCell colSpan={5} align="right">
                  Grand Total:
                </TableCell>
                <TableCell align="right">
                  {billingData
                    .reduce(
                      (sum, row) => sum + safeNumber(row.consulting_fee),
                      0
                    )
                    .toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {billingData
                    .reduce(
                      (sum, row) => sum + safeNumber(row.assessment_charge),
                      0
                    )
                    .toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {billingData
                    .reduce(
                      (sum, row) => sum + safeNumber(row.therapy_charge),
                      0
                    )
                    .toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {billingData
                    .reduce(
                      (sum, row) => sum + safeNumber(row.others_charge),
                      0
                    )
                    .toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {billingData
                    .reduce((sum, row) => sum + safeNumber(row.total), 0)
                    .toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          !loading && (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "16px",
              }}
            >
              No Data Available
            </p>
          )
        )}
      </TableContainer>
    </div>
  );
};

export default Accounts;
