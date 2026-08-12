import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/CloudDownload";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import apiRequest from "./apiRequest";
import { generateRegistrationFormHTML } from "./generateRegistrationFormHTML";

const PatientEdit = () => {
  const navigate = useNavigate();
  const listContainerRef = useRef(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [searchTerm, setSearchTerm] = useState("");
  const employeeName = localStorage.getItem("name");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // "card" | "table"
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setFromDate(currentDate);
    setToDate(currentDate);
    fetchData(currentDate);
  }, []);

  const fetchData = async (filterDate = null) => {
    setLoading(true);
    const url = `${Milestonebaseurl}all-patient/`;

    try {
      const result = await apiRequest(url, "GET");
      if (result.success) {
        setData(result.data);

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
      setPage(1);
    }
  };

  const handleEdit = (item) => {
    navigate("/registration", { state: { editItem: item } });
  };

  const handleDateFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be later than to date");
      return;
    }

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

    setFilteredData(filtered);
    setIsDateFilterActive(true);
    setSearchTerm("");
    setPage(1);
  };

  const handleShowAllData = () => {
    setFilteredData(data);
    setIsDateFilterActive(false);
    setSearchTerm("");
    setPage(1);
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setPage(1);

    let baseData =
      isDateFilterActive && fromDate && toDate
        ? filteredData
        : data;

    if (!searchValue.trim()) {
      if (isDateFilterActive && fromDate && toDate) {
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

  // Compute pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatAge = (ageData) => {
    try {
      const age = typeof ageData === "string" ? JSON.parse(ageData) : ageData;
      return `${age.year || 0}y ${age.months || 0}m ${age.days || 0}d`;
    } catch (error) {
      return "N/A";
    }
  };

  const formatFatherName = (name) => {
    if (!name || !name.trim()) return "N/A";
    const trimmed = name.trim();
    return /^(Mr|Dr|Prof|Er)\.?\s+/i.test(trimmed) ? trimmed : `Mr. ${trimmed}`;
  };

  const formatMotherName = (name) => {
    if (!name || !name.trim()) return "N/A";
    const trimmed = name.trim();
    return /^(Mrs|Ms|Miss|Dr|Prof)\.?\s+/i.test(trimmed) ? trimmed : `Mrs. ${trimmed}`;
  };

  const formatReasonForVisit = (reasonData) => {
    try {
      const reasons =
        typeof reasonData === "string" ? JSON.parse(reasonData) : reasonData;
      return Array.isArray(reasons) ? reasons.join(", ") : reasons;
    } catch (error) {
      return reasonData || "N/A";
    }
  };

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

  const handleDownload = () => {
    const formattedData = filteredData.map((item, index) => ({
      "Sl. No": index + 1,
      "Registration Number": item.registration_number,
      Date: new Date(item.date).toLocaleDateString(),
      Salutation: item.salutation,
      "Name of Child": item.name_of_child,
      DOB: item.dob ? new Date(item.dob).toLocaleDateString() : "N/A",
      Age: formatAge(item.age),
      Sex: item.sex,
      "Mother Name": formatMotherName(item.mother_name),
      "Father Name": formatFatherName(item.father_name),
      "Guardian Name": item.guardian_name,
      "Husband Name": item.husband_name,
      Address: item.address,
      Email: item.mail_id,
      "Mother Phone": item.mother_phone_number,
      "Father Phone": item.father_phone_number,
      "Reason for Visit": formatReasonForVisit(item.reason_for_visit),
      "Duration of Symptoms": item.duration_of_symptoms,
      "Previous Treatment": item.previous_treatment_done,
      "Other Details": item.other_details,
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
    XLSX.utils.book_append_sheet(wb, ws, "Patient Registration Reports");
    XLSX.writeFile(wb, "Patient_Registration_Reports.xlsx");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=800,width=1200");
    const tableHTML = `
      <html>
        <head>
          <title>Patient Registration Reports</title>
          <style>
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #406147; color: white; }
            h2 { text-align: center; font-family: Arial, sans-serif; color: #406147; }
            .header-info { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Patient Registration Reports</h2>
          <div class="header-info">Generated on ${new Date().toLocaleDateString()} | Total Records: ${filteredData.length}</div>
          <table>
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Reg. No.</th>
                <th>Date</th>
                <th>Salutation</th>
                <th>Name of Child</th>
                <th>DOB</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mother Name</th>
                <th>Father Name</th>
                <th>Husband Name</th>
                <th>Address</th>
                <th>Mother Phone</th>
                <th>Father Phone</th>
                <th>Reason for Visit</th>
                <th>Duration of Symptoms</th>
                <th>Previous Treatment</th>
                <th>Other Details</th>
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
                    <td>${item.salutation || "N/A"}</td>
                    <td>${item.name_of_child}</td>
                    <td>${
                      item.dob ? new Date(item.dob).toLocaleDateString() : "N/A"
                    }</td>
                    <td>${formatAge(item.age)}</td>
                    <td>${item.sex}</td>
                    <td>${formatMotherName(item.mother_name)}</td>
                    <td>${formatFatherName(item.father_name)}</td>
                    <td>${item.husband_name || "N/A"}</td>
                    <td>${item.address}</td>
                    <td>${item.mother_phone_number}</td>
                    <td>${item.father_phone_number}</td>
                    <td>${formatReasonForVisit(item.reason_for_visit)}</td>
                    <td>${item.duration_of_symptoms || "N/A"}</td>
                    <td>${item.previous_treatment_done || "N/A"}</td>
                    <td>${item.other_details || "N/A"}</td>
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

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintRow = (item) => {
    const printWindow = window.open("", "", "width=850,height=900");
    const rowHTML = generateRegistrationFormHTML(item, employeeName);

    printWindow.document.write(rowHTML);
    setTimeout(() => {
      printWindow.document.close();
      printWindow.print();
    }, 500);
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
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            color: "white",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            mb: 1,
            fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
          }}
        >
          Patient Registration Reports
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: "300",
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
          }}
        >
          Card & List View Patient Management System
        </Typography>
      </Box>

      {/* Filters & View Switcher Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
                flex: 1,
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
                  minWidth: 260,
                  flex: 1,
                  height: 48,
                  "& .MuiOutlinedInput-root": {
                    height: 48,
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
                  width: 160,
                  height: 48,
                  "& .MuiOutlinedInput-root": {
                    height: 48,
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
                  width: 160,
                  height: 48,
                  "& .MuiOutlinedInput-root": {
                    height: 48,
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
                  px: 2.5,
                  height: 48,
                  fontWeight: 700,
                  "&:hover": {
                    background: "linear-gradient(45deg, #5a7c65, #406147)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 16px rgba(64,97,71,0.4)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Filter
              </Button>

              <Button
                variant="outlined"
                onClick={handleShowAllData}
                startIcon={<SearchIcon />}
                sx={{
                  borderColor: "#406147",
                  color: "#406147",
                  borderRadius: 2,
                  px: 2.5,
                  height: 48,
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#5a7c65",
                    backgroundColor: "rgba(64,97,71,0.1)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Show All
              </Button>
            </Box>

            {/* Right Group: View Switcher & Export */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Export Buttons */}
              {filteredData.length > 0 && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Download Excel" arrow>
                    <IconButton
                      onClick={handleDownload}
                      sx={{
                        background: "linear-gradient(45deg, #4CAF50, #66BB6A)",
                        color: "white",
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        "&:hover": {
                          background: "linear-gradient(45deg, #66BB6A, #4CAF50)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print All Records" arrow>
                    <IconButton
                      onClick={handlePrint}
                      sx={{
                        background: "linear-gradient(45deg, #FF9800, #FFB74D)",
                        color: "white",
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        "&:hover": {
                          background: "linear-gradient(45deg, #FFB74D, #FF9800)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* View Mode Toggle Switcher */}
              <Box
                sx={{
                  display: "flex",
                  background: "#f3f4f6",
                  borderRadius: 2,
                  p: 0.5,
                  height: 48,
                  alignItems: "center",
                }}
              >
                <IconButton
                  onClick={() => setViewMode("card")}
                  sx={{
                    bgcolor: viewMode === "card" ? "#406147" : "transparent",
                    color: viewMode === "card" ? "white" : "#6b7280",
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.8,
                    "&:hover": {
                      bgcolor: viewMode === "card" ? "#406147" : "#e5e7eb",
                    },
                  }}
                  title="Card View"
                >
                  <GridViewIcon sx={{ mr: 0.5 }} />
                  <Typography variant="button" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Cards
                  </Typography>
                </IconButton>

                <IconButton
                  onClick={() => setViewMode("table")}
                  sx={{
                    bgcolor: viewMode === "table" ? "#406147" : "transparent",
                    color: viewMode === "table" ? "white" : "#6b7280",
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.8,
                    "&:hover": {
                      bgcolor: viewMode === "table" ? "#406147" : "#e5e7eb",
                    },
                  }}
                  title="Table View"
                >
                  <TableRowsIcon sx={{ mr: 0.5 }} />
                  <Typography variant="button" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Table
                  </Typography>
                </IconButton>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results Count Chip */}
      {!loading && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
          <Chip
            label={`${filteredData.length} Patient${
              filteredData.length !== 1 ? "s" : ""
            } Found`}
            sx={{
              background: "rgba(255,255,255,0.9)",
              color: "#406147",
              fontWeight: "bold",
              fontSize: "0.95rem",
              px: 1.5,
              py: 0.5,
            }}
          />

          <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </Typography>
        </Box>
      )}

      {/* Main Content Box with INLINE SCROLL */}
      <Box
        ref={listContainerRef}
        sx={{
          maxHeight: "calc(100vh - 350px)",
          minHeight: 380,
          overflowY: "auto",
          pr: 0.5,
          borderRadius: 3,
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { bgcolor: "rgba(255,255,255,0.2)", borderRadius: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#406147", borderRadius: 4 },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#2e4633" },
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
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
        ) : viewMode === "card" ? (
          /* Card Grid View (Paginated) */
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 2.5,
              pb: 1,
            }}
          >
            {paginatedData.map((item, index) => (
              <Card
                key={item.id || item.registration_number || index}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.96)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 14px 32px rgba(0,0,0,0.14)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#1f3b25",
                          fontSize: "1.1rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.salutation ? `${item.salutation} ` : ""}
                        {item.name_of_child || "Unknown"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#6b7280",
                          display: "block",
                          mt: 0.5,
                        }}
                      >
                        Reg #: {item.registration_number}
                      </Typography>
                    </Box>

                    <Chip
                      label={item.sex || "N/A"}
                      size="small"
                      sx={{
                        bgcolor: getSexColor(item.sex),
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Info list */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
                        📅 Registered:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                        {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
                        🎂 Age / DOB:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                        {formatAge(item.age)} {item.dob ? `(${new Date(item.dob).toLocaleDateString()})` : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
                        👨‍👩‍👦 Parents:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827", textAlign: "right" }}>
                        {formatMotherName(item.mother_name)} / {formatFatherName(item.father_name)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
                        📞 Phone:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                        {item.mother_phone_number || item.father_phone_number || "N/A"}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600, mb: 0.2 }}>
                        📋 Reason for Visit:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          background: "#f3f4f6",
                          p: 1,
                          borderRadius: 1.5,
                          fontSize: "0.8rem",
                        }}
                      >
                        {formatReasonForVisit(item.reason_for_visit)}
                      </Typography>
                    </Box>

                    {item.other_details && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600, mb: 0.2 }}>
                          📝 Other Details:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#1e40af",
                            background: "#eef2ff",
                            p: 1,
                            borderRadius: 1.5,
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.other_details}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {/* Action Buttons: View, Edit, Print */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1.5,
                    pt: 0,
                    gap: 1,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setSelectedPatientForView(item)}
                    sx={{
                      flex: 1,
                      borderColor: "#3b82f6",
                      color: "#2563eb",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#eff6ff", borderColor: "#2563eb" },
                    }}
                  >
                    View
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(item)}
                    sx={{
                      flex: 1,
                      borderColor: "#10b981",
                      color: "#059669",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#ecfdf5", borderColor: "#059669" },
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrintRow(item)}
                    sx={{
                      flex: 1,
                      borderColor: "#f59e0b",
                      color: "#d97706",
                      fontWeight: 700,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#fffbeb", borderColor: "#d97706" },
                    }}
                  >
                    Print
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          /* Patient Table View (Paginated) */
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Reg. No.
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Sex
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Age
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Registered
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Mother
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Father
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Mother Phone
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Father Phone
                  </TableCell>
                  <TableCell sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}>
                    Reason for Visit
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ backgroundColor: "#406147", color: "white", fontWeight: "bold" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    hover
                    sx={{
                      "&:nth-of-type(even)": { backgroundColor: "#f8faf8" },
                    }}
                  >
                    <TableCell>{item.registration_number}</TableCell>
                    <TableCell>
                      {item.salutation ? `${item.salutation} ` : ""}
                      {item.name_of_child || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.sex || "N/A"}
                        size="small"
                        sx={{
                          bgcolor: getSexColor(item.sex),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatAge(item.age)}</TableCell>
                    <TableCell>
                      {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{formatMotherName(item.mother_name)}</TableCell>
                    <TableCell>{formatFatherName(item.father_name)}</TableCell>
                    <TableCell>{item.mother_phone_number || "N/A"}</TableCell>
                    <TableCell>{item.father_phone_number || "N/A"}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      {formatReasonForVisit(item.reason_for_visit)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          onClick={() => setSelectedPatientForView(item)}
                          sx={{
                            color: "#3b82f6",
                            "&:hover": {
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Patient" arrow>
                        <IconButton
                          onClick={() => handleEdit(item)}
                          sx={{
                            color: "#10b981",
                            "&:hover": {
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Details" arrow>
                        <IconButton
                          onClick={() => handlePrintRow(item)}
                          sx={{
                            color: "#f59e0b",
                            "&:hover": {
                              backgroundColor: "rgba(245, 158, 11, 0.1)",
                            },
                          }}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Pagination Controls Bar */}
      {!loading && filteredData.length > 0 && (
        <Card
          sx={{
            mt: 2.5,
            p: 1.5,
            px: 3,
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#374151" }}>
              Per Page:
            </Typography>
            <Select
              size="small"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                borderRadius: 2,
                height: 38,
                fontWeight: 700,
                color: "#406147",
                bgcolor: "#f9fafb",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
              }}
            >
              <MenuItem value={6}>6 items</MenuItem>
              <MenuItem value={12}>12 items</MenuItem>
              <MenuItem value={24}>24 items</MenuItem>
              <MenuItem value={48}>48 items</MenuItem>
            </Select>
            <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
              Showing {Math.min((page - 1) * itemsPerPage + 1, filteredData.length)}–
              {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length} records
            </Typography>
          </Box>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 700,
                color: "#406147",
              },
              "& .Mui-selected": {
                bgcolor: "#406147 !important",
                color: "white !important",
              },
            }}
          />
        </Card>
      )}

      {/* Patient View Modal */}
      {selectedPatientForView && (
        <Dialog
          open={Boolean(selectedPatientForView)}
          onClose={() => setSelectedPatientForView(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#406147" }}>
                Patient Registration Details
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontWeight: 700 }}
              >
                Registration No: {selectedPatientForView.registration_number}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedPatientForView(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2.5 }}
          >
            {/* Child Information */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#406147",
                  textTransform: "uppercase",
                  mb: 1,
                  letterSpacing: "0.05em",
                }}
              >
                👶 Child Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 1.5,
                  bgcolor: "#f9fafb",
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Salutation & Child Name
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.salutation
                      ? `${selectedPatientForView.salutation} `
                      : ""}
                    {selectedPatientForView.name_of_child || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Registration Number
                  </Typography>
                  <Typography variant="body2" fontWeight="700" color="#406147">
                    {selectedPatientForView.registration_number || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.sex || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.dob
                      ? new Date(selectedPatientForView.dob).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Age
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatAge(selectedPatientForView.age)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.date
                      ? new Date(selectedPatientForView.date).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Linked Appointment ID
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.appointment_id || "None"}
                  </Typography>
                </div>
              </Box>
            </Box>

            {/* Parent & Family Information */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#406147",
                  textTransform: "uppercase",
                  mb: 1,
                  letterSpacing: "0.05em",
                }}
              >
                👨‍👩‍👦 Family & Contact Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 1.5,
                  bgcolor: "#f9fafb",
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Mother Name
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatMotherName(selectedPatientForView.mother_name)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Father Name
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatFatherName(selectedPatientForView.father_name)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Guardian Name
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.guardian_name || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Husband Name
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.husband_name || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Mother Phone Number
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.mother_phone_number || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Father Phone Number
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.father_phone_number || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    E-Mail ID
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.mail_id || "N/A"}
                  </Typography>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <Typography variant="caption" color="textSecondary">
                    Full Address
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.address || "N/A"}
                  </Typography>
                </div>
              </Box>
            </Box>

            {/* Clinical & Visit Details */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#406147",
                  textTransform: "uppercase",
                  mb: 1,
                  letterSpacing: "0.05em",
                }}
              >
                📋 Clinical & Visit Details
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  bgcolor: "#f9fafb",
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Reason for Visit
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatReasonForVisit(selectedPatientForView.reason_for_visit)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Duration of Symptoms
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.duration_of_symptoms || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Previous Treatment Done
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.previous_treatment_done || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Other Details
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    sx={{ color: "#1e40af" }}
                  >
                    {selectedPatientForView.other_details || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Source of Referral
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatSourceOfReferral(
                      selectedPatientForView.source_of_referral
                    )}
                  </Typography>
                </div>
              </Box>
            </Box>

            {/* Audit & System Info */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#406147",
                  textTransform: "uppercase",
                  mb: 1,
                  letterSpacing: "0.05em",
                }}
              >
                🕒 Audit Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 1.5,
                  bgcolor: "#f9fafb",
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.created_by || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Created Date
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.created_date
                      ? new Date(selectedPatientForView.created_date).toLocaleString()
                      : "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Last Modified By
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.lastmodified_by || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">
                    Last Modified Date
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {selectedPatientForView.lastmodified_date
                      ? new Date(selectedPatientForView.lastmodified_date).toLocaleString()
                      : "N/A"}
                  </Typography>
                </div>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setSelectedPatientForView(null)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                const item = selectedPatientForView;
                setSelectedPatientForView(null);
                handleEdit(item);
              }}
              sx={{ bgcolor: "#406147", "&:hover": { bgcolor: "#2e4633" } }}
            >
              Edit Registration
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => {
                handlePrintRow(selectedPatientForView);
              }}
              sx={{ bgcolor: "#f59e0b", "&:hover": { bgcolor: "#d97706" } }}
            >
              Print Form
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PatientEdit;