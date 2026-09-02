import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "styled-components";
import apiRequest from "./apiRequest";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const ROLES = [
  { key: "ot_therapist", label: "OT Therapist" },
  { key: "physiotherapist", label: "Physiotherapist" },
  { key: "speech_therapist", label: "Speech Therapist" },
  { key: "clinical_psychologist", label: "Clinical Psychologist" },
  { key: "special_educator", label: "Special Educator" },
  { key: "pediatrician", label: "Pediatrician" },
  { key: "psychiatrist", label: "Psychiatrist" },
];

const emptyFormState = () =>
  ROLES.reduce((acc, r) => {
    acc[`${r.key}_recommendation`] = "";
    acc[`${r.key}_date`] = "";
    return acc;
  }, {});

const todayISO = () => new Date().toISOString().slice(0, 10);

// Normalizes a backend date value (ISO datetime, DD-MM-YYYY, DD/MM/YYYY, or
// plain YYYY-MM-DD) down to a plain "YYYY-MM-DD" string for comparison.
const toDateOnly = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const dmy = value.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageWrap = styled.div`
  padding: 24px;
`;

const Title = styled.h2`
  color: #256565;
  margin-bottom: 16px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #256565;
  font-weight: 600;
`;

const DatePickerInput = styled.input`
  padding: 8px 10px;
  border: 1px solid #d9e6e6;
  border-radius: 6px;
  font-size: 14px;
  color: #256565;
`;

const TodayButton = styled.button`
  background: transparent;
  color: #219c9c;
  border: 1px solid #219c9c;
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: #f4fbfb;
  }
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid #d9e6e6;
  border-radius: 8px;

  @media (max-width: 480px) {
    overflow-x: auto;
    min-width: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eef3f3;
    font-size: 14px;
  }

  th {
    background: #219c9c;
    color: #fff;
    position: sticky;
    top: 0;
  }

  tr:hover td {
    background: #f4fbfb;
  }
`;

const CrossTherapyButton = styled.button`
  background: #b673c9;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  padding: 32px;
  text-align: center;
  color: #7a8a8a;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.15s ease-out;
`;

const ModalCard = styled.div`
  background: #fff;
  width: 90%;
  max-width: 780px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 10px;
  padding: 24px;

  @media (max-width: 480px) {
    width: 96%;
    padding: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  h3 {
    color: #256565;
    margin: 0;
  }
`;

const SubHeader = styled.p`
  color: #7a8a8a;
  margin: 0 0 16px 0;
  font-size: 13px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: #256565;
`;

const RoleRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr 140px;
  gap: 10px;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid #eef3f3;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RoleLabel = styled.div`
  font-weight: 600;
  color: #219c9c;
  padding-top: 8px;
`;

const RecTextarea = styled.textarea`
  min-height: 60px;
  resize: vertical;
  padding: 8px;
  border: 1px solid #d9e6e6;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid #d9e6e6;
  border-radius: 6px;
  font-size: 13px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
`;

const SaveButton = styled.button`
  background: #219c9c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  color: #256565;
  border: 1px solid #d9e6e6;
  border-radius: 6px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
`;

const ToastWrap = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${(props) => (props.$error ? "#c0392b" : "#256565")};
  color: #fff;
  padding: 12px 18px;
  border-radius: 6px;
  z-index: 1100;
  animation: ${fadeIn} 0.2s ease-out;
`;

// ---------------------------------------------------------------------------
// Toast (auto-dismiss, matches existing pattern)
// ---------------------------------------------------------------------------

function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const ToastNode = toast
    ? ReactDOM.createPortal(
        <ToastWrap $error={toast.isError}>{toast.message}</ToastWrap>,
        document.body
      )
    : null;

  return { showToast, ToastNode };
}

// ---------------------------------------------------------------------------
// Cross Therapy Recommendation Modal
// ---------------------------------------------------------------------------

