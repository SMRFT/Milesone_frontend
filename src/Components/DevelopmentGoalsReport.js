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
      } else {
        setSelectedReport(passedReport);
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
      const result = await apiRequest(`${BASE_URL}get-consulting-doctors/`, "GET");
      if (result.success) {
        setTherapists(result.data);
      }
    } catch (err) {
      console.error("Error fetching therapists:", err);
    }
  };

  const filteredReports = reports.filter(r => {
    const regNo = String(r.registration_number || "");
    const matchesSearch = regNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth ? (r.date || "").substring(0, 7) === filterMonth : true;
    return matchesSearch && matchesMonth;
  });

  const handleView = (report) => {
    setSelectedReport(report);
    setSelectedTherapist(""); // Reset for new view
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

  const handleStatusUpdate = async (actualIndexInMainList, newStatus) => {
    if (!selectedReport) return;

    // Create a copy of goals
    const updatedGoals = [...selectedReport.development_goals];
    updatedGoals[actualIndexInMainList] = { ...updatedGoals[actualIndexInMainList], status: newStatus };

    const updatedGoalsProcessed = selectedReport.goals ? [...selectedReport.goals] : [];
    if (updatedGoalsProcessed[actualIndexInMainList]) {
      updatedGoalsProcessed[actualIndexInMainList] = { ...updatedGoalsProcessed[actualIndexInMainList], status: newStatus };
    }

    const updatedReport = { ...selectedReport, development_goals: updatedGoals, goals: updatedGoalsProcessed };
    
    // Update local state for immediate feedback
    setSelectedReport(updatedReport);
    setReports(prev => prev.map(r => (r.id === updatedReport.id || (r.registration_number === updatedReport.registration_number && r.date === updatedReport.date)) ? updatedReport : r));

    try {
      // Use the smart UPSERT POST logic we implemented earlier
      const result = await apiRequest(`${BASE_URL}development-goals/`, "POST", {
        registration_number: updatedReport.registration_number,
        date: updatedReport.date,
        development_goals: updatedGoals
      });

      if (!result.success) {
        console.error("Failed to update status on server:", result.error);
      }
    } catch (err) {
      console.error("Status update error:", err);
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
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
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
            .goals-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #cbd5e1; }
            .goals-table th { background: #f8fafc; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; font-size: 0.9rem; text-align: left; }
            .goals-table td { border: 1px solid #cbd5e1; padding: 10px; font-size: 0.9rem; color: #334155; }
            
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
          </style>
        </head>
        <body>
          <div class="Watermark">OFFICIAL CLINICAL RECORD</div>
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
                <Watermark>OFFICIAL DEVELOPMENT RECORD</Watermark>

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
                      <h5>{therapy}</h5>
                      <div className="goals-table-wrapper">
                        <table className="goals-table">
                          <thead>
                            <tr>
                              <th style={{ width: '6%', textAlign: 'center' }}>S.No</th>
                              <th style={{ width: '44%', textAlign: 'left' }}>Goal / Target</th>
                              <th style={{ width: '20%', textAlign: 'left' }}>Domain</th>
                              <th style={{ width: '15%', textAlign: 'center' }}>Level</th>
                              <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
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
                                <tr key={i}>
                                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                                  <td style={{ textAlign: 'left' }}>{g.goal || g.goal_name || "No description"}</td>
                                  <td style={{ textAlign: 'left' }}>{g.domain || "---"}</td>
                                  <td style={{ textAlign: 'center' }}>{g.level || "---"}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className={`status-badge-text ${statusClass}`}>
                                      {g.status}
                                    </span>
                                    
                                    <div className="no-print" style={{ marginTop: '8px' }}>
                                      <StatusQuickSelector className="StatusQuickSelector">
                                          {STATUS_OPTIONS.map(opt => (
                                              <button 
                                                  key={opt}
                                                  className={g.status === opt ? 'active' : ''}
                                                  onClick={() => handleStatusUpdate(actualIndex, opt)}
                                                  title={opt}
                                              >
                                                  {STATUS_SHORT[opt]}
                                              </button>
                                          ))}
                                      </StatusQuickSelector>
                                    </div>
                                  </td>
                                </tr>
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
                            return match ? (
                              <>
                                <span className="therapist-sub-details">{match.qualification || ""}</span>
                                <span className="therapist-sub-details">{match.designation || "Psychologist"}</span>
                              </>
                            ) : null;
                          })()}
                        </>
                      ) : (
                        <>
                          <span className="therapist-printed-name">{selectedReport.created_by_name || "Ms. Sivashankari"}</span>
                          <span className="therapist-sub-details">{selectedReport.created_by_qualification || "M.sc Clinical Psychology, B.sc PJCS"}</span>
                          <span className="therapist-sub-details">{selectedReport.created_by_designation || "Psychologist"}</span>
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
              </ReportSheet>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ThemeProvider>
  );
};

// --- Styled Components ---

const Container = styled.div`
  max-width: 100%;
  margin: 20px 40px;
  font-family: 'Inter', sans-serif;
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
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
  margin: 0 0 6px 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin: 0;
  font-size: 0.95rem;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
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
`;

const ModalContent = styled.div`
  background: white; width: 100%; max-width: 900px; max-height: 90vh;
  border-radius: 20px; overflow-y: auto; position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const ModalHeader = styled.div`
  background: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10;
  .header-info { display: flex; align-items: center; gap: 12px; h3 { margin: 0; font-size: 1.1rem; } }
  .actions { display: flex; gap: 15px; }
  .print-btn { background: ${props => props.theme.colors.primary}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
  .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
`;

const ReportSheet = styled.div`
  background: white; padding: 60px; position: relative; color: #1e293b;
  min-height: 1000px;
  @media print { padding: 0; }

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
  }
  
  .goals-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1px solid #cbd5e1;
    th {
      background: #f8fafc;
      color: #1e293b;
      font-weight: bold;
      border: 1px solid #cbd5e1;
      padding: 10px;
      font-size: 0.9rem;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 10px;
      font-size: 0.9rem;
      color: #334155;
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
    
    /* Dynamic colors for statuses if you want */
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
`;

const GlobalPrintStyle = createGlobalStyle`
  @media print {
    body { 
      background: white !important; 
      padding: 0 !important; 
      margin: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print, .no-print *, button, select, .StatusQuickSelector { display: none !important; }
    
    #root > div > *:not(.ModalOverlay) { display: none !important; }
    .ModalOverlay { position: static !important; background: none !important; padding: 0 !important; display: block !important; }
    .ModalContent { 
        position: static !important; max-width: none !important; max-height: none !important; 
        box-shadow: none !important; overflow: visible !important; width: 100% !important;
    }
    
    #printable-report { 
      padding: 0 !important; 
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
    
    @page { margin: 2cm; }
  }
`;

const LoadingWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 20px;
  .spinner { animation: spin 1s linear infinite; color: #406147; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default DevelopmentGoalsReport;
