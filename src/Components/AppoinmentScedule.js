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
 * Booking modal — styled components (matches the Attendance modal design)
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
  width: 550px;
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

/* Round "+" trigger in the header that opens the Enquiry Form modal */
const EnquiryFabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid ${tokens.line};
  background: ${tokens.paperRaised};
  color: ${tokens.pine};
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
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

/* Search Patient / New Child Entry mode toggle — two selectable labels,
   only one active at a time, matching the reference screenshot's label style. */
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

  ${props => props.disabled && css`
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
  &:focus { outline: none; }
`;

const BareInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1f2937;
  height: 100%;
  width: 100%;
  &:focus { outline: none; }
  &::placeholder { color: #9ca3af; }
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
  background: ${props => props.isSelected ? '#f0fdf4' : 'transparent'};

  &:hover { background: #f3f4f6; }

  .checkbox {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid ${props => props.isSelected ? '#a1c181' : '#d1d5db'};
    background: ${props => props.isSelected ? '#a1c181' : 'white'};
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
    small { color: #9ca3af; }
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

  &:hover { background: #e5e7eb; }
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

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
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
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
};

// Some slots from get_dailytimeslot only carry a "label" like "10.15-11.00"
// (no separate start/end fields), which left slot_start_time/slot_end_time
// as undefined -> JSON.stringify drops them -> backend 400s on create.
// This derives HH:MM start/end straight from the label as a fallback.
//
// Labels are 12-hour with no AM/PM marker. For this clinic's 10:15am–6:00pm
// day, hours 10, 11, 12 are unambiguous as written; any hour 1-9 in a label
// is always PM and must be bumped into 24-hour time (e.g. "2.45" -> 14:45),
// or slots after noon silently get treated as the middle of the night.
const parseSlotLabelTimes = (label) => {
  if (!label) return { start: null, end: null };
  const [rawStart, rawEnd] = label.split("-").map((s) => (s || "").trim());
  const toHM = (s) => {
    if (!s) return null;
    const [hRaw, mRaw = "00"] = s.split(".");
    let h = parseInt(hRaw, 10);
    if (Number.isNaN(h)) return null;
    if (h >= 1 && h <= 9) h += 12;
    return `${pad(h)}:${mRaw.padStart(2, "0")}`;
  };
  return { start: toHM(rawStart), end: toHM(rawEnd) };
};

// The get_appointments_by_date payload isn't always consistent — some rows
// have slot_start_time (e.g. "11:00:00"), older ones have it as null and only
// carry appointment_datetime (e.g. "2026-07-01T10:15:00Z"). Normalize both
// down to "HH:MM" so appointments reliably match their slot card either way.
const normalizeTime = (t) => (t ? String(t).slice(0, 5) : null);

const appointmentStartKey = (a) => {
  if (a.slot_start_time) return normalizeTime(a.slot_start_time);
  if (a.appointment_datetime) return a.appointment_datetime.slice(11, 16);
  return null;
};

// "HH:MM–HH:MM" label for an appointment record, used in the reschedule modal.
const appointmentSlotLabel = (a) => {
  const start = appointmentStartKey(a);
  const end = normalizeTime(a.slot_end_time);
  if (start && end) return `${start}–${end}`;
  return start || "";
};

// The backend model now has a real primary key: appointment_id. Fall back to
// id/_id only for any stale data that predates that field.
const apptKey = (a) => (a.appointment_id != null ? a.appointment_id : a.id || a._id || null);

const slotStartKey = (slot) => {
  const label = slot.label || `${slot.start}-${slot.end}`;
  return normalizeTime(slot.start) || parseSlotLabelTimes(label).start;
};

const weekDays = (anchorISO) => {
  const anchor = new Date(anchorISO + "T00:00:00");
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay()); // Sunday start
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISO(d);
  });
};

export default function AppointmentScheduling() {
  const [view, setView] = useState("day"); // "day" | "week"
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [slotDates, setSlotDates] = useState({});
  const [appointmentsByDate, setAppointmentsByDate] = useState({});

  const findAppointmentDate = (appointmentId) => {
    const allAppts = Object.values(appointmentsByDate).flat();
    const appt = allAppts.find(a => apptKey(a) === appointmentId) || appointments.find(a => apptKey(a) === appointmentId);
    return appt?.date || selectedDate || todayISO();
  };

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [weekCounts, setWeekCounts] = useState({}); // { iso: count }

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
  const [enquiryLocked, setEnquiryLocked] = useState(false); // true once an enquiry is chosen from the combobox

  const [search, setSearch] = useState("");

  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [childName, setChildName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [patientLocked, setPatientLocked] = useState(false); // true once chosen from the list

  // "search" = pick an existing child from the patient list; "new" = quick
  // add of a child who isn't registered yet. Only one is shown at a time.
  const [bookingMode, setBookingMode] = useState("search");
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusBusyId, setStatusBusyId] = useState(null);

  const [rescheduleAppt, setRescheduleAppt] = useState(null); // full appointment object currently open in the reschedule modal
  const [reassignTherapistId, setReassignTherapistId] = useState("");
  const [reassignBusy, setReassignBusy] = useState(false);

  const [cancelId, setCancelId] = useState(null); // appointment id currently being cancelled
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  // Enquiry Form modal — the standalone "+" trigger in the header, separate
  // from the slot booking flow. Captures a walk-in/phone enquiry before the
  // child is registered as a patient.
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryChildName, setEnquiryChildName] = useState("");
  const [enquiryAge, setEnquiryAge] = useState("");
  const [enquiryAddress, setEnquiryAddress] = useState("");
  const [enquiryProblem, setEnquiryProblem] = useState("");
  const [enquiryMobile, setEnquiryMobile] = useState("");
  const [enquirySaving, setEnquirySaving] = useState(false);

  const isPastDate = (iso) => iso < todayISO();

  /* ---------------- loaders ---------------- */

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    const res = await apiRequest(`${Milestonebaseurl}get_dailytimeslot/`, "GET");
    if (res.success) {
      setSlots(res.data?.data || []);
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load the daily slot grid." });
    }
    setLoadingSlots(false);
  }, []);

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
      setAppointmentsByDate((prev) => ({ ...prev, [dateISO]: data }));
    } else {
      setToast({ type: "error", text: res.error || "Couldn't load appointments for this date." });
    }
    setLoadingAppointments(false);
  }, []);

  const handleSlotDateChange = useCallback(async (slotKey, newDate) => {
    setSlotDates((prev) => ({ ...prev, [slotKey]: newDate }));
    if (!appointmentsByDate[newDate]) {
      await loadAppointments(newDate);
    }
  }, [appointmentsByDate, loadAppointments]);

  const loadWeekCounts = useCallback(async (anchorISO) => {
    const days = weekDays(anchorISO);
    const results = await Promise.all(
      days.map((iso) =>
        apiRequest(`${Milestonebaseurl}get_appointments_by_date/?date=${iso}`, "GET")
      )
    );
    const counts = {};
    days.forEach((iso, idx) => {
      counts[iso] = results[idx].success ? (results[idx].data?.data || []).length : 0;
    });
    setWeekCounts(counts);
  }, []);

  useEffect(() => {
    loadSlots();
    loadTherapists();
    loadPatients();
    loadEnquiries();
  }, [loadSlots, loadTherapists, loadPatients, loadEnquiries]);

  useEffect(() => {
    loadAppointments(todayISO());
  }, [loadAppointments]);

  useEffect(() => {
    if (view === "week") loadWeekCounts(todayISO());
  }, [view, loadWeekCounts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- derived ---------------- */

  const appointmentsBySlot = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const key = appointmentStartKey(a);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [appointments]);

  const filteredSlots = useMemo(() => {
    if (!search.trim()) return slots;
    const q = search.trim().toLowerCase();
    return slots.filter((s) => {
      const label = s.label || `${s.start}-${s.end}`;
      if (label.toLowerCase().includes(q)) return true;
      const key = slotStartKey(s);
      return (appointmentsBySlot[key] || []).some(
        (a) =>
          a.name_of_child?.toLowerCase().includes(q) ||
          a.registration_number?.toLowerCase().includes(q) ||
          (therapistMap[a.therapist_id] || "").toLowerCase().includes(q)
      );
    });
  }, [slots, search, appointmentsBySlot, therapistMap]);

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

  // Multiple therapists can share the same time slot (each with a different
  // child) — so we don't hide the whole slot once one doctor is booked.
  // We only need to exclude a therapist who is *already* booked in this
  // specific slot, so the same doctor can't be double-booked at once.
  const availableTherapists = useMemo(() => {
    if (!activeSlot) return therapists;
    const key = slotStartKey(activeSlot);
    const slotDate = slotDates[key] || todayISO();
    const appointmentsOnDate = appointmentsByDate[slotDate] || [];
    const bookedTherapistIds = new Set(
      appointmentsOnDate
        .filter((a) => appointmentStartKey(a) === key && a.status !== "Cancelled")
        .map((a) => a.therapist_id)
    );
    return therapists.filter((t) => !bookedTherapistIds.has(t.employeeId));
  }, [activeSlot, slotDates, appointmentsByDate, therapists]);

  const openSlot = (slot) => {
    if (slot.is_break) return;
    const key = slotStartKey(slot);
    const slotDate = slotDates[key] || todayISO();
    if (isPastDate(slotDate)) {
      setToast({ type: "error", text: "Can't book an appointment on a past date." });
      return;
    }
    setActiveSlot(slot);
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

  const closeFlow = () => {
    setActiveSlot(null);
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

  // Switching tabs clears whatever was entered in the other one, so a
  // half-filled "New Child Entry" form doesn't leak into a search pick (or
  // vice versa).
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

  // Selecting a name from the enquiry combobox populates the same fields
  // "New Child Entry" uses (name/address/mobile), then locks them — same
  // pattern as choosePatient locking the Search Patient card.
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
    if (!activeSlot) return;
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
    const key = activeSlot.label || `${activeSlot.start}-${activeSlot.end}`;
    const slotKey = slotStartKey(activeSlot);
    const bookingDate = slotDates[slotKey] || todayISO();
    const fallback = parseSlotLabelTimes(key);
    const slotStart = activeSlot.start || fallback.start;
    const slotEnd = activeSlot.end || fallback.end;

    if (!slotStart || !slotEnd) {
      setToast({ type: "error", text: "This slot has no start/end time — can't book it." });
      return;
    }

    setSaving(true);
    const res = await apiRequest(`${Milestonebaseurl}create_appointment/`, "POST", {
      date: bookingDate,
      name_of_child: childName.trim(),
      registration_number: regNumber.trim(),
      therapist_id: selectedTherapist.employeeId,
      slot_label: key,
      slot_start_time: slotStart,
      slot_end_time: slotEnd,
      status: "Scheduled",
      // Only present for a fresh, not-yet-registered child — omitted (blank)
      // for an existing patient picked via search.
      ...(bookingMode === "new"
        ? {
            mother_name: motherName.trim(),
            father_name: fatherName.trim(),
            mobile_number: mobileNumber.trim(),
            address: address.trim(),
          }
        : {}),
      // Booked from a saved enquiry — carry over its contact/context fields.
      // enquiry_id/age/problem will only persist if the Appointment
      // model/serializer on the backend has matching columns for them.
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
      loadAppointments(bookingDate);
      if (view === "week") loadWeekCounts(bookingDate);
    } else {
      const msg =
        res.error ||
        res.data?.error ||
        res.data?.errors?.non_field_errors?.[0] ||
        "Couldn't book this appointment — the slot may already be taken.";
      setToast({ type: "error", text: msg });
    }
    setSaving(false);
  };

  const patchAppointment = (appointmentId, extra) =>
    apiRequest(`${Milestonebaseurl}update_appointment_status/`, "PATCH", {
      appointment_id: appointmentId,
      ...extra,
    });

  const updateStatus = async (appointmentId, newStatus) => {
    setStatusBusyId(appointmentId);
    const res = await patchAppointment(appointmentId, { status: newStatus });
    if (res.success) {
      loadAppointments(findAppointmentDate(appointmentId));
    } else {
      setToast({ type: "error", text: res.error || "Couldn't update the appointment status." });
    }
    setStatusBusyId(null);
  };

  const startReassign = (appointment) => {
    dismissCancel();
    setRescheduleAppt(appointment);
    // Pre-select the doctor the appointment is currently with — therapist_id
    // is always the originally-booked doctor since it's never overwritten.
    setReassignTherapistId(appointment.therapist_id || "");
  };

  const cancelReassign = () => {
    setRescheduleAppt(null);
    setReassignTherapistId("");
  };

  const submitReassign = async () => {
    if (!rescheduleAppt) return;
    if (!reassignTherapistId) {
      setToast({ type: "error", text: "Select a doctor to reschedule to." });
      return;
    }
    setReassignBusy(true);
    // Reschedule = assigning a different therapist for the same slot. Only
    // rescheduled_therapist_id is sent/updated — therapist_id (the original
    // booking) is left untouched, both here and on the backend.
    const res = await patchAppointment(rescheduleAppt.id, {
      status: "Rescheduled",
      rescheduled_therapist_id: reassignTherapistId,
    });
    if (res.success) {
      const msg = res.data?.message || "Appointment rescheduled.";
      setToast({ type: "success", text: msg });
      const apptDate = rescheduleAppt.date || selectedDate || todayISO();
      cancelReassign();
      loadAppointments(apptDate);
    } else {
      const msg = res.error || res.data?.error || "Couldn't reschedule the appointment.";
      setToast({ type: "error", text: msg });
    }
    setReassignBusy(false);
  };

  const startCancel = (appointmentId) => {
    cancelReassign();
    setCancelId(appointmentId);
    setCancelReason("");
  };

  const dismissCancel = () => {
    setCancelId(null);
    setCancelReason("");
  };

  const submitCancel = async (appointmentId) => {
    if (!cancelReason.trim()) {
      setToast({ type: "error", text: "Enter a reason for cancelling." });
      return;
    }
    setCancelBusy(true);
    // Cancel: frontend sends status: "Cancelled" plus the reason; backend
    // flips isactive to false and stores the reason against the appointment.
    const res = await patchAppointment(appointmentId, {
      status: "Cancelled",
      cancel_reason: cancelReason.trim(),
    });
    if (res.success) {
      const msg = res.data?.message || "Appointment cancelled.";
      setToast({ type: "success", text: msg });
      const apptDate = findAppointmentDate(appointmentId);
      dismissCancel();
      loadAppointments(apptDate);
    } else {
      setToast({ type: "error", text: res.error || res.data?.error || "Couldn't cancel the appointment." });
    }
    setCancelBusy(false);
  };

  const openEnquiry = () => {
    setEnquiryChildName("");
    setEnquiryAge("");
    setEnquiryAddress("");
    setEnquiryProblem("");
    setEnquiryMobile("");
    setEnquiryOpen(true);
  };

  const closeEnquiry = () => {
    if (enquirySaving) return;
    setEnquiryOpen(false);
  };

  const submitEnquiry = async () => {
    if (!enquiryChildName.trim()) {
      setToast({ type: "error", text: "Enter the child's name." });
      return;
    }
    if (!enquiryAge.trim()) {
      setToast({ type: "error", text: "Enter the child's age." });
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

  /* ---------------- render ---------------- */

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Appointment Scheduling</p>
          <h1 style={styles.title}>Appointments</h1>
          <p style={styles.headerSub}>
            Manage and schedule your daily appointment slots.
          </p>
        </div>

        <div style={styles.headerControls}>
          <div className="aps-search-box" style={styles.searchBox}>
            <SearchIcon />
            <input
              placeholder="Search a slot, kid, or doctor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <EnquiryFabButton
            type="button"
            title="New Enquiry"
            aria-label="New Enquiry"
            onClick={openEnquiry}
          >
            +
          </EnquiryFabButton>
        </div>
      </header>

      {loadingSlots || loadingAppointments ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aps-skeleton-row" style={styles.skeletonRow} />
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <p style={styles.muted}>No slots match your search.</p>
      ) : (
        <div className="aps-slot-grid" style={styles.slotGrid}>
          {filteredSlots.map((slot, i) => {
            const label = slot.label || `${slot.start}-${slot.end}`;
            const key = slotStartKey(slot);
            const slotDate = slotDates[key] || todayISO();
            const booked = (appointmentsByDate[slotDate] || []).filter(
              (a) => appointmentStartKey(a) === key
            );

            // Break slots aren't bookable and no longer get their own tile —
            // skip them so the grid only shows actual appointment cards.
            if (slot.is_break) {
              return null;
            }

            const bookedTherapistIdsForSlot = new Set(
              booked.filter((a) => a.status !== "Cancelled").map((a) => a.therapist_id)
            );
            const slotFull =
              therapists.length > 0 && bookedTherapistIdsForSlot.size >= therapists.length;

            return (
              <div key={i} className="aps-card" style={styles.slotCard}>
                <div style={styles.slotCardHeader}>{label}</div>

                <div style={styles.slotCardBody}>
                  {/* Date Picker inside the slot */}
                  <div style={styles.slotDatePickerWrap}>
                    <span style={styles.slotDateLabel}>Date</span>
                    <input
                      type="date"
                      min={todayISO()}
                      value={slotDate}
                      onChange={(e) => handleSlotDateChange(key, e.target.value)}
                      style={styles.slotDateInput}
                    />
                  </div>

                  {booked.length > 0 ? (
                    <p style={styles.slotBookedMessage}>Already Booked</p>
                  ) : (
                    <>
                      <p style={styles.slotCardEmpty}>No appointment booked yet.</p>
                      <button
                        className="aps-add-btn"
                        style={{ ...styles.addBtn, ...(slotFull ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
                        disabled={slotFull}
                        onClick={() => openSlot(slot)}
                      >
                        {slotFull ? "All doctors booked" : "+ Book this slot"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSlot && (
        <ModalBackdrop onClick={closeFlow}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>
                  <CheckCircleIcon /> Book Appointment
                </ModalTitle>
                <ModalSubtitle>
                  {activeSlot.label || `${activeSlot.start}-${activeSlot.end}`} ·{" "}
                  {formatDateLabel(slotDates[slotStartKey(activeSlot)] || todayISO())}
                </ModalSubtitle>
              </div>
              <CloseButton onClick={closeFlow}>✕</CloseButton>
            </ModalHeader>

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

            <SectionTitle>Consultant Doctor</SectionTitle>
            <FormGroup>
              <InputWrapper disabled={loadingTherapists}>
                <StyledSelect
                  value={selectedTherapist?.employeeId || ""}
                  disabled={loadingTherapists}
                  onChange={(e) => chooseTherapistById(e.target.value)}
                >
                  <option value="" disabled>
                    {loadingTherapists
                      ? "Loading doctors…"
                      : availableTherapists.length
                      ? "Select doctor"
                      : "All doctors already booked in this slot"}
                  </option>
                  {availableTherapists.map((t) => (
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

      {rescheduleAppt && (
        <ModalBackdrop onClick={cancelReassign}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <ModalTitle>⇄ Reschedule Appointment</ModalTitle>
                <ModalSubtitle>
                  {appointmentSlotLabel(rescheduleAppt)} · {formatDateLabel(rescheduleAppt.date || todayISO())}
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

            <SectionTitle>Currently With</SectionTitle>
            <FormGroup>
              <InputWrapper disabled>
                <BareInput
                  value={therapistMap[rescheduleAppt.therapist_id] || rescheduleAppt.therapist_id || ""}
                  readOnly
                  disabled
                />
              </InputWrapper>
            </FormGroup>

            <SectionTitle>Reschedule To</SectionTitle>
            <FormGroup>
              <InputWrapper disabled={loadingTherapists}>
                <StyledSelect
                  value={reassignTherapistId}
                  disabled={loadingTherapists}
                  onChange={(e) => setReassignTherapistId(e.target.value)}
                >
                  <option value="" disabled>
                    {loadingTherapists ? "Loading doctors…" : "Select new doctor"}
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
                {reassignBusy ? "Rescheduling…" : "Reschedule"}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

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

      {toast && (
        <div
          className="aps-toast"
          style={{ ...styles.toast, ...(toast.type === "success" ? styles.toastOk : styles.toastError) }}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
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

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

  @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
  @keyframes rowIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  * { box-sizing: border-box; }
  button { font-family: inherit; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  input:focus { outline: 2px solid ${tokens.pine}; outline-offset: 1px; }
  button:focus-visible { outline: 2px solid ${tokens.pine}; outline-offset: 2px; }

  .aps-search-box { transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
  .aps-search-box:focus-within {
    border-color: ${tokens.pine};
    background: #fff;
    box-shadow: 0 0 0 4px ${tokens.pineSoft};
  }

  .aps-toggle-btn { transition: background 0.2s ease, color 0.2s ease; }
  .aps-toggle-btn:hover:not(.active) { background: ${tokens.pineSoft}; color: ${tokens.pineDeep}; }

  .aps-date-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .aps-date-input:hover { border-color: ${tokens.pine}; }
  .aps-date-input:focus { border-color: ${tokens.pine}; box-shadow: 0 0 0 4px ${tokens.pineSoft}; }

  .aps-day-medal { transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
  .aps-day-medal:hover { transform: translateY(-2px); box-shadow: ${tokens.shadow}; }

  .aps-row { animation: rowIn 0.32s ease both; }

  .aps-card {
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .aps-card:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadowLift};
  }

  .aps-add-btn { transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease; }
  .aps-add-btn:hover { background: ${tokens.pineSoft}; border-color: ${tokens.pine}; }

  .aps-booking-row { transition: background 0.2s ease, box-shadow 0.2s ease; }
  .aps-booking-row:hover { box-shadow: inset 0 0 0 1px rgba(31,92,70,0.18); }

  .aps-icon-btn { transition: background 0.15s ease, transform 0.1s ease; }
  .aps-icon-btn:hover { background: ${tokens.sageSoft}; transform: scale(1.1); }
  .aps-icon-btn.danger:hover { background: ${tokens.roseSoft}; }

  .aps-toast { animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1); }

  .aps-dot { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

  .aps-skeleton-row {
    background: linear-gradient(90deg, ${tokens.paperRaised} 25%, #EFE7D2 37%, ${tokens.paperRaised} 63%);
    background-size: 500px 100%;
    animation: shimmer 1.4s infinite linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .aps-card, .aps-day-medal, .aps-icon-btn, .aps-toast, .aps-row, .aps-dot, .aps-skeleton-row { animation: none !important; transition: none !important; }
  }

  @media (max-width: 720px) {
    .aps-timeline-row { grid-template-columns: 52px 20px 1fr !important; }
    .aps-time-col { font-size: 13px !important; }
    .aps-spine { left: 74px !important; }
  }

  /* 4-up slot grid collapses gracefully on smaller viewports */
  @media (max-width: 1100px) {
    .aps-slot-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 560px) {
    .aps-slot-grid { grid-template-columns: 1fr !important; }
  }
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
    fontSize: 36,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: tokens.pineDeep,
  },
  headerSub: { margin: "6px 0 0", fontSize: 13.5, color: tokens.inkSoft },
  headerControls: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
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
  viewToggle: {
    display: "flex",
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 12,
    overflow: "hidden",
    background: tokens.paperRaised,
  },
  toggleBtn: {
    border: "none",
    background: "transparent",
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: tokens.inkSoft,
  },
  toggleBtnActive: { background: tokens.pine, color: "#fff" },
  dateInput: {
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 12,
    padding: "9px 12px",
    fontSize: 14,
    background: tokens.paperRaised,
    color: tokens.ink,
    fontWeight: 600,
  },

  /* date caption + centered date picker above the timeline */
  dateCenterRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    margin: "26px 0 24px",
  },
  dateLabel: {
    margin: 0,
    fontFamily: tokens.fontDisplay,
    fontSize: 19,
    fontWeight: 600,
    color: tokens.ink,
  },
  centeredDateInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: tokens.paperRaised,
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 12,
    padding: "9px 16px",
    cursor: "pointer",
  },
  dateInputBare: {
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 600,
    color: tokens.ink,
    cursor: "pointer",
  },

  /* week strip — a row of date medallions */
  weekStrip: {
    display: "flex",
    gap: 10,
    marginTop: 22,
    marginBottom: 8,
    overflowX: "auto",
    paddingBottom: 4,
  },
  dayMedal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    border: `1.5px solid ${tokens.line}`,
    background: tokens.paperRaised,
    borderRadius: 16,
    padding: "12px 18px",
    color: tokens.ink,
    flex: "0 0 auto",
    minWidth: 68,
  },
  dayMedalActive: { borderColor: tokens.pine, background: tokens.pineDeep },
  dayMedalDay: { fontSize: 10.5, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", color: tokens.inkSoft },
  dayMedalDayActive: { color: "rgba(255,255,255,0.7)" },
  dayMedalDate: { fontFamily: tokens.fontDisplay, fontSize: 21, fontWeight: 600 },
  dayMedalDateActive: { color: "#fff" },
  dayMedalCount: { fontSize: 10, fontWeight: 600, color: tokens.inkSoft },
  dayMedalCountActive: { color: tokens.marigoldSoft },

  /* timeline / ledger */
  timeline: { position: "relative", maxWidth: 720, marginTop: 4 },
  timelineSpine: {
    position: "absolute",
    left: 78,
    top: 8,
    bottom: 8,
    width: 1,
    background: tokens.line,
  },
  timelineRow: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "56px 20px 1fr",
    columnGap: 12,
    marginBottom: 14,
  },
  timeCol: {
    textAlign: "right",
    fontFamily: tokens.fontDisplay,
    fontSize: 14.5,
    fontWeight: 600,
    color: tokens.inkSoft,
    paddingTop: 14,
    lineHeight: 1.3,
  },
  dotCol: { display: "flex", justifyContent: "center", paddingTop: 20 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: tokens.pine,
    boxShadow: `0 0 0 4px ${tokens.paper}`,
    flexShrink: 0,
  },
  dotEmpty: { background: tokens.paperRaised, boxShadow: `0 0 0 4px ${tokens.paper}`, border: `1.5px solid ${tokens.line}` },
  dotBreak: { width: 6, height: 6, background: tokens.inkFaint },

  card: {
    position: "relative",
    background: tokens.paperRaised,
    border: `1px solid ${tokens.lineSoft}`,
    borderRadius: 16,
    padding: "14px 18px 14px 20px",
    boxShadow: tokens.shadow,
    overflow: "hidden",
  },

  /* slot-card grid — fixed 4-up layout (matches the reference screenshot, existing pine palette).
     Uses "aps-slot-grid" class in the global CSS block below to add a responsive fallback for
     narrow screens, since inline styles can't hold @media queries. */
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginTop: 4,
  },
  slotCard: {
    background: tokens.paperRaised,
    border: `1px solid ${tokens.lineSoft}`,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: tokens.shadow,
    display: "flex",
    flexDirection: "column",
  },
  slotCardHeader: {
    background: `linear-gradient(135deg, ${tokens.pine} 0%, ${tokens.pineDeep} 100%)`,
    color: "#fff",
    textAlign: "center",
    padding: "12px 14px",
    fontWeight: 700,
    fontSize: 14.5,
    letterSpacing: "0.01em",
  },
  slotCardBody: {
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  slotCardEmpty: { margin: 0, fontSize: 13, color: tokens.inkFaint, textAlign: "center", padding: "6px 0" },
  bookedEntry: {
    border: `1px solid ${tokens.lineSoft}`,
    borderRadius: 12,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: tokens.paper,
  },
  bookedEntryTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  bookedName: { margin: 0, fontSize: 14, fontWeight: 700, color: tokens.ink },
  bookedReg: { margin: 0, fontSize: 12, color: tokens.inkSoft, fontWeight: 600 },
  bookedActionsRow: { display: "flex", gap: 8, marginTop: 6 },
  rescheduleBtn: {
    flex: 1,
    border: `1.5px solid ${tokens.pine}`,
    background: tokens.pineSoft,
    color: tokens.pineDeep,
    borderRadius: 8,
    padding: "7px 8px",
    fontSize: 12.5,
    fontWeight: 700,
  },
  cancelBtn: {
    flex: 1,
    border: `1.5px solid ${tokens.rose}`,
    background: tokens.roseSoft,
    color: tokens.rose,
    borderRadius: 8,
    padding: "7px 8px",
    fontSize: 12.5,
    fontWeight: 700,
  },
  reassignRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 6 },
  reasonInput: {
    flex: 1,
    border: `1.5px solid ${tokens.line}`,
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12.5,
    background: "#fff",
    color: tokens.ink,
    height: 40,
    boxSizing: "border-box",
  },
  breakCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    border: `1.5px dashed ${tokens.line}`,
    borderRadius: 16,
    minHeight: 100,
    color: tokens.inkFaint,
  },
  breakCardLabel: { fontSize: 12.5, fontWeight: 700, fontStyle: "italic" },
  breakCardTime: { fontSize: 11.5 },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  breakRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    paddingTop: 16,
    color: tokens.inkFaint,
    fontSize: 12.5,
    fontWeight: 600,
    fontStyle: "italic",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  slotTime: { fontFamily: tokens.fontDisplay, fontSize: 16.5, fontWeight: 600, color: tokens.ink },
  slotCount: { fontSize: 11, color: tokens.inkSoft, fontWeight: 600 },
  cardBody: { display: "flex", flexDirection: "column", gap: 8 },
  addBtn: {
    border: `1.5px dashed ${tokens.line}`,
    background: "transparent",
    borderRadius: 10,
    padding: "11px 10px",
    color: tokens.pine,
    fontSize: 13.5,
    fontWeight: 700,
    width: "100%",
  },
  bookingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    background: tokens.paper,
    borderRadius: 10,
    padding: "8px 10px",
  },
  bookingRowLeft: { display: "flex", alignItems: "center", gap: 9, minWidth: 0 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: tokens.paperRaised,
    color: tokens.pineDeep,
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kidName: { margin: 0, fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  therapistName: { margin: "1px 0 0", fontSize: 11.5, color: tokens.inkSoft },
  originalTherapistNote: { margin: "1px 0 0", fontSize: 10.5, color: tokens.inkFaint, fontStyle: "italic" },
  rowRight: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  badge: { fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999, letterSpacing: "0.02em" },
  rowActions: { display: "flex", gap: 2 },
  iconBtn: { border: "none", background: "transparent", width: 24, height: 24, borderRadius: 7, fontSize: 12, color: tokens.sage, fontWeight: 700 },
  muted: { color: tokens.inkSoft, fontSize: 13.5 },
  skeletonRow: { height: 76, borderRadius: 16, marginLeft: 76 },
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
  slotDatePickerWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
    borderBottom: `1px solid ${tokens.lineSoft}`,
    paddingBottom: 8,
  },
  slotDateLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: tokens.inkSoft,
  },
  slotDateInput: {
    padding: "4px 8px",
    borderRadius: 8,
    border: `1.5px solid ${tokens.line}`,
    fontSize: 12,
    background: "#fff",
    color: tokens.ink,
    outline: "none",
    cursor: "pointer",
  },
  slotBookedMessage: {
    margin: 0,
    fontSize: 13.5,
    fontWeight: 700,
    color: tokens.rose,
    textAlign: "center",
    padding: "10px 0",
  },
};