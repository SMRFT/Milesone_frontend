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
import LocationOnIcon from "@mui/icons-material/LocationOn";
// Fixed icon imports
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessIcon from "@mui/icons-material/Business";
import MapIcon from "@mui/icons-material/Map";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PublicIcon from "@mui/icons-material/Public";
import HomeIcon from "@mui/icons-material/Home";
// Other imports
import * as XLSX from "xlsx";
import mdcLogo from "./Images/mdcLogo.png";
import apiRequest from "./apiRequest";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import { HospitalIcon } from "lucide-react";
import { Email, Person } from "@mui/icons-material";

// Referral Doctor Edit Component
const ReferralDrEdit = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const employeeName = localStorage.getItem("name");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // Updated useEffect - fetch all data and set current date
  useEffect(() => {
    fetchData();
  }, []);

  // Simplified fetchData function - with optional date filtering
  const fetchData = async () => {
    setLoading(true);
    const url = `${Milestonebaseurl}referral-doctor/list/`;

    try {
      const result = await apiRequest(url, "GET");
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data);
      } else {
        console.error("Error fetching Doctor data:", result.error);
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

  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      doctor_name: item.doctor_name || "",
      hospital_name: item.hospital_name || "",
      school: item.school || "",
      area: item.area || "",
      city: item.city || "",
      district: item.district || "",
      phone_number: item.phone_number || "",
      sex: item.sex || "",
      referral_id: item.referral_id || "",
      email: item.email || "",
    });
    setEditModalOpen(true);
  };

  // Add this function to handle form field changes
  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  // Add this function to handle the update API call
  const handleUpdatePatient = async (item) => {
    if (!currentEditItem || !editFormData.doctor_name.trim()) {
      setSnackbar({
        open: true,
        message: "Doctor name is required",
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

      const url = `${Milestonebaseurl}update-doctor/${currentEditItem.referral_id}/`;

      const result = await apiRequest(url, "PATCH", updateData);

      if (result.success) {
        // Update the local data with the response from backend
        // Use registration_number to identify the item to update
        const updatedData = data.map((item) =>
          item.referral_id === currentEditItem.referral_id
            ? { ...item, ...result.data } // Use backend response data
            : item
        );

        setData(updatedData);

        // Update filtered data as well
        const updatedFilteredData = filteredData.map((item) =>
          item.referral_id === currentEditItem.referral_id
            ? { ...item, ...result.data } // Use backend response data
            : item
        );

        setFilteredData(updatedFilteredData);

        setSnackbar({
          open: true,
          message: "Doctor information updated successfully!",
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
  // Updated handleSearch to work with current filtered data
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      const searchLower = searchValue.toLowerCase();
      return (
        item.doctor_name?.toLowerCase().includes(searchLower) ||
        item.hospital_name?.toLowerCase().includes(searchLower) ||
        item.phone_number?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredData(filtered);
  };

  // Handle download (same as original)
  const handleDownload = () => {
    const formattedData = filteredData.map((item, index) => ({
      "Sl. No": index + 1,
      "Doctor Name": item.doctor_name,
      "Hospital Name": item.hospital_name,
      "Referral ID": item.referral_id,
      Sex: item.sex,
      Email: item.email,
      Phone: item.phone_number,
      Area: item.area,
      City: item.city,
      District: item.district,
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
    XLSX.utils.book_append_sheet(wb, ws, "Doctor Information");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "doctor_info_data.xlsx";
    link.click();
  };

  // Handle print (same as original)
  // Handle print (fixed version)
  const handlePrint = () => {
    const tableHTML = `
    <html>
      <head>
        <title>MDC Doctor's List</title>
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
          @media print {
            body { margin: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <h2>MDC Doctor's List</h2>
        <table>
          <thead>
            <tr>
              <th>Sl. No</th>                
              <th>Doctor Name</th>
              <th>Referral ID</th>
              <th>Sex</th>
              <th>Email</th>
              <th>Hospital Name</th>
              <th>Phone</th>
              <th>Area</th>
              <th>City</th>
              <th>District</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Modified By</th>
              <th>Modified Date</th>                
            </tr>
          </thead>
          <tbody>
            ${filteredData
              .map(
                (item, index) => `
                <tr>
                  <td>${index + 1}</td>                  
                  <td>${item.doctor_name || "N/A"}</td>
                  <td>${item.referral_id || "N/A"}</td>
                  <td>${item.sex || "N/A"}</td>
                  <td>${item.email || "N/A"}</td>
                  <td>${item.hospital_name || "N/A"}</td> 
                  <td>${item.phone_number || "N/A"}</td>                      
                  <td>${item.area || "N/A"}</td> 
                  <td>${item.city || "N/A"}</td>
                  <td>${item.district || "N/A"}</td>
                  <td>${item.created_by || "N/A"}</td>
                  <td>${
                    item.created_date
                      ? new Date(item.created_date).toLocaleDateString()
                      : "N/A"
                  }</td>
                  <td>${item.lastmodified_by || "N/A"}</td>
                  <td>${
                    item.lastmodified_date
                      ? new Date(item.lastmodified_date).toLocaleDateString()
                      : "N/A"
                  }</td>
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
    if (printWindow) {
      printWindow.document.write(tableHTML);
      printWindow.document.close();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      // Fallback if popup is blocked
      alert(
        "Please allow popups for this site to enable printing functionality."
      );
    }
  };

  // Handle individual row print (same as original)
  const handlePrintRow = (item) => {
    const printWindow = window.open("", "", "width=800,height=600");
    const rowHTML = `
      <html>
        <head>
          <title>Milestone Development Center - Doctor's Details</title>
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
            <h2>Patient Doctor's Details</h2>
            <table>              
              <tr><th>Doctor Name</th><td>${
                item.doctor_name || "N/A"
              }</td></tr>   
              <tr><th>Referral ID</th><td>${
                item.referral_id || "N/A"
              }</td></tr>   
              <tr><th>Sex</th><td>${item.sex || "N/A"}</td></tr>   
              <tr><th>Email</th><td>${
                item.email || "N/A"
              }</td></tr>             
              <tr><th>Hospital Name</th><td>${
                item.hospital_name || "N/A"
              }</td></tr>
              <tr><th>Phone Number</th><td>${
                item.phone_number || "N/A"
              }</td></tr>             
              <tr><th>Area</th><td>${item.area || "N/A"}</td></tr>
              <tr><th>City</th><td>${item.city || "N/A"}</td></tr>     
                 <tr><th>District</th><td>${
                   item.district || "N/A"
                 }</td></tr>          
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
          MDC Doctor's List
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: "300",
          }}
        >
          Modern Doctor's Management System
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
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              label="Search Doctors"
              placeholder="Search by Doctor Name, Hospital Name or Phone"
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
                minWidth: 400,
                height: 56,
                "& .MuiOutlinedInput-root": {
                  height: 56,
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#406147" },
                  "&.Mui-focused fieldset": { borderColor: "#406147" },
                },
              }}
            />
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
            No Doctors found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or date range
          </Typography>
        </Card>
      ) : (
        /* Doctor Cards Grid */
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
                    {/* Doctor Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 16, mr: 1, color: "#7f8c8d" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Doctor Name:{" "}
                          <strong>{item.doctor_name || "N/A"}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PersonIcon
                          sx={{ fontSize: 16, mr: 1, color: "#e74c3c" }}
                        />
                        <Typography variant="body2">
                          <strong>Gender:</strong> {item.sex || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Person
                          sx={{ fontSize: 16, mr: 1, color: "#e74c3c" }}
                        />
                        <Typography variant="body2">
                          <strong>Referral ID:</strong>{" "}
                          {item.referral_id || "N/A"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <HospitalIcon
                          sx={{ fontSize: 16, mr: 1, color: "#e74c3c" }}
                        />
                        <Typography variant="body2">
                          <strong>Hospital Name:</strong>{" "}
                          {item.hospital_name || "N/A"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Email sx={{ fontSize: 16, mr: 1, color: "#e74c3c" }} />
                        <Typography variant="body2">
                          <strong>Email:</strong> {item.email || "N/A"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ mb: 2 }}>
                      {item.phone_number && (
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
                            M: {item.phone_number}
                          </Typography>
                        </Box>
                      )}

                      {item.area && (
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
                            Area: {item.area}
                          </Typography>
                        </Box>
                      )}
                      {item.city && (
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
                            City: {item.city}
                          </Typography>
                        </Box>
                      )}
                      {item.district && (
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
                            District: {item.district}
                          </Typography>
                        </Box>
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
                        <Tooltip title="Edit Doctor" arrow>
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            background: "#ffffff",
            overflow: "hidden",
            maxHeight: "90vh",
          },
        }}
      >
        {/* Header Banner */}
        <DialogTitle
          sx={{
            background: "#51725b",
            color: "white",
            fontWeight: 600,
            py: 2.5,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" component="span" sx={{ fontSize: "1.5rem" }}>
              👨‍⚕️
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#ffffff" }}
            >
              Edit Referral Doctor
            </Typography>
          </Box>
          <IconButton
            onClick={() => setEditModalOpen(false)}
            sx={{
              color: "white",
              background: "rgba(255, 255, 255, 0.2)",
              width: 32,
              height: 32,
              "&:hover": { background: "rgba(255, 255, 255, 0.35)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3.5, background: "#ffffff" }}>
          <Grid container spacing={2.5}>
            {/* Doctor Name */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Doctor Name <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Enter doctor's full name"
                value={editFormData.doctor_name || ""}
                onChange={(e) =>
                  handleEditFormChange("doctor_name", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* Referral ID */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Referral ID
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Enter referral ID"
                value={editFormData.referral_id || ""}
                onChange={(e) =>
                  handleEditFormChange("referral_id", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Gender
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editFormData.sex || ""}
                  onChange={(e) => handleEditFormChange("sex", e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  }}
                >
                  <MenuItem value="" disabled sx={{ color: "#94a3b8" }}>
                    Select Gender
                  </MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="doctor@example.com"
                value={editFormData.email || ""}
                onChange={(e) => handleEditFormChange("email", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* Hospital Name */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Hospital Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Hospital / Clinic name"
                value={editFormData.hospital_name || ""}
                onChange={(e) =>
                  handleEditFormChange("hospital_name", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* School */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                School
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="School name (if applicable)"
                value={editFormData.school || ""}
                onChange={(e) => handleEditFormChange("school", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* Area */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Area
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Area / Locality"
                value={editFormData.area || ""}
                onChange={(e) => handleEditFormChange("area", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                City
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="City"
                value={editFormData.city || ""}
                onChange={(e) => handleEditFormChange("city", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                District
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="District"
                value={editFormData.district || ""}
                onChange={(e) =>
                  handleEditFormChange("district", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
              >
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Phone number"
                value={editFormData.phone_number || ""}
                onChange={(e) =>
                  handleEditFormChange("phone_number", e.target.value)
                }
                inputProps={{ maxLength: 10 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#51725b" },
                    "&.Mui-focused fieldset": { borderColor: "#51725b", borderWidth: 2 },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            px: 3.5,
            gap: 1.5,
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Button
            onClick={() => setEditModalOpen(false)}
            variant="outlined"
            size="medium"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 0.8,
              borderColor: "#cbd5e1",
              color: "#475569",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpdatePatient}
            disabled={updateLoading}
            startIcon={
              updateLoading ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : (
                <SaveIcon />
              )
            }
            variant="contained"
            size="medium"
            sx={{
              borderRadius: 2,
              px: 3.5,
              py: 0.8,
              background: "#51725b",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                background: "#406147",
                boxShadow: "0 4px 12px rgba(81, 114, 91, 0.3)",
              },
              "&:disabled": {
                background: "#94a3b8",
                color: "white",
              },
            }}
          >
            {updateLoading ? "Updating..." : "Update Doctor Information"}
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

export default ReferralDrEdit;
