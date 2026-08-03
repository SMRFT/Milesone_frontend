import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled, { css } from "styled-components";
import apiRequest from "./apiRequest";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

/* ----------------------------------------------------------------------
 * Design tokens
 * -------------------------------------------------------------------- */
const tokens = {
  ink: "#17261F",
  inkSoft: "#5E6F65",
  inkFaint: "#94A399",
  paper: "#F7F2E7",
  paperRaised: "#FFFFFF",
  line: "#E7DFC9",
  lineSoft: "#EFE9D8",
  pine: "#1F5C46",
  pineDeep: "#123529",
  pineSoft: "#E4EEE7",
  marigold: "#C6862F",
  marigoldSoft: "#F6E8D2",
  rose: "#B24B42",
  roseSoft: "#F5E2DE",
  sage: "#3F7D55",
  sageSoft: "#E4EEE5",
  radius: "18px",
  radiusSm: "10px",
  shadow: "0 1px 2px rgba(18,53,41,0.04), 0 10px 28px -14px rgba(18,53,41,0.14)",
  shadowLift: "0 6px 14px rgba(18,53,41,0.07), 0 26px 46px -20px rgba(18,53,41,0.26)",
  fontDisplay: "'Fraunces', 'Georgia', serif",
  fontBody: "'Inter', 'Segoe UI', sans-serif",
};

/* ----------------------------------------------------------------------
 * Styled components for Modals & Form UI
 * -------------------------------------------------------------------- */
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  width: 580px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const PatientInfoCard = styled.div`
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 2px solid #a1c181;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PatientInfoName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: hsla(90, 14%, 40%, 1.00);
  margin-bottom: 0.25rem;
`;

const PatientInfoReg = styled.div`
  font-size: 0.9rem;
  color: rgba(109, 121, 96, 1);
  font-weight: 600;
`;

const ChangePatientLink = styled.button`
  background: transparent;
  border: none;
  color: #2f6e5c;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  flex-shrink: 0;
`;

const EnquiryFabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1.5px solid ${tokens.line};
  background: ${tokens.paperRaised};
  color: ${tokens.pineDeep};
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease, color 0.2s ease;
  box-shadow: ${tokens.shadow};

  &:hover {
    background: ${tokens.pine};
    border-color: ${tokens.pine};
    color: #fff;
    transform: translateY(-1px);
  }
`;

const ModeToggleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 1.1rem;
`;

const ModeTab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${(p) => (p.$active ? "#1f2937" : "#9ca3af")};
`;

const ModeTabDot = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${(p) => (p.$active ? "#5c8a52" : "#d1d5db")};
  background: ${(p) => (p.$active ? "#5c8a52" : "transparent")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    display: ${(p) => (p.$active ? "block" : "none")};
  }
`;

const RequiredMark = styled.span`
  color: #b24b42;
`;

const SectionTitle = styled.h4`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HalfGroup = styled(FormGroup)`
  flex: 1;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  height: 52px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #a1c181;
    background: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  min-height: 84px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #a1c181;
    background: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0 1rem;
  transition: all 0.2s;
  height: 52px;

  &:focus-within {
    background: #fff;
    border-color: #a1c181;
    box-shadow: 0 0 0 4px rgba(161, 193, 129, 0.15);
  }

  ${(props) =>
    props.disabled &&
    css`
      background: #f3f4f6;
      opacity: 0.8;
      cursor: not-allowed;
    `}

  .icon {
    color: #9ca3af;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
`;

const StyledSelect = styled.select`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1f2937;
  height: 100%;
  width: 100%;
  cursor: pointer;
  appearance: none;
  &:focus {
    outline: none;
  }
`;

const BareInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1f2937;
  height: 100%;
  width: 100%;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #9ca3af;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
  margin-top: 4px;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  background: ${(props) => (props.isSelected ? "#f0fdf4" : "transparent")};

  &:hover {
    background: #f3f4f6;
  }

  .checkbox {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid ${(props) => (props.isSelected ? "#a1c181" : "#d1d5db")};
    background: ${(props) => (props.isSelected ? "#a1c181" : "white")};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  span {
    font-size: 0.9rem;
    color: #374151;
    display: flex;
    flex-direction: column;
    small {
      color: #9ca3af;
    }
  }
`;

const DropdownEmpty = styled.div`
  padding: 14px 10px;
  font-size: 0.85rem;
  color: #9ca3af;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

const SaveButton = styled.button`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #a1c181 0%, rgba(119, 143, 95, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const STATUS_STYLE = {
  Scheduled: { bg: tokens.marigoldSoft, fg: tokens.marigold, dot: tokens.marigold, label: "Scheduled" },
  Rescheduled: { bg: tokens.pineSoft, fg: tokens.pineDeep, dot: tokens.pine, label: "Rescheduled" },
  Completed: { bg: tokens.sageSoft, fg: tokens.sage, dot: tokens.sage, label: "Completed" },
  Cancelled: { bg: tokens.roseSoft, fg: tokens.rose, dot: tokens.rose, label: "Cancelled" },
};

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());

const formatDateLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" });
};

const formatShortDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const formatMonthLabel = (yearMonthStr) => {
  if (!yearMonthStr) return "";
  const [y, m] = yearMonthStr.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const apptKey = (a) => (a.appointment_id != null ? a.appointment_id : a.id || a._id || null);
const isPastDate = (iso) => (iso ? iso < todayISO() : false);

export default function AppointmentScheduling() {
  const [viewMode, setViewMode] = useState("day"); // "day" | "month"
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedMonth, setSelectedMonth] = useState(todayISO().slice(0, 7)); // "YYYY-MM"
  const [selectedTherapistTab, setSelectedTherapistTab] = useState("all");

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [monthAppointments, setMonthAppointments] = useState([]);
  const [loadingMonthAppointments, setLoadingMonthAppointments] = useState(false);

  const [dayDetailsModalDate, setDayDetailsModalDate] = useState(null); // ISO date when clicking month card

  const [therapists, setTherapists] = useState([]);
  const [therapistMap, setTherapistMap] = useState({});
  const [loadingTherapists, setLoadingTherapists] = useState(false);

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");

  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loadingEnquiriesList, setLoadingEnquiriesList] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [selectedEnquiryRecord, setSelectedEnquiryRecord] = useState(null);
  const [enquiryLocked, setEnquiryLocked] = useState(false);

  const [search, setSearch] = useState("");

  // Flexible Booking Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(todayISO());
  const [bookingStartTime, setBookingStartTime] = useState("10:00");
  const [bookingEndTime, setBookingEndTime] = useState("10:45");
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const [childName, setChildName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [patientLocked, setPatientLocked] = useState(false);

  const [bookingMode, setBookingMode] = useState("search");
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusBusyId, setStatusBusyId] = useState(null);

  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reassignTherapistId, setReassignTherapistId] = useState("");
  const [reassignDate, setReassignDate] = useState(todayISO());
  const [reassignStartTime, setReassignStartTime] = useState("10:00");
  const [reassignEndTime, setReassignEndTime] = useState("10:45");
  const [reassignBusy, setReassignBusy] = useState(false);

  // Enquiry Form modal
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryChildName, setEnquiryChildName] = useState("");
  const [enquiryAge, setEnquiryAge] = useState("");
  const [enquiryAddress, setEnquiryAddress] = useState("");
  const [enquiryProblem, setEnquiryProblem] = useState("");
  const [enquiryMobile, setEnquiryMobile] = useState("");
  const [enquirySaving, setEnquirySaving] = useState(false);

  /* ---------------- API Loaders ---------------- */

  const loadTherapists = useCallback(async () => {
    setLoadingTherapists(true);
    const res = await apiRequest(`${Milestonebaseurl}get_all_therapists/`, "GET");
    if (res.success) {
      const list = res.data?.data || [];
      setTherapists(list);
      const map = {};
      list.forEach((t) => {
        map[t.employeeId] = t.employeeName;
      });
      setTherapistMap(map);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load the therapist list." });
    }
    setLoadingTherapists(false);
  }, []);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    const res = await apiRequest(`${Milestonebaseurl}get_all_patient_details/`, "GET");
    if (res.success) {
      setPatients(res.data?.data || res.data || []);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load the patient list." });
    }
    setLoadingPatients(false);
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiriesList(true);
    const res = await apiRequest(`${Milestonebaseurl}enquiryform/`, "GET");
    if (res.success) {
      setEnquiriesList(res.data?.data || res.data || []);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load the enquiry list." });
    }
    setLoadingEnquiriesList(false);
  }, []);

  const loadAppointments = useCallback(async (dateISO) => {
    setLoadingAppointments(true);
    const res = await apiRequest(
      `${Milestonebaseurl}get_appointments_by_date/?date=${dateISO}`,
      "GET"
    );
    if (res.success) {
      const data = res.data?.data || [];
      setAppointments(data);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load appointments for this date." });
    }
    setLoadingAppointments(false);
  }, []);

  const loadMonthAppointments = useCallback(async (yearMonthStr) => {
    setLoadingMonthAppointments(true);
    const [year, month] = yearMonthStr.split("-");
    const res = await apiRequest(
      `${Milestonebaseurl}get_appointments_by_month/?year=${year}&month=${month}`,
      "GET"
    );
    if (res.success) {
      setMonthAppointments(res.data?.data || []);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load month appointments." });
    }
    setLoadingMonthAppointments(false);
  }, []);

  useEffect(() => {
    loadTherapists();
    loadPatients();
    loadEnquiries();
  }, [loadTherapists, loadPatients, loadEnquiries]);

  useEffect(() => {
    if (viewMode === "day") {
      loadAppointments(selectedDate);
    } else {
      loadMonthAppointments(selectedMonth);
    }
  }, [selectedDate, selectedMonth, viewMode, loadAppointments, loadMonthAppointments]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- Date & Month Navigation Helpers ---------------- */

  const navigateDay = (offsetDays) => {
    const current = new Date(selectedDate + "T00:00:00");
    current.setDate(current.getDate() + offsetDays);
    const newIso = toISO(current);
    setSelectedDate(newIso);
  };

  const navigateMonth = (offsetMonths) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const date = new Date(y, m - 1 + offsetMonths, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, "0");
    const newMonthStr = `${newY}-${newM}`;
    setSelectedMonth(newMonthStr);
    loadMonthAppointments(newMonthStr);
  };

  /* ---------------- Month Grid Generation ---------------- */

  const monthDaysGrid = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const firstDayIndex = new Date(y, m - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(y, m, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isPadding: true, key: `pad-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${y}-${pad(m)}-${pad(day)}`;
      cells.push({
        isPadding: false,
        dayNumber: day,
        dateISO: iso,
        key: iso,
      });
    }

    return cells;
  }, [selectedMonth]);

  const getAppointmentsForDayISO = useCallback(
    (iso) => {
      const sourceList = viewMode === "month" ? monthAppointments : appointments;
      return sourceList.filter((a) => {
        if (a.date !== iso) return false;
        if (selectedTherapistTab !== "all" && a.therapist_id !== selectedTherapistTab) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const childMatch = a.name_of_child?.toLowerCase().includes(q);
          const regMatch = a.registration_number?.toLowerCase().includes(q);
          const doctorMatch = (therapistMap[a.therapist_id] || "").toLowerCase().includes(q);
          if (!childMatch && !regMatch && !doctorMatch) return false;
        }
        return true;
      });
    },
    [viewMode, monthAppointments, appointments, selectedTherapistTab, search, therapistMap]
  );

  /* ---------------- Derived State & Filtering ---------------- */

  const therapistApptCount = useCallback(
    (empId) => {
      const sourceList = viewMode === "month" ? monthAppointments : appointments;
      return sourceList.filter(
        (a) => (empId === "all" ? true : a.therapist_id === empId) && a.status !== "Cancelled"
      ).length;
    },
    [viewMode, monthAppointments, appointments]
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (selectedTherapistTab !== "all" && a.therapist_id !== selectedTherapistTab) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const childMatch = a.name_of_child?.toLowerCase().includes(q);
        const regMatch = a.registration_number?.toLowerCase().includes(q);
        const doctorMatch = (therapistMap[a.therapist_id] || "").toLowerCase().includes(q);
        const dateMatch = (a.date || "").includes(q);
        if (!childMatch && !regMatch && !doctorMatch && !dateMatch) return false;
      }
      return true;
    });
  }, [appointments, selectedTherapistTab, search, therapistMap]);

  const filteredPatients = useMemo(() => {
    if (!patientQuery.trim()) return patients.slice(0, 30);
    const q = patientQuery.trim().toLowerCase();
    return patients
      .filter(
        (p) =>
          p.name_of_child?.toLowerCase().includes(q) ||
          p.registration_number?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [patients, patientQuery]);

  /* ---------------- Booking Handlers ---------------- */

  const openBookingModal = () => {
    if (isPastDate(selectedDate)) {
      setToast({ type: "error", text: "Cannot book an appointment for a past date." });
      return;
    }
    setBookingDate(selectedDate);
    setBookingStartTime("10:00");
    setBookingEndTime("10:45");
    if (selectedTherapistTab !== "all") {
      const t = therapists.find((x) => x.employeeId === selectedTherapistTab);
      setSelectedTherapist(t || null);
    } else {
      setSelectedTherapist(null);
    }
    setChildName("");
    setRegNumber("");
    setPatientQuery("");
    setPatientDropdownOpen(false);
    setPatientLocked(false);
    setBookingMode("search");
    setMotherName("");
    setFatherName("");
    setMobileNumber("");
    setAddress("");
    setSelectedEnquiryId("");
    setSelectedEnquiryRecord(null);
    setEnquiryLocked(false);
    setBookingModalOpen(true);
  };

  const closeFlow = () => {
    setBookingModalOpen(false);
    setSelectedTherapist(null);
    setChildName("");
    setRegNumber("");
    setPatientQuery("");
    setPatientDropdownOpen(false);
    setPatientLocked(false);
    setBookingMode("search");
    setMotherName("");
    setFatherName("");
    setMobileNumber("");
    setAddress("");
    setSelectedEnquiryId("");
    setSelectedEnquiryRecord(null);
    setEnquiryLocked(false);
  };

  const switchMode = (mode) => {
    if (mode === bookingMode) return;
    setBookingMode(mode);
    setChildName("");
    setRegNumber("");
    setPatientQuery("");
    setPatientDropdownOpen(false);
    setPatientLocked(false);
    setMotherName("");
    setFatherName("");
    setMobileNumber("");
    setAddress("");
    setSelectedEnquiryId("");
    setSelectedEnquiryRecord(null);
    setEnquiryLocked(false);
  };

  const chooseTherapistById = (employeeId) => {
    const t = therapists.find((x) => x.employeeId === employeeId) || null;
    setSelectedTherapist(t);
  };

  const choosePatient = (p) => {
    setChildName(p.name_of_child || "");
    setRegNumber(p.registration_number || "");
    setPatientQuery("");
    setPatientDropdownOpen(false);
    setPatientLocked(true);
  };

  const clearPatient = () => {
    setChildName("");
    setRegNumber("");
    setPatientQuery("");
    setPatientLocked(false);
  };

  const chooseEnquiry = (enquiryId) => {
    const record = enquiriesList.find(
      (e) => String(e.enquiry_id) === String(enquiryId)
    );
    if (!record) return;
    setSelectedEnquiryId(enquiryId);
    setSelectedEnquiryRecord(record);
    setChildName(record.name_of_child || "");
    setAddress(record.address || "");
    setMobileNumber(record.mobile_number || "");
    setEnquiryLocked(true);
  };

  const clearEnquiry = () => {
    setSelectedEnquiryId("");
    setSelectedEnquiryRecord(null);
    setChildName("");
    setAddress("");
    setMobileNumber("");
    setEnquiryLocked(false);
  };

  const confirmBooking = async () => {
    if (!selectedTherapist) {
      setToast({ type: "error", text: "Select a consultant doctor." });
      return;
    }
    if (bookingMode === "new") {
      if (!childName.trim()) {
        setToast({ type: "error", text: "Enter the child's name." });
        return;
      }
    } else if (bookingMode === "enquiry") {
      if (!selectedEnquiryId) {
        setToast({ type: "error", text: "Select a child from the enquiry list." });
        return;
      }
    } else if (!childName.trim() || !regNumber.trim()) {
      setToast({ type: "error", text: "Enter the child's name and registration number." });
      return;
    }

    if (!bookingStartTime || !bookingEndTime) {
      setToast({ type: "error", text: "Please enter start and end time." });
      return;
    }

    const dateToBook = bookingDate || selectedDate || todayISO();
    if (isPastDate(dateToBook)) {
      setToast({ type: "error", text: "Cannot book an appointment for a past date." });
      return;
    }

    setSaving(true);
    const res = await apiRequest(`${Milestonebaseurl}create_appointment/`, "POST", {
      date: dateToBook,
      name_of_child: childName.trim(),
      registration_number: regNumber.trim(),
      therapist_id: selectedTherapist.employeeId,
      slot_label: `${bookingStartTime} - ${bookingEndTime}`,
      slot_start_time: bookingStartTime,
      slot_end_time: bookingEndTime,
      status: "Scheduled",
      ...(bookingMode === "new"
        ? {
            mother_name: motherName.trim(),
            father_name: fatherName.trim(),
            mobile_number: mobileNumber.trim(),
            address: address.trim(),
          }
        : {}),
      ...(bookingMode === "enquiry"
        ? {
            mobile_number: mobileNumber.trim(),
            address: address.trim(),
            enquiry_id: selectedEnquiryRecord?.enquiry_id,
            age: selectedEnquiryRecord?.age,
            problem: selectedEnquiryRecord?.problem || "",
          }
        : {}),
    });

    if (res.success) {
      const bookedName = res.data?.data?.name_of_child || childName.trim();
      const successMsg = res.data?.message || `Appointment booked for ${bookedName}.`;
      setToast({ type: "success", text: successMsg });
      closeFlow();
      loadAppointments(selectedDate);
      loadMonthAppointments(selectedMonth);
    } else {
      const msg =
        res.error ||
        res.data?.error ||
        res.data?.errors?.non_field_errors?.[0] ||
        "Couldn't book this appointment.";
      setToast({ type: "error", text: msg });
    }
    setSaving(false);
  };

  /* ---------------- Reschedule & Status Handlers ---------------- */

  const patchAppointment = (appointmentId, extra) =>
    apiRequest(`${Milestonebaseurl}update_appointment_status/`, "PATCH", {
      appointment_id: appointmentId,
      ...extra,
    });

  const updateStatus = async (appointmentId, newStatus) => {
    setStatusBusyId(appointmentId);
    const res = await patchAppointment(appointmentId, { status: newStatus });
    if (res.success) {
      loadAppointments(selectedDate);
      loadMonthAppointments(selectedMonth);
      setToast({ type: "success", text: `Appointment status updated to ${newStatus}.` });
    } else {
      setToast({ type: "error", text: res.error || "Couldn't update the appointment status." });
    }
    setStatusBusyId(null);
  };

  const startReassign = (appointment) => {
    setRescheduleAppt(appointment);
    setReassignDate(appointment.date || selectedDate || todayISO());
    setReassignStartTime(appointment.slot_start_time || "10:00");
    setReassignEndTime(appointment.slot_end_time || "10:45");
    setReassignTherapistId(appointment.rescheduled_therapist_id || appointment.therapist_id || "");
  };

  const cancelReassign = () => {
    setRescheduleAppt(null);
    setReassignTherapistId("");
  };

  const submitReassign = async () => {
    if (!rescheduleAppt || !reassignTherapistId) return;
    if (isPastDate(reassignDate)) {
      setToast({ type: "error", text: "Cannot reschedule an appointment to a past date." });
      return;
    }
    if (!reassignStartTime || !reassignEndTime) {
      setToast({ type: "error", text: "Please enter start and end time for rescheduling." });
      return;
    }

    setReassignBusy(true);
    const res = await patchAppointment(apptKey(rescheduleAppt), {
      status: "Rescheduled",
      rescheduled_therapist_id: reassignTherapistId,
      date: reassignDate,
      slot_start_time: reassignStartTime,
      slot_end_time: reassignEndTime,
    });

    if (res.success) {
      setToast({ type: "success", text: res.data?.message || "Appointment rescheduled successfully." });
      cancelReassign();
      loadAppointments(selectedDate);
      loadMonthAppointments(selectedMonth);
    } else {
      setToast({ type: "error", text: res.error || res.data?.error || "Couldn't reschedule appointment." });
    }
    setReassignBusy(false);
  };

  /* ---------------- Enquiry Form Handlers ---------------- */

  const openEnquiry = () => {
    setEnquiryChildName("");
    setEnquiryAge("");
    setEnquiryAddress("");
    setEnquiryProblem("");
    setEnquiryMobile("");
    setEnquiryOpen(true);
  };

  const closeEnquiry = () => setEnquiryOpen(false);

  const submitEnquiry = async () => {
    if (!enquiryChildName.trim() || !enquiryAge) {
      setToast({ type: "error", text: "Enter child name and age." });
      return;
    }
    setEnquirySaving(true);
    const res = await apiRequest(`${Milestonebaseurl}enquiryform/`, "POST", {
      name_of_child: enquiryChildName.trim(),
      age: Number(enquiryAge),
      address: enquiryAddress.trim(),
      problem: enquiryProblem.trim(),
      mobile_number: enquiryMobile.trim(),
    });
    if (res.success) {
      const msg = res.data?.message || "Enquiry saved.";
      setToast({ type: "success", text: msg });
      setEnquiryOpen(false);
      loadEnquiries();
    } else {
      const msg =
        res.error ||
        res.data?.error ||
        res.data?.errors?.non_field_errors?.[0] ||
        "Couldn't save this enquiry.";
      setToast({ type: "error", text: msg });
    }
    setEnquirySaving(false);
  };

  /* ---------------- Render ---------------- */

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      {/* Main Header */}
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Appointment Scheduling</p>
          <h1 style={styles.title}>Appointment Schedule</h1>
          <p style={styles.headerSub}>
            Flexible date and month-based scheduling & therapist management
          </p>
        </div>

        <div style={styles.headerControls}>
          {/* View Mode Switcher */}
          <div style={styles.viewToggleWrap}>
            <button
              type="button"
              onClick={() => setViewMode("day")}
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === "day" ? styles.viewToggleBtnActive : {}),
              }}
            >
              📅 Day View
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("month");
                loadMonthAppointments(selectedMonth);
              }}
              style={{
                ...styles.viewToggleBtn,
                ...(viewMode === "month" ? styles.viewToggleBtnActive : {}),
              }}
            >
              🗓️ Month View
            </button>
          </div>

          <div className="aps-search-box" style={styles.searchBox}>
            <SearchIcon />
            <input
              placeholder="Search kid, reg #, or doctor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            type="button"
            onClick={openBookingModal}
            disabled={isPastDate(selectedDate)}
            style={{
              ...styles.bookMainBtn,
              ...(isPastDate(selectedDate)
                ? { opacity: 0.5, cursor: "not-allowed", background: "#94a3b8", boxShadow: "none" }
                : {}),
            }}
            title={isPastDate(selectedDate) ? "Booking disabled for past dates" : "Book Appointment"}
          >
            {isPastDate(selectedDate) ? "Past Date (Disabled)" : "+ Book Appointment"}
          </button>

          <EnquiryFabButton
            type="button"
            title="New Enquiry"
            aria-label="New Enquiry"
            onClick={openEnquiry}
          >
            + New Enquiry
          </EnquiryFabButton>
        </div>
      </header>

      {/* Therapist Tabs Bar */}
      <div style={styles.therapistTabsWrap}>
        <button
          key="all"
          type="button"
          onClick={() => setSelectedTherapistTab("all")}
          style={{
            ...styles.therapistTab,
            ...(selectedTherapistTab === "all" ? styles.therapistTabActive : {}),
          }}
        >
          <span>👨‍⚕️ All Therapists</span>
          <span style={styles.tabBadge}>{therapistApptCount("all")}</span>
        </button>

        {therapists.map((t) => (
          <button
            key={t.employeeId}
            type="button"
            onClick={() => setSelectedTherapistTab(t.employeeId)}
            style={{
              ...styles.therapistTab,
              ...(selectedTherapistTab === t.employeeId ? styles.therapistTabActive : {}),
            }}
          >
            <span>👨‍⚕️ {t.employeeName}</span>
            <span style={styles.tabBadge}>{therapistApptCount(t.employeeId)}</span>
          </button>
        ))}
      </div>

      {/* Day / Month Navigation Control Row */}
      {viewMode === "day" ? (
        <div style={styles.dayNavRow}>
          <button
            type="button"
            onClick={() => navigateDay(-1)}
            style={styles.dayNavBtn}
          >
            ◀ Previous Day
          </button>

          <div style={styles.dateLabelWrap}>
            <span style={styles.dateLabelText}>
              📅 {formatDateLabel(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              style={styles.datePickerInline}
            />
            <button
              type="button"
              onClick={() => setSelectedDate(todayISO())}
              style={styles.todayBtn}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateDay(1)}
            style={styles.dayNavBtn}
          >
            Next Day ▶
          </button>
        </div>
      ) : (
        <div style={styles.dayNavRow}>
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            style={styles.dayNavBtn}
          >
            ◀ Previous Month
          </button>

          <div style={styles.dateLabelWrap}>
            <span style={styles.dateLabelText}>
              🗓️ {formatMonthLabel(selectedMonth)}
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value);
                  loadMonthAppointments(e.target.value);
                }
              }}
              style={styles.datePickerInline}
            />
            <button
              type="button"
              onClick={() => {
                const thisMonth = todayISO().slice(0, 7);
                setSelectedMonth(thisMonth);
                loadMonthAppointments(thisMonth);
              }}
              style={styles.todayBtn}
            >
              This Month
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigateMonth(1)}
            style={styles.dayNavBtn}
          >
            Next Month ▶
          </button>
        </div>
      )}

      {/* Schedule Display */}
      {viewMode === "day" ? (
        loadingAppointments ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 800 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aps-skeleton-row" style={styles.skeletonRow} />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={styles.emptyStateBox}>
            <CalendarIcon />
            <p style={styles.emptyStateTitle}>No Appointments Scheduled</p>
            <p style={styles.emptyStateSub}>
              No appointments found for {selectedTherapistTab === "all" ? "any therapist" : therapistMap[selectedTherapistTab] || "selected therapist"} on {formatShortDate(selectedDate)}.
            </p>
            {!isPastDate(selectedDate) && (
              <button
                type="button"
                onClick={openBookingModal}
                style={{ ...styles.bookMainBtn, marginTop: 12 }}
              >
                + Schedule Appointment for this Day
              </button>
            )}
          </div>
        ) : (
          <div style={styles.flexibleGrid}>
            {filteredAppointments.map((appt, idx) => {
              const statusConfig = STATUS_STYLE[appt.status] || STATUS_STYLE.Scheduled;
              const doctorName = therapistMap[appt.therapist_id] || appt.therapist_id || "Unassigned Doctor";
              const apptDateStr = appt.date ? formatShortDate(appt.date) : formatShortDate(selectedDate);
              const timeRange = appt.slot_start_time
                ? `${appt.slot_start_time} - ${appt.slot_end_time || ""}`
                : appt.slot_label || "Flexible Time";

              return (
                <div key={apptKey(appt) || idx} className="aps-card" style={styles.flexibleCard}>
                  <div style={{ ...styles.cardAccent, background: statusConfig.dot }} />

                  <div style={styles.cardHeaderBadges}>
                    <span style={styles.cardDateBadge}>
                      📅 {apptDateStr}
                    </span>
                    <span style={styles.cardTimeBadge}>
                      ⏰ {timeRange}
                    </span>
                  </div>

                  <div style={styles.doctorNameRow}>
                    👨‍⚕️ <strong>{doctorName}</strong>
                  </div>

                  <div style={styles.patientInfoBox}>
                    <p style={styles.childNameTitle}>👶 {appt.name_of_child}</p>
                    <p style={styles.childRegSub}>Registration #{appt.registration_number}</p>
                    {appt.mobile_number && (
                      <p style={styles.childRegSub}>📞 {appt.mobile_number}</p>
                    )}
                  </div>

                  <div style={styles.cardFooterRow}>
                    <span
                      style={{
                        ...styles.badge,
                        background: statusConfig.bg,
                        color: statusConfig.fg,
                      }}
                    >
                      ● {statusConfig.label}
                    </span>

                    <div style={styles.actionButtonsGroup}>
                      {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => startReassign(appt)}
                          style={styles.rescheduleMiniBtn}
                          title="Reschedule / Reassign"
                        >
                          Reschedule
                        </button>
                      )}
                      {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(apptKey(appt), "Completed")}
                          disabled={statusBusyId === apptKey(appt)}
                          style={styles.completeMiniBtn}
                        >
                          ✓ Complete
                        </button>
                      )}
                      {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(apptKey(appt), "Cancelled")}
                          disabled={statusBusyId === apptKey(appt)}
                          style={styles.cancelMiniBtn}
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Month View Calendar Grid */
        <div style={styles.monthCalendarWrap}>
          {/* Weekday headers */}
          <div style={styles.weekdayRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} style={styles.weekdayHeader}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          {loadingMonthAppointments ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 10 }}>
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="aps-skeleton-row" style={{ height: 110, borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <div style={styles.monthGrid}>
              {monthDaysGrid.map((cell) => {
                if (cell.isPadding) {
                  return <div key={cell.key} style={styles.monthDayCellPadding} />;
                }

                const dayAppts = getAppointmentsForDayISO(cell.dateISO);
                const isToday = cell.dateISO === todayISO();
                const isPast = isPastDate(cell.dateISO);

                return (
                  <div
                    key={cell.key}
                    onClick={() => setDayDetailsModalDate(cell.dateISO)}
                    style={{
                      ...styles.monthDayCard,
                      ...(isToday ? styles.monthDayCardToday : {}),
                      ...(isPast ? styles.monthDayCardPast : {}),
                    }}
                    title="Click to view appointment details for this day"
                  >
                    <div style={styles.monthCardHeader}>
                      <span style={{ ...styles.monthCardDayNum, ...(isToday ? styles.monthCardDayNumToday : {}) }}>
                        {cell.dayNumber}
                      </span>
                      {dayAppts.length > 0 && (
                        <span style={styles.monthCardBadge}>
                          {dayAppts.length} {dayAppts.length === 1 ? "Appt" : "Appts"}
                        </span>
                      )}
                    </div>

                    <div style={styles.monthCardBody}>
                      {dayAppts.slice(0, 2).map((a, idx) => (
                        <div key={idx} style={styles.monthApptMiniTag}>
                          ● {a.name_of_child} ({a.slot_start_time || 'Flex'})
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <div style={styles.monthMoreTag}>
                          +{dayAppts.length - 2} more...
                        </div>
                      )}
                      {dayAppts.length === 0 && (
                        <span style={styles.monthCardEmpty}>No bookings</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Day Details Modal (Opened when clicking a Month Day Card) */}
      {dayDetailsModalDate && (
        <ModalBackdrop onClick={() => setDayDetailsModalDate(null)}>
          <ModalContent style={{ width: 720 }} onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  <CalendarIcon /> Day Appointments Details
                </ModalTitle>
                <ModalSubtitle>
                  {formatDateLabel(dayDetailsModalDate)}
                </ModalSubtitle>
              </div>
              <CloseButton onClick={() => setDayDetailsModalDate(null)}>✕</CloseButton>
            </ModalHeader>

            {getAppointmentsForDayISO(dayDetailsModalDate).length === 0 ? (
              <div style={styles.emptyStateBox}>
                <CalendarIcon />
                <p style={styles.emptyStateTitle}>No Appointments Scheduled</p>
                <p style={styles.emptyStateSub}>
                  No appointments found for {selectedTherapistTab === "all" ? "any therapist" : therapistMap[selectedTherapistTab] || "selected therapist"} on this day.
                </p>
                {!isPastDate(dayDetailsModalDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(dayDetailsModalDate);
                      setDayDetailsModalDate(null);
                      openBookingModal();
                    }}
                    style={{ ...styles.bookMainBtn, marginTop: 12 }}
                  >
                    + Schedule Appointment for this Day
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {getAppointmentsForDayISO(dayDetailsModalDate).map((appt, idx) => {
                  const statusConfig = STATUS_STYLE[appt.status] || STATUS_STYLE.Scheduled;
                  const doctorName = therapistMap[appt.therapist_id] || appt.therapist_id || "Unassigned Doctor";

                  return (
                    <div key={apptKey(appt) || idx} className="aps-card" style={styles.flexibleCard}>
                      <div style={{ ...styles.cardAccent, background: statusConfig.dot }} />

                      <div style={styles.cardHeaderBadges}>
                        <span style={styles.cardDateBadge}>
                          📅 {formatShortDate(dayDetailsModalDate)}
                        </span>
                        <span style={styles.cardTimeBadge}>
                          ⏰ {appt.slot_start_time ? `${appt.slot_start_time} - ${appt.slot_end_time || ""}` : "Flexible Time"}
                        </span>
                      </div>

                      <div style={styles.doctorNameRow}>
                        👨‍⚕️ <strong>{doctorName}</strong>
                      </div>

                      <div style={styles.patientInfoBox}>
                        <p style={styles.childNameTitle}>👶 {appt.name_of_child}</p>
                        <p style={styles.childRegSub}>Registration #{appt.registration_number}</p>
                        {appt.mobile_number && (
                          <p style={styles.childRegSub}>📞 {appt.mobile_number}</p>
                        )}
                      </div>

                      <div style={styles.cardFooterRow}>
                        <span style={{ ...styles.badge, background: statusConfig.bg, color: statusConfig.fg }}>
                          ● {statusConfig.label}
                        </span>

                        <div style={styles.actionButtonsGroup}>
                          {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() => {
                                setDayDetailsModalDate(null);
                                startReassign(appt);
                              }}
                              style={styles.rescheduleMiniBtn}
                            >
                              Reschedule
                            </button>
                          )}
                          {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(apptKey(appt), "Completed")}
                              style={styles.completeMiniBtn}
                            >
                              ✓ Complete
                            </button>
                          )}
                          {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(apptKey(appt), "Cancelled")}
                              style={styles.cancelMiniBtn}
                            >
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <ButtonGroup style={{ marginTop: 24 }}>
              <CancelButton onClick={() => setDayDetailsModalDate(null)}>Close</CancelButton>
              {!isPastDate(dayDetailsModalDate) && (
                <SaveButton
                  onClick={() => {
                    setSelectedDate(dayDetailsModalDate);
                    setDayDetailsModalDate(null);
                    openBookingModal();
                  }}
                >
                  + Book Appointment for this Day
                </SaveButton>
              )}
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Flexible Booking Modal */}
      {bookingModalOpen && (
        <ModalBackdrop onClick={closeFlow}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  <CheckCircleIcon /> Schedule Appointment
                </ModalTitle>
                <ModalSubtitle>
                  Flexible scheduling for {formatDateLabel(bookingDate)}
                </ModalSubtitle>
              </div>
              <CloseButton onClick={closeFlow}>✕</CloseButton>
            </ModalHeader>

            {/* Mode Selector */}
            <ModeToggleRow>
              <ModeTab type="button" $active={bookingMode === "search"} onClick={() => switchMode("search")}>
                <ModeTabDot $active={bookingMode === "search"} />
                Search Patient
              </ModeTab>
              <ModeTab type="button" $active={bookingMode === "new"} onClick={() => switchMode("new")}>
                <ModeTabDot $active={bookingMode === "new"} />
                New Child Entry
              </ModeTab>
              <ModeTab type="button" $active={bookingMode === "enquiry"} onClick={() => switchMode("enquiry")}>
                <ModeTabDot $active={bookingMode === "enquiry"} />
                Enquiry
              </ModeTab>
            </ModeToggleRow>

            {/* Date & Flexible Time Controls */}
            <FormRow>
              <HalfGroup>
                <Label>Date <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="date"
                  min={todayISO()}
                  value={bookingDate}
                  onChange={(e) => {
                    if (isPastDate(e.target.value)) {
                      setToast({ type: "error", text: "Cannot select a past date for booking." });
                      setBookingDate(todayISO());
                    } else {
                      setBookingDate(e.target.value);
                    }
                  }}
                />
              </HalfGroup>
              <HalfGroup>
                <Label>Start Time <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="time"
                  value={bookingStartTime}
                  onChange={(e) => setBookingStartTime(e.target.value)}
                />
              </HalfGroup>
              <HalfGroup>
                <Label>End Time <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="time"
                  value={bookingEndTime}
                  onChange={(e) => setBookingEndTime(e.target.value)}
                />
              </HalfGroup>
            </FormRow>

            {/* Patient Form Modes */}
            {bookingMode === "search" ? (
              <>
                {patientLocked ? (
                  <PatientInfoCard>
                    <div>
                      <PatientInfoName>{childName}</PatientInfoName>
                      <PatientInfoReg>Registration #{regNumber}</PatientInfoReg>
                    </div>
                    <ChangePatientLink onClick={clearPatient}>Change</ChangePatientLink>
                  </PatientInfoCard>
                ) : (
                  <FormGroup>
                    <Label>Search Patient</Label>
                    <InputWrapper>
                      <span className="icon"><SearchIcon /></span>
                      <BareInput
                        placeholder="Search child name or reg. number"
                        value={patientQuery}
                        onChange={(e) => {
                          setPatientQuery(e.target.value);
                          setPatientDropdownOpen(true);
                        }}
                        onFocus={() => setPatientDropdownOpen(true)}
                      />
                    </InputWrapper>
                    {patientDropdownOpen && (
                      <DropdownMenu>
                        {loadingPatients ? (
                          <DropdownEmpty>Loading patients…</DropdownEmpty>
                        ) : filteredPatients.length === 0 ? (
                          <DropdownEmpty>No matching patients found.</DropdownEmpty>
                        ) : (
                          filteredPatients.map((p, idx) => (
                            <DropdownItem
                              key={p.registration_number || idx}
                              onClick={() => choosePatient(p)}
                            >
                              <span className="checkbox" />
                              <span>
                                {p.name_of_child}
                                <small>{p.registration_number}</small>
                              </span>
                            </DropdownItem>
                          ))
                        )}
                      </DropdownMenu>
                    )}
                  </FormGroup>
                )}

                {!patientLocked && (
                  <FormRow>
                    <HalfGroup>
                      <Label>Child's Name</Label>
                      <Input
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="e.g. Aarav Kumar"
                      />
                    </HalfGroup>
                    <HalfGroup>
                      <Label>Registration Number</Label>
                      <Input
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="e.g. MDC/123/2026"
                      />
                    </HalfGroup>
                  </FormRow>
                )}
              </>
            ) : bookingMode === "new" ? (
              <>
                <FormGroup>
                  <Label>
                    Child's Name <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Aarav Kumar"
                  />
                </FormGroup>
                <FormRow>
                  <HalfGroup>
                    <Label>Mother's Name</Label>
                    <Input
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="e.g. Priya Kumar"
                    />
                  </HalfGroup>
                  <HalfGroup>
                    <Label>Father's Name</Label>
                    <Input
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Arun Kumar"
                    />
                  </HalfGroup>
                </FormRow>
                <FormGroup>
                  <Label>Mobile Number</Label>
                  <Input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Address</Label>
                  <TextArea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House no., street, city, pincode"
                  />
                </FormGroup>
              </>
            ) : (
              <>
                {enquiryLocked && selectedEnquiryRecord ? (
                  <PatientInfoCard>
                    <div>
                      <PatientInfoName>{selectedEnquiryRecord.name_of_child}</PatientInfoName>
                      <PatientInfoReg>
                        Age {selectedEnquiryRecord.age}
                        {selectedEnquiryRecord.problem ? ` · ${selectedEnquiryRecord.problem}` : ""}
                      </PatientInfoReg>
                    </div>
                    <ChangePatientLink onClick={clearEnquiry}>Change</ChangePatientLink>
                  </PatientInfoCard>
                ) : (
                  <FormGroup>
                    <Label>
                      Select from Enquiries <RequiredMark>*</RequiredMark>
                    </Label>
                    <InputWrapper disabled={loadingEnquiriesList}>
                      <StyledSelect
                        value={selectedEnquiryId}
                        disabled={loadingEnquiriesList}
                        onChange={(e) => chooseEnquiry(e.target.value)}
                      >
                        <option value="" disabled>
                          {loadingEnquiriesList
                            ? "Loading enquiries…"
                            : enquiriesList.length
                            ? "Select child"
                            : "No enquiries saved yet"}
                        </option>
                        {enquiriesList.map((eq) => (
                          <option key={eq.enquiry_id} value={eq.enquiry_id}>
                            {eq.name_of_child} · Age {eq.age}
                          </option>
                        ))}
                      </StyledSelect>
                    </InputWrapper>
                  </FormGroup>
                )}

                {enquiryLocked && (
                  <FormGroup>
                    <Label>Mobile Number</Label>
                    <Input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                    />
                  </FormGroup>
                )}
              </>
            )}

            {/* Doctor Selection */}
            <SectionTitle>Consultant Doctor</SectionTitle>
            <FormGroup>
              <InputWrapper disabled={loadingTherapists}>
                <StyledSelect
                  value={selectedTherapist?.employeeId || ""}
                  disabled={loadingTherapists}
                  onChange={(e) => chooseTherapistById(e.target.value)}
                >
                  <option value="" disabled>
                    {loadingTherapists ? "Loading doctors…" : "Select doctor"}
                  </option>
                  {therapists.map((t) => (
                    <option key={t.employeeId} value={t.employeeId}>
                      {t.employeeName}
                    </option>
                  ))}
                </StyledSelect>
              </InputWrapper>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={closeFlow}>Cancel</CancelButton>
              <SaveButton disabled={saving} onClick={confirmBooking}>
                <CheckCircleIcon small /> {saving ? "Booking…" : "Save Appointment"}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <ModalBackdrop onClick={cancelReassign}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>⇄ Reschedule Appointment</ModalTitle>
                <ModalSubtitle>
                  Reschedule for {rescheduleAppt.name_of_child}
                </ModalSubtitle>
              </div>
              <CloseButton onClick={cancelReassign}>✕</CloseButton>
            </ModalHeader>

            <PatientInfoCard>
              <div>
                <PatientInfoName>{rescheduleAppt.name_of_child}</PatientInfoName>
                <PatientInfoReg>Reg #{rescheduleAppt.registration_number}</PatientInfoReg>
              </div>
            </PatientInfoCard>

            {/* Reschedule Date & Time Controls */}
            <FormRow>
              <HalfGroup>
                <Label>New Date <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="date"
                  min={todayISO()}
                  value={reassignDate}
                  onChange={(e) => {
                    if (isPastDate(e.target.value)) {
                      setToast({ type: "error", text: "Cannot select a past date for rescheduling." });
                      setReassignDate(todayISO());
                    } else {
                      setReassignDate(e.target.value);
                    }
                  }}
                />
              </HalfGroup>
              <HalfGroup>
                <Label>Start Time <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="time"
                  value={reassignStartTime}
                  onChange={(e) => setReassignStartTime(e.target.value)}
                />
              </HalfGroup>
              <HalfGroup>
                <Label>End Time <RequiredMark>*</RequiredMark></Label>
                <Input
                  type="time"
                  value={reassignEndTime}
                  onChange={(e) => setReassignEndTime(e.target.value)}
                />
              </HalfGroup>
            </FormRow>

            <SectionTitle>Doctor / Therapist</SectionTitle>
            <FormGroup>
              <InputWrapper disabled={loadingTherapists}>
                <StyledSelect
                  value={reassignTherapistId}
                  disabled={loadingTherapists}
                  onChange={(e) => setReassignTherapistId(e.target.value)}
                >
                  <option value="" disabled>
                    {loadingTherapists ? "Loading doctors…" : "Select doctor"}
                  </option>
                  {therapists.map((t) => (
                    <option key={t.employeeId} value={t.employeeId}>
                      {t.employeeName}
                    </option>
                  ))}
                </StyledSelect>
              </InputWrapper>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={cancelReassign}>Cancel</CancelButton>
              <SaveButton disabled={reassignBusy || !reassignTherapistId} onClick={submitReassign}>
                {reassignBusy ? "Rescheduling…" : "Confirm Reschedule"}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Enquiry Form Modal */}
      {enquiryOpen && (
        <ModalBackdrop onClick={closeEnquiry}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  <CheckCircleIcon /> Enquiry Form
                </ModalTitle>
                <ModalSubtitle>Capture a walk-in or phone enquiry</ModalSubtitle>
              </div>
              <CloseButton onClick={closeEnquiry}>✕</CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>
                Name of Child <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                value={enquiryChildName}
                onChange={(e) => setEnquiryChildName(e.target.value)}
                placeholder="e.g. Aarav Kumar"
              />
            </FormGroup>

            <FormRow>
              <HalfGroup>
                <Label>
                  Age <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={enquiryAge}
                  onChange={(e) => setEnquiryAge(e.target.value)}
                  placeholder="e.g. 4"
                />
              </HalfGroup>
              <HalfGroup>
                <Label>Mobile Number</Label>
                <Input
                  type="tel"
                  value={enquiryMobile}
                  onChange={(e) => setEnquiryMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </HalfGroup>
            </FormRow>

            <FormGroup>
              <Label>Address</Label>
              <TextArea
                value={enquiryAddress}
                onChange={(e) => setEnquiryAddress(e.target.value)}
                placeholder="House no., street, city, pincode"
              />
            </FormGroup>

            <FormGroup>
              <Label>Problem</Label>
              <TextArea
                value={enquiryProblem}
                onChange={(e) => setEnquiryProblem(e.target.value)}
                placeholder="Describe the concern raised"
              />
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={closeEnquiry}>Cancel</CancelButton>
              <SaveButton disabled={enquirySaving} onClick={submitEnquiry}>
                <CheckCircleIcon small /> {enquirySaving ? "Saving…" : "Save Enquiry"}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="aps-toast"
          style={{
            ...styles.toast,
            ...(toast.type === "success" ? styles.toastOk : styles.toastError),
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ small }) {
  const s = small ? 16 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 4L12 14.01l-3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={tokens.pine} strokeWidth="2" />
      <path d="M3 10h18" stroke={tokens.pine} strokeWidth="2" />
      <path d="M8 3v4M16 3v4" stroke={tokens.pine} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke={tokens.inkSoft} strokeWidth="2" />
      <path d="M20 20L16.65 16.65" stroke={tokens.inkSoft} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }
  button { font-family: inherit; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  input:focus { outline: 2px solid ${tokens.pine}; outline-offset: 1px; }

  .aps-search-box:focus-within {
    border-color: ${tokens.pine};
    background: #fff;
    box-shadow: 0 0 0 4px ${tokens.pineSoft};
  }

  .aps-card {
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .aps-card:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadowLift};
  }

  .aps-toast { animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
  .aps-skeleton-row {
    background: linear-gradient(90deg, ${tokens.paperRaised} 25%, #EFE7D2 37%, ${tokens.paperRaised} 63%);
    background-size: 500px 100%;
    animation: shimmer 1.4s infinite linear;
  }

  @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
  @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

const styles = {
  page: {
    fontFamily: tokens.fontBody,
    background: tokens.paper,
    color: tokens.ink,
    minHeight: "100%",
    padding: "32px 36px 90px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 22,
    borderBottom: `1px solid ${tokens.line}`,
  },
  eyebrow: {
    margin: 0,
    fontSize: 11.5,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: tokens.pine,
    fontWeight: 700,
  },
  title: {
    margin: "6px 0 0",
    fontFamily: tokens.fontDisplay,
    fontSize: 34,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: tokens.pineDeep,
  },
  headerSub: { margin: "6px 0 0", fontSize: 13.5, color: tokens.inkSoft },
  headerControls: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: tokens.paperRaised,
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 12,
    padding: "10px 14px",
    minWidth: 240,
  },
  searchInput: { border: "none", background: "transparent", fontSize: 14, width: "100%", color: tokens.ink },

  /* View Mode Switcher */
  viewToggleWrap: {
    display: "flex",
    background: tokens.paperRaised,
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  viewToggleBtn: {
    padding: "9px 15px",
    border: "none",
    background: "transparent",
    fontSize: 13,
    fontWeight: 700,
    color: tokens.inkSoft,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  viewToggleBtnActive: {
    background: tokens.pine,
    color: "#ffffff",
  },

  /* Therapist Tabs Bar */
  therapistTabsWrap: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    padding: "14px 0 10px",
    marginTop: 12,
    marginBottom: 12,
    borderBottom: `1.5px solid ${tokens.line}`,
  },
  therapistTab: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 14,
    border: `1.5px solid ${tokens.line}`,
    background: tokens.paperRaised,
    color: tokens.ink,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  therapistTabActive: {
    background: tokens.pine,
    borderColor: tokens.pine,
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(31,92,70,0.25)",
  },
  tabBadge: {
    background: "rgba(0,0,0,0.12)",
    color: "inherit",
    borderRadius: 10,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 700,
  },

  /* Day / Month Navigation Control Row */
  dayNavRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    background: tokens.paperRaised,
    padding: "14px 20px",
    borderRadius: 16,
    border: `1.5px solid ${tokens.line}`,
    boxShadow: tokens.shadow,
  },
  dayNavBtn: {
    padding: "9px 16px",
    borderRadius: 10,
    border: `1.5px solid ${tokens.line}`,
    background: tokens.paper,
    color: tokens.pineDeep,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dateLabelWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dateLabelText: {
    fontSize: 16,
    fontWeight: 700,
    color: tokens.pineDeep,
    fontFamily: tokens.fontDisplay,
  },
  datePickerInline: {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1.5px solid ${tokens.line}`,
    fontSize: 13,
    fontWeight: 600,
    background: tokens.paper,
    color: tokens.ink,
    outline: "none",
    cursor: "pointer",
  },
  todayBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${tokens.pine}`,
    background: tokens.pineSoft,
    color: tokens.pineDeep,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  bookMainBtn: {
    padding: "11px 22px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(135deg, ${tokens.pine} 0%, ${tokens.pineDeep} 100%)`,
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(31,92,70,0.25)",
    transition: "all 0.2s ease",
  },

  /* Empty state */
  emptyStateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    background: tokens.paperRaised,
    borderRadius: 18,
    border: `1.5px dashed ${tokens.line}`,
    textAlign: "center",
    marginTop: 10,
  },
  emptyStateTitle: {
    margin: "12px 0 4px",
    fontSize: 18,
    fontWeight: 700,
    color: tokens.pineDeep,
  },
  emptyStateSub: {
    margin: 0,
    fontSize: 13.5,
    color: tokens.inkSoft,
    maxWidth: 450,
  },

  /* Flexible appointment cards grid */
  flexibleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
    marginTop: 10,
  },
  flexibleCard: {
    position: "relative",
    background: tokens.paperRaised,
    borderRadius: 16,
    border: `1.5px solid ${tokens.lineSoft}`,
    boxShadow: tokens.shadow,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardHeaderBadges: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardDateBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: tokens.pineSoft,
    color: tokens.pineDeep,
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
  },
  cardTimeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: tokens.marigoldSoft,
    color: tokens.marigold,
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
  },
  doctorNameRow: {
    fontSize: 13.5,
    color: tokens.pineDeep,
    padding: "6px 10px",
    background: tokens.paper,
    borderRadius: 8,
    fontWeight: 600,
  },
  patientInfoBox: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  childNameTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: tokens.ink,
  },
  childRegSub: {
    margin: 0,
    fontSize: 12.5,
    color: tokens.inkSoft,
    fontWeight: 600,
  },
  cardFooterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    paddingTop: 10,
    borderTop: `1px solid ${tokens.lineSoft}`,
  },
  badge: {
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 999,
    letterSpacing: "0.02em",
  },
  actionButtonsGroup: {
    display: "flex",
    gap: 6,
  },
  rescheduleMiniBtn: {
    border: `1.5px solid ${tokens.pine}`,
    background: tokens.pineSoft,
    color: tokens.pineDeep,
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  completeMiniBtn: {
    border: `1.5px solid ${tokens.sage}`,
    background: tokens.sageSoft,
    color: tokens.sage,
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelMiniBtn: {
    border: `1.5px solid ${tokens.rose}`,
    background: tokens.roseSoft,
    color: tokens.rose,
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },

  /* Month View Calendar Styles */
  monthCalendarWrap: {
    background: tokens.paperRaised,
    borderRadius: 18,
    border: `1.5px solid ${tokens.line}`,
    boxShadow: tokens.shadow,
    padding: 16,
    marginTop: 10,
    maxHeight: "calc(100vh - 250px)",
    overflowY: "auto",
  },
  weekdayRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  weekdayHeader: {
    fontSize: 12.5,
    fontWeight: 700,
    color: tokens.pineDeep,
    textTransform: "uppercase",
    padding: "6px 0",
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
  },
  monthDayCellPadding: {
    minHeight: 110,
    background: "transparent",
  },
  monthDayCard: {
    minHeight: 110,
    background: tokens.paper,
    borderRadius: 12,
    border: `1.5px solid ${tokens.lineSoft}`,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  monthDayCardToday: {
    borderColor: tokens.pine,
    boxShadow: `0 0 0 2px ${tokens.pineSoft}`,
  },
  monthDayCardPast: {
    opacity: 0.85,
  },
  monthCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthCardDayNum: {
    fontSize: 14,
    fontWeight: 700,
    color: tokens.ink,
  },
  monthCardDayNumToday: {
    color: tokens.pine,
    background: tokens.pineSoft,
    padding: "2px 6px",
    borderRadius: 6,
  },
  monthCardBadge: {
    fontSize: 10.5,
    fontWeight: 800,
    background: tokens.marigoldSoft,
    color: tokens.marigold,
    padding: "2px 6px",
    borderRadius: 999,
  },
  monthCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    maxHeight: "75px",
    overflowY: "auto",
  },
  monthApptMiniTag: {
    fontSize: 11,
    fontWeight: 600,
    color: tokens.pineDeep,
    background: tokens.paperRaised,
    padding: "3px 6px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  monthMoreTag: {
    fontSize: 10.5,
    fontWeight: 700,
    color: tokens.inkSoft,
    fontStyle: "italic",
  },
  monthCardEmpty: {
    fontSize: 11,
    color: tokens.inkFaint,
    marginTop: 6,
  },
  skeletonRow: {
    height: 90,
    borderRadius: 16,
  },
  toast: {
    position: "fixed",
    top: 24,
    right: 24,
    padding: "13px 20px",
    borderRadius: 12,
    fontSize: 13.5,
    fontWeight: 600,
    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.25)",
    zIndex: 1100,
  },
  toastOk: { background: tokens.pineDeep, color: "#fff" },
  toastError: { background: tokens.rose, color: "#fff" },
};