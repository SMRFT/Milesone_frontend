import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { RefreshCcw } from "lucide-react"; // Assuming you use lucide-react for icons
import apiRequest from "./apiRequest";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const PatientOldAttendance = () => {
  const currentDate = new Date();
  
  // State Management
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdown Options
  const years = Array.from(new Array(5), (val, index) => currentDate.getFullYear() - index);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  // Helper: Safely parse age JSON
  const parseAge = (ageInput) => {
    try {
      if (!ageInput) return "N/A";
      if (typeof ageInput === 'object') {
          return `${ageInput.year}Y ${ageInput.months}M`;
      }
      const ageObj = JSON.parse(ageInput);
      return `${ageObj.year}Y ${ageObj.months}M`;
    } catch (e) {
      return "Invalid Age";
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // API Fetch Logic
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const baseUrl = Milestonebaseurl?.endsWith('/') ? Milestonebaseurl : `${Milestonebaseurl}/`;
      const url = `${baseUrl}get_all_patient_oldattendance/?month=${selectedMonth}&year=${selectedYear}`;
      
      console.log("Fetching URL:", url); 
      
      const response = await apiRequest(url, "GET");
      
      let finalData = [];

      // Logic to handle different response structures (Axios vs Fetch vs Direct JSON)
      if (response && response.status === "success" && Array.isArray(response.data)) {
          finalData = response.data;
      } else if (response && response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
          finalData = response.data.data;
      } else if (Array.isArray(response)) {
          finalData = response;
      } else {
          console.warn("Logic: Could not extract data or status check failed.");
          finalData = [];
      }

      setAttendanceData(finalData);

    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch data. Please try again.");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          </IconWrapper>
          <TitleContent>
            <Title>Old Attendance Report</Title>
            <Subtitle>Manage and view historical patient attendance records</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        {/* Filters Section */}
        <SearchSection style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <FilterWrapper>
                    <label style={{ marginRight: '8px', fontSize: '14px', color: '#666', fontWeight: '600' }}>Month:</label>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', color: '#333', cursor: 'pointer' }}
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </FilterWrapper>

                <FilterWrapper>
                    <label style={{ marginRight: '8px', fontSize: '14px', color: '#666', fontWeight: '600' }}>Year:</label>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', color: '#333', cursor: 'pointer' }}
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </FilterWrapper>
            </div>

            <ResetButton onClick={fetchAttendance}>
                <RefreshCcw size={16} />
                Refresh Data
            </ResetButton>
        </SearchSection>

        {error && (
            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
            </div>
        )}

        <ResultCount>
            Total Records Found: <strong>{attendanceData.length}</strong>
        </ResultCount>

        <TableWrapper>
          {loading ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading records...</div>
          ) : attendanceData.length === 0 ? (
             <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                 No records found for {months[selectedMonth-1]?.label} {selectedYear}.
             </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <Th>Reg. No</Th>
                  <Th>Patient Details</Th>
                  <Th>Contact Info</Th>
                  <Th>Date</Th>
                  <Th>Session</Th>
                  <Th>Therapy Details</Th>
                  <Th>Charge</Th>
                  <Th align="center">Status</Th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item, index) => {
                  const child = item.child_details || {};
                  const att = item.attendance_details || {};
                  const rowKey = att._id || `${item.registration_number}-${index}`;

                  return (
                    <PatientRow key={rowKey}>
                      <Td><strong>{item.registration_number}</strong></Td>
                      <Td>
                        <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '15px' }}>{child.name_of_child || "N/A"}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                            {child.sex}, {parseAge(child.age)}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{child.mother_name || child.father_name || "N/A"}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                            {child.phone_number || child.mother_phone_number || child.father_phone_number || "-"}
                        </div>
                      </Td>
                      <Td>{formatDate(att.date)}</Td>
                      <Td>{att.session}</Td>
                      <Td>
                        {att.therapy_details && att.therapy_details.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '13px', color: '#4b5563' }}>
                                {att.therapy_details.map((t, i) => (
                                    <li key={i} style={{ marginBottom: '4px' }}>
                                        {t.therapy_name} <span style={{ opacity: 0.7, fontSize: '12px' }}>({t.therapy_type})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                        )}
                      </Td>
                      <Td>
                        <div style={{ fontWeight: '700', color: '#1f2937' }}>₹{att.therapy_charge}</div>
                        {att.discount > 0 && (
                            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>Disc: ₹{att.discount}</div>
                        )}
                      </Td>
                      <Td align="center">
                        {att.is_active ? (
                            <StatusBadgeApproved>Active</StatusBadgeApproved>
                        ) : (
                            <span style={{ 
                                backgroundColor: '#fef2f2', 
                                color: '#ef4444', 
                                padding: '0.35rem 0.75rem', 
                                borderRadius: '12px', 
                                fontSize: '0.8rem', 
                                fontWeight: '700',
                                border: '1px solid #fecaca',
                                display: 'inline-block'
                            }}>
                                Inactive
                            </span>
                        )}
                      </Td>
                    </PatientRow>
                  );
                })}
              </tbody>
            </StyledTable>
          )}
        </TableWrapper>
      </ContentCard>
    </Container>
  );
};

export default PatientOldAttendance;

// --- STYLED COMPONENTS (Your Provided Theme) ---

const Container = styled.div` min-height: 100vh; background: linear-gradient(135deg, #b9cfa3ff 0%, #bdda9eff 100%); padding: 2rem; @media (max-width: 768px) { padding: 1rem; }`;
const Header = styled.div` margin-bottom: 2rem;`;
const TitleWrapper = styled.div` display: flex; align-items: center; gap: 1.5rem; color: white;`;
const IconWrapper = styled.div` background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 1rem; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);`;
const TitleContent = styled.div``;
const Title = styled.h1` font-size: 2.5rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; @media (max-width: 768px) { font-size: 1.75rem; }`;
const Subtitle = styled.p` font-size: 1.05rem; margin: 0.5rem 0 0; opacity: 0.95;`;
const ContentCard = styled.div` background: white; border-radius: 24px; padding: 2rem; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); @media (max-width: 768px) { padding: 1.25rem; border-radius: 16px; }`;
const SearchSection = styled.div` display: flex; flex-direction: column; align-items: center; width: 100%; margin: 20px 0; gap: 10px;`;
const FilterWrapper = styled.div` position: relative; display: flex; align-items: center; background: #fff; border: 1px solid #ccc; border-radius: 10px; padding: 8px 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);`;
const ResetButton = styled.button` display: flex; align-items: center; gap: 4px; padding: 0.75rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; &:hover { background: #e5e7eb; } svg { width: 16px; height: 16px; }`;
const ResultCount = styled.div` color: #6b7280; font-size: 0.95rem; margin-bottom: 1rem; strong { color: #839770ff; font-weight: 700; }`;
const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  &::-webkit-scrollbar { width: 8px; height: 8px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
const Th = styled.th`
  padding: 1rem 1.5rem;
  text-align: ${({ align }) => align || "left"};
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  position: sticky; 
  top: 0; 
  background: #f9fafb;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;
const StyledTable = styled.table` width: 100%; border-collapse: collapse;`;
const PatientRow = styled.tr` cursor:pointer; &:nth-child(even) { background-color: #f9fafb; } &:hover { background: #eef4e9ff; transition: background 0.3s ease; }`;
const Td = styled.td` padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; color: #374151; vertical-align: middle;`;
const StatusBadgeApproved = styled.span` background-color: #f4fdeaff; color: #748d5cff; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 12px; font-size: 0.8rem; border: 1px solid #b9d89aff; display: inline-block;`;