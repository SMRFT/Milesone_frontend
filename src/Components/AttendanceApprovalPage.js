import React, { useEffect, useState, useMemo } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import { 
  CheckCircle, Edit3, Trash2, RefreshCcw, Eye, X, User, 
  Activity, CreditCard, Phone, MapPin, TrendingUp, AlertCircle
} from "lucide-react";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const AttendanceApprovalPage = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editChargeModal, setEditChargeModal] = useState(null);

  useEffect(() => {
    fetchPendingAttendance();
    // eslint-disable-next-line
  }, []);

  // --- HELPER: Safely parse JSON strings to Arrays ---
  const safeArrayParse = (data) => {
    if (Array.isArray(data)) return data; // It's already an array
    if (!data) return []; // It's null/undefined
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("JSON Parse Error for field:", data);
      return [];
    }
  };

  const safeJsonParse = (str) => {
    try { return typeof str === "string" ? JSON.parse(str) : str; } 
    catch { return []; }
  };

  // 1. Data Processing
  const fetchPendingAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${Milestonebaseurl}get_pending_attendance_requests/`,
        "GET"
      );

      const resData = response?.data?.status ? response.data : response;

      if (resData?.status === "success") {
        const processedData = (resData.data || []).map((patient) => {
          const att = patient.attendance || {};
          
          let parsedAge = { year: 0, months: 0 };
          try {
             if (typeof patient.age === 'string') {
               parsedAge = JSON.parse(patient.age);
             } else {
               parsedAge = patient.age;
             }
          } catch (e) { console.error("Age parse error", e); }

          return {
            // Patient Info
            name_of_child: patient.name_of_child,
            registration_number: patient.registration_number,
            phone_number: patient.phone_number,
            address: patient.address,
            dob: patient.dob,
            age_display: parsedAge ? `${parsedAge.year}Y ${parsedAge.months}M` : "N/A",
            sex: patient.sex,
            reason_for_visit: safeJsonParse(patient.reason_for_visit),
            duration_of_symptoms: patient.duration_of_symptoms,

            // Attendance Info
            attendance_id: att._id,
            attendance_date: att.attendance_date,
            session: att.session,
            therapy_charge: att.therapy_charge,
            discount: att.discount, // This is the root discount
            total_amount: att.total_amount,
            total_amount_paid: att.total_amount_paid,
            
            // --- CRITICAL FIX: PARSE STRINGS TO ARRAYS ---
            therapy_details: safeArrayParse(att.therapy_details),
            not_attending_details: safeArrayParse(att.not_attending_details),
            extra_attending_details: safeArrayParse(att.extra_attending_details),
            
            // Remarks
            not_attending_remarks: att.not_attending_remarks,
            extra_attending_remarks: att.extra_attending_remarks,
            discount_remarks: att.discount_remarks,
          };
        });
        
        setAttendanceList(processedData.filter(i => i.attendance_id));
      } else {
        toast.error(resData?.message || "Failed to fetch records");
      }
    } catch (err) {
      console.error("❌ Error fetching:", err);
      toast.error("Error loading attendance records");
    } finally {
      setLoading(false);
    }
  };

  // 2. Action Handlers
  const handleApprove = async (record) => {
    setUpdating(true);
    try {
      const payload = {
        registration_number: record.registration_number,
        attendance_date: record.attendance_date,
        is_approved: true,
      };
      const res = await apiRequest(`${Milestonebaseurl}attendance-update/`, "PATCH", payload);
      if (res?.status === "success" || res?.success) {
        toast.success(`Approved ${record.name_of_child}`);
        fetchPendingAttendance();
        setSelectedRecord(null);
      } else {
        toast.error(res?.error || "Failed to approve");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  // --- FIXED CALCULATION LOGIC ---
  const calculateTotals = (data) => {
    // 1. Base Charge (Sum of therapy charges)
    const baseCharge = data.therapy_details?.reduce((sum, t) => sum + (parseFloat(t.therapy_charge) || 0), 0) || parseFloat(data.therapy_charge) || 0;

    // 2. Per Therapy Discount (Sum of individual therapy discounts)
    const perTherapyDiscount = data.therapy_details?.reduce((sum, t) => sum + (parseFloat(t.discount) || 0), 0) || 0;

    // 3. Global/Flat Discount (The root discount field)
    // Note: Usually you use either per-therapy OR global. Here we treat 'discount' as the total sum.
    // If you want 'discount' to be an ADDITIONAL flat discount, keep this. 
    // If 'discount' is just the sum of perTherapy, use perTherapyDiscount.
    // **Assumption based on your UI:** The root 'discount' field holds the SUM.
    const totalDiscount = parseFloat(data.discount) || 0; 

    // 4. Not Attending (Deductions)
    const notAttendingDeduction = data.not_attending_details?.reduce((sum, n) => sum + (parseFloat(n.total_amount) || 0), 0) || 0;

    // 5. Extra Attending (Additions)
    const extraAttendingAdd = data.extra_attending_details?.reduce((sum, e) => sum + (parseFloat(e.total_amount) || 0), 0) || 0;

    // 6. Final Calculation
    // Logic: Base - Total Discount - Absent + Extra
    const finalTotal = baseCharge - totalDiscount - notAttendingDeduction + extraAttendingAdd;

    return {
      baseCharge,
      totalDiscount,
      perTherapyDiscount,
      notAttendingDeduction,
      extraAttendingAdd,
      finalTotal
    };
  };

  const handleSaveEditedCharges = async (data) => {
    setUpdating(true);
    const totals = calculateTotals(data);

    try {
      // NOTE: If your backend EXPECTS strings, uncomment the JSON.stringify lines below.
      // If your backend handles JSON objects and converts them to strings for DB, keep as is.
      const payload = {
        registration_number: data.registration_number,
        attendance_date: data.attendance_date,
        
        // Data Arrays
        therapy_details: JSON.stringify(data.therapy_details), // Stringifying to match your DB requirement
        not_attending_details: JSON.stringify(data.not_attending_details),
        extra_attending_details: JSON.stringify(data.extra_attending_details),

        // Updated Totals
        discount: totals.totalDiscount,
        not_attending: totals.notAttendingDeduction,
        extra_attending: totals.extraAttendingAdd,
        total_amount: totals.finalTotal,

        // Remarks
        discount_remarks: data.discount_remarks,
        not_attending_remarks: data.not_attending_remarks,
        extra_attending_remarks: data.extra_attending_remarks,
      };

      const res = await apiRequest(
        `${Milestonebaseurl}attendance-update/`,
        "PATCH",
        payload
      );

      if (res?.status === "success" || res?.success) {
        toast.success("Charges & Details updated successfully");
        fetchPendingAttendance();
        setEditChargeModal(null);
      } else {
        toast.error(res?.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete record for ${record.name_of_child}?`)) return;
    setUpdating(true);
    try {
      const payload = {
        registration_number: record.registration_number,
        date: record.attendance_date, 
        is_active: false,
      };
      const res = await apiRequest(`${Milestonebaseurl}attendance-update/`, "PATCH", payload);
      if (res?.status === "success" || res?.success) {
        toast.success("Record deleted");
        fetchPendingAttendance();
        setSelectedRecord(null);
      } else {
        toast.error(res?.error || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdating(false);
    }
  };

  const totalValue = useMemo(() => attendanceList.reduce((acc, curr) => acc + (curr.total_amount || 0), 0), [attendanceList]);

  return (
    <Container>
      <TopBar>
        <div>
          <Title>Attendance Approval</Title>
          <Subtitle>Review and approve monthly therapy sessions</Subtitle>
        </div>
        <ActionArea>
          <StatCard>
            <div className="label">Pending</div>
            <div className="value">{attendanceList.length}</div>
          </StatCard>
          <StatCard>
            <div className="label">Total Value</div>
            <div className="value">₹{totalValue.toLocaleString()}</div>
          </StatCard>
          <RefreshButton onClick={fetchPendingAttendance} disabled={loading}>
            <RefreshCcw size={18} className={loading ? "spin" : ""} />
          </RefreshButton>
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
        <TableCard>
          <StyledTable>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Child Name</th>
                <th>Month/Date</th>
                <th>Sessions</th>
                <th>Total Amt</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.map((record, index) => (
                <tr key={index}>
                  <td><Badge>{record.registration_number}</Badge></td>
                  <td>
                    <NameCell>
                      <div className="name">{record.name_of_child}</div>
                      <div className="sub">{record.age_display} • {record.sex}</div>
                    </NameCell>
                  </td>
                  <td>{record.attendance_date ? record.attendance_date.substring(0, 10) : '-'}</td>
                  <td>{record.session || 0}</td>
                  <td>
                    <Amount>₹{record.total_amount?.toLocaleString()}</Amount>
                  </td>
                  <td>
                    <ButtonGroup>
                      <IconButton onClick={() => setSelectedRecord(record)} title="View Details" color="blue">
                        <Eye size={16} />
                      </IconButton>
                      <IconButton onClick={() => setEditChargeModal(record)} title="Edit Therapy Charges" color="green"> 
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(record)} disabled={updating} title="Delete" color="red">
                        <Trash2 size={16} />
                      </IconButton>
                      <PrimaryButtonSmall onClick={() => handleApprove(record)} disabled={updating}>
                        Approve
                      </PrimaryButtonSmall>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableCard>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedRecord && (
        <ModalOverlay onClick={() => setSelectedRecord(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h3>{selectedRecord.name_of_child}</h3>
                <span style={{fontSize:'0.85rem', color:'#666'}}>{selectedRecord.registration_number}</span>
              </div>
              <CloseIcon onClick={() => setSelectedRecord(null)}><X size={24} /></CloseIcon>
            </ModalHeader>
            <ModalBody>
              <InfoCard>
                <CardHeader><User size={16}/> Patient Profile</CardHeader>
                <Grid>
                  <DataItem label="Age/Sex" value={`${selectedRecord.age_display} / ${selectedRecord.sex}`} />
                  <DataItem label="Parent Contact" value={selectedRecord.phone_number} icon={<Phone size={12}/>} />
                  <DataItem label="Address" value={selectedRecord.address} fullWidth icon={<MapPin size={12}/>} />
                  <DataItem label="Diagnosis" value={Array.isArray(selectedRecord.reason_for_visit) ? selectedRecord.reason_for_visit.join(", ") : "—"} fullWidth />
                </Grid>
              </InfoCard>

              <InfoCard highlight>
                <CardHeader><CreditCard size={16}/> Financial Overview</CardHeader>
                <Grid>
                    <DataItem label="Base Charge" value={`₹${selectedRecord.therapy_charge}`} />
                    <DataItem label="Discount" value={`- ₹${selectedRecord.discount}`} color="#e65100" />
                    <DataItem label="Net Total" value={`₹${selectedRecord.total_amount}`} bold size="1.2rem" color="#2e7d32" />
                </Grid>
              </InfoCard>

              <SectionTitle><Activity size={16}/> Session Breakdown</SectionTitle>
              <DetailTable>
                <thead>
                  <tr>
                    <th>Therapy Type</th>
                    <th style={{textAlign:'center'}}>Sessions</th>
                    <th style={{textAlign:'right'}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                    {/* Safe check for map in case parsing failed */}
                    {(selectedRecord.therapy_details || []).map((t, i) => (
                          <tr key={`std-${i}`}>
                            <td>
                                <div className="t-name">{t.therapy_name}</div>
                                <div className="t-type">{t.therapy_type || "Standard Session"}</div>
                            </td>
                            <td className="center">{t.sesion_per_therapy || "—"}</td>
                            <td className="right">{t.therapy_charge ? `₹${t.therapy_charge}` : "—"}</td>
                          </tr>
                    ))}
                    {(selectedRecord.extra_attending_details || []).map((t, i) => (
                        <tr key={`extra-${i}`} style={{background: '#f1f8e9'}}>
                            <td style={{color: '#2e7d32'}}>
                                <div className="t-name">➕ {t.therapy_name} (Extra)</div>
                            </td>
                            <td className="center">{t.sessions}</td>
                            <td className="right" style={{color: '#2e7d32', fontWeight: 'bold'}}>+ ₹{t.total_amount}</td>
                        </tr>
                    ))}
                    {(selectedRecord.not_attending_details || []).map((t, i) => (
                        <tr key={`not-${i}`} style={{background: '#fffbee'}}>
                            <td style={{color: '#c62828'}}>
                                <div className="t-name">✖ {t.therapy_name} (Absent)</div>
                            </td>
                            <td className="center">{t.sessions}</td>
                            <td className="right" style={{color: '#c62828', fontWeight: 'bold'}}>- ₹{t.total_amount}</td>
                        </tr>
                    ))}
                </tbody>
              </DetailTable>
              
              {(selectedRecord.not_attending_remarks || selectedRecord.extra_attending_remarks) && (
                  <RemarksBox>
                      {selectedRecord.not_attending_remarks && <div><strong>Absent Note:</strong> {selectedRecord.not_attending_remarks}</div>}
                      {selectedRecord.extra_attending_remarks && <div><strong>Extra Note:</strong> {selectedRecord.extra_attending_remarks}</div>}
                  </RemarksBox>
              )}
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
      {editChargeModal && (
        (() => {
          const totals = calculateTotals(editChargeModal);
          return (
            <ModalOverlay onClick={() => setEditChargeModal(null)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <h3>Edit Attendance Details</h3>
                  <CloseIcon onClick={() => setEditChargeModal(null)}><X size={24} /></CloseIcon>
                </ModalHeader>
                <ModalBody>
                    
                {/* 1. THERAPY DETAILS & DISCOUNT */}
                <InfoCard>
                  <CardHeader><Activity size={14} /> Therapy Details</CardHeader>
                  {editChargeModal.therapy_details.map((t, i) => (
                    <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px dashed #eee" }}>
                      <div style={{fontWeight:'600', marginBottom:5}}>{t.therapy_name}</div>
                      <Grid>
                          <DataItem label="Charge" value={`₹${t.therapy_charge || 0}`} />
                          <div>
                            <Label>Discount</Label>
                            <input
                              type="number" min={0} value={t.discount} style={inputStyle}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                const updatedDetails = [...editChargeModal.therapy_details];
                                updatedDetails[i].discount = rawValue;
                                
                                // Recalculate Sum of Discounts
                                const newTotalDiscount = updatedDetails.reduce((acc, curr) => acc + (parseFloat(curr.discount) || 0), 0);

                                setEditChargeModal(prev => ({ 
                                  ...prev, 
                                  therapy_details: updatedDetails,
                                  discount: newTotalDiscount 
                                }));
                              }}
                            />
                          </div>
                      </Grid>
                    </div>
                  ))}
                </InfoCard>

                {/* 2. GLOBAL DISCOUNT */}
                <InfoCard highlight>
                  <CardHeader><CreditCard size={14} /> Discount Summary</CardHeader>
                  <Grid>
                    <div>
                      <Label>Total Discount</Label>
                      <input type="number" value={editChargeModal.discount} readOnly style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Label>Discount Remarks</Label>
                      <input type="text" value={editChargeModal.discount_remarks || ""} style={inputStyle} onChange={(e) => setEditChargeModal(prev => ({ ...prev, discount_remarks: e.target.value }))} />
                    </div>
                  </Grid>
                </InfoCard>

                  {/* 3. EXTRA ATTENDING */}
                  <InfoCard>
                    <CardHeader><TrendingUp size={14} /> Extra Attending</CardHeader>
                    {editChargeModal.extra_attending_details.length === 0 && <div style={{color:'#999'}}>No extra sessions.</div>}
                    {editChargeModal.extra_attending_details.map((t, i) => (
                      <div key={i} style={{ marginBottom: 14, background:'#f1f8e9', padding:10, borderRadius:8 }}>
                        <div style={{fontWeight:'bold', color:'#2e7d32', marginBottom:5}}>{t.therapy_name}</div>
                        <Grid>
                          <div>
                            <Label>Sessions</Label>
                            <input type="number" min={0} value={t.sessions} style={inputStyle}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value || 0);
                                const updated = [...editChargeModal.extra_attending_details];
                                updated[i].sessions = val;
                                updated[i].total_amount = val * (updated[i].charge_per_session || 0);
                                setEditChargeModal(prev => ({ ...prev, extra_attending_details: updated }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Rate</Label>
                            <input type="number" min={0} value={t.charge_per_session} style={inputStyle}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value || 0);
                                const updated = [...editChargeModal.extra_attending_details];
                                updated[i].charge_per_session = val;
                                updated[i].total_amount = val * (updated[i].sessions || 0);
                                setEditChargeModal(prev => ({ ...prev, extra_attending_details: updated }));
                              }}
                            />
                          </div>
                          <DataItem label="Total" value={`₹${t.total_amount}`} bold color="#2e7d32" />
                        </Grid>
                      </div>
                    ))}
                    <div style={{ marginTop: 10 }}>
                        <Label>Extra Remarks</Label>
                        <input type="text" value={editChargeModal.extra_attending_remarks || ""} style={inputStyle} onChange={(e) => setEditChargeModal(prev => ({ ...prev, extra_attending_remarks: e.target.value }))} />
                    </div>
                  </InfoCard>

                  {/* 4. NOT ATTENDING */}
                  <InfoCard>
                    <CardHeader><AlertCircle size={14} /> Not Attending</CardHeader>
                    {editChargeModal.not_attending_details.length === 0 && <div style={{color:'#999'}}>No absent sessions.</div>}
                    {editChargeModal.not_attending_details.map((t, i) => (
                      <div key={i} style={{ marginBottom: 14, background:'#fffbee', padding:10, borderRadius:8 }}>
                        <div style={{fontWeight:'bold', color:'#c62828', marginBottom:5}}>{t.therapy_name}</div>
                        <Grid>
                          <div>
                            <Label>Missed</Label>
                            <input type="number" min={0} value={t.sessions} style={inputStyle}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value || 0);
                                const updated = [...editChargeModal.not_attending_details];
                                updated[i].sessions = val;
                                updated[i].total_amount = val * (updated[i].charge_per_session || 0);
                                setEditChargeModal(prev => ({ ...prev, not_attending_details: updated }));
                              }}
                            />
                          </div>
                          <div>
                            <Label>Rate</Label>
                            <input type="number" min={0} value={t.charge_per_session} style={inputStyle}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value || 0);
                                const updated = [...editChargeModal.not_attending_details];
                                updated[i].charge_per_session = val;
                                updated[i].total_amount = val * (updated[i].sessions || 0);
                                setEditChargeModal(prev => ({ ...prev, not_attending_details: updated }));
                              }}
                            />
                          </div>
                          <DataItem label="Deduction" value={`- ₹${t.total_amount}`} bold color="#c62828" />
                        </Grid>
                      </div>
                    ))}
                    <div style={{ marginTop: 10 }}>
                        <Label>Absent Remarks</Label>
                        <input type="text" value={editChargeModal.not_attending_remarks || ""} style={inputStyle} onChange={(e) => setEditChargeModal(prev => ({ ...prev, not_attending_remarks: e.target.value }))} />
                    </div>
                  </InfoCard>

                  {/* 5. FINAL CALCULATION */}
                  <InfoCard highlight>
                    <CardHeader><CreditCard size={14} /> Final Invoice</CardHeader>
                    <Grid>
                      <DataItem label="Base Charge" value={`₹${totals.baseCharge}`} />
                      <DataItem label="Discounts" value={`- ₹${totals.totalDiscount}`} color="#c62828" />
                      <DataItem label="Deductions" value={`- ₹${totals.notAttendingDeduction}`} color="#c62828" />
                      <DataItem label="Additions" value={`+ ₹${totals.extraAttendingAdd}`} color="#2e7d32" />
                      <DataItem label="Final Amount" value={`₹${totals.finalTotal}`} bold size="1.4rem" color="#2e7d32" fullWidth />
                    </Grid>
                  </InfoCard>

                </ModalBody>
                <ModalFooter>
                  <PrimaryButton onClick={() => handleSaveEditedCharges(editChargeModal)}>
                    <CheckCircle size={18} /> Save & Update
                  </PrimaryButton>
                </ModalFooter>
              </ModalContent>
            </ModalOverlay>
          );
        })()
      )}
    </Container>
  );
};

