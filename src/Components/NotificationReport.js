import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Eye,
  Trash2,
  Bell,
  Mail,
  MailOpen,
  PieChart,
  X
} from "lucide-react";
import * as XLSX from "xlsx";
import apiRequest from "./apiRequest";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || "";
  return envUrl ? (envUrl.endsWith("/") ? envUrl : envUrl + "/") : "http://127.0.0.1:8000/";
};

const Container = styled.div`
  padding: 0;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  .title-section {
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    p {
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-size: 0.95rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.excel {
    background: #dcfce7;
    color: #15803d;
    &:hover {
      background: #bbf7d0;
      transform: translateY(-2px);
    }
  }
  &.print {
    background: #e0f2fe;
    color: #0369a1;
    &:hover {
      background: #bae6fd;
      transform: translateY(-2px);
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.bg || "#f1f5f9"};
    color: ${(props) => props.color || "#0f172a"};
  }

  .stat-info {
    .value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      margin-top: 0.2rem;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
    label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
  }

  .search {
    flex: 1;
    min-width: 250px;
  }
`;

const Input = styled.input`
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  outline: none;
  font-size: 0.9rem;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.75rem;

  &:focus-within {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  input {
    border: none;
    padding: 0.6rem 0;
    width: 100%;
    outline: none;
    font-size: 0.9rem;
  }
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

  &:hover {
    background: #f1f5f9;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 520px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 950px;

  th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8fafc;
    text-align: left;
    padding: 1rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 2px solid #e2e8f0;
  }

  td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
    font-size: 0.9rem;
    color: #334155;
  }
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;

  &.delivered {
    background: #dbeafe;
    color: #1d4ed8;
  }
  &.opened {
    background: #dcfce7;
    color: #15803d;
  }
  &.unread {
    background: #fef3c7;
    color: #92400e;
  }
`;

const IconBtn = styled.button`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  &.delete {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #fca5a5;
    &:hover {
      background: #fca5a5;
      color: #7f1d1d;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: white;
  width: 100%;
  max-width: 820px;
  max-height: 85vh;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 1.15rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  button {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    &:hover {
      color: #0f172a;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
`;