function CrossTherapyModal({ patient, onClose, showToast }) {
  const [form, setForm] = useState(emptyFormState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      setLoading(true);
      try {
        const res = await apiRequest(
          `${Milestonebaseurl}get-cross-therapy-recommendation/${patient.registration_number}/`,
          "GET"
        );
        if (!cancelled && res && Object.keys(res).length > 0) {
          setForm((prev) => ({ ...prev, ...res }));
        }
      } catch (err) {
        if (!cancelled) {
          showToast("Could not load existing recommendation", true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadExisting();
    return () => {
      cancelled = true;
    };
  }, [patient.registration_number, showToast]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        registration_number: patient.registration_number,
        patient_name: patient.name_of_child,
        age:
          patient.age != null
            ? `${patient.age.year}y ${patient.age.months}m ${patient.age.days}d`
            : "",
        sex: patient.sex,
        ...form,
      };
      await apiRequest(
        `${Milestonebaseurl}save-cross-therapy-recommendation/`,
        "POST",
        payload
      );
      showToast("Cross therapy recommendation saved");
      onClose();
    } catch (err) {
      showToast("Failed to save recommendation", true);
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>Cross Therapy Recommendation Form</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <SubHeader>
          {patient.name_of_child} &middot;{" "}
          {patient.age
            ? `${patient.age.year}y ${patient.age.months}m`
            : ""}{" "}
          / {patient.sex}
        </SubHeader>

        {loading ? (
          <EmptyState>Loading...</EmptyState>
        ) : (
          <>
            {ROLES.map((role) => (
              <RoleRow key={role.key}>
                <RoleLabel>{role.label}</RoleLabel>
                <RecTextarea
                  value={form[`${role.key}_recommendation`] || ""}
                  onChange={(e) =>
                    handleChange(
                      `${role.key}_recommendation`,
                      e.target.value
                    )
                  }
                  placeholder="Recommendation"
                />
                <DateInput
                  type="date"
                  value={form[`${role.key}_date`] || ""}
                  onChange={(e) =>
                    handleChange(`${role.key}_date`, e.target.value)
                  }
                />
              </RoleRow>
            ))}
          </>
        )}

        <ModalFooter>
          <CancelButton onClick={onClose} disabled={saving}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </SaveButton>
        </ModalFooter>
      </ModalCard>
    </Overlay>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Main page: patients in selected date range + Cross Therapy button per row
// ---------------------------------------------------------------------------

export default function CrossTherapyRecommendation() {
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePatient, setActivePatient] = useState(null);
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());
  const { showToast, ToastNode } = useToast();

  useEffect(() => {
    if (!fromDate || !toDate) return;
    let cancelled = false;

    async function loadPatients() {
      setLoading(true);
      try {
        const res = await apiRequest(
          `${Milestonebaseurl}all-patient/?from_date=${fromDate}&to_date=${toDate}`,
          "GET"
        );
        const all = Array.isArray(res) ? res : res?.results || [];
        if (!cancelled) setAllPatients(all);
      } catch (err) {
        if (!cancelled) showToast("Failed to load patients", true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPatients();
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate, showToast]);

  // Backend now filters by from_date/to_date; this is just a safety net in
  // case it ever returns rows outside the requested range.
  const patients = allPatients.filter((p) => {
    const pd = toDateOnly(p.date);
    return !pd || (pd >= fromDate && pd <= toDate);
  });

  const isToday = fromDate === todayISO() && toDate === todayISO();

  const handleFromChange = (value) => {
    setFromDate(value);
    if (toDate && value > toDate) setToDate(value);
  };

  const handleToChange = (value) => {
    setToDate(value);
    if (fromDate && value < fromDate) setFromDate(value);
  };

  const handleTodayClick = () => {
    setFromDate(todayISO());
    setToDate(todayISO());
  };

  return (
    <PageWrap>
      <Title>
        {isToday ? "Today's Patients" : "Patients"} —{" "}
        {fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`}
      </Title>

      <FilterBar>
        <FilterLabel htmlFor="patient-date-from">From:</FilterLabel>
        <DatePickerInput
          id="patient-date-from"
          type="date"
          value={fromDate}
          max={toDate}
          onChange={(e) => handleFromChange(e.target.value)}
        />
        <FilterLabel htmlFor="patient-date-to">To:</FilterLabel>
        <DatePickerInput
          id="patient-date-to"
          type="date"
          value={toDate}
          min={fromDate}
          onChange={(e) => handleToChange(e.target.value)}
        />
        {!isToday && (
          <TodayButton onClick={handleTodayClick}>Today</TodayButton>
        )}
      </FilterBar>

      {loading ? (
        <EmptyState>Loading patients...</EmptyState>
      ) : patients.length === 0 ? (
        <EmptyState>
          No patients registered{" "}
          {fromDate === toDate
            ? `for ${fromDate}`
            : `between ${fromDate} and ${toDate}`}
          .
        </EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mother</th>
                <th>Father</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.registration_number}>
                  <td>{p.registration_number}</td>
                  <td>{p.name_of_child}</td>
                  <td>
                    {p.age
                      ? `${p.age.year}y ${p.age.months}m ${p.age.days}d`
                      : "-"}
                  </td>
                  <td>{p.sex}</td>
                  <td>{p.mother_name || "-"}</td>
                  <td>{p.father_name || "-"}</td>
                  <td>
                    <CrossTherapyButton onClick={() => setActivePatient(p)}>
                      Cross Therapy
                    </CrossTherapyButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {activePatient && (
        <CrossTherapyModal
          patient={activePatient}
          onClose={() => setActivePatient(null)}
          showToast={showToast}
        />
      )}

      {ToastNode}
    </PageWrap>
  );
}