// ------------------------------------------------------------------
// STYLES (Kept as provided, just ensuring correct export)
// ------------------------------------------------------------------

const DataItem = ({ label, value, icon, fullWidth, color, bold, size }) => (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
        <Label>{icon} {label}</Label>
        <Value color={color} bold={bold} size={size}>{value || "—"}</Value>
    </div>
);

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

const Container = styled.div`
  padding: 2rem; background-color: #f5f7fa; min-height: 100vh;
  font-family: 'Inter', sans-serif; color: #333;
`;
const TopBar = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
`;
const Title = styled.h1` font-size: 1.8rem; color: #2e4a33; margin: 0; font-weight: 700; `;
const Subtitle = styled.p` color: #666; margin: 0.5rem 0 0 0; font-size: 0.95rem; `;
const ActionArea = styled.div` display: flex; gap: 1rem; align-items: center; `;
const StatCard = styled.div`
    background: white; padding: 0.5rem 1rem; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: right;
    .label { font-size: 0.7rem; text-transform: uppercase; color: #888; font-weight: 600; letter-spacing: 0.5px;}
    .value { font-size: 1.1rem; font-weight: 700; color: #2e4a33; }
`;
const TableCard = styled.div`
  background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  height: calc(100vh - 200px); overflow-y: auto; overflow-x: auto; border: 1px solid rgba(0,0,0,0.04);
  &::-webkit-scrollbar { width: 8px; height: 8px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 8px; }
  &::-webkit-scrollbar-thumb { background: #c1d1c3; border-radius: 8px; }
`;
const StyledTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { background: #f8fdf8; color: #5f7d64; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; padding: 1rem 1.5rem; text-align: left; border-bottom: 2px solid #eef3ef; }
  td { padding: 1rem 1.5rem; border-bottom: 1px solid #f0f4ef; vertical-align: middle; color: #444; }
  tr:hover { background-color: #fafcfb; }
`;
const NameCell = styled.div`
  .name { font-weight: 600; color: #333; font-size: 0.95rem; }
  .sub { font-size: 0.8rem; color: #888; margin-top: 2px; }
`;
const Badge = styled.span` background: #e3ebd3; color: #2e4a33; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; `;
const Amount = styled.span` font-family: 'Roboto Mono', monospace; font-weight: 700; color: #2e7d32; background: #e8f5e9; padding: 4px 8px; border-radius: 6px; `;
const ButtonGroup = styled.div` display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center; `;
const IconButton = styled.button`
  background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #888; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
  &:hover { background: ${props => props.color === 'blue' ? '#e3f2fd' : props.color === 'red' ? '#ffebee' : props.color === 'orange' ? '#fff3e0' : '#eee'}; color: ${props => props.color === 'blue' ? '#1976d2' : props.color === 'red' ? '#d32f2f' : props.color === 'orange' ? '#f57c00' : '#333'}; }
`;
const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.95rem", marginTop: "4px" };
const PrimaryButtonSmall = styled.button`
    background: #2e4a33; color: white; border: none; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s;
    &:hover { background: #3d5e42; transform: translateY(-1px); } &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const PrimaryButton = styled(PrimaryButtonSmall)` width: 100%; padding: 1rem; font-size: 1rem; display: flex; justify-content: center; gap: 0.5rem; align-items: center; `;
const RefreshButton = styled.button`
    background: #2e4a33; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 10px rgba(46, 74, 51, 0.3);
    &:hover { transform: rotate(180deg); } .spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }
`;
const EmptyState = styled.div` display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border-radius: 16px; color: #999; h3 { color: #555; margin: 1rem 0 0.5rem; } `;
const ModalOverlay = styled.div` position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 1rem; animation: ${fadeIn} 0.2s ease-out; `;
const ModalContent = styled.div` background: #fff; width: 100%; max-width: 650px; max-height: 90vh; border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; `;
const ModalHeader = styled.div` padding: 1.5rem 2rem; background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; h3 { margin: 0; font-size: 1.4rem; color: #2e4a33; } `;
const CloseIcon = styled.div` cursor: pointer; padding: 0.5rem; border-radius: 50%; &:hover { background: #f5f5f5; } `;
const ModalBody = styled.div` padding: 2rem; overflow-y: auto; background: #f9fafb; `;
const ModalFooter = styled.div` padding: 1.5rem 2rem; background: #fff; border-top: 1px solid #f0f0f0; `;
const InfoCard = styled.div`
    background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid ${props => props.highlight ? '#c8e6c9' : 'rgba(0,0,0,0.04)'}; margin-bottom: 1.5rem; position: relative; overflow: hidden;
    ${props => props.highlight && css` &::before { content:''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #2e7d32; } `}
`;
const CardHeader = styled.div` display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 700; color: #2e4a33; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1rem; `;
const Grid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.2rem; `;
const Label = styled.div` font-size: 0.75rem; color: #888; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; `;
const Value = styled.div` font-size: ${props => props.size || '0.95rem'}; color: ${props => props.color || '#333'}; font-weight: ${props => props.bold ? 700 : 500}; line-height: 1.4; `;
const SectionTitle = styled.h4` display: flex; align-items: center; gap: 0.5rem; margin: 0 0 1rem 0; color: #555; font-size: 1rem; `;
const DetailTable = styled.table`
    width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    th { background: #f1f3f5; color: #666; font-size: 0.8rem; text-transform: uppercase; padding: 0.8rem 1rem; text-align: left; }
    td { padding: 0.8rem 1rem; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem; }
    .t-name { font-weight: 600; color: #333; } .t-type { font-size: 0.75rem; color: #888; margin-top: 2px; } .center { text-align: center; } .right { text-align: right; font-family: 'Roboto Mono', monospace; }
`;
const RemarksBox = styled.div` margin-top: 1rem; background: #fff8e1; border: 1px solid #ffe0b2; padding: 1rem; border-radius: 10px; font-size: 0.9rem; color: #ef6c00; display: flex; flex-direction: column; gap: 0.5rem; `;

export default AttendanceApprovalPage;