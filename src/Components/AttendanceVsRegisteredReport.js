import React, { useEffect, useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  Users,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  AlertCircle,
  TrendingUp,
  Download,
  Phone,
  User,
  ArrowRight,
  Filter
} from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const AttendanceVsRegisteredReport = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("joined"); // 'joined', 'registered', 'without_therapy_this_month', 'without_therapy_all'

  const [summary, setSummary] = useState({
    total_registered_this_month: 0,
    total_joined_this_month: 0,
    without_therapy_this_month: 0,
    without_therapy_all_time: 0,
    avg_days_to_join: 0
  });

  const [reportData, setReportData] = useState({
    joined_this_month: [],
    registered_this_month: [],
    without_therapy_this_month: [],
    without_therapy_all_time: []
  });

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
      const url = `${Milestonebaseurl}session-attendance/attendance-vs-registered/?month=${selectedMonth}&year=${selectedYear}`;
      const response = await apiRequest(url, "GET");
      if (response && response.success && response.data?.status === "success") {
        setSummary(response.data.summary || {});
        setReportData(response.data.data || {});
      } else {
        toast.error(response?.error || response?.data?.error || response?.data?.message || "Failed to load report data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  // Current active dataset
  const activeDataset = useMemo(() => {
    switch (activeTab) {
      case "joined":
        return reportData.joined_this_month || [];
      case "registered":
        return reportData.registered_this_month || [];
      case "without_therapy_this_month":
        return reportData.without_therapy_this_month || [];
      case "without_therapy_all":
        return reportData.without_therapy_all_time || [];
      default:
        return [];
    }
  }, [activeTab, reportData]);

  // Filtered by Search Query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return activeDataset;
    const term = searchQuery.toLowerCase().trim();
    return activeDataset.filter((item) => {
      const name = (item.patient_name || "").toLowerCase();
      const reg = (item.registration_number || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const guardian = (item.guardian || "").toLowerCase();
      const date = (item.registration_date || "").toLowerCase();
      const joinDate = (item.therapy_join_date || "").toLowerCase();
      return (
        name.includes(term) ||
        reg.includes(term) ||
        phone.includes(term) ||
        guardian.includes(term) ||
        date.includes(term) ||
        joinDate.includes(term)
      );
    });
  }, [activeDataset, searchQuery]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast.warning("No data available to export");
      return;
    }
    const headers = ["Reg No", "Child Name", "Guardian", "Phone", "Registered Date", "Therapy Join Date", "Source / Status", "Gap (Days)"];
    const rows = filteredData.map((item) => [
      `"${item.registration_number || ""}"`,
      `"${item.patient_name || ""}"`,
      `"${item.guardian || ""}"`,
      `"${item.phone || ""}"`,
      `"${item.registration_date || ""}"`,
      `"${item.therapy_join_date || ""}"`,
      `"${item.first_attendance_source || (item.has_therapy ? "Joined" : "Without Therapy")}"`,
      `"${item.gap_days !== null && item.gap_days !== undefined ? item.gap_days : (item.days_since_registration || "N/A")}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_vs_Registered_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      {/* HEADER SECTION */}
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <TrendingUp size={40} strokeWidth={2.5} />
          </IconWrapper>
          <TitleContent>
            <Title>Attendance vs Registered Report</Title>
            <Subtitle>Track when registered children first started therapy attendance</Subtitle>
          </TitleContent>
        </TitleWrapper>

        <HeaderActions>
          <ExportButton onClick={handleExportCSV} title="Export CSV Report">
            <Download size={18} /> Export Report
          </ExportButton>
        </HeaderActions>
      </Header>

      {/* KPI METRICS SECTION */}
      <StatsGrid>
        <StatCard color="#2563eb">
          <StatIcon bg="#dbeafe" color="#1d4ed8">
            <UserCheck size={24} />
          </StatIcon>

          <StatContent>
            <StatTitle>Joined Therapy This Month</StatTitle>

            <StatValue>{summary.total_joined_this_month || 0}</StatValue>
            <StatMeta>Started attendance in {months.find(m => m.value === selectedMonth)?.name}</StatMeta>
          </StatContent>
        </StatCard>

        <StatCard color="#16a34a">
          <StatIcon bg="#dcfce7" color="#15803d">
            <Users size={24} />
          </StatIcon>

          <StatContent>
            <StatTitle>Registered This Month</StatTitle>

            <StatValue>{summary.total_registered_this_month || 0}</StatValue>
            <StatMeta>Newly registered children</StatMeta>
          </StatContent>
        </StatCard>

        <StatCard color="#d97706">
          <StatIcon bg="#fef3c7" color="#b45309">
            <UserX size={24} />
          </StatIcon>

          <StatContent>
            <StatTitle>Without Therapy (This Month)</StatTitle>

            <StatValue>{summary.without_therapy_this_month || 0}</StatValue>
            <StatMeta>Registered this month without attendance</StatMeta>
          </StatContent>
        </StatCard>

        <StatCard color="#dc2626">
          <StatIcon bg="#fee2e2" color="#b91c1c">
            <AlertCircle size={24} />
          </StatIcon>

          <StatContent>
            <StatTitle>Without Therapy (All-Time)</StatTitle>

            <StatValue>{summary.without_therapy_all_time || 0}</StatValue>
            <StatMeta>Total registered children with no attendance</StatMeta>
          </StatContent>
        </StatCard>

        <StatCard color="#7c3aed">
          <StatIcon bg="#ede9fe" color="#6d28d9">
            <Clock size={24} />
          </StatIcon>

          <StatContent>
            <StatTitle>Avg. Days to Join Therapy</StatTitle>

            <StatValue>{summary.avg_days_to_join !== undefined ? `${summary.avg_days_to_join} Days` : "N/A"}</StatValue>
            <StatMeta>Gap from Registration to 1st Session</StatMeta>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* FILTER BAR & SEARCH */}
      <ContentCard>
        <FilterControlsRow>
          <SearchWrapper>
            <SearchIconWrapper>
              <Search size={18} color="#64748b" />
            </SearchIconWrapper>

            <SearchInput
              type="text"
              placeholder="Search by Child Name, Reg No, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>

          <FilterRightGroup>
            <FilterItem>
              <Label><Calendar size={14} style={{ marginRight: "4px" }} /> Month</Label>
              <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </FilterItem>

            <FilterItem>
              <Label>Year</Label>

              <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </FilterItem>

            <RefreshBtn onClick={fetchReportData} title="Refresh Data">
              <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
            </RefreshBtn>
          </FilterRightGroup>
        </FilterControlsRow>

        {/* TAB NAVIGATION */}
        <TabContainer>
          <TabButton
            active={activeTab === "joined"}
            onClick={() => setActiveTab("joined")}
          >
            Joined Therapy ({reportData.joined_this_month?.length || 0})
          </TabButton>

          <TabButton
            active={activeTab === "registered"}
            onClick={() => setActiveTab("registered")}
          >
            Registered This Month ({reportData.registered_this_month?.length || 0})
          </TabButton>

          <TabButton
            active={activeTab === "without_therapy_this_month"}
            onClick={() => setActiveTab("without_therapy_this_month")}
          >
            Without Therapy (This Month) ({reportData.without_therapy_this_month?.length || 0})
          </TabButton>

          <TabButton
            active={activeTab === "without_therapy_all"}
            onClick={() => setActiveTab("without_therapy_all")}
          >
            Without Therapy (All-Time) ({reportData.without_therapy_all_time?.length || 0})
          </TabButton>
        </TabContainer>

        {/* DATA TABLE */}
        {loading ? (
          <LoadingState>
            <Spinner />
            <p>Loading attendance vs registered report...</p>
          </LoadingState>
        ) : filteredData.length === 0 ? (
          <EmptyState>
            <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "0.5rem" }} />
            <h4>No records found</h4>

            <p>No matching patient records found for the selected criteria.</p>
          </EmptyState>
        ) : (
          <TableWrapper>
            <StyledTable>
              <thead>
                <tr>
                  <Th>Reg No</Th>
                  <Th>Child Name</Th>
                  <Th>Guardian & Contact</Th>
                  <Th>Registered Date</Th>
                  <Th>Therapy Join Date</Th>
                  <Th>Attendance Source / Status</Th>
                  <Th align="right">Gap / Elapsed</Th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <Tr key={index}>
                    <Td>
                      <RegBadge>{row.registration_number}</RegBadge>
                    </Td>

                    <Td>
                      <UserCell>
                        <Avatar>
                          <User size={14} />
                        </Avatar>

                        <NameText>{row.patient_name}</NameText>
                      </UserCell>
                    </Td>

                    <Td>
                      <GuardianInfo>
                        <div>{row.guardian}</div>
                        <PhoneMeta>
                          <Phone size={12} /> {row.phone}
                        </PhoneMeta>
                      </GuardianInfo>
                    </Td>

                    <Td>
                      <DateBadge color="#f1f5f9" textColor="#475569">
                        <Calendar size={13} /> {row.registration_date}
                      </DateBadge>
                    </Td>

                    <Td>
                      {row.has_therapy ? (
                        <DateBadge color="#dcfce7" textColor="#15803d">
                          <UserCheck size={13} /> {row.therapy_join_date}
                        </DateBadge>
                      ) : (
                        <DateBadge color="#fef3c7" textColor="#b45309">
                          <Clock size={13} /> Not Joined Yet
                        </DateBadge>
                      )}
                    </Td>

                    <Td>
                      {row.has_therapy ? (
                        <SourceBadge type={row.first_attendance_source}>
                          {row.first_attendance_source || "Joined"}
                        </SourceBadge>
                      ) : (
                        <StatusWithoutBadge>
                          Without Therapy
                        </StatusWithoutBadge>
                      )}
                    </Td>

                    <Td align="right">
                      {row.gap_days !== null && row.gap_days !== undefined ? (
                        <GapBadge gap={row.gap_days}>
                          {row.gap_days === 0 ? "Same Day" : `${row.gap_days} Days`}
                        </GapBadge>
                      ) : row.days_since_registration !== undefined ? (
                        <ElapsedBadge>
                          {row.days_since_registration} Days Ago
                        </ElapsedBadge>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </StyledTable>
          </TableWrapper>
        )}
      </ContentCard>
    </Container>
  );
};

export default AttendanceVsRegisteredReport;

/* ──────────────────────────────────────────────────────────────
   STYLED COMPONENTS
   ────────────────────────────────────────────────────────────── */

const fadeIn = keyframes` from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } `;
const spin = keyframes` from { transform: rotate(0deg); } to { transform: rotate(360deg); } `;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c181 0%, rgba(122, 140, 104, 1) 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: white;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const TitleContent = styled.div``;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
  color: #f1f5f9;
`;

const HeaderActions = styled.div``;

const ExportButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  color: #166534;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
`;

/* Stats Grid */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${({ color }) => color || "#2563eb"};
  animation: ${fadeIn} 0.4s ease-out;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ bg }) => bg || "#f1f5f9"};
  color: ${({ color }) => color || "#334155"};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
`;

const StatMeta = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

/* Content Card */
const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: ${fadeIn} 0.5s ease-out;
`;

const FilterControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
  max-width: 420px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #a1c181;
    box-shadow: 0 0 0 3px rgba(161, 193, 129, 0.2);
    background: #ffffff;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  padding: 10px 10px 10px 38px;
  width: 100%;
  font-size: 0.9rem;
  color: #0f172a;

  &::placeholder {
    color: #94a3b8;
  }
`;

const FilterRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: white;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #a1c181;
  }
`;

const RefreshBtn = styled.button`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

/* Tab Bar */
const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const TabButton = styled.button`
  background: ${({ active }) => (active ? "#3f6212" : "transparent")};
  color: ${({ active }) => (active ? "#ffffff" : "#64748b")};
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ active }) => (active ? "#3f6212" : "#f1f5f9")};
    color: ${({ active }) => (active ? "#ffffff" : "#0f172a")};
  }
`;

/* Table Styles */
const TableWrapper = styled.div`
  max-height: 65vh;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 6px;
    border: 2px solid #f1f5f9;

    &:hover {
      background: #64748b;
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: ${({ align }) => align || "left"};
  padding: 1rem 1.2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8fafc;
  color: #3f6212;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const Td = styled.td`
  padding: 0.9rem 1.2rem;
  color: #334155;
  font-size: 0.9rem;
  text-align: ${({ align }) => align || "left"};
`;

const RegBadge = styled.span`
  background: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: monospace;
  font-weight: 700;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  background: #dcfce7;
  color: #15803d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NameText = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

const GuardianInfo = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 500;
  color: #334155;
`;

const PhoneMeta = styled.span`
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const DateBadge = styled.span`
  background: ${({ color }) => color || "#f1f5f9"};
  color: ${({ textColor }) => textColor || "#334155"};
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const SourceBadge = styled.span`
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
`;

const StatusWithoutBadge = styled.span`
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
`;

const GapBadge = styled.span`
  background: ${({ gap }) => (gap === 0 ? "#dcfce7" : gap <= 7 ? "#e0f2fe" : "#fef3c7")};
  color: ${({ gap }) => (gap === 0 ? "#15803d" : gap <= 7 ? "#0369a1" : "#b45309")};
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
`;

const ElapsedBadge = styled.span`
  background: #fee2e2;
  color: #b91c1c;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-weight: 600;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid #e2e8f0;
  border-top-color: #a1c181;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
  h4 {
    margin: 0 0 4px;
    color: #334155;
    font-weight: 700;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;
