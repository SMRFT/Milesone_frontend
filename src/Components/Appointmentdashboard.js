import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

/* ----------------------------------------------------------------------
 * Design tokens — matches AppointmentSchedule.js palette
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

const STATUS_STYLE = {
  Scheduled: { bg: tokens.marigoldSoft, fg: tokens.marigold, label: "Scheduled" },
  Rescheduled: { bg: tokens.pineSoft, fg: tokens.pineDeep, label: "Rescheduled" },
  Cancelled: { bg: tokens.roseSoft, fg: tokens.rose, label: "Cancelled" },
};

const ROLE_LABEL = {
  admin: "Admin",
  receptionist: "Receptionist",
  therapist: "Therapist",
};

const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const isPastDate = (iso) => (iso ? iso < todayISO() : false);

const normalizeTimeHHMM = (timeStr) => {
  if (!timeStr) return "";
  const parts = String(timeStr).split(":");
  if (parts.length >= 2) {
    return `${parts[0].trim().padStart(2, "0")}:${parts[1].trim().padStart(2, "0")}`;
  }
  return String(timeStr).trim();
};

/* ----------------------------------------------------------------------
 * Styled components
 * -------------------------------------------------------------------- */
const PageWrap = styled.div`
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: ${tokens.paper};
  min-height: 100%;
  padding: 28px 32px 60px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-family: ${tokens.fontDisplay};
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: ${tokens.pineDeep};
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13.5px;
  color: ${tokens.inkSoft};
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${tokens.pineSoft};
  color: ${tokens.pineDeep};
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  margin-bottom: 26px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: ${tokens.paperRaised};
  border: 1px solid ${tokens.lineSoft};
  border-radius: ${tokens.radius};
  padding: 18px 20px;
  box-shadow: ${tokens.shadow};
`;

const SummaryLabel = styled.p`
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${tokens.inkSoft};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SummaryValue = styled.p`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 30px;
  font-weight: 600;
  color: ${tokens.pineDeep};
`;

const FiltersBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex-wrap: wrap;
  background: ${tokens.paperRaised};
  border: 1px solid ${tokens.lineSoft};
  border-radius: ${tokens.radius};
  padding: 16px 18px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
`;

const FilterLabel = styled.label`
  font-size: 11.5px;
  font-weight: 700;
  color: ${tokens.inkSoft};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const FilterInput = styled.input`
  border: 1px solid ${tokens.line};
  border-radius: ${tokens.radiusSm};
  padding: 9px 12px;
  font-size: 13.5px;
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: ${tokens.paper};
  outline: none;

  &:focus {
    border-color: ${tokens.pine};
  }
`;

const FilterSelect = styled.select`
  border: 1px solid ${tokens.line};
  border-radius: ${tokens.radiusSm};
  padding: 9px 12px;
  font-size: 13.5px;
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: ${tokens.paper};
  outline: none;

  &:focus {
    border-color: ${tokens.pine};
  }
`;

const ClearBtn = styled.button`
  border: 1px solid ${tokens.line};
  background: transparent;
  color: ${tokens.inkSoft};
  border-radius: ${tokens.radiusSm};
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${tokens.lineSoft};
  }
`;

const TableWrap = styled.div`
  background: ${tokens.paperRaised};
  border: 1px solid ${tokens.lineSoft};
  border-radius: ${tokens.radius};
  box-shadow: ${tokens.shadow};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
`;

const Th = styled.th`
  text-align: left;
  padding: 13px 16px;
  background: ${tokens.pineSoft};
  color: ${tokens.pineDeep};
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid ${tokens.lineSoft};
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${tokens.lineSoft};
  color: ${tokens.ink};
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
`;

const EmptyState = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: ${tokens.inkSoft};
  font-size: 14px;
`;

const ErrorBanner = styled.div`
  background: ${tokens.roseSoft};
  color: ${tokens.rose};
  border-radius: ${tokens.radiusSm};
  padding: 12px 16px;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 18px;
`;

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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2.2rem;
  border-radius: 24px;
  width: 480px;
  max-width: 100%;
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

const ModalTitle = styled.h3`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  color: ${tokens.pineDeep};
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const InfoCard = styled.div`
  background: ${tokens.paper};
  border: 1px solid ${tokens.lineSoft};
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 1.5rem;
  font-size: 13.5px;
  line-height: 1.5;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  &:last-child { margin-bottom: 0; }
`;

const InfoLabel = styled.span`
  color: ${tokens.inkSoft};
  font-weight: 600;
