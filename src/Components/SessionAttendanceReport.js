import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Calendar, Search, FileText, Download, Printer, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, Clock, Check, UserCheck, Shield } from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";

const styledComponents = styled;
const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const SessionAttendanceReport = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [reportYear, setReportYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastDay, setLastDay] = useState(31);

  // User identity & Role State
  const [userRole, setUserRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [viewScope, setViewScope] = useState("all"); // "all" | "allotted"

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" }
  ];

  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    const role = localStorage.getItem("role") || localStorage.getItem("userRole") || "Receptionist";
    const empid = localStorage.getItem("employeeId") || localStorage.getItem("employee_id") || localStorage.getItem("empid") || localStorage.getItem("emp_id") || localStorage.getItem("auth-user-id") || localStorage.getItem("user_id") || "";
    const name = localStorage.getItem("name") || "";
    setUserRole(role);
    setEmployeeId(empid);
    setEmployeeName(name);

    const rLower = role.toLowerCase();
    if (rLower.includes("therapist") || rLower.includes("doctor") || rLower.includes("pediatrician") || rLower.includes("pedia")) {
      setViewScope("allotted");
    }
  }, []);

  const roleStr = userRole.toLowerCase();
  const isAdmin = roleStr.includes("admin") || roleStr.includes("super");
  const isReceptionist = !isAdmin && (roleStr.includes("rec") || roleStr.includes("front"));
  const isTherapist = !isAdmin && !isReceptionist && (roleStr.includes("therapist") || roleStr.includes("doctor") || roleStr.includes("pediatrician") || roleStr.includes("pedia"));

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const url = `${Milestonebaseurl}session-attendance/monthly-report/?month=${reportMonth}&year=${reportYear}`;
      const response = await apiRequest(url, "GET");

      if (response && response.success) {
        setReportData(response.data.data || []);
        setLastDay(response.data.last_day || 31);
      } else {
        toast.error(response?.error || response?.message || "Failed to load report data");
      }
    } catch (err) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportMonth, reportYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, reportMonth, reportYear, viewScope]);

  const handleConfirmSession = async (sessionId) => {
    if (!sessionId) return;
    try {
      const response = await apiRequest(`${Milestonebaseurl}session-attendance/confirm/`, "POST", {
        session_id: sessionId,
        employee_id: employeeId || employeeName || "User"
      });

      if (response && response.success) {
        toast.success("Session confirmed successfully!");
        setReportData((prevData) => {
          return prevData.map((row) => {
            const updatedDays = { ...row.days };
            Object.keys(updatedDays).forEach((dayKey) => {
              if (Array.isArray(updatedDays[dayKey])) {
                updatedDays[dayKey] = updatedDays[dayKey].map((item) => {
                  if (item.session_id === sessionId) {
                    return { ...item, is_confirmed: true };
                  }
                  return item;
                });
              }
            });
            return { ...row, days: updatedDays };
          });
        });
      } else {
        toast.error(response?.error || response?.message || "Failed to confirm session");
      }
    } catch (err) {
      toast.error("Failed to confirm session");
    }
  };

  const safeReportData = Array.isArray(reportData) ? reportData : [];

  const sortedReportData = [...safeReportData].sort((a, b) => {
    const regA = String(a.registration_number || "").trim().toLowerCase();
    const regB = String(b.registration_number || "").trim().toLowerCase();
    if (regA !== regB) return regA.localeCompare(regB);
    const tA = String(a.therapy_name || "").trim().toLowerCase();
    const tB = String(b.therapy_name || "").trim().toLowerCase();
    return tA.localeCompare(tB);
  });

  // Filter rows based on viewScope and search query
  const scopedData = sortedReportData.filter((row) => {
    if (viewScope === "all" || isReceptionist) return true;
    
    // Check if therapist matches for any slot in any day
    return Object.values(row.days || {}).some((daySlots) => {
      const slots = Array.isArray(daySlots) ? daySlots : [];
      return slots.some(s => {
        const tid = String(s.therapist_id || "").toLowerCase().trim();
        const tname = String(s.therapist || "").toLowerCase().trim();
        const myEmpId = String(employeeId || "").toLowerCase().trim();
        const myName = String(employeeName || "").toLowerCase().trim();
        return (
          (myEmpId && (tid === myEmpId || tname === myEmpId || tid.includes(myEmpId) || tname.includes(myEmpId))) ||
          (myName && (tid === myName || tname === myName || tid.includes(myName) || tname.includes(myName)))
        );
      });
    });
  });

  const filteredData = scopedData.filter((row) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      row.patient_name?.toLowerCase().includes(q) ||
      row.registration_number?.toLowerCase().includes(q) ||
      row.therapy_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const displayedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Get full date string (DD-MM-YYYY)
  const getFullDateString = (dayNum) => {
    const dayStr = String(dayNum).padStart(2, '0');
    const monthStr = String(reportMonth).padStart(2, '0');
    return `${dayStr}-${monthStr}-${reportYear}`;
  };

  // Check if a specific day is weekend
  const isWeekendDay = (dayNum) => {
    const date = new Date(reportYear, reportMonth - 1, dayNum);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0: Sunday, 6: Saturday
  };

  // Export report to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.warning("No data available to export");
      return;
    }

    const headers = ["Child Name", "Reg No", "Therapy Name"];
    for (let d = 1; d <= lastDay; d++) {
      headers.push(getFullDateString(d));
    }

    const csvRows = [headers.join(",")];

    filteredData.forEach((row) => {
      const line = [
        `"${row.patient_name.replace(/"/g, '""')}"`,
        `"${row.registration_number.replace(/"/g, '""')}"`,
        `"${row.therapy_name.replace(/"/g, '""')}"`
      ];

      for (let d = 1; d <= lastDay; d++) {
        const rawSlots = row.days[String(d)];
        const slots = Array.isArray(rawSlots)
          ? rawSlots
          : (rawSlots ? [{ slot: String(rawSlots), therapist: "" }] : []);
        const val = slots.map((s) => {
          const statusStr = s.is_confirmed ? "[Confirmed]" : "[Unconfirmed]";
          return s.therapist ? `${s.slot} (${s.therapist}) ${statusStr}` : `${s.slot} ${statusStr}`;
        }).join("; ") || "-";
        line.push(`"${val.replace(/"/g, '""')}"`);
      }
      csvRows.push(line.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Session_Attendance_Report_${reportMonth}_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRowSpan = (list, index) => {
    const currentReg = list[index].registration_number;
    if (index > 0 && list[index - 1].registration_number === currentReg) {
      return 0;
    }
    let span = 1;
    for (let i = index + 1; i < list.length; i++) {
      if (list[i].registration_number === currentReg) {
        span++;
      } else {
        break;
      }
    }
    return span;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      <Header className="no-print">
        <TitleWrapper>
          <IconWrapper>
            <FileText size={48} strokeWidth={2} />
          </IconWrapper>
          <TitleContent>
            <Title>Session Attendance Report</Title>
            <Subtitle>Role-based session matrix, status verification & confirmation</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        <FilterBar className="no-print">
          <FilterGroup>
            <FilterItem>
              <Label>Month</Label>
              <Select value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </FilterItem>
            <FilterItem>
              <Label>Year</Label>
              <Select value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </FilterItem>

            {isAdmin && (
              <FilterItem style={{ width: "200px" }}>
                <Label>View Scope</Label>
                <Select value={viewScope} onChange={(e) => setViewScope(e.target.value)}>
                  <option value="all">All Sessions</option>
                  <option value="allotted">My Allotted Sessions</option>
                </Select>
              </FilterItem>
            )}

            {isTherapist && !isAdmin && (
              <FilterItem style={{ width: "200px" }}>
                <Label>View Scope</Label>
                <Select value={viewScope} onChange={(e) => setViewScope(e.target.value)}>
                  <option value="allotted">My Allotted Sessions</option>
                  <option value="all">All Sessions</option>
                </Select>
              </FilterItem>
            )}

            <FilterItem style={{ width: "240px" }}>
              <Label>Search Child / Therapy</Label>
              <SearchWrapper>
                <SearchIconWrapper>
                  <Search size={18} />
                </SearchIconWrapper>
                <SearchInput
                  type="text"
                  placeholder="Type name, reg, or therapy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchWrapper>
            </FilterItem>
          </FilterGroup>

          <ActionGroup>
            <RoleBadge>
              <Shield size={14} />
              <span>{userRole || "User"} View</span>
            </RoleBadge>

            <ActionButton onClick={fetchReportData} title="Refresh data">
              <RefreshCw size={18} />
              <span>Refresh</span>
            </ActionButton>
            <ActionButton onClick={handleExportCSV} title="Export to CSV">
              <Download size={18} />
              <span>Export CSV</span>
            </ActionButton>
            <ActionButton onClick={handlePrint} title="Print report">
              <Printer size={18} />
              <span>Print</span>
            </ActionButton>
          </ActionGroup>
        </FilterBar>

        <LegendBar className="no-print">
          <LegendItem>
            <LegendBox style={{ background: "#fef9c3", border: "1px solid #fde047" }} />
            <span>Yellow = Unconfirmed Session</span>
          </LegendItem>
          <LegendItem>
            <LegendBox style={{ background: "#dcfce7", border: "1px solid #86efac" }} />
            <span>Green = Confirmed Session</span>
          </LegendItem>
        </LegendBar>

        {loading ? (
          <LoadingState>
            <Spinner />
            <p>Fetching monthly session attendance report...</p>
          </LoadingState>
        ) : filteredData.length === 0 ? (
          <EmptyState>
            <Calendar size={64} style={{ color: "#d1d5db", marginBottom: "1rem" }} />
            <h3>No Records Found</h3>
            <p>No session attendance logs exist for the selected criteria.</p>
          </EmptyState>
        ) : (
          <>
            <TableWrapper>
              <ReportTable>
                <thead>
                  <tr>
                    <th className="sticky-col sticky-col-1">Child Name</th>
                    <th className="sticky-col sticky-col-2">Therapy</th>
                    {Array.from({ length: lastDay }, (_, i) => i + 1).map((d) => (
                      <th
                        key={d}
                        className={isWeekendDay(d) ? "weekend-hdr" : ""}
                        style={{ minWidth: "120px" }}
                      >
                        {getFullDateString(d)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((row, idx) => {
                    const span = getRowSpan(displayedData, idx);
                    return (
                      <tr key={idx}>
                        {span > 0 && (
                          <td className="sticky-col sticky-col-1 patient-name-cell" rowSpan={span}>
                            <div>{row.patient_name}</div>
                            <small>{row.registration_number}</small>
                          </td>
                        )}
                        <td className="sticky-col sticky-col-2 therapy-cell">
                          {row.therapy_name}
                        </td>
                      {Array.from({ length: lastDay }, (_, i) => i + 1).map((d) => {
                        const rawSlots = row.days[String(d)];
                        const slots = Array.isArray(rawSlots)
                          ? rawSlots
                          : (rawSlots ? [{ slot: String(rawSlots), therapist: "" }] : []);
                        const isWeekend = isWeekendDay(d);
                        return (
                          <td
                            key={d}
                            className={`${isWeekend ? "weekend-cell" : ""} ${slots.length > 0 ? "attended-cell" : ""}`}
                          >
                            {slots.length > 0 ? (
                              slots.map((item, itemIdx) => {
                                const itemTid = String(item.therapist_id || "").toLowerCase().trim();
                                const itemTname = String(item.therapist || "").toLowerCase().trim();
                                const myEmpId = String(employeeId || "").toLowerCase().trim();
                                const myName = String(employeeName || "").toLowerCase().trim();

                                const isConfirmed = Boolean(item.is_confirmed);
                                const isAllottedToMe = Boolean(
                                  (myEmpId && (itemTid === myEmpId || itemTname === myEmpId || itemTid.includes(myEmpId) || itemTname.includes(myEmpId))) ||
                                  (myName && (itemTid === myName || itemTname === myName || itemTid.includes(myName) || itemTname.includes(myName)))
                                );
                                const canConfirm = !isConfirmed && !isReceptionist && (
                                  isAdmin || (isTherapist && (isAllottedToMe || !item.therapist))
                                );

                                return (
                                  <SlotBadgeContainer key={itemIdx} isConfirmed={isConfirmed}>
                                    <StatusHeader isConfirmed={isConfirmed}>
                                      {isConfirmed ? (
                                        <>
                                          <CheckCircle size={10} />
                                          <span>Confirmed</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock size={10} />
                                          <span>Unconfirmed</span>
                                        </>
                                      )}
                                    </StatusHeader>

                                    <SlotBadge isConfirmed={isConfirmed}>{item.slot}</SlotBadge>
                                    
                                    {item.therapist && (
                                      <TherapistLabelShort title={item.therapist}>
                                        {item.therapist}
                                      </TherapistLabelShort>
                                    )}

                                    {item.session_id && (
                                      <SessionIdLabel title={`Session ID: ${item.session_id}`}>
                                        {item.session_id}
                                      </SessionIdLabel>
                                    )}

                                    {canConfirm && (
                                      <ConfirmBtn onClick={() => handleConfirmSession(item.session_id)}>
                                        <Check size={11} /> Confirm
                                      </ConfirmBtn>
                                    )}
                                  </SlotBadgeContainer>
                                );
                              })
                            ) : (
                              <span className="empty-indicator">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )})}
                </tbody>
              </ReportTable>
            </TableWrapper>

            {totalPages > 1 && (
              <PaginationWrapper className="no-print">
                <PaginationButton
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                  Previous
                </PaginationButton>
                <PageInfo>
                  Page <PageNumber>{currentPage}</PageNumber> of <PageNumber>{totalPages}</PageNumber>
                </PageInfo>
                <PaginationButton
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight size={18} />
                </PaginationButton>
              </PaginationWrapper>
            )}
          </>
        )}
      </ContentCard>
    </Container>
  );
};

export default SessionAttendanceReport;

// Styled Components
const Container = styledComponents.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: "Baloo Tamma 2", cursive, sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media print {
    padding: 0;
    background: white;
    .no-print {
      display: none !important;
    }
  }
`;

const Header = styledComponents.div`
  margin-bottom: 2rem;
`;

const TitleWrapper = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const IconWrapper = styledComponents.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #557153 0%, #406147 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(85, 113, 83, 0.2);
`;

const TitleContent = styledComponents.div``;

const Title = styledComponents.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const Subtitle = styledComponents.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const ContentCard = styledComponents.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const FilterBar = styledComponents.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterGroup = styledComponents.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterItem = styledComponents.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styledComponents.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
`;

const Select = styledComponents.select`
  padding: 0.65rem 1rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #1e293b;
  outline: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: #557153;
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.15);
  }
`;

const SearchWrapper = styledComponents.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrapper = styledComponents.div`
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styledComponents.input`
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: #557153;
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.15);
  }
`;

const ActionGroup = styledComponents.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const RoleBadge = styledComponents.div`
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButton = styledComponents.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const LegendBar = styledComponents.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  padding: 0.65rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
`;

const LegendItem = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
`;

const LegendBox = styledComponents.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
`;

const LoadingState = styledComponents.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
`;

const Spinner = styledComponents.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #557153;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styledComponents.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
  h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
`;

const TableWrapper = styledComponents.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const ReportTable = styledComponents.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;

  th, td {
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    text-align: center;
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .weekend-hdr {
    background: #fee2e2 !important;
    color: #991b1b !important;
  }

  .weekend-cell {
    background: #fff5f5 !important;
  }

  .sticky-col {
    position: sticky;
    background: white;
    z-index: 5;
  }

  .sticky-col-1 {
    left: 0;
    width: 160px;
    min-width: 160px;
    z-index: 6;
  }

  .sticky-col-2 {
    left: 160px;
    width: 150px;
    min-width: 150px;
    z-index: 6;
  }

  .patient-name-cell {
    font-weight: 700;
    color: #0f172a;
    text-align: left;
    vertical-align: top;
    background: #ffffff !important;
    border-right: 2px solid #cbd5e1 !important;
    div { font-size: 0.95rem; }
    small { font-weight: 500; color: #64748b; }
  }

  .therapy-cell {
    font-weight: 600;
    color: #334155;
    text-align: left;
    background: #f8fafc !important;
    border-right: 2px solid #cbd5e1 !important;
  }

  .attended-cell {
    vertical-align: top;
  }

  .empty-indicator {
    color: #cbd5e1;
    font-weight: 500;
  }
`;

const SlotBadgeContainer = styledComponents.div`
  background: ${props => props.isConfirmed ? '#f0fdf4' : '#fffbeb'};
  border: 1px solid ${props => props.isConfirmed ? '#86efac' : '#fde047'};
  border-radius: 8px;
  padding: 0.35rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-bottom: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusHeader = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 3px;
  color: ${props => props.isConfirmed ? '#166534' : '#b45309'};
  font-size: 0.65rem;
  font-weight: 700;
`;

const SlotBadge = styledComponents.span`
  background: ${props => props.isConfirmed ? '#dcfce7' : '#fef9c3'};
  color: ${props => props.isConfirmed ? '#166534' : '#854d0e'};
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  white-space: nowrap;
  border: 1px solid ${props => props.isConfirmed ? '#bbf7d0' : '#fef08a'};
`;

const TherapistLabelShort = styledComponents.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: #475569;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SessionIdLabel = styledComponents.div`
  font-size: 0.62rem;
  font-weight: 700;
  color: #1e3a8a;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  padding: 1px 5px;
  border-radius: 4px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConfirmBtn = styledComponents.button`
  background: linear-gradient(135deg, #166534 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 2px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
  box-shadow: 0 2px 4px rgba(22, 101, 52, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #166534;
    transform: scale(1.04);
  }
`;

const PaginationWrapper = styledComponents.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PaginationButton = styledComponents.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.disabled ? '#e2e8f0' : 'linear-gradient(135deg, #557153 0%, #406147 100%)'};
  color: ${props => props.disabled ? '#94a3b8' : 'white'};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 8px 24px rgba(85, 113, 83, 0.3)'};
  }
`;

const PageInfo = styledComponents.div`
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
`;

const PageNumber = styledComponents.span`
  color: #557153;
  font-weight: 700;
  font-size: 1.1rem;
`;
