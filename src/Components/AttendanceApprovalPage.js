"use client"

import { useEffect, useState, useMemo } from "react"
import styled, { keyframes, css } from "styled-components"
import apiRequest from "./apiRequest"
import { toast } from "react-toastify"
import {
  CheckCircle,
  Edit3,
  Trash2,
  Eye,
  X,
  Activity,
  CreditCard,
  Phone,
  MapPin,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL

const AttendanceApprovalPage = () => {
  const [attendanceList, setAttendanceList] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editChargeModal, setEditChargeModal] = useState(null)

  useEffect(() => {
    fetchPendingAttendance()
    // eslint-disable-next-line
  }, [])

  // --- HELPER: Safely parse JSON strings to Arrays ---
  const safeArrayParse = (data) => {
    if (Array.isArray(data)) return data
    if (!data) return []
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error("JSON Parse Error for field:", data)
      return []
    }
  }

  const safeJsonParse = (str) => {
    try {
      return typeof str === "string" ? JSON.parse(str) : str
    } catch {
      return []
    }
  }

  // --- LOGIC: Calculate Totals ---
  const calculateTotals = (data) => {
    const baseCharge =
      data.therapy_details?.reduce((sum, t) => sum + (Number.parseFloat(t.therapy_charge) || 0), 0) ||
      Number.parseFloat(data.therapy_charge) ||
      0
    const totalDiscount = Number.parseFloat(data.discount) || 0
    const notAttendingDeduction =
      data.not_attending_details?.reduce((sum, n) => sum + (Number.parseFloat(n.total_amount) || 0), 0) || 0
    const extraAttendingAdd =
      data.extra_attending_details?.reduce((sum, e) => sum + (Number.parseFloat(e.total_amount) || 0), 0) || 0
    const finalTotal = baseCharge - totalDiscount - notAttendingDeduction + extraAttendingAdd

    return { baseCharge, totalDiscount, notAttendingDeduction, extraAttendingAdd, finalTotal }
  }

  const fetchPendingAttendance = async () => {
    try {
      setLoading(true)
      const response = await apiRequest(`${Milestonebaseurl}get_pending_attendance_requests/`, "GET")
      const resData = response?.data?.status ? response.data : response

      if (resData?.status === "success") {
        const processedData = (resData.data || []).map((patient) => {
          const att = patient.attendance || {}
          let parsedAge = { year: 0, months: 0 }
          try {
            if (typeof patient.age === "string") parsedAge = JSON.parse(patient.age)
            else parsedAge = patient.age
          } catch (e) {
            console.error("Age parse error", e)
          }

          return {
            name_of_child: patient.name_of_child,
            registration_number: patient.registration_number,
            phone_number: patient.phone_number,
            address: patient.address,
            dob: patient.dob,
            age_display: parsedAge ? `${parsedAge.year}Y ${parsedAge.months}M` : "N/A",
            sex: patient.sex,
            reason_for_visit: safeJsonParse(patient.reason_for_visit),
            duration_of_symptoms: patient.duration_of_symptoms,
            attendance_id: att._id,
            attendance_date: att.attendance_date,
            session: att.session,
            therapy_charge: att.therapy_charge,
            discount: att.discount,
            total_amount: att.total_amount,
            total_amount_paid: att.total_amount_paid,
            therapy_details: safeArrayParse(att.therapy_details),
            not_attending_details: safeArrayParse(att.not_attending_details),
            extra_attending_details: safeArrayParse(att.extra_attending_details),
            not_attending_remarks: att.not_attending_remarks,
            extra_attending_remarks: att.extra_attending_remarks,
            discount_remarks: att.discount_remarks,
          }
        })
        setAttendanceList(processedData.filter((i) => i.attendance_id))
      } else {
        toast.error(resData?.message || "Failed to fetch records")
      }
    } catch (err) {
      console.error("❌ Error fetching:", err)
      toast.error("Error loading attendance records")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (record) => {
    setUpdating(true)
    try {
      const payload = {
        registration_number: record.registration_number,
        attendance_date: record.attendance_date,
        is_approved: true,
      }
      const res = await apiRequest(`${Milestonebaseurl}attendance-update/`, "PATCH", payload)
      if (res?.status === "success" || res?.success) {
        toast.success(`Approved ${record.name_of_child}`)
        fetchPendingAttendance()
        setSelectedRecord(null)
      } else {
        toast.error(res?.error || "Failed to approve")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveEditedCharges = async (data) => {
    setUpdating(true)
    const totals = calculateTotals(data)
    try {
      const payload = {
        registration_number: data.registration_number,
        attendance_date: data.attendance_date,
        therapy_details: JSON.stringify(data.therapy_details),
        not_attending_details: JSON.stringify(data.not_attending_details),
        extra_attending_details: JSON.stringify(data.extra_attending_details),
        discount: totals.totalDiscount,
        not_attending: totals.notAttendingDeduction,
        extra_attending: totals.extraAttendingAdd,
        total_amount: totals.finalTotal,
        discount_remarks: data.discount_remarks,
        not_attending_remarks: data.not_attending_remarks,
        extra_attending_remarks: data.extra_attending_remarks,
      }
      const res = await apiRequest(`${Milestonebaseurl}attendance-update/`, "PATCH", payload)
      if (res?.status === "success" || res?.success) {
        toast.success("Updated successfully")
        fetchPendingAttendance()
        setEditChargeModal(null)
      } else {
        toast.error(res?.message || "Failed to update")
      }
    } catch (err) {
      toast.error("Network error")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete record for ${record.name_of_child}?`)) return
    setUpdating(true)
    try {
      const payload = {
        registration_number: record.registration_number,
        attendance_date: record.attendance_date,
        is_active: false,
      }
      const res = await apiRequest(`${Milestonebaseurl}attendance-update/`, "PATCH", payload)
      if (res?.status === "success" || res?.success) {
        toast.success("Record deleted")
        fetchPendingAttendance()
        setSelectedRecord(null)
      } else {
        toast.error(res?.error || "Failed to delete")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setUpdating(false)
    }
  }

  const totalValue = useMemo(
    () => attendanceList.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    [attendanceList],
  )

  // --- INLINE STYLES FOR TH (To override global CSS) ---
  const headerStyle = {
    background: "#f8fafc",
    color: "#64748b",
    padding: "1rem 1.5rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    border: "none",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    boxShadow: "none",
    borderRadius: "0",
    whiteSpace: "nowrap",
  }

  return (
    <Container>
      <TopBar>
        <TitleSection>
          <Title>Attendance Approval</Title>
          <Subtitle>Review and approve monthly therapy sessions</Subtitle>
        </TitleSection>
        <ActionArea>
          <StatCard>
            <div className="label">Pending</div>
            <div className="value">{attendanceList.length}</div>
          </StatCard>
          <StatCard>
            <div className="label">Total Value</div>
            <div className="value">₹{totalValue.toLocaleString()}</div>
          </StatCard>
        </ActionArea>
      </TopBar>

      {loading && attendanceList.length === 0 ? (
        <EmptyState>Loading records...</EmptyState>
      ) : attendanceList.length === 0 ? (
        <EmptyState>
          <CheckCircle size={48} color="#2e4a33" />
          <h3>All caught up!</h3>
          <p>No pending approvals found.</p>
        </EmptyState>
      ) : (
        <ModernTableContainer>
          <StyledTable>
            <colgroup>
              <col style={{ width: "150px" }} />
              <col style={{ width: "250px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "200px" }} />
            </colgroup>
            <thead>
              <tr>
                <th style={headerStyle}>Registration</th>
                <th style={headerStyle}>Child Profile</th>
                <th style={headerStyle}>Date / Session</th>
                <th style={headerStyle}>Breakdown</th>
                <th style={headerStyle}>Total Value</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((record, index) => {
                const initials = record.name_of_child
                  ? record.name_of_child
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "??"

                return (
                  <tr key={index}>
                    <td data-label="Registration">
                      <RegBadge>#{record.registration_number}</RegBadge>
                    </td>
                    <td data-label="Child Profile">
                      <ProfileGroup>
                        <Avatar>{initials}</Avatar>
                        <div className="info">
                          <div className="name">{record.name_of_child}</div>
                          <div className="meta">
                            {record.age_display} • {record.sex}
                          </div>
                        </div>
                      </ProfileGroup>
                    </td>
                    <td data-label="Date / Session">
                      <DateSessionWrapper>
                        <span className="date">
                          {record.attendance_date ? record.attendance_date.substring(0, 10) : "-"}
                        </span>
                        <span className="session">Session {record.session}</span>
                      </DateSessionWrapper>
                    </td>
                    <td data-label="Breakdown">
                      <BreakdownText>
                        <span>{(record.therapy_details || []).length} Therapy</span>
                        {(record.extra_attending_details || []).length > 0 && (
                          <span className="extra"> +{record.extra_attending_details.length} Extra</span>
                        )}
                        {(record.not_attending_details || []).length > 0 && (
                          <span className="missed"> -{record.not_attending_details.length} Missed</span>
                        )}
                      </BreakdownText>
                    </td>
                    <td data-label="Total Value">
                      <AmountBadge>₹{record.total_amount?.toLocaleString()}</AmountBadge>
                    </td>
                    <td data-label="Actions" className="right-align">
                      <ButtonGroup>
                        <ActionIcon onClick={() => setSelectedRecord(record)} className="blue" title="View Details">
                          <Eye size={18} color="#0284c7" />
                        </ActionIcon>
                        <ActionIcon onClick={() => setEditChargeModal(record)} className="orange" title="Edit Charges">
                          <Edit3 size={18} color="#ea580c" />
                        </ActionIcon>
                        <ActionIcon
                          onClick={() => handleDelete(record)}
                          disabled={updating}
                          className="red"
                          title="Delete"
                        >
                          <Trash2 size={18} color="#dc2626" />
                        </ActionIcon>
                        <ApproveBtn onClick={() => handleApprove(record)} disabled={updating}>
                          Approve
                        </ApproveBtn>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </StyledTable>
        </ModernTableContainer>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedRecord && (
        <ModalOverlay onClick={() => setSelectedRecord(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <HeaderContent>
                <h3>
                  {selectedRecord.name_of_child}
                  <span className="sex-badge">{selectedRecord.sex}</span>
                </h3>
                <span className="reg-number">{selectedRecord.registration_number}</span>
              </HeaderContent>
              <CloseIcon onClick={() => setSelectedRecord(null)}>
                <X size={24} color="#333" />
              </CloseIcon>
            </ModalHeader>

            <ModalBody>
              {(() => {
                const stdSessions = (selectedRecord.therapy_details || []).reduce(
                  (acc, t) => acc + (Number.parseFloat(t.sesion_per_therapy) || 0),
                  0,
                )
                const extraSessions = (selectedRecord.extra_attending_details || []).reduce(
                  (acc, t) => acc + (Number.parseFloat(t.sessions) || 0),
                  0,
                )
                const missedSessions = (selectedRecord.not_attending_details || []).reduce(
                  (acc, t) => acc + (Number.parseFloat(t.sessions) || 0),
                  0,
                )
                const finalSessions = stdSessions + extraSessions - missedSessions
                const paidAmount = Number.parseFloat(selectedRecord.total_amount_paid) || 0
                const totalAmount = Number.parseFloat(selectedRecord.total_amount) || 0
                const balance = totalAmount - paidAmount

                return (
                  <SummaryGrid>
                    <SummaryCard>
                      <div className="title">
                        <Activity size={14} /> Session Summary
                      </div>
                      <div className="main-stat">
                        {finalSessions} <span className="unit">Sessions</span>
                      </div>
                      <div className="sub-stat-row">
                        <span className="plus">Planned: {stdSessions}</span>
                        {extraSessions > 0 && <span className="plus"> + {extraSessions} Extra</span>}
                        {missedSessions > 0 && <span className="minus"> - {missedSessions} Not Attended</span>}
                      </div>
                    </SummaryCard>
                    <SummaryCard>
                      <div className="title">
                        <CreditCard size={14} /> Payment Status
                      </div>
                      <div className="main-stat">
                        ₹{totalAmount.toLocaleString()} <span className="unit">Total</span>
                      </div>
                      <div className="sub-stat-row">
                        <span className="paid">Paid: ₹{paidAmount.toLocaleString()}</span>
                        <span className={balance > 0 ? "due" : "settled"}>
                          {balance > 0 ? `Due: ₹${balance.toLocaleString()}` : "Settled"}
                        </span>
                      </div>
                    </SummaryCard>
                  </SummaryGrid>
                )
              })()}

              <SectionTitle>Standard Therapy Plan</SectionTitle>
              <TableWrapper>
                <DetailTable>
                  <thead>
                    <tr>
                      <th style={headerStyle}>Therapy</th>
                      <th style={{ ...headerStyle, textAlign: "center" }}>Sessions</th>
                      <th style={{ ...headerStyle, textAlign: "right" }}>Base Charge</th>
                      <th style={{ ...headerStyle, textAlign: "right" }}>Disc.</th>
                      <th style={{ ...headerStyle, textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRecord.therapy_details || []).map((t, i) => (
                      <tr key={i}>
                        <td>
                          <div className="t-name">{t.therapy_name}</div>
                          <div className="t-type">{t.therapy_type}</div>
                        </td>
                        <td className="center">{t.sesion_per_therapy}</td>
                        <td className="right" style={{ color: "#888" }}>
                          ₹{t.therapy_charge}
                        </td>
                        <td className="right" style={{ color: "#e65100" }}>
                          {t.discount > 0 ? `-₹${t.discount}` : "-"}
                        </td>
                        <td className="right" style={{ fontWeight: "bold" }}>
                          ₹{Number.parseFloat(t.therapy_charge || 0) - Number.parseFloat(t.discount || 0)}
                        </td>
                      </tr>
                    ))}
                    {(selectedRecord.therapy_details || []).length === 0 && (
                      <tr>
                        <td colSpan="5" className="center">
                          No standard therapies linked.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </DetailTable>
              </TableWrapper>

              {selectedRecord.extra_attending_details?.length > 0 && (
                <ExtraSection>
                  <SectionTitle style={{ color: "#2e7d32" }}>
                    <TrendingUp size={16} /> Extra Sessions (Added)
                  </SectionTitle>
                  <TableWrapper>
                    <DetailTable>
                      <thead style={{ background: "#e8f5e9" }}>
                        <tr>
                          <th style={{ ...headerStyle, background: "#e8f5e9", color: "#1b5e20" }}>Therapy Name</th>
                          <th style={{ ...headerStyle, background: "#e8f5e9", color: "#1b5e20", textAlign: "center" }}>
                            Added Sessions
                          </th>
                          <th style={{ ...headerStyle, background: "#e8f5e9", color: "#1b5e20", textAlign: "right" }}>
                            Rate
                          </th>
                          <th style={{ ...headerStyle, background: "#e8f5e9", color: "#1b5e20", textAlign: "right" }}>
                            Amount Added
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.extra_attending_details.map((t, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: "600" }}>{t.therapy_name}</td>
                            <td className="center" style={{ background: "#f1f8e9" }}>
                              +{t.sessions}
                            </td>
                            <td className="right">₹{t.charge_per_session}</td>
                            <td className="right" style={{ color: "#2e7d32", fontWeight: "bold" }}>
                              + ₹{t.total_amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </DetailTable>
                  </TableWrapper>
                  {selectedRecord.extra_attending_remarks && (
                    <RemarksBox style={{ borderColor: "#a5d6a7", background: "#e8f5e9", color: "#1b5e20" }}>
                      <strong>Extra Attending Note:</strong> {selectedRecord.extra_attending_remarks}
                    </RemarksBox>
                  )}
                </ExtraSection>
              )}

              {selectedRecord.not_attending_details?.length > 0 && (
                <MissedSection>
                  <SectionTitle style={{ color: "#c62828" }}>
                    <AlertCircle size={16} /> Not Attended Sessions
                  </SectionTitle>
                  <TableWrapper>
                    <DetailTable>
                      <thead style={{ background: "#ffebee" }}>
                        <tr>
                          <th style={{ ...headerStyle, background: "#ffebee", color: "#b71c1c" }}>Therapy Name</th>
                          <th style={{ ...headerStyle, background: "#ffebee", color: "#b71c1c", textAlign: "center" }}>
                            Not Attended
                          </th>
                          <th style={{ ...headerStyle, background: "#ffebee", color: "#b71c1c", textAlign: "right" }}>
                            Rate
                          </th>
                          <th style={{ ...headerStyle, background: "#ffebee", color: "#b71c1c", textAlign: "right" }}>
                            Amount Deducted
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.not_attending_details.map((t, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: "600" }}>{t.therapy_name}</td>
                            <td className="center" style={{ background: "#fff0f0" }}>
                              -{t.sessions}
                            </td>
                            <td className="right">₹{t.charge_per_session}</td>
                            <td className="right" style={{ color: "#c62828", fontWeight: "bold" }}>
                              - ₹{t.total_amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </DetailTable>
                  </TableWrapper>
                  {selectedRecord.not_attending_remarks && (
                    <RemarksBox style={{ borderColor: "#ef9a9a", background: "#ffebee", color: "#c62828" }}>
                      <strong>Not Attending Note:</strong> {selectedRecord.not_attending_remarks}
                    </RemarksBox>
                  )}
                </MissedSection>
              )}

              <ContactGrid>
                <DataItem label="Parent Contact" value={selectedRecord.phone_number} icon={<Phone size={12} />} />
                <DataItem label="Address" value={selectedRecord.address} icon={<MapPin size={12} />} />
                {selectedRecord.discount_remarks && (
                  <FullWidthItem>
                    <Label>Global Discount Remarks</Label>
                    <div style={{ fontSize: "0.9rem", color: "#555" }}>{selectedRecord.discount_remarks}</div>
                  </FullWidthItem>
                )}
              </ContactGrid>
            </ModalBody>
            <ModalFooter>
              <PrimaryButton onClick={() => handleApprove(selectedRecord)}>
                <CheckCircle size={18} /> Approve Attendance
              </PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* EDIT MODAL */}
      {editChargeModal &&
        (() => {
          const totals = calculateTotals(editChargeModal)
          const stdSessions = (editChargeModal.therapy_details || []).reduce(
            (acc, t) => acc + (Number.parseFloat(t.sesion_per_therapy) || 0),
            0,
          )
          const extraSessions = (editChargeModal.extra_attending_details || []).reduce(
            (acc, t) => acc + (Number.parseFloat(t.sessions) || 0),
            0,
          )
          const missedSessions = (editChargeModal.not_attending_details || []).reduce(
            (acc, t) => acc + (Number.parseFloat(t.sessions) || 0),
            0,
          )
          const finalSessions = stdSessions + extraSessions - missedSessions
          const paidAmount = Number.parseFloat(editChargeModal.total_amount_paid) || 0
          const balance = totals.finalTotal - paidAmount

          return (
            <ModalOverlay onClick={() => setEditChargeModal(null)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <HeaderContent>
                    <h3>Edit Attendance Details</h3>
                    <span className="subtitle">Modify charges, discounts, and session counts</span>
                  </HeaderContent>
                  <CloseIcon onClick={() => setEditChargeModal(null)}>
                    <X size={24} color="#333" />
                  </CloseIcon>
                </ModalHeader>
                <ModalBody>
                  <SummaryGrid>
                    <SummaryCard>
                      <div className="title">
                        <Activity size={14} /> Session Impact
                      </div>
                      <div className="main-stat">
                        {finalSessions} <span className="unit">Sessions</span>
                      </div>
                      <div className="sub-stat-row">
                        <span className="plus">Session: {stdSessions}</span>
                        <span className="plus" style={{ color: extraSessions > 0 ? "#2e7d32" : "#999" }}>
                          +{extraSessions}
                        </span>
                        <span className="minus" style={{ color: missedSessions > 0 ? "#c62828" : "#999" }}>
                          -{missedSessions}
                        </span>
                      </div>
                    </SummaryCard>
                    <SummaryCard>
                      <div className="title">
                        <CreditCard size={14} /> Projected Financials
                      </div>
                      <div className="main-stat">
                        ₹{totals.finalTotal.toLocaleString()} <span className="unit">Total</span>
                      </div>
                      <div className="sub-stat-row">
                        <span className="paid">Paid: ₹{paidAmount}</span>
                        <span className={balance > 0 ? "due" : "settled"}>
                          {balance > 0 ? `Due: ₹${balance}` : "Settled"}
                        </span>
                      </div>
                    </SummaryCard>
                  </SummaryGrid>

                  <InfoCard>
                    <CardHeader>
                      <Edit3 size={14} /> Standard Therapy & Discounts
                    </CardHeader>
                    {editChargeModal.therapy_details.map((t, i) => (
                      <TherapyItem key={i}>
                        <TherapyHeader>
                          <span className="name">{t.therapy_name}</span>
                          <span className="sessions">({t.sesion_per_therapy} sessions)</span>
                        </TherapyHeader>
                        <Grid>
                          <DataItem label="Base Charge" value={`₹${t.therapy_charge || 0}`} />
                          <div>
                            <Label>Discount</Label>
                            <input
                              type="number"
                              min={0}
                              value={t.discount}
                              style={inputStyle}
                              onChange={(e) => {
                                const rawValue = e.target.value
                                const updatedDetails = [...editChargeModal.therapy_details]
                                updatedDetails[i].discount = rawValue
                                const newTotalDiscount = updatedDetails.reduce(
                                  (acc, curr) => acc + (Number.parseFloat(curr.discount) || 0),
                                  0,
                                )
                                setEditChargeModal((prev) => ({
                                  ...prev,
                                  therapy_details: updatedDetails,
                                  discount: newTotalDiscount,
                                }))
                              }}
                            />
                          </div>
                          <DataItem
                            label="Net Amount"
                            value={`₹${Number.parseFloat(t.therapy_charge || 0) - Number.parseFloat(t.discount || 0)}`}
                            bold
                            color="#333"
                          />
                        </Grid>
                      </TherapyItem>
                    ))}
                    <RemarksSection>
                      <Label>Global Discount Remarks</Label>
                      <input
                        type="text"
                        value={editChargeModal.discount_remarks || ""}
                        style={{ ...inputStyle, marginTop: 0 }}
                        onChange={(e) => setEditChargeModal((prev) => ({ ...prev, discount_remarks: e.target.value }))}
                        placeholder="Reason for discount..."
                      />
                    </RemarksSection>
                  </InfoCard>

                  <InfoCard highlight style={{ borderColor: "#c8e6c9" }}>
                    <CardHeader style={{ color: "#2e7d32" }}>
                      <TrendingUp size={14} /> Extra Attending (Additions)
                    </CardHeader>
                    {editChargeModal.extra_attending_details.length === 0 && (
                      <EmptyMessage>No extra sessions added.</EmptyMessage>
                    )}
                    {editChargeModal.extra_attending_details.map((t, i) => (
                      <ExtraCard key={i}>
                        <div className="therapy-name">{t.therapy_name}</div>
                        <Grid>
                          <div>
                            <Label>Sessions</Label>
                            <input
                              type="number"
                              min={0}
                              value={t.sessions}
                              style={inputStyle}
                              onChange={(e) => {
                                const val = Number.parseFloat(e.target.value || 0)
                                const updated = [...editChargeModal.extra_attending_details]
                                updated[i].sessions = val
                                updated[i].total_amount = val * (updated[i].charge_per_session || 0)
                                setEditChargeModal((prev) => ({ ...prev, extra_attending_details: updated }))
                              }}
                            />
                          </div>
                          <div>
                            <Label>Rate per Session</Label>
                            <input
                              type="number"
                              min={0}
                              value={t.charge_per_session}
                              style={inputStyle}
                              onChange={(e) => {
                                const val = Number.parseFloat(e.target.value || 0)
                                const updated = [...editChargeModal.extra_attending_details]
                                updated[i].charge_per_session = val
                                updated[i].total_amount = val * (updated[i].sessions || 0)
                                setEditChargeModal((prev) => ({ ...prev, extra_attending_details: updated }))
                              }}
                            />
                          </div>
                          <DataItem label="Total Added" value={`+ ₹${t.total_amount}`} bold color="#2e7d32" />
                        </Grid>
                      </ExtraCard>
                    ))}
                    <div style={{ marginTop: 10 }}>
                      <Label>Extra Remarks</Label>
                      <input
                        type="text"
                        value={editChargeModal.extra_attending_remarks || ""}
                        style={inputStyle}
                        onChange={(e) =>
                          setEditChargeModal((prev) => ({ ...prev, extra_attending_remarks: e.target.value }))
                        }
                      />
                    </div>
                  </InfoCard>

                  <InfoCard highlight style={{ borderColor: "#ffcdd2" }}>
                    <CardHeader style={{ color: "#c62828" }}>
                      <AlertCircle size={14} /> Not Attending (Deductions)
                    </CardHeader>
                    {editChargeModal.not_attending_details.length === 0 && (
                      <EmptyMessage>No missed sessions.</EmptyMessage>
                    )}
                    {editChargeModal.not_attending_details.map((t, i) => (
                      <MissedCard key={i}>
                        <div className="therapy-name">{t.therapy_name}</div>
                        <Grid>
                          <div>
                            <Label>Missed Sessions</Label>
                            <input
                              type="number"
                              min={0}
                              value={t.sessions}
                              style={inputStyle}
                              onChange={(e) => {
                                const val = Number.parseFloat(e.target.value || 0)
                                const updated = [...editChargeModal.not_attending_details]
                                updated[i].sessions = val
                                updated[i].total_amount = val * (updated[i].charge_per_session || 0)
                                setEditChargeModal((prev) => ({ ...prev, not_attending_details: updated }))
                              }}
                            />
                          </div>
                          <div>
                            <Label>Rate per Session</Label>
                            <input
                              type="number"
                              min={0}
                              value={t.charge_per_session}
                              style={inputStyle}
                              onChange={(e) => {
                                const val = Number.parseFloat(e.target.value || 0)
                                const updated = [...editChargeModal.not_attending_details]
                                updated[i].charge_per_session = val
                                updated[i].total_amount = val * (updated[i].sessions || 0)
                                setEditChargeModal((prev) => ({ ...prev, not_attending_details: updated }))
                              }}
                            />
                          </div>
                          <DataItem label="Total Deducted" value={`- ₹${t.total_amount}`} bold color="#c62828" />
                        </Grid>
                      </MissedCard>
                    ))}
                    <div style={{ marginTop: 10 }}>
                      <Label>Absent Remarks</Label>
                      <input
                        type="text"
                        value={editChargeModal.not_attending_remarks || ""}
                        style={inputStyle}
                        onChange={(e) =>
                          setEditChargeModal((prev) => ({ ...prev, not_attending_remarks: e.target.value }))
                        }
                      />
                    </div>
                  </InfoCard>

                  <FinalSummaryCard>
                    <div className="header">
                      <CheckCircle size={18} color="#a5d6a7" /> Final Invoice Summary
                    </div>
                    <SummaryBreakdown>
                      <div>
                        <div className="label base">Base Amount</div>
                        <div className="value">₹{totals.baseCharge}</div>
                      </div>
                      <div className="right">
                        <div className="label discount">Total Discount</div>
                        <div className="value discount-val">- ₹{totals.totalDiscount}</div>
                      </div>
                      <div>
                        <div className="label deduct">Deductions (Absent)</div>
                        <div className="value deduct-val">- ₹{totals.notAttendingDeduction}</div>
                      </div>
                      <div className="right">
                        <div className="label add">Additions (Extra)</div>
                        <div className="value add-val">+ ₹{totals.extraAttendingAdd}</div>
                      </div>
                    </SummaryBreakdown>
                    <FinalTotal>
                      <span className="label">Net Payable Amount</span>
                      <span className="amount">₹{totals.finalTotal}</span>
                    </FinalTotal>
                  </FinalSummaryCard>
                </ModalBody>
                <ModalFooter>
                  <PrimaryButton onClick={() => handleSaveEditedCharges(editChargeModal)}>
                    <CheckCircle size={18} /> Confirm & Update
                  </PrimaryButton>
                </ModalFooter>
              </ModalContent>
            </ModalOverlay>
          )
        })()}
    </Container>
  )
}

// STYLED COMPONENTS
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`
const slideUp = keyframes`from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`

const Container = styled.div`
  padding: 2rem; 
  background-color: #f5f7fa; 
  min-height: 100vh; 
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
  color: #333;
  
  @media (max-width: 768px) { 
    padding: 1rem; 
  }
  
  @media (max-width: 480px) { 
    padding: 0.75rem; 
  }
`

const TopBar = styled.div`
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  margin-bottom: 2rem; 
  flex-wrap: wrap; 
  gap: 1rem;
  
  @media (max-width: 768px) { 
    flex-direction: column; 
    align-items: stretch; 
    gap: 1rem; 
    margin-bottom: 1.5rem;
  }
`

const TitleSection = styled.div`
  @media (max-width: 768px) { 
    width: 100%; 
  }
`

const Title = styled.h1` 
  font-size: 1.8rem; 
  color: #2e4a33; 
  margin: 0; 
  font-weight: 700; 
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) { 
    font-size: 1.5rem; 
  }
  
  @media (max-width: 480px) { 
    font-size: 1.3rem; 
  }
`

const Subtitle = styled.p` 
  color: #64748b; 
  margin: 0.5rem 0 0 0; 
  font-size: 0.95rem;
  
  @media (max-width: 768px) { 
    font-size: 0.85rem; 
  }
  
  @media (max-width: 480px) { 
    font-size: 0.8rem; 
  }
`

const ActionArea = styled.div` 
  display: flex; 
  gap: 1rem; 
  align-items: center; 
  
  @media (max-width: 768px) { 
    width: 100%; 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 0.75rem;
  }
`

const StatCard = styled.div`
  background: white; 
  padding: 0.75rem 1.25rem; 
  border-radius: 12px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.02); 
  text-align: right;
  
  @media (max-width: 768px) { 
    text-align: center; 
    padding: 1rem;
  }
  
  .label { 
    font-size: 0.7rem; 
    text-transform: uppercase; 
    color: #94a3b8; 
    font-weight: 700; 
    letter-spacing: 0.5px;
    
    @media (max-width: 768px) { 
      font-size: 0.65rem; 
    }
  }
  
  .value { 
    font-size: 1.2rem; 
    font-weight: 700; 
    color: #2e4a33; 
    margin-top: 4px;
    
    @media (max-width: 768px) { 
      font-size: 1.3rem; 
    }
  }
`

const ModernTableContainer = styled.div`
  background: white; 
  border-radius: 16px; 
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); 
  border: 1px solid #e2e8f0; 
  overflow: hidden; 
  margin-top: 1rem;
  overflow-x: auto; 
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) { 
    background: transparent; 
    box-shadow: none; 
    border: none; 
    overflow: visible; 
    border-radius: 0;
  }
`

const StyledTable = styled.table`
  width: 100%; 
  min-width: 1100px;
  border-collapse: collapse; 
  text-align: left; 
  table-layout: fixed; 
  
  thead { 
    background: #f8fafc; 
    border-bottom: 1px solid #e2e8f0; 
  }
  
  th { 
    background: #f8fafc !important; 
    color: #64748b !important;
    padding: 1rem 1.5rem !important;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    border: none !important;
    border-bottom: 1px solid #e2e8f0 !important;
    text-align: left !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  
  tbody tr { 
    transition: background 0.2s; 
    border-bottom: 1px solid #f1f5f9; 
    background: white; 
  }
  
  tbody tr:last-child { 
    border-bottom: none; 
  }
  
  tbody tr:hover { 
    background: #f8fafc; 
  }
  
  td { 
    padding: 1.25rem 1.5rem; 
    vertical-align: middle; 
    color: #334155; 
    font-size: 0.95rem; 
  }
  
  .right-align { 
    text-align: right !important; 
  }

  @media (max-width: 768px) {
    display: block;
    min-width: 0;
    
    colgroup { 
      display: none; 
    }
    
    thead { 
      display: none; 
    }
    
    tbody { 
      display: flex; 
      flex-direction: column; 
      gap: 1rem; 
    }
    
    tr {
      display: flex; 
      flex-direction: column;
      background: white; 
      border-radius: 12px; 
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
      border: 1px solid #e2e8f0;
    }
    
    td {
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 0.75rem 0; 
      border-bottom: 1px solid #f1f5f9; 
      width: 100%;
      font-size: 0.9rem;
    }

    // Reorder: Put Child Profile (2nd column) at top
    td:nth-child(2) {
      order: -1;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1rem;
      margin-bottom: 0.5rem;
    }

    td::before {
      content: attr(data-label);
      font-size: 0.75rem; 
      font-weight: 600; 
      color: #94a3b8; 
      text-transform: uppercase; 
      margin-right: 1rem;
    }

    // Hide labels for profile and actions
    td:nth-child(2)::before { display: none; }
    td:last-child::before { display: none; }

    td:last-child { 
      border-bottom: none; 
      padding-top: 1rem;
      justify-content: flex-end;
    }
    
    .right-align { 
      text-align: left !important; 
    }
  }
`

const ProfileGroup = styled.div`
  display: flex; 
  align-items: center; 
  gap: 12px;
  
  .info { 
    display: flex; 
    flex-direction: column; 
  }
  
  .name { 
    font-weight: 600; 
    color: #0f172a; 
    font-size: 1rem; 
  }
  
  .meta { 
    font-size: 0.8rem; 
    color: #64748b; 
    margin-top: 2px; 
  }
`

const Avatar = styled.div`
  width: 42px; 
  height: 42px; 
  border-radius: 10px; 
  background: #e0f2f1; 
  color: #00695c; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 700; 
  font-size: 1rem;
  flex-shrink: 0;
`

const RegBadge = styled.span` 
  font-family: monospace; 
  font-size: 0.85rem; 
  color: #475569; 
  background: #f1f5f9; 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-weight: 600;
  white-space: nowrap;
`

const DateSessionWrapper = styled.div`
  display: flex; 
  flex-direction: column; 
  gap: 4px;
  text-align: right;
  
  .date {
    font-weight: 600; 
    color: #333;
  }
  
  .session {
    font-size: 0.75rem; 
    color: #64748b; 
    background: #f1f5f9; 
    padding: 2px 6px; 
    border-radius: 4px; 
    width: fit-content;
    margin-left: auto;
  }
  
  @media (max-width: 768px) {
    text-align: left;
    .session { margin-left: 0; }
  }
`

const AmountBadge = styled.div` 
  font-weight: 700; 
  color: #166534; 
  background: #dcfce7; 
  padding: 6px 12px; 
  border-radius: 20px; 
  display: inline-block; 
  font-size: 0.9rem;
  white-space: nowrap;
`

const BreakdownText = styled.div` 
  font-size: 0.85rem; 
  color: #64748b; 
  font-weight: 500; 
  display: flex; 
  flex-wrap: wrap; 
  gap: 6px;
  justify-content: flex-end;
  
  span { 
    background: #f1f5f9; 
    padding: 2px 6px; 
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .extra { 
    color: #15803d; 
    background: #dcfce7; 
  } 
  
  .missed { 
    color: #b91c1c; 
    background: #fee2e2; 
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`

const TableWrapper = styled.div` 
  width: 100%; 
  overflow-x: auto; 
  margin-bottom: 1rem; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    border-radius: 8px;
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
`

const DetailTable = styled.table`
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0; 
  background: white;
  min-width: 500px;
  
  th { 
    background: #f8fafc; 
    color: #64748b; 
    font-size: 0.75rem; 
    text-transform: uppercase; 
    padding: 0.75rem 1rem; 
    text-align: left;
    white-space: nowrap;
  }
  
  td { 
    padding: 0.75rem 1rem; 
    border-bottom: 1px solid #f1f5f9; 
    font-size: 0.9rem; 
  }
  
  .t-name { 
    font-weight: 600; 
    color: #333; 
  } 
  
  .t-type { 
    font-size: 0.75rem; 
    color: #888; 
    margin-top: 2px; 
  } 
  
  .center { 
    text-align: center; 
  } 
  
  .right { 
    text-align: right; 
    font-family: 'Roboto Mono', monospace; 
  }
  
  @media (max-width: 768px) {
    min-width: 450px;
    font-size: 0.85rem;
    
    th {
      font-size: 0.7rem;
      padding: 0.6rem 0.75rem;
    }
    
    td {
      padding: 0.6rem 0.75rem;
      font-size: 0.85rem;
    }
  }
  
  @media (max-width: 480px) {
    min-width: 400px;
    
    th {
      font-size: 0.65rem;
      padding: 0.5rem 0.6rem;
    }
    
    td {
      padding: 0.5rem 0.6rem;
      font-size: 0.8rem;
    }
  }
`

const RemarksBox = styled.div` 
  margin-top: 1rem; 
  background: #fff7ed; 
  border: 1px solid #fed7aa; 
  padding: 1rem; 
  border-radius: 10px; 
  font-size: 0.9rem; 
  color: #c2410c; 
  display: flex; 
  flex-direction: column; 
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 0.875rem;
    font-size: 0.85rem;
  }
`

const RemarksSection = styled.div`
  margin-top: 1rem; 
  background: #f9f9f9; 
  padding: 10px; 
  border-radius: 8px;
  
  @media (max-width: 768px) {
    padding: 0.875rem;
  }
`

const ExtraSection = styled.div`
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`

const MissedSection = styled.div`
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`

const ContactGrid = styled.div`
  margin-top: 2rem; 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    margin-top: 1.5rem;
  }
`

const FullWidthItem = styled.div`
  grid-column: 1 / -1;
`

const EmptyMessage = styled.div`
  color: #999; 
  font-style: italic;
  padding: 0.5rem 0;
`

const ExtraCard = styled.div`
  margin-bottom: 14px; 
  background: #f1f8e9; 
  padding: 10px; 
  border-radius: 8px; 
  border: 1px solid #c8e6c9;
  
  .therapy-name {
    font-weight: bold; 
    color: #2e7d32; 
    margin-bottom: 8px;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
  }
`

const MissedCard = styled.div`
  margin-bottom: 14px; 
  background: #fffbee; 
  padding: 10px; 
  border-radius: 8px; 
  border: 1px solid #ffcdd2;
  
  .therapy-name {
    font-weight: bold; 
    color: #c62828; 
    margin-bottom: 8px;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem;
  }
`

const FinalSummaryCard = styled.div`
  background: #2e4a33; 
  color: white; 
  padding: 1.5rem; 
  border-radius: 16px; 
  margin-bottom: 0;
  
  .header {
    font-weight: bold; 
    font-size: 1.1rem; 
    margin-bottom: 1rem; 
    display: flex; 
    align-items: center; 
    gap: 8px;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    
    .header {
      font-size: 1rem;
    }
  }
`

const SummaryBreakdown = styled.div`
  background: rgba(255,255,255,0.1); 
  padding: 1rem; 
  border-radius: 8px; 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1rem;
  
  > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .label {
    font-size: 0.8rem;
    
    &.base { color: #c8e6c9; }
    &.discount { color: #ffcc80; }
    &.deduct { color: #ef9a9a; }
    &.add { color: #a5d6a7; }
  }
  
  .value {
    font-weight: bold;
    
    &.discount-val { color: #ffcc80; }
    &.deduct-val { color: #ef9a9a; }
    &.add-val { color: #a5d6a7; }
  }
  
  .right {
    text-align: right;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0.875rem;
    gap: 0.875rem;
    
    .right {
      text-align: left;
    }
  }
`

const FinalTotal = styled.div`
  margin-top: 1rem; 
  padding-top: 1rem; 
  border-top: 1px solid rgba(255,255,255,0.2); 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  
  .label {
    font-size: 1.1rem;
  }
  
  .amount {
    font-size: 1.8rem; 
    font-weight: bold; 
    color: #fff;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    
    .label {
      font-size: 0.95rem;
    }
    
    .amount {
      font-size: 1.5rem;
    }
  }
`

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  marginTop: "4px",
  boxSizing: "border-box",
}

const DataItem = ({ label, value, icon, fullWidth, color, bold, size }) => (
  <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
    <Label>
      {icon} {label}
    </Label>
    <Value color={color} bold={bold} size={size}>
      {value || "—"}
    </Value>
  </div>
)

const ButtonGroup = styled.div` 
  display: flex; 
  justify-content: flex-end; 
  gap: 10px; 
  align-items: center; 
  width: 100%;
  flex-wrap: wrap;
  
  @media (max-width: 768px) { 
    justify-content: space-between; 
    gap: 8px;
    width: 100%;
  }
`

const ActionIcon = styled.button`
  border: none; 
  border-radius: 8px; 
  width: 40px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  transition: 0.2s;
  background-color: #fff !important; 
  border: 1px solid #e2e8f0 !important;
  padding: 0 !important;
  flex-shrink: 0;

  &:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
  }

  &.blue { 
    background-color: #e0f2fe !important; 
    border-color: #bae6fd !important; 
  }
  
  &.orange { 
    background-color: #ffedd5 !important; 
    border-color: #fed7aa !important; 
  }
  
  &.red { 
    background-color: #fee2e2 !important; 
    border-color: #fecaca !important; 
  }
  
  svg { 
    stroke: currentColor; 
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const ApproveBtn = styled.button`
  background: #2e4a33; 
  color: white; 
  border: none; 
  padding: 0 1.5rem; 
  height: 40px; 
  border-radius: 8px; 
  font-weight: 600; 
  font-size: 0.9rem; 
  cursor: pointer; 
  transition: all 0.2s; 
  display: flex; 
  align-items: center; 
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover { 
    background: #3d5e42; 
    transform: translateY(-1px); 
    box-shadow: 0 4px 10px rgba(46, 74, 51, 0.2); 
  } 
  
  &:disabled { 
    opacity: 0.7; 
    cursor: not-allowed; 
  }
  
  @media (max-width: 768px) { 
    padding: 0 1rem; 
    font-size: 0.9rem;
    height: 44px;
    flex-grow: 1;
    justify-content: center;
  }
`

const EmptyState = styled.div` 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 300px; 
  background: white; 
  border-radius: 16px; 
  color: #999;
  padding: 2rem;
  
  h3 { 
    color: #555; 
    margin: 1rem 0 0.5rem; 
  }
  
  @media (max-width: 768px) {
    min-height: 200px;
    padding: 1.5rem;
  }
`

const ModalOverlay = styled.div` 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  backdrop-filter: blur(4px); 
  z-index: 1000; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  padding: 1rem; 
  animation: ${fadeIn} 0.2s ease-out;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-start; /* Sheet style on mobile */
  }
`

const ModalContent = styled.div` 
  background: #fff; 
  width: 100%; 
  max-width: 650px; 
  max-height: 90vh; 
  border-radius: 20px; 
  display: flex; 
  flex-direction: column; 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
  animation: ${slideUp} 0.3s; 
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    margin: 0;
  }
`

const ModalHeader = styled.div` 
  padding: 1.25rem 1.5rem; 
  background: #fff; 
  border-bottom: 1px solid #e2e8f0; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  flex-shrink: 0;
  
  h3 { 
    margin: 0; 
    font-size: 1.25rem; 
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .sex-badge {
    font-size: 0.7rem;
    background: #e0e0e0;
    padding: 2px 8px;
    border-radius: 4px;
    color: #555;
  }
  
  .reg-number {
    font-size: 0.85rem;
    color: #666;
  }
  
  .subtitle {
    font-size: 0.85rem;
    color: #666;
    font-weight: normal;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 1.5rem; /* Space for notches */
    
    h3 {
      font-size: 1.1rem;
    }
    
    .reg-number {
      font-size: 0.8rem;
    }
    
    .subtitle {
      font-size: 0.8rem;
    }
  }
`

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const CloseIcon = styled.div` 
  cursor: pointer; 
  padding: 0.5rem; 
  border-radius: 8px; 
  display: flex; 
  align-items: center;
  flex-shrink: 0;
  
  &:hover { 
    background: #f1f5f9; 
    color: #0f172a; 
  }
  
  @media (max-width: 768px) {
    padding: 0.375rem;
  }
`

const ModalBody = styled.div` 
  padding: 1.5rem; 
  overflow-y: auto; 
  background: #f8fafc;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const ModalFooter = styled.div` 
  padding: 1.25rem 1.5rem; 
  background: #fff; 
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 1.5rem; /* Safe area for swipe bar */
  }
`

const PrimaryButton = styled.button` 
  width: 100%; 
  padding: 0.75rem; 
  background: #2e4a33; 
  color: white; 
  border: none; 
  border-radius: 10px; 
  font-weight: 600; 
  font-size: 1rem; 
  cursor: pointer; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 8px;
  transition: background 0.2s;
  
  &:hover { 
    background: #3d5e42; 
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`

const SummaryGrid = styled.div` 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1rem; 
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) { 
    grid-template-columns: 1fr; 
    gap: 0.8rem; 
  }
`

const SummaryCard = styled.div`
  background: white; 
  border: 1px solid #e2e8f0; 
  padding: 1rem; 
  border-radius: 12px;
  
  .title { 
    font-size: 0.75rem; 
    color: #94a3b8; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
    margin-bottom: 0.5rem; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
  }
  
  .main-stat { 
    font-size: 1.5rem; 
    font-weight: 700; 
    color: #0f172a; 
    margin-bottom: 0.5rem; 
  }
  
  .unit { 
    font-size: 0.8rem; 
    font-weight: 500; 
    color: #94a3b8; 
    margin-left: 4px; 
  }
  
  .sub-stat-row { 
    font-size: 0.8rem; 
    display: flex; 
    flex-wrap: wrap; 
    gap: 8px; 
  }
  
  .plus { 
    color: #64748b; 
    background: #f1f5f9; 
    padding: 2px 6px; 
    border-radius: 4px; 
  }
  
  .minus { 
    color: #b91c1c; 
    background: #fee2e2; 
    padding: 2px 6px; 
    border-radius: 4px; 
    font-weight: 600; 
  }
  
  .paid { 
    color: #16a34a; 
    font-weight: 600; 
  }
  
  .due { 
    color: #b91c1c; 
    font-weight: 600; 
    margin-left: auto; 
  }
  
  .settled { 
    color: #94a3b8; 
    font-style: italic; 
    margin-left: auto; 
  }
  
  @media (max-width: 768px) {
    .main-stat {
      font-size: 1.3rem;
    }
    
    .due, .settled {
      margin-left: 0;
    }
  }
`

const InfoCard = styled.div`
  background: white; 
  padding: 1.5rem; 
  border-radius: 16px; 
  border: 1px solid ${(props) => (props.highlight ? "#c8e6c9" : "rgba(0,0,0,0.04)")}; 
  margin-bottom: 1.5rem; 
  position: relative; 
  overflow: hidden;
  
  ${(props) =>
    props.highlight &&
    css` 
    &::before { 
      content:''; 
      position: absolute; 
      left: 0; 
      top: 0; 
      bottom: 0; 
      width: 4px; 
      background: #2e7d32; 
    } 
  `}
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const CardHeader = styled.div` 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  font-size: 0.9rem; 
  font-weight: 700; 
  color: #2e4a33; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`

const TherapyItem = styled.div`
  margin-bottom: 1rem; 
  padding-bottom: 1rem; 
  border-bottom: 1px dashed #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`

const TherapyHeader = styled.div`
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
  
  .name {
    font-weight: 600;
  }
  
  .sessions {
    font-size: 0.8rem; 
    color: #666;
  }
`

const Grid = styled.div` 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
  gap: 1.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const Label = styled.div` 
  font-size: 0.75rem; 
  color: #64748b; 
  margin-bottom: 4px; 
  display: flex; 
  align-items: center; 
  gap: 4px;
  font-weight: 600;
`

const Value = styled.div` 
  font-size: ${(props) => props.size || "0.95rem"}; 
  color: ${(props) => props.color || "#333"}; 
  font-weight: ${(props) => (props.bold ? 700 : 500)}; 
  line-height: 1.4;
  word-break: break-word;
`

const SectionTitle = styled.h4` 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  margin: 0 0 1rem 0; 
  color: #64748b; 
  font-size: 0.9rem; 
  text-transform: uppercase; 
  letter-spacing: 0.05em;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`

export default AttendanceApprovalPage
