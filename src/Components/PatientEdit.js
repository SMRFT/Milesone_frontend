import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Box,
  Avatar,
  Divider,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/CloudDownload";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import * as XLSX from "xlsx";
import mdcLogo from "./Images/mdcLogo.png";
import apiRequest from "./apiRequest";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CakeIcon from "@mui/icons-material/Cake";
import HomeIcon from "@mui/icons-material/Home";

const PatientEdit = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [searchTerm, setSearchTerm] = useState("");
  const employeeName = localStorage.getItem("name");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // Updated useEffect - fetch all data and set current date
  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setFromDate(currentDate);
    setToDate(currentDate);
    fetchData(currentDate);
  }, []);

  // Simplified fetchData function - with optional date filtering
  const fetchData = async (filterDate = null) => {
    setLoading(true);
    const url = `${Milestonebaseurl}all-patient/`;

    try {
      const result = await apiRequest(url, "GET");
      if (result.success) {
        setData(result.data);

        // If filterDate is provided, filter for that date initially
        if (filterDate) {
          const filtered = result.data.filter((item) => {
            if (!item.date) return false;
            return item.date === filterDate;
          });
          setFilteredData(filtered);
        } else {
          setFilteredData(result.data);
        }
      } else {
        console.error(
          "Error fetching patient registration data:",
          result.error
        );
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return { year: 0, months: 0, days: 0 };

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastDayOfPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += lastDayOfPrevMonth;
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    return { year: years, months: months, days: days };
  };

  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      name_of_child: item.name_of_child || "",
      dob: item.dob ? new Date(item.dob).toISOString().split("T")[0] : "",
      sex: item.sex || "",
      mother_name: item.mother_name || "",
      father_name: item.father_name || "",
      guardian_name: item.guardian_name || "",
      mother_phone_number: item.mother_phone_number || "",
      father_phone_number: item.father_phone_number || "",
      address: item.address || "",
      mail_id: item.mail_id || "",
    });
    setEditModalOpen(true);
  };

  // Add this function to handle form field changes
  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate age when DOB changes
      if (field === "dob" && value) {
        const calculatedAge = calculateAge(value);
        updated.age = JSON.stringify(calculatedAge);
      }

      return updated;
    });
  };

  // Add this function to handle the update API call
  const handleUpdatePatient = async () => {
    if (!currentEditItem || !editFormData.name_of_child.trim()) {
      setSnackbar({
        open: true,
        message: "Patient name is required",
        severity: "error",
      });
      return;
    }

    setUpdateLoading(true);

    try {
      // Prepare the data for update - REMOVED manual audit fields
      const updateData = {
        ...editFormData,
      };

      // Calculate age if DOB is provided
      if (updateData.dob) {
        const calculatedAge = calculateAge(updateData.dob);
        updateData.age = JSON.stringify(calculatedAge);
      }

      // Use registration_number instead of ID
      const encodedRegistrationNumber = encodeURIComponent(
        currentEditItem.registration_number
      );
      const url = `${Milestonebaseurl}update-patient/${encodedRegistrationNumber}/`;

      const result = await apiRequest(url, "PATCH", updateData);

      if (result.success) {
        // Update the local data with the response from backend
        // Use registration_number to identify the item to update
        const updatedData = data.map((item) =>
          item.registration_number === currentEditItem.registration_number
            ? { ...item, ...result.data } // Use backend response data
            : item
        );

        setData(updatedData);

        // Update filtered data as well
        const updatedFilteredData = filteredData.map((item) =>
          item.registration_number === currentEditItem.registration_number
            ? { ...item, ...result.data } // Use backend response data
            : item
        );

        setFilteredData(updatedFilteredData);

        setSnackbar({
          open: true,
          message: "Patient information updated successfully!",
          severity: "success",
        });

        setEditModalOpen(false);
        setCurrentEditItem(null);
        setEditFormData({});
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Failed to update patient information",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      setSnackbar({
        open: true,
        message: "Network error occurred while updating",
        severity: "error",
      });
    } finally {
      setUpdateLoading(false);
    }
  };
  // Updated handleDateFilter function - client-side filtering
  const handleDateFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be later than to date");
      return;
    }

    console.log("Filtering with dates:", { fromDate, toDate });

    const filtered = data.filter((item) => {
      if (!item.date) return false;

      const itemDate = new Date(item.date);
      const from = new Date(fromDate);
      const to = new Date(toDate);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      itemDate.setHours(12, 0, 0, 0);

      return itemDate >= from && itemDate <= to;
    });

    console.log("Filtered results:", filtered.length);
    setFilteredData(filtered);
    setIsDateFilterActive(true); // Mark date filter as active
    setSearchTerm(""); // Clear search term when applying date filter
  };

  const handleShowAllData = () => {
    setFilteredData(data);
    setIsDateFilterActive(false); // Mark date filter as inactive
    setSearchTerm(""); // Clear search term
    // setFromDate('');
    // setToDate('');
  };
  // Updated handleSearch to work with current filtered data
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);

    // Get the base data to search from
    let baseData =
      isDateFilterActive && fromDate && toDate
        ? filteredData // Use current filtered data if date filter is active
        : data; // Use all data if no date filter is active

    // Apply search filter
    if (!searchValue.trim()) {
      // If date filter is active, keep the date-filtered data
      // If not active, show all data
      if (isDateFilterActive && fromDate && toDate) {
        // Keep current filtered data (which is date-filtered)
        return;
      } else {
        setFilteredData(data);
        return;
      }
    }

    const filtered = baseData.filter((item) => {
      const searchLower = searchValue.toLowerCase();
      return (
        item.registration_number?.toLowerCase().includes(searchLower) ||
        item.name_of_child?.toLowerCase().includes(searchLower) ||
        item.mother_phone_number?.toLowerCase().includes(searchLower) ||
        item.father_phone_number?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredData(filtered);
  };
  // Format age from JSON string
  const formatAge = (ageData) => {
    try {
      const age = typeof ageData === "string" ? JSON.parse(ageData) : ageData;
      return `${age.year || 0}y ${age.months || 0}m ${age.days || 0}d`;
    } catch (error) {
      return "N/A";
    }
  };

  // Format reason for visit
  const formatReasonForVisit = (reasonData) => {
    try {
      const reasons =
        typeof reasonData === "string" ? JSON.parse(reasonData) : reasonData;
      return Array.isArray(reasons) ? reasons.join(", ") : reasons;
    } catch (error) {
      return reasonData || "N/A";
    }
  };

  // Format source of referral
  const formatSourceOfReferral = (sourceData) => {
    try {
      const source =
        typeof sourceData === "string" ? JSON.parse(sourceData) : sourceData;
      if (typeof source === "object") {
        const entries = Object.entries(source)
          .filter(([key, value]) => value && value !== false && value !== "")
          .map(([key, value]) => {
            if (key === "ThroughDoctorwithName") return value;
            if (key === "ThroughMediaAdd" && value)
              return "Media Advertisement";
            if (key === "ThroughFriendsNeighbours" && value)
              return "Friends/Neighbours";
            if (key === "Others") return value;
            return "";
          })
          .filter((entry) => entry !== "");
        return entries.join(", ") || "N/A";
      }
      return source || "N/A";
    } catch (error) {
      return sourceData || "N/A";
    }
  };

  // Handle download (same as original)
  const handleDownload = () => {
    const formattedData = filteredData.map((item, index) => ({
      "Sl. No": index + 1,
      "Registration Number": item.registration_number,
      Date: new Date(item.date).toLocaleDateString(),
      "Name of Child": item.name_of_child,
      DOB: item.dob ? new Date(item.dob).toLocaleDateString() : "N/A",
      Age: formatAge(item.age),
      Sex: item.sex,
      "Mother Name": item.mother_name,
      "Father Name": item.father_name,
      "Guardian Name": item.guardian_name,
      Address: item.address,
      Email: item.mail_id,
      "Mother Phone": item.mother_phone_number,
      "Father Phone": item.father_phone_number,
      "Reason for Visit": formatReasonForVisit(item.reason_for_visit),
      "Duration of Symptoms": item.duration_of_symptoms,
      "Previous Treatment": item.previous_treatment_done,
      "Source of Referral": formatSourceOfReferral(item.source_of_referral),
      "Created By": item.created_by,
      "Created Date": item.created_date
        ? new Date(item.created_date).toLocaleDateString()
        : "N/A",
      "Modified By": item.lastmodified_by,
      "Modified Date": item.lastmodified_date
        ? new Date(item.lastmodified_date).toLocaleDateString()
        : "N/A",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, "Patient Registration Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "patient_registration_data.xlsx";
    link.click();
  };

  // Handle print (same as original)
  const handlePrint = () => {
    const tableHTML = `
      <html>
        <head>
          <title>MDC Patient Registration Report</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            th, td {
              padding: 6px;
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
          <h2>Patient Registration Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Registration Number</th>
                <th>Date</th>
                <th>Name of Child</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mother Name</th>
                <th>Father Name</th>
                <th>Address</th>
                <th>Mother Phone</th>
                <th>Father Phone</th>
                <th>Reason for Visit</th>
                <th>Duration of Symptoms</th>
                <th>Previous Treatment</th>
                <th>Source of Referral</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.registration_number}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.name_of_child}</td>
                    <td>${
                      item.dob ? new Date(item.dob).toLocaleDateString() : "N/A"
                    }</td>
                    <td>${formatAge(item.age)}</td>
                    <td>${item.sex}</td>
                    <td>${item.mother_name}</td>
                    <td>${item.father_name}</td>
                    <td>${item.address}</td>
                    <td>${item.mother_phone_number}</td>
                    <td>${item.father_phone_number}</td>
                    <td>${formatReasonForVisit(item.reason_for_visit)}</td>
                    <td>${item.duration_of_symptoms || "N/A"}</td>
                    <td>${item.previous_treatment_done || "N/A"}</td>
                    <td>${formatSourceOfReferral(item.source_of_referral)}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "height=800,width=1200");
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle individual row print (same as original)
  const handlePrintRow = (item) => {
    const printWindow = window.open("", "", "width=800,height=600");
    const rowHTML = `
      <html>
        <head>
          <title>Milestone Development Center - Patient Details</title>
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
              margin-bottom: 20px;
              border-bottom: 2px solid #2196F3;
              padding-bottom: 10px;
            }
            .logo {
              width: 100px;
              height: 40px;
            }
            .header-title {
              font-size: 18px;
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
              line-height: 1.2;
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
              font-size: 16px;
              text-align: center;
              margin-top: 0;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table th, table td {
              padding: 8px;
              font-size: 12px;
              line-height: 1.2;
              text-align: left;
              border: 1px solid #ddd;
              color: black;
            }
            table th {
              background-color: #F2F2F2;
              color: black;
              font-weight: bold;
            }
            .footer {
              position: fixed;
              bottom: 20px;
              right: 20px;
              text-align: center;
              font-size: 10px;
              color: black;
              width: 200px;
            }
            .signature-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .employee-name {
              font-size: 10px;
              font-weight: normal;
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
            <h2>Patient Registration Details</h2>
            <table>
              <tr><th>Registration Number</th><td>${
                item.registration_number || "N/A"
              }</td></tr>
              <tr><th>Registration Date</th><td>${new Date(
                item.date
              ).toLocaleDateString()}</td></tr>
              <tr><th>Name of Child</th><td>${
                item.name_of_child || "N/A"
              }</td></tr>
              <tr><th>Date of Birth</th><td>${
                item.dob ? new Date(item.dob).toLocaleDateString() : "N/A"
              }</td></tr>
              <tr><th>Age</th><td>${formatAge(item.age)}</td></tr>
              <tr><th>Sex</th><td>${item.sex || "N/A"}</td></tr>
              <tr><th>Mother Name</th><td>${item.mother_name || "N/A"}</td></tr>
              <tr><th>Father Name</th><td>${item.father_name || "N/A"}</td></tr>
              <tr><th>Guardian Name</th><td>${
                item.guardian_name || "N/A"
              }</td></tr>
              <tr><th>Address</th><td>${item.address || "N/A"}</td></tr>
              <tr><th>Email</th><td>${item.mail_id || "N/A"}</td></tr>
              <tr><th>Mother Phone</th><td>${
                item.mother_phone_number || "N/A"
              }</td></tr>
              <tr><th>Father Phone</th><td>${
                item.father_phone_number || "N/A"
              }</td></tr>
              <tr><th>Reason for Visit</th><td>${formatReasonForVisit(
                item.reason_for_visit
              )}</td></tr>
              <tr><th>Duration of Symptoms</th><td>${
                item.duration_of_symptoms || "N/A"
              }</td></tr>
              <tr><th>Previous Treatment</th><td>${
                item.previous_treatment_done || "N/A"
              }</td></tr>
              <tr><th>Source of Referral</th><td>${formatSourceOfReferral(
                item.source_of_referral
              )}</td></tr>
              <tr><th>Created By</th><td>${item.created_by || "N/A"}</td></tr>
              <tr><th>Created Date</th><td>${
                item.created_date
                  ? new Date(item.created_date).toLocaleDateString()
                  : "N/A"
              }</td></tr>
              <tr><th>Modified By</th><td>${
                item.lastmodified_by || "N/A"
              }</td></tr>
              <tr><th>Modified Date</th><td>${
                item.lastmodified_date
                  ? new Date(item.lastmodified_date).toLocaleDateString()
                  : "N/A"
              }</td></tr>
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

  const getSexColor = (sex) => {
    return sex === "Male"
      ? "#2196F3"
      : sex === "Female"
      ? "#E91E63"
      : "#757575";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #a1c181 0%, #73865cff 100%)",
        padding: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            color: "white",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            mb: 1,
          }}
        >
          Patient Registration Reports
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: "300",
          }}
        >
          Modern Patient Management System
        </Typography>
      </Box>
      {/* Filters Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextField
              label="Search Patients"
              placeholder="Search by Reg No, Name, or Phone"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#406147" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 380,
                height: 56, // Fixed height
                "& .MuiOutlinedInput-root": {
                  height: 56, // Fixed height for input
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#406147" },
                  "&.Mui-focused fieldset": { borderColor: "#406147" },
                },
              }}
            />
            <TextField
              label="From Date"
              type="date"
              variant="outlined"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 160,
                height: 56, // Fixed height
                "& .MuiOutlinedInput-root": {
                  height: 56, // Fixed height for input
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#406147" },
                  "&.Mui-focused fieldset": { borderColor: "#406147" },
                },
              }}
            />
            <TextField
              label="To Date"
              type="date"
              variant="outlined"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 160,
                height: 56, // Fixed height
                "& .MuiOutlinedInput-root": {
                  height: 56, // Fixed height for input
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#406147" },
                  "&.Mui-focused fieldset": { borderColor: "#406147" },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleDateFilter}
              startIcon={<CalendarTodayIcon />}
              sx={{
                background: "linear-gradient(45deg, #406147, #5a7c65)",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                "&:hover": {
                  background: "linear-gradient(45deg, #5a7c65, #406147)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(64,97,71,0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Filter by Date
            </Button>

            <Button
              variant="outlined"
              onClick={handleShowAllData}
              startIcon={<SearchIcon />}
              sx={{
                borderColor: "#406147",
                color: "#406147",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                "&:hover": {
                  borderColor: "#5a7c65",
                  backgroundColor: "rgba(64,97,71,0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Show All Data
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Export Actions */}
      {filteredData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <Tooltip title="Download Excel" arrow>
            <IconButton
              onClick={handleDownload}
              sx={{
                background: "linear-gradient(45deg, #4CAF50, #66BB6A)",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: 3,
                "&:hover": {
                  background: "linear-gradient(45deg, #66BB6A, #4CAF50)",
                  transform: "scale(1.1)",
                  boxShadow: "0 6px 20px rgba(76,175,80,0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <DownloadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print All Records" arrow>
            <IconButton
              onClick={handlePrint}
              sx={{
                background: "linear-gradient(45deg, #FF9800, #FFB74D)",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: 3,
                "&:hover": {
                  background: "linear-gradient(45deg, #FFB74D, #FF9800)",
                  transform: "scale(1.1)",
                  boxShadow: "0 6px 20px rgba(255,152,0,0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <PrintIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {/* Results Summary */}
      {!loading && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Chip
            label={`${filteredData.length} Patient${
              filteredData.length !== 1 ? "s" : ""
            } Found`}
            sx={{
              background: "rgba(255,255,255,0.9)",
              color: "#406147",
              fontWeight: "bold",
              fontSize: "1rem",
              px: 2,
              py: 1,
            }}
          />
        </Box>
      )}
      {/* Loading Indicator */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: "white" }} />
        </Box>
      ) : filteredData.length === 0 ? (
        <Card
          sx={{
            textAlign: "center",
            p: 6,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <MedicalServicesIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h5" color="textSecondary">
            No patients found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or date range
          </Typography>
        </Card>
      ) : (
        /* Patient Cards Grid */
        <Grid container spacing={3}>
          {filteredData.map((item, index) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id || index}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header with Avatar and Registration */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getSexColor(item.sex),
                          width: 50,
                          height: 50,
                          mr: 2,
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: "#2c3e50",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.name_of_child || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.registration_number}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.sex || "N/A"}
                        size="small"
                        sx={{
                          bgcolor: getSexColor(item.sex),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Patient Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <CalendarTodayIcon
                          sx={{ fontSize: 16, mr: 1, color: "#7f8c8d" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Age: <strong>{formatAge(item.age)}</strong>
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <AccessTimeIcon
                          sx={{ fontSize: 16, mr: 1, color: "#7f8c8d" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Registered:{" "}
                          <strong>
                            {new Date(item.date).toLocaleDateString()}
                          </strong>
                        </Typography>
                      </Box>

                      {item.dob && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <CalendarTodayIcon
                            sx={{ fontSize: 16, mr: 1, color: "#7f8c8d" }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            DOB:{" "}
                            <strong>
                              {new Date(item.dob).toLocaleDateString()}
                            </strong>
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Family Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <FamilyRestroomIcon
                          sx={{ fontSize: 16, mr: 1, color: "#e74c3c" }}
                        />
                        <Typography variant="body2">
                          <strong>Mother:</strong> {item.mother_name || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <FamilyRestroomIcon
                          sx={{ fontSize: 16, mr: 1, color: "#3498db" }}
                        />
                        <Typography variant="body2">
                          <strong>Father:</strong> {item.father_name || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ mb: 2 }}>
                      {item.mother_phone_number && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <PhoneIcon
                            sx={{ fontSize: 14, mr: 1, color: "#e74c3c" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            M: {item.mother_phone_number}
                          </Typography>
                        </Box>
                      )}
                      {item.father_phone_number && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <PhoneIcon
                            sx={{ fontSize: 14, mr: 1, color: "#3498db" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            F: {item.father_phone_number}
                          </Typography>
                        </Box>
                      )}
                      {item.mail_id && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <EmailIcon
                            sx={{ fontSize: 14, mr: 1, color: "#9b59b6" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {item.mail_id}
                          </Typography>
                        </Box>
                      )}
                      {item.address && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <LocationOnIcon
                            sx={{
                              fontSize: 14,
                              mr: 1,
                              color: "#f39c12",
                              mt: 0.2,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.85rem",
                              lineHeight: 1.3,
                              maxWidth: "200px",
                            }}
                          >
                            {item.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Medical Info */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <MedicalServicesIcon
                          sx={{
                            fontSize: 16,
                            mr: 1,
                            color: "#27ae60",
                            mt: 0.1,
                          }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", mb: 0.5 }}
                          >
                            Reason for Visit:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.85rem",
                              color: "#555",
                              lineHeight: 1.3,
                            }}
                          >
                            {formatReasonForVisit(item.reason_for_visit)}
                          </Typography>
                        </Box>
                      </Box>

                      {item.duration_of_symptoms && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 14, mr: 1, color: "#f39c12" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            Duration:{" "}
                            <strong>{item.duration_of_symptoms}</strong>
                          </Typography>
                        </Box>
                      )}

                      {item.previous_treatment_done && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.85rem",
                            color: "#7f8c8d",
                            fontStyle: "italic",
                            mt: 1,
                          }}
                        >
                          Previous Treatment: {item.previous_treatment_done}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Tooltip title="Edit Patient" arrow>
                          <IconButton
                            onClick={() => handleEdit(item)}
                            sx={{
                              color: "#3498db",
                              "&:hover": {
                                backgroundColor: "rgba(52, 152, 219, 0.1)",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Details" arrow>
                          <IconButton
                            onClick={() => handlePrintRow(item)}
                            sx={{
                              color: "#e67e22",
                              "&:hover": {
                                backgroundColor: "rgba(230, 126, 34, 0.1)",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: "block" }}
                        >
                          Created by:{" "}
                          <strong>{item.created_by || "N/A"}</strong>
                        </Typography>
                        {item.created_date && (
                          <Typography variant="caption" color="textSecondary">
                            {new Date(item.created_date).toLocaleDateString()}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: "block" }}
                        >
                          Modified by:{" "}
                          <strong>{item.lastmodified_by || "N/A"}</strong>
                        </Typography>
                        {item.lastmodified_date && (
                          <Typography variant="caption" color="textSecondary">
                            {new Date(
                              item.lastmodified_date
                            ).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Source of Referral Chip */}
                    {formatSourceOfReferral(item.source_of_referral) !==
                      "N/A" && (
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`Ref: ${formatSourceOfReferral(
                            item.source_of_referral
                          )}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.75rem",
                            borderColor: "#95a5a6",
                            color: "#7f8c8d",
                            maxWidth: "100%",
                            "& .MuiChip-label": {
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            },
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow:
              "0 24px 56px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
            background: "linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)",
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        {/* Modern Header with Icon */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #a1c181 0%, #73865cff 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: "1.5rem",
            py: 3,
            px: 4,
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <EditIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ zIndex: 1 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Edit Patient Information
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.9, fontSize: "0.9rem" }}
            >
              Update patient details and medical information
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, background: "#f8fafc" }}>
          {/* Patient Info Section */}
          <Box
            sx={{
              p: 4,
              background: "white",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: "#334155",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon sx={{ color: "#a1c181" }} />
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Child's Full Name"
                  variant="outlined"
                  value={editFormData.name_of_child || ""}
                  onChange={(e) =>
                    handleEditFormChange("name_of_child", e.target.value)
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  variant="outlined"
                  value={editFormData.dob || ""}
                  onChange={(e) => handleEditFormChange("dob", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ "&.Mui-focused": { color: "#a1c181" } }}>
                    Gender
                  </InputLabel>
                  <Select
                    value={editFormData.sex || ""}
                    onChange={(e) =>
                      handleEditFormChange("sex", e.target.value)
                    }
                    label="Gender"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="Male">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#a1c181",
                          }}
                        />
                        Male
                      </Box>
                    </MenuItem>
                    <MenuItem value="Female">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#73865cff",
                          }}
                        />
                        Female
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, rgba(161, 193, 129, 0.15) 0%, rgba(115, 134, 92, 0.15) 100%)",
                    border: "2px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <CakeIcon sx={{ color: "#a1c181", fontSize: 28 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Current Age
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#334155", fontWeight: 600 }}
                    >
                      {editFormData.dob
                        ? (() => {
                            const age = calculateAge(editFormData.dob);
                            return `${age.year}y ${age.months}m ${age.days}d`;
                          })()
                        : "Select DOB to calculate"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Contact Information Section */}
          <Box
            sx={{
              p: 4,
              background: "white",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: "#334155",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FamilyRestroomIcon sx={{ color: "#a1c181" }} />
              Family & Contact Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Mother's Name"
                  variant="outlined"
                  value={editFormData.mother_name || ""}
                  onChange={(e) =>
                    handleEditFormChange("mother_name", e.target.value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  variant="outlined"
                  value={editFormData.father_name || ""}
                  onChange={(e) =>
                    handleEditFormChange("father_name", e.target.value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Guardian's Name"
                  variant="outlined"
                  value={editFormData.guardian_name || ""}
                  onChange={(e) =>
                    handleEditFormChange("guardian_name", e.target.value)
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mother's Phone Number"
                  variant="outlined"
                  value={editFormData.mother_phone_number || ""}
                  onChange={(e) =>
                    handleEditFormChange("mother_phone_number", e.target.value)
                  }
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: "#a1c181" }}>
                        <PhoneIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Phone Number"
                  variant="outlined"
                  value={editFormData.father_phone_number || ""}
                  onChange={(e) =>
                    handleEditFormChange("father_phone_number", e.target.value)
                  }
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: "#a1c181" }}>
                        <PhoneIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  value={editFormData.mail_id || ""}
                  onChange={(e) =>
                    handleEditFormChange("mail_id", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: "#a1c181" }}>
                        <EmailIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Home Address"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={editFormData.address || ""}
                  onChange={(e) =>
                    handleEditFormChange("address", e.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          mr: 1,
                          color: "#a1c181",
                          alignSelf: "flex-start",
                          mt: 1,
                        }}
                      >
                        <HomeIcon fontSize="small" />
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: "white",
                        "& fieldset": {
                          borderColor: "#a1c181",
                          borderWidth: 2,
                        },
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#a1c181" },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {/* Modern Action Buttons */}
        <DialogActions
          sx={{
            p: 4,
            gap: 2,
            background: "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={() => setEditModalOpen(false)}
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              borderColor: "#e2e8f0",
              color: "#64748b",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Cancel Changes
          </Button>

          <Button
            onClick={handleUpdatePatient}
            disabled={updateLoading}
            startIcon={
              updateLoading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                <SaveIcon />
              )
            }
            variant="contained"
            size="large"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #a1c181 0%, #73865cff 100%)",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(161, 193, 129, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #92b372 0%, #68784f 100%)",
                boxShadow: "0 6px 20px rgba(161, 193, 129, 0.6)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                background: "#94a3b8",
                color: "white",
                boxShadow: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            {updateLoading
              ? "Updating Patient..."
              : "Update Patient Information"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientEdit;
