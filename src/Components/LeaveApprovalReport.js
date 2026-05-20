import React, { useEffect, useState } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import {
  FileText,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RotateCcw
} from "lucide-react";
import * as XLSX from "xlsx";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const LeaveApprovalReport = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const parseJSON = (value) => {
    try {
      if (typeof value === "string") return JSON.parse(value);
      return value;
    } catch (e) {
      return value;
    }
  };

  const fetchLeavesReport = async () => {
    try {
      setLoading(true);
      let url = `${Milestonebaseurl}get-leaves-report/?start_date=${startDate}&end_date=${endDate}`;
      
      const response = await apiRequest(url, "GET");
      
      if (response.success && response.data.status === "success") {
        const cleanedData = (response.data.data || []).map(item => ({
          ...item,
          age: parseJSON(item.age),
          reason_for_visit: parseJSON(item.reason_for_visit),
          source_of_referral: parseJSON(item.source_of_referral)
        }));
        setLeaves(cleanedData);
        setFilteredLeaves(cleanedData);
      } else {
        toast.error(response.error || "Failed to fetch leave report");
      }
    } catch (err) {
      toast.error("Error loading leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesReport();
  }, [startDate, endDate]);

  // Combined client-side filtering for Search and Status
  useEffect(() => {
    const filtered = leaves.filter(item => {
      const matchSearch = 
        (item.name_of_child?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === "All" || item.leave_details.leave_status === statusFilter;
      
      return matchSearch && matchStatus;
    });
    setFilteredLeaves(filtered);
  }, [searchTerm, statusFilter, leaves]);

  const handleReset = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setStatusFilter("All");
    setSearchTerm("");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Leave Approval Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #1e293b; margin-bottom: 5px; }
            p.meta { text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; }
            .status { font-weight: 600; padding: 2px 6px; border-radius: 4px; }
            .status-approved { background: #dcfce7; color: #15803d; }
            .status-rejected { background: #fee2e2; color: #b91c1c; }
            .status-pending { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <h2>Leave Approval Report</h2>
          <p class="meta">Period: ${startDate} to ${endDate} | Status: ${statusFilter}</p>
          <table>
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Name</th>
                <th>Leave Date</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Remark (if Rejected)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLeaves.map(item => `
                <tr>
                  <td>${item.registration_number}</td>
                  <td>
                    <strong>${item.name_of_child}</strong><br/>
                    <small>${item.age ? `${item.age.year}Y ${item.age.months}M` : 'N/A'} • ${item.sex}</small>
                  </td>
                  <td>${item.leave_details.leave_date}</td>
                  <td><span class="status ${item.leave_details.leave_status === 'Approved' ? 'status-approved' : item.leave_details.leave_status === 'Rejected' ? 'status-rejected' : 'status-pending'}">${item.leave_details.leave_status}</span></td>
                  <td>${item.leave_details.leave_reason || "-"}</td>
                  <td>${item.leave_details.leave_reject_comments || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <p style="margin-top: 30px; font-size: 0.75rem; color: #94a3b8; text-align: center;">Generated on ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  const handleExportExcel = () => {
    const data = filteredLeaves.map((item, index) => ({
      "S.No": index + 1,
      "Registration Number": item.registration_number,
      "Name": item.name_of_child,
      "Details (Age/Sex)": `${item.age ? `${item.age.year}Y ${item.age.months}M` : 'N/A'} • ${item.sex}`,
      "Leave Date": item.leave_details.leave_date,
      "Leave Status": item.leave_details.leave_status,
      "Leave Reason": item.leave_details.leave_reason || "",
      "Approved By": item.leave_details.leave_approved_by || "",
      "Approved Date": item.leave_details.leave_approved_date || "",
      "Rejection Comment": item.leave_details.leave_reject_comments || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");
    XLSX.writeFile(workbook, `Leave_Report_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <Container>
      <Header>
        <div className="title-section">
          <h1>Leave Management Report</h1>
          <p>Comprehensive overview of student leave requests and approvals</p>
        </div>
        <ActionButtons>
          <ExportBtn onClick={handleExportExcel} className="excel">
            <Download size={18} />
            <span>Export Excel</span>
          </ExportBtn>
          <ExportBtn onClick={handlePrint} className="print">
            <Printer size={18} />
            <span>Print Report</span>
          </ExportBtn>
        </ActionButtons>
      </Header>

      <FiltersSection>
        <div className="filter-grid">
          <div className="filter-item">
            <label>Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="filter-item">
            <label>End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className="filter-item">
            <label>Status Filter</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>
          <div className="filter-item search">
            <label>Search Student</label>
            <SearchInputWrapper>
              <Search size={16} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Name or Reg No..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </div>
          <div className="filter-item reset">
            <label>&nbsp;</label>
            <ResetBtn onClick={handleReset}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </ResetBtn>
          </div>
        </div>
      </FiltersSection>

      {loading ? (
        <LoadingState>
          <Spinner />
          <p>Generating report data...</p>
        </LoadingState>
      ) : filteredLeaves.length === 0 ? (
        <EmptyState>
          <Clock size={48} color="#cbd5e1" />
          <h3>No Leave Records Found</h3>
          <p>Adjust your filters or dates to see more results</p>
        </EmptyState>
      ) : (
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Details</th>
                <th>Leave Date</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Admin Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((item, index) => (
                <tr key={index}>
                  <td>
                    <RegBadge>#{item.registration_number}</RegBadge>
                  </td>
                  <td>
                    <StudentInfo>
                      <span className="name">{item.name_of_child}</span>
                      <span className="meta">{item.age?.year}Y {item.age?.months}M • {item.sex}</span>
                    </StudentInfo>
                  </td>
                  <td>
                    <DateVal>{item.leave_details.leave_date}</DateVal>
                  </td>
                  <td>
                    <StatusBadge status={item.leave_details.leave_status}>
                        {item.leave_details.leave_status === "Approved" && <CheckCircle size={14} />}
                        {item.leave_details.leave_status === "Rejected" && <XCircle size={14} />}
                        {item.leave_details.leave_status === "Pending" && <Clock size={14} />}
                        <span>{item.leave_details.leave_status}</span>
                    </StatusBadge>
                  </td>
                  <td>
                    <WrappedText title={item.leave_details.leave_reason}>
                      {item.leave_details.leave_reason || "-"}
                    </WrappedText>
                  </td>
                  <td>
                    <WrappedText title={item.leave_details.leave_reject_comments}>
                      {item.leave_details.leave_reject_comments || "-"}
                    </WrappedText>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <ResultSummary>
            Showing {filteredLeaves.length} records for the selected period
          </ResultSummary>
        </TableWrapper>
      )}
    </Container>
  );
};

// --- STYLES ---

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  @media (max-width: 900px) { flex-direction: column; gap: 1.5rem; }

  h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
  p { color: #64748b; font-size: 1rem; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.excel { background: #dcfce7; color: #15803d; &:hover { background: #bbf7d0; transform: translateY(-2px); } }
  &.print { background: #e0f2fe; color: #0369a1; &:hover { background: #bae6fd; transform: translateY(-2px); } }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  margin-bottom: 2rem;

  .filter-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
  }

  .search { flex: 1; min-width: 250px; }
`;

const Input = styled.input`
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  &:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
`;

const Select = styled.select`
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  outline: none;
  &:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.75rem;
  &:focus-within { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
  input { border: none; padding: 0.6rem 0; width: 100%; outline: none; }
`;

const ResetBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);

  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  
  th {
    background: #f8fafc;
    text-align: left;
    padding: 1rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 2px solid #f1f5f9;
  }
  
  td { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
`;

const RegBadge = styled.span`
  background: #f0fdf4;
  color: #166534;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
`;

const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
  .name { font-weight: 600; color: #0f172a; }
  .meta { font-size: 0.8rem; color: #64748b; }
`;

const DateVal = styled.span`
  font-weight: 500;
  color: #334151;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  
  ${props => props.status === 'Approved' && `background: #dcfce7; color: #15803d;`}
  ${props => props.status === 'Rejected' && `background: #fee2e2; color: #b91c1c;`}
  ${props => props.status === 'Pending' && `background: #fef3c7; color: #92400e;`}
`;

const WrappedText = styled.div`
  max-width: 250px;
  font-size: 0.85rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSummary = styled.div`
  padding: 1rem 1.25rem;
  background: #f8fafc;
  font-size: 0.8rem;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
`;

const LoadingState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 5rem; gap: 1rem; color: #64748b;
`;

const Spinner = styled.div`
  width: 40px; height: 40px; border: 3px solid #f3f3f3;
  border-top: 3px solid #0ea5e9; border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const EmptyState = styled.div`
  text-align: center; padding: 5rem 2rem; background: white; border-radius: 16px; border: 1px solid #e2e8f0;
  h3 { margin: 1.5rem 0 0.5rem; color: #475569; }
  p { color: #94a3b8; }
`;

export default LeaveApprovalReport;
