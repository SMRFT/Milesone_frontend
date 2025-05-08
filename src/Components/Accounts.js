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
import DownloadIcon from "@mui/icons-material/CloudDownload";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import PrintIcon from "@mui/icons-material/Print";
import * as XLSX from "xlsx";

const Accounts = () => {
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [billingData, setBillingData] = useState([]);
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    if (fromDate && toDate) {
      fetchBillingData();
    }
  }, [fromDate, toDate]);

  const fetchBillingData = async () => {
    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      const therapyResponse = await axios.get(
        `${Milestonebaseurl}therapy-reports/`,
        {
          params: { from_date: formattedFromDate, to_date: formattedToDate },
        }
      );

      const assessmentResponse = await axios.get(
        `${Milestonebaseurl}get_patient_assessments/`,
        {
          params: { from_date: formattedFromDate, to_date: formattedToDate },
        }
      );

      console.log("Therapy Data:", therapyResponse.data);
      console.log("Assessment Data:", assessmentResponse.data);

      const therapyData = therapyResponse.data.map((item) => ({
        billing_no: item.billing_no,
        date: item.date,
        registration_number: item.registration_number,
        name: item.name,
        therapy_charge: Number(item.total_amount || 0),
        consulting_fee: 0,
        assessment_charge: 0,
        discount: Number(item.discount || 0),
        total: Number(item.total_amount || 0) - Number(item.discount || 0),
      }));

      const assessmentData = assessmentResponse.data.data.map((item) => {
        // Sum all consultant and assessment prices
        let totalAssessmentPrice = 0;
        let totalConsultantPrice = 0;

        // Parse assessments if it's a string
        let assessments = [];
        try {
          if (typeof item.assessments === "string") {
            assessments = JSON.parse(item.assessments);
          } else if (Array.isArray(item.assessments)) {
            assessments = item.assessments;
          }
        } catch (error) {
          console.error("Error parsing assessments:", error);
        }

        // Make sure assessments exists before looping
        assessments.forEach((assess) => {
          if (assess.assessmentPrice) {
            totalAssessmentPrice += Number(assess.assessmentPrice);
          }
          if (assess.consultantPrice) {
            totalConsultantPrice += Number(assess.consultantPrice);
          }
        });

        // Parse discount amount - handle all possible formats
        let discountAmount = 0;
        try {
          if (item.discounted_amount?.$numberDecimal) {
            discountAmount = Number(item.discounted_amount.$numberDecimal);
          } else if (typeof item.discounted_amount === "number") {
            discountAmount = item.discounted_amount;
          } else if (typeof item.discounted_amount === "string") {
            discountAmount = Number(item.discounted_amount);
          }
        } catch (error) {
          console.error("Error parsing discount amount:", error);
        }

        return {
          billing_no: item.billing_no,
          date: item.date ? item.date.split("T")[0] : "",
          registration_number: item.registration_number,
          name: item.patient_name,
          consulting_fee: Number(totalConsultantPrice),
          therapy_charge: 0,
          assessment_charge: Number(totalAssessmentPrice),
          discount: Number(discountAmount),
          total:
            Number(totalConsultantPrice) +
            Number(totalAssessmentPrice) -
            Number(discountAmount),
        };
      });

      console.log("Processed Therapy Data:", therapyData);
      console.log("Processed Assessment Data:", assessmentData);

      const mergedData = [...therapyData, ...assessmentData].sort((a, b) => {
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
    }
  };

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(billingData);
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
              h2 { text-align: center; margin-bottom: 20px; }
              th, td { border: 1px solid black; padding: 8px; text-align: center;}
              td { border: 1px solid black; padding: 8px; text-align: right;}
              th { background-color: #f2f2f2; }
              td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9), td:nth-child(10), td:nth-child(11) { 
                  text-align: right;
              }
              td:nth-child(1){ 
                  text-align: center;
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

  // Calculate grand totals
  const grandTotals = {
    consulting_fee: billingData.reduce(
      (sum, row) => sum + Number(row.consulting_fee || 0),
      0
    ),
    assessment_charge: billingData.reduce(
      (sum, row) => sum + Number(row.assessment_charge || 0),
      0
    ),
    therapy_charge: billingData.reduce(
      (sum, row) => sum + Number(row.therapy_charge || 0),
      0
    ),
    other_charge: billingData.reduce(
      (sum, row) => sum + Number(row.other_charge || 0),
      0
    ),
    discount: billingData.reduce(
      (sum, row) => sum + Number(row.discount || 0),
      0
    ),
    total: billingData.reduce((sum, row) => sum + Number(row.total || 0), 0),
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
        {billingData.length > 0 && (
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
                <TableCell align="right">Discount</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.billing_no}</TableCell>
                  <TableCell>
                    {typeof row.date === "string" ? row.date.split(" ")[0] : ""}
                  </TableCell>
                  <TableCell>{row.registration_number}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">
                    {Number(row.consulting_fee || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(row.assessment_charge || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(row.therapy_charge || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(row.discount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(row.total || 0).toFixed(2)}
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
                  {Number(grandTotals.consulting_fee).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {Number(grandTotals.assessment_charge).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {Number(grandTotals.therapy_charge).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {Number(grandTotals.discount).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {Number(grandTotals.total).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {billingData.length === 0 && (
          <p
            style={{ textAlign: "center", marginTop: "20px", fontSize: "16px" }}
          >
            No Data Available
          </p>
        )}
      </TableContainer>
    </div>
  );
};

export default Accounts;
