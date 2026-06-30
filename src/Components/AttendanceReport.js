import React, { useEffect, useState } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import {
  Users,
  Printer,
  FileText,
  RotateCcw,
  Eye,
  ChevronUp,
  AlertCircle,
  CheckCircle
} from "react-feather";
import * as XLSX from "xlsx";

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const baseUrl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  // ---------- HELPER: CURRENCY ----------
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  
  const parseJSON = (value) => {
    try {
      if (typeof value === "string") return JSON.parse(value);
      return value;
    } catch (e) {
      return [];
    }
  };

  // ---------- FETCH ----------
  useEffect(() => {
    const fetchAttendance = async () => {
try {
        setLoading(true); // Ensure loading state is active

        // ✅ 2. Extract Year and Month from the input value (YYYY-MM)
        const [year, month] = filterMonth.split("-");

        // ✅ 3. Append params to URL
        const res = await apiRequest(
          `${baseUrl}get_all_patient_attendance/?month=${month}&year=${year}`, 
          "GET"
        );
        

        let data = [];
        if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res)) {
          data = res;
        }

        const cleaned = data.map((item) => ({
          ...item,
          reason_for_visit: parseJSON(item.reason_for_visit),
          therapy_details: parseJSON(item.therapy_details),
          not_attending_details: parseJSON(item.not_attending_details),
          extra_attending_details: parseJSON(item.extra_attending_details),
          consultant_doctor: parseJSON(item.consultant_doctor),
          source_of_referral: parseJSON(item.source_of_referral),
          age: parseJSON(item.age)
        }));

        setAttendance(cleaned);
        setFilteredAttendance(cleaned);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load attendance");
        setAttendance([]);
        setFilteredAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [baseUrl, filterMonth]);

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
          (a.registration_number && a.registration_number.toLowerCase().includes(lowerTerm)) ||
          (a.name_of_child && a.name_of_child.toLowerCase().includes(lowerTerm))
      );
    }

    // Month filter
    if (filterMonth) {
      filtered = filtered.filter((a) => {
        const targetDate = a.attendance_date || a.date; 
        if (!targetDate) return false;
        const rec = new Date(targetDate);
        const recYM = `${rec.getFullYear()}-${String(rec.getMonth() + 1).padStart(2, "0")}`;
        return recYM === filterMonth;
      });
    }

    setFilteredAttendance(filtered);
  }, [searchTerm, filterMonth, attendance]);

  // ---------- TOTAL ----------
  const totalReportRevenue = filteredAttendance.reduce(
    (sum, a) => sum + (a.total_amount || 0), // Use total_amount (final) instead of therapy_charge (base)
    0
  );

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
      ? new Date(filterMonth + "-01").toLocaleDateString(undefined, { year: "numeric", month: "long" })
      : "All Records";
    
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
            <title>Attendance Report</title>
            <style>
                body { font-family: sans-serif; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .amount { text-align: right; }
            </style>
        </head>
        <body>
          <h2>Attendance Report - ${periodLabel}</h2>
          <table>
            <thead>
              <tr><th>Reg No</th><th>Name</th><th>Date</th><th>Session</th><th class="amount">Total Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${filteredAttendance.map(a => `
                <tr>
                  <td>${a.registration_number}</td>
                  <td>${a.name_of_child}</td>
                  <td>${new Date(a.attendance_date || a.date).toLocaleDateString()}</td>
                  <td>${a.session}</td>
                  <td class="amount">${a.total_amount}</td>
                  <td>${a.is_approved === false ? "Not Approved" : "Approved"}</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align:right; font-weight:bold;">Total:</td>
                    <td class="amount" style="font-weight:bold;">${totalReportRevenue}</td>
                    <td></td>
                </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // ---------- EXPORT ----------
  const handleExport = () => {
    const exportData = filteredAttendance.map((a, i) => ({
      "SL No": i + 1,
      "Registration No": a.registration_number,
      Name: a.name_of_child,
      "Attendance Date": new Date(a.attendance_date || a.date).toLocaleDateString(),
      Session: a.session,
      "Base Charge": a.therapy_charge,
      "Not Attending": a.not_attending,
      "Extra Attending": a.extra_attending,
      "Final Amount": a.total_amount,
      "Status": a.is_approved === false ? "Not Approved" : "Approved",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_report_${filterMonth || "All"}.xlsx`);
  };

  if (loading) return <LoadingText>Loading attendance records...</LoadingText>;

  const monthRangeDisplay = filterMonth
    ? new Date(filterMonth + "-01").toLocaleDateString(undefined, { year: "numeric", month: "long" })
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", width: "100%", justifyContent: "center", alignItems: "center" }}>
            <FilterWrapper style={{ minWidth: "300px" }}>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Reg No or Name"
              />
            </FilterWrapper>

            <FilterWrapper>
              <SearchInput
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </FilterWrapper>
            <ResetButton onClick={handleResetFilters}>
              <RotateCcw size={16} /> Reset
            </ResetButton>
          </div>
        </SearchSection>

        <ResultCount>
          Showing <strong>{filteredAttendance.length}</strong> records for <strong>{monthRangeDisplay}</strong>
        </ResultCount>

        {filteredAttendance.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No Records Found</EmptyTitle>
            <EmptyText>No attendance found for <b>{monthRangeDisplay}</b>.</EmptyText>
          </EmptyState>
        ) : (
          <>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <ActionButton onClick={handlePrint} print><Printer size={16} /> Print</ActionButton>
              <ActionButton onClick={handleExport} export><FileText size={16} /> Export Excel</ActionButton>
            </div>

            <TableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <Th>SL No</Th>
                    <Th>Reg No</Th>
                    <Th>Name</Th>
                    <Th>Att. Date</Th>
                    <Th>Session</Th>
                    <Th style={{textAlign:'right'}}>Total Amount</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: "center" }}>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((a, index) => (
                    <React.Fragment key={a._id || index}>
                      <PatientRow onClick={() => setOpenRow(openRow === a._id ? null : a._id)}>
                        <Td>{index + 1}</Td>
                        <Td><b>{a.registration_number}</b></Td>
                        <Td>{a.name_of_child}</Td>
                        <Td>{new Date(a.attendance_date || a.date).toLocaleDateString()}</Td>
                        <Td>{a.session}</Td>
                        <Td style={{textAlign:'right', fontWeight:'bold', color: '#166534'}}>{formatCurrency(a.total_amount)}</Td>
                        <Td>
                          {a.is_approved === false ? (
                            <StatusBadgeNotApproved>Not Approved</StatusBadgeNotApproved>
                          ) : (
                            <StatusBadgeApproved>Approved</StatusBadgeApproved>
                          )}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <ViewBtn 
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenRow(openRow === a._id ? null : a._id);
                            }} 
                            $isActive={openRow === a._id}
                          >
                            {openRow === a._id ? <ChevronUp size={14} /> : <Eye size={14} />}
                            {openRow === a._id ? "Close" : "View"}
                          </ViewBtn>
                        </Td>
                      </PatientRow>

                      {/* --- EXPANDED DETAILS --- */}
                      {openRow === a._id && (
                        <tr>
                          <td colSpan="8" style={{ padding: 0, borderBottom: 'none' }}>
                            <ExpandedContainer>
                                <DetailGrid>
                                    
                                    {/* Column 1: Patient Info */}
                                    <InfoCard>
                                        <h4>Patient Information</h4>
                                        <InfoRow><strong>Parent:</strong> {a.father_name} / {a.mother_name}</InfoRow>
                                        <InfoRow><strong>Phone:</strong> {a.phone_number}</InfoRow>
                                        <InfoRow><strong>Address:</strong> {a.address}</InfoRow>
                                        <InfoRow><strong>Age:</strong> {a.age?.year} Yrs {a.age?.months} Mths</InfoRow>
                                    </InfoCard>

                                    {/* Column 2: Financial Breakdown */}
                                    <TherapyCard>
                                        <h4>Session & Financial Breakdown</h4>
                                        
                                        {/* 1. Base Therapies */}
                                        <SectionHeader>Scheduled Therapies (Base)</SectionHeader>
                                        <MiniTable>
                                            <thead>
                                                <tr>
                                                    <th>Therapy</th>
                                                
                                                    <th align="right">Charge</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {a.therapy_details && a.therapy_details.map((t, i) => (
                                                    <tr key={i}>
                                                        <td>{t.therapy_name}</td>
                                                  
                                                        <td align="right">{formatCurrency(t.therapy_charge)}</td>
                                                    </tr>
                                                ))}
                                                <tr style={{background:'#f8fafc', fontWeight:'bold'}}>
                                                    <td colSpan="1" align="right">Base Total:</td>
                                                    <td align="right">{formatCurrency(a.therapy_charge)}</td>
                                                </tr>
                                            </tbody>
                                        </MiniTable>

                                        {/* 2. Not Attending (If any) */}
                                        {a.not_attending_details && a.not_attending_details.length > 0 && (
                                            <>
                                                <SectionHeader color="#dc2626"><AlertCircle size={14}/> Not Attending (Deductions)</SectionHeader>
                                                <MiniTable style={{borderColor: '#fca5a5'}}>
                                                    <thead>
                                                        <tr style={{background:'#fef2f2'}}><th>Therapy</th><th align="center">Sessions Missed</th><th align="right">Deduction</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {a.not_attending_details.map((n, i) => (
                                                            <tr key={i}>
                                                                <td>{n.therapy_name}</td>
                                                                <td align="center">{n.sessions}</td>
                                                                <td align="right" style={{color:'#dc2626'}}>- {formatCurrency(n.total_amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </MiniTable>
                                                <RemarksText><strong>Reason:</strong> {a.not_attending_remarks || "N/A"}</RemarksText>
                                            </>
                                        )}

                                        {/* 3. Extra Attending (If any) */}
                                        {a.extra_attending_details && a.extra_attending_details.length > 0 && (
                                            <>
                                                <SectionHeader color="#16a34a"><CheckCircle size={14}/> Extra Attending (Additions)</SectionHeader>
                                                <MiniTable style={{borderColor: '#86efac'}}>
                                                    <thead>
                                                        <tr style={{background:'#f0fdf4'}}><th>Therapy</th><th align="center">Extra Sessions</th><th align="right">Addition</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {a.extra_attending_details.map((e, i) => (
                                                            <tr key={i}>
                                                                <td>{e.therapy_name}</td>
                                                                <td align="center">{e.sessions}</td>
                                                                <td align="right" style={{color:'#16a34a'}}>+ {formatCurrency(e.total_amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </MiniTable>
                                                <RemarksText><strong>Reason:</strong> {a.extra_attending_remarks || "N/A"}</RemarksText>
                                            </>
                                        )}

                                        {/* Final Calculation Summary Box */}
                                        <FinalCalculationBox>
                                            <div className="row"><span>Base Charge:</span> <span>{formatCurrency(a.therapy_charge)}</span></div>
                                            {a.not_attending > 0 && <div className="row deduction"><span>Less: Not Attending</span> <span>- {formatCurrency(a.not_attending)}</span></div>}
                                            {a.extra_attending > 0 && <div className="row addition"><span>Add: Extra Attending</span> <span>+ {formatCurrency(a.extra_attending)}</span></div>}
                                            <div className="divider"></div>
                                            <div className="row total"><span>Final Total Amount:</span> <span>{formatCurrency(a.total_amount)}</span></div>
                                        </FinalCalculationBox>

                                    </TherapyCard>
                                </DetailGrid>
                            </ExpandedContainer>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>

            <TotalSummary>
              <TotalCard>
                <div>
                  <TotalLabel>Total Revenue (Selected Month)</TotalLabel>
                  <TotalAmount>{formatCurrency(totalReportRevenue)}</TotalAmount>
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
   STYLED COMPONENTS
   ────────────────────────────────────────────────────────────── */
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
const SearchInput = styled.input` width: 100%; padding: 10px 12px; border: none; outline: none; font-size: 15px; color: #333; background: transparent; &::placeholder { color: #999; }`;
const ResetButton = styled.button` display: flex; align-items: center; gap: 4px; padding: 0.75rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; &:hover { background: #e5e7eb; } svg { width: 16px; height: 16px; }`;
const ResultCount = styled.div` color: #6b7280; font-size: 0.95rem; margin-bottom: 1rem; strong { color: #839770ff; font-weight: 700; }`;
const TableWrapper = styled.div`
  overflow-x: auto;
  
  /* ADDED: Vertical Scroll Logic */
  overflow-y: auto;
  max-height: 600px; /* Adjust this value to control table height */
  
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;

  /* ADDED: Custom Scrollbar Styling for a cleaner look */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Th = styled.th`
  padding: 1rem 1.5rem;
  text-align: ${({ align }) => align || "left"};
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  
  /* ADDED: Sticky Header Logic */
  position: sticky; 
  top: 0; 
  background: #f9fafb; /* Must have background or rows will show through */
  z-index: 10; /* Keeps header on top of content */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* Optional: Adds a subtle line under the header */
`;
const StyledTable = styled.table` width: 100%; border-collapse: collapse;`;

const PatientRow = styled.tr` cursor:pointer; &:nth-child(even) { background-color: #f9fafb; } &:hover { background: #eef4e9ff; transition: background 0.3s ease; }`;
const Td = styled.td` padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; color: #374151; vertical-align: middle;`;
const StatusBadgeApproved = styled.span` background-color: #f4fdeaff; color: #748d5cff; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 12px; font-size: 0.8rem; border: 1px solid #b9d89aff; display: inline-block;`;
const StatusBadgeNotApproved = styled.span` background-color: #fee2e2; color: #991b1b; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 12px; font-size: 0.8rem; border: 1px solid #ef4444; display: inline-block;`;
const TotalSummary = styled.div` display: flex; justify-content: flex-end; margin-top: 1rem;`;
const TotalCard = styled.div` display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #a1c181 0%, #a1c181 100%); color: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);`;
const TotalLabel = styled.div` font-size: 0.9rem; opacity: 0.9; margin-bottom: 2px;`;
const TotalAmount = styled.div` font-size: 1.5rem; font-weight: 700;`;
const ActionButton = styled.button` display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease; ${({ print }) => print && ` background:#dbeafe; color:#1e40af; &:hover {background:#bfdbfe; transform:translateY(-2px);} `} ${({ export: exp }) => exp && ` background:#dbeafe; color:#1e40af; &:hover {background:#bfdbfe; transform:translateY(-2px);} `} svg {width:16px;height:16px;}`;
const EmptyState = styled.div` text-align: center; padding: 4rem 2rem;`;
const EmptyTitle = styled.h3` font-size: 1.5rem; color: #374151; margin: 0 0 0.5rem; font-weight: 700;`;
const EmptyText = styled.p` color: #6b7280; font-size: 1rem; margin: 0;`;
const LoadingText = styled.p` text-align: center; color: white; font-size: 1.2rem; padding: 2rem;`;

const ViewBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px; border: none; padding: 6px 12px;
  border-radius: 20px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;
  background: #e0e7ff; color: #4338ca;
  &:hover { background: #c7d2fe; transform: translateY(-1px); }
  ${({ $isActive }) => $isActive && ` background: #f3f4f6; color: #374151; &:hover { background: #e5e7eb; } `}
`;

const ExpandedContainer = styled.div`
  background-color: #f8fafc; padding: 1.5rem; border-bottom: 2px solid #e2e8f0;
  box-shadow: inset 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const DetailGrid = styled.div`
  display: grid; grid-template-columns: 300px 1fr; gap: 2rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const InfoCard = styled.div`
  h4 { margin: 0 0 1rem 0; color: #4b5563; font-size: 1rem; border-bottom: 2px solid #a1c181; padding-bottom: 0.5rem; display: inline-block;}
`;
const InfoRow = styled.div` margin-bottom: 0.5rem; font-size: 0.95rem; color: #374151; strong { color: #555; }`;

const TherapyCard = styled.div` h4 { margin: 0 0 1.5rem 0; color: #4b5563; font-size: 1.1rem; }`;
const SectionHeader = styled.div` 
    font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: ${({color}) => color || '#64748b'}; 
    margin-bottom: 8px; margin-top: 16px; display: flex; align-items: center; gap: 6px;
`;

const MiniTable = styled.table`
  width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
  th { background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 8px 12px; text-align: left; font-weight: 700; text-transform: uppercase;}
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334151; }
  tr:last-child td { border-bottom: none; }
`;

const RemarksText = styled.p` font-size: 0.85rem; color: #64748b; margin: 4px 0 0 4px; font-style: italic;`;

const FinalCalculationBox = styled.div`
    margin-top: 20px; background: #f1f5f9; padding: 15px; border-radius: 8px;
    .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem; color: #475569;}
    .deduction { color: #dc2626; }
    .addition { color: #16a34a; }
    .divider { height: 1px; background: #cbd5e1; margin: 10px 0; }
    .total { font-weight: 800; color: #0f172a; font-size: 1.1rem; }
`;

export default AttendanceReport;