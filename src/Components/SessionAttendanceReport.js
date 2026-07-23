import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Calendar, Search, FileText, Download, Printer, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const url = `${Milestonebaseurl}session-attendance/monthly-report/?month=${reportMonth}&year=${reportYear}`;
      const response = await apiRequest(url, "GET");

      if (response && response.success) {
        setReportData(response.data.data || []);
        setLastDay(response.data.last_day || 31);
      } else {
        toast.error(response.error || "Failed to load report data");
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
  }, [searchQuery, reportMonth, reportYear]);

  // Filter rows based on search query
  const filteredData = reportData.filter((row) => {
    const q = searchQuery.toLowerCase();
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
        const val = slots.map((s) => s.therapist ? `${s.slot} (${s.therapist})` : s.slot).join("; ") || "-";
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

  // Trigger browser print
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
            <Subtitle>Monthly matrix of children, therapies, and slots attended</Subtitle>
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
                        style={{ minWidth: "110px" }}
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
                              slots.map((item, itemIdx) => (
                                <SlotBadgeContainer key={itemIdx}>
                                  <SlotBadge>{item.slot}</SlotBadge>
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
                                </SlotBadgeContainer>
                              ))
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
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c181 0%, rgba(122, 140, 104, 1) 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media print {
    background: white !important;
    padding: 0;
    margin: 0;

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
  color: white;
`;

const IconWrapper = styledComponents.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TitleContent = styledComponents.div``;

const Title = styledComponents.h1`
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styledComponents.p`
  font-size: 1rem;
  margin: 0.4rem 0 0;
  opacity: 0.9;
`;

const ContentCard = styledComponents.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media print {
    box-shadow: none !important;
    padding: 0;
    border-radius: 0;
  }
`;

const FilterBar = styledComponents.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterGroup = styledComponents.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterItem = styledComponents.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styledComponents.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styledComponents.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f9fafb;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #557153;
    background: white;
    box-shadow: 0 0 0 4px rgba(85, 113, 83, 0.1);
  }
`;

const SearchWrapper = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchIconWrapper = styledComponents.div`
  color: #557153;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchInput = styledComponents.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f9fafb;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #557153;
    background: white;
    box-shadow: 0 0 0 4px rgba(85, 113, 83, 0.1);
  }
`;

const ActionGroup = styledComponents.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styledComponents.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const LoadingState = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: #4b5563;
  gap: 1rem;
`;

const Spinner = styledComponents.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f4f6;
  border-top: 5px solid #557153;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  text-align: center;
  color: #4b5563;

  h3 {
    margin-top: 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    color: #6b7280;
    max-width: 400px;
  }
`;

const TableWrapper = styledComponents.div`
  overflow: auto;
  max-height: 600px;
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);

  /* Webkit custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 16px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const ReportTable = styledComponents.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;

  th, td {
    padding: 0.75rem 1rem;
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
    border-right: 1px solid #f3f4f6;
    min-width: 45px;
    vertical-align: middle;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #f9fafb;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-top: none;
    border-bottom: 2px solid #e5e7eb;
  }

  /* Sticky patient columns */
  th.sticky-col, td.sticky-col {
    position: sticky;
    background-color: white;
    z-index: 10;
  }

  th.sticky-col-1, td.sticky-col-1 {
    left: 0;
    text-align: left;
    min-width: 200px;
    max-width: 250px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  }

  th.sticky-col-2, td.sticky-col-2 {
    left: 200px;
    text-align: left;
    min-width: 180px;
    max-width: 220px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.05);
  }

  /* Set higher z-index for headers */
  th.sticky-col {
    position: sticky;
    top: 0;
    z-index: 25;
    background: #f3f4f6;
  }

  tr:hover td {
    background: #f9fafb;
  }
  
  tr:hover td.sticky-col {
    background: #f9fafb;
  }

  .patient-name-cell {
    font-weight: 700;
    color: #111827;
    
    small {
      color: #6b7280;
      font-weight: 500;
      display: block;
      margin-top: 2px;
    }
  }

  .therapy-cell {
    font-weight: 600;
    color: #4b5563;
  }

  .weekend-hdr {
    background: #fee2e2;
    color: #991b1b;
  }

  .weekend-cell {
    background: #fef2f2;
  }

  .attended-cell {
    background: #f0fdf4 !important;
  }

  .empty-indicator {
    color: #d1d5db;
    font-weight: 500;
  }
`;

const SlotBadge = styledComponents.span`
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  white-space: nowrap;
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 4px rgba(22, 101, 52, 0.05);
`;

const SlotBadgeContainer = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 4px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const TherapistLabelShort = styledComponents.div`
  font-size: 0.65rem;
  font-weight: 500;
  color: #6b7280;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SessionIdLabel = styledComponents.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e3a8a;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
  padding: 1px 4px;
  border-radius: 4px;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 1px;
`;

const PaginationWrapper = styledComponents.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;

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
  background: ${props => props.disabled ? '#e5e7eb' : 'linear-gradient(135deg, #557153 0%, #406147 100%)'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
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
  color: #6b7280;
  font-weight: 500;
`;

const PageNumber = styledComponents.span`
  color: #557153;
  font-weight: 700;
  font-size: 1.1rem;
`;
