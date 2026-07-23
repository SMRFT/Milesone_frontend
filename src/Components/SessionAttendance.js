import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Users, Calendar, Clock, CheckCircle, Search, X, AlertCircle, FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styledComponents = styled;
const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const SessionAttendance = () => {
  
  // Tab 1: Mark Attendance State
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [attendanceDate, setAttendanceDate] = useState(getTodayDateString());
  const [therapies, setTherapies] = useState([]);
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab 2: Under-attended Report State
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [reportYear, setReportYear] = useState(currentYear);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Modal State for Under-attended Card Click
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState(null); // { registration_number, patient_name, dob }
  const [modalDate, setModalDate] = useState(getTodayDateString());
  const [modalTherapies, setModalTherapies] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

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
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await apiRequest(`${Milestonebaseurl}all-patient-filterless/`, "GET");
      if (response && response.success) {
        setPatients(response.data);
      } else {
        toast.error("Failed to load patient list");
      }
    } catch (error) {
      toast.error("Failed to load patient list");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${Milestonebaseurl}get-consulting-doctors/`, "GET");
      // Django returns list directly or inside success
      if (response) {
        const docList = Array.isArray(response) ? response : (response.data || []);
        setDoctors(docList);
      }
    } catch (error) {
      console.error("Failed to load consulting doctors", error);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.name_of_child} (${patient.registration_number})`);
    setShowDropdown(false);
    setErrorMsg("");
  };

  // Auto-load when patient or date changes in main mark tab
  useEffect(() => {
    if (selectedPatient && attendanceDate) {
      loadAttendanceData();
    } else {
      setTherapies([]);
      setErrorMsg("");
    }
  }, [selectedPatient, attendanceDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const url = `${Milestonebaseurl}session-attendance/load/?registration_number=${encodeURIComponent(
        selectedPatient.registration_number
      )}&attendance_date=${attendanceDate}`;
      const response = await apiRequest(url, "GET");

      if (response && response.success) {
        setTherapies(response.data.therapies || []);
        setSlots(response.data.slots || []);
      } else {
        setTherapies([]);
        if (response.status === 404) {
          setErrorMsg("No attendance record found for this patient in this month. Please register patient's attendance first.");
        } else {
          setErrorMsg(response.error || "Failed to load session attendance data.");
        }
      }
    } catch (err) {
      setTherapies([]);
      setErrorMsg("Failed to load session attendance data.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load in modal when date or patient changes
  useEffect(() => {
    if (isModalOpen && modalPatient && modalDate) {
      loadModalAttendanceData();
    }
  }, [isModalOpen, modalPatient, modalDate]);

  const loadModalAttendanceData = async () => {
    setModalLoading(true);
    setModalError("");
    try {
      const url = `${Milestonebaseurl}session-attendance/load/?registration_number=${encodeURIComponent(
        modalPatient.registration_number
      )}&attendance_date=${modalDate}`;
      const response = await apiRequest(url, "GET");

      if (response && response.success) {
        setModalTherapies(response.data.therapies || []);
        setSlots(response.data.slots || []);
      } else {
        setModalTherapies([]);
        if (response.status === 404) {
          setModalError("No monthly attendance record found for this date. Please create their monthly attendance card first.");
        } else {
          setModalError(response.error || "Failed to load session attendance.");
        }
      }
    } catch (err) {
      setModalTherapies([]);
      setModalError("Failed to load session attendance.");
    } finally {
      setModalLoading(false);
    }
  };

  // Fetch report data
  const fetchReportData = async () => {
    setReportLoading(true);
    try {
      const url = `${Milestonebaseurl}session-attendance/underattended/?month=${reportMonth}&year=${reportYear}`;
      const response = await apiRequest(url, "GET");
      if (response && response.success) {
        setReportData(response.data.data || []);
      } else {
        toast.error(response.error || "Failed to load report data");
      }
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportMonth, reportYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, reportMonth, reportYear]);

  const handleCheckboxChange = (index, val) => {
    const updated = [...therapies];
    updated[index].attended = val;
    setTherapies(updated);
  };

  const handleSlotChange = (index, slotId) => {
    const updated = [...therapies];
    updated[index].attended_slot = slotId;
    const matchedSlot = slots.find(s => s.slot_id === slotId);
    if (matchedSlot) {
      updated[index].slot_label = matchedSlot.label;
    }
    setTherapies(updated);
  };

  const handleTherapistChange = (index, therapistValue) => {
    const updated = [...therapies];
    updated[index].therapist = therapistValue;
    setTherapies(updated);
  };

  const handleSessionsChange = (index, value) => {
    const num = parseInt(value, 10);
    const updated = [...therapies];
    updated[index].sessions_attended = isNaN(num) || num < 1 ? 1 : num;
    setTherapies(updated);
  };

  // Modal Handlers
  const handleModalCheckboxChange = (index, val) => {
    const updated = [...modalTherapies];
    updated[index].attended = val;
    setModalTherapies(updated);
  };

  const handleModalSlotChange = (index, slotId) => {
    const updated = [...modalTherapies];
    updated[index].attended_slot = slotId;
    const matchedSlot = slots.find(s => s.slot_id === slotId);
    if (matchedSlot) {
      updated[index].slot_label = matchedSlot.label;
    }
    setModalTherapies(updated);
  };

  const handleModalTherapistChange = (index, therapistValue) => {
    const updated = [...modalTherapies];
    updated[index].therapist = therapistValue;
    setModalTherapies(updated);
  };

  const handleModalSessionsChange = (index, value) => {
    const num = parseInt(value, 10);
    const updated = [...modalTherapies];
    updated[index].sessions_attended = isNaN(num) || num < 1 ? 1 : num;
    setModalTherapies(updated);
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      toast.warning("Please select a patient");
      return;
    }
    if (!attendanceDate) {
      toast.warning("Please select a date");
      return;
    }

    const checkedTherapies = therapies
      .filter((t) => t.attended)
      .map((t) => ({
        therapy_id: t.therapy_id,
        therapy_name: t.therapy_name,
        attended_slot: t.attended_slot,
        slot_label: t.slot_label,
        therapist: t.therapist || "",
        sessions_attended: t.sessions_attended,
      }));

    const hasMissingTherapist = checkedTherapies.some((t) => !t.therapist);
    if (hasMissingTherapist) {
      toast.warning("Please select a therapist for all marked therapies.");
      return;
    }

    const payload = {
      registration_number: selectedPatient.registration_number,
      attendance_date: attendanceDate,
      checked_therapies: checkedTherapies,
      all_therapies: therapies,
    
    };

    try {
      const response = await apiRequest(`${Milestonebaseurl}session-attendance/save/`, "POST", payload);
      if (response && response.success) {
        toast.success("Session attendance saved successfully");
        loadAttendanceData();
      } else {
        toast.error(response.error || "Failed to save session attendance");
      }
    } catch (error) {
      toast.error("Failed to save session attendance");
    }
  };

  const handleModalSave = async () => {
    if (!modalPatient) return;
    
    const checkedTherapies = modalTherapies
      .filter((t) => t.attended)
      .map((t) => ({
        therapy_id: t.therapy_id,
        therapy_name: t.therapy_name,
        attended_slot: t.attended_slot,
        slot_label: t.slot_label,
        therapist: t.therapist || "",
        sessions_attended: t.sessions_attended,
      }));

    const hasMissingTherapist = checkedTherapies.some((t) => !t.therapist);
    if (hasMissingTherapist) {
      toast.warning("Please select a therapist for all marked therapies.");
      return;
    }

    const payload = {
      registration_number: modalPatient.registration_number,
      attendance_date: modalDate,
      checked_therapies: checkedTherapies,
      all_therapies: modalTherapies,
      "auth-user-id": localStorage.getItem("auth-user-id") || "Admin"
    };

    try {
      const response = await apiRequest(`${Milestonebaseurl}session-attendance/save/`, "POST", payload);
      if (response && response.success) {
        toast.success("Session attendance logged successfully");
        setIsModalOpen(false);
        fetchReportData();
      } else {
        toast.error(response.error || "Failed to save session attendance");
      }
    } catch (error) {
      toast.error("Failed to save session attendance");
    }
  };

  const openModal = (patient) => {
    setModalPatient(patient);
    setModalDate(getTodayDateString());
    setIsModalOpen(true);
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.registration_number?.toLowerCase().includes(query) ||
      p.name_of_child?.toLowerCase().includes(query)
    );
  });

  const filteredReportData = reportData.filter((row) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = row.patient_name?.toLowerCase().includes(query);
    const matchesReg = row.registration_number?.toLowerCase().includes(query);
    const matchesTherapy = row.underattended_therapies?.some((t) =>
      t.therapy_name?.toLowerCase().includes(query)
    );

    return matchesName || matchesReg || matchesTherapy;
  });

  const sortedReportData = [...filteredReportData].sort((a, b) =>
    (a.patient_name || "").localeCompare(b.patient_name || "")
  );

  const totalPages = Math.ceil(sortedReportData.length / PAGE_SIZE);
  const displayedReportData = sortedReportData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <Clock size={48} strokeWidth={2} />
          </IconWrapper>
          <TitleContent>
            <Title>Session Attendance</Title>
            <Subtitle>Monitor monthly scheduled versus attended sessions</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      {/* Under-attended Children Section */}
      <ContentCard>
        <SectionHeader>
          <FileText size={24} style={{ color: "#557153" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", margin: 0 }}>Under-attended Children List</h2>
          <span style={{
            marginLeft: "auto",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            borderRadius: "8px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            A–Z sorted
          </span>
        </SectionHeader>

        <FilterBar>
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
          <FilterItem style={{ width: "160px" }}>
            <Label>Month</Label>
            <Select value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FilterItem>
          <FilterItem style={{ width: "120px" }}>
            <Label>Year</Label>
            <Select value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </FilterItem>
          <FilterItem style={{ display: "flex", alignItems: "flex-end" }}>
            <RefreshButton onClick={fetchReportData}>
              Refresh Data
            </RefreshButton>
          </FilterItem>
        </FilterBar>

        {reportLoading ? (
          <LoadingState>
            <Spinner />
            <p>Fetching under-attended children list...</p>
          </LoadingState>
        ) : sortedReportData.length === 0 ? (
          <EmptyState>
            <CheckCircle size={64} style={{ color: "#a1c181", marginBottom: "1rem" }} />
            <h3>All Up to Date!</h3>
            <p>No children were found with attended sessions fewer than their scheduled sessions for the selected month.</p>
          </EmptyState>
        ) : (
          <>
            <CardScrollWrapper>
              <CardGrid>
                {displayedReportData.map((row, idx) => (
                  <PatientCard key={idx} onClick={() => openModal(row)}>
                    <CardHeader>
                      <CardHeaderIcon>
                        <Users size={20} />
                      </CardHeaderIcon>
                      <CardHeaderTitle>
                        <h4>{row.patient_name}</h4>
                        <p>Reg: {row.registration_number}</p>
                      </CardHeaderTitle>
                    </CardHeader>
                    <CardBody>
                      <p><strong>DOB:</strong> {row.dob}</p>
                      {row.underattended_therapies?.map((t, tIdx) => (
                        <TherapyProgressWrapper key={tIdx}>
                          <TherapyLabel>{t.therapy_name}</TherapyLabel>
                          <ProgressSection>
                            <ProgressText>
                              <span>Attended Sessions</span>
                              <span>{t.attended_sessions} / {t.scheduled_sessions}</span>
                            </ProgressText>
                            <ProgressBarOuter>
                              <ProgressBarInner
                                pct={(t.attended_sessions / t.scheduled_sessions) * 100}
                              />
                            </ProgressBarOuter>
                          </ProgressSection>
                        </TherapyProgressWrapper>
                      ))}
                    </CardBody>
                    <CardFooter>
                      <span>Click to Log Attendance</span>
                      <Plus size={16} />
                    </CardFooter>
                  </PatientCard>
                ))}
              </CardGrid>
            </CardScrollWrapper>

            {totalPages > 1 && (
              <PaginationWrapper>
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

      {/* Modal for Logging Attendance for Under-attended Child */}
      {isModalOpen && modalPatient && (
        <ModalBackdrop onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Log Session Attendance</h3>
              <CloseModalButton onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </CloseModalButton>
            </ModalHeader>

            <ModalBodyScroll>
              <ModalPatientInfo>
                <InfoItem>
                  <strong>Child Name:</strong>
                  <span>{modalPatient.patient_name}</span>
                </InfoItem>
                <InfoItem>
                  <strong>Registration No:</strong>
                  <span>{modalPatient.registration_number}</span>
                </InfoItem>
                <InfoItem>
                  <strong>Date of Birth:</strong>
                  <span>{modalPatient.dob}</span>
                </InfoItem>
              </ModalPatientInfo>

              <ModalDateSelector>
                <Label>Choose Date</Label>
                <DateInputContainer>
                  <Calendar size={18} style={{ marginRight: "10px", color: "#557153" }} />
                  <DateInput
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                  />
                </DateInputContainer>
              </ModalDateSelector>

              {modalLoading ? (
                <ModalLoading>
                  <Spinner />
                  <p>Loading therapies list...</p>
                </ModalLoading>
              ) : modalError ? (
                <ModalError>
                  <AlertCircle size={32} />
                  <p>{modalError}</p>
                </ModalError>
              ) : modalTherapies.length === 0 ? (
                <ModalError>
                  <AlertCircle size={32} />
                  <p>No therapies configured for this child's attendance.</p>
                </ModalError>
              ) : (
                <ModalTherapiesList>
                  <Label style={{ marginBottom: "1rem" }}>Registered Therapies (Mark Attended Sessions)</Label>
                  {modalTherapies.map((t, idx) => (
                    <TherapyModalRow key={idx} className={t.attended ? "active" : ""}>
                      <TherapyRowLeft>
                        <Checkbox
                          type="checkbox"
                          checked={t.attended}
                          onChange={(e) => handleModalCheckboxChange(idx, e.target.checked)}
                          disabled={!!t.session_id}
                          style={{ marginRight: "12px" }}
                        />
                        <div>
                          <strong>{t.therapy_name}</strong>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", gap: "8px", alignItems: "center" }}>
                            <span>ID: {t.therapy_id || "N/A"}</span>
                            {t.session_id && (
                              <SessionBadge title="Session ID (Read-only)">
                                {t.session_id}
                              </SessionBadge>
                            )}
                          </div>
                        </div>
                      </TherapyRowLeft>

                      <TherapyRowControls>
                        <ControlField>
                          <small>Daily Time Slot</small>
                          <Select
                            value={t.attended_slot || ""}
                            onChange={(e) => handleModalSlotChange(idx, e.target.value)}
                            disabled={!t.attended || !!t.session_id}
                          >
                            <option value="">Select slot</option>
                            {slots.map((s) => (
                              <option key={s.slot_id} value={s.slot_id}>
                                {s.label}
                              </option>
                            ))}
                          </Select>
                        </ControlField>

                        <ControlField>
                          <small>Therapist</small>
                          <Select
                            value={t.therapist || ""}
                            onChange={(e) => handleModalTherapistChange(idx, e.target.value)}
                            disabled={!t.attended || !!t.session_id}
                          >
                            <option value="">Select therapist</option>
                            {doctors.map((d) => (
                              <option key={d.employee_id || d.name} value={d.employee_id || d.name}>
                                {d.name} {d.designation ? `(${d.designation})` : ""}
                              </option>
                            ))}
                          </Select>
                        </ControlField>

                        <ControlField style={{ width: "90px" }}>
                          <small>Sessions</small>
                          <NumberInput
                            type="number"
                            min="1"
                            value={t.sessions_attended || 1}
                            onChange={(e) => handleModalSessionsChange(idx, e.target.value)}
                            disabled={!t.attended || !!t.session_id}
                          />
                        </ControlField>
                      </TherapyRowControls>
                    </TherapyModalRow>
                  ))}
                </ModalTherapiesList>
              )}
            </ModalBodyScroll>

            <ModalFooter>
              <CancelModalBtn onClick={() => setIsModalOpen(false)}>
                Cancel
              </CancelModalBtn>
              <SaveModalBtn onClick={handleModalSave} disabled={modalLoading || !!modalError}>
                Save Session Attendance
              </SaveModalBtn>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default SessionAttendance;

// Styled Components
const Container = styledComponents.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c181 0%, rgba(122, 140, 104, 1) 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
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

  @media (max-width: 768px) {
    gap: 1rem;
  }
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
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styledComponents.p`
  font-size: 1.05rem;
  margin: 0.5rem 0 0;
  opacity: 0.95;
`;

const TabContainer = styledComponents.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TabButton = styledComponents.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: ${props => props.active ? "white" : "rgba(255, 255, 255, 0.25)"};
  color: ${props => props.active ? "#406147" : "white"};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? "white" : "rgba(255, 255, 255, 0.35)"};
  }
`;

const SectionHeader = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 1rem;
`;

const ContentCard = styledComponents.div`
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SelectionSection = styledComponents.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SearchWrapper = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateWrapper = styledComponents.div``;

const Label = styledComponents.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchInputContainer = styledComponents.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrapper = styledComponents.div`
  color: #557153;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchInput = styledComponents.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: #f9fafb;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #557153;
    background: white;
    box-shadow: 0 0 0 4px rgba(85, 113, 83, 0.1);
  }
`;

const ClearButton = styledComponents.button`
  position: absolute;
  right: 1rem;
  background: #e5e7eb;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d1d5db;
    color: #111827;
  }
`;

const DropdownList = styledComponents.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styledComponents.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }
`;

const DateInputContainer = styledComponents.div`
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  background: #f9fafb;

  &:focus-within {
    border-color: #557153;
    background: white;
    box-shadow: 0 0 0 4px rgba(85, 113, 83, 0.1);
  }
`;

const DateInput = styledComponents.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
  color: #111827;
  outline: none;
`;

const PatientBanner = styledComponents.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  color: #166534;
`;

const TableContainer = styledComponents.div`
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const Table = styledComponents.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1.25rem 1.5rem;
    text-align: left;
  }

  th {
    background: #f9fafb;
    font-weight: 700;
    color: #4b5563;
    border-bottom: 2px solid #e5e7eb;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }

  tr.attended-row {
    background-color: #f7fee7;

    &:hover {
      background-color: #f3fede;
    }
  }
`;

const CheckboxContainer = styledComponents.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Checkbox = styledComponents.input`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #d1d5db;
  cursor: pointer;
  accent-color: #557153;

  &:focus {
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.25);
  }
`;

const Select = styledComponents.select`
  width: 100%;
  padding: 0.625rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #557153;
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.15);
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }
`;

const NumberInputContainer = styledComponents.div`
  display: flex;
  justify-content: center;
`;

const NumberInput = styledComponents.input`
  width: 90px;
  padding: 0.625rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #557153;
    box-shadow: 0 0 0 3px rgba(85, 113, 83, 0.15);
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }
`;

const ActionsContainer = styledComponents.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const SaveButton = styledComponents.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #557153;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(85, 113, 83, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: #406147;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(85, 113, 83, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FilterBar = styledComponents.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FilterItem = styledComponents.div`
  flex: 1;
`;

const RefreshButton = styledComponents.button`
  background: #557153;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 42px;

  &:hover {
    background: #406147;
  }
`;

const EmptyState = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;

  h3 {
    margin: 1rem 0 0.5rem;
    color: #374151;
    font-size: 1.25rem;
    font-weight: 600;
  }

  p {
    max-width: 400px;
    margin: 0;
    font-size: 0.95rem;
  }
`;

const ErrorState = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 16px;

  h3 {
    margin: 1rem 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
  }

  p {
    max-width: 450px;
    margin: 0;
    font-size: 0.95rem;
    color: #991b1b;
  }
`;

const LoadingState = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;

  p {
    margin-top: 1rem;
    font-weight: 500;
  }
`;

const Spinner = styledComponents.div`
  border: 4px solid #f3f4f6;
  border-top: 4px solid #557153;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Card Layout Elements
const CardScrollWrapper = styledComponents.div`
  max-height: 600px;
  overflow-y: auto;
  padding-right: 4px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f1;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #a1c181;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #557153;
  }
`;

const CardGrid = styledComponents.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PatientCard = styledComponents.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.15);
    border-color: #a1c181;
  }
`;

const CardHeader = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CardHeaderIcon = styledComponents.div`
  background: #f0fdf4;
  color: #557153;
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardHeaderTitle = styledComponents.h4`
  margin: 0;
  
  h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 2px 0 0 0;
  }
`;

const CardBody = styledComponents.div`
  flex: 1;

  p {
    font-size: 0.9rem;
    color: #4b5563;
    margin: 0 0 0.75rem 0;
  }
`;

const TherapyBadge = styledComponents.span`
  background: #f3f4f6;
  color: #1f2937;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 1rem;
`;

const TherapyProgressWrapper = styledComponents.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
  &:first-of-type {
    border-top: none;
    padding-top: 0;
    margin-top: 0.5rem;
  }
`;

const TherapyLabel = styledComponents.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ProgressSection = styledComponents.div`
  margin-top: auto;
`;

const ProgressText = styledComponents.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.35rem;
`;

const ProgressBarOuter = styledComponents.div`
  background: #e5e7eb;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressBarInner = styledComponents.div`
  background: #557153;
  height: 100%;
  border-radius: 99px;
  width: ${props => props.pct}%;
  transition: width 0.3s ease;
`;

const CardFooter = styledComponents.div`
  margin-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: #557153;
`;

// Modal Components
const ModalBackdrop = styledComponents.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styledComponents.div`
  background: white;
  width: 100%;
  max-width: 900px;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const ModalHeader = styledComponents.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: #111827;
  }
`;

const CloseModalButton = styledComponents.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    color: #111827;
  }
`;

const ModalBodyScroll = styledComponents.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const ModalPatientInfo = styledComponents.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const InfoItem = styledComponents.div`
  strong {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
  }
  span {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }
`;

const ModalDateSelector = styledComponents.div`
  margin-bottom: 1.5rem;
  max-width: 300px;
`;

const ModalTherapiesList = styledComponents.div`
  border-top: 1px dashed #e5e7eb;
  padding-top: 1.5rem;
`;

const TherapyModalRow = styledComponents.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  &.active {
    border-color: #a1c181;
    background: #f7fee7;
  }
`;

const TherapyRowLeft = styledComponents.div`
  display: flex;
  align-items: center;
  flex: 1;

  strong {
    font-size: 1.05rem;
    color: #111827;
  }
`;

const TherapyRowControls = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 2;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;

const ControlField = styledComponents.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 120px;

  small {
    font-size: 0.7rem;
    font-weight: 600;
    color: #4b5563;
    text-transform: uppercase;
  }
`;

const ModalFooter = styledComponents.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelModalBtn = styledComponents.button`
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 0.625rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    color: #111827;
  }
`;

const SaveModalBtn = styledComponents.button`
  background: #557153;
  border: none;
  border-radius: 10px;
  padding: 0.625rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #406147;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const ModalLoading = styledComponents.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
  p { margin-top: 0.5rem; }
`;

const ModalError = styledComponents.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  color: #b91c1c;
  font-size: 0.95rem;
  margin: 1rem 0;
`;

const SessionBadge = styledComponents.span`
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
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
