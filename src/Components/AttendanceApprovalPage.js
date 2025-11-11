import React, { useEffect, useState } from "react";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import { CheckCircle, Edit3, Trash2, RefreshCcw } from "lucide-react";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const AttendanceApprovalPage = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPendingAttendance();
  }, []);

  const fetchPendingAttendance = async () => {
  try {
    setLoading(true);
    const response = await apiRequest(
      `${Milestonebaseurl}get_pending_attendance_requests/`,
      "GET"
    );

    // Detect whether backend response is wrapped inside `.data`
    const resData = response?.data?.status ? response.data : response;

    if (resData?.status === "success") {
      const flattened = (resData.data || [])
        .filter((r) => r.attendance && !r.attendance.is_approved)
        .map((r) => ({
          registration_number: r.registration_number,
          name_of_child: r.name_of_child,
          father_name: r.father_name,
          mother_name: r.mother_name,
            phone_number:
    r.mother_phone_number ||
    r.father_phone_number ||
    r.guardian_phone_number ||
    "—",

          address: r.address,
          ...r.attendance,
        }));

      setAttendanceList(flattened);
    } else {
      toast.error(resData?.message || "Failed to fetch attendance records");
    }
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    toast.error("Error loading attendance records");
  } finally {
    setLoading(false);
  }
};

  // ✅ Approve attendance
  const handleApprove = async (record) => {
    setUpdating(true);
    try {
      const payload = {
        registration_number: record.registration_number,
        date: record.date,
        is_approved: true,
      };
      const res = await apiRequest(
        `${Milestonebaseurl}attendance-update/`,
        "PATCH",
        payload
      );

      if (res?.status === "success" || res?.success) {
        toast.success("Attendance approved successfully");
        fetchPendingAttendance();
      } else {
        toast.error(res?.error || "Failed to approve attendance");
      }
    } catch {
      toast.error("Network error approving record");
    } finally {
      setUpdating(false);
    }
  };

  // 💰 Update discount
  const handleDiscount = async (record) => {
    const discountInput = prompt(
      `Enter discount for ${record.registration_number} (₹):`,
      record.discount || 0
    );
    if (discountInput === null) return;

    const discount = parseFloat(discountInput);
    if (isNaN(discount) || discount < 0) {
      toast.warning("Invalid discount value");
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        registration_number: record.registration_number,
        date: record.date,
        discount,
      };
      const res = await apiRequest(
        `${Milestonebaseurl}attendance-update/`,
        "PATCH",
        payload
      );

      if (res?.status === "success" || res?.success) {
        toast.success("Discount updated successfully");
        fetchPendingAttendance();
      } else {
        toast.error(res?.error || "Failed to update discount");
      }
    } catch {
      toast.error("Network error updating discount");
    } finally {
      setUpdating(false);
    }
  };

  // ❌ Delete (soft)
  const handleDelete = async (record) => {
    if (
      !window.confirm(
        `Are you sure you want to delete attendance for ${record.registration_number} (${record.date})?`
      )
    )
      return;

    setUpdating(true);
    try {
      const payload = {
        registration_number: record.registration_number,
        date: record.date,
        is_active: false,
      };
      const res = await apiRequest(
        `${Milestonebaseurl}attendance-update/`,
        "PATCH",
        payload
      );

      if (res?.status === "success" || res?.success) {
        toast.success("Attendance deleted successfully");
        fetchPendingAttendance();
      } else {
        toast.error(res?.error || "Failed to delete attendance");
      }
    } catch {
      toast.error("Network error deleting record");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container>
      <Header>
        <h2>🧾 Attendance Approval Page</h2>
        <RefreshButton onClick={fetchPendingAttendance} disabled={loading}>
          <RefreshCcw size={16} /> Refresh
        </RefreshButton>
      </Header>

      {loading ? (
        <Loading>Loading attendance records...</Loading>
      ) : attendanceList.length === 0 ? (
        <Empty>No pending attendance requests found 🎉</Empty>
      ) : (
<TableWrapper>
  <Table>
    <thead>
      <tr>
        <th>Reg. #</th>
        <th>Child Name</th>
        <th>Parent</th>
        <th>Phone</th>
        <th>Date</th>
        <th>Sessions</th>
        <th>Therapy Details</th>
        <th>Therapy Charge</th>
        <th>Discount</th>
        <th>Approved</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {attendanceList.map((record, index) => (
        <tr key={index}>
          <td>{record.registration_number}</td>
          <td>{record.name_of_child}</td>
          <td>
            {record.father_name || ""} / {record.mother_name || ""}
          </td>
          <td>
            {record.phone_number||
              "—"}
          </td>
          <td>
            {record.date
              ? new Date(record.date).toLocaleDateString()
              : "—"}
          </td>
          <td>{record.session || "—"}</td>

          {/* 🧩 Therapy Details Column */}
          <td>
            {record.therapy_details &&
            record.therapy_details.length > 0 ? (
              record.therapy_details.map((therapy, tIndex) => (
                <div
                  key={tIndex}
                  style={{
                    marginBottom: "4px",
                    lineHeight: "1.3",
                    borderBottom:
                      tIndex !==
                      record.therapy_details.length - 1
                        ? "1px dashed #ddd"
                        : "none",
                    paddingBottom: "2px",
                  }}
                >
                  <strong>{therapy.therapy_name}</strong>
                  <br />
                  <small style={{ color: "#666" }}>
                    {therapy.therapy_type}
                  </small>
                </div>
              ))
            ) : (
              <span>—</span>
            )}
          </td>

          <td>₹{record.therapy_charge || 0}</td>
          <td>
            {record.discount
              ? `₹${record.discount}`
              : "—"}
          </td>
          <td>
            {record.is_approved ? "✅ Yes" : "❌ No"}
          </td>
          <td>
            <ButtonGroup>
              {!record.is_approved && (
                <ApproveButton
                  onClick={() => handleApprove(record)}
                  disabled={updating}
                >
                  <CheckCircle size={14} /> Approve
                </ApproveButton>
              )}
              <EditButton
                onClick={() => handleDiscount(record)}
                disabled={updating}
              >
                <Edit3 size={14} /> Discount
              </EditButton>
              <DeleteButton
                onClick={() => handleDelete(record)}
                disabled={updating}
              >
                <Trash2 size={14} /> Delete
              </DeleteButton>
            </ButtonGroup>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</TableWrapper>

      )}
    </Container>
  );
};

// 🌿 Styled Components

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #065f46;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.4rem;
    }
  }
`;

const RefreshButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #059669;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;

  th,
  td {
    padding: 1rem;
    text-align: center;
  }

  th {
    background: #10b981;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    font-size: 0.9rem;
  }

  tr:nth-child(even) {
    background: #f9fafb;
  }

  tr:hover {
    background: #ecfdf5;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const BaseButton = styled.button`
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  transition: 0.2s;
`;

const ApproveButton = styled(BaseButton)`
  background: #16a34a;
  color: white;
  &:hover {
    background: #15803d;
  }
`;

const EditButton = styled(BaseButton)`
  background: #facc15;
  color: #78350f;
  &:hover {
    background: #eab308;
  }
`;

const DeleteButton = styled(BaseButton)`
  background: #ef4444;
  color: white;
  &:hover {
    background: #dc2626;
  }
`;

const Empty = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #6b7280;
  margin-top: 2rem;
`;

const Loading = styled.div`
  text-align: center;
  font-size: 1rem;
  color: #047857;
  margin-top: 2rem;
`;

export default AttendanceApprovalPage;
