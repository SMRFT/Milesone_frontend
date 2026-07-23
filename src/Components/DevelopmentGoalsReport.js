import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import {
  Eye, 
  Edit, 
  Search, 
  FileText, 
  Calendar,
  Loader2, 
  ArrowLeft, 
  X, 
  Printer, 
  CheckCircle2,
  User, 
  Hash, 
  Target,
  Circle,
} from "lucide-react";
import apiRequest from "./apiRequest";
import mdcLogo from "./Images/mdcLogo.png";

const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();

const renderSparkline = (history) => {
  if (!history || !Array.isArray(history) || history.length === 0) return null;
  
  // Sort history by date ascending
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const width = 140;
  const height = 40;
  const padding = 6;
  
  if (sorted.length === 1) {
    const y = height - padding - (sorted[0].percentage / 100) * (height - 2 * padding);
    return (
      <div className="sparkline-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '5px' }}>
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
          <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#406147" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx={width / 2} cy={y} r="3.5" fill="#406147" />
          <text x={width / 2} y={y - 8} fontSize="8px" fontWeight="bold" textAnchor="middle" fill="#1e293b">
            {sorted[0].percentage}%
          </text>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: '7px', color: '#64748b', fontWeight: 600 }}>
          <span>{sorted[0].date}</span>
        </div>
      </div>
    );
  }
  
  const points = sorted.map((h, index) => {
    const x = padding + (index / (sorted.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((h.percentage || 0) / 100) * (height - 2 * padding);
    return { x, y, percentage: h.percentage, date: h.date };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  
  return (
    <div className="sparkline-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '5px' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#406147" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#406147" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines for reference */}
        {[0, 50, 100].map(pct => {
          const y = height - padding - (pct / 100) * (height - 2 * padding);
          return (
            <line key={pct} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
          );
        })}
        
        {/* Area fill */}
        <path d={areaD} fill="url(#sparkline-grad)" />
        
        {/* Sparkline path */}
        <path d={pathD} fill="none" stroke="#406147" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {points.map((p, i) => {
          const isFirstOrLast = i === 0 || i === points.length - 1;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#406147" strokeWidth="1.5" />
              {isFirstOrLast && (
                <text 
                  x={p.x} 
                  y={p.y - 7} 
                  fontSize="7.5px" 
                  fontWeight="800" 
                  fill="#1e293b" 
                  textAnchor={i === 0 ? "start" : "end"}
                >
                  {p.percentage}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '7px', color: '#64748b', fontWeight: 600, padding: '0 4px' }}>
        <span>{sorted[0].date}</span>
        <span>{sorted[sorted.length - 1].date}</span>
      </div>
    </div>
  );
};

const theme = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    background: "#f8f9fa",
    border: "#e2e8f0",
    text: "#1e293b",
    textLight: "#64748b",
  },
  shadows: {
    medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  }
};

const DevelopmentGoalsReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [includeHistory, setIncludeHistory] = useState(true);
  const [therapyTypes, setTherapyTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => {
    if (location.state?.report?.date) {
      return location.state.report.date.substring(0, 7);
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [expandedHistories, setExpandedHistories] = useState({});
  const [reportProgressPercentages, setReportProgressPercentages] = useState({});
  const [reportProgressDates, setReportProgressDates] = useState({});
  const todayStr = new Date().toISOString().split('T')[0];

  const toggleHistory = (key) => {
    setExpandedHistories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const STATUS_OPTIONS = ["Not Started", "Emerging", "Developing", "Achieved"];
  const STATUS_SHORT = {
    "Not Started": "N",
    "Emerging": "E",
    "Developing": "D",
    "Achieved": "A"
  };

  useEffect(() => {
    fetchReports();
  }, [filterMonth]);

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    if (!loading && location.state?.report) {
      const passedReport = location.state.report;
      const found = reports.find(r => r.id === passedReport.id || r.registration_number === passedReport.registration_number);
      if (found) {
        setSelectedReport(found);
        setSelectedTherapist(found.created_by_name || "");
      } else {
        setSelectedReport(passedReport);
        setSelectedTherapist(passedReport.created_by_name || "");
      }
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [loading, reports, location.state]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = filterMonth 
        ? `${BASE_URL}development-goals/?month=${filterMonth}` 
        : `${BASE_URL}development-goals/`;
      const result = await apiRequest(url, "GET");
      if (result.success) {
        setReports(result.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTherapists = async () => {
    try {
      const [docRes, tRes] = await Promise.all([
        apiRequest(`${BASE_URL}get-consulting-doctors/`, "GET"),
        apiRequest(`${BASE_URL}goal-therapy-types/`, "GET")
      ]);
      if (docRes.success) {
        setTherapists(docRes.data);
      }
      if (tRes.success) {
        setTherapyTypes(tRes.data);
      }
    } catch (err) {
      console.error("Error fetching master data:", err);
    }
  };

  const getTherapyColor = (therapyVal) => {
    if (!therapyVal) return "";
    const therapyObj = therapyTypes.find(t => 
      (t.id || t._id) === therapyVal || 
      t.therapy_id === therapyVal || 
      t.therapy_name === therapyVal
    );
    return therapyObj?.color || "#3f37c9";
  };

  const filteredReports = reports.filter(r => {
    const regNo = String(r.registration_number || "");
    const matchesSearch = regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth ? (r.date || "").substring(0, 7) === filterMonth : true;
    return matchesSearch && matchesMonth;
  });

  const handleView = (report) => {
    setSelectedReport(report);
    setSelectedTherapist(report.created_by_name || ""); // Set default to creator name
    setIsModalOpen(true);
  };

  const handleEdit = (report) => {
    navigate("/DevelopmentGoals", {
      state: { 
        assessment: { 
          registration_number: report.registration_number,
          name_of_child: report.registration_details?.name_of_child,
          patient_name: report.registration_details?.name_of_child
        },
        editData: report
      } 
    });
  };

  const getStatusFromPercentage = (pct) => {
    if (pct <= 25) return "Not Started";
    if (pct <= 50) return "Emerging";
    if (pct <= 75) return "Developing";
    return "Achieved";
  };

  const handleProgressAdd = async (actualIndexInMainList, percentage, dateVal) => {
    if (!selectedReport) return;
    if (percentage === "" || percentage === null || isNaN(percentage)) {
      alert("Please enter a valid percentage.");
      return;
    }
    const pct = Math.min(100, Math.max(0, parseInt(percentage) || 0));

    const updatedGoals = [...selectedReport.development_goals];
    const goal = { ...updatedGoals[actualIndexInMainList] };
    
    let history = Array.isArray(goal.history) ? [...goal.history] : [];
    
    const existingIdx = history.findIndex(h => h.date === dateVal);
    if (existingIdx >= 0) {
      history[existingIdx] = { ...history[existingIdx], percentage: pct };
    } else {
      history.push({ date: dateVal, percentage: pct });
    }
    
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestEntry = sortedHistory[0];

    goal.history = history;
    goal.percentage = latestEntry.percentage;
    goal.status = getStatusFromPercentage(latestEntry.percentage);

    updatedGoals[actualIndexInMainList] = goal;

    const updatedGoalsProcessed = selectedReport.goals ? [...selectedReport.goals] : [];
    if (updatedGoalsProcessed[actualIndexInMainList]) {
      updatedGoalsProcessed[actualIndexInMainList] = { 
        ...updatedGoalsProcessed[actualIndexInMainList],
        history: history,
        percentage: latestEntry.percentage,
        status: goal.status
      };
    }

    const updatedReport = { 
      ...selectedReport, 
      development_goals: updatedGoals, 
      goals: updatedGoalsProcessed 
    };

    setSelectedReport(updatedReport);
    setReports(prev => prev.map(r => 
      (r.id === updatedReport.id || (r.registration_number === updatedReport.registration_number && r.date === updatedReport.date)) 
        ? updatedReport 
        : r
    ));

    try {
      const result = await apiRequest(`${BASE_URL}development-goals/`, "POST", {
        registration_number: updatedReport.registration_number,
        date: updatedReport.date,
        development_goals: updatedGoals
      });

      if (!result.success) {
        console.error("Failed to update progress on server:", result.error);
        alert("Failed to save progress to server.");
      }
    } catch (err) {
      console.error("Progress update error:", err);
      alert("Error occurred while saving progress.");
    }
  };

  const handlePrint = () => {
    if (!selectedReport) return;

    const printWindow = window.open('', '_blank');
    const reportHtml = document.getElementById('printable-report').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Clinical Record - ${selectedReport.registration_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            @page { margin: 0.8cm 2cm 2cm 2cm; }
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0 0 1cm 0; color: #1e293b; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; counter-reset: page; }
            .no-print { display: none !important; }
            
            .clinic-brand {
                display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #406147;
                padding-bottom: 20px; margin-bottom: 30px;
            }
            .logo-placeholder {
                width: 60px; height: 60px; background: #406147; color: white;
                display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900;
                border-radius: 12px;
            }
            .clinic-details { flex: 1; }
            .clinic-details h1 { margin: 0; font-size: 1.8rem; letter-spacing: 2px; color: #406147; }
            .clinic-details .subtitle { margin: 0; font-size: 0.9rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .contact-info { text-align: right; font-size: 0.8rem; color: #64748b; }
            .contact-info p { margin: 2px 0; }
            
            .report-title-bar { text-align: center; margin-bottom: 30px; }
            .report-title-bar h2 { display: inline-block; padding: 8px 30px; background: #f1f5f9; border-radius: 30px; font-size: 1.1rem; color: #406147; text-transform: uppercase; letter-spacing: 1px; }

            .patient-demographics-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                margin-bottom: 15px;
                background: #f8fafc;
                border: 1px solid #cbd5e1;
                table-layout: fixed;
            }
            .patient-demographics-table td {
                padding: 6px 12px;
                font-size: 0.85rem;
                color: #334155;
                border: 1px solid #cbd5e1;
                width: 25%;
            }
            .patient-demographics-table td strong {
                color: #1e293b;
                margin-right: 6px;
            }

            .TherapyBlock { margin-bottom: 30px; }
            .TherapyBlock h5 { color: #3f37c9; font-size: 1.1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px; }
            
            .goals-table-wrapper { margin-bottom: 25px; }
            .goals-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #cbd5e1; table-layout: fixed; }
            .goals-table th { background: #f8fafc; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; font-size: 0.9rem; text-align: left; white-space: normal !important; word-break: break-word !important; overflow-wrap: break-word !important; }
            .goals-table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 0.9rem; color: #334155; white-space: normal !important; word-break: break-word !important; overflow-wrap: break-word !important; }
            
            .status-badge-text { font-weight: bold; font-size: 0.85rem; }
            .status-achieved { color: #2e7d32; }
            .status-developing { color: #ed6c02; }
            .status-not-started { color: #d32f2f; }
            .status-other { color: #64748b; }
            
            .ReportFooter { margin-top: 80px; }
            .sig-row { display: flex; justify-content: space-between; margin-bottom: 50px; }
            .sig-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
            .sig-item .line { width: 220px; height: 1px; background: #cbd5e1; }
            .sig-item span { font-size: 0.85rem; font-weight: 600; color: #64748b; }
            .therapist-printed-name { color: #1e293b; font-size: 1rem; font-weight: 700; margin-bottom: -2px; }
            .therapist-sub-details { font-size: 0.8rem; color: #64748b; font-weight: 500; }
            .disclaimer { text-align: center; font-size: 0.75rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; font-weight: 500; }
            .Watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 5rem; font-weight: 900; color: rgba(0,0,0,0.02); z-index: -1; white-space: nowrap; }
            .print-footer { display: flex; position: fixed; bottom: 0; left: 0; right: 0; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8pt; color: #64748b; font-weight: 500; font-family: 'Inter', sans-serif; counter-increment: page; }
            .page-number::after { content: "Page " counter(page); }
            .ReportFooter, .sig-row, .sig-item { page-break-inside: avoid; break-inside: avoid; }
          </style>
        </head>
        <body>
          ${reportHtml}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return (
    <LoadingWrapper><Loader2 size={40} className="spinner" /><p>Loading Goals Reports...</p></LoadingWrapper>
  );

  return (
    <ThemeProvider theme={theme}>
      <GlobalPrintStyle />
      <Container>
        <HeaderSection>
          <div className="title-group">
            <div>
              <Title>Monthly Development Goals History</Title>
              <Subtitle>Review and manage patient development goals by month.</Subtitle>
            </div>
          </div>

          <FilterControls>
            <SearchBar>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search Reg No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>

            <DatePickerWrapper>
              <Calendar size={18} />
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
              {filterMonth && <button onClick={() => setFilterMonth("")}><X size={14} /></button>}
            </DatePickerWrapper>
          </FilterControls>
        </HeaderSection>

        <TableCard>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Goal Month</th>
                  <th>Goals Count</th>
                  {/* <th>Created Date</th> */}
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? filteredReports.map((report, idx) => (
                  <tr key={report.id || idx}>
                    <td><strong>{report.registration_number}</strong></td>
                    <td>{report.registration_details?.name_of_child || "---"}</td>
                    <td>{new Date(report.date).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</td>
                    <td><CountBadge>{report.development_goals?.length || 0} Goals</CountBadge></td>
                    {/* <td>{new Date(report.created_date).toLocaleDateString()}</td> */}
                    <td>
                      <ActionGroup>
                        <button className="view-btn" onClick={() => handleView(report)}><Eye size={16} /> View</button>
                        <button className="edit-btn" onClick={() => handleEdit(report)}><Edit size={16} /> Edit</button>
                      </ActionGroup>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px' }}>No monthly goals found</td></tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableCard>

        {isModalOpen && selectedReport && (
          <ModalOverlay onClick={() => setIsModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader className="no-print">
                <div className="header-info">
                  <FileText size={20} color={theme.colors.primary} />
                  <h3>Clinical Record: {selectedReport.registration_details?.name_of_child || selectedReport.registration_number}</h3>
                </div>
                <div className="actions">
                  {selectedReport && Array.isArray(selectedReport.goals) && selectedReport.goals.some(g => g.history && g.history.length > 0) && (
                    <select 
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                      value={includeHistory ? "with" : "without"}
                      onChange={(e) => setIncludeHistory(e.target.value === "with")}
                    >
                      <option value="with">With History</option>
                      <option value="without">Without History</option>
                    </select>
                  )}
                  <select 
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                    value={selectedTherapist}
                    onChange={(e) => setSelectedTherapist(e.target.value)}
                  >
                    <option value="">Select Therapist</option>
                    {therapists.map(emp => (
                      <option key={emp.id || emp._id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                  <button className="print-btn" onClick={handlePrint}>
                    <Printer size={18} /> Print Report
                  </button>
                  <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                    <X size={24} />
                  </button>
                </div>
              </ModalHeader>

              <ReportSheet id="printable-report">
                <header className="report-main-header">
                  <div className="clinic-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #406147', paddingBottom: '10px', marginBottom: '15px' }}>
                    <img src={mdcLogo} alt="Logo" className="logo" style={{ width: '150px', height: 'auto', objectFit: 'contain', display: 'block' }} />
                    <div className="contact-details" style={{ textAlign: 'right', fontSize: '9pt', color: '#555', lineHeight: '1.4' }}>
                      <strong style={{ fontSize: '11pt', color: '#333' }}>Milestone Development Center</strong><br />
                      Ph: +91 90470 33633 | Email: info@milestonescenter.in
                    </div>
                  </div>
                  
                  <div className="report-title-bar">
                    <h2>Monthly Progress Goal Plan</h2>
                  </div>

                  <table className="patient-demographics-table">
                    <tbody>
                      <tr>
                        <td><strong>Name:</strong> {selectedReport.registration_details?.name_of_child || selectedReport.patient_name || "—"}</td>
                        <td><strong>Age:</strong> {selectedReport.age_str || (selectedReport.registration_details?.age ? `${selectedReport.registration_details.age.years || 0}y ${selectedReport.registration_details.age.months || 0}m` : "—")}</td>
                        <td><strong>DOB:</strong> {selectedReport.dob || selectedReport.registration_details?.dob || "—"}</td>
                        <td><strong>Reg. No.:</strong> {selectedReport.registration_number}</td>
                      </tr>
                      <tr>
                        <td><strong>Father:</strong> {selectedReport.father || selectedReport.registration_details?.father_name || "—"}</td>
                        <td><strong>Mother:</strong> {selectedReport.mother || selectedReport.registration_details?.mother_name || "—"}</td>
                        <td><strong>Mobile:</strong> {selectedReport.mobile || selectedReport.registration_details?.father_phone_number || selectedReport.registration_details?.mother_phone_number || "—"}</td>
                        <td><strong>Date of Evaluation:</strong> {selectedReport.date ? new Date(selectedReport.date).toLocaleDateString('en-GB') : "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </header>

                <ReportSection>
                  <h4><CheckCircle2 size={18} /> Goals Defined for the Month</h4>
                  
                  {Object.entries(
                    (Array.isArray(selectedReport.goals) ? selectedReport.goals : []).reduce((acc, g, idx) => {
                      const therapyKey = g.therapy || g.therapy_type || g.therapy_type_name || "General";
                      if (!acc[therapyKey]) acc[therapyKey] = [];
                      acc[therapyKey].push({ ...g, originalIndex: idx });
                      return acc;
                    }, {})
                  ).length > 0 ? Object.entries(
                    (Array.isArray(selectedReport.goals) ? selectedReport.goals : []).reduce((acc, g, idx) => {
                      const therapyKey = g.therapy || g.therapy_type || g.therapy_type_name || "General";
                      if (!acc[therapyKey]) acc[therapyKey] = [];
                      acc[therapyKey].push({ ...g, originalIndex: idx });
                      return acc;
                    }, {})
                  ).map(([therapy, goals]) => (
                    <TherapyBlock key={therapy}>
                      <h5 style={{ color: getTherapyColor(therapy), borderBottom: `2px solid ${getTherapyColor(therapy)}33` }}>{therapy}</h5>
                      <div className="goals-table-wrapper">
                        <table className="goals-table">
                          <colgroup>
                            <col style={{ width: '8%' }} />
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '32%' }} />
                          </colgroup>
                          <thead>
                             <tr>
                               <th style={{ width: '8%', textAlign: 'center' }}>S.No</th>
                               <th style={{ width: '30%', textAlign: 'left' }}>Goal / Target</th>
                               <th style={{ width: '15%', textAlign: 'left' }}>Domain</th>
                               <th style={{ width: '15%', textAlign: 'center' }}>Level</th>
                               <th style={{ width: '32%', textAlign: 'center' }}>Status</th>
                             </tr>
                          </thead>
                          <tbody>
                            {goals.map((g, i) => {
                              const actualIndex = g.originalIndex;
                              
                              let statusClass = "status-other";
                              const statusLower = String(g.status || "").toLowerCase();
                              if (statusLower.includes("achieved") || statusLower.includes("developed")) {
                                statusClass = "status-achieved";
                              } else if (statusLower.includes("developing") || statusLower.includes("emerging") || statusLower.includes("delayed")) {
                                statusClass = "status-developing";
                              } else if (statusLower.includes("not started") || statusLower.includes("not achieved")) {
                                statusClass = "status-not-started";
                              }

                              return (
                                <React.Fragment key={i}>
                                  <tr>
                                    <td data-label="S.No" style={{ textAlign: 'center' }}>{i + 1}</td>
                                    <td data-label="Goal / Target" style={{ textAlign: 'left' }}>{g.goal || g.goal_name || "No description"}</td>
                                    <td data-label="Domain" style={{ textAlign: 'left' }}>{g.domain || "---"}</td>
                                    <td data-label="Level" style={{ textAlign: 'center' }}>{g.level || "---"}</td>
                                    <td data-label="Status" style={{ textAlign: 'center' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span className={`status-badge-text ${statusClass}`}>
                                          {g.status} {typeof g.percentage === 'number' ? `(${g.percentage}%)` : ''}
                                        </span>
                                        {g.employee_id && (
                                          <span style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                            Owner: {g.employee_id}
                                          </span>
                                        )}
                                        {includeHistory && g.history && g.history.length > 0 && renderSparkline(g.history)}
                                      </div>
                                    </td>
                                  </tr>
                                  
                                  {/* Sub-row for progress update and history (screen-only) */}
                                  <tr className="no-print" style={{ background: '#f8fafc' }}>
                                    <td colSpan={5} style={{ padding: '8px 12px', borderTop: 'none', borderBottom: '1px solid #e2e8f0' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                        
                                        {/* Inline Update Progress Form */}
                                        {(() => {
                                          const currentEmployeeId = localStorage.getItem("employeeId") || "";
                                          const isOwner = !g.employee_id || String(g.employee_id) === String(currentEmployeeId);
                                          if (isOwner) {
                                            return (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Update Progress:</span>
                                                <input 
                                                  type="date" 
                                                  value={reportProgressDates[actualIndex] || todayStr} 
                                                  onChange={(e) => setReportProgressDates(prev => ({ ...prev, [actualIndex]: e.target.value }))}
                                                  style={{ 
                                                    fontSize: '0.75rem', 
                                                    padding: '4px 6px', 
                                                    borderRadius: '4px', 
                                                    border: '1px solid #cbd5e1',
                                                    outline: 'none',
                                                    color: '#334155'
                                                  }}
                                                />
                                                <input 
                                                  type="number" 
                                                  min="0" 
                                                  max="100" 
                                                  placeholder="%" 
                                                  value={reportProgressPercentages[actualIndex] ?? ""} 
                                                  onChange={(e) => setReportProgressPercentages(prev => ({ ...prev, [actualIndex]: e.target.value }))}
                                                  style={{ 
                                                    width: '55px', 
                                                    fontSize: '0.75rem', 
                                                    padding: '4px 6px', 
                                                    borderRadius: '4px', 
                                                    border: '1px solid #cbd5e1',
                                                    textAlign: 'center',
                                                    outline: 'none',
                                                    color: '#334155'
                                                  }}
                                                />
                                                <button 
                                                  onClick={() => {
                                                    handleProgressAdd(actualIndex, reportProgressPercentages[actualIndex], reportProgressDates[actualIndex] || todayStr);
                                                    setReportProgressPercentages(prev => ({ ...prev, [actualIndex]: "" }));
                                                  }}
                                                  style={{ 
                                                    background: '#406147', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    padding: '5px 12px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600, 
                                                    cursor: 'pointer' 
                                                  }}
                                                >
                                                  Add
                                                </button>
                                              </div>
                                            );
                                          } else {
                                            return (
                                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                                🔒 Only owner (ID: {g.employee_id}) can update progress
                                              </span>
                                            );
                                          }
                                        })()}

                                        {/* View History Trigger */}
                                        {g.history && g.history.length > 0 && (
                                          <div>
                                            <button 
                                              onClick={() => toggleHistory(`${therapy}-${i}`)}
                                              style={{ background: 'none', border: '1px solid #e2e8f0', background: 'white', color: '#3f37c9', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '4px 10px', borderRadius: '4px' }}
                                            >
                                              {expandedHistories[`${therapy}-${i}`] ? 'Hide History' : 'View History'}
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Expanded History List */}
                                      {expandedHistories[`${therapy}-${i}`] && g.history && (
                                        <div style={{ marginTop: '8px', padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'left' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {[...g.history].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, eIdx) => {
                                              let st = entry.status || "Not Started";
                                              if (typeof entry.percentage === 'number') {
                                                if (entry.percentage <= 25) st = "Not Started";
                                                else if (entry.percentage <= 50) st = "Emerging";
                                                else if (entry.percentage <= 75) st = "Developing";
                                                else st = "Achieved";
                                              }
                                              return (
                                                <div key={eIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                                                  <span>📅 {entry.date}</span>
                                                  <strong>{entry.percentage}% ({st})</strong>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </TherapyBlock>
                  )) : (
                    <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
                        No goals found in this record.
                    </div>
                  )}
                </ReportSection>

                <ReportFooter>
                  <div className="sig-row">
                    <div className="sig-item">
                      {selectedTherapist ? (
                        <>
                          <span className="therapist-printed-name">{selectedTherapist}</span>
                          {(() => {
                            const match = therapists.find(t => t.name === selectedTherapist);
                            if (match) {
                              return (
                                <>
                                  <span className="therapist-sub-details">{match.qualification || ""}</span>
                                  <span className="therapist-sub-details">{match.designation || ""}</span>
                                </>
                              );
                            }
                            if (selectedTherapist === selectedReport.created_by_name) {
                              return (
                                <>
                                  <span className="therapist-sub-details">{selectedReport.created_by_qualification || ""}</span>
                                  <span className="therapist-sub-details">{selectedReport.created_by_designation || ""}</span>
                                </>
                              );
                            }
                            return null;
                          })()}
                        </>
                      ) : (
                        <>
                          <span className="therapist-printed-name">{selectedReport.created_by_name || ""}</span>
                          <span className="therapist-sub-details">{selectedReport.created_by_qualification || ""}</span>
                          <span className="therapist-sub-details">{selectedReport.created_by_designation || ""}</span>
                        </>
                      )}
                      <div className="line" style={{ marginTop: '10px' }} />
                      <span>Therapist Signature</span>
                    </div>
                    <div className="sig-item">
                      <div className="line" style={{ marginTop: 'auto' }} />
                      <span>Parent Signature</span>
                    </div>
                  </div>
                  <p className="disclaimer">Generated on {new Date().toLocaleDateString()} at Milestone Developmental Center.</p>
                </ReportFooter>
                <div className="print-footer">
                  <span>Milestone Developmental Center - Clinical Record</span>
                  <span className="page-number"></span>
                </div>
                <Watermark className="Watermark">OFFICIAL DEVELOPMENT RECORD</Watermark>
              </ReportSheet>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ThemeProvider>
  );
};

const Container = styled.div`
  max-width: 100%;
  margin: 20px 40px;
  font-family: 'Inter', sans-serif;
  
  @media (max-width: 768px) {
    margin: 15px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;

  .title-group {
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    .title-group {
      width: 100%;
    }
  }
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
  margin: 0 0 6px 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin: 0;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 12px;
  width: 320px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
  
  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
  }

  input { 
    border: none; 
    outline: none; 
    margin-left: 10px; 
    width: 100%; 
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
    background: transparent;
    &::placeholder {
      color: #94a3b8;
    }
  }
  svg { color: #64748b; }
  
  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
  }
`;

const DatePickerWrapper = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #cbd5e1;
  padding: 9px 16px;
  border-radius: 12px;
  gap: 10px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
  }

  input { 
    border: none; 
    outline: none; 
    color: #1e293b; 
    font-family: inherit; 
    font-weight: 600; 
    cursor: pointer;
    font-size: 0.9rem;
    background: transparent;
  }
  button { 
    background: none; 
    border: none; 
    cursor: pointer; 
    color: #94a3b8; 
    display: flex; 
    align-items: center;
    padding: 0;
    &:hover {
      color: #ef4444;
    }
  }
  svg { color: #64748b; }
  
  @media (max-width: 768px) {
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    input {
      flex: 1;
    }
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const TableWrapper = styled.div` overflow-x: auto; `;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: #f8fafc;
    padding: 16px 24px;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    border-bottom: 1px solid #e2e8f0;
  }
  td {
    padding: 18px 24px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.925rem;
    color: ${props => props.theme.colors.text};
    vertical-align: middle;
    
    @media (max-width: 768px) {
      padding: 12px 10px;
      font-size: 0.8rem;
    }
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover { background: #f8fafc; }
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  
  button {
    border: none; 
    padding: 8px 16px; 
    border-radius: 100px; 
    cursor: pointer;
    font-weight: 600; 
    font-size: 0.85rem; 
    display: flex; 
    align-items: center; 
    gap: 6px;
    transition: all 0.2s ease-in-out;
  }
  .view-btn { 
    background: #e2f0e7; 
    color: #1b5e20; 
    &:hover { 
      background: #c8e6c9; 
      transform: translateY(-1px);
    } 
  }
  .edit-btn { 
    background: #e8eaf6; 
    color: #1a237e; 
    &:hover { 
      background: #c5cae9; 
      transform: translateY(-1px);
    } 
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const CountBadge = styled.span`
  background: #e0f2fe; 
  color: #0369a1; 
  padding: 6px 14px; 
  border-radius: 100px;
  font-weight: 700; 
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center;
  z-index: 1000; padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled.div`
  background: white; width: 100%; max-width: 1100px; max-height: 95vh;
  border-radius: 20px; overflow-y: auto; position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  
  @media (max-width: 768px) {
    max-height: 100vh;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  background: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10;
  .header-info { display: flex; align-items: center; gap: 12px; h3 { margin: 0; font-size: 1.1rem; } }
  .actions { display: flex; gap: 15px; }
  .print-btn { background: ${props => props.theme.colors.primary}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
  .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
  
  @media (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .header-info {
      width: 100%;
      justify-content: space-between;
    }
    
    .actions {
      width: 100%;
      flex-direction: column;
      gap: 8px;
      select, .print-btn {
        width: 100%;
        box-sizing: border-box;
      }
      .close-btn {
        position: absolute;
        right: 15px;
        top: 15px;
      }
    }
  }
`;

const ReportSheet = styled.div`
  background: white; padding: 60px; position: relative; color: #1e293b;
  min-height: 1000px;
  @media print { padding: 0; }
  
  @media (max-width: 768px) {
    padding: 15px;
    min-height: auto;
  }
  
  .print-footer {
    display: none;
  }

  .clinic-brand {
    display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${props => props.theme.colors.primary};
    padding-bottom: 20px; margin-bottom: 30px;
    
    .logo {
      width: 100px;
      height: auto;
      object-fit: contain;
    }
    
    .contact-details {
      text-align: right;
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.4;
    }
    
    @media (max-width: 600px) {
      flex-direction: column;
      align-items: center;
      gap: 10px;
      .contact-details {
        text-align: center;
      }
    }
  }

  .report-title-bar {
      text-align: center; margin-bottom: 15px;
      h2 { display: inline-block; padding: 6px 20px; background: #f1f5f9; border-radius: 30px; font-size: 1rem; color: ${props => props.theme.colors.primary}; text-transform: uppercase; letter-spacing: 1px; }
  }

  .patient-demographics-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 15px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      table-layout: fixed;
      td {
          padding: 6px 12px;
          font-size: 0.85rem;
          color: #334155;
          border: 1px solid #cbd5e1;
          width: 25%;
          strong {
              color: #1e293b;
              margin-right: 6px;
          }
      }
      
      @media (max-width: 768px) {
        table-layout: auto;
        tr {
          display: flex;
          flex-direction: column;
        }
        td {
          display: block;
          width: 100% !important;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          box-sizing: border-box;
        }
      }
  }
`;

const Watermark = styled.div`
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 6rem; font-weight: 900; color: rgba(0,0,0,0.03); pointer-events: none; z-index: 0; white-space: nowrap;
`;

const ReportSection = styled.div`
  margin-top: 40px; h4 { font-size: 1rem; color: ${props => props.theme.colors.primary}; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; display: flex; align-items: center; gap: 10px; }
`;

const TherapyBlock = styled.div`
  margin-bottom: 25px;
  h5 { color: ${props => props.theme.colors.secondary}; margin-bottom: 12px; font-size: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
  
  .goals-table-wrapper {
    margin-bottom: 25px;
    @media (max-width: 768px) {
      margin-bottom: 15px;
    }
  }
  
  .goals-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1px solid #cbd5e1;
    table-layout: fixed;
    th {
       background: #f8fafc;
       color: #1e293b;
       font-weight: bold;
       border: 1px solid #cbd5e1;
       padding: 10px;
       font-size: 0.9rem;
       white-space: normal !important;
       word-break: break-word !important;
       overflow-wrap: break-word !important;
     }
     td {
       border: 1px solid #cbd5e1;
       padding: 10px;
       font-size: 0.9rem;
       color: #334155;
       white-space: normal !important;
       word-break: break-word !important;
       overflow-wrap: break-word !important;
     }
     
     @media (max-width: 768px) {
       table-layout: auto !important;
       colgroup {
         display: none;
       }
       thead {
         display: none;
       }
       tr {
         display: block;
         margin-bottom: 15px;
         border: 1px solid #cbd5e1;
         border-radius: 8px;
         background: #ffffff;
         padding: 12px;
       }
       td {
         display: block;
         width: 100% !important;
         text-align: left !important;
         border: none !important;
         padding: 6px 0 !important;
         border-bottom: 1px dashed #f1f5f9 !important;
         box-sizing: border-box;
         
         &:last-child {
           border-bottom: none !important;
         }
         
         &::before {
           content: attr(data-label);
           font-weight: 700;
           color: #475569;
           display: block;
           font-size: 0.75rem;
           text-transform: uppercase;
           margin-bottom: 2px;
         }
       }
     }
  }
  
  .status-badge-text {
    font-weight: bold;
    font-size: 0.85rem;
    &.status-achieved { color: #2e7d32; }
    &.status-developing { color: #ed6c02; }
    &.status-not-started { color: #d32f2f; }
    &.status-other { color: #64748b; }
  }
`;

const StatusQuickSelector = styled.div`
  display: flex; gap: 6px;
  
  button {
    width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0; background: white;
    font-size: 0.7rem; font-weight: 800; cursor: pointer; transition: all 0.2s; color: #64748b;
    display: flex; align-items: center; justify-content: center;
    
    &:hover { background: #f8fafc; border-color: #cbd5e1; }
    
    &.active {
      background: ${props => props.theme.colors.primary}; color: white; border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 2px 4px rgba(64, 97, 71, 0.2);
    }
    
    &[title="Achieved"].active { background: #22c55e; border-color: #22c55e; }
    &[title="Developing"].active { background: #3b82f6; border-color: #3b82f6; }
    &[title="Emerging"].active { background: #f59e0b; border-color: #f59e0b; }
    &[title="Not Started"].active { background: #ef4444; border-color: #ef4444; }
  }
`;

const ReportFooter = styled.div`
  margin-top: 120px;
  .sig-row { display: flex; justify-content: space-between; margin-bottom: 50px; }
  .sig-item { 
    display: flex; flex-direction: column; align-items: center; gap: 6px; 
    span { font-size: 0.85rem; font-weight: 600; color: #64748b; } 
    .line { width: 220px; height: 1px; background: #cbd5e1; } 
    .therapist-printed-name { color: #1e293b; font-size: 1rem; font-weight: 700; margin-bottom: -2px; }
    .therapist-sub-details { font-size: 0.8rem; color: #64748b; font-weight: 500; }
  }
  .disclaimer { 
    text-align: center; font-size: 0.75rem; color: #94a3b8; 
    border-top: 1px solid #f1f5f9; padding-top: 20px; 
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    margin-top: 50px;
    .sig-row {
      flex-direction: column;
      gap: 30px;
      align-items: center;
    }
  }
`;

const GlobalPrintStyle = createGlobalStyle`
  @media print {
    body { 
      background: white !important; 
      padding: 0 !important; 
      margin: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      counter-reset: page !important;
    }
    .no-print, .no-print *, button, select, .StatusQuickSelector { display: none !important; }
    
    #root > div > *:not(.ModalOverlay) { display: none !important; }
    .ModalOverlay { position: static !important; background: none !important; padding: 0 !important; display: block !important; }
    .ModalContent { 
        position: static !important; max-width: none !important; max-height: none !important; 
        box-shadow: none !important; overflow: visible !important; width: 100% !important;
    }
    
    #printable-report { 
      padding: 0 0 1cm 0 !important; 
      border: none !important; 
      width: 100% !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    #printable-report img.logo {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .Watermark {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) rotate(-45deg) !important;
      font-size: 5rem !important;
      font-weight: 900 !important;
      color: rgba(0,0,0,0.02) !important;
      z-index: -1 !important;
      white-space: nowrap !important;
      display: block !important;
    }
    
    .print-footer {
      display: flex !important;
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-top: 1px solid #cbd5e1 !important;
      padding-top: 8px !important;
      font-size: 8pt !important;
      color: #64748b !important;
      font-weight: 500 !important;
      font-family: 'Inter', sans-serif !important;
      counter-increment: page !important;
    }
    .page-number::after {
      content: "Page " counter(page) !important;
    }
    
    .ReportFooter, .sig-row, .sig-item {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Desktop table print layout overrides */
    .patient-demographics-table {
      table-layout: fixed !important;
      width: 100% !important;
    }
    .patient-demographics-table tr {
      display: table-row !important;
    }
    .patient-demographics-table td {
      display: table-cell !important;
      width: 25% !important;
      border: 1px solid #cbd5e1 !important;
      padding: 6px 12px !important;
    }
    
    .goals-table {
      table-layout: fixed !important;
      width: 100% !important;
    }
    .goals-table colgroup {
      display: table-column-group !important;
    }
    .goals-table thead {
      display: table-header-group !important;
    }
    .goals-table tr {
      display: table-row !important;
      background: none !important;
      border: none !important;
      padding: 0 !important;
    }
    .goals-table td {
      display: table-cell !important;
      width: auto !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px !important;
    }
    .goals-table td::before {
      display: none !important;
    }
    
    @page { margin: 0.8cm 2cm 2cm 2cm; }
  }
`;

const LoadingWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 20px;
  .spinner { animation: spin 1s linear infinite; color: #406147; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default DevelopmentGoalsReport;
