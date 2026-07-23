import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Eye, Edit, Search, FileText, Calendar,
  Loader2, ArrowLeft, X, Printer, CheckCircle2,
  User, Phone, Clock
} from "lucide-react";
import apiRequest from "./apiRequest";

const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();

const GoalsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const getOneMonthAgoString = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getOneMonthAgoString());
  const [toDate, setToDate] = useState(getTodayString());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}goals/`;
      const params = [];
      if (fromDate) params.push(`from_date=${fromDate}`);
      if (toDate) params.push(`to_date=${toDate}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const result = await apiRequest(url, "GET");
      if (result.success) setReports(result.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse the goals regardless of if they come as a String or OrderedDict string
  const parseGoals = (rawGoals) => {
    if (!rawGoals) return [];

    let parsed = [];
    if (typeof rawGoals === 'object') {
      parsed = rawGoals;
    } else {
      try {
        parsed = JSON.parse(rawGoals);
      } catch (initialError) {
        try {
          let cleaned = rawGoals
            .replace(/OrderedDict\(\[/g, "{")
            .replace(/\]\)/g, "}")
            .replace(/\('([^']+)',\s*'([^']*)'\)/g, '"$1": "$2"')
            .replace(/\('([^']+)',\s*"([^"]*)"\)/g, '"$1": "$2"');
          parsed = JSON.parse(cleaned);
        } catch (err) {
          console.error("Failed to parse goals:", err, "\nRaw Input:", rawGoals);
          return [];
        }
      }
    }

    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed && typeof parsed === 'object') {
      const list = [];
      if (parsed.ShortTerm) list.push(...parsed.ShortTerm);
      if (parsed.LongTerm) list.push(...parsed.LongTerm);
      return list;
    }
    return [];
  };

  const pythonStringToJson = (rawStr) => {
    if (!rawStr || typeof rawStr !== 'string') return rawStr;
    try {
      // 1. Turn OrderedDict([...]) into {...} or standard JSON
      let cleaned = rawStr
        .replace(/OrderedDict\(\[/g, "{")
        .replace(/\]\)/g, "}")
        // 2. Convert Python tuples ('key', 'value') into JSON "key": "value"
        .replace(/\('([^']+)',\s*'([^']*)'\)/g, '"$1": "$2"')
        .replace(/\('([^']+)',\s*"([^"]*)"\)/g, '"$1": "$2"')
        // 3. Handle Python boolean/null
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
        .replace(/None/g, 'null');

      return JSON.parse(cleaned);
    } catch (e) {
      // If the above regex approach fails, try a simpler fallback
      try {
        // Maybe it's just a standard JSON string
        return JSON.parse(rawStr);
      } catch (e2) {
        console.error("Python string to JSON failed:", e, "\nRaw:", rawStr);
        return rawStr; // Return as is, let the fallback in parseMedia handle it
      }
    }
  };

  const parseMedia = (rawMedia) => {
    if (!rawMedia) return [];
    if (Array.isArray(rawMedia)) {
      // Deep parse if elements are strings
      return rawMedia.map(item => (typeof item === 'string' && item.includes('OrderedDict')) ? pythonStringToJson(item) : item);
    }

    if (typeof rawMedia === 'string') {
      if (rawMedia.startsWith('[') || rawMedia.includes('OrderedDict')) {
        const result = pythonStringToJson(rawMedia);
        return Array.isArray(result) ? result : [result];
      }
      try {
        const parsed = JSON.parse(rawMedia);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Failed to parse media field:", e);
        return [rawMedia]; // Keep it as a potential ID
      }
    }
    return rawMedia;
  };

  // Helper function to keep your mapping logic clean
  const groupGoalsByCategory = (arr) => {
    const result = { ShortTerm: [], LongTerm: [] };

    if (!Array.isArray(arr)) return result;

    arr.forEach((item) => {
      if (!item.category) item.category = "ShortTerm";
      result[item.category] = result[item.category] || [];

      // Pushing the whole 'item' object instead of just 'item.task'. 
      // This ensures {t.status} renders correctly in your JSX mapping later!
      result[item.category].push(item);
    });

    return result;
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient_details?.name_of_child?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleView = (report) => {
    // Parse goals before setting to state to ensure the modal can map over them
    const normalizedReport = {
      ...report,
      goals: parseGoals(report.goals),
      goalsphoto: parseMedia(report.goalsphoto),
      goalsvideo: parseMedia(report.goalsvideo)
    };
    setSelectedReport(normalizedReport);
    setIsModalOpen(true);
  };

  const handleEdit = (report) => {
    // Navigating with the full report and the patient_details structure the Goals form expects
    navigate("/Goals", {
      state: {
        assessment: report.patient_details, // Passing full patient context
        editData: {
          ...report,
          goals: parseGoals(report.goals),
          goalsphoto: parseMedia(report.goalsphoto),
          goalsvideo: parseMedia(report.goalsvideo)
        }
      }
    });
  };

  const getMediaUrl = (item) => {
    if (!item) return "";

    // If it's a string, it's just an ID
    if (typeof item === 'string') return `${BASE_URL}goals/file/${item}/`;

    // If it's an object, check for url or file/id
    let url = item.url || item.path;
    const id = item.file || item.id;

    if (url) {
      // If it's already an absolute URL, return it
      if (url.startsWith('http')) return url;
      // If it's a relative path, prepend BASE_URL
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      return `${BASE_URL}${cleanUrl}`;
    }

    if (id) {
      return `${BASE_URL}goals/file/${id}/`;
    }

    return "";
  };

  const bufferFile = async (item) => {
    const url = getMediaUrl(item);
    if (!url) return;

    setBuffering(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error("Buffering failed:", err);
      window.open(url, '_blank');
    } finally {
      setBuffering(false);
    }
  };

  const updateGoalStatus = async (index, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "finish" : "pending";

    // 1. Update local state for immediate feedback
    const updatedGoals = [...selectedReport.goals];
    updatedGoals[index] = { ...updatedGoals[index], status: newStatus };

    setSelectedReport(prev => ({ ...prev, goals: updatedGoals }));

    // 2. Prepare payload for backend
    const payload = {
      goals: updatedGoals.map(g => ({ task: g.task, status: g.status })),
      registration_number: selectedReport.registration_number
    };

    try {
      const result = await apiRequest(`${BASE_URL}goals/${selectedReport.id}/`, "PATCH", payload);
      if (result.success) {
        // Also update the main reports list so the change persists if the modal is closed/reopened
        setReports(prev => prev.map(r => r.id === selectedReport.id ? result.data : r));
      } else {
        alert("Failed to update status on server: " + (result.error || "Unknown error"));
        // Revert local state on failure
        setSelectedReport(prev => ({ ...prev, goals: selectedReport.goals }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("An error occurred while updating status.");
      // Revert local state on failure
      setSelectedReport(prev => ({ ...prev, goals: selectedReport.goals }));
    }
  };

  if (loading) return (
    <LoadingWrapper><Loader2 size={40} className="spinner" /><p>Loading...</p></LoadingWrapper>
  );

  return (
    <Container>
      <HeaderSection>
        <div className="title-group">
          <h2>Therapeutic Goals Dashboard</h2>
        </div>

        <FilterControls>
          <SearchBar>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search Reg No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>

          <DatePickerWrapper>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </DatePickerWrapper>

          <DatePickerWrapper>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DatePickerWrapper>
        </FilterControls>
      </HeaderSection>

      <TableCard>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Patient Name</th>
                <th>Assessment Date</th>
                <th>Deadline</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? filteredReports.map((report, idx) => (
                <tr key={report.id || idx}>
                  <td><strong>{report.registration_number}</strong></td>
                  <td>{report.patient_details?.name_of_child || "N/A"}</td>
                  <td>{report.date}</td>
                  <td><DeadlineBadge>{report.deadline}</DeadlineBadge></td>
                  <td>
                    <ActionGroup>
                      <button className="view-btn" onClick={() => handleView(report)}><Eye size={16} /> View</button>
                      <button className="edit-btn" onClick={() => handleEdit(report)}><Edit size={16} /> Edit</button>
                    </ActionGroup>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No records found</td></tr>
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
                <FileText size={20} color="#406147" />
                <h3>Clinical Record: {selectedReport.registration_number}</h3>
              </div>
              <div className="actions">
                <button className="print-btn" onClick={() => window.print()}>
                  <Printer size={18} /> Print
                </button>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
            </ModalHeader>

            <ReportSheet id="printable-report">
              <Watermark>OFFICIAL CLINICAL RECORD</Watermark>

              <header className="report-main-header">
                <h1>Therapeutic Goals Report</h1>
                <p className="clinic-name">Milestone Developmental Center</p>

                <PatientInfoGrid>
                  <div className="info-item">
                    <User size={16} />
                    <span><strong>Patient:</strong> {selectedReport.patient_details?.name_of_child}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <span><strong>Age:</strong> {selectedReport.patient_details?.age?.year}y {selectedReport.patient_details?.age?.months}m</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span><strong>Contact:</strong> {selectedReport.patient_details?.father_phone_number || selectedReport.patient_details?.mother_phone_number || "N/A"}</span>
                  </div>
                </PatientInfoGrid>

                <div className="badge-row">
                  <div className="report-badge"><strong>REG NO:</strong> {selectedReport.registration_number}</div>
                  <div className="report-badge"><strong>ASSESSMENT DATE:</strong> {selectedReport.date}</div>
                  <div className="report-badge deadline"><strong>REVIEW DEADLINE:</strong> {selectedReport.deadline}</div>
                </div>
              </header>

              <ReportSection>
                <h4><CheckCircle2 size={18} /> Detailed Therapeutic Goals</h4>
                <div className="goals-list">
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedReport.goals.length > 0 ? (
                      selectedReport.goals.map((t, i) => (
                        <li key={i} style={{
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.9rem',
                          padding: '6px 10px',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #f1f5f9'
                        }}>
                          <span style={{ flex: 1 }}>{typeof t === 'string' ? t : t.task}</span>
                          <StatusToggle
                            className="no-print"
                            isFinished={t.status === 'finish'}
                            onClick={() => updateGoalStatus(i, t.status)}
                          >
                            {t.status === 'finish' ? 'Finish' : 'Pending'}
                          </StatusToggle>
                          <span className="print-only" style={{ display: 'none' }}>
                            • {t.status || 'pending'}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No goals defined</li>
                    )}
                  </ul>
                </div>
              </ReportSection>

              <ReportSection>
                <h4>Clinical Notes & Recommendations</h4>
                <div className="notes-grid">
                  <div className="note-box">
                    <label>Parents Comments</label>
                    <p>{selectedReport.comments || "No clinical comments provided."}</p>
                  </div>
                  <div className="note-box">
                    <label>Recommendations</label>
                    <p>{selectedReport.recommendations || "No specific recommendations."}</p>
                  </div>
                </div>
              </ReportSection>

              {(selectedReport.goalsphoto?.length > 0 || selectedReport.goalsvideo?.length > 0) && (
                <ReportSection>
                  <h4>Clinical Documentation (Photos & Videos)</h4>

                  {selectedReport.goalsphoto?.length > 0 && (
                    <>
                      <h5 style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>PHOTOS</h5>
                      <div className="photo-display-grid">
                        {selectedReport.goalsphoto.map((item, i) => {
                          const url = getMediaUrl(item);
                          return (
                            <div key={`p-${i}`} className="report-photo-card">
                              <img
                                src={url}
                                alt={`Assessment photo ${i + 1}`}
                                onClick={() => bufferFile(item)}
                                style={{ opacity: buffering ? 0.6 : 1, cursor: buffering ? 'wait' : 'zoom-in' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {selectedReport.goalsvideo?.length > 0 && (
                    <>
                      <h5 style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '20px', marginBottom: '10px' }}>VIDEOS</h5>
                      <div className="video-display-grid">
                        {selectedReport.goalsvideo.map((item, i) => {
                          const url = getMediaUrl(item);
                          return (
                            <div key={`v-${i}`} className="report-video-card">
                              <video
                                controls
                                src={url}
                                preload="metadata"
                                style={{ width: '100%', borderRadius: '8px' }}
                              />
                              <button
                                onClick={() => bufferFile(item)}
                                className="no-print"
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '0.75rem',
                                  cursor: buffering ? 'wait' : 'pointer',
                                  zIndex: 5,
                                  fontWeight: '600',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                disabled={buffering}
                              >
                                {buffering ? 'Buffering...' : 'Download / Open in Tab'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </ReportSection>
              )}

              <ReportFooter>
                <div className="sig-row">
                  <div className="sig-item"><div className="line" /><span>Lead Therapist</span></div>
                  <div className="sig-item"><div className="line" /><span>Clinic Supervisor</span></div>
                </div>
                <p className="disclaimer">Computer generated on {new Date().toLocaleDateString()}. Assessment ID: {selectedReport.id || 'N/A'}</p>
              </ReportFooter>
            </ReportSheet>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};
// --- NEW STYLED COMPONENTS ---

const FilterControls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
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
    border-color: #406147;
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

const PatientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #e2e8f0;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #334155;
    svg { color: #406147; }
  }
`;

// ... (Paste all your previous styled components below this line) ...
// (Container, HeaderSection, SearchBar, Table, etc.)
// --- MODAL SPECIFIC STYLES ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #f1f5f9;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 12px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  background: white;
  padding: 15px 25px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #e2e8f0;
  position: sticky; top: 0; z-index: 10;

  .actions { display: flex; gap: 10px; }
  .print-btn { background: #406147; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px;}
  .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
`;

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
    align-items: center;
    gap: 15px;
    h2 { 
      color: #406147; 
      margin: 0; 
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
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
    border-color: #406147;
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

const TableCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.02);
  overflow: hidden;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
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
    white-space: nowrap;
  }
  td {
    padding: 18px 24px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.925rem;
    color: #334155;
    white-space: nowrap;
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

const DeadlineBadge = styled.span`
  background: #fff1f2; color: #be123c; padding: 4px 10px; border-radius: 6px;
  font-weight: 600; font-size: 0.85rem;
`;

const StatusToggle = styled.button`
  border: none;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.isFinished ? `
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
    &:hover { background: #bbf7d0; }
  ` : `
    background: #fef9c3;
    color: #854d0e;
    border: 1px solid #fef08a;
    &:hover { background: #fef08a; }
  `}

  @media print {
    display: none;
  }
`;

const StatusSummary = styled.span`
  color: #64748b; font-size: 0.85rem; font-family: monospace;
`;

const LoadingWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 80vh; gap: 15px;
  .spinner { animation: spin 1s linear infinite; color: #406147; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const ReportSheet = styled.div`
  background: white;
  padding: 60px;
  position: relative;
  min-height: 1000px;
  color: #1e293b;

  .report-main-header {
    text-align: center;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 30px;
    margin-bottom: 30px;
    h1 { color: #406147; font-size: 2.2rem; margin: 0; }
    .clinic-name { font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
  }

  .badge-row {
    display: flex; justify-content: center; gap: 15px; margin-top: 20px;
    .report-badge {
      background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 15px; border-radius: 20px; font-size: 0.8rem;
      &.deadline { color: #e11d48; border-color: #fecdd3; }
    }
  }
`;

const ReportSection = styled.div`
  margin-top: 25px;
  
  h4 {
    font-size: 0.9rem;
    color: #406147;
    text-transform: uppercase;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 8px;
    margin-bottom: 15px;
    letter-spacing: 0.5px;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .note-box {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 800;
      color: #94a3b8;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
      color: #334155;
      line-height: 1.5;
      white-space: pre-wrap; /* Maintains line breaks */
    }

    &.feedback {
      border-left: 4px solid #406147;
      background: #f0fdf4;
    }
  }

  .photo-display-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
    margin-top: 10px;
  }

  .report-photo-card {
    height: 180px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: zoom-in;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .video-display-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 10px;
  }

  .report-video-card {
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    
    video {
      width: 100%;
      display: block;
      aspect-ratio: 16/9;
    }
  }

  @media print {
    .report-photo-card, .report-video-card {
      break-inside: avoid;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const ReportFooter = styled.footer`
  margin-top: 60px;
  .sig-row { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .sig-item { width: 200px; text-align: center; 
    .line { border-top: 1px solid #cbd5e1; margin-bottom: 8px; }
    span { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
  }
  .disclaimer { text-align: center; font-size: 0.7rem; color: #cbd5e1; border-top: 1px solid #f8fafc; padding-top: 20px; }
`;

const Watermark = styled.div`
  position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 6rem; color: rgba(0,0,0,0.015); font-weight: 900; pointer-events: none; z-index: 0;
  white-space: nowrap;
`;

export default GoalsList;