`;

const InfoValue = styled.span`
  color: ${tokens.ink};
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: ${tokens.inkSoft};
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid ${tokens.line};
  border-radius: 12px;
  font-size: 14px;
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: #f9fafb;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: ${tokens.pine};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(31, 92, 70, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 11px 14px;
  border: 1.5px solid ${tokens.line};
  border-radius: 12px;
  font-size: 14px;
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: #f9fafb;
  outline: none;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
  &:focus {
    border-color: ${tokens.pine};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(31, 92, 70, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: ${tokens.pine};
  color: white;
  &:hover:not(:disabled) {
    background: ${tokens.pineDeep};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: ${tokens.lineSoft};
  color: ${tokens.inkSoft};
  border: 1px solid ${tokens.line};
  &:hover {
    background: ${tokens.line};
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 13px 20px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 12px 32px -8px rgba(0,0,0,0.25);
  z-index: 1100;
  background: ${props => props.type === "error" ? tokens.rose : tokens.pineDeep};
  color: #fff;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 6px;
  transition: all 0.2s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RescheduleBtn = styled(ActionButton)`
  background: ${tokens.pineSoft};
  color: ${tokens.pineDeep};
  border: 1.5px solid ${tokens.pine};
  &:hover:not(:disabled) {
    background: ${tokens.pine};
    color: white;
  }
`;

const CancelBtn = styled(ActionButton)`
  background: ${tokens.roseSoft};
  color: ${tokens.rose};
  border: 1.5px solid ${tokens.rose};
  &:hover:not(:disabled) {
    background: ${tokens.rose};
    color: white;
  }
`;

const FinishBtn = styled(ActionButton)`
  background: ${tokens.marigoldSoft};
  color: ${tokens.marigold};
  border: 1.5px solid ${tokens.marigold};
  &:hover:not(:disabled) {
    background: ${tokens.marigold};
    color: white;
  }
`;

const ActionTd = styled(Td)`
  white-space: nowrap;
`;

/* ----------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------- */
export default function AppointmentDashboard() {
  const [role, setRole] = useState(null);
  const [viewerName, setViewerName] = useState(null);
  const [summary, setSummary] = useState({
    total_appointments: 0,
    today_appointments: 0,
    scheduled_appointments: 0,
    rescheduled_appointments: 0,
    cancelled: 0,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default view is "today" for both From and To — the user can widen the
  // range to see a broader window instead.
  // Default view is empty (shows upcoming and pending appointments)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [therapists, setTherapists] = useState([]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("10:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("10:45");
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [rescheduleDateBookings, setRescheduleDateBookings] = useState([]);

  const [employeeId, setEmployeeId] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [reassignTherapistId, setReassignTherapistId] = useState("");
  const [reassignBusy, setReassignBusy] = useState(false);

  const [cancelAppt, setCancelAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  const [finishBusyId, setFinishBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const canFilterByTherapist = role === "admin" || role === "receptionist";

  const loadDashboard = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.from_date) params.set("from_date", filters.from_date);
    if (filters.to_date) params.set("to_date", filters.to_date);
    if (filters.status) params.set("status", filters.status);
    if (filters.therapist_id) params.set("therapist_id", filters.therapist_id);
    const qs = params.toString();

    const res = await apiRequest(
      `${Milestonebaseurl}appointment_dashboard/${qs ? `?${qs}` : ""}`,
      "GET"
    );

    if (res.success) {
      const body = res.data || {};
      setRole(body.role || null);
      setViewerName(body.viewer?.employee_name || null);
      setEmployeeId(body.viewer?.employee_id || null);
      setSummary(
        body.summary || {
          total_appointments: 0,
          today_appointments: 0,
          scheduled_appointments: 0,
          rescheduled_appointments: 0,
          cancelled: 0,
        }
      );
      setRows(body.data || []);
    } else {
      setError(res.error || res.data?.error || "Couldn't load the appointment dashboard.");
      setRows([]);
    }
    setLoading(false);
  }, []);  const loadTherapists = useCallback(async () => {
    const res = await apiRequest(`${Milestonebaseurl}get_all_therapists/`, "GET");
    if (res.success) {
      setTherapists(res.data?.data || []);
    }
  }, []);

  const loadTimeSlots = useCallback(async () => {
    const res = await apiRequest(`${Milestonebaseurl}get_dailytimeslot/`, "GET");
    if (res.success) {
      setTimeSlots(res.data?.data || []);
    }
  }, []);

  useEffect(() => {
    if (!rescheduleDate) {
      setRescheduleDateBookings([]);
      return;
    }
    const fetchDateBookings = async () => {
      const res = await apiRequest(`${Milestonebaseurl}get_appointments_by_date/?date=${rescheduleDate}`, "GET");
      if (res.success) {
        setRescheduleDateBookings(res.data?.data || []);
      }
    };
    fetchDateBookings();
  }, [rescheduleDate]);

  const getAvailableTherapistsForReschedule = () => {
    if (!rescheduleSlot) return therapists;
    const targetStart = normalizeTimeHHMM(rescheduleSlot.start);
    const bookedTherapistIds = new Set(
      rescheduleDateBookings
        .filter((a) => {
          const apptStart = normalizeTimeHHMM(a.slot_start_time || (a.slot_time ? a.slot_time.split("-")[0].trim() : ""));
          return apptStart === targetStart && a.status !== "Cancelled" && a.appointment_id !== rescheduleAppt?.appointment_id;
        })
        .map((a) => a.therapist_id)
    );
    return therapists.filter((t) => !bookedTherapistIds.has(t.employeeId));
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleAppt) return;
    if (!reassignTherapistId) {
      setToast({ type: "error", text: "Please select a doctor to reschedule to." });
      return;
    }
    if (!rescheduleDate) {
      setToast({ type: "error", text: "Please select a date." });
      return;
    }
    if (isPastDate(rescheduleDate)) {
      setToast({ type: "error", text: "Cannot select a past date for rescheduling." });
      return;
    }
    if (!rescheduleStartTime || !rescheduleEndTime) {
      setToast({ type: "error", text: "Please select start and end time." });
      return;
    }
    setReassignBusy(true);
    const res = await apiRequest(`${Milestonebaseurl}update_appointment_status/`, "PATCH", {
      appointment_id: rescheduleAppt.appointment_id,
      status: "Rescheduled",
      rescheduled_therapist_id: reassignTherapistId,
      date: rescheduleDate,
      slot_start_time: rescheduleStartTime,
      slot_end_time: rescheduleEndTime,
    });
    if (res.success) {
      setToast({ type: "success", text: res.data?.message || "Appointment rescheduled successfully." });
      setRescheduleAppt(null);
      setReassignTherapistId("");
      loadDashboard({
        from_date: fromDate,
        to_date: toDate,
        status: statusFilter,
        therapist_id: therapistFilter,
      });
    } else {
      setToast({ type: "error", text: res.error || res.data?.error || "Failed to reschedule." });
    }
    setReassignBusy(false);
  };

  const handleCancelSubmit = async () => {
    if (!cancelAppt) return;
    if (!cancelReason.trim()) {
      setToast({ type: "error", text: "Please enter a reason for cancelling." });
      return;
    }
    setCancelBusy(true);
    const res = await apiRequest(`${Milestonebaseurl}update_appointment_status/`, "PATCH", {
      appointment_id: cancelAppt.appointment_id,
      status: "Cancelled",
      cancel_reason: cancelReason.trim(),
    });
    if (res.success) {
      setToast({ type: "success", text: "Appointment cancelled successfully." });
      setCancelAppt(null);
      setCancelReason("");
      loadDashboard({
        from_date: fromDate,
        to_date: toDate,
        status: statusFilter,
        therapist_id: therapistFilter,
      });
    } else {
      setToast({ type: "error", text: res.error || res.data?.error || "Failed to cancel." });
    }
    setCancelBusy(false);
  };

  const handleFinishConsulting = async (appointmentId) => {
    setFinishBusyId(appointmentId);
    const res = await apiRequest(`${Milestonebaseurl}update_appointment_status/`, "PATCH", {
      appointment_id: appointmentId,
      status: "Finished",
    });
    if (res.success) {
      setToast({ type: "success", text: "Consultation finished successfully." });
      loadDashboard({
        from_date: fromDate,
        to_date: toDate,
        status: statusFilter,
        therapist_id: therapistFilter,
      });
    } else {
      setToast({ type: "error", text: res.error || res.data?.error || "Failed to finish consulting." });
    }
    setFinishBusyId(null);
  };

  useEffect(() => {
    loadDashboard({
      from_date: fromDate,
      to_date: toDate,
      status: statusFilter,
      therapist_id: therapistFilter,
    });
    loadTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canFilterByTherapist && therapists.length === 0) {
      loadTherapists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const applyFilters = (next) => {
    const merged = {
      from_date: next.from_date !== undefined ? next.from_date : fromDate,
      to_date: next.to_date !== undefined ? next.to_date : toDate,
      status: next.status !== undefined ? next.status : statusFilter,
      therapist_id: next.therapist_id !== undefined ? next.therapist_id : therapistFilter,
    };

    // Keep the range sane: if From is pushed past To (or vice-versa), nudge
    // the other boundary to match rather than letting the request 400.
    if (next.from_date !== undefined) {
      setFromDate(next.from_date);
      if (merged.to_date && next.from_date && next.from_date > merged.to_date) {
        merged.to_date = next.from_date;
        setToDate(next.from_date);
      }
    }
    if (next.to_date !== undefined) {
      setToDate(next.to_date);
      if (merged.from_date && next.to_date && next.to_date < merged.from_date) {
        merged.from_date = next.to_date;
        setFromDate(next.to_date);
      }
    }
    if (next.status !== undefined) setStatusFilter(next.status);
    if (next.therapist_id !== undefined) setTherapistFilter(next.therapist_id);

    loadDashboard(merged);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("");
    setTherapistFilter("");
    loadDashboard({ from_date: "", to_date: "", status: "", therapist_id: "" });
  };

  return (
    <PageWrap>
      <HeaderRow>
        <div>
          <Title>Appointment Dashboard</Title>
          <Subtitle>
            {role === "therapist"
              ? "Your appointments across all dates and statuses."
              : "All appointments across every therapist."}
          </Subtitle>
        </div>
        {role && (
          <RoleBadge>
            {ROLE_LABEL[role] || role}
            {viewerName ? ` · ${viewerName}` : ""}
          </RoleBadge>
        )}
      </HeaderRow>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>Total Appointments</SummaryLabel>
          <SummaryValue>{summary.total_appointments}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Today's Appointments</SummaryLabel>
          <SummaryValue>{summary.today_appointments}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Scheduled</SummaryLabel>
          <SummaryValue>{summary.scheduled_appointments}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Rescheduled</SummaryLabel>
          <SummaryValue>{summary.rescheduled_appointments}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Cancelled</SummaryLabel>
          <SummaryValue>{summary.cancelled}</SummaryValue>
        </SummaryCard>
      </SummaryGrid>

      <FiltersBar>
        <FilterGroup>
          <FilterLabel htmlFor="dash-from-date">From</FilterLabel>
          <FilterInput
            id="dash-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => applyFilters({ from_date: e.target.value })}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="dash-to-date">To</FilterLabel>
          <FilterInput
            id="dash-to-date"
            type="date"
            value={toDate}
            onChange={(e) => applyFilters({ to_date: e.target.value })}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="dash-status">Status</FilterLabel>
          <FilterSelect
            id="dash-status"
            value={statusFilter}
            onChange={(e) => applyFilters({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </FilterSelect>
        </FilterGroup>

        {canFilterByTherapist && (
          <FilterGroup>
            <FilterLabel htmlFor="dash-therapist">Therapist</FilterLabel>
            <FilterSelect
              id="dash-therapist"
              value={therapistFilter}
              onChange={(e) => applyFilters({ therapist_id: e.target.value })}
            >
              <option value="">All therapists</option>
              {therapists.map((t) => (
                <option key={t.employeeId} value={t.employeeId}>
                  {t.employeeName}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        )}

        <ClearBtn onClick={clearFilters}>Clear filters</ClearBtn>
      </FiltersBar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Registration Number</Th>
              <Th>Date</Th>
              <Th>Child Name</Th>
              <Th>Therapist</Th>
              <Th>Slot Time</Th>
              <Th>Status</Th>
              {(role === "receptionist" || role === "therapist" || role === "admin") && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = STATUS_STYLE[r.status] || STATUS_STYLE.Scheduled;
              const isAssignedDoctor = employeeId === r.therapist_id;
              return (
                <tr key={r.appointment_id}>
                  <Td>{r.registration_number}</Td>
                  <Td>{r.date}</Td>
                  <Td>{r.name_of_child}</Td>
                  <Td>{r.therapist_name || r.therapist_id}</Td>
                  <Td>{r.slot_time}</Td>
                  <Td>
                    <Badge style={{ background: st.bg, color: st.fg }}>{st.label}</Badge>
                  </Td>
                  {(role === "receptionist" || role === "therapist" || role === "admin") && (
                    <ActionTd>
                      {(role === "receptionist" || role === "admin") && r.status !== "Completed" && r.status !== "Cancelled" && (
                        <>
                          <RescheduleBtn
                            disabled={reassignBusy}
                            onClick={() => {
                              setRescheduleAppt(r);
                              setRescheduleDate(r.date || todayISO());
                              setRescheduleStartTime(r.slot_start_time || "10:00");
                              setRescheduleEndTime(r.slot_end_time || "10:45");
                              setReassignTherapistId(r.rescheduled_therapist_id || r.original_therapist_id || r.therapist_id || "");
                            }}
                          >
                            Reschedule
                          </RescheduleBtn>
                          <CancelBtn
                            disabled={cancelBusy}
                            onClick={() => {
                              setCancelAppt(r);
                              setCancelReason("");
                            }}
                          >
                            Cancel
                          </CancelBtn>
                        </>
                      )}
                      {(role === "therapist" || role === "admin") && isAssignedDoctor && (
                        <FinishBtn
                          disabled={finishBusyId === r.appointment_id}
                          onClick={() => handleFinishConsulting(r.appointment_id)}
                        >
                          {finishBusyId === r.appointment_id ? "Finishing..." : "Finish Consulting"}
                        </FinishBtn>
                      )}
                    </ActionTd>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
        {!loading && rows.length === 0 && !error && (
          <EmptyState>No appointments match these filters.</EmptyState>
        )}
        {loading && <EmptyState>Loading appointments…</EmptyState>}
      </TableWrap>

      {/* Toast notifications */}
      {toast && <Toast type={toast.type}>{toast.text}</Toast>}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <ModalBackdrop onClick={() => setRescheduleAppt(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Reschedule Appointment</ModalTitle>
              <CloseBtn onClick={() => setRescheduleAppt(null)}>✕</CloseBtn>
            </ModalHeader>

            <InfoCard>
              <InfoRow>
                <InfoLabel>Child Name:</InfoLabel>
                <InfoValue>{rescheduleAppt.name_of_child}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Registration No:</InfoLabel>
                <InfoValue>{rescheduleAppt.registration_number}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Time Slot:</InfoLabel>
                <InfoValue>{rescheduleAppt.slot_time}</InfoValue>
              </InfoRow>
            </InfoCard>

            <FormGroup>
              <Label>Select New Date</Label>
              <input
                type="date"
                min={todayISO()}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: `1.5px solid ${tokens.line}`,
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontFamily: tokens.fontBody,
                  color: tokens.ink,
                  background: "#f9fafb",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "1rem"
                }}
              />
            </FormGroup>

            <FormGroup style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <Label>Start Time</Label>
                <input
                  type="time"
                  value={rescheduleStartTime}
                  onChange={(e) => setRescheduleStartTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: `1.5px solid ${tokens.line}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: tokens.fontBody,
                    color: tokens.ink,
                    background: "#f9fafb",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Label>End Time</Label>
                <input
                  type="time"
                  value={rescheduleEndTime}
                  onChange={(e) => setRescheduleEndTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: `1.5px solid ${tokens.line}`,
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: tokens.fontBody,
                    color: tokens.ink,
                    background: "#f9fafb",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Select Doctor</Label>
              <Select
                value={reassignTherapistId}
                onChange={(e) => setReassignTherapistId(e.target.value)}
              >
                <option value="" disabled>Select Doctor</option>
                {therapists.map((t) => (
                  <option key={t.employeeId} value={t.employeeId}>
                    {t.employeeName}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <ButtonGroup>
              <SecondaryButton onClick={() => setRescheduleAppt(null)}>Cancel</SecondaryButton>
              <PrimaryButton disabled={reassignBusy} onClick={handleRescheduleSubmit}>
                {reassignBusy ? "Rescheduling..." : "Confirm Reschedule"}
              </PrimaryButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}

      {/* Cancel Modal */}
      {cancelAppt && (
        <ModalBackdrop onClick={() => setCancelAppt(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Cancel Appointment</ModalTitle>
              <CloseBtn onClick={() => setCancelAppt(null)}>✕</CloseBtn>
            </ModalHeader>

            <InfoCard>
              <InfoRow>
                <InfoLabel>Child Name:</InfoLabel>
                <InfoValue>{cancelAppt.name_of_child}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Registration No:</InfoLabel>
                <InfoValue>{cancelAppt.registration_number}</InfoValue>
              </InfoRow>
            </InfoCard>

            <FormGroup>
              <Label>Cancellation Reason</Label>
              <TextArea
                placeholder="Enter the reason for cancelling this appointment..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </FormGroup>

            <ButtonGroup>
              <SecondaryButton onClick={() => setCancelAppt(null)}>Go Back</SecondaryButton>
              <PrimaryButton disabled={cancelBusy} onClick={handleCancelSubmit}>
                {cancelBusy ? "Cancelling..." : "Confirm Cancellation"}
              </PrimaryButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}
    </PageWrap>
  );
}