export default function NotificationReport() {
  const [summary, setSummary] = useState({
    total_notifications: 0,
    total_delivered: 0,
    total_opened: 0,
    total_unread: 0,
    overall_open_rate_pct: 0,
  });
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  const baseUrl = getBaseUrl();

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}notifications/report/`;
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }
      const res = await apiRequest(url, "GET");
      if (res.success && res.data?.status === "success") {
        setSummary(res.data.summary || {});
        const data = res.data.data || [];
        setReports(data);
        setFilteredReports(data);
      } else {
        toast.error("Failed to load notification report data.");
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      toast.error("Error connecting to backend service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = reports.filter((item) => {
      const matchSearch =
        (item.notification_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sub || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Opened" && item.read_count > 0) ||
        (statusFilter === "Unread" && item.read_count === 0);

      let matchDate = true;
      if (item.created_date) {
        const itemDateStr = new Date(item.created_date).toISOString().split("T")[0];
        matchDate = itemDateStr >= startDate && itemDateStr <= endDate;
      }

      return matchSearch && matchStatus && matchDate;
    });
    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, startDate, endDate, reports]);

  const handleReset = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setStartDate(d.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setSearchTerm("");
    setStatusFilter("All");
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm(`Are you sure you want to delete notification ${notificationId}?`)) return;

    try {
      const res = await apiRequest(`${baseUrl}notifications/${notificationId}/`, "DELETE");
      if (res.success) {
        toast.success(`Notification ${notificationId} deleted.`);
        if (selectedNotification && selectedNotification.notification_id === notificationId) {
          setSelectedNotification(null);
        }
        fetchReportData();
      } else {
        toast.error(res.error || "Failed to delete notification.");
      }
    } catch (err) {
      toast.error("Delete request failed.");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Notification Management Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #0f172a; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Notification Management Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Notification ID</th>
                <th>Title</th>
                <th>Recipients</th>
                <th>Delivered</th>
                <th>Opened</th>
                <th>Open Rate %</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReports
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.notification_id}</strong></td>
                  <td>${item.title}</td>
                  <td>${item.total_members}</td>
                  <td>${item.sent_count}</td>
                  <td>${item.read_count}</td>
                  <td>${item.open_rate_pct}%</td>
                  <td>${item.created_date ? new Date(item.created_date).toLocaleString() : "N/A"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
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
    const data = filteredReports.map((item, index) => ({
      "S.No": index + 1,
      "Notification ID": item.notification_id,
      "Title": item.title,
      "Subject/Content": item.sub,
      "Target Recipients": item.total_members,
      "Delivered Count": item.sent_count,
      "Opened Count": item.read_count,
      "Unread Count": item.unread_count,
      "Open Rate (%)": item.open_rate_pct,
      "Created Date": item.created_date ? new Date(item.created_date).toLocaleString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notification Report");
    XLSX.writeFile(workbook, `Notification_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Page Header */}
      <Header>
        <div className="title-section">
          <h1>Notification Delivery & Read Status Report</h1>
          <p>Overview of sent notifications, delivered target counts, and recipient opened logs</p>
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

      {/* Analytics KPI Cards */}
      <StatsGrid>
        <StatCard bg="#e0f2fe" color="#0369a1">
          <div className="icon-wrapper">
            <Mail size={22} />
          </div>
          <div className="stat-info">
            <div className="value">{summary.total_notifications}</div>
            <div className="label">Total Notifications</div>
          </div>
        </StatCard>

        <StatCard bg="#dbeafe" color="#1d4ed8">
          <div className="icon-wrapper">
            <Bell size={22} />
          </div>
          <div className="stat-info">
            <div className="value">{summary.total_delivered}</div>
            <div className="label">Target Recipients</div>
          </div>
        </StatCard>

        <StatCard bg="#dcfce7" color="#15803d">
          <div className="icon-wrapper">
            <MailOpen size={22} />
          </div>
          <div className="stat-info">
            <div className="value">{summary.total_opened}</div>
            <div className="label">Opened / Read</div>
          </div>
        </StatCard>

        <StatCard bg="#fef3c7" color="#92400e">
          <div className="icon-wrapper">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <div className="value">{summary.total_unread}</div>
            <div className="label">Pending Unread</div>
          </div>
        </StatCard>

        <StatCard bg="#f3e8ff" color="#7e22ce">
          <div className="icon-wrapper">
            <PieChart size={22} />
          </div>
          <div className="stat-info">
            <div className="value">{summary.overall_open_rate_pct}%</div>
            <div className="label">Overall Open Rate</div>
          </div>
        </StatCard>
      </StatsGrid>

      {/* Filter Section */}
      <FiltersSection>
        <div className="filter-grid">
          <div className="filter-item">
            <label>From Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>To Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="filter-item search">
            <label>Search Notifications</label>
            <SearchInputWrapper>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by Notification ID or Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>
          </div>

          <div className="filter-item">
            <label>Read Status Filter</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Opened">At least 1 Opened</option>
              <option value="Unread">Unread</option>
            </Select>
          </div>

          <ResetBtn onClick={handleReset}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </ResetBtn>
        </div>
      </FiltersSection>

      {/* Table Section */}
      <TableWrapper>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            Loading notification records...
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            No notification records match the current filter criteria.
          </div>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                <th>Notification ID</th>
                <th>Title & Content</th>
                <th>Target Recipients</th>
                <th>Delivered</th>
                <th>Opened</th>
                <th>Open Rate %</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item) => (
                <tr key={item.notification_id}>
                  <td>
                    <RegBadge>{item.notification_id}</RegBadge>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "280px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.sub}
                    </div>
                  </td>
                  <td>{item.total_members} member(s)</td>
                  <td>
                    <StatusBadge className="delivered">
                      {item.sent_count} Delivered
                    </StatusBadge>
                  </td>
                  <td>
                    <StatusBadge className={item.read_count > 0 ? "opened" : "unread"}>
                      {item.read_count} Opened
                    </StatusBadge>
                  </td>
                  <td>
                    <strong style={{ color: item.open_rate_pct >= 50 ? "#15803d" : "#dc2626" }}>
                      {item.open_rate_pct}%
                    </strong>
                  </td>
                  <td>{item.created_date ? new Date(item.created_date).toLocaleString() : "N/A"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <IconBtn onClick={() => setSelectedNotification(item)}>
                        <Eye size={14} /> Details
                      </IconBtn>
                      <IconBtn className="delete" onClick={() => handleDeleteNotification(item.notification_id)}>
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        )}
      </TableWrapper>

      {/* Recipient Details Modal */}
      {selectedNotification && (
        <ModalOverlay onClick={() => setSelectedNotification(null)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                <MailOpen size={20} color="#0ea5e9" /> Recipient Details: {selectedNotification.notification_id}
              </h3>
              <button onClick={() => setSelectedNotification(null)}>
                <X size={20} />
              </button>
            </ModalHeader>

            <ModalBody>
              <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "0.35rem" }}>
                  {selectedNotification.title}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#475569" }}>{selectedNotification.sub}</div>
              </div>

              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#334155", marginBottom: "0.75rem" }}>
                Assigned Patient Recipients ({selectedNotification.members?.length || 0})
              </div>

              <StyledTable style={{ minWidth: "100%" }}>
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Patient Name</th>
                    <th>Delivery Status</th>
                    <th>Read Status</th>
                    <th>Sent Datetime</th>
                    <th>Opened Datetime</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedNotification.members || []).map((m, idx) => (
                    <tr key={m.reg_no || idx}>
                      <td>
                        <RegBadge>{m.reg_no}</RegBadge>
                      </td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{m.name || "Patient Member"}</td>
                      <td>
                        <StatusBadge className={m.is_send ? "delivered" : "unread"}>
                          {m.is_send ? "Delivered" : "Pending"}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge className={m.is_read ? "opened" : "unread"}>
                          {m.is_read ? "Opened" : "Unread"}
                        </StatusBadge>
                      </td>
                      <td>{m.sent_datetime ? new Date(m.sent_datetime).toLocaleString() : "-"}</td>
                      <td>{m.read_datetime ? new Date(m.read_datetime).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </ModalBody>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
}
