import React, { useEffect, useState } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import {
  Search,
  Users,
  Edit3,
  Trash2,
  Save,
  X,
  Filter,
  RotateCcw,
  Printer,
  FileText,
} from "react-feather";
import * as XLSX from "xlsx";

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM

  const baseUrl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // ---------- FETCH ----------
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await apiRequest(`${baseUrl}get_all_patient_attendance/`, "GET");
        let data = [];
        if (res && res.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res)) {
          data = res;
        } else {
          throw new Error("Invalid data format");
        }
        setAttendance(data);
        setFilteredAttendance(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load attendance: " + (err.message || "Unknown error"));
        setAttendance([]);
        setFilteredAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [baseUrl]);

  // ---------- DEFAULT CURRENT MONTH ----------
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setFilterMonth(currentMonth);
  }, []);

  // ---------- APPLY FILTERS ----------
  useEffect(() => {
    let filtered = [...attendance];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.registration_number.toLowerCase().includes(lowerTerm) ||
          a.name_of_child.toLowerCase().includes(lowerTerm) ||
          a.session.toLowerCase().includes(lowerTerm)
      );
    }

    // Month range filter
    // Single month filter
    if (filterMonth) {
      filtered = filtered.filter((a) => {
        const rec = new Date(a.date);
        const recYM = `${rec.getFullYear()}-${String(rec.getMonth() + 1).padStart(2, "0")}`;
        return recYM === filterMonth;
      });
    }

    setFilteredAttendance(filtered);
  },[searchTerm, filterMonth, attendance]);

  // ---------- TOTAL ----------
  const totalCharge = filteredAttendance.reduce(
    (sum, a) => sum + (a.therapy_charge || 0),
    0
  );

  // ---------- EDIT ----------
