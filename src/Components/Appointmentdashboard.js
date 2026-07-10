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
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState("");
  const [therapistFilter, setTherapistFilter] = useState("");
  const [therapists, setTherapists] = useState([]);

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
  }, []);

  const loadTherapists = useCallback(async () => {
    const res = await apiRequest(`${Milestonebaseurl}get_all_therapists/`, "GET");
    if (res.success) {
      setTherapists(res.data?.data || []);
    }
  }, []);

  useEffect(() => {
    loadDashboard({
      from_date: fromDate,
      to_date: toDate,
      status: statusFilter,
      therapist_id: therapistFilter,
    });
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
            max={toDate || undefined}
            onChange={(e) => applyFilters({ from_date: e.target.value })}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="dash-to-date">To</FilterLabel>
          <FilterInput
            id="dash-to-date"
            type="date"
            value={toDate}
            min={fromDate || undefined}
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
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = STATUS_STYLE[r.status] || STATUS_STYLE.Scheduled;
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
    </PageWrap>
  );
}