const startEdit = (record) => {
  const localDate = new Date(record.date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  setEditingId(record._id);
  setEditFormData({
    date: `${year}-${month}-${day}`,  // ✅ Local-safe format
    session: record.session,
    therapy_charge: record.therapy_charge,
  });
};

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) {
      toast.error("No record selected for edit");
      return;
    }
    try {
      const payload = {
        _id: editingId,
        ...editFormData,
        therapy_charge: Number(editFormData.therapy_charge),
        date: `${editFormData.date}T00:00:00`,
      };
      await apiRequest(`${baseUrl}edit_patient_attendance/`, "PATCH", payload);
      toast.success("Updated successfully!");
      const updatedRecord = { ...editFormData, date: payload.date };
      setAttendance((prev) =>
        prev.map((a) => (a._id === editingId ? { ...a, ...updatedRecord } : a))
      );
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      console.error(err);
      toast.error("Update failed: " + (err.message || "Unknown error"));
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance?")) return;

    try {
      const payload = { _id: id };
      await apiRequest(`${baseUrl}delete_patient_attendance/`, "DELETE", payload);
      toast.success("Deleted successfully!");
      setAttendance((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed: " + (err.message || "Unknown error"));
    }
  };

  // ---------- RESET ----------
const handleResetFilters = () => {
    setSearchTerm("");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setFilterMonth(currentMonth);
  };
  // ---------- PRINT ----------
  const handlePrint = () => {
    const periodLabel = filterMonth
      ? new Date(filterMonth + "-01").toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        })
      : "All Records";
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body {font-family:'Segoe UI',sans-serif;margin:40px;color:#333;}
            .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #10b981;padding-bottom:20px;}
            .header h1{color:#10b981;margin:0;font-size:24px;}
            .header p{color:#666;margin:5px 0 0;}
            table{width:100%;border-collapse:collapse;margin-top:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}
            th,td{padding:12px 15px;text-align:left;border-bottom:1px solid #ddd;}
            th{background:#f8f9fa;font-weight:600;color:#374151;text-transform:uppercase;font-size:12px;letter-spacing:0.5px;}
            /* Right-align Therapy Charge */
            th:nth-child(8), td:nth-child(8) { text-align:right; }
            th:nth-child(7), td:nth-child(7) { text-align:center; }

            tr:nth-child(e0ven){background:#f9fafb;}
            tr:hover{background:#f0fdf4;}
            .total-row{background:linear-gradient(135deg,#10b981 0%,#059669 100%) !important;font-weight:bold;}
            .total-row td{color:white;border-top:2px solid #fff;}
            .total-amount{text-align:right;font-size:16px;}
            @media print{body{margin:0;}.header{margin:20px 0;}}
            @page{margin:20px;}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ATTENDANCE REPORT</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Period: ${periodLabel}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL No</th>
                <th>Registration No</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Sex</th>
                <th>Date</th>
                <th>Session</th>
                <th>Therapy Charge</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAttendance
                .map(
                  (a, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${a.registration_number}</td>
                  <td>${a.name_of_child}</td>
                  <td>${new Date(a.dob).toLocaleDateString()}</td>
                  <td>${a.sex}</td>
                  <td>${new Date(a.date).toLocaleDateString()}</td>
                  <td>${a.session}</td>
                  <td>${a.therapy_charge}</td>
                </tr>`
                )
                .join("")}
              <tr class="total-row">
                <td colspan="7"><strong>Total Therapy Charge:</strong></td>
                <td class="total-amount"><strong>${totalCharge}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // ---------- EXPORT ----------
const handleExport = () => {
  const exportData = filteredAttendance.map((a, i) => ({
    "SL No": i + 1,
    "Registration No": a.registration_number,
    Name: a.name_of_child,
    DOB: new Date(a.dob).toLocaleDateString(),
    Sex: a.sex,
    Date: new Date(a.date).toLocaleDateString(),
    Session: a.session,
    "Therapy Charge": a.therapy_charge,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Set column widths (important for visible centering)
  ws["!cols"] = [
    { wch: 8 },  // SL No
    { wch: 18 }, // Registration No
    { wch: 20 }, // Name
    { wch: 12 }, // DOB
    { wch: 8 },  // Sex
    { wch: 15 }, // Date
    { wch: 12 }, // Session
    { wch: 16 }, // Therapy Charge
  ];

  // Center both header and data for Session column
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const cell = XLSX.utils.encode_cell({ r: R, c: 6 }); // Column G → Session
    if (!ws[cell]) ws[cell] = { v: "" };
    ws[cell].s = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } },
      },
    };
  }
const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const fileMonth = filterMonth || "All";
    XLSX.writeFile(wb, `attendance_report_${fileMonth}.xlsx`);
  };

  if (loading) return <LoadingText>Loading attendance records...</LoadingText>;

  // UI helper: display range
const monthRangeDisplay = filterMonth
    ? new Date(filterMonth + "-01").toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "All Months";

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <Users size={32} />
          </IconWrapper>
          <TitleContent>
            <Title>All Patient Attendance</Title>
            <Subtitle>Manage and view attendance records</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        {/* Filter Section */}
        <SearchSection>
          <SearchIconWrapper>
            <Filter size={22} />
          </SearchIconWrapper>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FilterWrapper style={{ minWidth: "300px" }}>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Reg No, Name or Session"
              />
            </FilterWrapper>

            {/* <FilterWrapper>
              <SearchInput
                type="month"
                value={filterStartMonth}
                onChange={(e) => setFilterStartMonth(e.target.value)}
              />
            </FilterWrapper>

            <span style={{ color: "#555", fontSize: "0.9rem" }}>to</span>

            <FilterWrapper>
              <SearchInput
                type="month"
                value={filterEndMonth}
                onChange={(e) => setFilterEndMonth(e.target.value)}
              />
            </FilterWrapper> */}
{/* Single month filter */}
            <FilterWrapper>
              <SearchInput
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                placeholder="Select month"
              />
            </FilterWrapper>
            <ResetButton onClick={handleResetFilters}>
              <RotateCcw size={16} />
              Reset
            </ResetButton>
          </div>
        </SearchSection>

        <ResultCount>
          Showing <strong>{filteredAttendance.length}</strong> records for{" "}
          <strong>{monthRangeDisplay}</strong>
        </ResultCount>

        {filteredAttendance.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Users size={64} />
            </EmptyIcon>
            <EmptyTitle>No Records Found</EmptyTitle>
            <EmptyText>
              Try adjusting your filters or add new attendance.
            </EmptyText>
          </EmptyState>
        ) : (
          <>
            {/* Print & Export */}
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <ActionButton onClick={handlePrint} print>
                <Printer size={16} />
                Print
              </ActionButton>
              <ActionButton onClick={handleExport} export>
                <FileText size={16} />
                Export Excel
              </ActionButton>
            </div>

            <TableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <Th>SL No</Th>
                    <Th>Registration No</Th>
                    <Th>Name</Th>
                    <Th>DOB</Th>
                    <Th>Sex</Th>
                    <Th>Date</Th>
                    <Th>Session</Th>
                    <Th>Therapy Charge</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((a, index) => {
                    const isEditing = editingId === a._id;
                    return (
                      <PatientRow key={a._id}>
                        <Td>{index + 1}</Td>
                        <Td>{a.registration_number}</Td>
                        <Td>{a.name_of_child}</Td>
                        <Td>{new Date(a.dob).toLocaleDateString()}</Td>
                        <Td>{a.sex}</Td>
                        <Td>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editFormData.date || ""}
                              onChange={(e) =>
                                handleInputChange("date", e.target.value)
                              }
                            />
                          ) : (
                            new Date(a.date).toLocaleDateString()
                          )}
                        </Td>
                        <Td>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={editFormData.session || ""}
                              onChange={(e) =>
                                handleInputChange("session", e.target.value)
                              }
                            />
                          ) : (
                            a.session
                          )}
                        </Td>
                        <Td>
  {isEditing ? (
    <Input
      type="number"
      value={editFormData.therapy_charge || ""}
      onChange={(e) =>
        handleInputChange("therapy_charge", e.target.value)
      }
    />
  ) : (
    a.therapy_charge
  )}
</Td>

                        <Td>
                          {isEditing ? (
                            <>
                              <ActionButton save onClick={handleSave}>
                                <Save size={16} />
                                Save
                              </ActionButton>
                              <ActionButton
                                cancel
                                onClick={() => {
                                  setEditingId(null);
                                  setEditFormData({});
                                }}
                              >
                                <X size={16} />
                                Cancel
                              </ActionButton>
                            </>
                          ) : (
                            <>
                              <ActionButton edit onClick={() => startEdit(a)}>
                                <Edit3 size={16} />
                                Edit
                              </ActionButton>
                              <ActionButton
                                $delete
                                onClick={() => handleDelete(a._id)}
                              >
                                <Trash2 size={16} />
                                Delete
                              </ActionButton>
                            </>
                          )}
                        </Td>
                      </PatientRow>
                    );
                  })}
                </tbody>
              </StyledTable>
            </TableWrapper>

            {/* Total */}
            <TotalSummary>
              <TotalCard>
                <div>
                  <TotalLabel>Total Therapy Charge</TotalLabel>
                  <TotalAmount>{totalCharge}</TotalAmount>
                </div>
              </TotalCard>
            </TotalSummary>
          </>
        )}
      </ContentCard>
    </Container>
  );
};

/* ──────────────────────────────────────────────────────────────
   Styled Components
   ────────────────────────────────────────────────────────────── */
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #8db488a1 0%, #9bc0b4ff 100%);
  padding: 2rem;
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;
const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;
const TitleContent = styled.div``;
const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;
const Subtitle = styled.p`
  font-size: 1.05rem;
  margin: 0.5rem 0 0;
  opacity: 0.95;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  gap: 10px;
`;
const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(16, 185, 129, 1);
  margin-bottom: 6px;
  svg {
    width: 22px;
    height: 22px;
  }
`;
const FilterWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
  &::placeholder {
    color: #999;
  }
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: #e5e7eb;
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ResultCount = styled.div`
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  strong {
    color: rgba(144, 240, 208, 1);
    font-weight: 700;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;
const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;
const Th = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`;
const PatientRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }
  &:hover {
    background: #f0fdf4;
    transition: background 0.3s ease;
  }
`;
const Td = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  &:focus {
    outline: none;
    border-color: #10b981;
    background: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const TotalSummary = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;
const TotalCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(139, 190, 173, 1) 0%, rgba(95, 153, 135, 1) 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;
const TotalLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 2px;
`;
const TotalAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${({ edit }) =>
    edit &&
    `
    background: #dbeafe;
    color: #1e40af;
    &:hover {background:#bfdbfe; transform:translateY(-2px);}
  `}
  ${({ $delete }) =>
    $delete &&
    `
    background:#fee2e2;
    color:#991b1b;
    &:hover {background:#fecaca; transform:translateY(-2px);}
  `}
  ${({ save }) =>
    save &&
    `
    background:linear-gradient(135deg,#10b981 0%,#059669 100%);
    color:white;
    &:hover {transform:translateY(-2px); box-shadow:0 8px 24px rgba(16,185,129,0.4);}
  `}
  ${({ cancel }) =>
    cancel &&
    `
    background:#f3f4f6;
    color:#374151;
    &:hover {background:#e5e7eb;}
  `}
  ${({ print }) =>
    print &&
    `
    background:#dbeafe;
    color:#1e40af;
    &:hover {background:#bfdbfe; transform:translateY(-2px);}
  `}
  ${({ export: exp }) =>
    exp &&
    `
    background:#dbeafe;
    color:#1e40af;
    &:hover {background:#bfdbfe; transform:translateY(-2px);}
  `}
  svg {width:16px;height:16px;}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;
const EmptyIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 1.5rem;
`;
const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  color: #374151;
  margin: 0 0 0.5rem;
  font-weight: 700;
`;
const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
`;
const LoadingText = styled.p`
  text-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 2rem;
`;

export default AttendanceReport;